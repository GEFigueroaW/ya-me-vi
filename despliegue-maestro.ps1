# YA ME VI - Script Maestro de Despliegue
# Este script te da múltiples opciones para desplegar tu aplicación

param(
    [string]$Opcion = ""
)

function Show-Menu {
    Write-Host ""
    Write-Host "🚀 YA ME VI - OPCIONES DE DESPLIEGUE" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. 🔥 Firebase Hosting (Recomendado)" -ForegroundColor Yellow
    Write-Host "2. 🐙 GitHub Pages (Más Rápido)" -ForegroundColor Yellow  
    Write-Host "3. 🔍 Verificar Estado Actual" -ForegroundColor Yellow
    Write-Host "4. 📋 Ver URLs Disponibles" -ForegroundColor Yellow
    Write-Host "5. 🛠️  Instalar Dependencias" -ForegroundColor Yellow
    Write-Host "0. ❌ Salir" -ForegroundColor Red
    Write-Host ""
}

function Install-Dependencies {
    Write-Host "🛠️  INSTALANDO DEPENDENCIAS..." -ForegroundColor Green
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version 2>$null
        Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Node.js no encontrado" -ForegroundColor Red
        Write-Host "📥 Descarga Node.js desde: https://nodejs.org/" -ForegroundColor Cyan
        Start-Process "https://nodejs.org/"
        return
    }
    
    # Instalar Firebase CLI
    Write-Host "📦 Instalando Firebase CLI..." -ForegroundColor Yellow
    npm install -g firebase-tools
    
    Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
}

function Deploy-Firebase {
    Write-Host "🔥 DESPLEGANDO EN FIREBASE HOSTING..." -ForegroundColor Green
    
    # Verificar Firebase CLI
    try {
        firebase --version | Out-Null
    } catch {
        Write-Host "❌ Firebase CLI no encontrado. Ejecuta la opción 5 primero." -ForegroundColor Red
        return
    }
    
    # Login si es necesario
    try {
        firebase projects:list | Out-Null
    } catch {
        Write-Host "🔑 Iniciando sesión en Firebase..." -ForegroundColor Yellow
        firebase login
    }
    
    # Usar proyecto ya-me-vi
    firebase use ya-me-vi
    
    # Desplegar
    Write-Host "🚀 Desplegando..." -ForegroundColor Yellow
    firebase deploy --only hosting
    
    Write-Host ""
    Write-Host "🎉 ¡FIREBASE DESPLEGADO!" -ForegroundColor Green
    Write-Host "🌐 URL: https://ya-me-vi.firebaseapp.com" -ForegroundColor Cyan
}

function Setup-GitHubPages {
    Write-Host "🐙 CONFIGURANDO GITHUB PAGES..." -ForegroundColor Green
    
    # Verificar git
    try {
        git --version | Out-Null
    } catch {
        Write-Host "❌ Git no encontrado. Descarga desde: https://git-scm.com/" -ForegroundColor Red
        Start-Process "https://git-scm.com/"
        return
    }
    
    # Crear .nojekyll
    if (-not (Test-Path ".nojekyll")) {
        New-Item -ItemType File -Name ".nojekyll" -Force
        Write-Host "✅ Archivo .nojekyll creado" -ForegroundColor Green
    }
    
    # Commit y push
    git add .
    git commit -m "Setup GitHub Pages - $(Get-Date -Format 'yyyy-MM-dd')"
    git push origin main
    
    Write-Host ""
    Write-Host "✅ Archivos subidos a GitHub" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 PASOS MANUALES FINALES:" -ForegroundColor Yellow
    Write-Host "1. Ve a: https://github.com/GEFigueroaW/ya-me-vi/settings/pages" -ForegroundColor White
    Write-Host "2. Source: 'Deploy from a branch'" -ForegroundColor White
    Write-Host "3. Branch: 'main' / '(root)'" -ForegroundColor White
    Write-Host "4. Click 'Save'" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Tu sitio estará en: https://gefiguerow.github.io/ya-me-vi" -ForegroundColor Cyan
}

function Check-Status {
    Write-Host "🔍 VERIFICANDO ESTADO..." -ForegroundColor Green
    
    # URLs a verificar
    $urls = @(
        "https://ya-me-vi.firebaseapp.com",
        "https://gefiguerow.github.io/ya-me-vi"
    )
    
    foreach ($url in $urls) {
        try {
            $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 5
            Write-Host "✅ $url - FUNCIONANDO" -ForegroundColor Green
        } catch {
            Write-Host "❌ $url - NO DISPONIBLE" -ForegroundColor Red
        }
    }
}

function Show-URLs {
    Write-Host "📋 URLS DISPONIBLES PARA WEBINTOAPP:" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔥 Firebase Hosting:" -ForegroundColor Yellow
    Write-Host "   https://ya-me-vi.firebaseapp.com" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🐙 GitHub Pages:" -ForegroundColor Yellow  
    Write-Host "   https://gefiguerow.github.io/ya-me-vi" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 CONSEJOS:" -ForegroundColor Yellow
    Write-Host "• Usa Firebase para mejor rendimiento" -ForegroundColor White
    Write-Host "• Usa GitHub Pages si Firebase falla" -ForegroundColor White
    Write-Host "• Verifica que la URL funcione antes de generar APK" -ForegroundColor White
}

# Menú principal
do {
    if ($Opcion -eq "") {
        Show-Menu
        $Opcion = Read-Host "Elige una opción"
    }
    
    switch ($Opcion) {
        "1" { Deploy-Firebase }
        "2" { Setup-GitHubPages }
        "3" { Check-Status }
        "4" { Show-URLs }
        "5" { Install-Dependencies }
        "0" { Write-Host "👋 ¡Hasta luego!" -ForegroundColor Green; exit }
        default { Write-Host "❌ Opción inválida" -ForegroundColor Red }
    }
    
    $Opcion = ""
    Write-Host ""
    Read-Host "Presiona ENTER para continuar"
    
} while ($true)
