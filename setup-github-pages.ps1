# Configuración automática para GitHub Pages
Write-Host "🐙 CONFIGURANDO GITHUB PAGES PARA YA ME VI" -ForegroundColor Green

# Verificar si git está instalado
try {
    git --version | Out-Null
    Write-Host "✅ Git está instalado" -ForegroundColor Green
} catch {
    Write-Host "❌ Git no está instalado. Descárgalo desde: https://git-scm.com/" -ForegroundColor Red
    exit 1
}

# Verificar si estamos en un repositorio git
if (Test-Path ".git") {
    Write-Host "✅ Estamos en un repositorio Git" -ForegroundColor Green
} else {
    Write-Host "❌ No estamos en un repositorio Git" -ForegroundColor Red
    Write-Host "   Ejecuta: git init" -ForegroundColor Yellow
    exit 1
}

# Verificar remote origin
try {
    $remote = git remote get-url origin 2>$null
    Write-Host "✅ Remote configurado: $remote" -ForegroundColor Green
} catch {
    Write-Host "⚠️  No hay remote configurado" -ForegroundColor Yellow
    Write-Host "   Configura tu repositorio en GitHub primero" -ForegroundColor Yellow
}

# Preparar archivos para GitHub Pages
Write-Host "📁 Preparando archivos para GitHub Pages..." -ForegroundColor Yellow

# Crear .nojekyll para evitar problemas con archivos que empiecen con _
if (-not (Test-Path ".nojekyll")) {
    New-Item -ItemType File -Name ".nojekyll" -Force
    Write-Host "✅ Creado archivo .nojekyll" -ForegroundColor Green
}

# Verificar que index.html esté en el root
if (Test-Path "index.html") {
    Write-Host "✅ index.html está en el directorio raíz" -ForegroundColor Green
} else {
    Write-Host "❌ index.html no encontrado en el directorio raíz" -ForegroundColor Red
    exit 1
}

# Agregar cambios y hacer commit
Write-Host "📝 Preparando commit para GitHub Pages..." -ForegroundColor Yellow
git add .
$commitMessage = "Configuración para GitHub Pages - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git commit -m $commitMessage

# Push al repositorio
Write-Host "🚀 Subiendo cambios a GitHub..." -ForegroundColor Yellow
try {
    git push origin main
    Write-Host "✅ Cambios subidos exitosamente" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Error al subir cambios. Verifica tu autenticación con GitHub" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 ¡CONFIGURACIÓN COMPLETADA!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASOS MANUALES:" -ForegroundColor Yellow
Write-Host "1. Ve a: https://github.com/GEFigueroaW/ya-me-vi/settings/pages" -ForegroundColor White
Write-Host "2. En 'Source' selecciona: 'Deploy from a branch'" -ForegroundColor White
Write-Host "3. En 'Branch' selecciona: 'main' y '/ (root)'" -ForegroundColor White
Write-Host "4. Click 'Save'" -ForegroundColor White
Write-Host "5. Espera 5-10 minutos para que se active" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Tu sitio estará disponible en:" -ForegroundColor Cyan
Write-Host "   https://gefiguerow.github.io/ya-me-vi" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Luego usa esta URL en WebIntoApp para generar tu APK" -ForegroundColor Cyan
