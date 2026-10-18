'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Clock, 
  Search, 
  Filter, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { 
  EventoItem, 
  fetchAdminEventos, 
  crearEvento, 
  actualizarEvento, 
  eliminarEvento 
} from '@/lib/api';

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
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal de Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<EventoItem | null>(null);
  const [saving, setSaving] = useState(false);

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
      setFeedback({ type: 'error', message: 'No se pudieron cargar los eventos institucionales.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventos();
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
    // Format date string to YYYY-MM-DDTHH:MM
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
      setFeedback({ type: 'error', message: 'Por favor completa todos los campos requeridos.' });
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
        setFeedback({ type: 'success', message: `Evento "${res.data?.nombre}" actualizado correctamente.` });
        loadEventos();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Error al actualizar el evento.' });
      }
    } else {
      const res = await crearEvento(token, payload);
      setSaving(false);
      if (res.success) {
        setIsModalOpen(false);
        setFeedback({ type: 'success', message: `Evento "${res.data?.nombre}" publicado exitosamente en la cartelera.` });
        loadEventos();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Error al registrar el evento.' });
      }
    }
  };

  const handleToggleActive = async (ev: EventoItem) => {
    const res = await actualizarEvento(token, ev.id, { is_active: !ev.is_active });
    if (res.success) {
      setEventos(prev => prev.map(item => item.id === ev.id ? { ...item, is_active: !ev.is_active } : item));
      setFeedback({
        type: 'success',
        message: `El evento "${ev.nombre}" ahora está ${!ev.is_active ? 'Visible y Activo' : 'Pausado / Inactivo'}.`
      });
    } else {
      setFeedback({ type: 'error', message: res.error || 'Error al cambiar estatus del evento.' });
    }
  };

  const handleDelete = async (ev: EventoItem) => {
    if (!window.confirm(`¿Estás seguro de eliminar permanentemente el evento "${ev.nombre}"?`)) {
      return;
    }

    const res = await eliminarEvento(token, ev.id);
    if (res.success) {
      setEventos(prev => prev.filter(item => item.id !== ev.id));
      setFeedback({ type: 'success', message: `Evento "${ev.nombre}" eliminado correctamente.` });
    } else {
      setFeedback({ type: 'error', message: res.error || 'No se pudo eliminar el evento.' });
    }
  };

  const filteredEventos = eventos.filter(ev => {
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por título, sede o tema..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#00A887]/20 focus:border-[#00A887] text-[#2D2926]"
            />
          </div>

          {/* Filtro por tipo */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400 shrink-0" />
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#00A887]/20 focus:border-[#00A887] cursor-pointer"
            >
              <option value="todos">Todos los Tipos</option>
              <option value="feria_empleo">Ferias de Empleo</option>
              <option value="reclutamiento_masivo">Reclutamientos Masivos</option>
              <option value="taller">Talleres y Capacitaciones</option>
              <option value="conferencia">Conferencias</option>
              <option value="otro">Otros</option>
            </select>
          </div>
        </div>

        {/* Botón Crear */}
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Publicar Nuevo Evento
        </button>
      </div>

      {/* Alertas */}
      {feedback && (
        <div className={`p-4 rounded-xl border text-xs font-medium flex items-center justify-between ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <span>{feedback.message}</span>
          <button 
            onClick={() => setFeedback(null)} 
            className="font-bold underline ml-3 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Lista de Eventos */}
      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-zinc-200">
          <Loader2 className="w-8 h-8 text-[#00A887] animate-spin mx-auto" />
          <p className="text-xs text-[#636569] font-medium">Cargando eventos de empleabilidad de la UTH...</p>
        </div>
      ) : filteredEventos.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-zinc-200 p-8">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#2D2926]">No hay eventos registrados</h3>
          <p className="text-xs text-[#636569] max-w-sm mx-auto">
            {searchQuery || tipoFiltro !== 'todos'
              ? 'No se encontraron eventos con los filtros seleccionados.'
              : 'Publica ferias de empleo, reclutamientos masivos o talleres para egresados.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEventos.map((ev) => {
            const startDate = new Date(ev.fecha_inicio);
            const endDate = new Date(ev.fecha_fin);

            return (
              <div
                key={ev.id}
                className={`bg-white rounded-2xl border p-5 sm:p-6 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  ev.is_active ? 'border-zinc-200' : 'border-zinc-200 bg-zinc-50/50 opacity-75'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#00A887]/10 text-[#00A887] border border-[#00A887]/20">
                      {TIPOS_EVENTO_LABEL[ev.tipo_evento] || ev.tipo_evento}
                    </span>

                    <button
                      onClick={() => handleToggleActive(ev)}
                      className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                        ev.is_active
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                      }`}
                      title="Clic para cambiar visibilidad"
                    >
                      {ev.is_active ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Activo en Cartelera
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-zinc-400" />
                          Pausado / Inactivo
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-[#2D2926] leading-snug">
                    {ev.nombre}
                  </h3>

                  <p className="text-xs text-[#636569] line-clamp-3 leading-relaxed">
                    {ev.descripcion}
                  </p>

                  <div className="space-y-1.5 text-xs text-[#2D2926] pt-1">
                    <div className="flex items-center gap-2 text-zinc-600">
                      <Clock className="w-3.5 h-3.5 text-[#691C32] shrink-0" />
                      <span>
                        {startDate.toLocaleDateString('es-MX', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' '}—{' '}
                        {endDate.toLocaleTimeString('es-MX', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-zinc-600">
                      <MapPin className="w-3.5 h-3.5 text-[#00A887] shrink-0" />
                      <span className="truncate">{ev.lugar}</span>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                  <button
                    onClick={() => openEditModal(ev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2D2926] bg-zinc-100 hover:bg-zinc-200 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-zinc-600" />
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(ev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Crear / Editar Evento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-zinc-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-[#2D2926]">
                  {editingEvento ? 'Editar Evento Institucional' : 'Publicar Nuevo Evento'}
                </h3>
                <p className="text-xs text-[#636569]">
                  Se publicará en la cartelera universitaria de empleabilidad UTH.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2D2926]">
                  Nombre del Evento <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Feria de Empleo UTH 2026 - Primavera"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#00A887]/20 focus:border-[#00A887]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D2926]">
                    Tipo de Evento <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.tipo_evento}
                    onChange={(e) => setFormData({ ...formData, tipo_evento: e.target.value as EventoItem['tipo_evento'] })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A887]/20 focus:border-[#00A887]"
                  >
                    <option value="feria_empleo">Feria de Empleo</option>
                    <option value="reclutamiento_masivo">Reclutamiento Masivo</option>
                    <option value="taller">Taller / Capacitación</option>
                    <option value="conferencia">Conferencia / Webinar</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D2926]">
                    Lugar o Enlace Virtual <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Auditorio Edificio D o meet.google.com/xyz"
                    value={formData.lugar}
                    onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#00A887]/20 focus:border-[#00A887]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D2926]">
                    Fecha y Hora de Inicio <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#00A887]/20 focus:border-[#00A887]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D2926]">
                    Fecha y Hora de Término <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#00A887]/20 focus:border-[#00A887]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2D2926]">
                  Descripción y Detalles del Evento <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detalles sobre empresas participantes, vestimenta requerida, registro previo o requisitos para egresados..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#00A887]/20 focus:border-[#00A887] resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modal_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-[#00A887] focus:ring-[#00A887] border-zinc-300 cursor-pointer"
                />
                <label htmlFor="modal_is_active" className="text-xs font-semibold text-[#2D2926] cursor-pointer">
                  Publicar inmediatamente como evento activo en la cartelera
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#636569] hover:bg-zinc-100 transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingEvento ? 'Guardar Cambios' : 'Crear y Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
