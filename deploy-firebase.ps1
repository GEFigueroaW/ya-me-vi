# Script para desplegar YA ME VI en Firebase Hosting
Write-Host "🚀 DESPLEGANDO YA ME VI EN FIREBASE HOSTING" -ForegroundColor Green

# Verificar que Firebase CLI esté instalado
Write-Host "📋 Verificando Firebase CLI..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version 2>$null
    if ($firebaseVersion) {
        Write-Host "✅ Firebase CLI instalado: $firebaseVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Firebase CLI no encontrado. Instalando..." -ForegroundColor Red
        npm install -g firebase-tools
    }
} catch {
    Write-Host "❌ Instalando Firebase CLI..." -ForegroundColor Red
    npm install -g firebase-tools
}

# Login a Firebase (si no está logueado)
Write-Host "🔐 Verificando autenticación Firebase..." -ForegroundColor Yellow
try {
    firebase projects:list 2>$null
    Write-Host "✅ Ya estás autenticado en Firebase" -ForegroundColor Green
} catch {
    Write-Host "🔑 Iniciando sesión en Firebase..." -ForegroundColor Yellow
    firebase login
}

# Verificar que estamos en el proyecto correcto
Write-Host "📁 Verificando proyecto Firebase..." -ForegroundColor Yellow
firebase use ya-me-vi

# Desplegar a Firebase Hosting
Write-Host "🚀 Desplegando a Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting

# Mostrar resultado
Write-Host "" 
Write-Host "🎉 ¡DESPLIEGUE COMPLETADO!" -ForegroundColor Green
Write-Host "🌐 Tu sitio está disponible en: https://ya-me-vi.firebaseapp.com" -ForegroundColor Cyan
Write-Host "📱 Ahora puedes usar esta URL en WebIntoApp para generar tu APK" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "1. Ve a WebIntoApp" -ForegroundColor White
Write-Host "2. Cambia la URL a: https://ya-me-vi.firebaseapp.com" -ForegroundColor White
Write-Host "3. Regenera tu APK" -ForegroundColor White
Write-Host "4. ¡Listo! Tu app debería funcionar correctamente" -ForegroundColor White
