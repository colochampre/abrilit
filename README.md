# Abril IT - Website

## Configuración del servidor de correo

### Requisitos
- Python 3.7 o superior
- pip (gestor de paquetes de Python)

### Instalación

1. Instalar las dependencias de Python:
```bash
pip install -r requirements.txt
```

### Ejecución

1. Iniciar el servidor backend:
```bash
python server.py
```

El servidor se ejecutará en `http://localhost:5000`

2. Abrir `index.html` en tu navegador

### Uso del formulario de contacto

Una vez que el servidor esté ejecutándose, el formulario de contacto enviará los mensajes al correo configurado (hello@abrilit.ar).

### Notas de seguridad

- Las credenciales SMTP están actualmente en el código. Para producción, considera usar variables de entorno.
- Asegúrate de que el servidor backend esté protegido y no sea accesible públicamente sin las medidas de seguridad adecuadas.

### Despliegue en producción

- **Si tu hosting es cPanel:** sigue la guía **[Despliegue en cPanel](DEPLOY-CPANEL.md)**. El sitio y el formulario de contacto (envío de mails por PHP) quedan funcionando sin necesidad de Python ni Go en el servidor.

Para otros entornos, considera:
1. Usar variables de entorno para las credenciales SMTP
2. Configurar CORS adecuadamente para tu dominio
3. Usar un servidor WSGI como Gunicorn
4. Configurar HTTPS
