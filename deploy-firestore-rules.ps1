# Script para desplegar reglas de Firestore
# Ejecutar desde la raíz del proyecto

Write-Host "🔥 Desplegando reglas de Firestore..." -ForegroundColor Yellow

# Verificar que Firebase CLI está instalado
try {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI detectado: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI no encontrado. Instalar con: npm install -g firebase-tools" -ForegroundColor Red
    exit 1
}

# Verificar que existe el archivo de reglas
if (-not (Test-Path "firestore.rules")) {
    Write-Host "❌ Archivo firestore.rules no encontrado en el directorio actual" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Archivo firestore.rules encontrado" -ForegroundColor Green

# Verificar login de Firebase
try {
    $projects = firebase projects:list 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "🔐 Necesitas hacer login en Firebase..." -ForegroundColor Yellow
        firebase login
    }
} catch {
    Write-Host "🔐 Haciendo login en Firebase..." -ForegroundColor Yellow
    firebase login
}

# Desplegar reglas
Write-Host "🚀 Desplegando reglas de Firestore..." -ForegroundColor Yellow
firebase deploy --only firestore:rules

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Reglas de Firestore desplegadas exitosamente!" -ForegroundColor Green
    Write-Host "🔧 Las nuevas reglas permitirán acceso admin a todas las colecciones" -ForegroundColor Cyan
} else {
    Write-Host "❌ Error desplegando reglas de Firestore" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Emails de admin autorizados:" -ForegroundColor Cyan
Write-Host "   • gfigueroa.w@gmail.com" -ForegroundColor White
Write-Host "   • eugenfw@gmail.com" -ForegroundColor White
Write-Host "   • admin@yamevi.com.mx" -ForegroundColor White
Write-Host "   • guillermo.figueroaw@totalplay.com.mx" -ForegroundColor White

Write-Host "🎉 ¡Configuración completada!" -ForegroundColor Green
