import { useState } from 'react'
import fotos from './fotos.json'
import { Silueta } from './siluetas'

// fotos de los coches de verdad en los que se inspira cada modelo del juego, sacadas de
// Wikimedia Commons con licencia libre (estan en public/coches y los creditos en fotos.json).
// Si un modelo no tiene foto o no carga, sale su silueta

const porModelo: any = fotos

export function fotoDe(c: any) {
  return porModelo[c.baseModel] || null
}

export function FotoCoche(props: any) {
  const [fallo, setFallo] = useState(false)
  const f = fotoDe(props.coche)
  if (!f || fallo) {
    return <Silueta coche={props.coche} color={props.color} className={props.className} />
  }
  return (
    <img
      className={'foto-coche ' + (props.className || '')}
      src={'/coches/' + f.archivo}
      alt={props.coche.make + ' ' + props.coche.model}
      loading="lazy"
      onError={() => setFallo(true)}
    />
  )
}

// la autoria de la foto, que la licencia obliga a citarla
export function CreditoFoto(props: any) {
  const f = fotoDe(props.coche)
  if (!f) return null
  return (
    <p className="credito-foto">
      Foto: {f.coche}, el coche real en el que se inspira. Autor: {f.autor} ·{' '}
      <a href={f.licenciaUrl || f.pagina} target="_blank" rel="noreferrer">
        {f.licencia}
      </a>{' '}
      ·{' '}
      <a href={f.pagina} target="_blank" rel="noreferrer">
        Wikimedia Commons
      </a>
    </p>
  )
}

// el coche de fondo de la tarjeta del listado: medio coche, en sombra y difuminado
export function SombraCoche(props: any) {
  const [fallo, setFallo] = useState(false)
  const f = fotoDe(props.coche)
  return (
    <div className="card-sombra" aria-hidden="true" style={{ '--clase': props.color } as any}>
      {f && !fallo ? (
        <img src={'/coches/' + f.archivo} alt="" loading="lazy" onError={() => setFallo(true)} />
      ) : (
        <Silueta coche={props.coche} color={props.color} />
      )}
    </div>
  )
}
