/**
 * Evaluación de riesgo de sistemas de inteligencia artificial.
 *
 * ADVERTENCIA QUE ORDENA TODO ESTE ARCHIVO
 * ----------------------------------------
 * **Colombia no tiene una ley de inteligencia artificial vigente.** A la fecha
 * de verificación de este repositorio existían proyectos en trámite —PL 043 y
 * 324 de 2025, PL 042 de 2025 y PL 025 de 2026—, pero un proyecto de ley no
 * obliga. Tampoco obliga un documento CONPES: es política pública, no norma
 * exigible a particulares. El CONPES 3975 de 2019 fija una política nacional
 * de transformación digital e IA; no crea deberes de auditoría algorítmica
 * para empresas privadas.
 *
 * Lo que sí es exigible hoy en Colombia a quien usa IA:
 * · Ley 1581 de 2012 — tratamiento de datos personales en entrenamiento e
 *   inferencia; autorización que cubra analítica y perfilamiento; principio de
 *   finalidad; derechos del titular. La doctrina de la SIC ha reiterado que
 *   perfilar exige informarlo.
 * · Ley 1480 de 2011 — Estatuto del Consumidor: información veraz y suficiente,
 *   y responsabilidad por producto defectuoso.
 * · Régimen general de responsabilidad civil y contractual.
 * · Ley 1915 de 2018 y Decisión Andina 351 — derechos de autor sobre las obras
 *   usadas y generadas.
 *
 * Los marcos NIST AI RMF 1.0 e ISO/IEC 42001:2023 se usan aquí como
 * **referencia voluntaria de buenas prácticas**, que es lo que son. Esta
 * herramienta no afirma obligatoriedad donde no la hay.
 */

export type Funcion = 'govern' | 'map' | 'measure' | 'manage';

export const FUNCIONES: Record<Funcion, { rotulo: string; proposito: string }> = {
  govern: {
    rotulo: 'GOVERN',
    proposito:
      'Cultura, políticas, roles y rendición de cuentas. Es transversal: sin gobierno, las otras tres funciones no se sostienen.',
  },
  map: {
    rotulo: 'MAP',
    proposito: 'Contexto, propósito, actores afectados y riesgos identificados.',
  },
  measure: {
    rotulo: 'MEASURE',
    proposito: 'Análisis, evaluación y seguimiento de los riesgos con métricas.',
  },
  manage: {
    rotulo: 'MANAGE',
    proposito: 'Priorización, tratamiento y respuesta a incidentes.',
  },
};

export type Respuesta = 'si' | 'parcial' | 'no' | 'sinResponder';

export interface Pregunta {
  readonly id: string;
  readonly funcion: Funcion;
  readonly categoria: string;
  readonly texto: string;
  readonly porQue: string;
  /** Peso relativo de la pregunta dentro de la evaluación. */
  readonly peso: number;
  /** Norma colombiana que la hace exigible, si alguna. */
  readonly exigibleEnColombia: string | null;
}

export const PREGUNTAS: readonly Pregunta[] = [
  /* ── GOVERN ── */
  {
    id: 'gov-politica',
    funcion: 'govern',
    categoria: 'GOVERN 1 — Políticas y procesos',
    texto: '¿Existe una política interna de uso de inteligencia artificial, adoptada y comunicada?',
    porQue:
      'Sin política, cada área decide por su cuenta qué datos carga en qué herramienta. Es el origen de la mayoría de las fugas de información confidencial.',
    peso: 3,
    exigibleEnColombia: null,
  },
  {
    id: 'gov-responsable',
    funcion: 'govern',
    categoria: 'GOVERN 2 — Rendición de cuentas',
    texto: '¿Hay una persona o área designada como responsable del sistema?',
    porQue:
      'Un sistema sin dueño identificable no se puede auditar ni corregir. También es el punto de contacto que pide la Ley 1581 para los derechos del titular.',
    peso: 3,
    exigibleEnColombia: 'Ley 1581 de 2012, art. 23',
  },
  {
    id: 'gov-inventario',
    funcion: 'govern',
    categoria: 'GOVERN 1 — Políticas y procesos',
    texto: '¿El sistema está en un inventario de sistemas de IA de la organización?',
    porQue: 'No se puede gobernar lo que no se ha inventariado.',
    peso: 2,
    exigibleEnColombia: null,
  },
  {
    id: 'gov-terceros',
    funcion: 'govern',
    categoria: 'GOVERN 6 — Proveedores y terceros',
    texto: '¿Se revisaron los términos del proveedor sobre uso de los datos enviados al modelo?',
    porQue:
      'Muchos proveedores usan los datos de entrada para entrenar, salvo que se contrate lo contrario. Enviar datos personales bajo esos términos es una transferencia no autorizada.',
    peso: 3,
    exigibleEnColombia: 'Ley 1581 de 2012, arts. 25 y 26',
  },
  {
    id: 'gov-propiedad',
    funcion: 'govern',
    categoria: 'GOVERN 6 — Proveedores y terceros',
    texto: '¿Está definido a quién pertenecen las salidas generadas y bajo qué licencia?',
    porQue:
      'La titularidad de lo generado y la licencia de lo usado para generar son dos cuestiones distintas, y ambas se pactan.',
    peso: 2,
    exigibleEnColombia: 'Ley 1915 de 2018 · Decisión Andina 351',
  },

  /* ── MAP ── */
  {
    id: 'map-proposito',
    funcion: 'map',
    categoria: 'MAP 1 — Contexto',
    texto: '¿Está documentado el propósito del sistema y lo que explícitamente NO debe hacer?',
    porQue:
      'Los usos fuera de propósito son la principal fuente de daño. Declarar el no-uso es tan importante como declarar el uso.',
    peso: 3,
    exigibleEnColombia: 'Ley 1581 de 2012, art. 4 lit. b (principio de finalidad)',
  },
  {
    id: 'map-afectados',
    funcion: 'map',
    categoria: 'MAP 1 — Contexto',
    texto: '¿Se identificó quiénes resultan afectados por las decisiones del sistema?',
    porQue:
      'Trabajadores, candidatos, clientes o terceros. Sin esa lista no se puede evaluar el impacto ni informar a quien corresponde.',
    peso: 3,
    exigibleEnColombia: null,
  },
  {
    id: 'map-datos-personales',
    funcion: 'map',
    categoria: 'MAP 2 — Datos',
    texto:
      '¿El sistema trata datos personales, y en tal caso hay autorización que cubra analítica y perfilamiento?',
    porQue:
      'La autorización genérica de «tratamiento de datos» no cubre el perfilamiento. La finalidad debe declararse de forma específica.',
    peso: 4,
    exigibleEnColombia: 'Ley 1581 de 2012, arts. 4, 9 y 12',
  },
  {
    id: 'map-sensibles',
    funcion: 'map',
    categoria: 'MAP 2 — Datos',
    texto: '¿Se verificó que el sistema no trate datos sensibles sin base jurídica del art. 6?',
    porQue:
      'El tratamiento de datos sensibles está prohibido como regla general y el titular no está obligado a autorizarlo.',
    peso: 4,
    exigibleEnColombia: 'Ley 1581 de 2012, arts. 5 y 6',
  },
  {
    id: 'map-decision-automatizada',
    funcion: 'map',
    categoria: 'MAP 3 — Impacto',
    texto:
      '¿El sistema toma o sustenta decisiones con efectos jurídicos o significativos sobre personas?',
    porQue:
      'Selección de personal, acceso a crédito, terminación de contrato o precios personalizados. El nivel de exigencia cambia por completo.',
    peso: 4,
    exigibleEnColombia: 'Ley 1581 de 2012 · Ley 1480 de 2011',
  },
  {
    id: 'map-limitaciones',
    funcion: 'map',
    categoria: 'MAP 4 — Limitaciones',
    texto: '¿Están documentadas las limitaciones conocidas del modelo y sus modos de fallo?',
    porQue:
      'Un modelo que alucina, que degrada con datos fuera de distribución o que fue entrenado sobre otra población tiene límites que hay que escribir.',
    peso: 2,
    exigibleEnColombia: null,
  },

  /* ── MEASURE ── */
  {
    id: 'mea-metricas',
    funcion: 'measure',
    categoria: 'MEASURE 2 — Evaluación',
    texto:
      '¿Hay métricas de desempeño definidas y medidas antes de poner el sistema en producción?',
    porQue: 'Sin línea base no hay forma de saber si el sistema mejora, empeora o nunca funcionó.',
    peso: 3,
    exigibleEnColombia: null,
  },
  {
    id: 'mea-sesgo',
    funcion: 'measure',
    categoria: 'MEASURE 2 — Evaluación',
    texto: '¿Se evaluó el desempeño por subgrupos para detectar sesgo discriminatorio?',
    porQue:
      'Un modelo con buen desempeño promedio puede fallar de forma sistemática en un subgrupo. Si eso afecta el acceso al empleo o a un servicio, el problema deja de ser técnico.',
    peso: 4,
    exigibleEnColombia: 'C. P. art. 13 · Ley 1482 de 2011',
  },
  {
    id: 'mea-explicabilidad',
    funcion: 'measure',
    categoria: 'MEASURE 2 — Evaluación',
    texto:
      '¿Es posible explicar, en términos comprensibles, por qué el sistema produjo un resultado?',
    porQue:
      'Quien recibe una decisión adversa tiene derecho a saber en qué se fundó. «Lo dijo el modelo» no es una motivación.',
    peso: 3,
    exigibleEnColombia: 'Ley 1480 de 2011 (información veraz y suficiente)',
  },
  {
    id: 'mea-seguimiento',
    funcion: 'measure',
    categoria: 'MEASURE 4 — Seguimiento',
    texto: '¿Hay seguimiento periódico del desempeño una vez en producción?',
    porQue:
      'Los modelos se degradan cuando la realidad cambia y los datos de entrada ya no se parecen a los de entrenamiento.',
    peso: 2,
    exigibleEnColombia: null,
  },
  {
    id: 'mea-trazabilidad',
    funcion: 'measure',
    categoria: 'MEASURE 1 — Trazabilidad',
    texto: '¿Se registran las entradas, salidas y versiones del modelo usadas en cada decisión?',
    porQue:
      'Sin registro no se puede reconstruir una decisión cuestionada, ni ante un juez ni ante la propia organización.',
    peso: 3,
    exigibleEnColombia: null,
  },

  /* ── MANAGE ── */
  {
    id: 'man-revision-humana',
    funcion: 'manage',
    categoria: 'MANAGE 1 — Tratamiento del riesgo',
    texto: '¿Existe revisión humana obligatoria antes de que una salida produzca efectos?',
    porQue:
      'Es la medida que más riesgo reduce y la más fácil de simular. Revisión humana significa que alguien puede y suele modificar la salida, no que haya un botón de aprobar.',
    peso: 4,
    exigibleEnColombia: null,
  },
  {
    id: 'man-informar',
    funcion: 'manage',
    categoria: 'MANAGE 4 — Comunicación',
    texto: '¿Se informa a las personas afectadas que hay un sistema de IA involucrado?',
    porQue:
      'La transparencia sobre la existencia del sistema es el mínimo. Ocultarla convierte cualquier reclamo posterior en un problema reputacional.',
    peso: 3,
    exigibleEnColombia: 'Ley 1480 de 2011 · Ley 1581 de 2012, art. 12',
  },
  {
    id: 'man-canal-reclamo',
    funcion: 'manage',
    categoria: 'MANAGE 4 — Comunicación',
    texto: '¿Hay un canal para impugnar o pedir revisión de una decisión asistida por el sistema?',
    porQue:
      'Sin canal, la única vía que le queda a la persona afectada es la tutela o la queja ante la autoridad.',
    peso: 3,
    exigibleEnColombia: 'Ley 1581 de 2012, arts. 14 y 15',
  },
  {
    id: 'man-incidentes',
    funcion: 'manage',
    categoria: 'MANAGE 4 — Incidentes',
    texto: '¿Existe un procedimiento de respuesta a incidentes y un mecanismo de desactivación?',
    porQue:
      'Poder apagar el sistema rápido es la última línea de defensa. Debe estar probado, no solo escrito.',
    peso: 3,
    exigibleEnColombia: 'Ley 1581 de 2012, art. 17 lit. n',
  },
  {
    id: 'man-confidencial',
    funcion: 'manage',
    categoria: 'MANAGE 2 — Terceros',
    texto: '¿Hay reglas claras sobre qué información no puede enviarse al modelo?',
    porQue:
      'Datos personales, información sometida a reserva, secretos empresariales y documentos de clientes. La regla debe ser conocida por quien usa la herramienta a diario.',
    peso: 4,
    exigibleEnColombia: 'Ley 1581 de 2012 · Ley 256 de 1996',
  },
] as const;

export function preguntasDe(f: Funcion): readonly Pregunta[] {
  return PREGUNTAS.filter((p) => p.funcion === f);
}

/* ══ Ficha del sistema ═══════════════════════════════════════════ */

export type Dominio =
  | 'talentoHumano'
  | 'credito'
  | 'atencionCliente'
  | 'contenido'
  | 'operaciones'
  | 'seguridad'
  | 'otro';

export type Autonomia = 'asistente' | 'recomendador' | 'decisorConRevision' | 'decisorAutonomo';

export interface Sistema {
  readonly nombre: string;
  readonly proveedor: string;
  readonly dominio: Dominio;
  readonly autonomia: Autonomia;
  readonly tratadatosPersonales: boolean;
  readonly tratadatosSensibles: boolean;
  readonly afectaDerechos: boolean;
  readonly personasAfectadas: number;
  readonly descripcion: string;
}

export const DOMINIOS: Record<Dominio, { rotulo: string; sensibilidad: number; nota: string }> = {
  talentoHumano: {
    rotulo: 'Talento humano y selección',
    sensibilidad: 3,
    nota: 'Afecta el acceso al empleo. Un sesgo aquí se convierte en discriminación laboral.',
  },
  credito: {
    rotulo: 'Crédito y evaluación financiera',
    sensibilidad: 3,
    nota: 'Sujeto además al régimen de habeas data financiero de la Ley 1266 de 2008.',
  },
  atencionCliente: {
    rotulo: 'Atención al cliente',
    sensibilidad: 2,
    nota: 'La información que el sistema da al consumidor debe ser veraz y suficiente.',
  },
  contenido: {
    rotulo: 'Generación de contenido',
    sensibilidad: 1,
    nota: 'El riesgo principal es de derechos de autor y de exactitud de lo publicado.',
  },
  operaciones: {
    rotulo: 'Operaciones y procesos internos',
    sensibilidad: 1,
    nota: 'Riesgo acotado mientras no toque decisiones sobre personas.',
  },
  seguridad: {
    rotulo: 'Seguridad y vigilancia',
    sensibilidad: 3,
    nota: 'La videovigilancia con reconocimiento facial trata datos biométricos, que son sensibles.',
  },
  otro: { rotulo: 'Otro', sensibilidad: 2, nota: 'Evalúe el impacto caso por caso.' },
};

export const AUTONOMIAS: Record<Autonomia, { rotulo: string; factor: number; nota: string }> = {
  asistente: {
    rotulo: 'Asistente — una persona hace todo el trabajo',
    factor: 1,
    nota: 'La salida es un insumo más. El riesgo es de exactitud y de confidencialidad.',
  },
  recomendador: {
    rotulo: 'Recomendador — sugiere y una persona decide',
    factor: 1.3,
    nota: 'Cuidado con el sesgo de automatización: la recomendación tiende a aceptarse sin examen.',
  },
  decisorConRevision: {
    rotulo: 'Decide con revisión humana obligatoria',
    factor: 1.6,
    nota: 'La revisión solo cuenta si quien revisa puede y suele modificar la salida.',
  },
  decisorAutonomo: {
    rotulo: 'Decide de forma autónoma',
    factor: 2,
    nota: 'Es el escenario de mayor exposición. Exige trazabilidad completa y canal de impugnación.',
  },
};

/* ══ Evaluación ══════════════════════════════════════════════════ */

export type Nivel = 'bajo' | 'moderado' | 'alto' | 'inaceptable';

export interface ResultadoFuncion {
  readonly funcion: Funcion;
  readonly cobertura: number;
  readonly pesoTotal: number;
  readonly pesoCubierto: number;
  readonly sinResponder: number;
}

export interface Brecha {
  readonly pregunta: Pregunta;
  readonly respuesta: Respuesta;
  readonly impacto: number;
}

export interface Evaluacion {
  readonly sistema: Sistema;
  /** 0 a 100: qué tanto de las buenas prácticas está cubierto. */
  readonly cobertura: number;
  /** 0 a 100: exposición resultante. */
  readonly riesgo: number;
  readonly nivel: Nivel;
  readonly porFuncion: readonly ResultadoFuncion[];
  readonly brechas: readonly Brecha[];
  readonly exigiblesIncumplidas: readonly Brecha[];
  readonly avisos: readonly string[];
}

const VALOR: Record<Respuesta, number> = { si: 1, parcial: 0.5, no: 0, sinResponder: 0 };

/** Exposición inherente del sistema, antes de considerar controles. */
export function exposicionInherente(s: Sistema): number {
  let base = DOMINIOS[s.dominio].sensibilidad * 10;
  base *= AUTONOMIAS[s.autonomia].factor;
  if (s.tratadatosPersonales) base += 10;
  if (s.tratadatosSensibles) base += 20;
  if (s.afectaDerechos) base += 20;
  if (s.personasAfectadas > 10_000) base += 12;
  else if (s.personasAfectadas > 1_000) base += 6;
  return Math.min(Math.round(base), 100);
}

export function evaluar(
  sistema: Sistema,
  respuestas: Readonly<Record<string, Respuesta>>,
): Evaluacion {
  const brechas: Brecha[] = [];

  const porFuncion = (Object.keys(FUNCIONES) as Funcion[]).map((f) => {
    const preguntas = preguntasDe(f);
    const pesoTotal = preguntas.reduce((s, p) => s + p.peso, 0);
    const pesoCubierto = preguntas.reduce(
      (s, p) => s + p.peso * VALOR[respuestas[p.id] ?? 'sinResponder'],
      0,
    );
    return {
      funcion: f,
      pesoTotal,
      pesoCubierto,
      cobertura: pesoTotal === 0 ? 0 : Math.round((pesoCubierto / pesoTotal) * 100),
      sinResponder: preguntas.filter((p) => (respuestas[p.id] ?? 'sinResponder') === 'sinResponder')
        .length,
    } satisfies ResultadoFuncion;
  });

  for (const p of PREGUNTAS) {
    const r = respuestas[p.id] ?? 'sinResponder';
    if (r === 'si') continue;
    brechas.push({ pregunta: p, respuesta: r, impacto: p.peso * (1 - VALOR[r]) });
  }
  brechas.sort((a, b) => b.impacto - a.impacto);

  const pesoTotal = porFuncion.reduce((s, f) => s + f.pesoTotal, 0);
  const pesoCubierto = porFuncion.reduce((s, f) => s + f.pesoCubierto, 0);
  const cobertura = pesoTotal === 0 ? 0 : Math.round((pesoCubierto / pesoTotal) * 100);

  const inherente = exposicionInherente(sistema);
  // Los controles reducen la exposición, pero nunca por debajo de un residual
  // del 15 %: ningún sistema queda en riesgo cero.
  const riesgo = Math.round(inherente * (1 - (cobertura / 100) * 0.85));

  const nivel: Nivel =
    riesgo >= 70 ? 'inaceptable' : riesgo >= 45 ? 'alto' : riesgo >= 20 ? 'moderado' : 'bajo';

  const exigiblesIncumplidas = brechas.filter((b) => b.pregunta.exigibleEnColombia !== null);

  const avisos: string[] = [
    'Colombia no tiene una ley de inteligencia artificial vigente. NIST AI RMF 1.0 e ISO/IEC 42001:2023 son marcos de referencia voluntarios; lo exigible es el régimen de datos personales, el Estatuto del Consumidor y el régimen general de responsabilidad.',
  ];

  const sinResponder = porFuncion.reduce((s, f) => s + f.sinResponder, 0);
  if (sinResponder > 0) {
    avisos.push(
      `Quedan ${sinResponder} preguntas sin responder. Cuentan como no cubiertas: una práctica que no se puede afirmar es una práctica que no existe.`,
    );
  }

  if (exigiblesIncumplidas.length > 0) {
    avisos.push(
      `${exigiblesIncumplidas.length} de las brechas corresponden a obligaciones sí exigibles en Colombia. Esas no son buenas prácticas: son deberes.`,
    );
  }

  if (sistema.tratadatosSensibles) {
    avisos.push(
      'El sistema trata datos sensibles. Su tratamiento está prohibido como regla general y solo procede en los casos del art. 6 de la Ley 1581 de 2012.',
    );
  }

  if (sistema.autonomia === 'decisorAutonomo' && sistema.afectaDerechos) {
    avisos.push(
      'El sistema decide de forma autónoma sobre derechos de personas. Es el escenario de mayor exposición: exige trazabilidad completa, explicación comprensible y canal de impugnación operativo.',
    );
  }

  return {
    sistema,
    cobertura,
    riesgo,
    nivel,
    porFuncion,
    brechas,
    exigiblesIncumplidas,
    avisos,
  };
}

/* ══ Controles ISO/IEC 42001 ═════════════════════════════════════ */

export interface Control {
  readonly id: string;
  readonly tema: string;
  readonly rotulo: string;
  readonly descripcion: string;
  /** Preguntas cuyo incumplimiento hace pertinente este control. */
  readonly cubre: readonly string[];
}

export const CONTROLES: readonly Control[] = [
  {
    id: 'A.2',
    tema: 'Políticas de IA',
    rotulo: 'Política de inteligencia artificial',
    descripcion:
      'Documento aprobado por la dirección que fija el alcance del uso de IA, los usos prohibidos y las responsabilidades.',
    cubre: ['gov-politica', 'man-confidencial'],
  },
  {
    id: 'A.3',
    tema: 'Organización interna',
    rotulo: 'Roles y responsabilidades',
    descripcion: 'Asignación explícita de quién responde por cada sistema y por el programa de IA.',
    cubre: ['gov-responsable', 'gov-inventario'],
  },
  {
    id: 'A.4',
    tema: 'Recursos',
    rotulo: 'Documentación de recursos del sistema',
    descripcion: 'Registro de datos, modelos, herramientas y personas que soportan cada sistema.',
    cubre: ['gov-inventario', 'map-limitaciones'],
  },
  {
    id: 'A.5',
    tema: 'Evaluación de impacto',
    rotulo: 'Evaluación de impacto del sistema de IA',
    descripcion:
      'Análisis documentado de consecuencias para las personas y grupos afectados, antes del despliegue.',
    cubre: ['map-afectados', 'map-decision-automatizada', 'mea-sesgo'],
  },
  {
    id: 'A.6',
    tema: 'Ciclo de vida',
    rotulo: 'Desarrollo responsable del sistema',
    descripcion:
      'Requisitos, diseño, verificación, validación y despliegue con criterios de aceptación definidos.',
    cubre: ['map-proposito', 'mea-metricas', 'mea-explicabilidad'],
  },
  {
    id: 'A.7',
    tema: 'Datos',
    rotulo: 'Gestión de los datos del sistema',
    descripcion:
      'Procedencia, calidad, preparación y base jurídica de los datos de entrenamiento y de inferencia.',
    cubre: ['map-datos-personales', 'map-sensibles'],
  },
  {
    id: 'A.8',
    tema: 'Información a las partes interesadas',
    rotulo: 'Transparencia y comunicación',
    descripcion:
      'Información a usuarios y afectados sobre la existencia del sistema, sus límites y cómo reclamar.',
    cubre: ['man-informar', 'man-canal-reclamo', 'mea-explicabilidad'],
  },
  {
    id: 'A.9',
    tema: 'Uso responsable',
    rotulo: 'Uso del sistema conforme a su propósito',
    descripcion:
      'Controles para impedir usos fuera del propósito declarado, incluida la supervisión humana.',
    cubre: ['man-revision-humana', 'map-proposito'],
  },
  {
    id: 'A.10',
    tema: 'Terceros',
    rotulo: 'Relaciones con proveedores y clientes',
    descripcion:
      'Reparto contractual de responsabilidades, condiciones de uso de datos y titularidad de las salidas.',
    cubre: ['gov-terceros', 'gov-propiedad'],
  },
] as const;

export interface ControlPertinente {
  readonly control: Control;
  readonly brechasQueCubre: readonly Brecha[];
  readonly prioridad: number;
}

/** Controles ordenados por el impacto de las brechas que resuelven. */
export function controlesPertinentes(e: Evaluacion): readonly ControlPertinente[] {
  return CONTROLES.map((control) => {
    const brechasQueCubre = e.brechas.filter((b) => control.cubre.includes(b.pregunta.id));
    return {
      control,
      brechasQueCubre,
      prioridad: brechasQueCubre.reduce((s, b) => s + b.impacto, 0),
    };
  })
    .filter((c) => c.brechasQueCubre.length > 0)
    .sort((a, b) => b.prioridad - a.prioridad);
}
