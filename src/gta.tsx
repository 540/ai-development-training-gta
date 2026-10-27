import { useEffect, useRef, useState } from 'react'

// todo lo que hace que la web se sienta GTA: estrellas de busqueda, barras de estadisticas
// como las del juego, el HUD con el dinero, los avisos de "mision superada" / "wasted",
// los trucos, las noticias y los consejos de la pantalla de carga

// el mismo tope que usa la api para la puntuacion de rendimiento
const MAX_MPH = 140

// el dinero con el que empiezas (lo justo para un par de superdeportivos)
export const DINERO_INICIAL = 1500000

function num(x: any) {
  return Number(x).toLocaleString('es-ES')
}

// cuanto te busca la policia si sales con este coche (de 1 a 5 estrellas)
// va con el objeto ya convertido (el de convertir() en App.tsx)
export function nivelBusqueda(c: any) {
  let n = 1
  if (c.velocidad >= 210) n += 2
  else if (c.velocidad >= 190) n += 1
  if (c.armor == 'Light') n += 1
  if (c.armor == 'Heavy') n += 2
  if (c.armado) n += 2
  if (c.price >= 1000000) n += 1
  return Math.min(5, n)
}

// la velocidad en % para las barras (la api va en millas)
export function pctVelocidad(mph: any) {
  return Math.min(100, (mph / MAX_MPH) * 100)
}

// la estrella del logo
const ESTRELLA = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z'

export function Estrellas(props: any) {
  return (
    <span
      className={props.grande ? 'estrellas estrellas-grande' : 'estrellas'}
      role="img"
      aria-label={'Nivel de búsqueda: ' + props.nivel + ' de 5'}
      title={'Nivel de búsqueda: ' + props.nivel + ' de 5'}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={i <= props.nivel ? 'estrella estrella-llena' : 'estrella'}>
          <path d={ESTRELLA} />
        </svg>
      ))}
    </span>
  )
}

// barra de estadistica como la del concesionario del juego (valor de 0 a 100)
export function Barra(props: any) {
  const pct = Math.max(0, Math.min(100, props.valor || 0))
  return (
    <div className="barra">
      {props.titulo && (
        <div className="barra-titulo">
          <span>{props.titulo}</span>
          <span>{props.texto}</span>
        </div>
      )}
      <div className="barra-fondo">
        <div className="barra-relleno" style={{ width: pct + '%', backgroundColor: props.color }} />
      </div>
    </div>
  )
}

// arriba a la derecha, como en el juego: las estrellas y el dinero
export function Hud(props: any) {
  const [parpadeo, setParpadeo] = useState(false)
  const [diferencia, setDiferencia] = useState<any>(null)
  const nivelAntes = useRef(props.nivel)
  const dineroAntes = useRef(props.dinero)

  // las estrellas parpadean cuando sube el nivel
  useEffect(() => {
    const subio = props.nivel > nivelAntes.current
    nivelAntes.current = props.nivel
    if (!subio) return
    setParpadeo(true)
    const t = setTimeout(() => setParpadeo(false), 2000)
    return () => clearTimeout(t)
  }, [props.nivel])

  // el +$ / -$ que sale debajo del dinero
  useEffect(() => {
    const d = props.dinero - dineroAntes.current
    dineroAntes.current = props.dinero
    if (d == 0) return
    setDiferencia({ valor: d, id: Date.now() })
    const t = setTimeout(() => setDiferencia(null), 2500)
    return () => clearTimeout(t)
  }, [props.dinero])

  return (
    <div className="hud">
      <div className={parpadeo ? 'hud-estrellas parpadeo' : 'hud-estrellas'}>
        <Estrellas nivel={props.nivel} grande />
      </div>
      <div className="hud-dinero">
        <span aria-label={'Tienes ' + num(props.dinero) + ' GTA$'}>${num(props.dinero)}</span>
        {diferencia && (
          <span key={diferencia.id} className={diferencia.valor > 0 ? 'hud-diferencia' : 'hud-diferencia hud-gasto'}>
            {diferencia.valor > 0 ? '+' : '-'}${num(Math.abs(diferencia.valor))}
          </span>
        )}
      </div>
    </div>
  )
}

// el letrero grande en mitad de la pantalla (tipo: exito, wasted o truco)
export function Aviso(props: any) {
  const a = props.aviso
  return (
    <div className="aviso-zona" role="status" aria-live="polite">
      {a && (
        <div key={a.id} className={'aviso aviso-' + a.tipo}>
          <p className="aviso-titulo">{a.titulo}</p>
          {a.texto && <p className="aviso-texto">{a.texto}</p>}
        </div>
      )}
    </div>
  )
}

const noticias = [
  'Un Zentorno cruza Vinewood Boulevard a más de 200 km/h: la policía sigue buscando al conductor',
  'Los Santos Customs paga la mitad de lo que costó tu coche y aun así tiene cola',
  'Vecinos de Grove Street denuncian un desfile de lowriders a las tres de la mañana',
  'Un Insurgent bloquea dos carriles de la autopista del Senora; nadie se atreve a pitarle',
  'Se busca a un individuo que compró tres coches blindados en una sola tarde',
  'El ayuntamiento promete arreglar los baches de Del Perro. Otra vez',
  'Récord de multas en Rockford Hills: el 90 % eran superdeportivos',
  'Aparece una Oppressor aparcada en el tejado del Maze Bank. Nadie sabe cómo',
]

// la cinta de noticias de debajo de la cabecera
export function Noticias() {
  return (
    <div className="noticias">
      <span className="noticias-marca">Última hora</span>
      <div className="noticias-cinta">
        <div className="noticias-pista">
          {[...noticias, ...noticias].map((n, i) => (
            <span key={i} aria-hidden={i >= noticias.length}>
              {n}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

const consejos = [
  'Marca hasta tres vehículos con «+ Comparar» para verlos lado a lado.',
  'Los Santos Customs te paga la mitad de lo que costó el coche. No te encariñes.',
  'Cuanto más blindaje, armas y velocidad, más estrellas. La policía no perdona.',
  'Un coche blindado aguanta más balas, pero frena peor. Elige con cabeza.',
  'La velocidad punta no lo es todo: el manejo es lo que te saca de las curvas de Vinewood Hills.',
  'Dicen que si tecleas HESOYAM fuera de los campos de texto pasan cosas.',
  'Si la policía te pisa los talones, prueba a teclear AEZAKMI.',
]

// el recuadro de "consejo" de las pantallas de carga
export function Consejo() {
  const [i] = useState(() => Math.floor(Math.random() * consejos.length))
  return (
    <div className="consejo">
      <span className="consejo-marca">Consejo</span>
      <p>{consejos[i]}</p>
    </div>
  )
}

// escucha el teclado y lanza el truco cuando se teclea su nombre (fuera de los campos de texto)
export function useTrucos(trucos: any) {
  const ref = useRef(trucos)
  ref.current = trucos

  useEffect(() => {
    let tecleado = ''
    const f = (e: KeyboardEvent) => {
      const t: any = e.target
      if (t && (t.tagName == 'INPUT' || t.tagName == 'SELECT' || t.tagName == 'TEXTAREA')) return
      if (e.key.length != 1) return
      tecleado = (tecleado + e.key.toUpperCase()).slice(-20)
      Object.keys(ref.current).forEach((codigo) => {
        if (tecleado.endsWith(codigo)) {
          tecleado = ''
          ref.current[codigo]()
        }
      })
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [])
}

// los edificios del horizonte: [x, ancho, alto, remate] (remate: 0 plano, 1 escalonado art deco, 2 antena)
const edificios = [
  [360, 40, 70, 0], [402, 30, 110, 2], [434, 46, 90, 1], [482, 34, 150, 1], [518, 28, 80, 0], [548, 50, 190, 2],
  [600, 36, 120, 1], [638, 44, 100, 0], [684, 30, 230, 2], [716, 56, 160, 1], [774, 38, 130, 0], [814, 48, 210, 1],
  [864, 30, 95, 0], [896, 52, 175, 2], [950, 36, 120, 1], [988, 44, 145, 0], [1034, 30, 200, 2], [1066, 50, 110, 1],
  [1118, 38, 85, 0], [1158, 46, 130, 1], [1206, 34, 70, 0],
]

const HORIZONTE = 720

// ventanitas encendidas, siempre las mismas para que no cambien en cada render
function ventanas() {
  const v: any = []
  edificios.forEach((e: any, i: number) => {
    for (let y = HORIZONTE - e[2] + 14; y < HORIZONTE - 8; y += 12) {
      for (let x = e[0] + 6; x < e[0] + e[1] - 6; x += 9) {
        if ((x * 7 + y * 13 + i * 31) % 5 == 0) v.push([x, y])
      }
    }
  })
  return v
}
const luces = ventanas()

function Edificio(props: any) {
  const [x, w, h, remate] = props.e
  const top = HORIZONTE - h
  return (
    <g>
      <rect x={x} y={top} width={w} height={h} />
      {remate == 1 && <rect x={x + w * 0.2} y={top - 14} width={w * 0.6} height={14} />}
      {remate == 1 && <rect x={x + w * 0.35} y={top - 24} width={w * 0.3} height={10} />}
      {remate == 2 && <rect x={x + w / 2 - 1.5} y={top - 40} width={3} height={40} />}
    </g>
  )
}

// el atardecer de Vice City que va fijo detras de toda la web
export function FondoViceCity(props: any) {
  return (
    <div className={props.gris ? 'fondo-vice fondo-gris' : 'fondo-vice'} aria-hidden="true">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="vice-cielo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#12071f" />
            <stop offset="0.38" stopColor="#2a0f45" />
            <stop offset="0.62" stopColor="#6d1b67" />
            <stop offset="0.74" stopColor="#d6267f" />
            <stop offset="0.8" stopColor="#ff7a3d" />
          </linearGradient>
          <linearGradient id="vice-sol" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe066" />
            <stop offset="0.55" stopColor="#ff8a00" />
            <stop offset="1" stopColor="#ff2d95" />
          </linearGradient>
          <linearGradient id="vice-mar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b1258" />
            <stop offset="1" stopColor="#12071f" />
          </linearGradient>
          {/* las franjas del sol, cada vez mas gruesas hacia abajo */}
          <mask id="vice-franjas">
            <rect x="0" y="0" width="1600" height="900" fill="#fff" />
            {[
              [612, 3],
              [636, 4],
              [656, 6],
              [674, 7],
              [690, 9],
              [705, 11],
            ].map((f) => (
              <rect key={f[0]} x="0" y={f[0]} width="1600" height={f[1]} fill="#000" />
            ))}
          </mask>
          <symbol id="vice-palmera" overflow="visible">
            <path d="M-12 0 C-10 -150 10 -320 40 -470 L52 -468 C26 -320 10 -150 12 0 Z" />
            <path d="M46 -470 C120 -500 190 -470 230 -400 C180 -440 120 -455 46 -462 Z" />
            <path d="M46 -470 C100 -540 170 -560 220 -530 C160 -530 100 -510 46 -462 Z" />
            <path d="M46 -470 C-20 -500 -100 -470 -140 -400 C-90 -440 -30 -455 46 -462 Z" />
            <path d="M46 -470 C0 -540 -70 -565 -120 -540 C-60 -535 -10 -510 46 -462 Z" />
            <path d="M46 -470 C90 -460 130 -410 140 -340 C110 -400 80 -440 46 -462 Z" />
            <path d="M46 -470 C0 -460 -40 -410 -50 -340 C-20 -400 10 -440 46 -462 Z" />
            <path d="M46 -470 C50 -540 80 -590 120 -600 C90 -570 70 -520 50 -462 Z" />
            <circle cx="38" cy="-456" r="8" />
            <circle cx="54" cy="-454" r="8" />
          </symbol>
        </defs>

        <rect width="1600" height="900" fill="url(#vice-cielo)" />
        {/* alguna estrella arriba */}
        <g fill="#f5ecff">
          {[
            [120, 60], [310, 140], [520, 40], [700, 110], [930, 70], [1120, 150], [1290, 50], [1480, 120], [220, 230], [1400, 260],
          ].map((s, i) => (
            <circle key={i} cx={s[0]} cy={s[1]} r={i % 3 == 0 ? 1.6 : 1} opacity={0.5} />
          ))}
        </g>

        <circle cx="800" cy="640" r="190" fill="url(#vice-sol)" mask="url(#vice-franjas)" />

        <g fill="#1d0a33">
          {edificios.map((e, i) => (
            <Edificio key={i} e={e} />
          ))}
        </g>
        <g fill="#ffb86b" opacity="0.55">
          {luces.map((l: any, i: number) => (
            <rect key={i} x={l[0]} y={l[1]} width="3" height="4" />
          ))}
        </g>

        <rect y={HORIZONTE} width="1600" height={900 - HORIZONTE} fill="url(#vice-mar)" />
        <rect y={HORIZONTE} width="1600" height="2" fill="#ff7a3d" opacity="0.8" />
        {/* el reflejo del sol en el agua */}
        <g fill="#ff8a00">
          {[
            [735, 230, 0.7],
            [752, 190, 0.6],
            [770, 150, 0.5],
            [790, 110, 0.4],
            [812, 80, 0.3],
            [838, 50, 0.22],
          ].map((r) => (
            <rect key={r[0]} x={800 - r[1] / 2} y={r[0]} width={r[1]} height="3" rx="1.5" opacity={r[2]} />
          ))}
        </g>

        <g fill="#0b0414">
          <use href="#vice-palmera" transform="translate(70 905) scale(1.25)" />
          <use href="#vice-palmera" transform="translate(250 910) scale(0.9) rotate(4)" />
          <use href="#vice-palmera" transform="translate(1530 905) scale(-1.3 1.3)" />
          <use href="#vice-palmera" transform="translate(1360 912) scale(-0.85 0.85) rotate(-3)" />
        </g>
      </svg>
    </div>
  )
}
