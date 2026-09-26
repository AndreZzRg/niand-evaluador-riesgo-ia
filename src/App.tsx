import { useState, type JSX } from 'react';

import { Portada } from './brand/Portada';
import { APP, MODULOS, Shell, type ModuloId, type Vista } from './brand/Shell';
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
  // Se abre en la portada: quien llega ve primero de qué se compone la
  // herramienta, en vez de caer dentro del primer módulo sin contexto.
  const [vista, setVista] = useState<Vista>('portada');
  const Panel = vista === 'portada' ? null : PANELES[vista];

  return (
    <Shell vista={vista} onVista={setVista}>
      {Panel ? (
        <Panel />
      ) : (
        <Portada
          titulo={APP.nombre}
          descripcion={APP.resumen}
          modulos={MODULOS}
          onAbrir={(id) => setVista(id as ModuloId)}
        />
      )}
    </Shell>
  );
}
