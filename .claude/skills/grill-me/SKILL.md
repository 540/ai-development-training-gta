---
name: grill-me
description: Interroga al usuario sin descanso sobre una issue, bug o feature hasta alcanzar un entendimiento compartido, resolviendo cada rama del árbol de decisiones. Usar cuando el usuario quiera clarificar requisitos, ser interrogado sobre una tarea, o mencione "grill me".
disable-model-invocation: false
user-invocable: true
---

Interroga al usuario sin descanso sobre cada aspecto de esta tarea hasta alcanzar un entendimiento compartido de lo que hay que hacer y por qué. Recorre cada rama del árbol de decisiones, resolviendo dependencias entre decisiones una a una. Para cada pregunta, proporciona tu respuesta recomendada.

Haz las preguntas de una en una.

Si una pregunta se puede responder explorando el codebase, explora el codebase en lugar de preguntar. Lee `CONTEXT.md` antes de empezar: dice qué datos da la API y cuáles no, y cada dato que no da es una pregunta.

Cubre también las ramas que necesitan los criterios de aceptación: qué resultado observable demuestra cada comportamiento, qué queda fuera y cómo se valida. Al terminar, escribe la especificación en `specs/<tarea-en-kebab-case>.md` con este formato:

```markdown
# <Título de la tarea>

## Objetivo
<Para qué sirve, en una o dos frases.>

## Supuestos
- <Cada decisión de negocio que no sale de los datos, con su valor.>

## Criterios de aceptación
1. <Resultado observable en pantalla, con datos concretos del catálogo.>

## Fuera de alcance
- <Lo que se ha decidido no hacer.>
```
