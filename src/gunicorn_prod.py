import multiprocessing
import os

# Server socket - configurable via environment variables
host = os.environ.get('FLASK_HOST', '127.0.0.1')
port = os.environ.get('FLASK_PORT', '5000')
bind = f"{host}:{port}"

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "gevent"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50
preload_app = True
timeout = 30
keepalive = 2

# Logging
loglevel = 'info'
accesslog = '-'  # Log to stdout
errorlog = '-'   # Log to stderr

# Process naming
proc_name = 'neirapinuela-es'