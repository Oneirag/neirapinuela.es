# neirapinuela.es

Sitio web personal y familiar de la familia Neira Pinuela. Una aplicación web moderna construida con Flask que incluye aplicaciones familiares, autenticación MFA y soporte multiidioma.

## Características

- ✅ Aplicación Flask moderna con Bootstrap 5
- ✅ Autenticación MFA con Google Authenticator
- ✅ Soporte multiidioma (Español/Inglés)
- ✅ Sistema de aplicaciones familiares
- ✅ Diseño responsivo y minimalista
- ✅ Configuración de producción con Gunicorn/Gevent
- ✅ Configuración de Nginx con caché estático
- ✅ Plantillas de error personalizadas

## Estructura del Proyecto

```
├── src/neirapinuela/             # Código fuente de la aplicación
│   ├── __init__.py               # Factory de la aplicación Flask
│   ├── config.py                 # Configuración de la aplicación
│   ├── models.py                 # Modelos de usuario
│   ├── main.py                   # Blueprint principal
│   ├── auth.py                   # Blueprint de autenticación
│   ├── apps.py                   # Blueprint de aplicaciones
│   ├── static/                   # Archivos estáticos
│   │   └── css/style.css         # Estilos personalizados
│   ├── templates/                # Plantillas Jinja2
│   │   ├── base.html             # Plantilla base
│   │   ├── auth/                 # Plantillas de autenticación
│   │   ├── apps/                 # Plantillas de aplicaciones
│   │   └── errors/               # Plantillas de error
│   └── translations/             # Archivos de traducción
├── pyproject.toml                # Configuración del proyecto Python
├── requirements.txt              # Dependencias
├── gunicorn_config.py            # Configuración de Gunicorn
├── nginx.conf                    # Configuración de Nginx
├── run_server.py                 # Script para ejecutar el servidor
└── README.md                     # Este archivo
```

## Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Oneirag/neirapinuela.es
   cd neirapinuela.es
   ```

2. **Crear entorno virtual:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # En Linux/Mac
   # o
   venv\Scripts\activate     # En Windows
   ```

3. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # Editar .env con tus valores
   ```

5. **Generar secretos TOTP:**
   ```python
   import pyotp
   print("OSCAR_TOTP_SECRET:", pyotp.random_base32())
   print("EVA_TOTP_SECRET:", pyotp.random_base32())
   ```

6. **Compilar traducciones:**
   ```bash
   source venv/bin/activate
   pybabel compile -d src/neirapinuela/translations
   ```

## Ejecución

### Desarrollo
```bash
python run_server.py
```

### Producción
```bash
# Con Gunicorn
gunicorn -c gunicorn_config.py 'neirapinuela:create_app()'

# O usando el módulo WSGI
gunicorn -c gunicorn_config.py src.neirapinuela.wsgi:app
```

## Configuración de Nginx

1. Copiar `nginx.conf` a `/etc/nginx/sites-available/neirapinuela.es`
2. Crear enlace simbólico: `ln -s /etc/nginx/sites-available/neirapinuela.es /etc/nginx/sites-enabled/`
3. Ajustar rutas en el archivo según tu instalación
4. Obtener certificado SSL con Let's Encrypt
5. Reiniciar Nginx: `sudo systemctl reload nginx`

## Miembros de la Familia y Aplicaciones

### Miembros
- **Oscar** (padre) - Acceso a Grafana
- **Eva** (madre) - Acceso futuro a aplicaciones
- **Pablo** (hijo) - Acceso a Mecanografía
- **Carlitos** (hijo) - Acceso a Mecanografía

### Aplicaciones Actuales
- **Mecanografía** (`/apps/mecanografia`) - Aplicación pública para práctica de escritura
- **Geografía** (`/apps/geografia`) - Aplicación para practicar geografía
- **Quiz** (`/apps/quiz`) - Repaso de capitales, verbos y más
- **Gas** (`/apps/gas`) - Conversor de unidades de gas
- **Euro Coin Game** (`/apps/euro_coin_game`) - Aprende a usar las monedas de euro
- **Conversor de Unidades** (`/apps/measurements`) - Practica la conversión de unidades
- **Multiplicaciones** (`/apps/multiplications`) - Practica las tablas de multiplicar
- **Grafana** (`https://grafana.neirapinuela.es`) - Panel de monitorización (requiere login)

## Autenticación MFA

La aplicación utiliza TOTP (Time-based One-Time Password) con Google Authenticator:

1. Al hacer login por primera vez, se muestra un código QR
2. Escanear con Google Authenticator
3. Introducir el código de 6 dígitos
4. El TOTP queda configurado para futuros logins

## Internacionalización

El sitio soporta español e inglés:

- **Añadir nuevas cadenas:** Usar `{{ _('Texto') }}` en plantillas y `_('Texto')` en Python
- **Extraer cadenas:** `pybabel extract -F babel.cfg -k _l -o messages.pot src/`
- **Actualizar traducciones:** `pybabel update -i messages.pot -d src/neirapinuela/translations`
- **Compilar:** `pybabel compile -d src/neirapinuela/translations`

## Añadir Nuevas Aplicaciones

1. **Actualizar `config.py`:**
   ```python
   'nueva_app': {
       'name': 'Nueva Aplicación',
       'url': '/apps/nueva-app',
       'requires_login': True,  # o False
       'members': ['oscar', 'eva'],
       'description': 'Descripción de la aplicación'
   }
   ```

2. **Crear ruta en `apps.py`:**
   ```python
   @bp.route('/nueva-app')
   def nueva_app():
       return render_template('apps/nueva_app.html')
   ```

3. **Crear plantilla en `templates/apps/nueva_app.html`**

## Logs

- **Aplicación:** `/var/log/neirapinuela/`
- **Nginx:** `/var/log/nginx/neirapinuela.es.*.log`

## Seguridad

- Autenticación MFA obligatoria
- Rate limiting en endpoints de login
- Headers de seguridad en Nginx
- HTTPS forzado
- Secrets en variables de entorno

## Licencia

Proyecto personal de la familia Neira Pinuela.