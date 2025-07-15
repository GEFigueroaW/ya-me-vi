# YA ME VI - Copilot Instructions

## Project Overview
YA ME VI is a Spanish lottery analysis web application for Mexican lottery games (Melate, Revancha, Revanchita). It provides historical data analysis, combination evaluation, and AI-powered predictions using vanilla JavaScript, HTML5, and Firebase authentication.

## Architecture & Data Flow

### Core Components
- **HTML Pages**: `analisis.html`, `combinacion.html`, `sugeridas.html` - Main application functions
- **Data Layer**: `js/dataParser.js` - CSV processing and historical data management
- **ML Engine**: `js/mlPredictor.js` - AI predictions using 5-method analysis system
- **Auth**: `js/firebase-init.js` - Firebase authentication integration
- **UI**: `js/shared.js` - Common utilities and background management

### CSV Data Processing
- **Format**: Government standard `NPRODUCTO,CONCURSO,R1,R2,R3,R4,R5,R6,R7,BOLSA,FECHA`
- **Time Filter**: Automatically filters to last 30 months from current date
- **Files**: `assets/Melate.csv`, `assets/Revancha.csv`, `assets/Revanchita.csv`
- **Parsing**: `dataParser.js` detects formats automatically, extracts numbers from columns 2-7

### Mathematical System
- **Factor**: 12.5x multiplication for user-friendly percentages (converts 0.8% → 10%)
- **Minimum**: 8% floor to maintain user motivation
- **Calculation**: `Math.max(basePercentage * 12.5, 8.0)`

## Key Patterns & Conventions

### Module System
```javascript
// All modules use ES6 exports
export async function cargarDatosHistoricos(modo = 'todos') { ... }
export function graficarEstadisticas(datos) { ... }
```

### Data Loading Pattern
```javascript
// Consistent CSV loading with error handling
const response = await fetch('assets/Melate.csv');
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const csvText = await response.text();
```

### UI State Management
- **Loading States**: Show spinners while processing data
- **Error Handling**: Display user-friendly error messages
- **Console Logging**: Extensive logging with emojis for debugging

### ML Prediction System
- **5-Method Analysis**: Frequency, Probability, Patterns, Delta, Standard Deviation
- **1000 Combinations Pool**: Generates consistent predictions based on user hash
- **Personalization**: Uses `userId` hash for consistent user-specific results

## Development Workflows

### Testing Data Loading
```javascript
// Check console for data loading success
console.log('✅ melate: 393 sorteos cargados');
console.log('📊 Datos históricos reales cargados');
```

### Adding New Analysis
1. Update `dataParser.js` with new calculation function
2. Add UI component to relevant HTML file
3. Update CSS classes using Tailwind conventions
4. Test with console logging

### Debugging CSV Issues
- Check browser console for format detection messages
- Verify CSV column structure matches expected format
- Ensure date filtering works correctly (last 30 months)

## Integration Points

### Firebase Authentication
- Required for all main features
- Redirects to `index.html` if not authenticated
- User ID used for personalized predictions

### External Dependencies
- **Tailwind CSS**: 2.2.19 via CDN
- **Animate.css**: 4.1.1 for animations
- **Firebase**: 10.12.0 for authentication

### CSS Framework
- **Primary**: Tailwind utility classes
- **Custom**: `css/styles.css` for specific components
- **Opacity Effects**: `bg-opacity-20`, `backdrop-blur-lg` for glass effects

## Critical Files

### Core Processing
- `js/dataParser.js` - CSV parsing, statistics generation, data validation
- `js/mlPredictor.js` - AI prediction engine with 5-method analysis
- `combinacion.html` - Number evaluation with 30-month filtering

### UI Components
- `analisis.html` - Statistical analysis display (top 10 most/least frequent)
- `sugeridas.html` - Random combinations and AI predictions
- `home.html` - Main navigation with responsive button layout

### Data Sources
- `assets/*.csv` - Historical lottery data in government format
- Date format: `DD/MM/YYYY` in CSV files
- Number range: 1-56 for all lottery types

## Performance Considerations
- CSV files processed client-side (no server required)
- Data cached after first load for session
- Automatic format detection reduces configuration needs
- 30-month time filtering improves relevance and performance
