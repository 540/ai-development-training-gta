import { useId } from 'react'

// siluetas de perfil dibujadas a mano (mirando a la derecha) a partir de fotos laterales
// de los coches reales en los que se inspiran los del juego. Todas en un lienzo de 200x80
// con el suelo en y=72, para que se puedan poner unas al lado de otras
//
// cuerpo: la carroceria, con los pasos de rueda ya recortados
// ventanas: cristales, tomas de aire y asientos (en oscuro)
// cristal: cristal claro, para el parabrisas de las motos que en oscuro no se ve
// extra: alerones, torretas, horquillas... (del color de la carroceria)
// encima: lo que va por delante de las ruedas (guardabarros y alforjas de las motos)
// ruedas: [x, y, radio]

const tipos: any = {
  // Lamborghini Veneno: muy bajo, cabina adelantada y alerón
  cuna: {
    cuerpo:
      'M14 64 L12 50 L16 44 L46 42 C62 40 76 32 96 30 L112 30 C124 31 134 38 146 44 L182 54 Q190 56 190 62 L186 64 L164 64 A14 14 0 0 0 136 64 L62 64 A14 14 0 0 0 34 64 Z',
    ventanas: 'M66 42 C76 35 86 33 98 33 L110 33 C120 34 128 39 134 43 Z M58 50 L86 47 L80 56 Z',
    extra: 'M6 35 L40 35 L40 39 L6 39 Z M24 39 L28 39 L30 44 L26 44 Z',
    ruedas: [[48, 60, 12], [150, 60, 12]],
  },
  // Bugatti Veyron: techo en cúpula y trasera redonda
  gt: {
    cuerpo:
      'M14 64 L12 54 C12 46 18 42 30 42 C48 40 60 30 84 27 C104 25 118 28 132 38 C150 44 174 46 186 52 C192 55 192 62 188 64 L164 64 A14 14 0 0 0 136 64 L64 64 A14 14 0 0 0 36 64 Z',
    ventanas: 'M70 41 C80 33 92 30 104 30 C114 30 122 34 128 40 Z',
    ruedas: [[50, 60, 12], [150, 60, 12]],
  },
  // Nissan GT-R: deportivo de dos puertas, caída tipo fastback
  coupe: {
    cuerpo:
      'M14 64 L12 52 L14 44 L36 42 C50 40 58 30 76 27 L104 26 C116 27 126 36 138 42 L180 47 C188 48 191 54 190 62 L186 64 L166 64 A14 14 0 0 0 138 64 L60 64 A14 14 0 0 0 32 64 Z',
    ventanas: 'M60 41 C66 34 74 30 84 30 L102 30 C110 31 118 36 126 41 Z',
    extra: 'M10 41 L22 41 L22 44 L10 44 Z M92 30 L95 30 L95 41 L92 41 Z',
    ruedas: [[46, 60, 12], [152, 60, 12]],
  },
  // Mitsubishi Lancer Evo: berlina deportiva, maletero alto
  sedan_dep: {
    cuerpo:
      'M14 64 L12 50 L16 42 L40 40 C48 39 54 30 66 26 L106 25 C118 26 128 34 140 40 L178 44 C188 46 191 52 190 62 L186 64 L168 64 A14 14 0 0 0 140 64 L60 64 A14 14 0 0 0 32 64 Z',
    ventanas: 'M56 39 C62 33 68 29 76 29 L104 29 C112 30 120 35 128 39 Z',
    extra: 'M12 37 L30 37 L30 40 L12 40 Z M88 29 L91 29 L91 39 L88 39 Z',
    ruedas: [[46, 60, 12], [154, 60, 12]],
  },
  // Ferrari 250 GT: capó larguísimo y cabina retrasada
  clasico: {
    cuerpo:
      'M14 64 L12 54 C12 46 20 43 34 42 C46 41 52 32 66 29 L86 28 C96 29 102 36 112 41 C140 42 172 42 184 48 C191 51 191 60 186 64 L162 64 A13 13 0 0 0 136 64 L58 64 A13 13 0 0 0 30 64 Z',
    ventanas: 'M56 41 C62 34 68 32 76 32 L86 32 C94 33 98 37 104 41 Z',
    ruedas: [[44, 61, 11], [149, 61, 11]],
  },
  // Bugatti Type 57: aletas sueltas, estribo y ruedas de banda blanca
  anos30: {
    cuerpo:
      'M30 56 C22 50 22 40 36 34 C50 27 64 23 82 23 C94 23 100 28 106 37 L150 39 C160 39 164 43 165 50 L165 56 Z ' +
      'M18 64 C18 50 30 42 46 42 C62 42 72 52 74 64 L60 64 A15 15 0 0 0 30 64 Z ' +
      'M126 64 C128 48 140 40 154 40 C170 40 184 52 190 64 L168 64 A15 15 0 0 0 138 64 Z ' +
      'M72 57 L128 57 L128 61 L72 61 Z',
    ventanas: 'M50 36 C60 30 70 27 82 27 C92 27 96 31 99 37 Z',
    ruedas: [[45, 60, 12], [153, 60, 12]],
    bandaBlanca: true,
  },
  // Ford Mustang: capó largo y plano, trasera corta
  muscle: {
    cuerpo:
      'M14 64 L12 48 L16 42 L42 41 C52 40 58 32 70 29 L98 28 C108 29 116 35 126 40 L182 42 L190 46 L190 60 L186 64 L166 64 A14 14 0 0 0 138 64 L60 64 A14 14 0 0 0 32 64 Z',
    ventanas: 'M58 40 C64 34 70 32 78 32 L96 32 C104 33 110 37 116 40 Z',
    extra: 'M140 40 L156 36 L160 40 Z',
    ruedas: [[46, 60, 12], [152, 60, 12]],
  },
  // Lincoln Town Car: berlina larga de tres volúmenes
  berlina: {
    cuerpo:
      'M10 63 L10 48 L40 45 L50 44 C54 40 58 32 66 30 L112 30 C120 31 128 38 136 43 L184 46 L192 48 L192 60 L188 63 L169 63 A13 13 0 0 0 143 63 L55 63 A13 13 0 0 0 29 63 Z',
    ventanas: 'M60 42 C63 37 66 33 72 33 L108 33 C114 34 120 38 126 42 Z',
    extra: 'M92 33 L96 33 L96 42 L92 42 Z',
    ruedas: [[42, 61, 11], [156, 61, 11]],
  },
  // Range Rover: alto, techo plano, ruedas grandes
  suv: {
    cuerpo:
      'M12 63 L12 32 L18 22 L132 20 C140 21 146 28 150 34 L184 38 C190 40 192 44 192 50 L192 60 L188 63 L173 63 A17 17 0 0 0 139 63 L63 63 A17 17 0 0 0 29 63 Z',
    ventanas: 'M20 34 L24 25 L128 23 C134 24 140 29 142 33 Z',
    extra: 'M60 23 L64 23 L64 34 L60 34 Z M100 23 L104 23 L104 34 L100 34 Z',
    ruedas: [[46, 58, 14], [156, 58, 14]],
  },
  // Ford F-150 Raptor: cabina y caja abierta detrás
  pickup: {
    cuerpo:
      'M10 63 L10 30 L74 30 L76 18 L128 17 C134 17 140 24 144 30 L184 33 C190 34 192 40 192 46 L192 60 L188 63 L172 63 A18 18 0 0 0 136 63 L60 63 A18 18 0 0 0 24 63 Z',
    ventanas: 'M82 30 L84 21 L126 20 C130 21 134 26 136 30 Z',
    extra: 'M102 20 L106 20 L106 30 L102 30 Z',
    ruedas: [[42, 57, 15], [154, 57, 15]],
  },
  // Meyers Manx: bañera abierta, motor atrás y arco antivuelco
  buggy: {
    cuerpo:
      'M22 58 C22 44 30 40 40 40 L60 44 L100 44 L120 40 C140 38 160 40 176 46 C184 49 188 54 188 58 L166 58 A16 16 0 0 0 134 58 L60 58 A16 16 0 0 0 28 58 Z M10 46 L22 46 L22 56 L12 56 Z',
    ventanas: 'M70 44 L76 30 L82 30 L80 44 Z',
    extra: 'M58 44 L66 18 L70 18 L62 44 Z M66 18 L104 18 L104 21 L66 21 Z M104 18 L116 40 L112 40 L101 21 Z',
    ruedas: [[44, 58, 14], [150, 58, 14]],
  },
  // Lenco BearCat: blindado cuadrado, parabrisas inclinado y torreta
  blindado: {
    cuerpo:
      'M10 62 L10 22 L22 16 L120 16 L140 30 L180 32 L192 38 L192 58 L188 62 L172 62 A18 18 0 0 0 136 62 L62 62 A18 18 0 0 0 26 62 Z',
    ventanas: 'M26 26 L50 26 L50 34 L26 34 Z M60 26 L92 26 L92 34 L60 34 Z M102 24 L118 24 L132 34 L102 34 Z',
    extra: 'M60 16 L64 8 L96 8 L100 16 Z M96 10 L122 10 L122 13 L96 13 Z',
    ruedas: [[44, 57, 15], [154, 57, 15]],
  },
  // Honda Civic: compacto de cinco puertas, más corto que el resto
  compacto: {
    cuerpo:
      'M32 63 L30 48 C30 40 32 34 38 30 L46 24 L100 22 C112 23 124 32 136 40 L162 44 C168 46 170 52 170 58 L168 63 L160 63 A14 14 0 0 0 132 63 L70 63 A14 14 0 0 0 42 63 Z',
    ventanas: 'M40 36 L48 28 L98 26 C108 27 116 32 124 38 Z',
    extra: 'M78 27 L81 27 L81 37 L78 37 Z',
    ruedas: [[56, 60, 12], [146, 60, 12]],
  },
  // Ford Transit: furgoneta alta con morro corto
  furgoneta: {
    cuerpo:
      'M10 63 L10 18 C10 14 14 12 18 12 L136 12 C144 12 150 16 154 22 L166 36 L184 40 C190 42 192 46 192 52 L192 60 L188 63 L167 63 A16 16 0 0 0 133 63 L57 63 A16 16 0 0 0 23 63 Z',
    ventanas: 'M140 16 C146 18 150 22 152 26 L162 36 L140 36 Z M108 16 L134 16 L134 32 L108 32 Z',
    ruedas: [[40, 59, 13], [150, 59, 13]],
  },
  // camión de reparto: caja grande y cabina pequeña
  camion: {
    cuerpo:
      'M8 63 L8 10 L140 10 L150 14 L160 30 L184 34 C190 36 192 40 192 48 L192 60 L188 63 L169 63 A16 16 0 0 0 135 63 L57 63 A16 16 0 0 0 23 63 Z',
    ventanas: 'M144 18 L154 30 L144 30 Z',
    extra: 'M140 10 L142 10 L142 50 L140 50 Z',
    ruedas: [[40, 59, 13], [152, 59, 13]],
  },
  // Yamaha R1: moto deportiva carenada, colin alto y corto
  moto: {
    cuerpo:
      'M38 28 L62 36 L86 36 L104 28 L122 28 L134 18 L140 18 C148 22 154 28 154 34 L146 46 L128 54 L100 56 L88 50 L80 44 L62 42 L44 34 Z',
    ventanas: 'M126 26 L134 19 L140 19 L134 28 Z M86 44 L120 46 L118 54 L96 54 Z M62 36 L86 36 L84 39 L64 39 Z',
    extra: 'M46 56 L90 48 L92 52 L48 60 Z M150 58 L136 28 L140 26 L154 56 Z',
    ruedas: [[46, 58, 14], [152, 58, 14]],
  },
  // Harley Road King: moto custom baja, alforjas sobre la rueda y parabrisas alto
  custom: {
    cuerpo:
      'M86 38 C92 30 112 28 124 32 L126 40 L90 44 Z M136 30 C146 28 150 36 144 42 L134 40 Z M30 62 L92 60 L92 63 L30 64 Z ' +
      'M56 38 C66 43 78 43 88 37 L90 44 L56 46 Z M56 44 L128 38 L130 42 L58 50 Z M92 56 L126 54 L126 58 L92 60 Z',
    ventanas: 'M94 46 L124 43 L120 55 L98 56 Z',
    cristal: 'M128 34 L132 12 L140 12 L138 34 Z',
    extra: 'M132 34 L156 58 L152 60 L128 36 Z',
    ruedas: [[40, 58, 14], [156, 58, 14]],
    // las alforjas y el guardabarros tapan parte de las ruedas
    encima:
      'M24 40 L58 40 L58 54 C58 58 55 60 51 60 L31 60 C27 60 24 57 24 53 Z ' +
      'M140 52 C142 44 150 42 158 42 C166 42 172 48 172 54 L166 54 C164 50 160 48 156 48 C150 48 146 50 146 54 Z',
  },
}

// cada modelo con la silueta que mas se le parece
const porModelo: any = {
  Zentorno: 'cuna', Tezeract: 'cuna', Visione: 'cuna', Osiris: 'cuna', T20: 'cuna', S80RR: 'cuna', Infernus: 'cuna',
  Adder: 'gt', Turismo: 'gt', Entity: 'gt', Bullet: 'gt', Voltic: 'gt',
  Elegy: 'coupe', Banshee: 'coupe', Jester: 'coupe', Carbonizzare: 'coupe', '9F': 'coupe', Comet: 'coupe',
  Feltzer: 'coupe', Massacro: 'coupe', Furore: 'coupe', Pariah: 'coupe', Schwartzer: 'coupe', F620: 'coupe',
  Exemplar: 'coupe', Windsor: 'coupe', Zion: 'coupe', Oracle: 'coupe',
  Kuruma: 'sedan_dep', Sultan: 'sedan_dep', Schafter: 'sedan_dep',
  Stinger: 'clasico', Monroe: 'clasico', 'JB 700': 'clasico',
  'Z-Type': 'anos30',
  Gauntlet: 'muscle', Sabre: 'muscle', Vigero: 'muscle', Dukes: 'muscle', Phoenix: 'muscle', Dominator: 'muscle',
  Washington: 'berlina', Premier: 'berlina', Stanier: 'berlina', Fugitive: 'berlina', Cognoscenti: 'berlina', Asterope: 'berlina',
  Cavalcade: 'suv', Gresley: 'suv', Baller: 'suv', Rocoto: 'suv', Toros: 'suv', Dubsta: 'suv', Patriot: 'suv',
  Kamacho: 'pickup', Sandking: 'pickup', Brawler: 'pickup',
  Bifta: 'buggy',
  Insurgent: 'blindado', Nightshark: 'blindado',
  Blista: 'compacto', Dilettante: 'compacto', Issi: 'compacto', Brioso: 'compacto', Panto: 'compacto',
  Youga: 'furgoneta', Speedo: 'furgoneta', Minivan: 'furgoneta',
  Boxville: 'camion', Stockade: 'camion',
  Carbon: 'moto', Akuma: 'moto', Bati: 'moto', Hakuchou: 'moto', Lectro: 'moto', Oppressor: 'moto',
  Bagger: 'custom',
}

// si sale un modelo nuevo que no esta en la lista, tiramos de la clase
const porClase: any = {
  Super: 'cuna',
  Sports: 'coupe',
  'Sports Classics': 'clasico',
  Muscle: 'muscle',
  Sedans: 'berlina',
  SUVs: 'suv',
  'Off-Road': 'pickup',
  Compacts: 'compacto',
  Coupes: 'coupe',
  Vans: 'furgoneta',
  Motorcycles: 'moto',
}

export function tipoSilueta(c: any) {
  return porModelo[c.baseModel] || porClase[c.vclassEn] || 'coupe'
}

// el coche de perfil pintado del color que le pases
export function Silueta(props: any) {
  const id = 'silueta' + useId().replace(/:/g, '')
  const t = tipos[tipoSilueta(props.coche)]
  const color = props.color
  return (
    <svg
      className={'silueta ' + (props.className || '')}
      viewBox="0 0 200 80"
      role="img"
      aria-label={'Silueta del ' + props.coche.make + ' ' + props.coche.model}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} />
          <stop offset="1" stopColor={color} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="73" rx="92" ry="4" fill="rgba(0,0,0,0.45)" />
      <path d={t.cuerpo} fill={'url(#' + id + ')'} />
      {t.ventanas && <path d={t.ventanas} fill="rgba(12,4,24,0.85)" />}
      {t.cristal && <path d={t.cristal} fill="rgba(220,230,255,0.4)" />}
      {t.extra && <path d={t.extra} fill={color} />}
      {t.ruedas.map((r: any, i: number) => (
        <g key={i}>
          <circle cx={r[0]} cy={r[1]} r={r[2]} fill="#0b0414" />
          {t.bandaBlanca && <circle cx={r[0]} cy={r[1]} r={r[2] * 0.75} fill="none" stroke="#f5ecff" strokeWidth={r[2] * 0.18} />}
          <circle cx={r[0]} cy={r[1]} r={r[2] * 0.5} fill="#2a2235" stroke="#cbd5e1" strokeWidth="1.2" />
          <circle cx={r[0]} cy={r[1]} r={r[2] * 0.12} fill="#cbd5e1" />
        </g>
      ))}
      {t.encima && <path d={t.encima} fill={color} />}
    </svg>
  )
}
