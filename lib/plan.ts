/**
 * Lógica de planificación de vídeos largos en NotebookLM.
 *
 * NotebookLM no deja fijar la duración: se pide indirectamente con el formato,
 * la longitud y el campo de instrucciones personalizadas. Aquí traducimos una
 * duración objetivo a un presupuesto de palabras y lo repartimos en bloques que
 * el formato sí es capaz de producir de forma fiable.
 */

/** Ritmo de narración observado en los Video Overviews (palabras por minuto). */
export const PALABRAS_POR_MINUTO = 145;

export type Formato = "explainer" | "cinematic" | "short";

export type FichaFormato = {
  nombre: string;
  /** Duración por bloque con la que este formato acierta de forma consistente. */
  optimo: number;
  maximo: number;
  descripcion: string;
};

export const FORMATOS: Record<Formato, FichaFormato> = {
  explainer: {
    nombre: "Explainer",
    optimo: 4,
    maximo: 6,
    descripcion: "Narración estructurada sobre láminas. Es el formato largo.",
  },
  cinematic: {
    nombre: "Cinematic",
    optimo: 2.5,
    maximo: 4,
    descripcion: "Animado y narrado. Más vistoso, más corto.",
  },
  short: {
    nombre: "Short",
    optimo: 1,
    maximo: 1,
    descripcion: "Vertical de ~60 s. Duración fija.",
  },
};

/** Límite del campo de instrucciones personalizadas según el plan. */
export const LIMITE_GRATIS = 500;
export const LIMITE_PLUS = 10000;

export type Estrategia = "bloques" | "unico";

export type Entrada = {
  tema: string;
  audiencia: string;
  /** Guion o índice: un punto por línea. */
  guion: string;
  minutos: number;
  formato: Formato;
  estrategia: Estrategia;
  limiteCaracteres: number;
};

export type Bloque = {
  n: number;
  titulo: string;
  minutos: number;
  palabras: number;
  puntos: string[];
  instruccion: string;
};

export type Plan = {
  bloques: Bloque[];
  minutosObjetivo: number;
  palabrasTotales: number;
  formato: FichaFormato;
  avisos: string[];
};

/** Extrae los puntos del guion, quitando viñetas y numeración manual. */
export function leerPuntos(guion: string): string[] {
  return guion
    .split("\n")
    .map((linea) => linea.replace(/^\s*(?:[-*•–—]|\d+[.)])\s*/, "").trim())
    .filter((linea) => linea.length > 0);
}

function recortar(texto: string, max: number): string {
  return texto.length <= max ? texto : `${texto.slice(0, max - 1).trimEnd()}…`;
}

/** Reparte los puntos en `n` grupos lo más parejos posible, conservando el orden. */
function repartir<T>(items: T[], n: number): T[][] {
  const grupos: T[][] = Array.from({ length: n }, () => []);
  if (items.length === 0) return grupos;

  const base = Math.floor(items.length / n);
  const sobrantes = items.length % n;
  let cursor = 0;

  for (let i = 0; i < n; i += 1) {
    const tamano = base + (i < sobrantes ? 1 : 0);
    grupos[i] = items.slice(cursor, cursor + tamano);
    cursor += tamano;
  }

  return grupos;
}

/**
 * Monta la instrucción respetando el límite de caracteres: primero lo que no
 * puede faltar (audiencia, alcance y presupuesto de palabras) y después las
 * frases que alargan la narración, mientras quepan.
 */
function construirInstruccion(
  bloque: Omit<Bloque, "instruccion">,
  total: number,
  entrada: Entrada,
): string {
  const limite = entrada.limiteCaracteres;
  const tema = entrada.tema.trim() || "las fuentes del notebook";
  const audiencia = entrada.audiencia.trim() || "alguien que parte de cero";

  const alcance =
    bloque.puntos.length > 0
      ? bloque.puntos.join("; ")
      : bloque.titulo;

  let nucleo =
    `Audiencia: ${audiencia}. Tema: ${tema}. ` +
    `Cubre ÚNICAMENTE: ${alcance}. ` +
    `Extensión: ~${bloque.palabras} palabras de narración (${bloque.minutos} min).`;

  // Si ni el núcleo cabe, se recorta el alcance en lugar de perder el encargo.
  if (nucleo.length > limite) {
    const fijo = nucleo.length - alcance.length;
    nucleo = nucleo.replace(alcance, recortar(alcance, Math.max(20, limite - fijo)));
  }

  const extras: string[] = [];

  if (total > 1 && bloque.n === 1) {
    extras.push(`Es el bloque 1 de ${total}: presenta el tema en 15 segundos y entra en materia.`);
  } else if (total > 1 && bloque.n === total) {
    extras.push(`Es el bloque final de ${total}: no repitas la introducción y cierra con conclusiones accionables.`);
  } else if (total > 1) {
    extras.push(`Es el bloque ${bloque.n} de ${total}: no repitas la introducción y termina con una frase puente al siguiente.`);
  }

  extras.push("Desarrolla cada punto con un ejemplo concreto y su dato de las fuentes.");
  extras.push("Ritmo pausado: explica el porqué de cada idea antes de pasar a la siguiente.");
  extras.push("No condenses el material; si sobra tiempo, profundiza en vez de repetir.");

  let texto = nucleo;
  for (const extra of extras) {
    if (texto.length + 1 + extra.length <= limite) texto = `${texto} ${extra}`;
  }

  return texto;
}

export function construirPlan(entrada: Entrada): Plan {
  const ficha = FORMATOS[entrada.formato];
  const puntos = leerPuntos(entrada.guion);
  const minutos = Math.max(1, entrada.minutos);

  const sugeridos = Math.max(1, Math.round(minutos / ficha.optimo));
  const cantidad =
    entrada.estrategia === "unico"
      ? 1
      : Math.max(1, Math.min(sugeridos, puntos.length || sugeridos));

  const grupos = repartir(puntos, cantidad);
  const minutosPorBloque = Math.round((minutos / cantidad) * 10) / 10;

  const bloques: Bloque[] = grupos.map((grupo, i) => {
    const parcial = {
      n: i + 1,
      titulo: grupo[0] ? recortar(grupo[0], 70) : `Bloque ${i + 1}`,
      minutos: minutosPorBloque,
      palabras: Math.round(minutosPorBloque * PALABRAS_POR_MINUTO),
      puntos: grupo,
    };
    return { ...parcial, instruccion: construirInstruccion(parcial, cantidad, entrada) };
  });

  return {
    bloques,
    minutosObjetivo: minutos,
    palabrasTotales: Math.round(minutos * PALABRAS_POR_MINUTO),
    formato: ficha,
    avisos: avisar(entrada, ficha, minutosPorBloque, cantidad, puntos.length),
  };
}

function avisar(
  entrada: Entrada,
  ficha: FichaFormato,
  minutosPorBloque: number,
  cantidad: number,
  puntos: number,
): string[] {
  const avisos: string[] = [];

  if (puntos === 0) {
    avisos.push(
      "Sin guion, el reparto es a ciegas: pega tu índice con un punto por línea y los bloques saldrán con alcance propio.",
    );
  }

  if (entrada.formato === "short") {
    avisos.push(
      `El formato Short dura ~60 s y no se alarga. Para ${entrada.minutos} min harían falta ${Math.ceil(entrada.minutos)} clips, y quedan como piezas sueltas, no como un vídeo.`,
    );
  } else if (minutosPorBloque > ficha.maximo) {
    avisos.push(
      `Pides ${minutosPorBloque} min a un solo ${ficha.nombre} y el formato rinde bien hasta ~${ficha.maximo}. Sube el número de bloques o cambia a Explainer.`,
    );
  }

  if (entrada.estrategia === "unico" && entrada.minutos > ficha.maximo) {
    avisos.push(
      "En un solo vídeo la duración es una petición, no un ajuste: NotebookLM puede devolverte la mitad. Genera dos o tres veces y quédate con la toma más larga.",
    );
  }

  if (entrada.limiteCaracteres === LIMITE_GRATIS) {
    avisos.push(
      "Con 500 caracteres las frases que alargan la narración entran justas. En NotebookLM Plus el campo admite 10.000 y el control de duración mejora bastante.",
    );
  }

  if (cantidad > 1) {
    avisos.push(
      `Genera los ${cantidad} bloques por separado y únelos en cualquier editor. Es el único camino que da una duración predecible.`,
    );
  }

  return avisos;
}
