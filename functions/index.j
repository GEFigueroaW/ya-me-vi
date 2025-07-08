// functions/index.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cheerio = require('cheerio'); // Librería para parsear HTML

// Inicializa Firebase Admin SDK (asegúrate de que tu proyecto Firebase esté inicializado)
admin.initializeApp();
const db = admin.firestore();

// Función HTTP callable para hacer scraping de los resultados de Melate
// Se invocará desde tu frontend cuando necesites actualizar los datos.
exports.scrapeMelateResults = functions.https.onCall(async (data, context) => {
    // Opcional: Requiere autenticación para llamar a esta función.
    // Esto es buena práctica para evitar que usuarios no autorizados la invoquen.
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Debes estar autenticado para llamar a esta función.'
        );
    }

    const targetUrl = 'https://www.loterianacional.gob.mx/Melate/Resultados';
    const results = [];

    try {
        // Realiza la petición HTTP para obtener el contenido de la página
        const response = await axios.get(targetUrl);
        const $ = cheerio.load(response.data); // Carga el HTML con Cheerio

        // Busca la tabla que contiene los "Últimos 15 sorteos"
        // Este selector busca un elemento 'table' que esté directamente después de un 'h4'
        // que contenga el texto "Últimos 15 sorteos".
        let table = $('h4:contains("Últimos 15 sorteos")').next('table');

        // Si el selector anterior no encuentra la tabla (por cambios en la estructura de la web),
        // intenta buscar en todas las tablas y filtra por contenido.
        if (!table.length) {
            console.warn('No se encontró la tabla "Últimos 15 sorteos" con el selector directo. Buscando en todas las tablas.');
            const allTables = $('table');
            let foundTable = null;
            allTables.each((i, elem) => {
                const headerText = $(elem).prevAll('h4').first().text(); // Busca un h4 previo
                // Si el h4 previo contiene el texto O la tabla en sí contiene los encabezados esperados
                if (headerText.includes('Últimos 15 sorteos') || ($(elem).text().includes('Sorteo') && $(elem).text().includes('Fecha') && $(elem).text().includes('Combinación Ganadora'))) {
                    foundTable = elem;
                    return false; // Rompe el bucle una vez encontrada
                }
            });
            if (foundTable) {
                table = $(foundTable);
            } else {
                // Si no se encuentra ninguna tabla adecuada, lanza un error
                throw new Error('No se encontró una tabla de resultados adecuada en la página.');
            }
        }

        // Itera sobre las filas de la tabla (dentro del tbody, ignorando el encabezado si existe)
        table.find('tbody tr').each((i, row) => {
            const columns = $(row).find('td');
            if (columns.length >= 3) { // Asegura que haya suficientes columnas (Sorteo, Fecha, Combinación)
                const sorteo = $(columns[0]).text().trim();
                const fecha = $(columns[1]).text().trim();
                // Usar .html() para obtener el contenido HTML (incluyendo <br> si los hay)
                const combinacionRaw = $(columns[2]).html().trim();

                // Divide las combinaciones de Melate, Revancha y Revanchita
                // Asume que están separadas por <br> tags dentro de la misma celda
                const combinacionesHtml = combinacionRaw.split('<br>').map(c => c.trim()).filter(c => c);

                let melateNumbers = [];
                let revanchaNumbers = [];
                let revanchitaNumbers = [];

                if (combinacionesHtml.length >= 1) {
                    // Extrae números, maneja el caso de número adicional (ej. -36)
                    melateNumbers = combinacionesHtml[0].split(' ').map(s => parseInt(s.split('-')[0])).filter(n => !isNaN(n));
                }
                if (combinacionesHtml.length >= 2) {
                    revanchaNumbers = combinacionesHtml[1].split(' ').map(Number).filter(n => !isNaN(n));
                }
                if (combinacionesHtml.length >= 3) {
                    revanchitaNumbers = combinacionesHtml[2].split(' ').map(Number).filter(n => !isNaN(n));
                }

                // Ordena los números para consistencia
                melateNumbers.sort((a, b) => a - b);
                revanchaNumbers.sort((a, b) => a - b);
                revanchitaNumbers.sort((a, b) => a - b);

                results.push({
                    sorteo: sorteo,
                    fecha: fecha, // Mantiene la fecha original en string
                    melate: melateNumbers,
                    revancha: revanchaNumbers,
                    revanchita: revanchitaNumbers,
                    // Convierte la fecha string (DD/MM/YYYY) a un Timestamp de Firestore
                    timestamp: admin.firestore.Timestamp.fromDate(new Date(fecha.split('/')[2], fecha.split('/')[1] - 1, fecha.split('/')[0]))
                });
            }
        });

        // Almacena los resultados en Firestore usando un "batch" para eficiencia
        const batch = db.batch();
        const collectionRef = db.collection('melate_history');

        for (const draw of results) {
            // Usa el número de sorteo como ID del documento para evitar duplicados y facilitar búsquedas
            const docRef = collectionRef.doc(draw.sorteo);
            batch.set(docRef, draw);
        }
        await batch.commit(); // Ejecuta todas las operaciones de escritura en un solo paso

        return { status: 'success', message: `Se rasparon y almacenaron ${results.length} sorteos.`, data: results };

    } catch (error) {
        console.error('Error al raspar resultados de Melate:', error);
        throw new functions.https.HttpsError(
            'internal',
            'Fallo al raspar y almacenar los resultados de Melate.',
            error.message
        );
    }
});
