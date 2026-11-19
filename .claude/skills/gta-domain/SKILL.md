---
name: gta-domain
description: Conocimiento del dominio del comparador de vehículos de GTA (la API simulada, sus unidades y rarezas, los campos de la ficha y lo que la API no da) y dónde vive cada pieza en src/. Precárgala antes de planificar, implementar o revisar cualquier cambio que toque velocidades, precios, estadísticas, blindaje, armamento, el garaje o datos de la API.
user-invocable: false
---

# Dominio del comparador de vehículos de GTA

La fuente de verdad del negocio es `CONTEXT.md`, en la raíz. Esta skill te dice cómo usarla, no la sustituye.

## Reglas

1. **Lee la sección de `CONTEXT.md` que toque antes de escribir código.** Si el cambio usa un campo de la ficha, comprueba en `CONTEXT.md` en qué unidad viene y qué significa. Nunca lo supongas de memoria: todo llega como texto, `topSpeed` está en millas por hora, una cadena vacía es "sin dato" y un `price` vacío no es lo mismo que un `price` de `0`.
2. **La conversión de mph a km/h se hace una vez**, con `KM_POR_MILLA` y `km()` de `src/App.tsx`. Un test de `guardarrailes/` falla si el factor aparece en otro sitio.
3. **Lo que la API no da, no se inventa.** Mejoras, capacidad de carga, resistencia en números, nivel de búsqueda o tipos de golpe no están en la API. Si un cambio los necesita, son un supuesto de negocio: el plan tiene que decir de dónde salen, y el código tiene que dejarlos en un único sitio, con nombre, para poder cambiarlos.
4. **La API es un servicio externo**: `api/` no se toca y `src/` no importa nada de ahí. Los datos se piden por HTTP a `/api/...`.

## Dónde vive cada cosa

| Qué | Dónde |
|---|---|
| Petición a la API (`pedir`), conversión de la ficha (`convertir`, `km`), traducciones de clase, tracción, blindaje y armas | `src/App.tsx` |
| Páginas: listado (`Home`), ficha (`Detalle`), comparar (`Comparar`) y garaje (`Garaje`) | `src/App.tsx` |
| Lo del juego: HUD, `nivelBusqueda` (estrellas), `pctVelocidad`, `Barra`, avisos, trucos, `DINERO_INICIAL` | `src/gta.tsx` |
| Fotos y siluetas | `src/fotos.tsx`, `src/siluetas.tsx` |
| Estilos | `src/styles.css` |
| Lógica de negocio pura y nueva, con sus tests | `src/dominio/` |
| Datos de la API simulada (ids, valores reales para los criterios) | `api/vehicles.json` (solo lectura) |

La **lógica de negocio pura** nueva (puntuaciones, reglas de clasificación, cálculos con precios) va en `src/dominio/`, sin React ni `fetch`. `src/dominio/` se mide al 100 % de cobertura y de mutantes muertos, así que cada regla necesita un test que la defienda.
