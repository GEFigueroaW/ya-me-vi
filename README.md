# YA ME VI 🎯

Aplicación web diseñada para analizar estadísticas de sorteos (Melate, Revancha y Revanchita) mediante patrones, probabilidad e inteligencia artificial ligera. Su objetivo es acompañar al usuario en su sueño de ganar, con una interfaz atractiva, emocional y accesible.

---

## 🔧 Estructura de Archivos

```
YA-ME-VI/
│
├── index.html                 # Punto de entrada principal
├── login.html                 # Vista de login con correo y/o Google
├── menu.html                  # Menú de opciones: Análisis o Evaluar combinación
├── seleccion-suenos.html      # Vista flotante o fullscreen para elegir el sueño
├── combinacion.html           # Vista para ingresar 6 números personalizados
├── analisis.html              # Vista con análisis de sorteos y predicción IA
├── preloader.html             # Pre-carga visual
│
├── css/
│   └── styles.css             # Estilos generales, responsive y efectos
│
├── js/
│   ├── main.js               # Login, rotación de fondo, control de sesión
│   ├── firebase-init.js      # Configuración Firebase
│   ├── shared.js             # Utilidades comunes (fondo, footer)
│   ├── router.js             # Redirecciones según estado de sesión
│   ├── menu.js               # Lógica de menú de selección principal
│   ├── logout.js             # Logout manual y automático
│   ├── login.js              # Login con email/password o Google
│   ├── dream-selection.js    # Guardado y envío del sueño seleccionado
│   ├── evaluador.js          # Análisis de combinaciones personalizadas
│   ├── analisis.js           # Análisis de sorteos + predicción IA
│   ├── dataParser.js         # Lógica para leer archivos CSV de Lotería Nacional
│
├── footer.html               # Disclaimer legal reutilizable
│
├── assets/
│   ├── vg1.jpg – vg5.jpg     # Fondos rotatorios inspiracionales
│
└── README.md                 # Documentación general
```

---

## 🔒 Autenticación
- Firebase Auth: Google o Email/Password.
- Redirección a `seleccion-suenos.html` tras primer login.
- Logout manual y automático (a la medianoche).

---

## 📊 Lógica del Análisis
- Descarga de archivos `melate.csv`, `revancha.csv`, `revanchita.csv` directamente desde Lotería Nacional.
- Análisis de los **últimos 3 años**, columnas C a I.
- Predicciones generadas con:
  - Estadísticas de frecuencia
  - Detección de patrones por sección (1–9, 10–18...)
  - IA ligera con TensorFlow.js

---

## 🎯 Selección de Sueño
- Modal/página dedicada tras primer login.
- Sueños disponibles: Casa, Viaje, Auto, Negocio, Retiro/Jubilación.
- Guardado en `localStorage` y Firestore: `users/{uid}/dream`

---

## ⚠️ Disclaimer
> Este sistema se basa en estadísticas, patrones, probabilidad e inteligencia artificial. No garantiza premios. Juega con responsabilidad.

Siempre visible en el `footer.html`.

---

## 💡 UX & Accesibilidad
- Compatible con dispositivos móviles.
- Animaciones suaves (`Animate.css`)
- Diseño visual minimalista y emocional.
- Transiciones suaves entre vistas.
- Gráficos con `Chart.js` y visualización optimizada.

---

## 🚀 Despliegue sugerido
- GitHub Pages para frontend.
- Firebase Hosting + Firestore + Auth para backend.
- Archivos CSV disponibles públicamente desde loterianacional.gob.mx

---

## 📩 Soporte
Cualquier duda, sugerencia o reporte puede canalizarse a través de los canales de soporte técnico del desarrollador.

---

¡Gracias por creer en tu sueño!

**YA ME VI** – La suerte favorece a quien se prepara. 🍀
