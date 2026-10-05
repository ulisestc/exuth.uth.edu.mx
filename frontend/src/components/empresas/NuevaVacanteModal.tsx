'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Briefcase, 
  Building2, 
  MapPin, 
  DollarSign, 
  GraduationCap, 
  Clock, 
  Users, 
  Languages, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck,
  Send,
  Plus,
  Trash2
} from 'lucide-react';
import { 
  AreaEstudio, 
  IdiomaCatalogo, 
  VacanteEmpresaItem, 
  NuevaVacanteData, 
  RequisitoIdiomaInput,
  fetchAreasEstudio, 
  fetchIdiomas, 
  crearVacante 
} from '@/lib/api';

interface NuevaVacanteModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  defaultContactoNombre?: string;
  onVacanteCreada: (nuevaVacante: VacanteEmpresaItem) => void;
}

export function NuevaVacanteModal({
  isOpen,
  onClose,
  token,
  defaultContactoNombre = '',
  onVacanteCreada,
}: NuevaVacanteModalProps) {
  const [pasoActivo, setPasoActivo] = useState<1 | 2 | 3 | 4>(1);

  // Catálogos
  const [areasEstudio, setAreasEstudio] = useState<AreaEstudio[]>([]);
  const [idiomasDisponibles, setIdiomasDisponibles] = useState<IdiomaCatalogo[]>([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);

  // Estados de envío y validación
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    // 1. General
    titulo: '',
    area_estudio: '',
    tipo_contratacion: 'tiempo_completo' as const,
    modalidad: 'presencial' as const,
    num_candidatos: 1,
    horario_trabajo: 'Lunes a Viernes 8:00 a 17:00 hrs',

    // 2. Perfil y Competencias
    nivel_estudios: 'ING_LIC' as const,
    edad: 'Indistinto',
    genero: 'indistinto' as const,
    estado_civil: 'indistinto' as const,
    experiencia: '',
    conocimientos: '',
    habilidades: '',
    actitudes: 'Compromiso, puntualidad y trabajo colaborativo',
    responsabilidades: '',

    // 3. Compensación
    sueldo_minimo: '',
    sueldo_maximo: '',
    salario_a_tratar: false,
    prestaciones: 'Prestaciones de ley (IMSS, aguinaldo, vacaciones)',
    incluye_transporte: false,
    incluye_comedor: false,
    documentos_requeridos: 'Currículum Vitae en PDF, título o constancia de estudios, RFC y CURP',

    // 4. Idiomas y Contacto
    tiene_idioma: false,
    idioma_id: '',
    idioma_nivel: 'B1' as const,
    idioma_obligatorio: false,
    persona_contacto: defaultContactoNombre,
    entrevistador: '',
    observaciones: '',
  });

  // Cargar catálogos al abrir
  useEffect(() => {
    if (isOpen) {
      async function loadCatalogs() {
        try {
          const [areas, idiomas] = await Promise.all([
            fetchAreasEstudio(),
            fetchIdiomas()
          ]);
          setAreasEstudio(areas);
          setIdiomasDisponibles(idiomas);
          if (areas.length > 0 && !formData.area_estudio) {
            setFormData(prev => ({ ...prev, area_estudio: String(areas[0].id) }));
          }
          if (idiomas.length > 0 && !formData.idioma_id) {
            setFormData(prev => ({ ...prev, idioma_id: String(idiomas[0].id) }));
          }
        } catch (err) {
          console.error('Error loading catalogs:', err);
        } finally {
          setLoadingCatalogos(false);
        }
      }
      loadCatalogs();
    }
  }, [isOpen]);

  // Actualizar contacto si cambia la prop
  useEffect(() => {
    if (defaultContactoNombre && !formData.persona_contacto) {
      setFormData(prev => ({ ...prev, persona_contacto: defaultContactoNombre }));
    }
  }, [defaultContactoNombre]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validaciones básicas
    if (!formData.titulo.trim()) {
      setErrorMsg('Debes ingresar el nombre del puesto.');
      setPasoActivo(1);
      return;
    }
    if (!formData.area_estudio) {
      setErrorMsg('Debes seleccionar un área de estudio.');
      setPasoActivo(1);
      return;
    }
    if (!formData.responsabilidades.trim()) {
      setErrorMsg('Debes especificar las actividades o responsabilidades del puesto.');
      setPasoActivo(2);
      return;
    }
    if (!formData.experiencia.trim()) {
      setErrorMsg('Debes especificar la experiencia requerida.');
      setPasoActivo(2);
      return;
    }
    if (!formData.conocimientos.trim()) {
      setErrorMsg('Debes especificar los conocimientos técnicos requeridos.');
      setPasoActivo(2);
      return;
    }
    if (!formData.habilidades.trim()) {
      setErrorMsg('Debes especificar las habilidades del puesto.');
      setPasoActivo(2);
      return;
    }
    if (!formData.persona_contacto.trim()) {
      setErrorMsg('Debes indicar la persona de contacto de la organización.');
      setPasoActivo(4);
      return;
    }

    if (formData.sueldo_minimo && formData.sueldo_maximo) {
      const min = parseFloat(formData.sueldo_minimo);
      const max = parseFloat(formData.sueldo_maximo);
      if (min > max) {
        setErrorMsg('El sueldo mínimo no puede ser mayor al sueldo máximo.');
        setPasoActivo(3);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const idiomasPayload: RequisitoIdiomaInput[] = [];
      if (formData.tiene_idioma && formData.idioma_id) {
        idiomasPayload.push({
          idioma: parseInt(formData.idioma_id, 10),
          nivel: formData.idioma_nivel,
          obligatorio: formData.idioma_obligatorio
        });
      }

      const payload: NuevaVacanteData = {
        titulo: formData.titulo.trim(),
        area_estudio: parseInt(formData.area_estudio, 10),
        tipo_contratacion: formData.tipo_contratacion,
        modalidad: formData.modalidad,
        num_candidatos: Math.max(1, parseInt(String(formData.num_candidatos), 10) || 1),
        horario_trabajo: formData.horario_trabajo.trim(),
        nivel_estudios: formData.nivel_estudios,
        edad: formData.edad.trim() || 'Indistinto',
        genero: formData.genero,
        estado_civil: formData.estado_civil,
        experiencia: formData.experiencia.trim(),
        conocimientos: formData.conocimientos.trim(),
        habilidades: formData.habilidades.trim(),
        actitudes: formData.actitudes.trim(),
        responsabilidades: formData.responsabilidades.trim(),
        sueldo_minimo: formData.sueldo_minimo ? parseFloat(formData.sueldo_minimo) : null,
        sueldo_maximo: formData.sueldo_maximo ? parseFloat(formData.sueldo_maximo) : null,
        salario_a_tratar: formData.salario_a_tratar,
        prestaciones: formData.prestaciones.trim(),
        incluye_transporte: formData.incluye_transporte,
        incluye_comedor: formData.incluye_comedor,
        documentos_requeridos: formData.documentos_requeridos.trim(),
        persona_contacto: formData.persona_contacto.trim(),
        entrevistador: formData.entrevistador.trim() || undefined,
        observaciones: formData.observaciones.trim() || undefined,
        idiomas: idiomasPayload
      };

      const result = await crearVacante(token, payload);
      if (result.success && result.vacante) {
        onVacanteCreada(result.vacante);
        onClose();
      } else {
        setErrorMsg(result.error || 'No se pudo registrar la vacante.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Pleca Institucional Bicolor */}
        <div className="w-full h-1.5 flex">
          <div className="h-full w-2/3 bg-[#691C32]" />
          <div className="h-full w-1/3 bg-[#C2BA98]" />
        </div>

        {/* Encabezado */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#00A887]">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#2D2926]">Publicar Oferta de Empleo</h2>
              <p className="text-xs text-[#636569]">
                Registra los requerimientos del puesto para su validación por Vinculación UTH.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegación por Pasos */}
        <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-3 flex items-center justify-between overflow-x-auto gap-2">
          {[
            { num: 1, label: '1. Puesto y Horario' },
            { num: 2, label: '2. Perfil y Actividades' },
            { num: 3, label: '3. Sueldo y Beneficios' },
            { num: 4, label: '4. Idioma y Contacto' },
          ].map(p => (
            <button
              key={p.num}
              type="button"
              onClick={() => setPasoActivo(p.num as any)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                pasoActivo === p.num
                  ? 'bg-[#00A887] text-white shadow-xs'
                  : 'text-zinc-600 hover:text-[#2D2926] hover:bg-zinc-200/60'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Mensaje de Error */}
        {errorMsg && (
          <div className="m-6 mb-0 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* PASO 1: Puesto y Condiciones */}
          {pasoActivo === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                  Nombre del Puesto / Título de la Vacante *
                </label>
                <input
                  type="text"
                  name="titulo"
                  required
                  placeholder="Ej. Desarrollador Web Full Stack / Ingeniero de Procesos"
                  value={formData.titulo}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                    Área de Estudio UTH *
                  </label>
                  <select
                    name="area_estudio"
                    required
                    value={formData.area_estudio}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm text-[#2D2926] bg-white focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none cursor-pointer"
                  >
                    {areasEstudio.map(a => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                    Modalidad de Trabajo *
                  </label>
                  <select
                    name="modalidad"
                    value={formData.modalidad}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm text-[#2D2926] bg-white focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none cursor-pointer"
                  >
                    <option value="presencial">Presencial</option>
                    <option value="hibrido">Híbrido</option>
                    <option value="home_office">Remoto / Home Office</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                    Tipo de Contratación *
                  </label>
                  <select
                    name="tipo_contratacion"
                    value={formData.tipo_contratacion}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm text-[#2D2926] bg-white focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none cursor-pointer"
                  >
                    <option value="tiempo_completo">Tiempo Completo</option>
                    <option value="indeterminado">Contrato Indeterminado</option>
                    <option value="temporal">Temporal / Por Proyecto</option>
                    <option value="medio_tiempo">Medio Tiempo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                    Número de Vacantes / Candidatos a Considerar
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="num_candidatos"
                    value={formData.num_candidatos}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                  Horario y Días de Trabajo *
                </label>
                <input
                  type="text"
                  name="horario_trabajo"
                  required
                  placeholder="Ej. Lunes a Viernes de 8:30 a 17:30 hrs"
                  value={formData.horario_trabajo}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPasoActivo(2)}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all cursor-pointer"
                >
                  Siguiente: Perfil y Actividades ➔
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: Perfil y Requisitos */}
          {pasoActivo === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                    Nivel de Estudios *
                  </label>
                  <select
                    name="nivel_estudios"
                    value={formData.nivel_estudios}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm text-[#2D2926] bg-white focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none cursor-pointer"
                  >
                    <option value="TSU">Técnico Superior Universitario (TSU)</option>
                    <option value="ING_LIC">Ingeniería / Licenciatura</option>
                    <option value="MTRIA">Maestría</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                    Rango de Edad
                  </label>
                  <input
                    type="text"
                    name="edad"
                    placeholder="Ej. Indistinto o 22 a 35 años"
                    value={formData.edad}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                    Género
                  </label>
                  <select
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm text-[#2D2926] bg-white focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none cursor-pointer"
                  >
                    <option value="indistinto">Indistinto</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                  Responsabilidades y Actividades del Puesto *
                </label>
                <textarea
                  name="responsabilidades"
                  required
                  rows={2}
                  placeholder="Detalla las funciones principales que realizará el candidato..."
                  value={formData.responsabilidades}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 text-xs text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                    Experiencia Previa *
                  </label>
                  <textarea
                    name="experiencia"
                    required
                    rows={2}
                    placeholder="Ej. Prácticas profesionales o de 6 meses a 1 año..."
                    value={formData.experiencia}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 text-xs text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                    Conocimientos Técnicos *
                  </label>
                  <textarea
                    name="conocimientos"
                    required
                    rows={2}
                    placeholder="Lenguajes, softwares, maquinaria o herramientas técnicas..."
                    value={formData.conocimientos}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 text-xs text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                  Habilidades Blandas / Actitudes *
                </label>
                <input
                  type="text"
                  name="habilidades"
                  required
                  placeholder="Ej. Liderazgo, resolución de problemas, comunicación asertiva"
                  value={formData.habilidades}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setPasoActivo(1)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  ⬅ Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setPasoActivo(3)}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all cursor-pointer"
                >
                  Siguiente: Sueldo y Beneficios ➔
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: Sueldo y Prestaciones */}
          {pasoActivo === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="salario_a_tratar"
                    name="salario_a_tratar"
                    checked={formData.salario_a_tratar}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-[#00A887] focus:ring-[#00A887] border-zinc-300"
                  />
                  <label htmlFor="salario_a_tratar" className="text-xs font-bold text-[#2D2926] cursor-pointer">
                    Salario a tratar / a convenir en entrevista
                  </label>
                </div>

                {!formData.salario_a_tratar && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Sueldo Mínimo Mensual (MXN)
                      </label>
                      <input
                        type="number"
                        step="100"
                        name="sueldo_minimo"
                        placeholder="Ej. 10000"
                        value={formData.sueldo_minimo}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                        Sueldo Máximo Mensual (MXN)
                      </label>
                      <input
                        type="number"
                        step="100"
                        name="sueldo_maximo"
                        placeholder="Ej. 15000"
                        value={formData.sueldo_maximo}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                  Prestaciones y Beneficios *
                </label>
                <textarea
                  name="prestaciones"
                  required
                  rows={2}
                  placeholder="Prestaciones de ley, bonos, fondo de ahorro, seguro, etc."
                  value={formData.prestaciones}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 text-xs text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2.5 p-3 rounded-lg border border-zinc-200 bg-zinc-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="incluye_transporte"
                    checked={formData.incluye_transporte}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-[#00A887] focus:ring-[#00A887] border-zinc-300"
                  />
                  <span className="text-xs font-medium text-[#2D2926]">¿Ofrece servicio de transporte?</span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-lg border border-zinc-200 bg-zinc-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="incluye_comedor"
                    checked={formData.incluye_comedor}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-[#00A887] focus:ring-[#00A887] border-zinc-300"
                  />
                  <span className="text-xs font-medium text-[#2D2926]">¿Ofrece comedor o vales?</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                  Documentos Requeridos al Postulante *
                </label>
                <input
                  type="text"
                  name="documentos_requeridos"
                  required
                  value={formData.documentos_requeridos}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setPasoActivo(2)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  ⬅ Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setPasoActivo(4)}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all cursor-pointer"
                >
                  Siguiente: Idioma y Contacto ➔
                </button>
              </div>
            </div>
          )}

          {/* PASO 4: Idioma y Contacto */}
          {pasoActivo === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="tiene_idioma"
                    name="tiene_idioma"
                    checked={formData.tiene_idioma}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-[#00A887] focus:ring-[#00A887] border-zinc-300"
                  />
                  <label htmlFor="tiene_idioma" className="text-xs font-bold text-[#2D2926] cursor-pointer">
                    ¿Requiere dominio de un idioma extranjero?
                  </label>
                </div>

                {formData.tiene_idioma && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">
                        Idioma
                      </label>
                      <select
                        name="idioma_id"
                        value={formData.idioma_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs bg-white focus:border-[#00A887] outline-none"
                      >
                        {idiomasDisponibles.map(i => (
                          <option key={i.id} value={i.id}>{i.nombre}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">
                        Nivel MCER
                      </label>
                      <select
                        name="idioma_nivel"
                        value={formData.idioma_nivel}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs bg-white focus:border-[#00A887] outline-none"
                      >
                        <option value="A1">A1 - Principiante</option>
                        <option value="A2">A2 - Básico</option>
                        <option value="B1">B1 - Pre-intermedio</option>
                        <option value="B2">B2 - Intermedio</option>
                        <option value="C1">C1 - Avanzado</option>
                        <option value="C2">C2 - Bilingüe / Nativo</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2D2926]">
                        <input
                          type="checkbox"
                          name="idioma_obligatorio"
                          checked={formData.idioma_obligatorio}
                          onChange={handleChange}
                          className="w-4 h-4 rounded text-[#00A887]"
                        />
                        Obligatorio
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                    Persona de Contacto UTH / Organización *
                  </label>
                  <input
                    type="text"
                    name="persona_contacto"
                    required
                    placeholder="Nombre del responsable de vinculación"
                    value={formData.persona_contacto}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                    Entrevistador(a) / Reclutador(a)
                  </label>
                  <input
                    type="text"
                    name="entrevistador"
                    placeholder="Quien conducirá la entrevista (opcional)"
                    value={formData.entrevistador}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase mb-1">
                  Observaciones Adicionales
                </label>
                <textarea
                  name="observaciones"
                  rows={2}
                  placeholder="Información sobre etapas del proceso, requisitos de traslado, etc."
                  value={formData.observaciones}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 text-xs text-[#2D2926] focus:border-[#00A887] focus:ring-2 focus:ring-[#00A887]/20 outline-none"
                />
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-[#00A887] shrink-0 mt-0.5" />
                <p>
                  Al guardar, tu oferta de empleo entrará al filtro de validación institucional UTH y se le asignará una <strong>Clave de Vacante</strong> única.
                </p>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setPasoActivo(3)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  ⬅ Anterior
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registrando Vacante...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Publicar Vacante Institucional
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
