# Script para actualizar todas las páginas HTML con la solución definitiva del icono iOS
# Este script reemplaza apple-touch-icon por apple-touch-icon-precomposed para eliminar el marco blanco

$pages = @(
    "analisis.html",
    "combinacion.html", 
    "sugeridas.html",
    "login.html",
    "register.html",
    "recover.html",
    "login-email.html",
    "admin.html"
)

$oldPattern = '  <!-- iOS Touch Icons -->'
$newPattern = '  <!-- iOS Touch Icons - SOLUCIÓN DEFINITIVA SIN MARCO -->'

$oldIconPattern = '  <link rel="apple-touch-icon"'
$newIconPattern = '  <link rel="apple-touch-icon-precomposed"'

foreach ($page in $pages) {
    $filePath = "e:\Usuarios\gfigueroa\Desktop\ya-me-vi\$page"
    
    if (Test-Path $filePath) {
        Write-Host "🔧 Actualizando $page..." -ForegroundColor Yellow
        
        # Leer contenido del archivo
        $content = Get-Content $filePath -Raw
        
        # Reemplazar comentario
        $content = $content -replace [regex]::Escape($oldPattern), $newPattern
        
        # Reemplazar todos los apple-touch-icon por apple-touch-icon-precomposed
        $content = $content -replace 'rel="apple-touch-icon"', 'rel="apple-touch-icon-precomposed"'
        
        # Agregar fallback después de las líneas precomposed
        $fallbackLine = '  
  <!-- Fallback para compatibilidad -->
  <link rel="apple-touch-icon" href="assets/logo-512.png">'
        
        # Buscar la última línea de apple-touch-icon-precomposed y agregar fallback
        $lines = $content -split "`n"
        $newLines = @()
        $lastPrecomposedIndex = -1
        
        for ($i = 0; $i -lt $lines.Length; $i++) {
            $newLines += $lines[$i]
            if ($lines[$i] -match 'apple-touch-icon-precomposed.*sizes="180x180"') {
                $lastPrecomposedIndex = $i
            }
        }
        
        if ($lastPrecomposedIndex -ge 0) {
            $newLines = $newLines[0..$lastPrecomposedIndex] + $fallbackLine.Split("`n") + $newLines[($lastPrecomposedIndex + 1)..($newLines.Length - 1)]
        }
        
        # Escribir contenido actualizado
        $newContent = $newLines -join "`n"
        Set-Content $filePath $newContent -Encoding UTF8
        
        Write-Host "✅ $page actualizado correctamente" -ForegroundColor Green
    } else {
        Write-Host "❌ No se encontró $page" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Actualización completada!" -ForegroundColor Cyan
Write-Host "📱 Ahora todas las páginas usan apple-touch-icon-precomposed" -ForegroundColor Cyan
Write-Host "🍎 Esto debería eliminar el marco blanco en iOS Safari" -ForegroundColor Cyan
