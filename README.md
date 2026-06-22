# neirapinuela.es

Sitio web personal y familiar de la familia Neira Pinuela. Una aplicación web moderna construida con Flask que incluye aplicaciones familiares, autenticación MFA y soporte multiidioma.

## Características

- ✅ Aplicación Flask moderna con Bootstrap 5
- ✅ Autenticación MFA con Google Authenticator
- ✅ Soporte multiidioma (Español/Inglés)
- ✅ Sistema de aplicaciones familiares
- ✅ Seguimiento de progreso de mecanografía en SQLite con CLI de administración
- ✅ Diseño responsivo y minimalista
- ✅ Configuración de producción con Gunicorn/Gevent
- ✅ Configuración de Nginx con caché estático
- ✅ Plantillas de error personalizadas

## Estructura del Proyecto

```
├── src/neirapinuela/             # Código fuente de la aplicación
│   ├── __init__.py               # Factory de la aplicación Flask
│   ├── config.py                 # Configuración de la aplicación
│   ├── models.py                 # Modelos de usuario y progreso
│   ├── db.py                     # Instancia de SQLAlchemy (SQLite)
│   ├── cli.py                    # Comandos CLI (progreso de mecanografía)
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

5. **Compilar traducciones:**
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

## CLI de Administración

La aplicación incluye comandos CLI para consultar el progreso de mecanografía de los usuarios logueados. El progreso se guarda en una base de datos SQLite (`instance/neirapinuela.db`) que se crea automáticamente al arrancar la app.

### Comandos disponibles

**Resumen global de todos los usuarios:**
```bash
flask --app neirapinuela typing stats
# o con el console script:
neirapinuela typing stats
```
Salida de ejemplo:
```
Usuario              Lecciones      Mejor PPM    Logros
------------------------------------------------------------
carlitos             1/55         25           0
pablo                2/55         40           1
```

**Detalle de un usuario (mejores estadísticas por lección):**
```bash
flask --app neirapinuela typing user pablo
```
Salida de ejemplo:
```
Usuario: pablo
Lecciones completadas: 2/55
Mejor PPM: 40
Logros: Precisión perfecta (100%)

Lección    Mejor PPM    Precisión    Errores    Última vez
----------------------------------------------------------------
#0         35           98%         2          2026-06-22 21:38
#1         40           100%         0          2026-06-22 21:38
```

**Historial completo cronológico de sesiones:**
```bash
flask --app neirapinuela typing history carlitos
```
Salida de ejemplo:
```
Usuario: carlitos - Historial de sesiones

Fecha                  Lección    PPM      Precisión    Errores    Tiempo
------------------------------------------------------------------------
2026-06-22 21:38       #0         25       95%         4          1:00
```

### Notas
- Los comandos requieren estar en el entorno virtual activado (`source venv/bin/activate`) o usar el intérprete del venv directamente.
- `flask --app neirapinuela` carga la configuración por defecto (`Config`). Para usar configuración de desarrollo/producción, exporta `FLASK_ENV=development|production` antes de invocar el comando.
- La base de datos SQLite se crea automáticamente en `instance/neirapinuela.db` al arrancar la aplicación (`db.create_all()`). No requiere migraciones manuales.
- Para reiniciar el progreso de un usuario, basta con borrar sus filas de las tablas `typing_completion` y `typing_achievement` (p. ej. con `sqlite3 instance/neirapinuela.db`).

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
- **Ecuaciones** (`/apps/ecuaciones`) - Practica ecuaciones de primer grado paso a paso (para Pablo)
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