/**
 * Módulo «Evaluación NIST AI RMF»: el cuestionario por función.
 */
import { Eraser, Gavel } from 'lucide-react';

import { Boton, Dato, Insignia, Llamado, Tarjeta, cx } from '../brand/ui';
import { FUNCIONES, PREGUNTAS, preguntasDe } from '../domain/marco';
import type { Funcion, Respuesta } from '../domain/marco';
import { useEstado } from '../store';
import { AvisoSinLey, useEvaluacion } from './comun';

const OPCIONES: ReadonlyArray<[Respuesta, string]> = [
  ['si', 'Sí'],
  ['parcial', 'Parcial'],
  ['no', 'No'],
];

export function PanelEvaluacion() {
  const { respuestas, responder, limpiarRespuestas } = useEstado();
  const e = useEvaluacion();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        {e.porFuncion.map((f) => (
          <Dato
            key={f.funcion}
            rotulo={FUNCIONES[f.funcion].rotulo}
            valor={`${f.cobertura} %`}
            tono={f.cobertura >= 80 ? 'ok' : f.cobertura >= 50 ? 'alerta' : 'riesgo'}
            detalle={f.sinResponder > 0 ? `${f.sinResponder} sin responder` : undefined}
          />
        ))}
      </div>

      <AvisoSinLey />

      <Llamado tono="info" titulo="Cómo responder" icono={<Gavel size={18} />}>
        Responda <strong>sí</strong> solo si puede señalar el documento, el registro o el
        procedimiento que lo prueba. Lo que no se puede mostrar cuenta como no cubierto. Las
        preguntas marcadas como <Insignia tono="riesgo">deber legal</Insignia> no son buenas
        prácticas: son obligaciones exigibles hoy en Colombia.
      </Llamado>

      {(Object.keys(FUNCIONES) as Funcion[]).map((f) => (
        <Tarjeta key={f} titulo={FUNCIONES[f].rotulo} descripcion={FUNCIONES[f].proposito}>
          <div className="space-y-3">
            {preguntasDe(f).map((p) => (
              <div key={p.id} className="rounded-xl border border-borde bg-superficie-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <Insignia tono="neutro">{p.categoria}</Insignia>
                      <Insignia tono={p.peso >= 4 ? 'riesgo' : p.peso >= 3 ? 'alerta' : 'info'}>
                        peso {p.peso}
                      </Insignia>
                      {p.exigibleEnColombia && <Insignia tono="riesgo">deber legal</Insignia>}
                    </div>
                    <p className="text-sm font-medium">{p.texto}</p>
                    <p className="mt-1 text-sm text-texto-2">{p.porQue}</p>
                    {p.exigibleEnColombia && (
                      <p className="eyebrow mt-1.5">{p.exigibleEnColombia}</p>
                    )}
                  </div>

                  <div
                    className="flex shrink-0 gap-1 rounded-xl border border-borde bg-superficie p-1"
                    role="group"
                    aria-label={p.texto}
                  >
                    {OPCIONES.map(([valor, rotulo]) => {
                      const activo = respuestas[p.id] === valor;
                      return (
                        <button
                          key={valor}
                          type="button"
                          aria-pressed={activo}
                          onClick={() => responder(p.id, valor)}
                          className={cx(
                            'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                            activo
                              ? valor === 'si'
                                ? 'bg-senal text-white'
                                : valor === 'parcial'
                                  ? 'bg-ambar-suave text-tinta'
                                  : 'bg-alerta text-white'
                              : 'text-texto-2 hover:bg-superficie-2',
                          )}
                        >
                          {rotulo}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Tarjeta>
      ))}

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-texto-3">
          {Object.keys(respuestas).length} de {PREGUNTAS.length} preguntas respondidas.
        </p>
        <Boton variante="secundario" onClick={limpiarRespuestas}>
          <Eraser size={15} /> Limpiar respuestas
        </Boton>
      </div>
    </div>
  );
}
