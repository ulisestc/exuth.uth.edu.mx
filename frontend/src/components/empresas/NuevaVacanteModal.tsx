'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Send,
} from 'lucide-react';
import {
  AreaEstudio,
  IdiomaCatalogo,
  VacanteEmpresaItem,
  NuevaVacanteData,
  RequisitoIdiomaInput,
  fetchAreasEstudio,
  fetchIdiomas,
  crearVacante,
} from '@/lib/api';
import {
  Modal,
  Button,
  Alert,
  Field,
  Input,
  Select,
  Textarea,
  Checkbox,
} from '@/components/ui';

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
  const [, setLoadingCatalogos] = useState(true);

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
            fetchIdiomas(),
          ]);
          setAreasEstudio(areas);
          setIdiomasDisponibles(idiomas);
          if (areas.length > 0 && !formData.area_estudio) {
            setFormData((prev) => ({ ...prev, area_estudio: String(areas[0].id) }));
          }
          if (idiomas.length > 0 && !formData.idioma_id) {
            setFormData((prev) => ({ ...prev, idioma_id: String(idiomas[0].id) }));
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
      setFormData((prev) => ({ ...prev, persona_contacto: defaultContactoNombre }));
    }
  }, [defaultContactoNombre]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
          obligatorio: formData.idioma_obligatorio,
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
        idiomas: idiomasPayload,
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
    <Modal
      open={isOpen}
      onClose={onClose}
      size="lg"
      eyebrow="Bolsa de Trabajo UTH"
      title="Publicar Oferta de Empleo"
      description="Registra los requerimientos del puesto para su validación por Vinculación UTH."
      footer={
        <div className="w-full flex items-center justify-between gap-3">
          <div>
            {pasoActivo > 1 && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setPasoActivo((pasoActivo - 1) as 1 | 2 | 3 | 4)}
                disabled={isSubmitting}
              >
                Anterior
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            {pasoActivo < 4 ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setPasoActivo((pasoActivo + 1) as 1 | 2 | 3 | 4)}
              >
                Siguiente Paso
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                loading={isSubmitting}
                onClick={() => handleSubmit()}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Publicar Vacante Institucional
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Navegación por Pasos */}
        <div className="p-1.5 rounded-xl bg-parchment border border-hairline grid grid-cols-2 sm:grid-cols-4 gap-1">
          {[
            { num: 1, label: '1. Puesto y Horario' },
            { num: 2, label: '2. Perfil y Actividades' },
            { num: 3, label: '3. Sueldo y Beneficios' },
            { num: 4, label: '4. Idioma y Contacto' },
          ].map((p) => {
            const active = pasoActivo === p.num;
            return (
              <button
                key={p.num}
                type="button"
                onClick={() => setPasoActivo(p.num as 1 | 2 | 3 | 4)}
                className={`text-caption font-semibold px-3 py-2 rounded-lg transition-all cursor-pointer text-center truncate ${
                  active
                    ? 'bg-canvas text-ink border border-hairline'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Mensaje de Error */}
        {errorMsg && (
          <Alert tone="danger" onDismiss={() => setErrorMsg(null)}>
            {errorMsg}
          </Alert>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PASO 1: Puesto y Condiciones */}
          {pasoActivo === 1 && (
            <div className="space-y-4">
              <Field label="Nombre del Puesto / Título de la Vacante" required>
                <Input
                  type="text"
                  name="titulo"
                  required
                  placeholder="Ej. Desarrollador Web Full Stack / Ingeniero de Procesos"
                  value={formData.titulo}
                  onChange={handleChange}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Área de Estudio UTH" required>
                  <Select
                    name="area_estudio"
                    required
                    value={formData.area_estudio}
                    onChange={handleChange}
                  >
                    {areasEstudio.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Modalidad de Trabajo" required>
                  <Select
                    name="modalidad"
                    value={formData.modalidad}
                    onChange={handleChange}
                  >
                    <option value="presencial">Presencial</option>
                    <option value="hibrido">Híbrido</option>
                    <option value="home_office">Remoto / Home Office</option>
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Tipo de Contratación" required>
                  <Select
                    name="tipo_contratacion"
                    value={formData.tipo_contratacion}
                    onChange={handleChange}
                  >
                    <option value="tiempo_completo">Tiempo Completo</option>
                    <option value="indeterminado">Contrato Indeterminado</option>
                    <option value="temporal">Temporal / Por Proyecto</option>
                    <option value="medio_tiempo">Medio Tiempo</option>
                  </Select>
                </Field>

                <Field label="Número de Vacantes / Candidatos">
                  <Input
                    type="number"
                    min="1"
                    name="num_candidatos"
                    value={formData.num_candidatos}
                    onChange={handleChange}
                  />
                </Field>
              </div>

              <Field label="Horario y Días de Trabajo" required>
                <Input
                  type="text"
                  name="horario_trabajo"
                  required
                  placeholder="Ej. Lunes a Viernes de 8:30 a 17:30 hrs"
                  value={formData.horario_trabajo}
                  onChange={handleChange}
                />
              </Field>
            </div>
          )}

          {/* PASO 2: Perfil y Requisitos */}
          {pasoActivo === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Nivel de Estudios" required>
                  <Select
                    name="nivel_estudios"
                    value={formData.nivel_estudios}
                    onChange={handleChange}
                  >
                    <option value="TSU">Técnico Superior Universitario (TSU)</option>
                    <option value="ING_LIC">Ingeniería / Licenciatura</option>
                    <option value="MTRIA">Maestría</option>
                  </Select>
                </Field>

                <Field label="Rango de Edad">
                  <Input
                    type="text"
                    name="edad"
                    placeholder="Ej. Indistinto o 22 a 35 años"
                    value={formData.edad}
                    onChange={handleChange}
                  />
                </Field>

                <Field label="Género">
                  <Select
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                  >
                    <option value="indistinto">Indistinto</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                  </Select>
                </Field>
              </div>

              <Field label="Responsabilidades y Actividades del Puesto" required>
                <Textarea
                  name="responsabilidades"
                  required
                  rows={2}
                  placeholder="Detalla las funciones principales que realizará el candidato..."
                  value={formData.responsabilidades}
                  onChange={handleChange}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Experiencia Previa" required>
                  <Textarea
                    name="experiencia"
                    required
                    rows={2}
                    placeholder="Ej. Prácticas profesionales o de 6 meses a 1 año..."
                    value={formData.experiencia}
                    onChange={handleChange}
                  />
                </Field>

                <Field label="Conocimientos Técnicos" required>
                  <Textarea
                    name="conocimientos"
                    required
                    rows={2}
                    placeholder="Lenguajes, softwares, maquinaria o herramientas técnicas..."
                    value={formData.conocimientos}
                    onChange={handleChange}
                  />
                </Field>
              </div>

              <Field label="Habilidades Blandas / Actitudes" required>
                <Input
                  type="text"
                  name="habilidades"
                  required
                  placeholder="Ej. Liderazgo, resolución de problemas, comunicación asertiva"
                  value={formData.habilidades}
                  onChange={handleChange}
                />
              </Field>
            </div>
          )}

          {/* PASO 3: Sueldo y Prestaciones */}
          {pasoActivo === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-parchment border border-hairline space-y-4">
                <Checkbox
                  id="salario_a_tratar"
                  name="salario_a_tratar"
                  checked={formData.salario_a_tratar}
                  onChange={handleChange}
                  label="Salario a tratar / a convenir en entrevista"
                />

                {!formData.salario_a_tratar && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <Field label="Sueldo Mínimo Mensual (MXN)">
                      <Input
                        type="number"
                        step="100"
                        name="sueldo_minimo"
                        placeholder="Ej. 10000"
                        value={formData.sueldo_minimo}
                        onChange={handleChange}
                      />
                    </Field>
                    <Field label="Sueldo Máximo Mensual (MXN)">
                      <Input
                        type="number"
                        step="100"
                        name="sueldo_maximo"
                        placeholder="Ej. 15000"
                        value={formData.sueldo_maximo}
                        onChange={handleChange}
                      />
                    </Field>
                  </div>
                )}
              </div>

              <Field label="Prestaciones y Beneficios" required>
                <Textarea
                  name="prestaciones"
                  required
                  rows={2}
                  placeholder="Prestaciones de ley, bonos, fondo de ahorro, seguro, etc."
                  value={formData.prestaciones}
                  onChange={handleChange}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-hairline bg-parchment/50">
                  <Checkbox
                    name="incluye_transporte"
                    checked={formData.incluye_transporte}
                    onChange={handleChange}
                    label="¿Ofrece servicio de transporte?"
                  />
                </div>

                <div className="p-3.5 rounded-xl border border-hairline bg-parchment/50">
                  <Checkbox
                    name="incluye_comedor"
                    checked={formData.incluye_comedor}
                    onChange={handleChange}
                    label="¿Ofrece comedor o vales?"
                  />
                </div>
              </div>

              <Field label="Documentos Requeridos al Postulante" required>
                <Input
                  type="text"
                  name="documentos_requeridos"
                  required
                  value={formData.documentos_requeridos}
                  onChange={handleChange}
                />
              </Field>
            </div>
          )}

          {/* PASO 4: Idioma y Contacto */}
          {pasoActivo === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-parchment border border-hairline space-y-4">
                <Checkbox
                  id="tiene_idioma"
                  name="tiene_idioma"
                  checked={formData.tiene_idioma}
                  onChange={handleChange}
                  label="¿Requiere dominio de un idioma extranjero?"
                />

                {formData.tiene_idioma && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 items-end">
                    <Field label="Idioma">
                      <Select
                        name="idioma_id"
                        value={formData.idioma_id}
                        onChange={handleChange}
                      >
                        {idiomasDisponibles.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.nombre}
                          </option>
                        ))}
                      </Select>
                    </Field>

                    <Field label="Nivel MCER">
                      <Select
                        name="idioma_nivel"
                        value={formData.idioma_nivel}
                        onChange={handleChange}
                      >
                        <option value="A1">A1 - Principiante</option>
                        <option value="A2">A2 - Básico</option>
                        <option value="B1">B1 - Pre-intermedio</option>
                        <option value="B2">B2 - Intermedio</option>
                        <option value="C1">C1 - Avanzado</option>
                        <option value="C2">C2 - Bilingüe / Nativo</option>
                      </Select>
                    </Field>

                    <div className="pb-2.5">
                      <Checkbox
                        name="idioma_obligatorio"
                        checked={formData.idioma_obligatorio}
                        onChange={handleChange}
                        label="Obligatorio"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Persona de Contacto UTH / Organización" required>
                  <Input
                    type="text"
                    name="persona_contacto"
                    required
                    placeholder="Nombre del responsable de vinculación"
                    value={formData.persona_contacto}
                    onChange={handleChange}
                  />
                </Field>

                <Field label="Entrevistador(a) / Reclutador(a)">
                  <Input
                    type="text"
                    name="entrevistador"
                    placeholder="Quien conducirá la entrevista (opcional)"
                    value={formData.entrevistador}
                    onChange={handleChange}
                  />
                </Field>
              </div>

              <Field label="Observaciones Adicionales">
                <Textarea
                  name="observaciones"
                  rows={2}
                  placeholder="Información sobre etapas del proceso, requisitos de traslado, etc."
                  value={formData.observaciones}
                  onChange={handleChange}
                />
              </Field>

              <Alert tone="info" icon={<ShieldCheck className="w-4 h-4 text-primary" />}>
                Al guardar, tu oferta de empleo entrará al filtro de validación institucional UTH y se le asignará una <strong>Clave de Vacante</strong> única.
              </Alert>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
}
