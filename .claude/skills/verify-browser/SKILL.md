---
name: verify-browser
description: Verifica criterios de aceptación del comparador de vehículos de GTA navegando de verdad en Chromium con Playwright. Escribe un spec desechable por criterio en .claude/tmp, levanta la app con la API simulada, saca una captura por criterio y clasifica cada fallo (verificador, entorno o criterio). Úsala para comprobar en el navegador que un cambio visible funciona, antes de abrir una PR o después de implementar.
argument-hint: "<criterios de aceptación o ruta al plan>"
---

# Verificación en navegador

Los specs son **desechables**: viven en `.claude/tmp/` (ignorado por git), no pasan por los gates y nunca entran en la PR. Sirven como evidencia, no como tests de regresión.

## 1. Carpeta de trabajo

- En el workflow, te pasan el `slug`: la carpeta es `.claude/tmp/<slug>/`.
- A mano, usa `.claude/tmp/manual-<kebab-del-cambio>/`.

Dentro:

```
.claude/tmp/<slug>/
  e2e/criteria.spec.ts   ← un test por criterio
  shots/ac1.png …        ← una captura por criterio
```

## 2. Antes de escribir

1. Lee los criterios. Si te dan un plan, léelo entero.
2. Lee los componentes de `src/` que pinta cada criterio para saber **qué texto, rol o placeholder** tiene cada elemento. Usa, por este orden, `getByRole`, `getByText`, `getByPlaceholder` o `getByLabel`. Copia los textos tal cual del código.
3. Las rutas van con hash: `/#/` es el listado, `/#/vehicle/<id>` la ficha, `/#/compare` la comparación y `/#/garage` el garaje.

## 3. Datos

**No hay que simular nada**: la API simulada (`api/plugin.ts` sobre `api/vehicles.json`) arranca con la app y sirve siempre los mismos datos. Busca en `api/vehicles.json` los ids de los vehículos que necesites (el Zentorno es `1001`). Nunca toques `api/`.

Para empezar con estado, usa `page.addInitScript` antes de `page.goto` y rellena `localStorage`: `comparar` (lista de ids, máximo 3), `garaje` (lista de ids) y `dinero` (número).

La API tarda entre 150 y 450 ms por respuesta y el listado encadena muchas peticiones: espera con `expect(...).toBeVisible()`, nunca con `waitForTimeout`.

## 4. Un test por criterio

```ts
import { expect, test } from '@playwright/test'

test('AC1 — <texto corto del criterio>', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('comparar', JSON.stringify(['1001', '1002'])))
  await page.goto('/#/compare')
  await expect(page.getByRole('heading', { name: 'Comparar' })).toBeVisible()
  await page.screenshot({ path: '.claude/tmp/<slug>/shots/ac1.png', fullPage: true })
})
```

- El nombre empieza por `ACn —`, con la numeración de los criterios.
- **Aserción con `expect` antes de la captura**: la captura es evidencia, no la verificación.
- Un criterio no verificable en el navegador (por ejemplo, "hay tests") se marca `skipped` en el informe y no lleva spec.

## 5. Ejecutar

```bash
npm run e2e -- .claude/tmp/<slug>
```

Playwright levanta la app en el puerto 5199 (`webServer` en `playwright.config.ts`) y la reutiliza si ya está levantada. Si falta Chromium, `npx playwright install chromium`.

**Si te piden repetir la verificación (ronda 2 o posterior) y los specs ya existen, no los reescribas**: ejecútalos. Solo tócalos si el fallo es del verificador.

## 6. Clasificar cada fallo

| Clase | Síntoma | Qué haces |
|---|---|---|
| `verifier` | Selector que no existe pero el elemento sí se ve en la captura o el trace, estado inicial mal preparado, timing | Arreglas el spec y repites. **Máximo 2 intentos**; después lo reportas como `verifier` |
| `environment` | Chromium no instalado, el puerto 5199 ocupado por otra cosa, la app no arranca, error de compilación de Vite | No lo arreglas: lo reportas con el error literal |
| `criterion` | La app hace otra cosa distinta a lo que pide el criterio | No tocas el código de la app: lo reportas con lo observado, lo esperado y la captura |

Para decidir entre `verifier` y `criterion`, mira la captura o el trace (`.claude/tmp/playwright-results/`). Si la app muestra lo que pide el criterio y tu selector no lo encuentra, el fallo es tuyo.

**Nunca edites código de `src/` ni de `api/`.** Tu trabajo es verificar, no arreglar.

## 7. Informe

Por cada criterio: `ac`, `result` (`pass`, `fail` o `skipped`), `classification` (`pass`, `verifier`, `environment` o `criterion`), `observed`, `expected` y `screenshot` (ruta **relativa a la raíz del repo**, por ejemplo `.claude/tmp/<slug>/shots/ac1.png`: la skill `open-pr` la usa tal cual en `--attach`). A mano, preséntalo como tabla y enseña las capturas con Read.
