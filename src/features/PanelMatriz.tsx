/**
 * Módulo «Matriz de riesgo»: exposición inherente, controles y residuo.
 */
import { Download, TrendingDown } from 'lucide-react';

import { Boton, Dato, Insignia, Llamado, Tabla, Tarjeta, Td, Th, cx } from '../brand/ui';
import { FUNCIONES, exposicionInherente } from '../domain/marco';
import { exportarCSV } from '../lib/exportar';
import { useEstado } from '../store';
import { AvisoSinLey, ROTULO_NIVEL, TONO_NIVEL, useEvaluacion } from './comun';

export function PanelMatriz() {
  const sistema = useEstado((s) => s.sistema);
  const e = useEvaluacion();
  const inherente = exposicionInherente(sistema);
  const reduccion = inherente > 0 ? (inherente - e.riesgo) / inherente : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <Dato rotulo="Exposición inherente" valor={`${inherente} / 100`} tono="alerta" />
        <Dato rotulo="Cobertura de controles" valor={`${e.cobertura} %`} tono="marca" />
        <Dato
          rotulo="Riesgo residual"
          valor={`${e.riesgo} / 100`}
          tono={TONO_NIVEL[e.nivel]}
          detalle={ROTULO_NIVEL[e.nivel]}
        />
        <Dato
          rotulo="Reducción lograda"
          valor={`${Math.round(reduccion * 100)} %`}
          tono="ok"
          detalle="Tope técnico: 85 %"
        />
      </div>

      <Llamado
        tono="info"
        titulo="Por qué el riesgo nunca llega a cero"
        icono={<TrendingDown size={18} />}
      >
        Los controles reducen la exposición hasta un máximo del 85 %. Siempre queda un{' '}
        <strong>riesgo residual</strong>: ningún conjunto de prácticas elimina la posibilidad de que
        un sistema falle. Presentar un riesgo cero sería la clase de afirmación que esta herramienta
        existe para no hacer.
      </Llamado>

      <Tarjeta
        titulo="Cobertura por función del NIST AI RMF"
        acciones={
          <Boton
            variante="secundario"
            tamano="sm"
            onClick={() =>
              exportarCSV(
                [
                  ['Evaluación de riesgo de IA'],
                  ['Sistema', sistema.nombre || 'Sin nombre', 'Proveedor', sistema.proveedor],
                  ['Exposición inherente', inherente, 'Riesgo residual', e.riesgo],
                  ['Nivel', ROTULO_NIVEL[e.nivel], 'Cobertura', `${e.cobertura}%`],
                  [],
                  ['Función', 'Cobertura', 'Peso cubierto', 'Peso total', 'Sin responder'],
                  ...e.porFuncion.map((f) => [
                    FUNCIONES[f.funcion].rotulo,
                    `${f.cobertura}%`,
                    f.pesoCubierto,
                    f.pesoTotal,
                    f.sinResponder,
                  ]),
                  [],
                  ['Brecha', 'Función', 'Respuesta', 'Impacto', 'Deber legal'],
                  ...e.brechas.map((b) => [
                    b.pregunta.texto,
                    FUNCIONES[b.pregunta.funcion].rotulo,
                    b.respuesta,
                    b.impacto,
                    b.pregunta.exigibleEnColombia ?? '',
                  ]),
                ],
                'evaluacion-riesgo-ia',
              )
            }
          >
            <Download size={14} /> CSV
          </Boton>
        }
      >
        <div className="space-y-4">
          {e.porFuncion.map((f) => (
            <div key={f.funcion}>
              <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-display text-sm font-semibold">
                  {FUNCIONES[f.funcion].rotulo}
                </span>
                <span className="cifra text-sm text-texto-2">{f.cobertura} %</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-superficie-2">
                <div
                  className={cx(
                    'h-full rounded-full transition-[width] duration-500',
                    f.cobertura >= 80
                      ? 'bg-senal'
                      : f.cobertura >= 50
                        ? 'bg-ambar-suave'
                        : 'bg-alerta',
                  )}
                  style={{ width: `${f.cobertura}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-texto-3">{FUNCIONES[f.funcion].proposito}</p>
            </div>
          ))}
        </div>
      </Tarjeta>

      {e.exigiblesIncumplidas.length > 0 && (
        <Tarjeta
          titulo="Deberes exigibles incumplidos"
          descripcion="Esto no son buenas prácticas: son obligaciones vigentes en Colombia."
        >
          <Tabla>
            <thead>
              <tr>
                <Th>Deber</Th>
                <Th>Estado</Th>
                <Th>Norma</Th>
              </tr>
            </thead>
            <tbody>
              {e.exigiblesIncumplidas.map((b) => (
                <tr key={b.pregunta.id} className="bg-alerta/5">
                  <Td>
                    <span className="font-medium">{b.pregunta.texto}</span>
                    <span className="block text-xs text-texto-2">{b.pregunta.porQue}</span>
                  </Td>
                  <Td>
                    <Insignia tono={b.respuesta === 'parcial' ? 'alerta' : 'riesgo'}>
                      {b.respuesta === 'sinResponder' ? 'sin responder' : b.respuesta}
                    </Insignia>
                  </Td>
                  <Td className="text-xs text-texto-2">{b.pregunta.exigibleEnColombia}</Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        </Tarjeta>
      )}

      {e.avisos.map((a) => (
        <Llamado key={a} tono="alerta">
          {a}
        </Llamado>
      ))}

      <AvisoSinLey />
    </div>
  );
}
