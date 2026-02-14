<?php
/**
 * API de envío de correo para el formulario de contacto.
 * Misma API que el backend Python/Go: POST JSON { nombre, email, mensaje } → { success, message }.
 *
 * En cPanel suele no haber .env. Para la contraseña SMTP puedes:
 * - Definir la variable de entorno SMTP_PASS en cPanel, o
 * - Añadir antes de los header(): define('SMTP_PASS_FALLBACK', 'tu_contraseña');
 * Para ver el error en la respuesta (solo pruebas): SMTP_DEBUG=1
 */
 
require_once __DIR__ . '/../../../smtp_config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
    exit;
}

$nombre  = trim((string)($data['nombre'] ?? ''));
$email   = trim((string)($data['email'] ?? ''));
$mensaje = trim((string)($data['mensaje'] ?? ''));

if ($nombre === '' || $email === '' || $mensaje === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Todos los campos son requeridos']);
    exit;
}

// Config SMTP: en cPanel suele no existir .env; usa variables de entorno del panel o define aquí.
$smtp = [
    'host'         => getenv('SMTP_HOST'),
    'port'         => (int)(getenv('SMTP_PORT')),
    'username'     => getenv('SMTP_USER'),
    'password'     => getenv('SMTP_PASS'),
    'from_address' => getenv('SMTP_FROM'),
    'from_name'    => getenv('SMTP_FROM_NAME'),
    'ssl_verify'   => (getenv('SMTP_SSL_VERIFY') !== '0'),
];

$to       = $smtp['from_address'];
$subject  = 'Nuevo mensaje de contacto de ' . $nombre;
$replyTo  = $email;
$bodyText = "Nuevo mensaje de contacto\n\nNombre: $nombre\nEmail: $email\n\nMensaje:\n$mensaje";
$bodyHtml = '<html><body><h2>Nuevo mensaje de contacto</h2>'
    . '<p><strong>Nombre:</strong> ' . htmlspecialchars($nombre) . '</p>'
    . '<p><strong>Email:</strong> ' . htmlspecialchars($email) . '</p>'
    . '<h3>Mensaje:</h3><p>' . nl2br(htmlspecialchars($mensaje)) . '</p></body></html>';

$result = sendSmtp(
    $smtp['host'],
    $smtp['port'],
    $smtp['username'],
    $smtp['password'],
    $smtp['from_address'],
    $smtp['from_name'],
    $smtp['ssl_verify'],
    $to,
    $replyTo,
    $subject,
    $bodyText,
    $bodyHtml
);

if ($result === true) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Email enviado correctamente']);
} else {
    http_response_code(500);
    // En producción no exponer el error real; se registra en el log de PHP
    if (getenv('SMTP_DEBUG') === '1') {
        echo json_encode(['success' => false, 'message' => 'Error al enviar el email', 'debug' => $result]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al enviar el email']);
    }
}

/**
 * Envía correo por SMTP con TLS (puerto 465).
 * Devuelve true si ok, o un string con el error para log/debug.
 */
function sendSmtp($host, $port, $user, $pass, $fromAddr, $fromName, $sslVerify, $to, $replyTo, $subject, $bodyText, $bodyHtml) {
    if ($pass === '') {
        error_log('[send-email.php] SMTP_PASS vacío. Configura la variable de entorno o SMTP_PASS_FALLBACK en el script.');
        return 'Contraseña SMTP no configurada';
    }

    $errno = 0;
    $errstr = '';
    $ctx = stream_context_create([
        'ssl' => [
            'verify_peer'      => $sslVerify,
            'verify_peer_name'  => $sslVerify,
        ]
    ]);
    $sock = @stream_socket_client(
        "ssl://$host:$port",
        $errno,
        $errstr,
        15,
        STREAM_CLIENT_CONNECT,
        $ctx
    );
    if (!$sock) {
        $err = "Conexión SMTP fallida: [$errno] $errstr";
        error_log('[send-email.php] ' . $err);
        return $err;
    }

    $read = function () use ($sock) {
        $line = @fgets($sock, 512);
        return $line !== false ? trim($line) : '';
    };
    $send = function ($line) use ($sock) {
        return @fwrite($sock, $line . "\r\n") !== false;
    };

    // Leer solo la primera línea del banner (normalmente una sola "220 ...")
    $banner = $read();
    if ($banner === '' || strpos($banner, '220') !== 0) {
        fclose($sock);
        return 'Sin respuesta del servidor SMTP (banner)';
    }

    $ehlo = $_SERVER['SERVER_NAME'] ?? $host;
    if (!$send("EHLO " . $ehlo)) {
        fclose($sock);
        return 'Error enviando EHLO';
    }
    // Consumir toda la respuesta EHLO. Algunos servidores envían antes una 220 extra (ej. "220 and/or bulk e-mail.").
    // Leemos hasta la línea final de EHLO (empieza con "250 " con espacio).
    while (($line = $read()) !== '') {
        if (strpos($line, '250 ') === 0) {
            break; // última línea de EHLO, ya estamos al día
        }
        // 220 sobrante del banner o 250- de EHLO; seguir leyendo
    }

    $auth = base64_encode("\0" . $user . "\0" . $pass);
    if (!$send("AUTH PLAIN " . $auth)) {
        fclose($sock);
        return 'Error enviando AUTH PLAIN';
    }
    $authResp = $read();
    if (strpos($authResp, '235') !== 0) {
        error_log('[send-email.php] SMTP AUTH fallido: ' . $authResp);
        fclose($sock);
        return 'Autenticación SMTP rechazada (revisa usuario/contraseña)';
    }

    if (!$send("MAIL FROM:<$fromAddr>")) { fclose($sock); return 'Error MAIL FROM'; }
    if (strpos($read(), '250') !== 0) { fclose($sock); return 'Servidor rechazó MAIL FROM'; }
    if (!$send("RCPT TO:<$to>")) { fclose($sock); return 'Error RCPT TO'; }
    if (strpos($read(), '250') !== 0) { fclose($sock); return 'Servidor rechazó RCPT TO'; }
    if (!$send("DATA")) { fclose($sock); return 'Error DATA'; }
    if (strpos($read(), '354') !== 0) { fclose($sock); return 'Servidor no aceptó DATA'; }

    $headers = "From: $fromName <$fromAddr>\r\n"
        . "To: $to\r\n"
        . "Reply-To: $replyTo\r\n"
        . "Subject: $subject\r\n"
        . "MIME-Version: 1.0\r\n"
        . "Content-Type: text/html; charset=UTF-8\r\n\r\n";
    if (!$send($headers . $bodyHtml)) { fclose($sock); return 'Error enviando cuerpo'; }
    if (!$send('.')) { fclose($sock); return 'Error enviando fin DATA'; }
    $dataResp = $read();
    if (strpos($dataResp, '250') !== 0) {
        error_log('[send-email.php] SMTP rechazó el mensaje: ' . $dataResp);
        fclose($sock);
        return 'Servidor rechazó el mensaje: ' . $dataResp;
    }

    $send("QUIT");
    fclose($sock);
    return true;
}