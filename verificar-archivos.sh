#!/bin/bash

# === SCRIPT DE VERIFICACIÓN DE ARCHIVOS ===
# Verifica que todos los archivos de la solución estén subidos

echo "🔍 VERIFICANDO ARCHIVOS EN SERVIDOR..."
echo "=================================="

# Lista de archivos que deben existir
files=(
    "https://yamevi.com.mx/js/webview-auth-fix.js"
    "https://yamevi.com.mx/login-webintoapp.html" 
    "https://yamevi.com.mx/test-apk-auth.html"
    "https://yamevi.com.mx/google-services-webintoapp.json"
    "https://yamevi.com.mx/webintoapp-config.json"
    "https://yamevi.com.mx/SOLUCION-MISSING-INITIAL-STATE.md"
)

echo ""
echo "📁 VERIFICANDO ARCHIVOS NUEVOS:"

for file in "${files[@]}"; do
    echo -n "Checking $file ... "
    
    if curl -s --head "$file" | head -n 1 | grep -q "200 OK"; then
        echo "✅ EXISTE"
    else
        echo "❌ NO ENCONTRADO"
    fi
done

echo ""
echo "🌐 URLS PARA VERIFICAR MANUALMENTE:"
echo "1. Diagnósticos: https://yamevi.com.mx/test-apk-auth.html"
echo "2. Login APK: https://yamevi.com.mx/login-webintoapp.html"
echo "3. Documentación: https://yamevi.com.mx/SOLUCION-MISSING-INITIAL-STATE.md"

echo ""
echo "✅ Verificación completada"