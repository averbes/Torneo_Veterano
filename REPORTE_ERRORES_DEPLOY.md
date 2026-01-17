# Reporte de Errores: Despliegue en Render (Windows -> Linux)

Este documento registra los errores recurrentes durante la construcción (build) del proyecto en Render y sus soluciones.

## 1. Error: `Cannot find module '../lightningcss.linux-x64-gnu.node'` o `rollup-linux-x64-gnu`

### Causa:
El proyecto se desarrolla en **Windows**, pero Render utiliza **Linux**. Vite (v6) y Tailwind CSS (v4) utilizan dependencias nativas (binarios) que son específicas para cada sistema operativo. 

Cuando ejecutas `npm install` en Windows, npm a veces omite las versiones de Linux en el archivo `package-lock.json`. Al intentar construir en Render, el sistema no encuentra los binarios de Linux necesarios para procesar el CSS o empaquetar el JS.

### Solución:
Forzar la instalación de los binarios de Linux añadiéndolos explícitamente a la sección `optionalDependencies` del archivo `package.json`.

**Configuración necesaria:**
```json
"optionalDependencies": {
  "@rollup/rollup-linux-x64-gnu": "^4.22.4",
  "lightningcss-linux-x64-gnu": "^1.30.2",
  "@tailwindcss/oxide-linux-x64-gnu": "4.1.18"
}
```

---

## 2. Error: `TypeError: Cannot read properties of undefined (reading 'getInt32LE')`

### Causa:
Incompatibilidad en la versión **Mongoose v9** (recién lanzada) con el entorno de ejecución de Render/Node.js, específicamente en la librería interna de BSON.

### Solución:
Hacer un "downgrade" a la versión estable anterior de Mongoose (**v8.x**).

**Configuración necesaria:**
```json
"dependencies": {
  "mongoose": "^8.12.1"
}
```

---

## 3. Prácticas recomendadas para evitar fallos de Deploy:

1. **Incluir `package-lock.json`**: Nunca ignores este archivo. Es el que asegura que Render instale exactamente lo mismo que tienes en tu máquina.
2. **Node Version**: Asegúrate de que la versión de Node en Render (v22 en este caso) coincida con la que usas localmente o sea compatible.
3. **Optional Dependencies**: Si agregas nuevas herramientas de diseño (como librerías de UI pesadas), verifica si requieren binarios nativos para Linux.
