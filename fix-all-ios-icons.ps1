#!/usr/bin/env pwsh

# Script para actualizar TODAS las páginas HTML con el icono correcto
# Reemplaza logo-512-adaptativo-circular.png por logo-512.png en todos los archivos

Write-Host "🔧 Actualizando iconos iOS en todas las páginas HTML..." -ForegroundColor Green

$htmlFiles = @(
    "index.html",
    "home.html", 
    "analisis.html",
    "combinacion.html",
    "sugeridas.html",
    "login.html",
    "register.html",
    "recover.html",
    "login-email.html",
    "admin.html",
    "admin-real.html",
    "welcome.html"
)

foreach ($file in $htmlFiles) {
    if (Test-Path $file) {
        Write-Host "📝 Actualizando: $file" -ForegroundColor Yellow
        
        # Leer contenido del archivo
        $content = Get-Content $file -Raw
        
        # Reemplazar todas las referencias al archivo problemático
        $updatedContent = $content -replace 'logo-512-adaptativo-circular\.png', 'logo-512.png'
        
        # Escribir el contenido actualizado
        Set-Content $file $updatedContent -Encoding UTF8
        
        Write-Host "✅ Completado: $file" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Archivo no encontrado: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 ACTUALIZACIÓN COMPLETADA" -ForegroundColor Cyan
Write-Host "📱 Ahora TODAS las páginas usan logo-512.png (sin fondo transparente)" -ForegroundColor Cyan
Write-Host "🚀 Elimina la PWA del iPhone y agrégala nuevamente para ver los cambios" -ForegroundColor Cyan
