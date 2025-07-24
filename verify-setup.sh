#!/bin/bash

# Script de verificación para YA ME VI Landing Page
# Verifica que todos los enlaces y archivos estén correctamente configurados

echo "🔍 Verificando configuración de YA ME VI Landing Page..."
echo "=================================================="

# Verificar archivos principales
echo "📁 Verificando archivos principales:"
files=("index.html" "app.html" "politica-privacidad.html" "aviso-legal.html")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - Existe"
    else
        echo "❌ $file - No encontrado"
    fi
done

echo ""

# Verificar estructura de directorios
echo "📂 Verificando directorios:"
dirs=("css" "js" "assets")
for dir in "${dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir/ - Existe"
    else
        echo "❌ $dir/ - No encontrado"
    fi
done

echo ""

# Verificar archivos críticos
echo "📄 Verificando archivos críticos:"
critical_files=("css/styles.css" "js/firebase-init.js" "assets/apple-touch-icon.png" "manifest.json")
for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - Existe"
    else
        echo "❌ $file - No encontrado"
    fi
done

echo ""

# Verificar enlaces en index.html
echo "🔗 Verificando enlaces en landing page (index.html):"
if [ -f "index.html" ]; then
    # Verificar enlaces a app.html
    app_links=$(grep -c 'href="app.html"' index.html)
    echo "✅ Enlaces a app.html: $app_links encontrados"
    
    # Verificar configuración AdSense
    adsense_client=$(grep -c 'ca-pub-2226536008153511' index.html)
    if [ $adsense_client -gt 0 ]; then
        echo "✅ Cliente AdSense configurado"
    else
        echo "❌ Cliente AdSense no encontrado"
    fi
    
    # Verificar ad units
    ad_units=$(grep -c 'adsbygoogle' index.html)
    echo "✅ Unidades de anuncios: $ad_units encontradas"
    
    # Verificar meta tags SEO
    meta_description=$(grep -c 'meta name="description"' index.html)
    meta_keywords=$(grep -c 'meta name="keywords"' index.html)
    if [ $meta_description -gt 0 ] && [ $meta_keywords -gt 0 ]; then
        echo "✅ Meta tags SEO configurados"
    else
        echo "❌ Meta tags SEO incompletos"
    fi
else
    echo "❌ index.html no encontrado"
fi

echo ""

# Verificar configuración de políticas
echo "📋 Verificando páginas de políticas:"
policy_files=("politica-privacidad.html" "aviso-legal.html")
for file in "${policy_files[@]}"; do
    if [ -f "$file" ]; then
        # Verificar que tengan enlaces actualizados
        index_links=$(grep -c 'href="index.html"' "$file")
        app_links=$(grep -c 'href="app.html"' "$file")
        if [ $index_links -gt 0 ] && [ $app_links -gt 0 ]; then
            echo "✅ $file - Enlaces actualizados"
        else
            echo "⚠️  $file - Enlaces pueden necesitar actualización"
        fi
    fi
done

echo ""

# Verificar configuración PWA
echo "📱 Verificando configuración PWA:"
if [ -f "manifest.json" ]; then
    echo "✅ manifest.json existe"
fi

if [ -f "service-worker.js" ]; then
    echo "✅ service-worker.js existe"
fi

echo ""

# Verificar archivos de documentación
echo "📚 Verificando documentación:"
doc_files=("LANDING-PAGE-README.md" "ADSENSE-SETUP.md")
for file in "${doc_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - Existe"
    else
        echo "❌ $file - No encontrado"
    fi
done

echo ""

# Estadísticas de contenido
echo "📊 Estadísticas de contenido (index.html):"
if [ -f "index.html" ]; then
    word_count=$(wc -w < index.html)
    line_count=$(wc -l < index.html)
    echo "✅ Palabras aproximadas: $word_count"
    echo "✅ Líneas de código: $line_count"
    
    # Verificar secciones principales
    sections=("hero" "caracteristicas" "demo" "contacto")
    for section in "${sections[@]}"; do
        if grep -q "id=\"$section\"" index.html; then
            echo "✅ Sección '$section' encontrada"
        else
            echo "⚠️  Sección '$section' no encontrada o sin ID"
        fi
    done
fi

echo ""

# Recomendaciones finales
echo "💡 Recomendaciones finales:"
echo "1. ✅ Verificar que todos los enlaces funcionen en navegador"
echo "2. ✅ Probar responsividad en dispositivos móviles"
echo "3. ✅ Configurar AdSense con slots reales antes de producción"
echo "4. ✅ Verificar políticas de privacidad incluyan información de AdSense"
echo "5. ✅ Probar velocidad de carga con herramientas como PageSpeed Insights"

echo ""
echo "🎉 Verificación completada!"
echo "=================================================="
