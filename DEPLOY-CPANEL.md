# Despliegue en cPanel

Guía para publicar el sitio Abril IT en un hosting con cPanel, con el formulario de contacto y envío de correos funcionando.

## Resumen

- El **sitio web** (HTML, CSS, JS, imágenes) se sube a `public_html`.
- El **envío de correos** se hace con **PHP** (no hace falta tener Python ni Go en el servidor). PHP se ejecuta solo cuando alguien envía el formulario.

---

## 1. Estructura en el servidor

En cPanel, dentro de la carpeta del dominio (normalmente `public_html`), deja esta estructura:

```
public_html/
├── index.html          ← copia de home.html (o renómbrala)
├── home.html           ← opcional, si quieres mantener el nombre
├── api/
│   └── send-email.php  ← script que envía el correo
└── static/
    ├── css/
    │   └── home.css
    ├── js/
    │   └── main.js
    └── img/
        └── (todas las imágenes)
```

- **Página principal:** sube `home.html`. Si quieres que sea la portada al entrar a tu dominio, renómbrala a `index.html` o configura el dominio para usar `home.html` como índice.
- **Carpeta `api/`:** crea la carpeta `api` dentro de `public_html` y sube dentro el archivo `send-email.php` (el que está en `api/send-email.php` del proyecto).
- **Carpeta `static/`:** sube toda la carpeta `static` con su contenido (css, js, img).

---

## 2. Archivos a subir

| Origen en el proyecto | Destino en cPanel |
|-----------------------|-------------------|
| `home.html` | `public_html/index.html` (o `public_html/home.html`) |
| `api/send-email.php` | `public_html/api/send-email.php` |
| `static/css/home.css` | `public_html/static/css/home.css` |
| `static/js/main.js` | `public_html/static/js/main.js` |
| `static/img/*` | `public_html/static/img/` |

Puedes usar el **Administrador de archivos** de cPanel o **FTP**.

---

## 3. Configuración del correo (SMTP)

1. En el **directorio padre** de `public_html` (por ejemplo `home/tu_usuario/`) crea un archivo, por ejemplo `smtp_config.php`, con el siguiente contenido:

   ```php
   <?php
      // Datos SMTP (este archivo no debe estar dentro de public_html)
      putenv('SMTP_HOST=mail.abrilit.ar');
      putenv('SMTP_PORT=465');
      putenv('SMTP_USER=_mainaccount@abrilit.ar');
      putenv('SMTP_PASS=g2Mc3RSeS;NV');
      putenv('SMTP_FROM=hola@abrilit.ar');
      putenv('SMTP_FROM_NAME=Abril IT');
      putenv('SMTP_SSL_VERIFY=1');
   ```

2. En la **primera línea** de `send-email.php`, justo después de `<?php`, añade:

   ```php
   require_once __DIR__ . '/../../smtp_config.php';  // ajusta la ruta según dónde esté smtp_config.php
   ```

   (Si `send-email.php` está en `public_html/abrilit/api/`, entonces `__DIR__ . '/../../smtp_config.php'` apunta a la carpeta del usuario, un nivel arriba de `public_html`.)

3. Comprueba que la ruta sea correcta para tu cuenta (en cPanel la estructura suele ser `home/cpanel_usuario/public_html/...`).
Así la contraseña no está en una carpeta accesible por la web.

---

## 4. Comportamiento del formulario

- El JavaScript del sitio detecta si estás en **producción** (tu dominio) o en **local** (localhost).
- En **producción** envía el formulario a `/api/send-email.php` (misma URL del sitio, sin cambiar puertos).
- No hace falta ejecutar ningún servidor Python ni Go en cPanel; solo PHP, que ya suele estar activo.

---

## 5. Comprobar que funciona

1. Entra a tu sitio: `https://tudominio.com` (o la URL que uses).
2. Rellena el formulario de contacto y envía.
3. Deberías ver el mensaje de éxito y recibir el correo en la cuenta configurada (por defecto hello@abrilit.ar).

Si no llega el correo o ves **"Error al enviar el email"**:

1. **Contraseña SMTP vacía** (muy frecuente en cPanel)  
   En cPanel no se carga un archivo `.env`. Tienes que dar la contraseña de una de estas formas:
   - **Variables de entorno:** en cPanel → “Variables de entorno” (o “Select PHP Version” → “Options” según tu panel), añade `SMTP_PASS` con la contraseña del correo.
   - **En el script:** al inicio de `api/send-email.php`, antes del `header(...)`, añade una sola línea:  
     `define('SMTP_PASS_FALLBACK', 'tu_contraseña_real');`  
     (cámbiala por la contraseña de `_mainaccount@abrilit.ar` y no subas este archivo a un repo público.)

2. **Usuario o servidor incorrectos**  
   Comprueba que en el script (o en las variables de entorno) estén bien: `SMTP_USER`, `SMTP_HOST` (mail.abrilit.ar), `SMTP_FROM`, y que la cuenta exista en ese servidor.

3. **Conexión bloqueada o SSL**  
   Algunos hostings bloquean salida por el puerto 465. En cPanel, si en el log aparece un error de conexión o SSL, puedes probar desactivar la verificación SSL solo para probar: en variables de entorno añade `SMTP_SSL_VERIFY=0`. (Solo para diagnóstico; en producción es mejor dejar la verificación activada si el host lo permite.)

4. **Ver el error concreto**  
   Para que la API devuelva el motivo del fallo (solo en pruebas), define la variable de entorno `SMTP_DEBUG=1`. La respuesta JSON incluirá un campo `debug` con el mensaje. Quita `SMTP_DEBUG` en producción.

5. **Logs**  
   Revisa los **logs de error** de PHP en cPanel (“Errores”, “Registros” o “Error Log”). El script escribe ahí el motivo del fallo (contraseña vacía, auth rechazada, conexión fallida, etc.).

---

## 6. Seguridad recomendada

- No subas `server.py`, `main.go`, `requirements.txt`, `go.mod`, ni la carpeta `deploy/` si no los vas a usar en el servidor.
- En producción, evita dejar la contraseña SMTP en el código: usa variables de entorno o un archivo de configuración fuera de `public_html` si cPanel lo permite.
- Mantén HTTPS activo en el dominio (certificado SSL en cPanel).

---

## Resumen rápido

1. Subir todo el sitio a `public_html` (HTML, `static/`, `api/send-email.php`).
2. Tener la página principal como `index.html` o `home.html`.
3. Dejar las credenciales SMTP en `api/send-email.php` (o usar variables de entorno).
4. Probar el formulario en la URL real del sitio.

Con esto el sitio y el envío de mails quedan funcionando en cPanel sin usar Python ni Go en el hosting.
