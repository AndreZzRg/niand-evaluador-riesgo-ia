/**
 * Módulo «Controles ISO 42001»: qué control cierra cada brecha.
 */
import { BookCheck } from 'lucide-react';

import { Dato, Insignia, Llamado, Tarjeta, Vacio } from '../brand/ui';
import { CONTROLES, controlesPertinentes } from '../domain/marco';
import { useEvaluacion } from './comun';

export function PanelControles() {
  const e = useEvaluacion();
  const pertinentes = controlesPertinentes(e);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Dato rotulo="Controles del catálogo" valor={CONTROLES.length} />
        <Dato
          rotulo="Pertinentes ahora"
          valor={pertinentes.length}
          tono={pertinentes.length ? 'alerta' : 'ok'}
        />
        <Dato
          rotulo="Brechas abiertas"
          valor={e.brechas.length}
          tono={e.brechas.length ? 'riesgo' : 'ok'}
        />
      </div>

      <Llamado tono="info" titulo="Qué es la ISO/IEC 42001" icono={<BookCheck size={18} />}>
        Es la norma de <strong>sistema de gestión de inteligencia artificial</strong>, publicada en
        2023. Es certificable pero <strong>voluntaria</strong>: ninguna norma colombiana la exige.
        Sirve como estructura de trabajo y, cuando un cliente grande la pide en un contrato, como
        requisito contractual. Los controles que siguen se nombran con la referencia de su anexo.
      </Llamado>

      {pertinentes.length === 0 ? (
        <Vacio titulo="No hay controles pendientes">
          Con las respuestas actuales no quedan brechas que un control del anexo deba cerrar. Eso no
          significa que el sistema sea seguro: significa que las prácticas declaradas están
          cubiertas.
        </Vacio>
      ) : (
        <Tarjeta
          titulo="Controles pertinentes"
          descripcion="Ordenados por el impacto de las brechas que resuelven."
        >
          <ol className="space-y-4">
            {pertinentes.map(({ control, brechasQueCubre, prioridad }, i) => (
              <li key={control.id} className="rounded-xl border border-borde bg-superficie-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-full bg-marca font-mono text-xs font-semibold text-marca-contraste">
                    {i + 1}
                  </span>
                  <Insignia tono="marca">{control.id}</Insignia>
                  <h3 className="font-display text-sm font-semibold">{control.rotulo}</h3>
                  <Insignia tono="neutro">{control.tema}</Insignia>
                  <span className="ml-auto text-xs text-texto-3">prioridad {prioridad}</span>
                </div>

                <p className="mt-2 text-sm text-texto-2">{control.descripcion}</p>

                <div className="mt-3">
                  <p className="eyebrow mb-1.5">Cierra estas brechas</p>
                  <ul className="space-y-1.5">
                    {brechasQueCubre.map((b) => (
                      <li key={b.pregunta.id} className="flex gap-2 text-sm text-texto-2">
                        <span className="text-marca">·</span>
                        <span>
                          {b.pregunta.texto}
                          {b.pregunta.exigibleEnColombia && (
                            <span className="ml-1.5 text-xs font-medium text-alerta">
                              (deber legal — {b.pregunta.exigibleEnColombia})
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </Tarjeta>
      )}

      <Tarjeta
        titulo="Catálogo completo de controles"
        descripcion="Anexo A de la ISO/IEC 42001:2023."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {CONTROLES.map((c) => {
            const activo = pertinentes.some((p) => p.control.id === c.id);
            return (
              <div
                key={c.id}
                className={
                  activo
                    ? 'rounded-xl border border-ambar-suave/40 bg-ambar-suave/8 p-4'
                    : 'rounded-xl border border-borde bg-superficie-3 p-4'
                }
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Insignia tono={activo ? 'alerta' : 'ok'}>{c.id}</Insignia>
                  <span className="text-sm font-medium">{c.rotulo}</span>
                </div>
                <p className="mt-1.5 text-sm text-texto-2">{c.descripcion}</p>
                <p className="eyebrow mt-1.5">{c.tema}</p>
              </div>
            );
          })}
        </div>
      </Tarjeta>
    </div>
  );
}
