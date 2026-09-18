import { useState, type JSX } from 'react';

import { Shell, type ModuloId } from './brand/Shell';
import { PanelControles } from './features/PanelControles';
import { PanelEvaluacion } from './features/PanelEvaluacion';
import { PanelFicha } from './features/PanelFicha';
import { PanelMatriz } from './features/PanelMatriz';
import { PanelPlan } from './features/PanelPlan';

const PANELES: Record<ModuloId, () => JSX.Element> = {
  'ficha-del-sistema': PanelFicha,
  'evaluacion-nist-ai-rmf': PanelEvaluacion,
  'matriz-de-riesgo': PanelMatriz,
  'controles-iso-42001': PanelControles,
  'plan-de-tratamiento': PanelPlan,
};

export default function App() {
  const [modulo, setModulo] = useState<ModuloId>('ficha-del-sistema');
  const Panel = PANELES[modulo];

  return (
    <Shell moduloActivo={modulo} onModulo={setModulo}>
      <Panel />
    </Shell>
  );
}
