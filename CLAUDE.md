# Comparador de vehículos de GTA

Comparador de vehículos de GTA Online en React y TypeScript: listado por clase y fabricante con buscador y filtros, ficha de cada vehículo, comparación de hasta tres y un garaje donde comprar y vender.

## Dominio

Lo que hay que saber de la API y del juego (unidades, campos y lo que la API no da) está en `CONTEXT.md`. Léelo antes de tocar cualquier cosa que use datos de los vehículos.

## Reglas del proyecto

- La API simulada (`api/`) no se toca: es un servicio externo.
- Los textos de pantalla van en castellano.
- En los componentes de React, las props y cualquier forma de objeto se declaran con `interface`, no con `type`.
- No se añaden dependencias de producción sin preguntar.
- Antes de dar una tarea por terminada, `npm run check` (tipos, reglas del equipo, guardarraíles y build) tiene que pasar.
