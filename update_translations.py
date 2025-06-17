#!/usr/bin/env python3

import re

# Spanish translations
translations_es = {
    "About neirapinuela.es": "Acerca de neirapinuela.es",
    "Our Website": "Nuestro Sitio Web",
    "Welcome to the Neira Pinuela family website! This is our personal space on the internet where we share our projects, applications, and family moments.": "¡Bienvenidos al sitio web de la familia Neira Pinuela! Este es nuestro espacio personal en internet donde compartimos nuestros proyectos, aplicaciones y momentos familiares.",
    "Technology Stack": "Stack Tecnológico",
    "Family Applications": "Aplicaciones Familiares",
    "Our website hosts various applications that different family members have created or use. Some are public and accessible to everyone, while others require authentication for security.": "Nuestro sitio web aloja varias aplicaciones que diferentes miembros de la familia han creado o utilizan. Algunas son públicas y accesibles para todos, mientras que otras requieren autenticación por seguridad.",
    "Used by:": "Usado por:",
    "Contact": "Contacto",
    "This website is maintained by the Neira Pinuela family. Built with love and modern web technologies.": "Este sitio web es mantenido por la familia Neira Pinuela. Construido con amor y tecnologías web modernas.",
    "Home": "Inicio",
    "Family": "Familia",
    "Applications": "Aplicaciones",
    "Logout": "Cerrar sesión",
    "Login": "Iniciar sesión",
    "Made with": "Hecho con",
    "by the Neira Pinuela family": "por la familia Neira Pinuela",
    "The Neira Pinuela Family": "La Familia Neira Pinuela",
    "Meet our family members": "Conoce a los miembros de nuestra familia",
    "Applications:": "Aplicaciones:",
    "Welcome to our family website": "Bienvenidos a nuestro sitio web familiar",
    "Meet the Neira Pinuela family": "Conoce a la familia Neira Pinuela",
    "Explore our collection of apps": "Explora nuestra colección de aplicaciones",
    "Learn more about this website": "Conoce más sobre este sitio web",
    "Featured Applications": "Aplicaciones Destacadas",
    "Available to:": "Disponible para:",
    "Login Required": "Requiere Iniciar Sesión",
    "Open App": "Abrir Aplicación",
    "Our collection of family applications": "Nuestra colección de aplicaciones familiares",
    "Public Access": "Acceso Público",
    "Open Application": "Abrir Aplicación",
    "No applications available": "No hay aplicaciones disponibles",
    "Please log in to see more applications or check back later.": "Por favor inicia sesión para ver más aplicaciones o vuelve más tarde.",
    "Typing Practice": "Práctica de Mecanografía",
    "Improve your typing skills with Pablo and Carlitos!": "¡Mejora tus habilidades de mecanografía con Pablo y Carlitos!",
    "Select a Lesson": "Selecciona una Lección",
    "Accuracy": "Precisión",
    "WPM": "PPM",
    "Errors": "Errores",
    "Time": "Tiempo",
    "Start typing here...": "Comienza a escribir aquí...",
    "Restart": "Reiniciar",
    "Back to Lessons": "Volver a Lecciones",
    "Lesson Completed!": "¡Lección Completada!",
    "Next Lesson": "Siguiente Lección",
    "Retry Lesson": "Repetir Lección",
    "Achievement Unlocked!": "¡Logro Desbloqueado!",
    "Basic Keys": "Teclas Básicas",
    "Learn the home row keys": "Aprende las teclas de la fila base",
    "Upper Row": "Fila Superior",
    "Add upper row keys": "Añade las teclas de la fila superior",
    "Lower Row": "Fila Inferior",
    "Add lower row keys": "Añade las teclas de la fila inferior",
    "Numbers": "Números",
    "Practice with numbers": "Practica con números",
    "Symbols": "Símbolos",
    "Common symbols": "Símbolos comunes",
    "Mixed Practice": "Práctica Mixta",
    "Combine everything": "Combina todo",
    "Spanish Words": "Palabras en Español",
    "Practice Spanish": "Practica Español",
    "Sentences": "Oraciones",
    "Full sentences": "Oraciones completas",
    "Advanced": "Avanzado",
    "Complex combinations": "Combinaciones complejas",
    "Master Level": "Nivel Maestro",
    "Ultimate challenge": "Desafío definitivo",
    "Keep your wrists straight and fingers curved.": "Mantén las muñecas rectas y los dedos curvados.",
    "Look at the screen, not at your fingers.": "Mira la pantalla, no tus dedos.",
    "Use all ten fingers, not just your index fingers.": "Usa los diez dedos, no solo los índices.",
    "Practice regularly for better results.": "Practica regularmente para mejores resultados.",
    "Accuracy is more important than speed.": "La precisión es más importante que la velocidad.",
    "Take breaks to avoid fatigue.": "Toma descansos para evitar la fatiga.",
    "Maintain good posture while typing.": "Mantén una buena postura al escribir.",
    "Words:": "Palabras:",
    "Keys:": "Teclas:",
    "Lesson": "Lección",
    "completed!": "completada!",
    "Accuracy:": "Precisión:",
    "Speed:": "Velocidad:",
    "Time:": "Tiempo:",
    "Perfect accuracy!": "¡Precisión perfecta!",
    "Speed demon! 40+ WPM": "¡Demonio de la velocidad! +40 PPM",
    "Persistent learner!": "¡Aprendiz persistente!",
    "Tip:": "Consejo:",
    "TOTP Setup": "Configuración TOTP",
    "Setup Two-Factor Authentication": "Configurar Autenticación de Dos Factores",
    "Scan this QR code with your authenticator app:": "Escanea este código QR con tu aplicación de autenticación:",
    "Manual entry:": "Entrada manual:",
    "Enter the 6-digit code from your authenticator app": "Introduce el código de 6 dígitos de tu aplicación de autenticación",
    "Access Forbidden": "Acceso Prohibido",
    "You don't have permission to access this resource. This application is restricted to specific family members.": "No tienes permiso para acceder a este recurso. Esta aplicación está restringida a miembros específicos de la familia.",
    "Access Restricted": "Acceso Restringido",
    "This application is only available to certain family members. Please log in with an authorized account.": "Esta aplicación solo está disponible para ciertos miembros de la familia. Por favor inicia sesión con una cuenta autorizada.",
    "Go Home": "Ir al Inicio",
    "Switch Account": "Cambiar Cuenta",
    "Available Options": "Opciones Disponibles",
    "Log in with your account": "Inicia sesión con tu cuenta",
    "See available applications": "Ver aplicaciones disponibles",
    "Learn about our family": "Conoce sobre nuestra familia",
    "Return to homepage": "Volver a la página principal",
    "Page Not Found": "Página No Encontrada",
    "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.": "La página que buscas puede haber sido eliminada, haber cambiado de nombre, o estar temporalmente no disponible.",
    "Go Back": "Volver",
    "What can you do?": "¿Qué puedes hacer?",
    "Visit our homepage": "Visita nuestra página principal",
    "Meet our family": "Conoce a nuestra familia",
    "Explore our applications": "Explora nuestras aplicaciones",
    "Learn about this website": "Conoce sobre este sitio web",
    "Internal Server Error": "Error Interno del Servidor",
    "Something went wrong on our end. We apologize for the inconvenience and are working to fix the issue.": "Algo salió mal de nuestro lado. Nos disculpamos por las molestias y estamos trabajando para solucionar el problema.",
    "What happened?": "¿Qué pasó?",
    "Our server encountered an unexpected error while processing your request. The issue has been logged and our team will investigate it.": "Nuestro servidor encontró un error inesperado al procesar tu solicitud. El problema ha sido registrado y nuestro equipo lo investigará.",
    "Try Again": "Intentar de Nuevo",
    "Wait a few minutes and try again": "Espera unos minutos e inténtalo de nuevo",
    "Try other applications": "Prueba otras aplicaciones",
    "Contact us if the problem persists": "Contáctanos si el problema persiste"
}

def update_po_file(filename, translations):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for english, spanish in translations.items():
        # Escape special characters for regex
        english_escaped = re.escape(english)
        # Replace the pattern msgid "..." msgstr ""
        pattern = f'msgid "{english_escaped}"\\nmsgstr ""'
        replacement = f'msgid "{english}"\\nmsgstr "{spanish}"'
        content = re.sub(pattern, replacement, content)
        
        # Also handle fuzzy entries
        pattern = f'#, fuzzy\\nmsgid "{english_escaped}"\\nmsgstr "[^"]*"'
        replacement = f'msgid "{english}"\\nmsgstr "{spanish}"'
        content = re.sub(pattern, replacement, content)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    update_po_file('src/neirapinuela/translations/es/LC_MESSAGES/messages.po', translations_es)
    print("Spanish translations updated successfully!")