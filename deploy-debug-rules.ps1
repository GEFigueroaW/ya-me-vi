# Script para desplegar reglas de Firestore temporales (DEBUG)
# Esto permitirá acceso completo para identificar usuarios reales

Write-Host "🔧 === DESPLEGANDO REGLAS FIRESTORE TEMPORALES (DEBUG) ===" -ForegroundColor Yellow
Write-Host ""

# Verificar que Firebase CLI esté instalado
try {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI detectado: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI no encontrado. Instalando..." -ForegroundColor Red
    npm install -g firebase-tools
}

Write-Host ""
Write-Host "🚀 Desplegando reglas temporales..." -ForegroundColor Blue

# Respaldar reglas actuales
Copy-Item "firestore.rules" "firestore.rules.backup" -Force
Write-Host "💾 Respaldo creado: firestore.rules.backup" -ForegroundColor Green

# Reemplazar con reglas de debug
Copy-Item "firestore-debug.rules" "firestore.rules" -Force
Write-Host "🔄 Reglas de debug aplicadas temporalmente" -ForegroundColor Yellow

# Desplegar reglas
Write-Host ""
Write-Host "🚀 Desplegando a Firebase..." -ForegroundColor Blue
firebase deploy --only firestore:rules

# Información importante
Write-Host ""
Write-Host "⚠️  === IMPORTANTE ===" -ForegroundColor Red
Write-Host "⚠️  Estas son reglas TEMPORALES para debugging" -ForegroundColor Red  
Write-Host "⚠️  Permiten acceso completo - NO usar en producción" -ForegroundColor Red
Write-Host "⚠️  Restaurar reglas originales después del debug" -ForegroundColor Red
Write-Host ""
Write-Host "📋 Para restaurar reglas originales:" -ForegroundColor Cyan
Write-Host "   Copy-Item 'firestore.rules.backup' 'firestore.rules' -Force" -ForegroundColor Cyan
Write-Host "   firebase deploy --only firestore:rules" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Las reglas temporales están activas" -ForegroundColor Green
Write-Host "🔍 Ahora puedes probar el botón 'Usuarios Reales' en admin.html" -ForegroundColor Green