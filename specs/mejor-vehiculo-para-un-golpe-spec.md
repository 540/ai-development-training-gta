# Mejor vehículo para un golpe

## Objetivo
Que, al comparar vehículos, el jugador vea cuál de ellos es el mejor para dar un golpe y por qué: cada vehículo tiene una puntuación de golpe y un aviso nombra al ganador.

## Supuestos
- Hay un único golpe genérico. La API no da tipos de golpe ni sus requisitos, así que no se distingue entre unos y otros.
- La banda es de 4 personas. Un vehículo es **apto** si tiene 4 plazas o más (`seats`, conductor incluido). Con menos plazas, o con `seats` vacío ("sin dato"), no es apto y no puede ganar.
- La **puntuación de golpe** va de 0 a 100 y solo la tienen los vehículos aptos. Combina tres factores:
  - **Blindaje, 40 %:** `None` = 0, `Light` = 50, `Heavy` = 100. La API no da resistencia en números, así que estos valores son nuestros.
  - **Huida, 40 %:** media de la velocidad punta en porcentaje, `acceleration` y `traction`. La velocidad en porcentaje es la misma que usa la barra de velocidad de la app: `topSpeed` en millas por hora dividida entre 140 mph, con 100 como máximo.
  - **Armamento, 20 %:** `None` = 0, `Machine guns` = 50, `Turret` = 100, `Missiles` = 100.
- La puntuación se redondea al entero **una sola vez**, y el ganador se decide con ese entero, que es lo que se ve en pantalla.
- No cuentan para la puntuación:
  - la frenada (`braking`);
  - el nivel de búsqueda: lo calcula la app con los mismos datos, así que se contaría dos veces;
  - el precio (`price`), el dinero del jugador ni si el vehículo se puede comprar. Un vehículo sin `price`, como el Brute Stockade, puede ganar.
- Si varios vehículos empatan en la puntuación máxima, el empate es de verdad: se resaltan todos y el aviso los nombra a todos.
- Con un solo vehículo en la comparación no hay "mejor": no se resalta nada y no hay aviso, igual que en el resto de la tabla.

## Criterios de aceptación
1. La tabla de comparar tiene una fila nueva, **"Golpe"**, al final. Cada vehículo apto muestra su puntuación entera. Cada vehículo no apto muestra "No apto: N de 4 plazas" o, si no se saben sus plazas, "No apto: plazas desconocidas".
2. Al comparar el HVY Insurgent Pick-Up, el Karin Kuruma (Armored) y el Pegassi Zentorno, la fila "Golpe" muestra 85, 70 y "No apto: 2 de 4 plazas". Solo la celda del Insurgent se resalta como la mejor de la fila. Encima de la tabla aparece "Mejor para el golpe: HVY Insurgent Pick-Up (85)".
3. Al comparar el Benefactor Schafter V12 (Armored) con el Karin Kuruma (Armored), los dos muestran 70 y los dos se resaltan. El aviso dice "Empate para el golpe: Benefactor Schafter V12 (Armored) y Karin Kuruma (Armored) (70)".
4. Al comparar el Pegassi Zentorno, el Truffade Adder y la Pegassi Bati 801, los tres muestran "No apto: 2 de 4 plazas" y no se resalta ninguno. El aviso dice "Ninguno sirve para el golpe: hace falta un vehículo de 4 plazas o más".
5. Al comparar el Karin Kuruma, el Pegassi Zentorno y el Truffade Adder, el Kuruma muestra 31 y se resalta, y los otros dos muestran "No apto: 2 de 4 plazas". El aviso dice "Mejor para el golpe: Karin Kuruma (31)".
6. Con solo el Karin Kuruma en la comparación, la fila "Golpe" muestra 31 sin resaltar y no aparece ningún aviso.
7. Al comparar la Brute Boxville con el Karin Kuruma, la Boxville muestra "No apto: plazas desconocidas" y el aviso dice "Mejor para el golpe: Karin Kuruma (31)".
8. Al quitar un vehículo de la comparación, la fila "Golpe" y el aviso se actualizan al momento. Por ejemplo, si en el criterio 2 se quita el Insurgent, el aviso pasa a "Mejor para el golpe: Karin Kuruma (Armored) (70)".
9. El listado, la ficha de cada vehículo, el garaje y las estrellas de búsqueda de la cabecera no cambian.

## Fuera de alcance
- Tipos de golpe distintos y sus requisitos: persecución, botín o un tamaño de banda que no sea 4.
- Enseñar la puntuación de golpe en la ficha, el listado o el garaje, o usarla para filtrar u ordenar.
- Tener en cuenta el precio, el dinero del jugador o si el vehículo se puede comprar.
- Mejoras de Los Santos Customs, capacidad de carga y resistencia a disparos o explosivos en números.
- Tests automáticos: la validación se hace a mano en la pantalla de comparar.
- Cualquier cambio en la API simulada.

## Preguntas abiertas
- El aspecto del aviso no se decidió (colores, icono, si usa el estilo de los avisos que ya tiene la app). La propuesta por defecto es seguir el estilo visual del comparador.
