import multiprocessing
import os

# Server socket
bind = "127.0.0.1:8000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = 'gevent'
worker_connections = 1000
timeout = 30
keepalive = 2

# Restart workers after this many requests, to help prevent memory leaks
max_requests = 1000
max_requests_jitter = 50

# Logging
errorlog = '/var/log/neirapinuela/gunicorn_error.log'
accesslog = '/var/log/neirapinuela/gunicorn_access.log'
loglevel = 'info'

# Process naming
proc_name = 'neirapinuela-es'

# Server mechanics
daemon = False
pidfile = '/tmp/neirapinuela.pid'
user = 'www-data'
group = 'www-data'
tmp_upload_dir = None

# SSL
keyfile = None
certfile = None

# Environment
raw_env = [
    'FLASK_ENV=production',
]

# Preload application for better performance
preload_app = True