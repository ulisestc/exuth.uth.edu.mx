'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import {
  EgresadoProfile,
  Carrera,
  fetchCarreras,
  crearMiPerfilEgresado,
  updateMiPerfilEgresado,
} from '@/lib/api';
import {
  Modal,
  Button,
  Alert,
  Field,
  Input,
  Select,
  Textarea,
  Code,
  StatusPill,
} from '@/components/ui';

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
  const [carreras, setCarreras] = useState<Carrera[]>([]);

  const [matricula, setMatricula] = useState('');
  const [curp, setCurp] = useState('');
  const [carreraId, setCarreraId] = useState<string>('');
  const [nivelEstudios, setNivelEstudios] = useState<'TSU' | 'ING_LIC' | 'MTRIA'>('ING_LIC');
  const [genero, setGenero] = useState<'M' | 'F' | 'O'>('M');

  const [telefonoCelular, setTelefonoCelular] = useState('');
  const [telefonoCasa, setTelefonoCasa] = useState('');
  const [domicilio, setDomicilio] = useState('');
  const [habilidades, setHabilidades] = useState('');
  const [capacidadesEspeciales, setCapacidadesEspeciales] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isCreating = !profile;
  const canEditAcademicFields = isCreating || !profile?.es_verificado_padron;

  useEffect(() => {
    if (isOpen && canEditAcademicFields) {
      fetchCarreras()
        .then((list) => {
          setCarreras(list);
          if (list.length > 0 && !profile?.carrera_id) {
            const matched = profile?.carrera
              ? list.find((c) => c.nombre === profile.carrera)
              : undefined;
            setCarreraId(String(matched ? matched.id : list[0].id));
          }
        })
        .catch(() => {});
    }
  }, [isOpen, canEditAcademicFields, profile]);

  // Inicializar campos con el perfil actual
  useEffect(() => {
    if (profile) {
      setMatricula(profile.matricula || '');
      setCurp(profile.curp || '');
      if (profile.carrera_id) {
        setCarreraId(String(profile.carrera_id));
      }
      setNivelEstudios(profile.nivel_estudios || 'ING_LIC');
      setGenero(profile.genero || 'M');
      setTelefonoCelular(profile.telefono_celular || '');
      setTelefonoCasa(profile.telefono_casa || '');
      setDomicilio(profile.domicilio || '');
      setHabilidades(profile.habilidades || '');
      setCapacidadesEspeciales(profile.capacidades_especiales || '');
    } else {
      setMatricula('');
      setCurp('');
      setNivelEstudios('ING_LIC');
      setGenero('M');
      setTelefonoCelular('');
      setTelefonoCasa('');
      setDomicilio('');
      setHabilidades('');
      setCapacidadesEspeciales('');
    }
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (canEditAcademicFields) {
      if (!matricula.trim()) {
        setErrorMessage('La matrícula institucional es obligatoria.');
        return;
      }
      const curpLimpia = curp.trim().toUpperCase();
      if (curpLimpia.length !== 18) {
        setErrorMessage('La CURP debe contener exactamente 18 caracteres alfanuméricos.');
        return;
      }
    }

    const telLimpio = telefonoCelular.trim().replace(/\D/g, '');
    if (telLimpio.length < 10 || telLimpio.length > 15) {
      setErrorMessage('El teléfono celular debe contener entre 10 y 15 dígitos numéricos.');
      return;
    }

    const telCasaLimpio = telefonoCasa.trim().replace(/\D/g, '');
    if (telCasaLimpio && (telCasaLimpio.length < 10 || telCasaLimpio.length > 15)) {
      setErrorMessage('El teléfono fijo debe contener entre 10 y 15 dígitos numéricos.');
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

    let res: { success: boolean; profile?: EgresadoProfile; error?: string };

    if (isCreating) {
      res = await crearMiPerfilEgresado(token, {
        matricula: matricula.trim(),
        curp: curp.trim().toUpperCase(),
        carrera: Number(carreraId) || 1,
        nivel_estudios: nivelEstudios,
        genero,
        telefono_celular: telLimpio,
        telefono_casa: telCasaLimpio || undefined,
        domicilio: domicilio.trim(),
        habilidades: habilidades.trim(),
        capacidades_especiales: capacidadesEspeciales.trim() || undefined,
      });
    } else {
      const payload: Parameters<typeof updateMiPerfilEgresado>[1] = {
        telefono_celular: telLimpio,
        telefono_casa: telCasaLimpio || undefined,
        domicilio: domicilio.trim(),
        habilidades: habilidades.trim(),
        capacidades_especiales: capacidadesEspeciales.trim() || undefined,
        nivel_estudios: nivelEstudios,
      };
      if (canEditAcademicFields) {
        payload.matricula = matricula.trim();
        payload.curp = curp.trim().toUpperCase();
        if (carreraId) payload.carrera = Number(carreraId);
        payload.genero = genero;
      }
      res = await updateMiPerfilEgresado(token, payload);
    }

    setIsSubmitting(false);

    if (res.success && res.profile) {
      const msg = isCreating
        ? res.profile.es_verificado_padron
          ? 'Ficha académica registrada y verificada automáticamente en el Padrón UTH.'
          : 'Ficha académica registrada. Tu cuenta ha quedado en espera de validación manual por Dirección de Vinculación UTH.'
        : res.profile.es_verificado_padron && !profile?.es_verificado_padron
        ? '¡Perfil actualizado y matrícula verificada automáticamente contra el Padrón Oficial UTH!'
        : 'Tu información de perfil ha sido actualizada exitosamente.';
      setSuccessMessage(msg);
      onProfileUpdated(res.profile);
      setTimeout(() => {
        onClose();
      }, 1400);
    } else {
      setErrorMessage(res.error || 'Ocurrió un error al guardar los datos.');
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="lg"
      eyebrow={isCreating ? 'Registro de Expediente Académico' : 'Actualización de Perfil Egresado'}
      title={isCreating ? 'Completar Ficha Académica UTH' : 'Editar Datos de Contacto y Perfil'}
      description={
        isCreating
          ? 'Captura tus datos escolares y de contacto para activar tu expediente de vinculación laboral.'
          : 'Mantén actualizados tus medios de contacto y competencias para los reclutadores.'
      }
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={isSubmitting}
            onClick={() => handleSubmit()}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            {isCreating ? 'Crear Ficha Académica' : 'Guardar Información'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Aviso informativo cuando está en validación de padrón */}
        {!isCreating && !profile.es_verificado_padron && (
          <Alert tone="warning" title="Cuenta en Validación Manual de Padrón">
            Tu matrícula aún no figura en el último corte Excel de Servicios Escolares. Dirección de Vinculación UTH puede validarte manualmente; si cometiste algún error al capturar tu matrícula, CURP o carrera, puedes corregirlo aquí mismo.
          </Alert>
        )}

        {/* Si ya está verificado en padrón, mostrar ficha institucional de solo lectura */}
        {!canEditAcademicFields && profile && (
          <div className="p-4 rounded-xl bg-parchment border border-hairline grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-micro uppercase font-semibold text-ink-muted block mb-0.5">
                Matrícula (Verificada)
              </span>
              <Code>{profile.matricula}</Code>
            </div>
            <div>
              <span className="text-micro uppercase font-semibold text-ink-muted block mb-0.5">
                CURP
              </span>
              <Code>{profile.curp}</Code>
            </div>
            <div className="col-span-2">
              <span className="text-micro uppercase font-semibold text-ink-muted block">
                Programa UTH
              </span>
              <span className="text-caption font-semibold text-primary truncate block">
                {profile.carrera}
              </span>
            </div>
          </div>
        )}

        {errorMessage && (
          <Alert tone="danger" onDismiss={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert tone="success" onDismiss={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos académicos editables si aún no está verificado en padrón o si está creando su ficha */}
          {canEditAcademicFields && (
            <div className="p-4 rounded-xl bg-parchment/60 border border-hairline space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-fine font-semibold uppercase tracking-wider text-ink-64 flex items-center gap-1.5">
                  <ShieldAlert className="size-3.5 text-warning" />
                  Datos Escolares para Validación en Padrón
                </span>
                <StatusPill tone="warning">Validación Pendiente</StatusPill>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Matrícula UTH" required hint="Si corriges tu matrícula y coincide con el padrón, se verificará al instante.">
                  <Input
                    type="text"
                    required
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    placeholder="Ej. 3523110265"
                  />
                </Field>

                <Field label="CURP (18 caracteres)" required>
                  <Input
                    type="text"
                    required
                    maxLength={18}
                    value={curp}
                    onChange={(e) => setCurp(e.target.value.toUpperCase())}
                    placeholder="18 caracteres oficiales"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Programa Educativo / Carrera UTH" required>
                    <Select
                      value={carreraId}
                      onChange={(e) => setCarreraId(e.target.value)}
                    >
                      {carreras.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <Field label="Nivel de Egreso" required>
                  <Select
                    value={nivelEstudios}
                    onChange={(e) => setNivelEstudios(e.target.value as 'TSU' | 'ING_LIC' | 'MTRIA')}
                  >
                    <option value="TSU">TSU</option>
                    <option value="ING_LIC">Ingeniería / Licenciatura</option>
                    <option value="MTRIA">Maestría / Posgrado</option>
                  </Select>
                </Field>
              </div>
            </div>
          )}

          {/* Teléfonos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Teléfono Celular (10 dígitos)"
              required
              hint="Usado por los reclutadores para contactarte."
            >
              <Input
                type="tel"
                required
                value={telefonoCelular}
                onChange={(e) => setTelefonoCelular(e.target.value)}
                placeholder="Ej. 2221234567"
              />
            </Field>

            <Field label="Teléfono Fijo / Casa (Opcional)">
              <Input
                type="tel"
                value={telefonoCasa}
                onChange={(e) => setTelefonoCasa(e.target.value)}
                placeholder="Ej. 2271000000"
              />
            </Field>
          </div>

          {/* Domicilio */}
          <Field label="Domicilio Completo" required>
            <Input
              type="text"
              required
              value={domicilio}
              onChange={(e) => setDomicilio(e.target.value)}
              placeholder="Calle, número, colonia, municipio y código postal"
            />
          </Field>

          {/* Habilidades */}
          <Field
            label="Habilidades Técnicas y Competencias"
            required
            hint="Destaca tus competencias clave para que las empresas identifiquen tu compatibilidad."
          >
            <Textarea
              rows={3}
              required
              value={habilidades}
              onChange={(e) => setHabilidades(e.target.value)}
              placeholder="Ej. Programación en Python, PLC Siemens, SolidWorks, Mantenimiento preventivo, Trabajo en equipo..."
            />
          </Field>

          {/* Capacidades Especiales */}
          <Field label="Inclusión / Necesidades de Accesibilidad (Opcional)">
            <Input
              type="text"
              value={capacidadesEspeciales}
              onChange={(e) => setCapacidadesEspeciales(e.target.value)}
              placeholder="Ej. Discapacidad motriz leve, adaptación ergonómica requerida, ninguna..."
            />
          </Field>
        </form>
      </div>
    </Modal>
  );
}
export { EditarPerfilEgresadoModal };
