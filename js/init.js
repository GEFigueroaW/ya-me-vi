// Inicialización del sistema
window.yaMeVi = {
    initialized: false,
    datosHistoricos: null,
    funcionesAnalisis: {},
    init: async function() {
        if (this.initialized) return;
        
        console.log('🚀 Inicializando YA ME VI...');
        
        // Definir funciones de análisis base
        this.funcionesAnalisis = {
            analizarSumaNumeros: function(datos) {
                console.log('🔄 Ejecutando analizarSumaNumeros');
                const resultado = {};
                Object.entries(datos).forEach(([sorteo, datosSorteo]) => {
                    if (!datosSorteo || !datosSorteo.numeros) return;
                    const numeros = datosSorteo.numeros;
                    const suma = numeros.reduce((a, b) => a + b, 0);
                    resultado[sorteo] = {
                        rangoMasFrecuente: [`${Math.floor(suma/50)*50}-${Math.floor(suma/50)*50+49}`],
                        detalle: `Suma total: ${suma}`,
                        numeros: numeros
                    };
                });
                return resultado;
            },
            
            analizarParesImpares: function(datos) {
                console.log('🔄 Ejecutando analizarParesImpares');
                const resultado = {};
                Object.entries(datos).forEach(([sorteo, datosSorteo]) => {
                    if (!datosSorteo || !datosSorteo.numeros) return;
                    const pares = datosSorteo.numeros.filter(n => n % 2 === 0).length;
                    const impares = datosSorteo.numeros.length - pares;
                    resultado[sorteo] = {
                        distribucionMasFrecuente: [`${pares}p-${impares}i`],
                        detalle: `${pares} pares, ${impares} impares`
                    };
                });
                return resultado;
            },
            
            analizarDecadaPorPosicion: function(datos) {
                console.log('🔄 Ejecutando analizarDecadaPorPosicion');
                const resultado = {};
                Object.entries(datos).forEach(([sorteo, datosSorteo]) => {
                    if (!datosSorteo || !datosSorteo.numeros) return;
                    const numeros = datosSorteo.numeros;
                    const decadasPorPosicion = numeros.map(num => {
                        if (num <= 10) return '1-10';
                        if (num <= 20) return '11-20';
                        if (num <= 30) return '21-30';
                        if (num <= 40) return '31-40';
                        if (num <= 50) return '41-50';
                        return '51-56';
                    });
                    resultado[sorteo] = {
                        decadasPorPosicion: decadasPorPosicion.map(d => ({ decadaMasFrecuente: d })),
                        detalle: 'Análisis por décadas completado'
                    };
                });
                return resultado;
            },
            
            generarPrediccionPorFrecuencia: function(datos) {
                if (!datos || !datos.numeros || !datos.numeros.length) {
                    return Array.from({length: 6}, () => Math.floor(Math.random() * 56) + 1).sort((a,b) => a - b);
                }
                const frecuencias = new Map();
                datos.numeros.forEach(n => frecuencias.set(n, (frecuencias.get(n) || 0) + 1));
                return Array.from(frecuencias.entries())
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 6)
                    .map(([num]) => num)
                    .sort((a,b) => a - b);
            }
        };

        // Exponer funciones globalmente
        Object.entries(this.funcionesAnalisis).forEach(([nombre, funcion]) => {
            window[nombre] = funcion;
        });

        // Cargar datos históricos
        try {
            this.datosHistoricos = await window.cargarDatosHistoricos('todos');
        } catch (error) {
            console.error('❌ Error cargando datos históricos:', error);
            this.datosHistoricos = {
                melate: { sorteos: [], numeros: [] },
                revancha: { sorteos: [], numeros: [] },
                revanchita: { sorteos: [], numeros: [] }
            };
        }

        this.initialized = true;
        console.log('✅ YA ME VI inicializado correctamente');
        
        // Inicializar rotación de imágenes de fondo
        this.initBackgroundRotation();
    },
    
    /**
     * Inicializar rotación de imágenes de fondo
     */
    initBackgroundRotation: function() {
        const background = document.getElementById('background');
        if (!background) {
            console.warn('⚠️ Elemento background no encontrado para rotación');
            return;
        }
        
        const images = [
            'assets/vg1.jpg',
            'assets/vg2.jpg', 
            'assets/vg3.jpg',
            'assets/vg4.jpg',
            'assets/vg5.jpg'
        ];
        
        let currentIndex = 0;
        
        // Función para cambiar imagen
        const changeBackground = () => {
            background.style.backgroundImage = `url(${images[currentIndex]})`;
            currentIndex = (currentIndex + 1) % images.length;
        };
        
        // Establecer imagen inicial
        changeBackground();
        
        // Cambiar imagen cada 5 segundos
        setInterval(changeBackground, 5000);
        
        console.log('🖼️ Rotación de imágenes de fondo iniciada');
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => window.yaMeVi.init());
