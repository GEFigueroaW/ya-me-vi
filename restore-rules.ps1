# Script para restaurar reglas de Firestore originales

Write-Host "🔄 === RESTAURANDO REGLAS FIRESTORE ORIGINALES ===" -ForegroundColor Green
Write-Host ""

# Verificar que existe el respaldo
if (Test-Path "firestore.rules.backup") {
    # Restaurar reglas originales
    Copy-Item "firestore.rules.backup" "firestore.rules" -Force
    Write-Host "✅ Reglas originales restauradas desde respaldo" -ForegroundColor Green
    
    # Desplegar reglas restauradas
    Write-Host "🚀 Desplegando reglas restauradas..." -ForegroundColor Blue
    firebase deploy --only firestore:rules
    
    Write-Host ""
    Write-Host "✅ Reglas de producción restauradas exitosamente" -ForegroundColor Green
    Write-Host "🔒 Seguridad de Firestore restablecida" -ForegroundColor Green
    
} else {
    Write-Host "❌ No se encontró respaldo de reglas originales" -ForegroundColor Red
    Write-Host "💡 Verifica que existe el archivo firestore.rules.backup" -ForegroundColor Yellow
}