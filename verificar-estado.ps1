# Script para verificar el estado de YA ME VI
Write-Host "🔍 VERIFICANDO ESTADO DE YA ME VI" -ForegroundColor Green

# Función para verificar URL
function Test-Url {
    param($url)
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 10
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# Verificar Firebase Hosting
Write-Host "🌐 Verificando Firebase Hosting..." -ForegroundColor Yellow
$firebaseUrl = "https://ya-me-vi.firebaseapp.com"
if (Test-Url $firebaseUrl) {
    Write-Host "✅ Firebase Hosting está funcionando: $firebaseUrl" -ForegroundColor Green
} else {
    Write-Host "❌ Firebase Hosting no está disponible" -ForegroundColor Red
    Write-Host "   Necesitas ejecutar: ./deploy-firebase.ps1" -ForegroundColor Yellow
}

# Verificar GitHub Pages (alternativa)
Write-Host "🐙 Verificando GitHub Pages..." -ForegroundColor Yellow
$githubUrl = "https://gefiguerow.github.io/ya-me-vi"
if (Test-Url $githubUrl) {
    Write-Host "✅ GitHub Pages está funcionando: $githubUrl" -ForegroundColor Green
} else {
    Write-Host "⚠️  GitHub Pages no está configurado aún" -ForegroundColor Yellow
}

# Verificar archivos locales críticos
Write-Host "📁 Verificando archivos locales..." -ForegroundColor Yellow
$criticalFiles = @(
    "index.html",
    "js/firebase-init.js", 
    "firebase.json",
    "manifest.json"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file existe" -ForegroundColor Green
    } else {
        Write-Host "❌ $file falta" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📋 RESUMEN:" -ForegroundColor Cyan
Write-Host "Para que tu APK funcione necesitas:" -ForegroundColor White
Write-Host "1. ✅ Tener los archivos locales (ya los tienes)" -ForegroundColor White
Write-Host "2. 🌐 Un sitio web accesible (Firebase o GitHub Pages)" -ForegroundColor White
Write-Host "3. 📱 Configurar WebIntoApp con la URL correcta" -ForegroundColor White
