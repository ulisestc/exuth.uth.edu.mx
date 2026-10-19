'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { EmpresaProfile, updateMiPerfilEmpresa } from '@/lib/api';
import {
  Modal,
  Button,
  Alert,
  Field,
  Input,
  Textarea,
  StatusPill,
} from '@/components/ui';

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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
    <Modal
      open={isOpen}
      onClose={onClose}
      size="lg"
      eyebrow="Perfil Empresarial UTH"
      title="Editar Datos Corporativos y Logotipo"
      description="Actualiza tu imagen institucional y los datos de contacto del reclutador."
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
            Guardar Información
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Ficha institucional de solo lectura */}
        <div className="p-4 rounded-xl bg-parchment border border-hairline flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-micro uppercase font-semibold text-ink-muted block">
              Razón Social
            </span>
            <span className="text-body-sm font-semibold text-ink">{empresa.nombre}</span>
          </div>
          <div>
            <span className="text-micro uppercase font-semibold text-ink-muted block">
              Giro y Sector
            </span>
            <span className="text-caption font-medium text-primary">
              {empresa.giro} · {empresa.sector}
            </span>
          </div>
          <div>
            <span className="text-micro uppercase font-semibold text-ink-muted block mb-0.5">
              Convenio UTH
            </span>
            <StatusPill tone="success" icon={<ShieldCheck className="w-3 h-3" />}>
              {empresa.status.toUpperCase()}
            </StatusPill>
          </div>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Sección Logotipo Corporativo */}
          <div className="p-4 rounded-xl border border-hairline bg-parchment/50 space-y-3">
            <span className="text-caption font-semibold text-ink block">
              Logotipo Oficial de la Organización
            </span>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Vista Previa */}
              <div className="w-20 h-20 rounded-xl border border-hairline bg-canvas flex items-center justify-center overflow-hidden shrink-0">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo Empresa"
                    className="w-full h-full object-contain p-1.5"
                  />
                ) : (
                  <div className="text-center p-2 text-ink-muted">
                    <Building2 className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-micro block">Sin logo</span>
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
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<UploadCloud className="w-4 h-4 text-primary" />}
                >
                  {logoFile ? 'Cambiar archivo seleccionado' : 'Subir Logotipo Corporativo'}
                </Button>
                <p className="text-micro text-ink-muted">
                  Formatos recomendados: PNG o JPG con fondo transparente o blanco. Máx 5 MB. Se mostrará en tus vacantes públicas.
                </p>
                {logoFile && (
                  <span className="text-caption font-medium text-primary block">
                    Archivo listo: {logoFile.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contacto Responsable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre del Contacto / Reclutador" required>
              <Input
                type="text"
                required
                value={nombreContacto}
                onChange={(e) => setNombreContacto(e.target.value)}
                placeholder="Ej. Lic. Brenda Morales Sánchez"
              />
            </Field>

            <Field label="Cargo o Puesto del Contacto" required>
              <Input
                type="text"
                required
                value={cargoContacto}
                onChange={(e) => setCargoContacto(e.target.value)}
                placeholder="Ej. Jefa de Atracción de Talento"
              />
            </Field>
          </div>

          {/* Correo y Teléfonos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Correo de Contacto" required>
              <Input
                type="email"
                required
                value={correoContacto}
                onChange={(e) => setCorreoContacto(e.target.value)}
                placeholder="rrhh@empresa.com"
              />
            </Field>

            <Field label="Teléfono de Oficina">
              <Input
                type="tel"
                value={telefonoOficina}
                onChange={(e) => setTelefonoOficina(e.target.value)}
                placeholder="2222000000"
              />
            </Field>

            <Field label="Teléfono Celular">
              <Input
                type="tel"
                value={telefonoCelular}
                onChange={(e) => setTelefonoCelular(e.target.value)}
                placeholder="2221234567"
              />
            </Field>
          </div>

          {/* Domicilio */}
          <Field label="Domicilio Corporativo / Ubicación" required>
            <Input
              type="text"
              required
              value={domicilio}
              onChange={(e) => setDomicilio(e.target.value)}
              placeholder="Parque Industrial FINSA, Nave 12, Cuautlancingo, Puebla"
            />
          </Field>

          {/* Actividad Empresarial */}
          <Field label="Actividad Principal de la Organización">
            <Textarea
              rows={2}
              value={actividad}
              onChange={(e) => setActividad(e.target.value)}
              placeholder="Ej. Fabricación y ensamble de autopartes para la industria automotriz y robótica..."
            />
          </Field>
        </form>
      </div>
    </Modal>
  );
}
export { EditarPerfilEmpresaModal };
