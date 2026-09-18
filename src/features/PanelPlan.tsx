/**
 * Módulo «Plan de tratamiento»: las brechas convertidas en trabajo con orden.
 */
import { Download, ListChecks, Printer } from 'lucide-react';

import { Boton, Dato, Insignia, Llamado, Tabla, Tarjeta, Td, Th, Vacio } from '../brand/ui';
import { Logo } from '../brand/Logo';
import { CONTROLES, FUNCIONES, controlesPertinentes } from '../domain/marco';
import { exportarCSV, imprimir } from '../lib/exportar';
import { useEstado } from '../store';
import { ROTULO_NIVEL, TONO_NIVEL, useEvaluacion } from './comun';

export function PanelPlan() {
  const sistema = useEstado((s) => s.sistema);
  const e = useEvaluacion();

  if (e.brechas.length === 0) {
    return (
      <Vacio titulo="No hay brechas que tratar">
        Complete la evaluación. Si ya lo hizo y no aparece nada, es porque todas las prácticas
        declaradas están cubiertas; conserve la evidencia y reevalúe cuando el sistema cambie.
      </Vacio>
    );
  }

  // Los deberes legales van primero; dentro de cada grupo, por impacto.
  const plan = [...e.brechas].sort(
    (a, b) =>
      Number(Boolean(b.pregunta.exigibleEnColombia)) -
        Number(Boolean(a.pregunta.exigibleEnColombia)) || b.impacto - a.impacto,
  );

  const controlDe = (preguntaId: string) =>
    CONTROLES.find((c) => c.cubre.includes(preguntaId))?.id ?? '—';

  return (
    <div className="space-y-6">
      <div className="no-imprimir grid gap-4 sm:grid-cols-4">
        <Dato rotulo="Acciones del plan" valor={plan.length} tono="marca" />
        <Dato
          rotulo="Deberes legales primero"
          valor={e.exigiblesIncumplidas.length}
          tono={e.exigiblesIncumplidas.length ? 'riesgo' : 'ok'}
        />
        <Dato
          rotulo="Riesgo residual actual"
          valor={`${e.riesgo} / 100`}
          tono={TONO_NIVEL[e.nivel]}
        />
        <Dato
          rotulo="Controles a implementar"
          valor={controlesPertinentes(e).length}
          detalle="ISO/IEC 42001"
        />
      </div>

      <div className="no-imprimir flex flex-wrap gap-2">
        <Boton
          onClick={() =>
            exportarCSV(
              [
                ['Plan de tratamiento del riesgo de IA'],
                ['Sistema', sistema.nombre || 'Sin nombre'],
                ['Riesgo residual', e.riesgo, 'Nivel', ROTULO_NIVEL[e.nivel]],
                [],
                [
                  '#',
                  'Acción',
                  'Función',
                  'Control ISO',
                  'Impacto',
                  'Deber legal',
                  'Estado actual',
                ],
                ...plan.map((b, i) => [
                  i + 1,
                  b.pregunta.texto,
                  FUNCIONES[b.pregunta.funcion].rotulo,
                  controlDe(b.pregunta.id),
                  b.impacto,
                  b.pregunta.exigibleEnColombia ?? 'No',
                  b.respuesta,
                ]),
              ],
              'plan-tratamiento-ia',
            )
          }
        >
          <Download size={15} /> CSV
        </Boton>
        <Boton variante="secundario" onClick={imprimir}>
          <Printer size={15} /> Imprimir
        </Boton>
      </div>

      <Llamado tono="marca" titulo="Cómo está ordenado" icono={<ListChecks size={18} />}>
        Primero lo que es <strong>exigible por norma colombiana</strong>, porque eso no es una
        recomendación. Después, por el impacto de la brecha en el riesgo residual. Es el orden que
        más riesgo cierra por hora invertida.
      </Llamado>

      <Tarjeta className="print:border-0 print:shadow-none">
        <header className="mb-6 border-b border-borde pb-5">
          <Logo alto={28} />
          <h1 className="mt-4 font-display text-xl font-semibold">
            Plan de tratamiento del riesgo
          </h1>
          <p className="text-sm text-texto-2">
            {sistema.nombre || 'Sistema sin nombre'}
            {sistema.proveedor ? ` · ${sistema.proveedor}` : ''}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Insignia tono={TONO_NIVEL[e.nivel]}>
              Riesgo residual {e.riesgo}/100 · {ROTULO_NIVEL[e.nivel]}
            </Insignia>
            <Insignia tono="marca">Cobertura {e.cobertura} %</Insignia>
          </div>
        </header>

        <Tabla>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>Acción</Th>
              <Th>Control</Th>
              <Th numerico>Impacto</Th>
            </tr>
          </thead>
          <tbody>
            {plan.map((b, i) => (
              <tr
                key={b.pregunta.id}
                className={b.pregunta.exigibleEnColombia ? 'bg-alerta/5' : undefined}
              >
                <Td numerico className="font-mono text-texto-3">
                  {i + 1}
                </Td>
                <Td>
                  <span className="font-medium">{b.pregunta.texto}</span>
                  <span className="block text-xs text-texto-2">{b.pregunta.porQue}</span>
                  <span className="eyebrow block">
                    {FUNCIONES[b.pregunta.funcion].rotulo} · {b.pregunta.categoria}
                    {b.pregunta.exigibleEnColombia
                      ? ` · DEBER LEGAL: ${b.pregunta.exigibleEnColombia}`
                      : ''}
                  </span>
                </Td>
                <Td>
                  <Insignia tono="neutro">{controlDe(b.pregunta.id)}</Insignia>
                </Td>
                <Td numerico className="font-medium">
                  {b.impacto}
                </Td>
              </tr>
            ))}
          </tbody>
        </Tabla>

        <footer className="mt-6 border-t border-borde pt-4 text-xs text-texto-3">
          <p>
            <strong>Advertencia.</strong> Colombia no tiene una ley de inteligencia artificial
            vigente. NIST AI RMF 1.0 e ISO/IEC 42001:2023 son marcos de referencia voluntarios; lo
            exigible es el régimen de datos personales de la Ley 1581 de 2012, el Estatuto del
            Consumidor y el régimen general de responsabilidad. Los resultados son orientativos y no
            constituyen concepto jurídico profesional. Proyecto de laboratorio de NiAnd Labs; no
            corresponde a un cliente real.
          </p>
        </footer>
      </Tarjeta>
    </div>
  );
}
