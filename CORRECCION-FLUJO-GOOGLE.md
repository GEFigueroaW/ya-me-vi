# Corrección de flujo de registro con Google

Este documento describe las correcciones implementadas para asegurar que los usuarios que intentan iniciar sesión con Google desde la página de bienvenida (`welcome.html`) y no tienen una cuenta registrada sean dirigidos correctamente a `dream-input.html` para completar el proceso de registro.

## Problema Identificado

Cuando un usuario en `welcome.html` hacía clic en el botón "Continuar con Google" y seleccionaba una cuenta nueva (no registrada previamente), el sistema:

1. Autenticaba al usuario con Google correctamente
2. No detectaba correctamente que era un usuario nuevo 
3. Redirigía directamente a `home.html`, saltándose la selección de sueño en `dream-input.html`

## Solución Implementada

1. **Forzar redirección a dream-input.html**:
   - En `welcome.html`, cuando un usuario utiliza Google para iniciar sesión, siempre lo redirigimos a `dream-input.html` para completar el registro
   - Esto garantiza que los usuarios nuevos seleccionen un sueño como parte del proceso de registro

2. **Uso de banderas en localStorage**:
   - Implementamos `registration_in_progress` como bandera para rastrear usuarios en proceso de registro
   - Implementamos `registration_completed` cuando el proceso se completa correctamente
   - Estas banderas ayudan a mantener el flujo correcto incluso si el usuario actualiza la página

3. **Detección mejorada de usuarios nuevos**:
   - Ahora usamos múltiples métodos para detectar si un usuario es nuevo
   - Agregamos registro detallado de la información de autenticación para facilitar la depuración

4. **Verificación en welcome.html**:
   - Añadimos verificación en la inicialización para redirigir usuarios con registro en progreso
   - Esto evita ciclos o flujos interrumpidos si el usuario vuelve a esta página durante el proceso

5. **Limpieza de banderas en dream-input.html**:
   - Cuando se completa la selección del sueño, limpiamos las banderas de registro
   - Establecemos una bandera `registration_completed` para referencia futura

## Flujo Resultante

1. Usuario visita `welcome.html`
2. Usuario hace clic en "Continuar con Google"
3. Se autentica con Google (nueva cuenta o existente)
4. Es redirigido a `dream-input.html` para seleccionar sueño
5. Usuario selecciona un sueño
6. Se guarda la selección y se limpian las banderas de registro
7. Usuario es redirigido a `home.html` con el proceso de registro completo

Este flujo garantiza que todos los usuarios que utilizan Google desde `welcome.html` completen el proceso de registro seleccionando un sueño.
