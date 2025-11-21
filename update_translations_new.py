#!/usr/bin/env python3
"""
Script para actualizar las traducciones de la aplicación.
Extrae mensajes nuevos y actualiza los archivos .po
"""

import subprocess
import os
import sys

def run_command(cmd, description):
    """Ejecuta un comando y muestra el resultado"""
    print(f"\n{'='*60}")
    print(f"🔄 {description}")
    print(f"{'='*60}")
    print(f"Ejecutando: {' '.join(cmd)}\n")
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)
    
    if result.returncode != 0:
        print(f"❌ Error al ejecutar: {' '.join(cmd)}")
        sys.exit(1)
    else:
        print(f"✅ {description} completado")
    
    return result

def main():
    # Configuración
    babel_cfg = "babel.cfg"
    pot_file = "messages.pot"
    translations_dir = "src/neirapinuela/translations"
    languages = ["es", "en"]  # Añade más idiomas si los necesitas
    
    # Verificar que existe babel.cfg
    if not os.path.exists(babel_cfg):
        print(f"❌ Error: No se encuentra {babel_cfg}")
        sys.exit(1)
    
    # Paso 1: Extraer todos los mensajes
    run_command(
        ["pybabel", "extract", "-F", babel_cfg, "-o", pot_file, "."],
        "Extrayendo mensajes de la aplicación"
    )
    
    # Verificar que se creó el archivo .pot
    if not os.path.exists(pot_file):
        print(f"❌ Error: No se pudo crear {pot_file}")
        sys.exit(1)
    
    print(f"\n📄 Archivo {pot_file} creado/actualizado")
    
    # Paso 2: Actualizar cada idioma
    for lang in languages:
        po_file = os.path.join(translations_dir, lang, "LC_MESSAGES", "messages.po")
        
        # Verificar si ya existe el archivo .po
        if os.path.exists(po_file):
            # Actualizar archivo existente
            run_command(
                ["pybabel", "update", "-i", pot_file, "-d", translations_dir, "-l", lang],
                f"Actualizando traducciones para {lang.upper()}"
            )
        else:
            # Inicializar nuevo idioma
            run_command(
                ["pybabel", "init", "-i", pot_file, "-d", translations_dir, "-l", lang],
                f"Inicializando traducciones para {lang.upper()}"
            )
        
        print(f"\n📝 Archivo de traducción para {lang.upper()}: {po_file}")
    
    # Paso 3: Mostrar estadísticas
    print(f"\n{'='*60}")
    print("📊 ESTADÍSTICAS DE TRADUCCIÓN")
    print(f"{'='*60}\n")
    
    for lang in languages:
        po_file = os.path.join(translations_dir, lang, "LC_MESSAGES", "messages.po")
        if os.path.exists(po_file):
            with open(po_file, 'r', encoding='utf-8') as f:
                content = f.read()
                total = content.count('msgid "') - 1  # -1 para el header
                empty = content.count('msgstr ""')
                fuzzy = content.count('#, fuzzy')
                translated = total - empty - fuzzy
                
                print(f"{lang.upper()}:")
                print(f"  ✓ Traducidas: {translated}/{total}")
                print(f"  ⚠ Fuzzy: {fuzzy}")
                print(f"  ✗ Sin traducir: {empty}")
                print(f"  📈 Progreso: {translated/total*100:.1f}%\n")
    
    # Información final
    print(f"{'='*60}")
    print("✅ ACTUALIZACIÓN COMPLETADA")
    print(f"{'='*60}\n")
    print("Próximos pasos:")
    print("1. Edita los archivos .po para añadir las traducciones faltantes")
    print("2. Busca las líneas con 'msgstr \"\"' y añade la traducción")
    print("3. Revisa las entradas marcadas como '#, fuzzy'")
    print("4. Ejecuta el script de compilación para generar los .mo:")
    print(f"   pybabel compile -d {translations_dir}")
    print()
    input("Press enter to run pybabel continue...")
    run_command(
                ["pybabel", "compile", "-d", translations_dir],
                f"Compilando traducciones"
            )

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Operación cancelada por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        sys.exit(1)