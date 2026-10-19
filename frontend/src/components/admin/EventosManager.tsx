'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Edit3,
  Trash2,
  MapPin,
  Clock,
  Loader2,
} from 'lucide-react';
import {
  EventoItem,
  fetchAdminEventos,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
} from '@/lib/api';
import {
  Card,
  SearchInput,
  Select,
  Button,
  StatusPill,
  Tag,
  Alert,
  EmptyState,
  Modal,
  Field,
  Input,
  Textarea,
  Checkbox,
} from '@/components/ui';

interface EventosManagerProps {
  token: string;
}

const TIPOS_EVENTO_LABEL: Record<EventoItem['tipo_evento'], string> = {
  feria_empleo: 'Feria de Empleo',
  reclutamiento_masivo: 'Reclutamiento Masivo',
  taller: 'Taller / Capacitación',
  conferencia: 'Conferencia / Webinar',
  otro: 'Otro Evento',
};

export default function EventosManager({ token }: EventosManagerProps) {
  const [eventos, setEventos] = useState<EventoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  // Modal de Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<EventoItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Modal de Confirmación de Eliminación
  const [deleteTarget, setDeleteTarget] = useState<EventoItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    nombre: string;
    tipo_evento: EventoItem['tipo_evento'];
    fecha_inicio: string;
    fecha_fin: string;
    lugar: string;
    descripcion: string;
    is_active: boolean;
  }>({
    nombre: '',
    tipo_evento: 'feria_empleo',
    fecha_inicio: '',
    fecha_fin: '',
    lugar: '',
    descripcion: '',
    is_active: true,
  });

  const loadEventos = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const data = await fetchAdminEventos(token);
      setEventos(data);
    } catch (err) {
      console.error('Error cargando eventos:', err);
      setFeedback({ type: 'danger', message: 'No se pudieron cargar los eventos institucionales.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setEditingEvento(null);
    const now = new Date();
    const defaultStart = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    const defaultEnd = new Date(now.getTime() + 28 * 60 * 60 * 1000).toISOString().slice(0, 16);
    setFormData({
      nombre: '',
      tipo_evento: 'feria_empleo',
      fecha_inicio: defaultStart,
      fecha_fin: defaultEnd,
      lugar: '',
      descripcion: '',
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (ev: EventoItem) => {
    setEditingEvento(ev);
    const fmt = (dStr: string) => {
      try {
        const d = new Date(dStr);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      } catch {
        return dStr.slice(0, 16);
      }
    };
    setFormData({
      nombre: ev.nombre,
      tipo_evento: ev.tipo_evento,
      fecha_inicio: fmt(ev.fecha_inicio),
      fecha_fin: fmt(ev.fecha_fin),
      lugar: ev.lugar,
      descripcion: ev.descripcion,
      is_active: ev.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.lugar.trim() || !formData.descripcion.trim()) {
      setFeedback({ type: 'danger', message: 'Por favor completa todos los campos requeridos.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const payload = {
      nombre: formData.nombre.trim(),
      tipo_evento: formData.tipo_evento,
      fecha_inicio: new Date(formData.fecha_inicio).toISOString(),
      fecha_fin: new Date(formData.fecha_fin).toISOString(),
      lugar: formData.lugar.trim(),
      descripcion: formData.descripcion.trim(),
      is_active: formData.is_active,
    };

    if (editingEvento) {
      const res = await actualizarEvento(token, editingEvento.id, payload);
      setSaving(false);
      if (res.success) {
        setIsModalOpen(false);
        setFeedback({ type: 'success', message: `Evento «${res.data?.nombre}» actualizado correctamente.` });
        loadEventos();
      } else {
        setFeedback({ type: 'danger', message: res.error || 'Error al actualizar el evento.' });
      }
    } else {
      const res = await crearEvento(token, payload);
      setSaving(false);
      if (res.success) {
        setIsModalOpen(false);
        setFeedback({ type: 'success', message: `Evento «${res.data?.nombre}» publicado exitosamente en la cartelera.` });
        loadEventos();
      } else {
        setFeedback({ type: 'danger', message: res.error || 'Error al registrar el evento.' });
      }
    }
  };

  const handleToggleActive = async (ev: EventoItem) => {
    const res = await actualizarEvento(token, ev.id, { is_active: !ev.is_active });
    if (res.success) {
      setEventos((prev) => prev.map((item) => (item.id === ev.id ? { ...item, is_active: !ev.is_active } : item)));
      setFeedback({
        type: 'success',
        message: `El evento «${ev.nombre}» ahora está ${!ev.is_active ? 'Visible y Activo' : 'Pausado / Inactivo'}.`,
      });
    } else {
      setFeedback({ type: 'danger', message: res.error || 'Error al cambiar estatus del evento.' });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await eliminarEvento(token, deleteTarget.id);
    setDeleting(false);

    if (res.success) {
      setEventos((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setFeedback({ type: 'success', message: `Evento «${deleteTarget.nombre}» eliminado correctamente.` });
    } else {
      setFeedback({ type: 'danger', message: res.error || 'No se pudo eliminar el evento.' });
    }
    setDeleteTarget(null);
  };

  const filteredEventos = eventos.filter((ev) => {
    if (tipoFiltro !== 'todos' && ev.tipo_evento !== tipoFiltro) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ev.nombre.toLowerCase().includes(q) ||
        ev.lugar.toLowerCase().includes(q) ||
        ev.descripcion.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Barra Superior con Controles y Botón de Nuevo Evento */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="flex-1 max-w-md">
              <SearchInput
                placeholder="Buscar por título, sede o tema…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="w-full sm:w-60">
              <Select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
              >
                <option value="todos">Todos los tipos</option>
                <option value="feria_empleo">Ferias de Empleo</option>
                <option value="reclutamiento_masivo">Reclutamientos Masivos</option>
                <option value="taller">Talleres y Capacitaciones</option>
                <option value="conferencia">Conferencias</option>
                <option value="otro">Otros</option>
              </Select>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={<Plus className="size-4" />}
            onClick={openCreateModal}
          >
            Publicar Nuevo Evento
          </Button>
        </div>
      </Card>

      {/* Alertas */}
      {feedback && (
        <Alert
          tone={feedback.type}
          action={
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-caption font-semibold hover:underline cursor-pointer"
            >
              Cerrar
            </button>
          }
        >
          {feedback.message}
        </Alert>
      )}

      {/* Lista de Eventos */}
      {loading ? (
        <Card className="py-20 text-center space-y-3">
          <Loader2 className="size-7 text-brand animate-spin mx-auto" />
          <p className="text-caption text-ink-64">Cargando eventos de empleabilidad de la UTH…</p>
        </Card>
      ) : filteredEventos.length === 0 ? (
        <Card>
          <EmptyState
            icon={Calendar}
            title="No hay eventos registrados"
            description={
              searchQuery || tipoFiltro !== 'todos'
                ? 'No se encontraron eventos con los filtros seleccionados.'
                : 'Publica ferias de empleo, reclutamientos masivos o talleres para egresados.'
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEventos.map((ev) => {
            const startDate = new Date(ev.fecha_inicio);
            const endDate = new Date(ev.fecha_fin);

            return (
              <Card
                key={ev.id}
                className={`p-6 flex flex-col justify-between space-y-5 ${
                  ev.is_active ? 'bg-canvas' : 'bg-parchment/60 opacity-80'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <Tag>{TIPOS_EVENTO_LABEL[ev.tipo_evento] || ev.tipo_evento}</Tag>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(ev)}
                      className="press cursor-pointer"
                      title="Clic para cambiar visibilidad"
                    >
                      <StatusPill tone={ev.is_active ? 'success' : 'muted'}>
                        {ev.is_active ? 'Activo en Cartelera' : 'Pausado / Inactivo'}
                      </StatusPill>
                    </button>
                  </div>

                  <h3 className="text-tagline text-ink font-semibold leading-snug">
                    {ev.nombre}
                  </h3>

                  <p className="text-caption text-ink-64 line-clamp-3 leading-relaxed">
                    {ev.descripcion}
                  </p>

                  <div className="space-y-1.5 text-caption text-ink-80 pt-1">
                    <div className="flex items-center gap-2">
                      <Clock className="size-3.5 text-wine shrink-0" />
                      <span>
                        {startDate.toLocaleDateString('es-MX', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        —{' '}
                        {endDate.toLocaleTimeString('es-MX', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5 text-primary shrink-0" />
                      <span className="truncate">{ev.lugar}</span>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-hairline">
                  <Button
                    variant="pearl"
                    size="sm"
                    icon={<Edit3 className="size-3.5" />}
                    onClick={() => openEditModal(ev)}
                  >
                    Editar
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    icon={<Trash2 className="size-3.5" />}
                    onClick={() => setDeleteTarget(ev)}
                  >
                    Eliminar
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Crear / Editar Evento */}
      <Modal
        open={isModalOpen}
        onClose={() => !saving && setIsModalOpen(false)}
        dismissible={!saving}
        size="md"
        title={editingEvento ? 'Editar Evento Institucional' : 'Publicar Nuevo Evento'}
        description="Se publicará en la cartelera universitaria de empleabilidad UTH."
        footer={
          <>
            <Button
              type="button"
              variant="pearl"
              size="md"
              disabled={saving}
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="evento-form"
              variant="primary"
              size="md"
              loading={saving}
            >
              {editingEvento ? 'Guardar cambios' : 'Crear y publicar'}
            </Button>
          </>
        }
      >
        <form id="evento-form" onSubmit={handleSave} className="space-y-4">
          <Field label="Nombre del Evento" required>
            <Input
              required
              placeholder="Ej. Feria de Empleo UTH 2026 — Primavera"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tipo de Evento" required>
              <Select
                value={formData.tipo_evento}
                onChange={(e) =>
                  setFormData({ ...formData, tipo_evento: e.target.value as EventoItem['tipo_evento'] })
                }
              >
                <option value="feria_empleo">Feria de Empleo</option>
                <option value="reclutamiento_masivo">Reclutamiento Masivo</option>
                <option value="taller">Taller / Capacitación</option>
                <option value="conferencia">Conferencia / Webinar</option>
                <option value="otro">Otro</option>
              </Select>
            </Field>

            <Field label="Lugar o Enlace Virtual" required>
              <Input
                required
                placeholder="Ej. Auditorio Edificio D o meet.google.com/xyz"
                value={formData.lugar}
                onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Fecha y Hora de Inicio" required>
              <Input
                type="datetime-local"
                required
                value={formData.fecha_inicio}
                onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
              />
            </Field>

            <Field label="Fecha y Hora de Término" required>
              <Input
                type="datetime-local"
                required
                value={formData.fecha_fin}
                onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Descripción y Detalles del Evento" required>
            <Textarea
              required
              rows={4}
              placeholder="Detalles sobre empresas participantes, vestimenta requerida, registro previo o requisitos para egresados…"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
          </Field>

          <div className="rounded-card bg-parchment p-4">
            <Checkbox
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              label="Publicar inmediatamente como evento activo en la cartelera"
            />
          </div>
        </form>
      </Modal>

      {/* Modal Confirmación de Eliminación */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        dismissible={!deleting}
        size="sm"
        title="Eliminar evento institucional"
        description={
          deleteTarget && (
            <>
              Evento: <strong className="text-ink">{deleteTarget.nombre}</strong>
            </>
          )
        }
        footer={
          <>
            <Button
              variant="pearl"
              size="md"
              disabled={deleting}
              onClick={() => setDeleteTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="md"
              loading={deleting}
              onClick={confirmDelete}
            >
              Sí, eliminar permanentemente
            </Button>
          </>
        }
      >
        <p className="text-caption text-ink-64 leading-relaxed">
          Esta acción retirará permanentemente el evento de la cartelera universitaria y no se puede deshacer.
        </p>
      </Modal>
    </div>
  );
}
