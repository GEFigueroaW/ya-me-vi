# 🚀 SCRIPT DE CONFIGURACIÓN RÁPIDA PARA APK
# Ejecutar como administrador

Write-Host "🔧 CONFIGURANDO APK WEBINTOAPP..." -ForegroundColor Green

# 1. Verificar archivos necesarios
Write-Host "`n📋 Verificando archivos..." -ForegroundColor Yellow
$archivos = @(
    "login.html",
    "login-apk-fixed.html", 
    "auth-external.html",
    "js/firebase-init-apk-v2.js",
    "test-apk-config.html"
)

foreach ($archivo in $archivos) {
    if (Test-Path $archivo) {
        Write-Host "✅ $archivo" -ForegroundColor Green
    } else {
        Write-Host "❌ $archivo FALTANTE" -ForegroundColor Red
    }
}

# 2. Mostrar configuración de WebIntoApp
Write-Host "`n🔧 CONFIGURACIÓN WEBINTOAPP:" -ForegroundColor Yellow
Write-Host "URL: https://yamevi.com.mx/login.html" -ForegroundColor White
Write-Host "Configuraciones necesarias:" -ForegroundColor White
Write-Host "- ✅ Enable JavaScript" -ForegroundColor Green
Write-Host "- ✅ Enable Local Storage" -ForegroundColor Green
Write-Host "- ✅ Allow External Links" -ForegroundColor Green
Write-Host "- ✅ Add Internet Permission" -ForegroundColor Green
Write-Host "- ✅ Add Storage Permissions" -ForegroundColor Green

# 3. URLs importantes
Write-Host "`n🌐 ENLACES IMPORTANTES:" -ForegroundColor Yellow
Write-Host "WebIntoApp Config: https://webintoapp.com/author/apps/861340/edit"
Write-Host "Firebase Console: https://console.firebase.google.com/project/ya-me-vi/authentication/settings"
Write-Host "Google Cloud Console: https://console.cloud.google.com/apis/credentials"
Write-Host "Test Page: https://yamevi.com.mx/test-apk-config.html"

# 4. Dominios para Firebase
Write-Host "`n🔥 DOMINIOS PARA FIREBASE:" -ForegroundColor Yellow
$dominios = @(
    "ya-me-vi.firebaseapp.com",
    "yamevi.com.mx",
    "gfigueroa.github.io", 
    "localhost",
    "127.0.0.1",
    "webintoapp.com"
)
foreach ($dominio in $dominios) {
    Write-Host "- $dominio" -ForegroundColor White
}

# 5. URIs para Google Cloud
Write-Host "`n☁️ URIS PARA GOOGLE CLOUD:" -ForegroundColor Yellow
$uris = @(
    "https://ya-me-vi.firebaseapp.com/__/auth/handler",
    "https://yamevi.com.mx/__/auth/handler",
    "https://yamevi.com.mx/auth-external.html",
    "https://yamevi.com.mx/login.html"
)
foreach ($uri in $uris) {
    Write-Host "- $uri" -ForegroundColor White
}

# 6. Pasos finales
Write-Host "`n📱 PASOS FINALES:" -ForegroundColor Yellow
Write-Host "1. Configurar Firebase Console" -ForegroundColor White
Write-Host "2. Configurar Google Cloud Console" -ForegroundColor White
Write-Host "3. Verificar WebIntoApp settings" -ForegroundColor White
Write-Host "4. Generar nuevo APK" -ForegroundColor White
Write-Host "5. Probar en dispositivo" -ForegroundColor White

Write-Host "`n✅ CONFIGURACIÓN COMPLETA!" -ForegroundColor Green

# Abrir URLs importantes
Write-Host "`n🌐 ¿Abrir enlaces en el navegador? (Y/N)" -ForegroundColor Yellow
$respuesta = Read-Host

if ($respuesta -eq "Y" -or $respuesta -eq "y") {
    Start-Process "https://webintoapp.com/author/apps/861340/edit"
    Start-Process "https://console.firebase.google.com/project/ya-me-vi/authentication/settings"
    Start-Process "https://console.cloud.google.com/apis/credentials" 
    Start-Process "https://yamevi.com.mx/test-apk-config.html"
}
