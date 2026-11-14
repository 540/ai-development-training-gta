---
name: implement
description: Implementa una tarea del comparador de vehículos de GTA de principio a fin. Fija los criterios de aceptación, escribe el código, lo pasa por la skill reviewer y por la skill validation, y repite con los arreglos hasta que las dos den el visto bueno o se agoten las rondas. Úsala cuando haya que implementar una tarea o una especificación de specs/.
argument-hint: "<tarea | specs/<fichero>.md>"
---

# Implementar una tarea

Tarea o especificación: $ARGUMENTS

## 1. Criterios

1. Lee `CLAUDE.md` y `CONTEXT.md`.
2. Elige un `slug` en kebab-case para la tarea (por ejemplo `mejor-para-un-golpe`). Tu carpeta de trabajo es `.claude/tmp/<slug>/`.
3. Si te pasan un fichero de `specs/`, cópialo a `.claude/tmp/<slug>/criterios.md` tal cual.
4. Si te pasan solo un texto, escribe tú `.claude/tmp/<slug>/criterios.md` con el formato de abajo. Cada dato que la API no da (está listado en `CONTEXT.md`) es un **supuesto**: elige la opción más simple, apúntala y sigue. No preguntes.

```markdown
# <Título>

## Supuestos
- <decisión y valor elegido>

## Criterios de aceptación
1. <resultado observable en pantalla, con un vehículo concreto del catálogo>
```

## 2. Implementar

- Lee los ficheros que vas a tocar enteros antes de editarlos.
- Haz el cambio mínimo que cumple los criterios. Cada supuesto vive en **un solo sitio** del código, con nombre.
- No toques `api/`: es un servicio externo.
- Al terminar, `npm run check` tiene que pasar.
- No hagas commit ni cambies de rama.

## 3. Revisar y validar

Invoca las dos skills, una detrás de otra, pasándoles el `slug`:

1. `/reviewer <slug>`: revisa el diff contra los criterios y devuelve un veredicto con hallazgos.
2. `/validation <slug>`: comprueba cada criterio en el navegador con Playwright y devuelve una captura por criterio.

Cada una se ejecuta en su propio subagente, sin ver esta conversación: todo lo que necesitan está en `.claude/tmp/<slug>/criterios.md` y en el diff.

## 4. Arreglar y repetir

- Si `reviewer` devuelve hallazgos **critical** o `validation` devuelve criterios en `fail` con clase `criterion`, arréglalos y vuelve al paso 3.
- Los fallos de clase `verifier` o `environment` no son del código: no toques la app por ellos.
- **Máximo 3 rondas.** Si en la tercera sigue habiendo críticos, para y repórtalo.

## 5. Informe

```
## <Título> — <slug>

**Resultado:** listo | con pendientes
Rondas: N · Revisión: APTO/NO APTO · Validación: x/y criterios en pass

### Supuestos
- …

### Criterios
| # | criterio | resultado | captura |

### Pendientes
- …
```
