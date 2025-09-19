// Análisis de frecuencias de números ganadores del sorteo 4110
// Números ganadores: 3, 12, 15, 29, 36, 50

const fs = require('fs');
const path = require('path');

function analizarFrecuenciasGanadoras() {
    try {
        // Leer el archivo CSV de Melate
        const csvPath = path.join(__dirname, 'assets', 'Melate.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const lines = csvContent.trim().split('\n');
        
        console.log(`📁 Archivo CSV cargado: ${lines.length} líneas`);
        
        // Inicializar contadores de frecuencia
        const frecuencias = {};
        for (let i = 1; i <= 56; i++) {
            frecuencias[i] = 0;
        }
        
        let totalSorteos = 0;
        let totalNumeros = 0;
        
        // Procesar cada línea (saltar encabezado)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const columns = line.split(',');
            if (columns.length < 8) continue;
            
            const numeros = [];
            // Extraer números de las columnas 2-7 (R1-R6)
            for (let j = 2; j <= 7; j++) {
                const num = parseInt(columns[j]);
                if (!isNaN(num) && num >= 1 && num <= 56) {
                    numeros.push(num);
                    frecuencias[num]++;
                    totalNumeros++;
                }
            }
            
            if (numeros.length === 6) {
                totalSorteos++;
            }
        }
        
        console.log(`📊 Datos procesados: ${totalSorteos} sorteos, ${totalNumeros} números`);
        
        // Analizar números ganadores del sorteo 4110
        const numerosGanadores = [3, 12, 15, 29, 36, 50];
        console.log('\n🎯 Análisis de números ganadores del sorteo 4110:');
        
        numerosGanadores.forEach(num => {
            const freq = frecuencias[num];
            const porcentaje = ((freq / totalNumeros) * 100).toFixed(2);
            console.log(`Número ${num}: ${freq} apariciones (${porcentaje}%)`);
        });
        
        // Ordenar todos los números por frecuencia
        const numerosOrdenados = Object.entries(frecuencias)
            .map(([num, freq]) => ({
                numero: parseInt(num),
                frecuencia: freq,
                porcentaje: ((freq / totalNumeros) * 100).toFixed(2)
            }))
            .sort((a, b) => b.frecuencia - a.frecuencia);
        
        console.log('\n🔥 Top 10 números más frecuentes:');
        numerosOrdenados.slice(0, 10).forEach((item, index) => {
            const esGanador = numerosGanadores.includes(item.numero);
            const marca = esGanador ? '🎯' : '  ';
            console.log(`${marca} ${index + 1}. Número ${item.numero}: ${item.frecuencia} veces (${item.porcentaje}%)`);
        });
        
        console.log('\n❄️ Top 10 números menos frecuentes:');
        numerosOrdenados.slice(-10).reverse().forEach((item, index) => {
            const esGanador = numerosGanadores.includes(item.numero);
            const marca = esGanador ? '🎯' : '  ';
            console.log(`${marca} ${index + 1}. Número ${item.numero}: ${item.frecuencia} veces (${item.porcentaje}%)`);
        });
        
        // Verificar posición de números ganadores en el ranking
        console.log('\n📍 Posición de números ganadores en ranking de frecuencia:');
        numerosGanadores.forEach(numGanador => {
            const posicion = numerosOrdenados.findIndex(item => item.numero === numGanador) + 1;
            const item = numerosOrdenados.find(item => item.numero === numGanador);
            console.log(`Número ${numGanador}: Posición #${posicion} de 56 (${item.frecuencia} veces, ${item.porcentaje}%)`);
        });
        
        // Análisis de distribución
        console.log('\n📊 Distribución de números ganadores:');
        const promedio = totalNumeros / 56;
        console.log(`Promedio de apariciones por número: ${promedio.toFixed(2)}`);
        
        let sobrepromedio = 0;
        let bajopromedio = 0;
        let enpromedio = 0;
        
        numerosGanadores.forEach(num => {
            const freq = frecuencias[num];
            if (freq > promedio * 1.1) {
                sobrepromedio++;
            } else if (freq < promedio * 0.9) {
                bajopromedio++;
            } else {
                enpromedio++;
            }
        });
        
        console.log(`Números sobre el promedio: ${sobrepromedio}`);
        console.log(`Números en el promedio: ${enpromedio}`);
        console.log(`Números bajo el promedio: ${bajopromedio}`);
        
    } catch (error) {
        console.error('❌ Error analizando frecuencias:', error.message);
    }
}

analizarFrecuenciasGanadoras();