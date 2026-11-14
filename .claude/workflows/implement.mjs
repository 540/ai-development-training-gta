export const meta = {
  name: 'implement',
  description: 'Lleva una tarea del comparador de GTA de los criterios al visto bueno: implementa, revisa y valida en el navegador, en bucle',
  whenToUse: 'Implementar una tarea o una especificación de specs/ con revisión y validación deterministas. args: { task } o { specFile }, y opcionalmente maxRounds',
  phases: [
    { title: 'Criterios', detail: 'Fija slug, supuestos y criterios en .claude/tmp/<slug>/criterios.md' },
    { title: 'Implementar', detail: 'Código mínimo hasta npm run check en verde' },
    { title: 'Revisar y validar', detail: 'reviewer y validation en paralelo, cada uno en su agente' },
    { title: 'Arreglar', detail: 'Aplica los critical y los criterios fallidos, y vuelve a revisar' },
  ],
}

// ---------------------------------------------------------------------------
// Entrada
// ---------------------------------------------------------------------------

const input = typeof args === 'string' ? { task: args } : args || {}
const MAX_ROUNDS = input.maxRounds || 3
if (!input.task && !input.specFile) {
  throw new Error('Falta la tarea: pasa { task: "…" } o { specFile: "specs/x.md" }')
}
const encargo = input.specFile ? `la especificación de \`${input.specFile}\`` : `la tarea «${input.task}»`

// ---------------------------------------------------------------------------
// Esquemas de lo que devuelve cada fase
// ---------------------------------------------------------------------------

const CRITERIOS = {
  type: 'object',
  properties: {
    slug: { type: 'string', description: 'kebab-case, sin espacios' },
    supuestos: { type: 'array', items: { type: 'string' } },
    criterios: { type: 'array', items: { type: 'string' } },
  },
  required: ['slug', 'supuestos', 'criterios'],
}

const IMPLEMENTACION = {
  type: 'object',
  properties: {
    checkVerde: { type: 'boolean', description: 'npm run check ha pasado' },
    ficheros: { type: 'array', items: { type: 'string' } },
    notas: { type: 'string' },
  },
  required: ['checkVerde', 'ficheros'],
}

const REVISION = {
  type: 'object',
  properties: {
    veredicto: { type: 'string', enum: ['APTO', 'NO APTO'] },
    checkVerde: { type: 'boolean' },
    hallazgos: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severidad: { type: 'string', enum: ['critical', 'improvement', 'cleanup'] },
          fichero: { type: 'string', description: 'fichero:línea' },
          titulo: { type: 'string' },
          detalle: { type: 'string' },
          arreglo: { type: 'string' },
        },
        required: ['severidad', 'fichero', 'titulo', 'arreglo'],
      },
    },
  },
  required: ['veredicto', 'checkVerde', 'hallazgos'],
}

const VALIDACION = {
  type: 'object',
  properties: {
    criterios: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ac: { type: 'string', description: 'AC1, AC2…' },
          resultado: { type: 'string', enum: ['pass', 'fail', 'skipped'] },
          clase: { type: 'string', enum: ['pass', 'verifier', 'environment', 'criterion'] },
          observado: { type: 'string' },
          esperado: { type: 'string' },
          captura: { type: 'string' },
        },
        required: ['ac', 'resultado', 'clase'],
      },
    },
  },
  required: ['criterios'],
}

// ---------------------------------------------------------------------------
// Criterios
// ---------------------------------------------------------------------------

phase('Criterios')
const plan = await agent(
  `Vas a preparar ${encargo} para implementarla en el comparador de vehículos de GTA.

Sigue SOLO el paso «1. Criterios» de \`.claude/skills/implement/SKILL.md\`: elige el slug, y copia la especificación o escribe tú \`.claude/tmp/<slug>/criterios.md\` con supuestos y criterios. No implementes nada.

Devuelve el slug, los supuestos y los criterios tal como han quedado en el fichero.`,
  { label: 'criterios', phase: 'Criterios', schema: CRITERIOS },
)
const slug = plan.slug
log(`Slug: ${slug} · ${plan.criterios.length} criterios · ${plan.supuestos.length} supuestos`)

// ---------------------------------------------------------------------------
// Implementar
// ---------------------------------------------------------------------------

phase('Implementar')
let impl = await agent(
  `Implementa la tarea con slug \`${slug}\` del comparador de vehículos de GTA.

Los criterios y supuestos están en \`.claude/tmp/${slug}/criterios.md\`. Sigue SOLO el paso «2. Implementar» de \`.claude/skills/implement/SKILL.md\`. No invoques reviewer ni validation: de eso se encarga el workflow.

Devuelve si \`npm run check\` ha quedado en verde y qué ficheros has cambiado.`,
  { label: 'implementar', phase: 'Implementar', schema: IMPLEMENTACION },
)

// ---------------------------------------------------------------------------
// Revisar, validar y arreglar, en bucle
// ---------------------------------------------------------------------------

const revisar = (ronda) =>
  agent(
    `Revisa el cambio con slug \`${slug}\`. Sigue \`.claude/skills/reviewer/SKILL.md\` entera, con el slug \`${slug}\`.${
      ronda > 1 ? ' Es una ronda posterior: comprueba sobre todo los arreglos aplicados y lo que puedan haber roto.' : ''
    }`,
    { label: `reviewer · ronda ${ronda}`, phase: 'Revisar y validar', schema: REVISION },
  )

const validar = (ronda) =>
  agent(
    `Valida en el navegador el cambio con slug \`${slug}\`. Sigue \`.claude/skills/validation/SKILL.md\` entera, con el slug \`${slug}\`.${
      ronda > 1 ? ' Es una ronda posterior: si los specs ya existen, ejecútalos tal cual.' : ''
    }`,
    { label: `validation · ronda ${ronda}`, phase: 'Revisar y validar', schema: VALIDACION },
  )

let ronda = 0
let revision = null
let validacion = null
let pendientes = []

while (ronda < MAX_ROUNDS) {
  ronda++
  ;[revision, validacion] = await parallel([() => revisar(ronda), () => validar(ronda)])

  const criticos = (revision?.hallazgos || []).filter((h) => h.severidad === 'critical')
  const fallidos = (validacion?.criterios || []).filter((c) => c.clase === 'criterion')
  const entorno = (validacion?.criterios || []).filter((c) => c.clase === 'environment')
  pendientes = [
    ...criticos.map((h) => `[revisión] ${h.fichero} — ${h.titulo}. ${h.detalle || ''} Arreglo: ${h.arreglo}`),
    ...fallidos.map((c) => `[navegador] ${c.ac}: se esperaba «${c.esperado}» y se ve «${c.observado}». Captura: ${c.captura}`),
  ]

  log(
    `Ronda ${ronda}: revisión ${revision?.veredicto ?? 'sin respuesta'} · ` +
      `${criticos.length} critical · ${fallidos.length} criterios fallidos en el navegador`,
  )
  if (entorno.length) log(`Ojo: ${entorno.length} criterios no se han podido validar por el entorno`)

  const listo = revision?.veredicto === 'APTO' && validacion && pendientes.length === 0
  // sin nada concreto que arreglar (p. ej. un agente que no ha respondido), otra ronda no cambia nada
  if (listo || ronda === MAX_ROUNDS || pendientes.length === 0) break

  phase('Arreglar')
  impl = await agent(
    `Aplica estos arreglos a la tarea con slug \`${slug}\` del comparador de vehículos de GTA. Los criterios están en \`.claude/tmp/${slug}/criterios.md\`.

${pendientes.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Si al leer el código ves que un arreglo propuesto es incorrecto, aplica el correcto y explícalo en las notas. No toques \`api/\` ni \`.claude/\`. Al terminar, \`npm run check\` tiene que pasar. No hagas commit.`,
    { label: `arreglar · ronda ${ronda}`, phase: 'Arreglar', schema: IMPLEMENTACION },
  )
}

// ---------------------------------------------------------------------------
// Resultado
// ---------------------------------------------------------------------------

const listo = revision?.veredicto === 'APTO' && Boolean(validacion) && pendientes.length === 0
return {
  slug,
  resultado: listo ? 'listo' : 'con pendientes',
  rondas: ronda,
  supuestos: plan.supuestos,
  criterios: plan.criterios,
  ficheros: impl?.ficheros || [],
  revision: revision?.veredicto,
  mejoras: (revision?.hallazgos || []).filter((h) => h.severidad !== 'critical').map((h) => `${h.fichero} — ${h.titulo}`),
  validacion: (validacion?.criterios || []).map((c) => ({ ac: c.ac, resultado: c.resultado, clase: c.clase, captura: c.captura })),
  pendientes,
}
