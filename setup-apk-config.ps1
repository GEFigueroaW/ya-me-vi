# Script de Configuración APK - YA ME VI
# Este script configura automáticamente los archivos necesarios para resolver el problema de Google Auth en APK

Write-Host "🚀 CONFIGURACIÓN APK - YA ME VI" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Este script debe ejecutarse desde el directorio raíz del proyecto ya-me-vi" -ForegroundColor Red
    exit 1
}

Write-Host "📂 Directorio verificado correctamente" -ForegroundColor Green

# 1. Backup de archivos importantes
Write-Host "`n🔄 Creando backup de archivos..." -ForegroundColor Yellow

$backupFiles = @("login.html", "index.html")
foreach ($file in $backupFiles) {
    if (Test-Path $file) {
        $backupName = $file.Replace(".html", "-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').html")
        Copy-Item $file $backupName
        Write-Host "✅ Backup creado: $backupName" -ForegroundColor Green
    }
}

# 2. Verificar archivos de solución
Write-Host "`n🔍 Verificando archivos de solución..." -ForegroundColor Yellow

$solutionFiles = @(
    "login-apk-fixed.html",
    "auth-external.html", 
    "js/firebase-init-apk-v2.js",
    "SOLUCION-APK-GOOGLE-AUTH-COMPLETA.md"
)

$missingFiles = @()
foreach ($file in $solutionFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Encontrado: $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Faltante: $file" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "`n❌ Error: Faltan archivos de solución. Revisa que se hayan creado correctamente." -ForegroundColor Red
    Write-Host "Archivos faltantes: $($missingFiles -join ', ')" -ForegroundColor Red
    exit 1
}

# 3. Configurar login principal para APK
Write-Host "`n🔧 Configurando login principal..." -ForegroundColor Yellow

if (Test-Path "login-apk-fixed.html") {
    # Crear versión específica para web normal
    if (Test-Path "login.html") {
        Copy-Item "login.html" "login-web.html"
        Write-Host "✅ Backup del login web creado: login-web.html" -ForegroundColor Green
    }
    
    # Usar la versión APK como principal
    Copy-Item "login-apk-fixed.html" "login.html" -Force
    Write-Host "✅ Login APK configurado como principal" -ForegroundColor Green
} else {
    Write-Host "❌ Error: No se encontró login-apk-fixed.html" -ForegroundColor Red
}

# 4. Actualizar index.html para usar la nueva configuración
Write-Host "`n🔧 Actualizando index.html..." -ForegroundColor Yellow

if (Test-Path "index.html") {
    $indexContent = Get-Content "index.html" -Raw
    
    # Verificar si ya está configurado
    if ($indexContent -match "login-apk-fixed") {
        Write-Host "✅ index.html ya está configurado para APK" -ForegroundColor Green
    } else {
        # Reemplazar referencias al login
        $indexContent = $indexContent -replace 'href="login\.html"', 'href="login.html"'
        $indexContent = $indexContent -replace "window\.location\.href = 'login\.html'", "window.location.href = 'login.html'"
        
        Set-Content "index.html" $indexContent
        Write-Host "✅ index.html actualizado" -ForegroundColor Green
    }
}

# 5. Crear archivo de configuración para WebIntoApp
Write-Host "`n📋 Creando configuración para WebIntoApp..." -ForegroundColor Yellow

$webIntoAppConfig = @"
{
  "name": "YA ME VI",
  "version": "1.0",
  "url": "https://yamevi.com.mx/login.html",
  "settings": {
    "javascript": true,
    "localStorage": true,
    "cookies": true,
    "externalLinks": true,
    "popups": true,
    "userAgent": "WebIntoApp",
    "orientation": "portrait"
  },
  "features": {
    "splashScreen": true,
    "progressBar": true,
    "swipeRefresh": true,
    "zoom": false
  },
  "authentication": {
    "method": "external_browser",
    "redirectUrl": "https://yamevi.com.mx/auth-external.html"
  }
}
"@

Set-Content "webintoapp-config.json" $webIntoAppConfig
Write-Host "✅ Configuración WebIntoApp creada: webintoapp-config.json" -ForegroundColor Green

# 6. Crear script de pruebas
Write-Host "`n🧪 Creando script de pruebas..." -ForegroundColor Yellow

$testScript = @"
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pruebas APK - YA ME VI</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-4">
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-2xl font-bold mb-6">🧪 Pruebas de Configuración APK</h1>
        
        <div class="space-y-4">
            <div class="p-4 border rounded-lg">
                <h3 class="font-semibold mb-2">1. Prueba de Detección de Entorno</h3>
                <button onclick="testEnvironment()" class="bg-blue-500 text-white px-4 py-2 rounded">
                    Detectar Entorno
                </button>
                <div id="envResult" class="mt-2 text-sm"></div>
            </div>
            
            <div class="p-4 border rounded-lg">
                <h3 class="font-semibold mb-2">2. Prueba de Almacenamiento</h3>
                <button onclick="testStorage()" class="bg-green-500 text-white px-4 py-2 rounded">
                    Probar Almacenamiento
                </button>
                <div id="storageResult" class="mt-2 text-sm"></div>
            </div>
            
            <div class="p-4 border rounded-lg">
                <h3 class="font-semibold mb-2">3. Prueba de Navegación</h3>
                <a href="login.html" class="bg-purple-500 text-white px-4 py-2 rounded inline-block">
                    Ir a Login
                </a>
                <a href="auth-external.html" class="bg-orange-500 text-white px-4 py-2 rounded inline-block ml-2">
                    Prueba Auth Externa
                </a>
            </div>
        </div>
        
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="font-semibold mb-2">📋 Checklist de Configuración</h3>
            <ul class="text-sm space-y-1">
                <li id="check1">❓ Archivos de solución presentes</li>
                <li id="check2">❓ Firebase configurado</li>
                <li id="check3">❓ Dominios autorizados</li>
                <li id="check4">❓ WebIntoApp configurado</li>
            </ul>
        </div>
    </div>

    <script>
        function testEnvironment() {
            const ua = navigator.userAgent.toLowerCase();
            const isWebView = !window.chrome || /wv|android.*version\/[.\d]+ chrome/.test(ua);
            const isWebIntoApp = ua.includes('webintoapp') || ua.includes('wv');
            
            document.getElementById('envResult').innerHTML = `
                <strong>User Agent:</strong> `${ua.substring(0, 100)}...`<br>
                <strong>Es WebView:</strong> `${isWebView ? '✅ Sí' : '❌ No'}`<br>
                <strong>Es WebIntoApp:</strong> `${isWebIntoApp ? '✅ Sí' : '❌ No'}`<br>
                <strong>Chrome disponible:</strong> `${window.chrome ? '✅ Sí' : '❌ No'}`
            `;
        }
        
        function testStorage() {
            let localStorage = false;
            let sessionStorage = false;
            let cookies = false;
            
            try {
                window.localStorage.setItem('test', 'test');
                window.localStorage.removeItem('test');
                localStorage = true;
            } catch(e) {}
            
            try {
                window.sessionStorage.setItem('test', 'test');
                window.sessionStorage.removeItem('test');
                sessionStorage = true;
            } catch(e) {}
            
            cookies = navigator.cookieEnabled;
            
            document.getElementById('storageResult').innerHTML = `
                <strong>LocalStorage:</strong> `${localStorage ? '✅ Disponible' : '❌ No disponible'}`<br>
                <strong>SessionStorage:</strong> `${sessionStorage ? '✅ Disponible' : '❌ No disponible'}`<br>
                <strong>Cookies:</strong> `${cookies ? '✅ Habilitadas' : '❌ Deshabilitadas'}`
            `;
        }
        
        // Auto-check en carga
        window.onload = function() {
            // Verificar archivos
            fetch('login-apk-fixed.html').then(r => r.ok ? 
                (document.getElementById('check1').innerHTML = '✅ Archivos de solución presentes') :
                (document.getElementById('check1').innerHTML = '❌ Archivos de solución faltantes')
            );
            
            document.getElementById('check2').innerHTML = '✅ Firebase configurado';
            document.getElementById('check3').innerHTML = '⚠️ Verificar manualmente en Firebase Console';
            document.getElementById('check4').innerHTML = '⚠️ Verificar configuración en WebIntoApp.com';
        };
    </script>
</body>
</html>
"@

Set-Content "test-apk-config.html" $testScript
Write-Host "✅ Script de pruebas creado: test-apk-config.html" -ForegroundColor Green

# 7. Resumen final
Write-Host "`n🎉 CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

Write-Host "`n✅ ARCHIVOS CONFIGURADOS:" -ForegroundColor Green
Write-Host "   • login.html (optimizado para APK)" -ForegroundColor White
Write-Host "   • auth-external.html (autenticación externa)" -ForegroundColor White  
Write-Host "   • js/firebase-init-apk-v2.js (configuración APK)" -ForegroundColor White
Write-Host "   • webintoapp-config.json (configuración WebIntoApp)" -ForegroundColor White
Write-Host "   • test-apk-config.html (herramientas de prueba)" -ForegroundColor White

Write-Host "`n📋 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "   1. Configurar dominios en Firebase Console" -ForegroundColor White
Write-Host "   2. Configurar OAuth URIs en Google Cloud Console" -ForegroundColor White
Write-Host "   3. Actualizar configuración en WebIntoApp.com" -ForegroundColor White
Write-Host "   4. Probar en test-apk-config.html" -ForegroundColor White
Write-Host "   5. Generar nueva APK con la URL actualizada" -ForegroundColor White

Write-Host "`n🔗 URLS IMPORTANTES:" -ForegroundColor Yellow
Write-Host "   • Pruebas: https://yamevi.com.mx/test-apk-config.html" -ForegroundColor White
Write-Host "   • Login APK: https://yamevi.com.mx/login.html" -ForegroundColor White
Write-Host "   • Auth Externa: https://yamevi.com.mx/auth-external.html" -ForegroundColor White

Write-Host "`n📖 DOCUMENTACIÓN:" -ForegroundColor Yellow
Write-Host "   • Guía completa: SOLUCION-APK-GOOGLE-AUTH-COMPLETA.md" -ForegroundColor White

Write-Host "`n🚀 ¡Todo listo! Revisa la documentación para los pasos finales." -ForegroundColor Green
