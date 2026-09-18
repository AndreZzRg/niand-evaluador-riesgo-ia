/**
 * Estado del evaluador. Guarda la ficha del sistema y las respuestas; la
 * evaluación se deriva siempre del dominio.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { almacenZustand } from './lib/almacen';
import type { Respuesta, Sistema } from './domain/marco';

interface Estado {
  sistema: Sistema;
  respuestas: Record<string, Respuesta>;
  setSistema: (p: Partial<Sistema>) => void;
  responder: (id: string, r: Respuesta) => void;
  limpiarRespuestas: () => void;
  reiniciar: () => void;
}

const INICIAL = {
  sistema: {
    nombre: '',
    proveedor: '',
    dominio: 'talentoHumano',
    autonomia: 'recomendador',
    tratadatosPersonales: true,
    tratadatosSensibles: false,
    afectaDerechos: true,
    personasAfectadas: 500,
    descripcion: '',
  } satisfies Sistema,
  respuestas: {} as Record<string, Respuesta>,
};

export const useEstado = create<Estado>()(
  persist(
    (set) => ({
      ...structuredClone(INICIAL),
      setSistema: (p) => set((s) => ({ sistema: { ...s.sistema, ...p } })),
      responder: (id, r) => set((s) => ({ respuestas: { ...s.respuestas, [id]: r } })),
      limpiarRespuestas: () => set({ respuestas: {} }),
      reiniciar: () => set(structuredClone(INICIAL)),
    }),
    {
      name: 'estado',
      version: 1,
      storage: createJSONStorage(() => almacenZustand),
      partialize: (s) => ({ sistema: s.sistema, respuestas: s.respuestas }),
    },
  ),
);
