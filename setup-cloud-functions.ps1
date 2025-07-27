# Script de Instalación Completa - YA ME VI Cloud Functions
# Versión: 1.0.0

Write-Host "🚀 INSTALACIÓN COMPLETA - YA ME VI CLOUD FUNCTIONS" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""

# Función para verificar si un comando existe
function Test-Command($command) {
    try {
        if (Get-Command $command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

# Paso 1: Verificar/Instalar Node.js
Write-Host "📋 Paso 1: Verificando Node.js..." -ForegroundColor Yellow

if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "✅ Node.js ya está instalado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    Write-Host "🔽 Descargando Node.js LTS..." -ForegroundColor Yellow
    
    $nodeUrl = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
    $nodeInstaller = "$env:TEMP\node-installer.msi"
    
    try {
        Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller
        Write-Host "📦 Instalando Node.js..." -ForegroundColor Yellow
        Start-Process msiexec.exe -Wait -ArgumentList "/i $nodeInstaller /quiet"
        
        # Actualizar PATH en la sesión actual
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
        
        Write-Host "✅ Node.js instalado correctamente" -ForegroundColor Green
        Remove-Item $nodeInstaller -Force
    }
    catch {
        Write-Host "❌ Error instalando Node.js: $_" -ForegroundColor Red
        Write-Host "👉 Por favor instala Node.js manualmente desde: https://nodejs.org" -ForegroundColor Yellow
        exit 1
    }
}

# Paso 2: Verificar/Instalar Firebase CLI
Write-Host ""
Write-Host "📋 Paso 2: Verificando Firebase CLI..." -ForegroundColor Yellow

if (Test-Command "firebase") {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI ya está instalado: $firebaseVersion" -ForegroundColor Green
} else {
    Write-Host "🔽 Instalando Firebase CLI..." -ForegroundColor Yellow
    try {
        npm install -g firebase-tools
        Write-Host "✅ Firebase CLI instalado correctamente" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Error instalando Firebase CLI: $_" -ForegroundColor Red
        exit 1
    }
}

# Paso 3: Instalar dependencias de Cloud Functions
Write-Host ""
Write-Host "📋 Paso 3: Instalando dependencias de Cloud Functions..." -ForegroundColor Yellow

$functionsPath = Join-Path $PSScriptRoot "functions"

if (Test-Path $functionsPath) {
    Set-Location $functionsPath
    
    try {
        npm install
        Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Error instalando dependencias: $_" -ForegroundColor Red
        exit 1
    }
    
    Set-Location $PSScriptRoot
} else {
    Write-Host "❌ Carpeta functions no encontrada" -ForegroundColor Red
    exit 1
}

# Paso 4: Configurar Firebase (login)
Write-Host ""
Write-Host "📋 Paso 4: Configurando Firebase..." -ForegroundColor Yellow

try {
    Write-Host "🔑 Iniciando sesión en Firebase..." -ForegroundColor Yellow
    firebase login --interactive
    
    Write-Host "🎯 Seleccionando proyecto..." -ForegroundColor Yellow
    firebase use ya-me-vi
    
    Write-Host "✅ Firebase configurado correctamente" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error configurando Firebase: $_" -ForegroundColor Red
    Write-Host "👉 Por favor ejecuta manualmente:" -ForegroundColor Yellow
    Write-Host "   firebase login" -ForegroundColor Cyan
    Write-Host "   firebase use ya-me-vi" -ForegroundColor Cyan
}

# Paso 5: Configurar variables de entorno
Write-Host ""
Write-Host "📋 Paso 5: Configuración de variables de entorno..." -ForegroundColor Yellow

Write-Host "⚠️  IMPORTANTE: Necesitas configurar SendGrid API Key" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para configurar SendGrid, ejecuta:" -ForegroundColor Cyan
Write-Host 'firebase functions:config:set sendgrid.key="TU_API_KEY_DE_SENDGRID"' -ForegroundColor Cyan
Write-Host ""
Write-Host "Para obtener tu API Key de SendGrid:" -ForegroundColor Yellow
Write-Host "1. Ve a https://sendgrid.com" -ForegroundColor White
Write-Host "2. Crea una cuenta (gratis)" -ForegroundColor White
Write-Host "3. Ve a Settings > API Keys" -ForegroundColor White
Write-Host "4. Crea una nueva API Key con permisos de Mail Send" -ForegroundColor White

# Paso 6: Verificar configuración
Write-Host ""
Write-Host "📋 Paso 6: Verificando configuración..." -ForegroundColor Yellow

try {
    $config = firebase functions:config:get 2>$null
    if ($config -match "sendgrid") {
        Write-Host "✅ Configuración de SendGrid encontrada" -ForegroundColor Green
    } else {
        Write-Host "⚠️  SendGrid no configurado aún" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "⚠️  No se pudo verificar la configuración" -ForegroundColor Yellow
}

# Paso 7: Mostrar próximos pasos
Write-Host ""
Write-Host "🎉 INSTALACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos pasos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configurar SendGrid API Key:" -ForegroundColor White
Write-Host '   firebase functions:config:set sendgrid.key="TU_API_KEY"' -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Desplegar las funciones:" -ForegroundColor White
Write-Host "   firebase deploy --only functions" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Desplegar reglas de Firestore:" -ForegroundColor White
Write-Host "   firebase deploy --only firestore:rules" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Verificar en la consola de Firebase:" -ForegroundColor White
Write-Host "   https://console.firebase.google.com/project/ya-me-vi" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 Comandos útiles:" -ForegroundColor Yellow
Write-Host "   firebase emulators:start      # Probar localmente" -ForegroundColor Cyan
Write-Host "   firebase functions:log        # Ver logs" -ForegroundColor Cyan
Write-Host "   firebase deploy --help        # Ver opciones de deploy" -ForegroundColor Cyan
Write-Host ""

Read-Host "Presiona Enter para continuar"
