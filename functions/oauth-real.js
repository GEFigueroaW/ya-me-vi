const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');

// Inicializar Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

// Configuración OAuth de Google
const GOOGLE_CLIENT_ID = "259155896831-your-real-client-id.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "GOCSPX-your-real-client-secret";
const REDIRECT_URI = "https://yamevi.com.mx/oauth-return.html";

/**
 * Cloud Function para intercambiar código OAuth por tokens reales
 * Endpoint: https://us-central1-yamevi-53e6a.cloudfunctions.net/exchangeOAuthCode
 */
exports.exchangeOAuthCode = functions.https.onRequest(async (req, res) => {
    // Configurar CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).send('');
        return;
    }
    
    try {
        const { code, state } = req.body;
        
        console.log('🔍 Intercambiando código OAuth:', { code: !!code, state });
        
        if (!code) {
            return res.status(400).json({ error: 'Código OAuth requerido' });
        }
        
        // Configurar cliente OAuth2
        const oauth2Client = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            REDIRECT_URI
        );
        
        // Intercambiar código por tokens
        console.log('📡 Solicitando tokens a Google...');
        const { tokens } = await oauth2Client.getToken(code);
        
        console.log('✅ Tokens recibidos:', {
            access_token: !!tokens.access_token,
            refresh_token: !!tokens.refresh_token,
            id_token: !!tokens.id_token
        });
        
        // Obtener información del usuario
        oauth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        
        console.log('👤 Información de usuario obtenida:', userInfo.data);
        
        // Crear Custom Token de Firebase
        const customToken = await admin.auth().createCustomToken(userInfo.data.id, {
            email: userInfo.data.email,
            name: userInfo.data.name,
            picture: userInfo.data.picture,
            provider: 'google.com',
            oauth_access_token: tokens.access_token,
            oauth_refresh_token: tokens.refresh_token
        });
        
        console.log('🎫 Custom Token creado para Firebase Auth');
        
        // Respuesta con datos completos
        const response = {
            success: true,
            customToken,
            user: {
                uid: userInfo.data.id,
                email: userInfo.data.email,
                displayName: userInfo.data.name,
                photoURL: userInfo.data.picture,
                providerId: 'google.com'
            },
            tokens: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresIn: tokens.expiry_date
            }
        };
        
        res.status(200).json(response);
        
    } catch (error) {
        console.error('❌ Error intercambiando código OAuth:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * Cloud Function para refrescar tokens OAuth
 */
exports.refreshOAuthToken = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).send('');
        return;
    }
    
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token requerido' });
        }
        
        const oauth2Client = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            REDIRECT_URI
        );
        
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        res.status(200).json({
            success: true,
            accessToken: credentials.access_token,
            expiresIn: credentials.expiry_date
        });
        
    } catch (error) {
        console.error('❌ Error refrescando token:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Cloud Function para validar sesión actual
 */
exports.validateSession = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).send('');
        return;
    }
    
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ valid: false, error: 'Token no encontrado' });
        }
        
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        
        res.status(200).json({
            valid: true,
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name
        });
        
    } catch (error) {
        console.error('❌ Error validando sesión:', error);
        res.status(401).json({ valid: false, error: error.message });
    }
});