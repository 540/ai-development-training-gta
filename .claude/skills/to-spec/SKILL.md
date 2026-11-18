---
name: to-spec
description: Convierte la conversación actual en una especificación y la escribe en specs/. No interroga al usuario, solo sintetiza lo que ya se ha hablado. Usar cuando el usuario pida pasar a especificación lo hablado, "to-spec" o "escríbelo como spec".
disable-model-invocation: true
user-invocable: true
---

<!-- Adaptada de la skill to-spec de Matt Pocock (mattpocock-skills 1.3.1, licencia MIT, Copyright (c) 2026 Matt Pocock). -->

Esta skill toma lo que ya se ha hablado en la conversación y lo que sabes del código, y escribe una especificación. **No interrogues al usuario**: sintetiza lo que ya sabes. Si falta algo para escribirla, dilo al final como pregunta abierta en lugar de inventarlo.

## Proceso

1. Lee `CONTEXT.md`: dice qué datos da la API y cuáles no. Usa su vocabulario en toda la especificación. Si una decisión se apoya en un dato que la API no da, tiene que aparecer en **Supuestos** con su valor.

2. Explora el código si aún no lo has hecho, para saber qué hay hoy y dónde encaja lo nuevo.

3. Escribe la especificación en `specs/<tarea-en-kebab-case>.md` con este formato, el mismo que usa `grill-me`:

```markdown
# <Título de la tarea>

## Objetivo
<Para qué sirve, en una o dos frases, desde el punto de vista del usuario.>

## Supuestos
- <Cada decisión de negocio que no sale de los datos, con su valor.>

## Criterios de aceptación
1. <Resultado observable en pantalla, con datos concretos del catálogo.>

## Fuera de alcance
- <Lo que se ha decidido no hacer.>

## Preguntas abiertas
- <Lo que la conversación no resolvió. Omite la sección si no queda nada.>
```

## Reglas

- Cada criterio de aceptación se comprueba mirando la pantalla, sin leer el código, y usa vehículos reales del catálogo (por ejemplo «al comparar el Zentorno con el Adder, …»).
- Sin rutas de ficheros ni fragmentos de código: se quedan viejos enseguida.
- No implementes nada. Al terminar, di la ruta del fichero y cuántos criterios tiene.
