---
name: to-tickets
description: Parte una especificación, un plan o la conversación actual en tickets que son cortes verticales (tracer bullets), cada uno con los tickets que lo bloquean, y los escribe como un fichero por ticket en specs/. Usar cuando el usuario pida trocear una spec en tickets, "to-tickets" o "pásalo a tickets".
disable-model-invocation: true
user-invocable: true
---

<!-- Adaptada de la skill to-tickets de Matt Pocock (mattpocock-skills 1.3.1, licencia MIT, Copyright (c) 2026 Matt Pocock). -->

Parte una especificación, un plan o la conversación en **tickets**: cortes verticales finos, cada uno con los tickets que lo **bloquean**.

## Proceso

### 1. Reúne el contexto

Parte de lo que ya hay en la conversación. Si el usuario pasa una especificación como argumento (por ejemplo `specs/mejor-para-un-golpe.md`), léela entera. Lee también `CONTEXT.md` y usa su vocabulario en los títulos y descripciones.

### 2. Explora el código

Si aún no lo has hecho, explora el código para saber qué hay hoy. Busca si conviene preparar el terreno antes con un refactor que haga fácil el cambio: «haz que el cambio sea fácil y después haz el cambio fácil».

### 3. Dibuja los cortes verticales

- Cada ticket atraviesa todas las capas que toca (datos, lógica, pantalla), pero de forma estrecha: vertical, no una capa entera de golpe.
- Un ticket terminado se puede enseñar o comprobar por sí solo en la app.
- Cada ticket cabe en una sesión nueva del agente.
- Si hace falta preparar el terreno, ese ticket va primero.

Para cada ticket, apunta los tickets que tienen que estar terminados antes de empezarlo. Un ticket sin bloqueos puede empezar ya.

### 4. Repásalo con el usuario

Presenta el reparto como una lista numerada. De cada ticket, enseña:

- **Título**: corto y descriptivo.
- **Bloqueado por**: qué tickets tienen que estar antes, si hay alguno.
- **Qué entrega**: el comportamiento que funciona de punta a punta al terminarlo.

Y pregunta:

- ¿El tamaño es el adecuado, o son demasiado grandes o demasiado pequeños?
- ¿Los bloqueos son reales, o hay tickets que dependen de otros que no les hacen falta?
- ¿Hay que juntar o partir alguno?

Itera hasta que el usuario lo apruebe.

### 5. Escribe los tickets

Escribe un fichero por ticket en `specs/<tarea-en-kebab-case>/tickets/<NN>-<slug>.md`, numerados desde `01` en orden de dependencias (primero los que bloquean). Si la tarea viene de una especificación en `specs/`, usa su mismo nombre de tarea. Nunca juntes varios tickets en un fichero.

```markdown
# <NN>: <Título del ticket>

**Qué construir:** el comportamiento que funciona de punta a punta al terminarlo, desde el punto de vista del usuario; no una lista de cambios por capa.

**Bloqueado por:** los números y títulos de los tickets que tienen que estar antes, o «Ninguno (se puede empezar ya)».

**Estado:** listo para el agente

## Criterios de aceptación

- [ ] Criterio 1
- [ ] Criterio 2
```

Los tickets se trabajan por la **frontera**: cualquier ticket cuyos bloqueos estén todos terminados. En una cadena lineal, eso es de arriba abajo.

## Reglas

- Los criterios de aceptación se comprueban mirando la pantalla y usan vehículos reales del catálogo. Si vienen de una especificación, reparte sus criterios entre los tickets sin perder ninguno.
- Sin rutas de ficheros ni fragmentos de código: se quedan viejos enseguida.
- No implementes nada. Al terminar, di la carpeta y lista los tickets con sus bloqueos.
