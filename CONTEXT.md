# Contexto del comparador de vehículos de GTA

Lo que hay que saber del dominio para trabajar en este proyecto y que no se deduce leyendo el código.

## La fuente de datos

Los datos vienen de una API simulada (`api/plugin.ts` sobre `api/vehicles.json`) que arranca con `npm run dev`. Hace de servicio externo: **no se toca, se consume**. Tiene unos 80 vehículos de GTA Online en 11 clases.

- **No tiene listado.** Para listar los vehículos de una clase hay que pedir los fabricantes (`/vehicle/menu/make`), después los modelos de cada uno (`/vehicle/menu/model`), después las versiones de cada modelo (`/vehicle/menu/options`) y después cada versión por su id (`/vehicle/{id}`).
- **Contesta en XML** salvo que se pida `Accept: application/json`.
- **Los menús cambian de forma**: una lista cuando hay varias entradas, un objeto suelto cuando hay una y `null` cuando no hay ninguna.
- **Todo llega como texto**, números incluidos, y una cadena vacía significa "sin dato".
- **Tarda** entre 150 y 450 ms en cada respuesta.

## La ficha de un vehículo

| campo | qué es | valores |
|---|---|---|
| `VClass` | clase | Super, Sports, Sports Classics, Muscle, Sedans, SUVs, Off-Road, Compacts, Coupes, Vans, Motorcycles |
| `make`, `baseModel`, `model` | fabricante, modelo y versión | un modelo puede tener varias versiones (Kuruma y Kuruma blindado) |
| `drive` | tracción | `AWD`, `RWD`, `FWD` |
| `seats` | plazas, conductor incluido | `1`, `2`, `4`, `6`; vacío si no se sabe |
| `price` | precio en el concesionario, en GTA$ | vacío si no se puede comprar; `0` si es gratis |
| `sellPrice` | lo que paga Los Santos Customs al venderlo | la mitad de `price`; vacío si no tiene precio. Lo calcula la API |
| `topSpeed` | velocidad punta | **en millas por hora** |
| `acceleration`, `braking`, `traction` | aceleración, frenada y agarre | puntuación de 0 a 100, como las barras del concesionario |
| `perfScore` | rendimiento global de 0 a 10 | media de velocidad, aceleración, frenada y agarre. Lo calcula la API |
| `armor` | blindaje | `None`, `Light`, `Heavy` |
| `weapons` | armamento | `None`, `Machine guns`, `Turret`, `Missiles` |

## Unidades

- **Velocidad**: la API da millas por hora y la app enseña km/h. Se multiplica por **1,609344** y se redondea al entero, una sola vez, al convertir la ficha.
- **Dinero**: GTA$, sin decimales, con punto de miles en pantalla (`$1.500.000`).

## El garaje

El jugador empieza con **$1.500.000**. Comprar resta el `price` y mete el vehículo en el garaje; vender suma el `sellPrice` y lo saca. El dinero, el garaje y la lista de comparación se guardan en `localStorage` (`dinero`, `garaje`, `comparar`).

## Lo que la API no da

- **Mejoras** de Los Santos Customs (motor, blindaje extra, neumáticos antipinchazos) ni su precio.
- **Capacidad de carga** del maletero ni peso.
- **Resistencia** a explosivos o a disparos en números: el blindaje es solo `None`, `Light` o `Heavy`.
- **Nivel de búsqueda** que atrae cada vehículo: las estrellas que enseña la app las calcula ella.
- **Tipos de golpe** ni sus requisitos (cuánta gente, si hay persecución, si hay que cargar botín).

Cualquier cambio que necesite uno de estos datos tiene que decidir de dónde sale y dejarlo escrito como supuesto.
