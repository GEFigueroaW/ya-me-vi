#!/usr/bin/env pwsh

# Script para habilitar métodos de autenticación en Firebase
Write-Host "🔧 Configurando métodos de autenticación en Firebase..." -ForegroundColor Green

# Verificar que estamos en el proyecto correcto
$currentProject = firebase use --current 2>$null
if ($currentProject -match "ya-me-vi") {
    Write-Host "✅ Proyecto correcto: ya-me-vi" -ForegroundColor Green
} else {
    Write-Host "❌ Proyecto incorrecto. Cambiando a ya-me-vi..." -ForegroundColor Red
    firebase use ya-me-vi
}

Write-Host ""
Write-Host "📋 Para habilitar los métodos de autenticación, ve a:" -ForegroundColor Yellow
Write-Host "   https://console.firebase.google.com/project/ya-me-vi/authentication/providers" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Habilita los siguientes proveedores:" -ForegroundColor Yellow
Write-Host "   1. ✅ Email/Password" -ForegroundColor Green
Write-Host "   2. ✅ Google" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 También puedes usar este comando para abrir directamente:" -ForegroundColor Yellow
Write-Host "   Start-Process 'https://console.firebase.google.com/project/ya-me-vi/authentication/providers'" -ForegroundColor Cyan

# Abrir automáticamente la consola
Start-Process "https://console.firebase.google.com/project/ya-me-vi/authentication/providers"

Write-Host ""
Write-Host "⏳ Esperando que habilites los métodos de autenticación..." -ForegroundColor Yellow
Read-Host "Presiona Enter cuando hayas habilitado Email/Password y Google"

Write-Host ""
Write-Host "🧪 Probando la configuración..." -ForegroundColor Green

# Iniciar servidor local para pruebas
Write-Host "🌐 Iniciando servidor local en http://localhost:5000" -ForegroundColor Green
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; firebase serve --port 5000" -WindowStyle Minimized

Start-Sleep -Seconds 3

# Abrir página de prueba
Write-Host "🔍 Abriendo página de prueba..." -ForegroundColor Green
Start-Process "http://localhost:5000/test-firebase-config.html"

Write-Host ""
Write-Host "✅ Configuración completa!" -ForegroundColor Green
Write-Host "   - Usa la página de prueba para verificar que todo funcione" -ForegroundColor White
Write-Host "   - Luego prueba el registro en: http://localhost:5000/register.html" -ForegroundColor White
