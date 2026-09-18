import { describe, expect, it } from 'vitest';

import {
  AUTONOMIAS,
  CONTROLES,
  DOMINIOS,
  FUNCIONES,
  PREGUNTAS,
  controlesPertinentes,
  evaluar,
  exposicionInherente,
  preguntasDe,
  type Funcion,
  type Respuesta,
  type Sistema,
} from './marco';

const SISTEMA: Sistema = {
  nombre: 'Filtro de hojas de vida',
  proveedor: 'Proveedor externo',
  dominio: 'talentoHumano',
  autonomia: 'recomendador',
  tratadatosPersonales: true,
  tratadatosSensibles: false,
  afectaDerechos: true,
  personasAfectadas: 500,
  descripcion: 'Ordena candidatos por afinidad con el perfil de la vacante.',
};

const todas = (r: Respuesta): Record<string, Respuesta> =>
  Object.fromEntries(PREGUNTAS.map((p) => [p.id, r]));

describe('catálogo de preguntas', () => {
  it('cubre las cuatro funciones del NIST AI RMF', () => {
    for (const f of Object.keys(FUNCIONES) as Funcion[]) {
      expect(preguntasDe(f).length, f).toBeGreaterThan(2);
    }
  });

  it('usa identificadores únicos', () => {
    const ids = PREGUNTAS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('explica por qué importa cada pregunta', () => {
    for (const p of PREGUNTAS) {
      expect(p.porQue.length, p.id).toBeGreaterThan(40);
      expect(p.peso, p.id).toBeGreaterThanOrEqual(1);
      expect(p.peso, p.id).toBeLessThanOrEqual(4);
    }
  });

  it('marca como exigible solo lo que una norma colombiana respalda', () => {
    for (const p of PREGUNTAS) {
      if (p.exigibleEnColombia !== null) {
        expect(p.exigibleEnColombia, p.id).toMatch(/Ley|C\. P\.|Decisión/);
      }
    }
  });

  it('no atribuye exigibilidad a una ley de IA inexistente', () => {
    // Regla de veracidad: Colombia no tiene ley de IA vigente.
    const texto = PREGUNTAS.map((p) => p.exigibleEnColombia ?? '').join(' ');
    expect(texto).not.toMatch(/ley de inteligencia artificial|CONPES/i);
  });

  it('exige autorización que cubra perfilamiento', () => {
    const p = PREGUNTAS.find((x) => x.id === 'map-datos-personales')!;
    expect(p.texto).toMatch(/perfilamiento/);
    expect(p.exigibleEnColombia).toContain('1581');
  });
});

describe('exposición inherente', () => {
  it('crece con la sensibilidad del dominio', () => {
    const contenido = exposicionInherente({ ...SISTEMA, dominio: 'contenido' });
    const talento = exposicionInherente({ ...SISTEMA, dominio: 'talentoHumano' });
    expect(talento).toBeGreaterThan(contenido);
  });

  it('crece con la autonomía del sistema', () => {
    const asistente = exposicionInherente({ ...SISTEMA, autonomia: 'asistente' });
    const autonomo = exposicionInherente({ ...SISTEMA, autonomia: 'decisorAutonomo' });
    expect(autonomo).toBeGreaterThan(asistente);
  });

  it('crece con datos sensibles y con la afectación de derechos', () => {
    const base = exposicionInherente({
      ...SISTEMA,
      tratadatosSensibles: false,
      afectaDerechos: false,
    });
    const agravado = exposicionInherente({
      ...SISTEMA,
      tratadatosSensibles: true,
      afectaDerechos: true,
    });
    expect(agravado).toBeGreaterThan(base);
  });

  it('crece con el número de personas afectadas', () => {
    const pocas = exposicionInherente({ ...SISTEMA, personasAfectadas: 10 });
    const muchas = exposicionInherente({ ...SISTEMA, personasAfectadas: 50_000 });
    expect(muchas).toBeGreaterThan(pocas);
  });

  it('nunca supera 100', () => {
    expect(
      exposicionInherente({
        ...SISTEMA,
        dominio: 'credito',
        autonomia: 'decisorAutonomo',
        tratadatosSensibles: true,
        afectaDerechos: true,
        personasAfectadas: 1_000_000,
      }),
    ).toBeLessThanOrEqual(100);
  });

  it('describe cada dominio y cada nivel de autonomía', () => {
    for (const d of Object.values(DOMINIOS)) expect(d.nota.length).toBeGreaterThan(30);
    for (const a of Object.values(AUTONOMIAS)) expect(a.nota.length).toBeGreaterThan(30);
  });
});

describe('evaluación', () => {
  it('da cobertura total cuando todo se cumple', () => {
    const e = evaluar(SISTEMA, todas('si'));
    expect(e.cobertura).toBe(100);
    expect(e.brechas).toHaveLength(0);
  });

  it('da cobertura cero cuando nada se cumple', () => {
    const e = evaluar(SISTEMA, todas('no'));
    expect(e.cobertura).toBe(0);
    expect(e.brechas).toHaveLength(PREGUNTAS.length);
  });

  it('cuenta lo parcial como media cobertura', () => {
    expect(evaluar(SISTEMA, todas('parcial')).cobertura).toBe(50);
  });

  it('trata lo no respondido como no cubierto y lo advierte', () => {
    const e = evaluar(SISTEMA, {});
    expect(e.cobertura).toBe(0);
    expect(e.avisos.some((a) => a.includes('sin responder'))).toBe(true);
  });

  it('reduce el riesgo con la cobertura, sin llevarlo a cero', () => {
    const sinControles = evaluar(SISTEMA, todas('no'));
    const conControles = evaluar(SISTEMA, todas('si'));
    expect(conControles.riesgo).toBeLessThan(sinControles.riesgo);
    expect(conControles.riesgo).toBeGreaterThan(0);
  });

  it('clasifica el nivel por tramos', () => {
    const alto = evaluar(
      { ...SISTEMA, autonomia: 'decisorAutonomo', tratadatosSensibles: true },
      todas('no'),
    );
    expect(alto.nivel).toBe('inaceptable');
    const bajo = evaluar(
      { ...SISTEMA, dominio: 'operaciones', autonomia: 'asistente' },
      todas('si'),
    );
    expect(bajo.nivel).toBe('bajo');
  });

  it('ordena las brechas por impacto', () => {
    const e = evaluar(SISTEMA, todas('no'));
    for (let i = 1; i < e.brechas.length; i++) {
      expect(e.brechas[i - 1]!.impacto).toBeGreaterThanOrEqual(e.brechas[i]!.impacto);
    }
  });

  it('separa las brechas que sí son exigibles en Colombia', () => {
    const e = evaluar(SISTEMA, todas('no'));
    expect(e.exigiblesIncumplidas.length).toBeGreaterThan(0);
    expect(e.exigiblesIncumplidas.every((b) => b.pregunta.exigibleEnColombia !== null)).toBe(true);
    expect(e.avisos.some((a) => a.includes('sí exigibles en Colombia'))).toBe(true);
  });

  it('no reporta exigibles incumplidas cuando todo se cumple', () => {
    expect(evaluar(SISTEMA, todas('si')).exigiblesIncumplidas).toHaveLength(0);
  });

  it('advierte siempre que Colombia no tiene ley de IA', () => {
    const e = evaluar(SISTEMA, todas('si'));
    expect(e.avisos[0]).toMatch(/no tiene una ley de inteligencia artificial vigente/);
    expect(e.avisos[0]).toMatch(/voluntarios/);
  });

  it('advierte sobre los datos sensibles', () => {
    const e = evaluar({ ...SISTEMA, tratadatosSensibles: true }, todas('si'));
    expect(e.avisos.some((a) => a.includes('art. 6 de la Ley 1581'))).toBe(true);
  });

  it('advierte sobre la decisión autónoma que afecta derechos', () => {
    const e = evaluar({ ...SISTEMA, autonomia: 'decisorAutonomo' }, todas('si'));
    expect(e.avisos.some((a) => a.includes('canal de impugnación'))).toBe(true);
  });

  it('calcula la cobertura de cada función por separado', () => {
    const soloGobierno = Object.fromEntries(
      PREGUNTAS.filter((p) => p.funcion === 'govern').map((p) => [p.id, 'si' as Respuesta]),
    );
    const e = evaluar(SISTEMA, soloGobierno);
    expect(e.porFuncion.find((f) => f.funcion === 'govern')!.cobertura).toBe(100);
    expect(e.porFuncion.find((f) => f.funcion === 'manage')!.cobertura).toBe(0);
  });
});

describe('controles ISO/IEC 42001', () => {
  it('describe cada control y las preguntas que cubre', () => {
    for (const c of CONTROLES) {
      expect(c.descripcion.length, c.id).toBeGreaterThan(40);
      expect(c.cubre.length, c.id).toBeGreaterThan(0);
    }
  });

  it('solo referencia preguntas existentes', () => {
    const ids = new Set(PREGUNTAS.map((p) => p.id));
    for (const c of CONTROLES) {
      for (const p of c.cubre) expect(ids.has(p), `${c.id}→${p}`).toBe(true);
    }
  });

  it('no propone controles cuando no hay brechas', () => {
    expect(controlesPertinentes(evaluar(SISTEMA, todas('si')))).toHaveLength(0);
  });

  it('prioriza los controles que cierran las brechas de mayor impacto', () => {
    const pertinentes = controlesPertinentes(evaluar(SISTEMA, todas('no')));
    expect(pertinentes.length).toBeGreaterThan(0);
    for (let i = 1; i < pertinentes.length; i++) {
      expect(pertinentes[i - 1]!.prioridad).toBeGreaterThanOrEqual(pertinentes[i]!.prioridad);
    }
  });

  it('propone solo los controles cuyas brechas están abiertas', () => {
    const soloUna: Record<string, Respuesta> = {
      ...todas('si'),
      'gov-terceros': 'no',
    };
    const pertinentes = controlesPertinentes(evaluar(SISTEMA, soloUna));
    expect(pertinentes).toHaveLength(1);
    expect(pertinentes[0]!.control.id).toBe('A.10');
  });
});
