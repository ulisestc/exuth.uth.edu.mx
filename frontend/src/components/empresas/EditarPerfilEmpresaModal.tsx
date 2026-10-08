'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Building2, 
  User, 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  UploadCloud, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { EmpresaProfile, updateMiPerfilEmpresa } from '@/lib/api';

interface EditarPerfilEmpresaModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresa: EmpresaProfile | null;
  token: string;
  onProfileUpdated: (updated: EmpresaProfile) => void;
}

export default function EditarPerfilEmpresaModal({
  isOpen,
  onClose,
  empresa,
  token,
  onProfileUpdated,
}: EditarPerfilEmpresaModalProps) {
  const [nombreContacto, setNombreContacto] = useState('');
  const [cargoContacto, setCargoContacto] = useState('');
  const [correoContacto, setCorreoContacto] = useState('');
  const [telefonoOficina, setTelefonoOficina] = useState('');
  const [telefonoCelular, setTelefonoCelular] = useState('');
  const [domicilio, setDomicilio] = useState('');
  const [actividad, setActividad] = useState('');

  // Estados de Logotipo
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (empresa) {
      setNombreContacto(empresa.nombre_contacto || '');
      setCargoContacto(empresa.cargo_contacto || '');
      setCorreoContacto(empresa.correo_contacto || '');
      setTelefonoOficina(empresa.telefono_oficina || '');
      setTelefonoCelular(empresa.telefono_celular || '');
      setDomicilio(empresa.domicilio || '');
      setActividad(empresa.actividad_de_la_empresa || '');
      setLogoPreview(empresa.logo || null);
      setLogoFile(null);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [empresa, isOpen]);

  if (!isOpen || !empresa) return null;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Por favor selecciona un archivo de imagen válido (.png, .jpg, .jpeg, .webp).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('El tamaño del logotipo no debe superar los 5 MB.');
        return;
      }

      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!nombreContacto.trim()) {
      setErrorMessage('El nombre del reclutador o contacto es obligatorio.');
      return;
    }

    if (!correoContacto.trim()) {
      setErrorMessage('El correo electrónico de contacto institucional es obligatorio.');
      return;
    }

    if (!domicilio.trim()) {
      setErrorMessage('El domicilio corporativo es obligatorio.');
      return;
    }

    const formData = new FormData();
    formData.append('nombre_contacto', nombreContacto.trim());
    formData.append('cargo_contacto', cargoContacto.trim());
    formData.append('correo_contacto', correoContacto.trim());
    if (telefonoOficina.trim()) formData.append('telefono_oficina', telefonoOficina.trim());
    if (telefonoCelular.trim()) formData.append('telefono_celular', telefonoCelular.trim());
    formData.append('domicilio', domicilio.trim());
    formData.append('actividad_de_la_empresa', actividad.trim());

    if (logoFile) {
      formData.append('logo', logoFile);
    }

    setIsSubmitting(true);
    const res = await updateMiPerfilEmpresa(token, formData);
    setIsSubmitting(false);

    if (res.success && res.profile) {
      setSuccessMessage('El perfil y logotipo de la empresa se han actualizado correctamente.');
      onProfileUpdated(res.profile);
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setErrorMessage(res.error || 'Ocurrió un error al guardar los cambios.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabecera del Modal */}
        <div className="p-6 bg-[#2D2926] text-white flex items-center justify-between relative border-b border-zinc-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#691C32]/30 text-rose-300 border border-[#691C32]/40">
              <Building2 className="w-3.5 h-3.5" />
              Perfil Empresarial UTH
            </div>
            <h2 className="text-lg font-black tracking-tight text-white">
              Editar Datos Corporativos y Logotipo
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

        {/* Ficha institucional de solo lectura */}
        <div className="px-6 py-3.5 bg-[#F8FAFC] border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#636569] block">Razón Social</span>
            <span className="font-bold text-[#2D2926]">{empresa.nombre}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#636569] block">Giro y Sector</span>
            <span className="font-semibold text-[#00A887]">{empresa.giro} · {empresa.sector}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#636569] block">Convenio UTH</span>
            <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-[#00A887]" />
              {empresa.status.toUpperCase()}
            </span>
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

          {/* Sección Logotipo Corporativo */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-3">
            <label className="text-xs font-bold text-[#2D2926] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#00A887]" />
              Logotipo Oficial de la Organización
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Vista Previa */}
              <div className="w-24 h-24 rounded-xl border border-zinc-200 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Logo Empresa" 
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="text-center p-2 text-zinc-400">
                    <Building2 className="w-8 h-8 mx-auto mb-1 text-zinc-300" />
                    <span className="text-[9px] block">Sin logo</span>
                  </div>
                )}
              </div>

              {/* Botón de carga */}
              <div className="space-y-1.5 flex-1 text-center sm:text-left">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold text-[#2D2926] bg-white hover:bg-zinc-100 border border-zinc-300 transition-all cursor-pointer shadow-xs"
                >
                  <UploadCloud className="w-4 h-4 text-[#00A887]" />
                  {logoFile ? 'Cambiar archivo seleccionado' : 'Subir Logotipo Corporativo'}
                </button>
                <p className="text-[10px] text-[#636569]">
                  Formatos recomendados: PNG o JPG con fondo transparente o blanco. Máx 5 MB. Se mostrará en tus vacantes públicas.
                </p>
                {logoFile && (
                  <span className="text-[11px] font-semibold text-[#00A887] block">
                    ✓ Archivo listo: {logoFile.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contacto Responsable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D2926] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#00A887]" />
                Nombre del Contacto / Reclutador *
              </label>
              <input
                type="text"
                required
                value={nombreContacto}
                onChange={(e) => setNombreContacto(e.target.value)}
                placeholder="Ej. Lic. Brenda Morales Sánchez"
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-xs text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D2926] flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#00A887]" />
                Cargo o Puesto del Contacto *
              </label>
              <input
                type="text"
                required
                value={cargoContacto}
                onChange={(e) => setCargoContacto(e.target.value)}
                placeholder="Ej. Jefa de Atracción de Talento"
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-xs text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
              />
            </div>
          </div>

          {/* Correo y Teléfonos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D2926] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#00A887]" />
                Correo de Contacto *
              </label>
              <input
                type="email"
                required
                value={correoContacto}
                onChange={(e) => setCorreoContacto(e.target.value)}
                placeholder="rrhh@empresa.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-xs text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D2926] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#00A887]" />
                Teléfono de Oficina
              </label>
              <input
                type="tel"
                value={telefonoOficina}
                onChange={(e) => setTelefonoOficina(e.target.value)}
                placeholder="2222000000"
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-xs text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D2926] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#691C32]" />
                Teléfono Celular
              </label>
              <input
                type="tel"
                value={telefonoCelular}
                onChange={(e) => setTelefonoCelular(e.target.value)}
                placeholder="2221234567"
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-xs text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
              />
            </div>
          </div>

          {/* Domicilio */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2D2926] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#00A887]" />
              Domicilio Corporativo / Ubicación *
            </label>
            <input
              type="text"
              required
              value={domicilio}
              onChange={(e) => setDomicilio(e.target.value)}
              placeholder="Parque Industrial FINSA, Nave 12, Cuautlancingo, Puebla"
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-xs text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
            />
          </div>

          {/* Actividad Empresarial */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2D2926] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#00A887]" />
              Actividad Principal de la Organización
            </label>
            <textarea
              rows={2}
              value={actividad}
              onChange={(e) => setActividad(e.target.value)}
              placeholder="Ej. Fabricación y ensamble de autopartes para la industria automotriz y robótica..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-xs text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none resize-none"
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
