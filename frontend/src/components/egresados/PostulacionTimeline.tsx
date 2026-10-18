'use client';

import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Send, 
  Building2, 
  Award, 
  XCircle, 
  AlertCircle,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { Postulacion } from '@/lib/api';

interface PostulacionTimelineProps {
  postulacion: Postulacion;
}

export default function PostulacionTimeline({ postulacion }: PostulacionTimelineProps) {
  const { estado, notas_uth } = postulacion;

  // Determinar los estados de cada paso
  const getStepStatus = (stepIndex: number): 'completed' | 'current' | 'pending' | 'rejected' => {
    switch (estado) {
      case 'revision_uth':
        if (stepIndex === 1) return 'completed';
        if (stepIndex === 2) return 'current';
        return 'pending';

      case 'rechazada_uth':
        if (stepIndex === 1) return 'completed';
        if (stepIndex === 2) return 'rejected';
        return 'pending';

      case 'enviada_empresa':
        if (stepIndex === 1 || stepIndex === 2) return 'completed';
        if (stepIndex === 3) return 'current';
        return 'pending';

      case 'Aceptada':
        return 'completed';

      case 'Rechazada':
        if (stepIndex === 1 || stepIndex === 2 || stepIndex === 3) return 'completed';
        return 'rejected';

      default:
        if (stepIndex === 1) return 'current';
        return 'pending';
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Postulación Enviada',
      subtitle: 'Solicitud registrada',
      desc: 'Tu solicitud de empleo fue recibida en la plataforma institucional.',
    },
    {
      num: 2,
      title: 'Filtro Institucional UTH',
      subtitle: 'Validación académica',
      desc: estado === 'rechazada_uth'
        ? 'El comité de Vinculación determinó que el perfil no cumplía con los requisitos afines.'
        : 'La Dirección de Vinculación UTH audita la pertinencia de tu carrera y tu currículum vitae.',
    },
    {
      num: 3,
      title: 'Turnado a la Empresa',
      subtitle: 'Revisión por empleador',
      desc: 'Tu CV y datos de contacto fueron entregados al reclutador para agendar entrevistas.',
    },
    {
      num: 4,
      title: 'Resolución Final',
      subtitle: 'Contratación / Cierre',
      desc: estado === 'Aceptada'
        ? '¡Felicidades! Fuiste contratado y tu colocación laboral quedó registrada ante la UTH.'
        : estado === 'Rechazada'
        ? 'La empresa ha cubierto la vacante o finalizado el proceso de selección.'
        : 'Resolución definitiva del proceso de contratación por parte de la empresa.',
    },
  ];

  return (
    <div className="bg-zinc-50/80 rounded-2xl p-4 sm:p-5 border border-zinc-200/80 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#00A887]" />
          Línea de Trazabilidad UTH (Modelo Opción B)
        </span>

        {estado === 'revision_uth' && (
          <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
            Paso 2: En revisión por Vinculación UTH
          </span>
        )}
        {estado === 'enviada_empresa' && (
          <span className="text-[11px] font-bold text-blue-800 bg-blue-100/80 px-2.5 py-0.5 rounded-full border border-blue-200">
            Paso 3: Visible para el reclutador
          </span>
        )}
        {estado === 'Aceptada' && (
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Proceso Exitoso · Contratado
          </span>
        )}
        {estado === 'rechazada_uth' && (
          <span className="text-[11px] font-bold text-rose-800 bg-rose-100/80 px-2.5 py-0.5 rounded-full border border-rose-200">
            No turnado a empresa
          </span>
        )}
      </div>

      {/* Stepper horizontal en desktop, vertical en mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
        {steps.map((st) => {
          const status = getStepStatus(st.num);

          let circleClass = 'bg-zinc-200 text-zinc-500 border-zinc-300';
          let borderClass = 'border-zinc-200 bg-white';

          if (status === 'completed') {
            circleClass = 'bg-[#00A887] text-white border-[#00A887]';
            borderClass = 'border-emerald-200 bg-emerald-50/40';
          } else if (status === 'current') {
            circleClass = 'bg-[#691C32] text-white border-[#691C32] ring-4 ring-[#691C32]/20 animate-pulse';
            borderClass = 'border-[#691C32]/30 bg-[#691C32]/5';
          } else if (status === 'rejected') {
            circleClass = 'bg-rose-600 text-white border-rose-600';
            borderClass = 'border-rose-200 bg-rose-50/40';
          }

          return (
            <div 
              key={st.num}
              className={`p-3 rounded-xl border ${borderClass} transition-all space-y-2 flex flex-col justify-between`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 ${circleClass}`}>
                  {status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : status === 'rejected' ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    st.num
                  )}
                </div>
                <div className="leading-tight truncate">
                  <h4 className="text-xs font-bold text-[#2D2926] truncate">
                    {st.title}
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {st.subtitle}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[#636569] leading-snug">
                {st.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Notas Institucionales de Vinculación UTH si existen */}
      {notas_uth && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-800">
            <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
            Dictamen Institucional de Vinculación UTH:
          </div>
          <p className="text-[11px] leading-relaxed pl-5">
            {notas_uth}
          </p>
        </div>
      )}
    </div>
  );
}
