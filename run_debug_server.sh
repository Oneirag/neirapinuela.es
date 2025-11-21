#!/usr/bin/env bash
# run_debug_server.sh

# 1️⃣  Define las variables de entorno
export FLASK_ENV="development"
export PORT=5005

# 2️⃣  Lanza el servidor
python run_server.py