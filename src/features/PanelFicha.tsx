/**
 * Módulo «Ficha del sistema»: qué es, qué decide y a quién afecta.
 */
import { Cpu } from 'lucide-react';

import {
  AreaTexto,
  Campo,
  Dato,
  Entrada,
  Insignia,
  Interruptor,
  Llamado,
  Seleccion,
  Tarjeta,
} from '../brand/ui';
import { AUTONOMIAS, DOMINIOS, exposicionInherente } from '../domain/marco';
import type { Autonomia, Dominio } from '../domain/marco';
import { numero } from '../lib/formato';
import { useEstado } from '../store';
import { AvisoSinLey, ROTULO_NIVEL, TONO_NIVEL, useEvaluacion } from './comun';

export function PanelFicha() {
  const { sistema, setSistema } = useEstado();
  const e = useEvaluacion();
  const inherente = exposicionInherente(sistema);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <Dato
          rotulo="Exposición inherente"
          valor={`${inherente} / 100`}
          detalle="Antes de controles"
          tono={inherente >= 60 ? 'riesgo' : inherente >= 35 ? 'alerta' : 'ok'}
        />
        <Dato rotulo="Cobertura de prácticas" valor={`${e.cobertura} %`} tono="marca" />
        <Dato
          rotulo="Riesgo residual"
          valor={`${e.riesgo} / 100`}
          tono={TONO_NIVEL[e.nivel]}
          detalle={ROTULO_NIVEL[e.nivel]}
        />
        <Dato
          rotulo="Deberes incumplidos"
          valor={e.exigiblesIncumplidas.length}
          tono={e.exigiblesIncumplidas.length ? 'riesgo' : 'ok'}
          detalle="Exigibles en Colombia"
        />
      </div>

      <AvisoSinLey />

      <Tarjeta
        titulo="Ficha del sistema"
        descripcion="Define el riesgo inherente antes de cualquier control."
      >
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Nombre del sistema" requerido>
              {(id) => (
                <Entrada
                  id={id}
                  value={sistema.nombre}
                  placeholder="Filtro de hojas de vida"
                  onChange={(ev) => setSistema({ nombre: ev.target.value })}
                />
              )}
            </Campo>
            <Campo etiqueta="Proveedor o desarrollador">
              {(id) => (
                <Entrada
                  id={id}
                  value={sistema.proveedor}
                  onChange={(ev) => setSistema({ proveedor: ev.target.value })}
                />
              )}
            </Campo>
          </div>

          <Campo etiqueta="Qué hace el sistema" ayuda="En una o dos frases, sin jerga.">
            {(id) => (
              <AreaTexto
                id={id}
                rows={2}
                value={sistema.descripcion}
                onChange={(ev) => setSistema({ descripcion: ev.target.value })}
              />
            )}
          </Campo>

          <Campo etiqueta="Dominio de aplicación">
            {(id) => (
              <Seleccion
                id={id}
                value={sistema.dominio}
                onChange={(ev) => setSistema({ dominio: ev.target.value as Dominio })}
              >
                {(Object.keys(DOMINIOS) as Dominio[]).map((d) => (
                  <option key={d} value={d}>
                    {DOMINIOS[d].rotulo}
                  </option>
                ))}
              </Seleccion>
            )}
          </Campo>
          <Llamado tono="info" icono={<Cpu size={18} />}>
            {DOMINIOS[sistema.dominio].nota}
          </Llamado>

          <Campo etiqueta="Nivel de autonomía">
            {(id) => (
              <Seleccion
                id={id}
                value={sistema.autonomia}
                onChange={(ev) => setSistema({ autonomia: ev.target.value as Autonomia })}
              >
                {(Object.keys(AUTONOMIAS) as Autonomia[]).map((a) => (
                  <option key={a} value={a}>
                    {AUTONOMIAS[a].rotulo}
                  </option>
                ))}
              </Seleccion>
            )}
          </Campo>
          <Llamado tono={sistema.autonomia === 'decisorAutonomo' ? 'riesgo' : 'info'}>
            {AUTONOMIAS[sistema.autonomia].nota}
          </Llamado>

          <Campo etiqueta="Personas afectadas (estimado)">
            {(id) => (
              <Entrada
                id={id}
                type="number"
                min={0}
                value={sistema.personasAfectadas}
                onChange={(ev) => setSistema({ personasAfectadas: Number(ev.target.value) })}
              />
            )}
          </Campo>

          <div className="space-y-3 border-t border-borde pt-4">
            {(
              [
                [
                  'tratadatosPersonales',
                  'Trata datos personales',
                  'En entrenamiento, en inferencia o en ambos.',
                ],
                [
                  'tratadatosSensibles',
                  'Trata datos sensibles',
                  'Salud, biométricos, origen racial, afiliación sindical, convicciones u orientación sexual.',
                ],
                [
                  'afectaDerechos',
                  'Afecta derechos o produce efectos significativos',
                  'Acceso al empleo, a un crédito, a un servicio, o terminación de una relación.',
                ],
              ] as const
            ).map(([campo, rotulo, nota]) => (
              <div key={campo} className="flex items-start gap-3">
                <Interruptor
                  activo={sistema[campo]}
                  onChange={(v) => setSistema({ [campo]: v })}
                  etiqueta={rotulo}
                />
                <span className="text-sm">
                  <strong>{rotulo}</strong>
                  <span className="block text-xs text-texto-3">{nota}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 border-t border-borde pt-4">
            <Insignia tono="marca">Exposición inherente {inherente}</Insignia>
            <Insignia tono={TONO_NIVEL[e.nivel]}>
              Riesgo residual {e.riesgo} · {ROTULO_NIVEL[e.nivel]}
            </Insignia>
            <Insignia tono="neutro">
              {numero(sistema.personasAfectadas, 0)} personas alcanzadas
            </Insignia>
          </div>
        </div>
      </Tarjeta>
    </div>
  );
}
