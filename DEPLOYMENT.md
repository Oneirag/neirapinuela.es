# Guía de Despliegue en Ubuntu

Esta guía te ayudará a desplegar la aplicación Flask neirapinuela.es en un servidor Ubuntu.

## Prerrequisitos

- Servidor Ubuntu 20.04 LTS o superior
- Acceso sudo/root
- Conexión a internet

## 1. Actualizar el Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

## 2. Instalar Dependencias del Sistema

```bash
# Python y herramientas
sudo apt install -y python3 python3-pip python3-venv python3-dev

# Nginx
sudo apt install -y nginx

# Supervisor (para gestión de procesos)
sudo apt install -y supervisor

# Git
sudo apt install -y git

# Otras dependencias
sudo apt install -y build-essential libssl-dev libffi-dev
```

## 3. Crear Usuario para la Aplicación

```bash
sudo adduser neirapinuela
sudo usermod -aG sudo neirapinuela
sudo su - neirapinuela
```

## 4. Clonar y Configurar la Aplicación

```bash
# Clonar el repositorio
git clone <tu-repositorio-url> neirapinuela-app
cd neirapinuela-app

# Cambiar a la rama feature/claude
git checkout feature/claude

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

## 5. Configurar Variables de Entorno

```bash
cp .env.example .env
nano .env
```

Configura las siguientes variables:
```bash
SECRET_KEY=tu-clave-secreta-muy-segura-aqui
FLASK_ENV=production
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
```

## 6. Compilar Traducciones

```bash
# Activar entorno virtual si no está activo
source venv/bin/activate

# Compilar traducciones
python update_translations.py
```

## 7. Configurar Gunicorn

Crear archivo de configuración para producción:

```bash
nano gunicorn_prod.py
```

Contenido:
```python
import multiprocessing

bind = "127.0.0.1:5000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "gevent"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50
preload_app = True
timeout = 30
keepalive = 2
```

## 8. Configurar Supervisor

Crear archivo de configuración de Supervisor:

```bash
sudo nano /etc/supervisor/conf.d/neirapinuela.conf
```

Contenido:
```ini
[program:neirapinuela]
command=/home/neirapinuela/neirapinuela-app/venv/bin/gunicorn -c gunicorn_prod.py src.neirapinuela.wsgi:application
directory=/home/neirapinuela/neirapinuela-app
user=neirapinuela
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/neirapinuela.log
environment=PATH="/home/neirapinuela/neirapinuela-app/venv/bin"
```

## 9. Configurar Nginx

Crear archivo de configuración de Nginx:

```bash
sudo nano /etc/nginx/sites-available/neirapinuela.es
```

Usar el contenido del archivo `nginx.conf` del proyecto, pero ajustando las rutas:

```nginx
server {
    listen 80;
    server_name neirapinuela.es www.neirapinuela.es;
    
    # Redirigir a HTTPS (opcional, configurar SSL después)
    # return 301 https://$server_name$request_uri;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /static {
        alias /home/neirapinuela/neirapinuela-app/src/neirapinuela/static;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    location /robots.txt {
        alias /home/neirapinuela/neirapinuela-app/robots.txt;
    }
    
    # Configuración de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

Habilitar el sitio:
```bash
sudo ln -s /etc/nginx/sites-available/neirapinuela.es /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 10. Iniciar Servicios

```bash
# Reiniciar y habilitar Supervisor
sudo systemctl restart supervisor
sudo systemctl enable supervisor

# Habilitar y reiniciar Nginx
sudo systemctl enable nginx
sudo systemctl restart nginx

# Verificar estado
sudo supervisorctl status
sudo systemctl status nginx
```

## 11. Configurar Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 12. SSL/HTTPS con Let's Encrypt (Opcional pero Recomendado)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d neirapinuela.es -d www.neirapinuela.es

# Verificar renovación automática
sudo certbot renew --dry-run
```

## 13. Comandos de Administración

### Reiniciar la aplicación:
```bash
sudo supervisorctl restart neirapinuela
```

### Ver logs:
```bash
sudo tail -f /var/log/neirapinuela.log
sudo tail -f /var/log/nginx/error.log
```

### Actualizar la aplicación:
```bash
cd /home/neirapinuela/neirapinuela-app
git pull origin feature/claude
source venv/bin/activate
pip install -r requirements.txt
python update_translations.py
sudo supervisorctl restart neirapinuela
```

### Verificar estado de servicios:
```bash
sudo supervisorctl status
sudo systemctl status nginx
sudo systemctl status supervisor
```

## 14. Backup y Mantenimiento

### Crear script de backup:
```bash
nano /home/neirapinuela/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/neirapinuela/backups"
APP_DIR="/home/neirapinuela/neirapinuela-app"

mkdir -p $BACKUP_DIR

# Backup de la aplicación
tar -czf $BACKUP_DIR/neirapinuela_$DATE.tar.gz -C /home/neirapinuela neirapinuela-app

# Limpiar backups antiguos (mantener solo los últimos 7 días)
find $BACKUP_DIR -name "neirapinuela_*.tar.gz" -mtime +7 -delete

echo "Backup completado: neirapinuela_$DATE.tar.gz"
```

```bash
chmod +x /home/neirapinuela/backup.sh
```

### Configurar cron para backup automático:
```bash
crontab -e
```

Añadir:
```
0 2 * * * /home/neirapinuela/backup.sh
```

## 15. Troubleshooting

### Verificar logs si algo no funciona:
```bash
# Logs de la aplicación
sudo tail -f /var/log/neirapinuela.log

# Logs de Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Logs de Supervisor
sudo tail -f /var/log/supervisor/supervisord.log
```

### Verificar que los puertos estén abiertos:
```bash
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :5000
```

### Probar la aplicación directamente:
```bash
cd /home/neirapinuela/neirapinuela-app
source venv/bin/activate
python run_server.py
```

## 16. Estructura Final del Proyecto

```
/home/neirapinuela/
├── neirapinuela-app/
│   ├── src/
│   ├── venv/
│   ├── requirements.txt
│   ├── nginx.conf
│   ├── gunicorn_config.py
│   ├── gunicorn_prod.py
│   └── .env
├── backups/
└── backup.sh
```

¡Tu aplicación Flask debería estar funcionando en http://tu-dominio.com!