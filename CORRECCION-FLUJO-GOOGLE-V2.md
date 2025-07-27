# Corrección de Flujo de Registro con Google - Versión 2

Este documento describe las correcciones adicionales implementadas para resolver definitivamente el problema de usuarios que ingresan a través de `welcome.html`, utilizan Google para autenticarse, y no son redirigidos correctamente a `dream-input.html` para completar su registro.

## Problema Persistente

A pesar de los cambios anteriores, seguía existiendo un problema:

1. Cuando un usuario accedía a `welcome.html`
2. Hacía clic en "Continuar con Google"
3. Se autenticaba con una cuenta de Google nueva
4. El sistema fallaba al redirigirlo a `dream-input.html` para seleccionar su sueño

## Solución Mejorada

### 1. Enfoque determinístico en lugar de basado en detección

- **Antes**: Intentábamos detectar si un usuario era nuevo basándonos en propiedades como `isNewUser` o comparación de timestamps.
- **Ahora**: Simplemente forzamos la redirección a `dream-input.html` para TODOS los usuarios que usen Google desde `welcome.html`.

### 2. Uso de múltiples indicadores en localStorage

- `force_dream_input`: Indica que debe forzarse la redirección a dream-input.html
- `from_welcome_google`: Indica que el usuario viene del flujo de welcome.html usando Google
- `registration_in_progress`: Indica que hay un registro en progreso
- `user_email`: Guarda el email del usuario para referencia

### 3. Mejoras en dream-input.html

- Verificación activa de si el usuario ya tiene un sueño registrado
- Lógica para respetar la redirección forzada desde welcome.html
- Limpieza de todas las banderas al completar el proceso de registro

### 4. Uso de prompt para selección de cuenta

- Forzamos que Google siempre muestre la pantalla de selección de cuenta mediante `provider.setCustomParameters({prompt: 'select_account'})`
- Esto previene que Google use automáticamente una cuenta guardada sin mostrar la interfaz de selección

### 5. Manejo mejorado de errores

- Limpieza de todas las banderas en caso de error
- Mensajes de error más específicos
- Mejora en los mensajes de depuración para facilitar la resolución de problemas

## Nuevo Flujo de Registro

1. Usuario accede a `welcome.html`
2. Usuario hace clic en "Continuar con Google"
3. Se establecen banderas en localStorage ANTES de iniciar la autenticación
4. Se muestra la ventana de selección de cuenta de Google
5. Usuario selecciona una cuenta (nueva o existente)
6. Se redirige SIEMPRE a `dream-input.html`
7. En `dream-input.html` se verifica si el usuario ya tiene un sueño registrado
   - Si ya tiene sueño pero viene del flujo welcome+Google, se le permite seleccionar uno nuevo
   - Si ya tiene sueño y no viene de ese flujo, se redirige a home.html
8. Usuario selecciona un sueño
9. Se limpian todas las banderas de registro
10. Usuario es redirigido a `home.html`

Este enfoque determinístico es más robusto que intentar detectar si un usuario es nuevo o no, ya que simplemente forzamos el flujo completo para todos los usuarios que usen Google desde la página de bienvenida.

## Depuración

Se han añadido múltiples mensajes de consola para facilitar la depuración:
- Estado de las banderas de localStorage
- Información de autenticación del usuario
- Metadata del usuario
- Flujo de redirección
