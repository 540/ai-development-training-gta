import { useEffect, useRef, useState } from 'react'
import starLogo from './assets/star.svg'
import gaugeIcon from './assets/gauge.svg'
import boltIcon from './assets/bolt.svg'
import shieldIcon from './assets/shield.svg'
import { Aviso, Barra, Consejo, DINERO_INICIAL, Estrellas, FondoViceCity, Hud, Noticias, nivelBusqueda, pctVelocidad, useTrucos } from './gta'
import { CreditoFoto, FotoCoche, SombraCoche } from './fotos'
import { mejoresParaGolpe, puntuacionGolpe, unirConY } from './dominio/golpe'

const API = '/api'

// colores de cada clase (copiados del css, si cambias uno cambia el otro!!)
const colores: any = {
  Super: '#ff2d95',
  Sports: '#ff8a00',
  'Sports Classics': '#c084fc',
  Muscle: '#ef4444',
  Sedans: '#38bdf8',
  SUVs: '#22c55e',
  'Off-Road': '#a3a635',
  Compacts: '#f472b6',
  Coupes: '#818cf8',
  Vans: '#94a3b8',
  Motorcycles: '#2de2e6',
}

// los nombres en castellano, la api los manda en ingles
const nombresClase: any = {
  Super: 'Superdeportivo',
  Sports: 'Deportivo',
  'Sports Classics': 'Clásico deportivo',
  Muscle: 'Muscle car',
  Sedans: 'Berlina',
  SUVs: 'SUV',
  'Off-Road': 'Todoterreno',
  Compacts: 'Compacto',
  Coupes: 'Cupé',
  Vans: 'Furgoneta',
  Motorcycles: 'Moto',
}

const tracciones: any = {
  RWD: 'Trasera',
  FWD: 'Delantera',
  AWD: 'Total',
}

const blindajes: any = {
  None: 'Sin blindaje',
  Light: 'Blindaje ligero',
  Heavy: 'Blindaje pesado',
}

const armas: any = {
  None: 'Sin armas',
  'Machine guns': 'Ametralladoras',
  Missiles: 'Misiles',
  Turret: 'Torreta',
}

// lo de las versiones viene tipo "Heavy armor, AWD, 4 seats"
function traducirVersion(v: any) {
  return v
    .replace('Heavy armor', 'Blindaje pesado')
    .replace('Light armor', 'Blindaje ligero')
    .replace('AWD', 'Tracción total')
    .replace('RWD', 'Tracción trasera')
    .replace('FWD', 'Tracción delantera')
    .replace(' seats', ' plazas')
    .replace(/^1 plazas/, '1 plaza')
    .replace(', 1 plazas', ', 1 plaza')
}

// numeros a la española (punto para los miles)
function num(x: any) {
  return Number(x).toLocaleString('es-ES')
}

// las estadisticas siempre con un decimal (78,0 y no 78)
function dec(x: any) {
  if (x == null) return '—'
  return Number(x).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

// los fabricantes que salen en el desplegable, si falta alguno hay que añadirlo aqui
const marcas = [
  'Albany',
  'Annis',
  'Benefactor',
  'BF',
  'Bravado',
  'Brute',
  'Canis',
  'Cheval',
  'Coil',
  'Declasse',
  'Dewbauchee',
  'Dinka',
  'Enus',
  'Gallivanter',
  'Grotti',
  'HVY',
  'Imponte',
  'Karin',
  'Lampadati',
  'Mammoth',
  'Nagasaki',
  'Obey',
  'Ocelot',
  'Overflod',
  'Pegassi',
  'Pfister',
  'Principe',
  'Progen',
  'Shitzu',
  'Truffade',
  'Ubermacht',
  'Vapid',
  'Weeny',
  'Western',
]

// aqui guardamos lo que viene de la api para no pedirlo dos veces
var cache: any = {}

// TODO: mover esto a otro sitio algun dia
function sacarRuta() {
  let h = window.location.hash.replace('#/', '').replace('#', '')
  return h
}

// la api a veces devuelve una lista, a veces un objeto suelto y a veces null (??)
function aLista(x: any) {
  if (!x || !x.menuItem) return []
  if (Array.isArray(x.menuItem)) return x.menuItem
  return [x.menuItem]
}

// hace la peticion a la api
// IMPORTANTE: hay que mandar el Accept que si no devuelve XML!!
// (se podria usar axios pero no merece la pena)
function pedir(url: string) {
  return fetch(API + url, { headers: { Accept: 'application/json' } }).then((r) => {
    if (!r.ok) throw new Error('fallo ' + r.status)
    return r.json()
  })
}

// la api va en millas por hora, aqui lo pasamos a km/h
const KM_POR_MILLA = 1.609344

function km(millas: any) {
  if (!millas) return null
  return Math.round(millas * KM_POR_MILLA)
}

// convierte lo de la api a lo nuestro (la api lo manda todo como texto)
function convertir(d: any) {
  const c = {
    id: '' + d.id,
    make: d.make,
    model: d.model,
    baseModel: d.baseModel,
    vclassEn: d.VClass,
    vclass: nombresClase[d.VClass] || d.VClass,
    drive: tracciones[d.drive] || d.drive,
    seats: d.seats ? Number(d.seats) : null,
    armor: d.armor,
    blindaje: blindajes[d.armor] || d.armor,
    armas: armas[d.weapons] || d.weapons,
    armado: d.weapons != 'None',
    velocidad: km(Number(d.topSpeed)),
    topSpeed: Number(d.topSpeed),
    acceleration: Number(d.acceleration),
    braking: Number(d.braking),
    traction: Number(d.traction),
    price: Number(d.price),
    sellPrice: Number(d.sellPrice),
    perfScore: Number(d.perfScore),
  }
  return { ...c, busqueda: nivelBusqueda(c), golpe: puntuacionGolpe(c) }
}

function leerComparar() {
  try {
    return JSON.parse(localStorage.getItem('comparar') || '[]')
  } catch (e) {
    return []
  }
}

function leerGaraje() {
  try {
    return JSON.parse(localStorage.getItem('garaje') || '[]')
  } catch (e) {
    return []
  }
}

function leerDinero() {
  try {
    const d = localStorage.getItem('dinero')
    return d == null ? DINERO_INICIAL : Number(d)
  } catch (e) {
    return DINERO_INICIAL
  }
}

export default function App() {
  const [ruta, setRuta] = useState(sacarRuta())
  const [comparar, setComparar] = useState<any>(leerComparar())
  const [garaje, setGaraje] = useState<any>(leerGaraje())
  const [dinero, setDinero] = useState<any>(leerDinero())
  const [busqueda, setBusqueda] = useState(0)
  const [sinPolicia, setSinPolicia] = useState(false) // truco AEZAKMI
  const [aviso, setAviso] = useState<any>(null)
  const temporizador = useRef<any>(null)

  // el letrero grande de en medio, se quita solo
  const avisar = (titulo: string, texto: string, tipo: string) => {
    clearTimeout(temporizador.current)
    setAviso({ titulo, texto, tipo, id: Date.now() })
    temporizador.current = setTimeout(() => setAviso(null), tipo == 'wasted' ? 3000 : 2200)
  }

  const cambiarDinero = (d: any) => {
    setDinero(d)
    localStorage.setItem('dinero', '' + d)
  }

  const cambiarGaraje = (g: any) => {
    setGaraje(g)
    localStorage.setItem('garaje', JSON.stringify(g))
  }

  const comprar = (c: any) => {
    if (garaje.some((x: any) => x.id == c.id)) return
    if (dinero < c.price) {
      avisar('Sin fondos', 'Te faltan ' + num(c.price - dinero) + ' GTA$ para el ' + c.model, 'wasted')
      return
    }
    cambiarDinero(dinero - c.price)
    cambiarGaraje([
      ...garaje,
      { id: c.id, make: c.make, model: c.model, baseModel: c.baseModel, vclassEn: c.vclassEn, price: c.price, sellPrice: c.sellPrice, busqueda: c.busqueda },
    ])
    avisar('¡Comprado!', c.make + ' ' + c.model + ' ya está en tu garaje', 'exito')
  }

  const vender = (c: any) => {
    cambiarDinero(dinero + c.sellPrice)
    cambiarGaraje(garaje.filter((x: any) => x.id != c.id))
    avisar('Vendido', 'Los Santos Customs te paga ' + num(c.sellPrice) + ' GTA$', 'exito')
  }

  useTrucos({
    HESOYAM: () => {
      cambiarDinero(dinero + 250000)
      avisar('Truco activado', '+250.000 GTA$ en la cuenta', 'truco')
    },
    AEZAKMI: () => {
      setSinPolicia(!sinPolicia)
      avisar('Truco activado', sinPolicia ? 'La policía vuelve a buscarte' : 'La policía ya no te busca', 'truco')
    },
  })

  // las estrellas del HUD son las del vehiculo mas buscado de la comparacion
  useEffect(() => {
    Promise.all(
      comparar.map((id: any) =>
        cache[id]
          ? Promise.resolve(cache[id])
          : pedir('/vehicle/' + id).then((d) => {
              cache[d.id] = d
              return d
            }),
      ),
    )
      .then((arr: any) => setBusqueda(Math.max(0, ...arr.map((d: any) => convertir(d).busqueda))))
      .catch(() => setBusqueda(0))
  }, [comparar])

  useEffect(() => {
    // router casero con el hash, no hace falta meter librerias
    const f = () => {
      setRuta(sacarRuta())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])

  const cambiarComparar = (id: string) => {
    let nuevo: any = []
    if (comparar.includes(id)) {
      nuevo = comparar.filter((x: any) => x != id)
    } else {
      // maximo 3 que si no la tabla no cabe
      if (comparar.length >= 3) return
      nuevo = [...comparar, id]
      const d = cache[id]
      if (nuevo.length == 3) {
        avisar('¡Banda completa!', 'Ya tienes tres. Hora de comparar', 'exito')
      } else if (d) {
        avisar('Fichado', d.make + ' ' + d.model + ' entra en la comparación', 'exito')
      }
    }
    setComparar(nuevo)
    // lo guardamos para que no se pierda al recargar
    localStorage.setItem('comparar', JSON.stringify(nuevo))
    // console.log('comparar', nuevo)
  }

  let pagina: any = null
  if (ruta == '') {
    pagina = <Home comparar={comparar} cambiarComparar={cambiarComparar} />
  } else if (ruta == 'compare') {
    pagina = <Comparar comparar={comparar} cambiarComparar={cambiarComparar} />
  } else if (ruta == 'garage') {
    pagina = <Garaje garaje={garaje} vender={vender} />
  } else {
    pagina = (
      <Detalle
        id={ruta.replace('vehicle/', '')}
        comparar={comparar}
        cambiarComparar={cambiarComparar}
        garaje={garaje}
        comprar={comprar}
        vender={vender}
      />
    )
  }

  // con un wasted la pantalla se pone en gris, como en el juego
  const gris = aviso && aviso.tipo == 'wasted'

  return (
    <>
      {/* fuera de .pantalla: con el filtro del gris un position fixed dentro dejaria de ser fijo */}
      <FondoViceCity gris={gris} />
      <div className={gris ? 'pantalla pantalla-gris' : 'pantalla'}>
        <div className="cabecera">
          <div className="cabecera-dentro">
            <a href="#/" className="logo">
              <img src={starLogo} alt="logo" />
              <span>Comparador GTA</span>
            </a>
            <ul className="menu">
              <li>
                <a href="#/" className={ruta == '' ? 'activo' : ''}>
                  Inicio
                </a>
              </li>
              <li>
                <a href="#/garage" className={ruta == 'garage' ? 'activo' : ''}>
                  Garaje ({garaje.length})
                </a>
              </li>
              <li>
                <a href="#/compare" className={ruta == 'compare' ? 'activo' : ''}>
                  Comparar ({comparar.length})
                </a>
              </li>
            </ul>
            <Hud nivel={sinPolicia ? 0 : busqueda} dinero={dinero} />
          </div>
        </div>
        <Noticias />
        {pagina}
      </div>
      <Aviso aviso={aviso} />
    </>
  )
}

function Garaje(props: any) {
  if (props.garaje.length == 0) {
    return (
      <div className="main">
        <h1>Mi garaje</h1>
        <h2>Tu garaje está vacío</h2>
        <p>
          Compra algo en el <a href="#/">listado</a>. Y si no te llega el dinero, ya sabes qué teclear.
        </p>
      </div>
    )
  }

  let valor = 0
  props.garaje.forEach((c: any) => (valor += c.sellPrice || 0))

  return (
    <div className="main">
      <h1>Mi garaje</h1>
      <p className="garaje-resumen">
        {props.garaje.length} {props.garaje.length == 1 ? 'vehículo' : 'vehículos'} · Los Santos Customs te daría{' '}
        {num(valor)} GTA$ por todo
      </p>
      <div className="lista">
        {props.garaje.map((c: any) => (
          <div key={c.id} className="card card-garaje" style={{ borderTopColor: colores[c.vclassEn] }}>
            <a href={'#/vehicle/' + c.id}>
              <FotoCoche coche={c} color={colores[c.vclassEn]} className="card-foto" />
              <p className="card-nombre">
                {c.make} {c.model}
              </p>
              <p className="card-trim">Pagaste {num(c.price)} GTA$</p>
              <div className="card-chips">
                <Estrellas nivel={c.busqueda} />
              </div>
            </a>
            <button className="boton" onClick={() => props.vender(c)}>
              Vender por {num(c.sellPrice)} GTA$
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function Home(props: any) {
  // estado del listado
  const [clase, setClase] = useState('Super') // la clase
  const [marca, setMarca] = useState('all') // all = todas
  const [texto, setTexto] = useState('')
  const [armor, setArmor] = useState('all')
  const [comp, setComp] = useState('greater')
  const [valor, setValor] = useState<any>('') // vacio = sin filtro
  const [coches, setCoches] = useState<any>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    setCoches(null)
    setError(false)
    // primero los fabricantes (si no hay uno elegido), luego los modelos de cada uno,
    // luego las versiones de cada modelo y luego cada version una a una
    // (son muchas peticiones pero la api no tiene otra forma)
    const fabricantes =
      marca == 'all'
        ? pedir('/vehicle/menu/make?class=' + encodeURIComponent(clase)).then((d) => aLista(d).map((x: any) => x.value))
        : Promise.resolve([marca])
    fabricantes
      .then((ms: any) =>
        Promise.all(
          ms.map((m: any) =>
            pedir('/vehicle/menu/model?class=' + encodeURIComponent(clase) + '&make=' + encodeURIComponent(m)).then(
              (data) => aLista(data).map((x: any) => ({ make: m, model: x.value })),
            ),
          ),
        ),
      )
      .then((porMarca: any) => {
        let modelos: any = []
        porMarca.forEach((x: any) => (modelos = modelos.concat(x)))
        Promise.all(
          modelos.map((m: any) =>
            pedir(
              '/vehicle/menu/options?class=' +
                encodeURIComponent(clase) +
                '&make=' +
                encodeURIComponent(m.make) +
                '&model=' +
                encodeURIComponent(m.model),
            ).then((o) => aLista(o).map((x: any) => ({ id: x.value, trim: x.text }))),
          ),
        )
          .then((versiones: any) => {
            let todas: any = []
            versiones.forEach((v: any) => (todas = todas.concat(v)))
            return Promise.all(
              todas.map((v: any) =>
                pedir('/vehicle/' + v.id).then((d) => {
                  cache[d.id] = d
                  return { ...convertir(d), trim: v.trim }
                }),
              ),
            )
          })
          .then((arr: any) => {
            console.log('coches cargados', arr.length)
            // arr.sort((a: any, b: any) => b.velocidad - a.velocidad) // ordenar por velocidad, lo quito que tarda
            setCoches(arr)
          })
          .catch(() => setError(true))
      })
      .catch((e) => {
        console.log(e)
        setError(true)
      })
  }, [clase, marca])

  let lista: any = null
  if (coches) {
    lista = coches.filter((c: any) => {
      const s = texto.toLowerCase()
      let ok = true
      let txt = texto.trim().length == 0
      let v = valor
      let okKmh = true
      if (!txt) {
        txt = c.model.toLowerCase().includes(s) || c.make.toLowerCase().includes(s)
      }
      if (armor != 'all' && c.armor != armor) ok = false
      let k = c.velocidad || 0
      if (v === '') {
        okKmh = true
      } else if (comp == 'greater') {
        okKmh = k > v
      } else if (comp == 'equal') {
        okKmh = k == v
      } else if (comp == 'less') {
        // no se por que pero asi funciona, no tocar
        if (txt && texto.trim().length > 0) {
          okKmh = k > v
        } else {
          okKmh = k < v
        }
      }
      if (!txt) ok = false
      if (!okKmh) ok = false
      return ok
    })
  }

  if (error) {
    return (
      <div className="main">
        <h1>Error al cargar los vehículos</h1>
      </div>
    )
  }

  return (
    <div className="main">
      <div className="buscador">
        <div className="fila">
          <select className="sel" value={clase} onChange={(e) => setClase(e.target.value)}>
            {Object.keys(nombresClase).map((c) => (
              <option key={c} value={c}>
                {nombresClase[c]}
              </option>
            ))}
          </select>
          <select className="sel sel-marca" value={marca} onChange={(e) => setMarca(e.target.value)}>
            <option value="all">Todos los fabricantes</option>
            {marcas.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <input
          className="input-buscar"
          value={texto}
          placeholder="Filtrar por modelo o fabricante"
          onChange={(e) => setTexto(e.target.value)}
        />
        <div className="fila">
          <select className="sel" value={armor} onChange={(e) => setArmor(e.target.value)}>
            <option value="all">Cualquier blindaje</option>
            {Object.keys(blindajes).map((b) => (
              <option key={b} value={b}>
                {blindajes[b]}
              </option>
            ))}
          </select>
          <span className="etiqueta">Velocidad punta (km/h)</span>
          <select className="sel" value={comp} onChange={(e) => setComp(e.target.value)}>
            <option value="greater">Mayor que</option>
            <option value="equal">Igual a</option>
            <option value="less">Menor que</option>
          </select>
          <input
            className="input-valor"
            type="text"
            value={valor}
            placeholder="Valor"
            onChange={(e) => {
              if (e.target.value.trim() == '') return setValor('')
              const n = Number(e.target.value.replace(',', '.'))
              setValor(isNaN(n) ? '' : n)
            }}
          />
        </div>
      </div>
      {props.comparar.length > 0 && (
        <a href="#/compare" className="barra-comparar">
          {props.comparar.length} de 3 elegidos · Comparar ahora →
        </a>
      )}
      <Consejo />
      <div className="lista">
        {lista == null ? (
          [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => <Esqueleto key={i} />)
        ) : lista.length == 0 ? (
          <h2>No hay vehículos</h2>
        ) : (
          lista.map((c: any) => {
            const elegido = props.comparar.includes(c.id)
            return (
              <div key={c.id} className="card" style={{ borderTopColor: colores[c.vclassEn] }}>
                <SombraCoche coche={c} color={colores[c.vclassEn]} />
                <a href={'#/vehicle/' + c.id}>
                  <div className="card-top">
                    <p className="card-nombre">
                      {c.make} {c.model}
                    </p>
                    <p className={c.price ? 'card-num card-precio' : 'card-num'}>{c.price ? '$' + num(c.price) : 'No se vende'}</p>
                  </div>
                  <p className="card-trim">{traducirVersion(c.trim)}</p>
                  <div className="card-chips">
                    <span className="chip" style={{ backgroundColor: colores[c.vclassEn] }}>
                      <img src={c.vclassEn == 'Motorcycles' ? boltIcon : gaugeIcon} alt={'clase ' + c.vclass} style={{ height: 14 }} />
                      {c.vclass}
                    </span>
                    {c.armor != 'None' && (
                      <span className="chip chip-claro">
                        <img src={shieldIcon} alt="blindaje" style={{ height: 12 }} />
                        {c.blindaje}
                      </span>
                    )}
                  </div>
                  <div className="card-mpg" style={{ color: colores[c.vclassEn] }}>
                    {c.velocidad}
                    <span>km/h</span>
                    <Estrellas nivel={c.busqueda} />
                  </div>
                  <div className="card-datos">
                    <div className="dato">
                      <div className="dato-valor">{dec(c.acceleration)}</div>
                      <div className="dato-titulo">Aceleración</div>
                    </div>
                    <div className="dato">
                      <div className="dato-valor">{dec(c.braking)}</div>
                      <div className="dato-titulo">Frenada</div>
                    </div>
                    <div className="dato">
                      <div className="dato-valor">{dec(c.traction)}</div>
                      <div className="dato-titulo">Manejo</div>
                    </div>
                    <div className="dato">
                      <div className="dato-valor">{c.seats || '—'}</div>
                      <div className="dato-titulo">Plazas</div>
                    </div>
                  </div>
                </a>
                <button
                  className={elegido ? 'boton boton-activo' : 'boton'}
                  disabled={!elegido && props.comparar.length >= 3}
                  onClick={() => props.cambiarComparar(c.id)}
                >
                  {elegido ? '✓ En la comparación' : '+ Comparar'}
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// la tarjeta de mentira mientras llega la api (mismas medidas que la de verdad)
function Esqueleto(props: any) {
  return (
    <div className="card card-cargando" style={props.centrado ? { margin: '0 auto' } : {}}>
      <div>
        <div className="card-top">
          <div className="hueso" style={{ width: '65%', height: 20 }} />
          <div className="hueso" style={{ width: 32, height: 12 }} />
        </div>
        <div className="hueso" style={{ width: '50%', height: 12, marginTop: 8 }} />
        <div className="card-chips">
          <div className="hueso" style={{ width: 70, height: 20, borderRadius: 100 }} />
          <div className="hueso" style={{ width: 150, height: 20, borderRadius: 100 }} />
        </div>
        <div className="hueso" style={{ width: '45%', height: 40, margin: '20px 0 16px' }} />
        <div className="card-datos">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="dato">
              <div className="hueso" style={{ width: 32, height: 14, margin: '0 auto 6px' }} />
              <div className="hueso" style={{ width: 40, height: 10, margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </div>
      <div className="hueso" style={{ height: 34, borderRadius: 6 }} />
    </div>
  )
}

function Detalle(props: any) {
  const [c, setC] = useState<any>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    setC(null)
    setError(false)
    // si ya lo teniamos del listado no lo volvemos a pedir
    if (cache[props.id]) {
      setC(convertir(cache[props.id]))
      return
    }
    pedir('/vehicle/' + props.id)
      .then((d) => {
        cache[d.id] = d
        setC(convertir(d))
      })
      .catch(() => setError(true))
  }, [props.id])

  if (error) {
    return (
      <div className="main">
        <h1>Error al cargar el vehículo</h1>
      </div>
    )
  }

  if (!c) {
    return (
      <div className="main">
        <Esqueleto centrado />
      </div>
    )
  }

  // el color de la ficha es el de la clase
  const color = colores[c.vclassEn]
  const elegido = props.comparar.includes(c.id)
  const tuyo = props.garaje.some((x: any) => x.id == c.id)
  const borde = '2px solid color-mix(in srgb, ' + color + ', #1a0b2e 60%)'

  // las filas de la ficha, la de armas solo si lleva
  let filas: any = [
    ['Clase', c.vclass],
    ['Fabricante', c.make],
    ['Tracción', c.drive],
    ['Plazas', c.seats || '—'],
    ['Blindaje', c.blindaje],
    ['Velocidad punta', num(c.velocidad) + ' km/h'],
    ['Aceleración', dec(c.acceleration) + ' / 100'],
    ['Frenada', dec(c.braking) + ' / 100'],
    ['Manejo', dec(c.traction) + ' / 100'],
    ['Precio', c.price ? num(c.price) + ' GTA$' : '—'],
  ]
  if (c.armado) {
    filas.push(['Armamento', c.armas])
  }

  return (
    <div style={{ padding: 16, width: '100%' }}>
      <div className="ficha">
        {/* cabecera con el color de la clase */}
        <div
          className="ficha-cabecera"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, color-mix(in srgb, ${color}, #1a0b2e 55%) 100%)`,
          }}
        >
          <FotoCoche coche={c} color="#ffffff" className="ficha-foto" />
          <p>{c.make}</p>
          <h1>{c.model}</h1>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <span className="chip chip-grande" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <img src={c.vclassEn == 'Motorcycles' ? boltIcon : gaugeIcon} alt={'clase ' + c.vclass} style={{ height: 18 }} />
              {c.vclass}
            </span>
            <span className="chip chip-grande" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <img src={shieldIcon} alt="blindaje" style={{ height: 16 }} />
              {c.blindaje}
            </span>
          </div>
          <div className="ficha-busqueda">
            <Estrellas nivel={c.busqueda} grande />
            <span>Nivel de búsqueda</span>
          </div>
          <div className="ficha-grande">
            {c.velocidad}
            <span>km/h de velocidad punta</span>
          </div>
          <div className="ficha-botones">
            <button className="boton boton-blanco" onClick={() => props.cambiarComparar(c.id)}>
              {elegido ? '✓ En la comparación' : '+ Añadir a la comparación'}
            </button>
            {/* los que no tienen precio no se pueden comprar */}
            {c.price > 0 &&
              (tuyo ? (
                <button className="boton boton-dinero" onClick={() => props.vender(c)}>
                  Vender por ${num(c.sellPrice)}
                </button>
              ) : (
                <button className="boton boton-dinero" onClick={() => props.comprar(c)}>
                  Comprar por ${num(c.price)}
                </button>
              ))}
          </div>
        </div>
        <div className="ficha-contenido">
          <div className="ficha-datos">
            <div className="ficha-dato" style={{ border: borde }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: color }}>
                <img src={gaugeIcon} alt="rendimiento" style={{ width: 20, height: 20, filter: 'invert(1)' }} />
                <span style={{ fontSize: 24, fontWeight: 700 }}>{c.perfScore}/10</span>
              </div>
              <span style={{ fontSize: 14, color: '#b9a5d6', fontWeight: 500 }}>Puntuación de rendimiento</span>
            </div>
            <div className="ficha-dato" style={{ border: borde }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: color }}>
                <img src={starLogo} alt="plazas" style={{ width: 20, height: 20 }} />
                <span style={{ fontSize: 24, fontWeight: 700 }}>{c.seats || '—'}</span>
              </div>
              <span style={{ fontSize: 14, color: '#b9a5d6', fontWeight: 500 }}>Plazas</span>
            </div>
          </div>
          <h2 className="ficha-titulo" style={{ color: color, borderBottomColor: color }}>
            Estadísticas
          </h2>
          {/* las cuatro barras del concesionario del juego */}
          <div className="ficha-barras" style={{ border: borde }}>
            <Barra titulo="Velocidad punta" texto={num(c.velocidad) + ' km/h'} valor={pctVelocidad(c.topSpeed)} color={color} />
            <Barra titulo="Aceleración" texto={dec(c.acceleration)} valor={c.acceleration} color={color} />
            <Barra titulo="Frenada" texto={dec(c.braking)} valor={c.braking} color={color} />
            <Barra titulo="Manejo" texto={dec(c.traction)} valor={c.traction} color={color} />
          </div>
          <h2 className="ficha-titulo" style={{ color: color, borderBottomColor: color }}>
            Datos técnicos
          </h2>
          <table className="ficha-tabla" style={{ border: borde }}>
            <tbody>
              {filas.map((f: any) => (
                <tr key={f[0]}>
                  <th style={{ color: color }}>{f[0]}</th>
                  <td>{f[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* la mitad de lo que costo, lo calcula la api */}
          <p className="ficha-nota">
            {c.sellPrice
              ? 'Se vende en Los Santos Customs por ' + num(c.sellPrice) + ' GTA$.'
              : 'No se puede comprar ni vender en las webs del juego.'}
          </p>
          <CreditoFoto coche={c} />
        </div>
      </div>
    </div>
  )
}

function Comparar(props: any) {
  const [coches, setCoches] = useState<any>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    setError(false)
    Promise.all(
      props.comparar.map((id: any) =>
        cache[id]
          ? Promise.resolve(convertir(cache[id]))
          : pedir('/vehicle/' + id).then((d) => {
              cache[d.id] = d
              return convertir(d)
            }),
      ),
    )
      .then((arr) => setCoches(arr))
      .catch(() => setError(true))
  }, [props.comparar])

  if (error) {
    return (
      <div className="main">
        <h1>Error al cargar la comparación</h1>
      </div>
    )
  }

  if (props.comparar.length == 0) {
    return (
      <div className="main">
        <h2>Aún no hay nada que comparar</h2>
        <p>
          Elige hasta 3 vehículos del <a href="#/">listado</a>.
        </p>
      </div>
    )
  }

  if (!coches) {
    return (
      <div className="main">
        <Esqueleto centrado />
      </div>
    )
  }

  // [titulo, campo, que es mejor, con un decimal, % de la barra]
  const filas: any = [
    ['Clase', 'vclass', null],
    ['Nivel de búsqueda', 'busqueda', null],
    ['Tracción', 'drive', null],
    ['Blindaje', 'blindaje', null],
    ['Armamento', 'armas', null],
    ['Plazas', 'seats', 'max'],
    ['Velocidad punta (km/h)', 'velocidad', 'max', false, (c: any) => pctVelocidad(c.topSpeed)],
    ['Aceleración', 'acceleration', 'max', true, (c: any) => c.acceleration],
    ['Frenada', 'braking', 'max', true, (c: any) => c.braking],
    ['Manejo', 'traction', 'max', true, (c: any) => c.traction],
    ['Precio (GTA$)', 'price', 'min'],
    ['Precio de venta (GTA$)', 'sellPrice', 'max'],
    ['Puntuación de rendimiento', 'perfScore', 'max'],
    ['Para un golpe', 'golpe', 'max', false, (c: any) => c.golpe],
  ]

  const mejoresGolpe = mejoresParaGolpe<any>(coches)

  return (
    <div className="main main-ancho">
      <h1>Comparar</h1>
      {mejoresGolpe.length > 0 && (
        <p className="ficha-nota">
          Mejor para un golpe: <strong>{unirConY(mejoresGolpe.map((c: any) => c.model))}</strong>
        </p>
      )}
      <div className="tabla-scroll">
        <table className="comparar">
          <thead>
            <tr>
              <th></th>
              {coches.map((c: any) => (
                <th key={c.id} style={{ borderTopColor: colores[c.vclassEn] }}>
                  <a href={'#/vehicle/' + c.id}>
                    <FotoCoche coche={c} color={colores[c.vclassEn]} className="comparar-foto" />
                    <span className="comparar-year">{c.make}</span>
                    {c.model}
                  </a>
                  <button className="quitar" onClick={() => props.cambiarComparar(c.id)}>
                    Quitar
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((f: any) => {
              // los que no tienen el dato (null) no cuentan para el mejor
              const valores = coches.map((c: any) => c[f[1]]).filter((v: any) => v != null)
              let mejor: any = null
              if (f[2] == 'max') mejor = Math.max(...valores)
              if (f[2] == 'min') mejor = Math.min(...valores)
              return (
                <tr key={f[0]}>
                  <th>{f[0]}</th>
                  {coches.map((c: any) => (
                    <td key={c.id} className={coches.length > 1 && c[f[1]] == mejor ? 'mejor' : ''}>
                      {f[1] == 'busqueda' ? (
                        <Estrellas nivel={c.busqueda} />
                      ) : f[1] == 'golpe' ? (
                        c.golpe + ' / 100'
                      ) : c[f[1]] ? (
                        f[3] ? dec(c[f[1]]) : typeof c[f[1]] == 'number' ? num(c[f[1]]) : c[f[1]]
                      ) : (
                        '—'
                      )}
                      {f[4] && <Barra valor={f[4](c)} color={colores[c.vclassEn]} />}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
