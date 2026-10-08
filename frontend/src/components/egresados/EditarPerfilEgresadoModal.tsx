'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserCog, 
  Phone, 
  Home, 
  Wrench, 
  HeartHandshake, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { EgresadoProfile, updateMiPerfilEgresado } from '@/lib/api';

interface EditarPerfilEgresadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: EgresadoProfile | null;
  token: string;
  onProfileUpdated: (updated: EgresadoProfile) => void;
}

export default function EditarPerfilEgresadoModal({
  isOpen,
  onClose,
  profile,
  token,
  onProfileUpdated,
}: EditarPerfilEgresadoModalProps) {
  const [telefonoCelular, setTelefonoCelular] = useState('');
  const [telefonoCasa, setTelefonoCasa] = useState('');
  const [domicilio, setDomicilio] = useState('');
  const [habilidades, setHabilidades] = useState('');
  const [capacidadesEspeciales, setCapacidadesEspeciales] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Inicializar campos con el perfil actual
  useEffect(() => {
    if (profile) {
      setTelefonoCelular(profile.telefono_celular || '');
      setTelefonoCasa(profile.telefono_casa || '');
      setDomicilio(profile.domicilio || '');
      setHabilidades(profile.habilidades || '');
      setCapacidadesEspeciales(profile.capacidades_especiales || '');
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [profile, isOpen]);

  if (!isOpen || !profile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validaciones básicas
    const telLimpio = telefonoCelular.trim().replace(/\D/g, '');
    if (telLimpio.length < 10) {
      setErrorMessage('El teléfono celular debe contener al menos 10 dígitos numéricos.');
      return;
    }

    if (!domicilio.trim()) {
      setErrorMessage('El domicilio completo es obligatorio.');
      return;
    }

    if (!habilidades.trim()) {
      setErrorMessage('Por favor especifica al menos un conjunto de habilidades técnicas o blandas.');
      return;
    }

    setIsSubmitting(true);
    const res = await updateMiPerfilEgresado(token, {
      telefono_celular: telefonoCelular.trim(),
      telefono_casa: telefonoCasa.trim() || undefined,
      domicilio: domicilio.trim(),
      habilidades: habilidades.trim(),
      capacidades_especiales: capacidadesEspeciales.trim() || undefined,
    });
    setIsSubmitting(false);

    if (res.success && res.profile) {
      setSuccessMessage('Tu información de perfil ha sido actualizada exitosamente.');
      onProfileUpdated(res.profile);
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setErrorMessage(res.error || 'Ocurrió un error al actualizar los datos.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabecera del Modal */}
        <div className="p-6 bg-[#2D2926] text-white flex items-center justify-between relative border-b border-zinc-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#00A887]/20 text-[#00A887] border border-[#00A887]/30">
              <UserCog className="w-3.5 h-3.5" />
              Actualización de Perfil Egresado
            </div>
            <h2 className="text-lg font-black tracking-tight text-white">
              Editar Datos de Contacto y Habilidades
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ficha informativa institucional de solo lectura */}
        <div className="px-6 py-3.5 bg-[#F8FAFC] border-b border-zinc-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#636569] block">Matrícula</span>
            <span className="font-mono font-bold text-[#2D2926]">{profile.matricula}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#636569] block">CURP</span>
            <span className="font-mono text-[#2D2926]">{profile.curp}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-[10px] uppercase font-bold text-[#636569] block">Programa UTH</span>
            <span className="font-semibold text-[#00A887] truncate block">{profile.carrera}</span>
          </div>
        </div>

        {/* Formulario editable */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00A887] shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Teléfonos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D2926] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#00A887]" />
                Teléfono Celular *
              </label>
              <input
                type="tel"
                required
                value={telefonoCelular}
                onChange={(e) => setTelefonoCelular(e.target.value)}
                placeholder="Ej. 2221234567"
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-xs text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
              />
              <span className="text-[10px] text-[#636569]">Usado por los reclutadores para contactarte.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D2926] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#636569]" />
                Teléfono Fijo / Casa (Opcional)
              </label>
              <input
                type="tel"
                value={telefonoCasa}
                onChange={(e) => setTelefonoCasa(e.target.value)}
                placeholder="Ej. 2271000000"
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-xs text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
              />
            </div>
          </div>

          {/* Domicilio */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2D2926] flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-[#00A887]" />
              Domicilio Completo *
            </label>
            <input
              type="text"
              required
              value={domicilio}
              onChange={(e) => setDomicilio(e.target.value)}
              placeholder="Calle, número, colonia, municipio y código postal"
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-xs text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
            />
          </div>

          {/* Habilidades */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2D2926] flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-[#00A887]" />
              Habilidades Técnicas y Competencias *
            </label>
            <textarea
              rows={3}
              required
              value={habilidades}
              onChange={(e) => setHabilidades(e.target.value)}
              placeholder="Ej. Programación en Python, PLC Siemens, SolidWorks, Mantenimiento preventivo, Trabajo en equipo..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-xs text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none resize-none"
            />
            <span className="text-[10px] text-[#636569]">Destaca tus competencias clave para que las empresas identifiquen tu compatibilidad.</span>
          </div>

          {/* Capacidades Especiales */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2D2926] flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-[#691C32]" />
              Inclusión / Necesidades de Accesibilidad (Opcional)
            </label>
            <input
              type="text"
              value={capacidadesEspeciales}
              onChange={(e) => setCapacidadesEspeciales(e.target.value)}
              placeholder="Ej. Discapacidad motriz leve, adaptación ergonómica requerida, ninguna..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-xs text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-4 border-t border-zinc-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all shadow-sm cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando Cambios...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Guardar Información</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
