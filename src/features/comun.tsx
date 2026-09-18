/**
 * Piezas compartidas entre los módulos del evaluador.
 */
import { useMemo } from 'react';
import { TriangleAlert } from 'lucide-react';

import { Llamado, type Tono } from '../brand/ui';
import { evaluar, type Nivel } from '../domain/marco';
import { useEstado } from '../store';

export function useEvaluacion() {
  const { sistema, respuestas } = useEstado();
  return useMemo(() => evaluar(sistema, respuestas), [sistema, respuestas]);
}

export const TONO_NIVEL: Record<Nivel, Tono> = {
  bajo: 'ok',
  moderado: 'info',
  alto: 'alerta',
  inaceptable: 'riesgo',
};

export const ROTULO_NIVEL: Record<Nivel, string> = {
  bajo: 'Bajo',
  moderado: 'Moderado',
  alto: 'Alto',
  inaceptable: 'Inaceptable sin tratamiento',
};

/**
 * Advertencia que aparece en todos los módulos. No es un adorno: es la
 * diferencia entre una herramienta útil y una afirmación jurídica falsa.
 */
export function AvisoSinLey() {
  return (
    <Llamado
      tono="alerta"
      titulo="Colombia no tiene una ley de inteligencia artificial vigente"
      icono={<TriangleAlert size={18} />}
    >
      A la fecha de verificación de este repositorio había proyectos en trámite —PL 043 y 324 de
      2025, PL 042 de 2025 y PL 025 de 2026—, pero <strong>un proyecto de ley no obliga</strong>, y
      un documento CONPES es política pública, no norma exigible a particulares.{' '}
      <strong>NIST AI RMF 1.0 e ISO/IEC 42001:2023 son marcos voluntarios.</strong> Lo exigible hoy
      es el régimen de datos personales de la Ley 1581 de 2012, el Estatuto del Consumidor y el
      régimen general de responsabilidad.
    </Llamado>
  );
}
