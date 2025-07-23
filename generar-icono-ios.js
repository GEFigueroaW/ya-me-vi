// Generador de icono iOS sin transparencia usando Node.js y Canvas
const fs = require('fs');
const { createCanvas } = require('canvas');

// Configuración del icono
const CONFIG = {
    size: 180,
    backgroundColor: '#00B44F', // Verde YA ME VI
    textColor: '#FFFFFF',
    text: 'YA\nME\nVI',
    fontSize: 24,
    fontFamily: 'Arial'
};

function generarIconoIOS() {
    console.log('🎨 Generando icono iOS sin transparencia...');
    
    // Crear canvas
    const canvas = createCanvas(CONFIG.size, CONFIG.size);
    const ctx = canvas.getContext('2d');
    
    // Fondo completamente opaco
    ctx.fillStyle = CONFIG.backgroundColor;
    ctx.fillRect(0, 0, CONFIG.size, CONFIG.size);
    
    // Configurar texto
    ctx.fillStyle = CONFIG.textColor;
    ctx.font = `bold ${CONFIG.fontSize}px ${CONFIG.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Dibujar texto línea por línea
    const lines = CONFIG.text.split('\n');
    const lineHeight = CONFIG.fontSize + 5;
    const startY = (CONFIG.size / 2) - ((lines.length - 1) * lineHeight / 2);
    
    lines.forEach((line, index) => {
        ctx.fillText(line, CONFIG.size / 2, startY + (index * lineHeight));
    });
    
    // Guardar archivo
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('assets/apple-touch-icon-nuevo.png', buffer);
    
    console.log('✅ Icono generado: assets/apple-touch-icon-nuevo.png');
    console.log(`📐 Tamaño: ${CONFIG.size}x${CONFIG.size}px`);
    console.log(`🎨 Fondo: ${CONFIG.backgroundColor} (100% opaco)`);
    console.log('🔄 Ahora ejecuta: mv assets/apple-touch-icon-nuevo.png assets/apple-touch-icon.png');
}

// Versión alternativa usando solo navegador
function generarIconoHTML5() {
    return `
<!DOCTYPE html>
<html>
<head><title>Generador de Icono iOS</title></head>
<body>
    <canvas id="canvas" width="180" height="180"></canvas>
    <br>
    <button onclick="descargar()">Descargar PNG</button>
    
    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        // Fondo sólido verde
        ctx.fillStyle = '#00B44F';
        ctx.fillRect(0, 0, 180, 180);
        
        // Texto blanco
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Texto en 3 líneas
        ctx.fillText('YA', 90, 60);
        ctx.fillText('ME', 90, 90);
        ctx.fillText('VI', 90, 120);
        
        function descargar() {
            const link = document.createElement('a');
            link.download = 'apple-touch-icon-nuevo.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    </script>
</body>
</html>`;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    try {
        generarIconoIOS();
    } catch (error) {
        console.log('⚠️ Canvas no disponible. Generando versión HTML...');
        fs.writeFileSync('generar-icono-ios.html', generarIconoHTML5());
        console.log('✅ Archivo HTML generado: generar-icono-ios.html');
        console.log('📖 Abre este archivo en el navegador y descarga el icono');
    }
}

module.exports = { generarIconoIOS, generarIconoHTML5 };
