'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
} from 'lucide-react';
import { Postulacion } from '@/lib/api';
import { Card, StatusPill, Alert } from '@/components/ui';

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
      desc: 'Tu solicitud fue recibida en la plataforma institucional.',
    },
    {
      num: 2,
      title: 'Filtro Institucional UTH',
      subtitle: 'Validación académica',
      desc:
        estado === 'rechazada_uth'
          ? 'El comité de Vinculación determinó que el perfil no cumplía con los requisitos afines.'
          : 'Vinculación UTH audita la pertinencia de tu carrera y currículum vitae.',
    },
    {
      num: 3,
      title: 'Turnado a la Empresa',
      subtitle: 'Revisión por empleador',
      desc: 'Tu CV y contacto fueron turnados al reclutador para agendar entrevistas.',
    },
    {
      num: 4,
      title: 'Resolución Final',
      subtitle: 'Contratación / Cierre',
      desc:
        estado === 'Aceptada'
          ? '¡Felicidades! Fuiste contratado y tu colocación quedó registrada ante la UTH.'
          : estado === 'Rechazada'
          ? 'La empresa ha cubierto la vacante o finalizado el proceso de selección.'
          : 'Resolución definitiva del proceso de contratación por parte de la empresa.',
    },
  ];

  return (
    <div className="rounded-card bg-parchment p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-caption font-semibold text-ink-64 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="size-3.5 text-primary" />
          Trazabilidad Institucional (Modelo Opción B)
        </span>

        {estado === 'revision_uth' && (
          <StatusPill tone="warning">
            Paso 2: En revisión por Vinculación UTH
          </StatusPill>
        )}
        {estado === 'enviada_empresa' && (
          <StatusPill tone="brand">
            Paso 3: Visible para el reclutador
          </StatusPill>
        )}
        {estado === 'Aceptada' && (
          <StatusPill tone="success">
            Proceso Exitoso · Contratado
          </StatusPill>
        )}
        {estado === 'rechazada_uth' && (
          <StatusPill tone="danger">
            No turnado a empresa
          </StatusPill>
        )}
      </div>

      {/* Stepper horizontal en desktop, responsive en mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {steps.map((st) => {
          const status = getStepStatus(st.num);

          let circleClass = 'bg-divider text-ink-64';
          let cardClass = 'bg-canvas ring-1 ring-inset ring-hairline';

          if (status === 'completed') {
            circleClass = 'bg-primary text-white';
            cardClass = 'bg-canvas ring-1 ring-inset ring-brand/40';
          } else if (status === 'current') {
            circleClass = 'bg-wine text-white ring-4 ring-wine/20';
            cardClass = 'bg-canvas ring-2 ring-inset ring-wine/50';
          } else if (status === 'rejected') {
            circleClass = 'bg-danger text-white';
            cardClass = 'bg-danger-tint ring-1 ring-inset ring-danger/30';
          }

          return (
            <div
              key={st.num}
              className={`p-4 rounded-field ${cardClass} transition-all space-y-2 flex flex-col justify-between`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`size-6 rounded-full flex items-center justify-center text-fine font-semibold shrink-0 ${circleClass}`}
                >
                  {status === 'completed' ? (
                    <CheckCircle2 className="size-3.5" />
                  ) : status === 'rejected' ? (
                    <XCircle className="size-3.5" />
                  ) : (
                    st.num
                  )}
                </div>
                <div className="leading-tight min-w-0">
                  <h4 className="text-caption font-semibold text-ink truncate">
                    {st.title}
                  </h4>
                  <span className="text-fine text-ink-64 block">
                    {st.subtitle}
                  </span>
                </div>
              </div>

              <p className="text-fine text-ink-64 leading-snug pt-1">
                {st.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Dictamen Institucional UTH */}
      {notas_uth && (
        <Alert tone="warning" title="Dictamen Institucional de Vinculación UTH">
          <p className="mt-0.5">{notas_uth}</p>
        </Alert>
      )}
    </div>
  );
}
