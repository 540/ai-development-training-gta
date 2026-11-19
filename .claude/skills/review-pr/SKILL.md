---
name: review-pr
description: Revisa un cambio del comparador de vehículos de GTA (la rama actual contra harness, o una PR por número o URL). Ejecuta los gates deterministas (npm run check, duplicación, cobertura, CRAP y Stryker acotado al diff) y hace una revisión puntuada por dimensiones (Corrección, Arquitectura, Dominio, Tests, UI) que da una Merge Safety de 0 a 10 y hallazgos con severidad. Úsala cuando quieras revisar una rama o una PR, comprobar si un cambio está listo para mergear o auditar un diff.
argument-hint: "[número o URL de PR | rama base]"
---

# Revisión puntuada del comparador de vehículos de GTA

## 1. Qué se revisa

| Argumento | Modo | Base del diff |
|---|---|---|
| ninguno | Rama actual, cambios sin commitear incluidos | `harness` |
| nombre de rama | Rama actual | esa rama |
| número o URL de PR | `gh pr checkout <pr>` y se revisa esa rama | `gh pr view <pr> --json baseRefName -q .baseRefName` |

En modo PR, el contexto de negocio es el cuerpo de la PR (`gh pr view <pr> --json title,body`). En modo rama, el plan o los criterios que te pasen; si no hay ninguno, deduce la intención de los commits (`git log --oneline <base>..HEAD`).

## 2. Gates deterministas

```bash
node .claude/skills/review-pr/scripts/gates.mjs --base <base>
```

Imprime un JSON y lo guarda en `.claude/tmp/gates/result.json`:

- `changedFiles`: los ficheros del diff. **Revisa estos y solo estos.**
- `green`: `true` si todos los gates pasan.
- `gates[]`: `check`, `duplication`, `coverage`, `crap` y `mutation`, cada uno con `ok`, `log` (el log completo) y `tail` (el final del log si falla).
- `gates[mutation]`: `files` (los ficheros de `src/dominio/` del diff que se han mutado; si no hay ninguno, `skipped: true`) y `survivors` (`file`, `line`, `mutator`, `replacement`, `status`).

Cada gate en rojo es un hallazgo **critical** de la dimensión que le toque (`check`/`crap` → Corrección o Tests, `duplication` → Arquitectura, `coverage` → Tests). Cada superviviente de Stryker es un hallazgo **critical** de Tests: indica el mutante y el caso de test que lo mataría.

**Si te dicen que los gates ya se ejecutan aparte (modo workflow), no los ejecutes**: haz solo la revisión.

## 3. Revisión por dimensiones

Lee el diff (`git diff <merge-base>`) y los ficheros completos que toca, no solo los fragmentos. Antes de revisar nada que use datos de los vehículos, lee `CONTEXT.md` (la skill `gta-domain` explica cómo).

| Dimensión | Peso | Qué mira |
|---|---|---|
| Corrección | 30 % | Bugs, casos borde (vehículos sin precio, sin plazas, una sola versión), estados de carga y de error, dependencias de `useEffect`, carreras en peticiones, claves de listas |
| Arquitectura | 20 % | La lógica pura en `src/dominio/` y no enterrada en componentes; la UI pide los datos por HTTP a `/api` y nunca importa de `api/`; `api/` sin tocar; piezas nuevas sin consumidor; duplicación; reutilizar lo que ya existe (`km`, `nivelBusqueda`, `pctVelocidad`…) |
| Dominio | 20 % | Fidelidad a `CONTEXT.md`: mph a km/h (× 1,609344, una sola vez), precio vacío frente a precio 0, plazas sin dato, blindaje y armamento con sus valores reales, y cada dato que la API no da tratado como supuesto con nombre y en un solo sitio |
| Tests | 20 % | Que cada regla de dominio tenga un test; que las aserciones sean de comportamiento; que no sean frágiles ni tautológicas; los supervivientes de mutación |
| UI y estilos | 10 % | Textos de pantalla en castellano, clases en `src/styles.css` siguiendo el estilo existente, props con `interface`, accesibilidad básica (roles, `alt`, labels, foco) |

Cada dimensión se puntúa de 0 a 10:

- **10**: nada que objetar.
- **8-9**: solo mejoras o limpiezas.
- **5-7**: al menos un hallazgo critical acotado.
- **0-4**: fallo grave (el criterio no se cumple, `api/` tocada, regla de dominio mal).

**Merge Safety** = 0,3·Corrección + 0,2·Arquitectura + 0,2·Dominio + 0,2·Tests + 0,1·UI, con un decimal. **Si algún gate está en rojo, la Merge Safety tiene un tope de 5.**

### Severidad de los hallazgos

- **critical**: bug, criterio sin cumplir, violación de una regla de `CLAUDE.md` o de `CONTEXT.md`, gate en rojo, mutante superviviente.
- **improvement**: el código funciona, pero hay una versión claramente mejor (legibilidad, un test que falta en un caso borde, simplificación).
- **cleanup**: estético o de nombres, sin impacto.

Cada hallazgo lleva `dimension`, `severity`, `file`, `line`, `title`, `detail` (qué falla y por qué, con evidencia) y `suggestedFix` (un cambio concreto, no "mejorar X"). No reportes lo que ya está bien ni supuestos que no hayas comprobado en el código. El código legado de `src/App.tsx` tiene vicios a propósito (`any`, `==`…): no los reportes salvo que el diff los introduzca o los empeore.

## 4. Informe

```
## Revisión — <rama o PR> contra <base>

**Merge Safety: X.X / 10** — <recomendación en una línea>
Gates: check ✅ · duplicación ✅ · cobertura ✅ · CRAP ✅ · mutación ✅ (o ⏭ sin ficheros)

| Dimensión | Nota |
|---|---|
| Corrección | x |
| Arquitectura | x |
| Dominio | x |
| Tests | x |
| UI y estilos | x |

### Critical
- `file:line` — título. Detalle. **Arreglo:** …

### Improvement
…

### Cleanup
…
```

En modo PR, al final pregunta si quieren publicar el informe como comentario (`gh pr comment <pr> --body-file <fichero>`). **Nunca publiques sin confirmación**, y en modo workflow no publiques nunca.
