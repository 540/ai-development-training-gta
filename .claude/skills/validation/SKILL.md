---
name: validation
description: Comprueba en Chromium con Playwright los criterios de aceptación de un cambio del comparador de vehículos de GTA. Escribe un spec desechable por criterio en .claude/tmp, saca una captura de cada uno y clasifica cada fallo (verificador, entorno o criterio). Nunca edita el código de la app. Úsala para comprobar en el navegador que un cambio visible funciona.
argument-hint: "<slug>"
context: fork
background: false
allowed-tools: Read Grep Glob Write Edit Bash(npm run e2e *) Bash(npx playwright install *)
---

# Validación en el navegador

Slug: $ARGUMENTS

Los specs son **desechables**: viven en `.claude/tmp/<slug>/` (ignorado por git) y sirven como evidencia, no como tests de regresión. **Nunca editas `src/` ni `api/`**: tu trabajo es comprobar, no arreglar.

## 1. Antes de escribir

1. Lee `.claude/tmp/<slug>/criterios.md`.
2. Lee los componentes de `src/` que pinta cada criterio para saber **qué texto, rol o placeholder** tiene cada elemento. Usa, por este orden, `getByRole`, `getByText`, `getByPlaceholder` o `getByLabel`. Copia los textos tal cual del código.
3. Las rutas van con hash: `/#/` es el listado, `/#/vehicle/<id>` la ficha, `/#/compare` la comparación y `/#/garage` el garaje.
4. Los datos son los de verdad: la API simulada arranca con la app y sirve `api/vehicles.json`. Busca ahí los ids de los vehículos que necesites (el Zentorno es `1001`). No hay que simular nada.
5. Para empezar con estado, usa `page.addInitScript` antes de `page.goto` y rellena `localStorage`: `comparar` (lista de ids, máximo 3), `garaje` (lista de ids) y `dinero` (número).

## 2. Un test por criterio

En `.claude/tmp/<slug>/e2e/criterios.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('AC1 — <texto corto del criterio>', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('comparar', JSON.stringify(['1001', '1002'])))
  await page.goto('/#/compare')
  await expect(page.getByRole('heading', { name: 'Comparar' })).toBeVisible()
  await page.screenshot({ path: '.claude/tmp/<slug>/shots/ac1.png', fullPage: true })
})
```

- El nombre empieza por `ACn —` con la numeración de los criterios.
- **Primero el `expect` y después la captura**: la captura es evidencia, no la comprobación.
- Un criterio que no se ve en el navegador se marca `skipped` y no lleva spec.

## 3. Ejecutar

```bash
npm run e2e -- .claude/tmp/<slug>
```

Playwright levanta la app en el puerto 5199 y la reutiliza si ya está levantada. Si falta Chromium, `npx playwright install chromium`.

Si los specs ya existen de una ronda anterior, **no los reescribas**: ejecútalos. Solo los tocas si el fallo es tuyo.

## 4. Clasificar cada fallo

| clase | síntoma | qué haces |
|---|---|---|
| `verifier` | El elemento se ve en la captura pero tu selector no lo encuentra, o es un problema de tiempos | Arreglas el spec y repites. **Máximo 2 intentos** |
| `environment` | Chromium no instalado, puerto ocupado, la app no arranca | Lo reportas con el error literal |
| `criterion` | La app hace otra cosa distinta a lo que pide el criterio | Lo reportas con lo observado, lo esperado y la captura |

Para decidir entre `verifier` y `criterion`, mira la captura o el trace en `.claude/tmp/playwright-results/`.

## 5. Informe

```
## Validación — <slug>

| # | criterio | resultado | clase | observado | captura |
|---|---|---|---|---|---|
| AC1 | … | pass/fail/skipped | pass/verifier/environment/criterion | … | .claude/tmp/<slug>/shots/ac1.png |
```
