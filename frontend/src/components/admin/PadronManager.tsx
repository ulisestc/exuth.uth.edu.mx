'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Loader2, 
  GraduationCap, 
  UserCheck, 
  Calendar, 
  Phone, 
  Mail, 
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  PadronEgresadoItem, 
  ImportarPadronResponse, 
  fetchPadronEgresados, 
  importarPadronExcel 
} from '@/lib/api';

interface PadronManagerProps {
  token: string;
  onStatsChange?: () => void;
}

export default function PadronManager({ token, onStatsChange }: PadronManagerProps) {
  const [padronList, setPadronList] = useState<PadronEgresadoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Estados de carga de archivo
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<ImportarPadronResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPadron = async (query = searchQuery) => {
    setLoading(true);
    try {
      const data = await fetchPadronEgresados(token, query);
      setPadronList(data);
    } catch (err) {
      console.error('Error cargando padrón:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPadron();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPadron(searchQuery);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xlsm')) {
        setSelectedFile(file);
        setErrorMessage(null);
      } else {
        setErrorMessage('Formato no válido. Debe ser un archivo Excel (.xlsx).');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xlsm')) {
        setSelectedFile(file);
        setErrorMessage(null);
      } else {
        setErrorMessage('Formato no válido. Debe ser un archivo Excel (.xlsx).');
      }
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage(null);
    setImportResult(null);

    const res = await importarPadronExcel(token, selectedFile);
    setIsUploading(false);

    if (res.success && res.data) {
      setImportResult(res.data);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadPadron('');
      if (onStatsChange) onStatsChange();
    } else {
      setErrorMessage(res.error || 'Error al procesar el archivo Excel.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Zona de Carga Masiva (Excel) */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#00A887]/10 text-[#00A887] border border-[#00A887]/20">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Sincronización con Servicios Escolares
            </div>
            <h2 className="text-xl font-bold text-[#2D2926]">
              Carga Masiva del Padrón de Egresados UTH (.xlsx)
            </h2>
            <p className="text-xs text-[#636569] max-w-2xl">
              Importa la sábana oficial de egresados de Servicios Escolares (formato de 78 columnas). El sistema ejecuta un Upsert por matrícula y verifica automáticamente a los alumnos registrados.
            </p>
          </div>

          <a
            href="/plantillas/Plantilla_Padron_Egresados_UTH.xlsx"
            download
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold text-[#2D2926] bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 transition-all shrink-0 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-[#00A887]" />
            Descargar Plantilla Oficial (.xlsx)
          </a>
        </div>

        {/* Zona Drag & Drop */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            selectedFile
              ? 'border-[#00A887] bg-emerald-50/30'
              : 'border-zinc-300 hover:border-[#00A887] hover:bg-zinc-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xlsm"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-[#00A887] mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>

          {selectedFile ? (
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#2D2926]">
                Archivo seleccionado: {selectedFile.name}
              </p>
              <p className="text-xs text-[#636569]">
                Tamaño: {(selectedFile.size / 1024).toFixed(1)} KB · Haz clic para cambiar de archivo
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#2D2926]">
                Arrastra tu archivo Excel aquí o haz clic para seleccionarlo
              </p>
              <p className="text-xs text-[#636569]">
                Formatos permitidos: .xlsx, .xlsm (Tamaño máximo recomendado: 25 MB)
              </p>
            </div>
          )}
        </div>

        {/* Botón de Importación */}
        {selectedFile && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setSelectedFile(null)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#636569] hover:bg-zinc-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleUploadSubmit}
              disabled={isUploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando sábana de egresados...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  Iniciar Carga y Verificación Masiva
                </>
              )}
            </button>
          </div>
        )}

        {/* Alerta de Error */}
        {errorMessage && (
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-800 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Resumen de Importación Exitosa */}
        {importResult && (
          <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-[#00A887]" />
              {importResult.mensaje}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="bg-white p-3 rounded-lg border border-emerald-200 text-center">
                <span className="text-xs font-bold text-[#636569] block">Total Procesadas</span>
                <span className="text-lg font-black text-[#2D2926]">{importResult.total_filas_procesadas}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-200 text-center">
                <span className="text-xs font-bold text-[#636569] block">Nuevos Egresados</span>
                <span className="text-lg font-black text-[#00A887]">+{importResult.creados}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-200 text-center">
                <span className="text-xs font-bold text-[#636569] block">Actualizados</span>
                <span className="text-lg font-black text-amber-700">{importResult.actualizados}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-200 text-center">
                <span className="text-xs font-bold text-[#636569] block">Filas Omitidas</span>
                <span className="text-lg font-black text-zinc-500">{importResult.omitidos}</span>
              </div>
            </div>

            <p className="text-[11px] text-emerald-800 font-medium pt-1">
              ✓ Se verificaron y sincronizaron automáticamente todas las cuentas de egresados que coinciden con las matrículas del padrón.
            </p>
          </div>
        )}
      </div>

      {/* Buscador y Padrón Institucional */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#2D2926]">
              Consulta del Padrón Oficial UTH
            </h3>
            <p className="text-xs text-[#636569] mt-0.5">
              Registro histórico de matrícula, carrera, periodo y estatus de titulación.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por matrícula, nombre o CURP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#00A887]"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all cursor-pointer"
            >
              Buscar
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                loadPadron('');
              }}
              title="Restablecer"
              className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Listado de Resultados */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#00A887] animate-spin mx-auto" />
            <p className="text-xs text-[#636569] font-medium">Consultando registros del padrón institucional...</p>
          </div>
        ) : padronList.length === 0 ? (
          <div className="py-16 text-center space-y-3 p-8 border border-zinc-100 rounded-xl bg-zinc-50/50">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#2D2926]">No hay egresados en el padrón</h4>
            <p className="text-xs text-[#636569] max-w-sm mx-auto">
              {searchQuery 
                ? 'No se encontraron resultados para el término de búsqueda ingresado.'
                : 'Aún no se ha importado el archivo Excel de Servicios Escolares. Sube tu primer archivo en la sección superior.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-[#636569] font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Matrícula</th>
                  <th className="py-3 px-4">Nombre Completo</th>
                  <th className="py-3 px-4">Carrera / Nivel</th>
                  <th className="py-3 px-4">Periodo / Egreso</th>
                  <th className="py-3 px-4">Estatus Titulación</th>
                  <th className="py-3 px-4">Contacto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {padronList.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#2D2926]">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[#00A887]">
                        {item.matricula}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#2D2926]">
                      {item.nombre}
                      {item.curp && (
                        <span className="block font-normal text-[10px] text-zinc-500 font-mono mt-0.5">
                          CURP: {item.curp}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#636569]">
                      <span className="font-medium text-[#2D2926] block">{item.carrera}</span>
                      <span className="text-[10px] font-semibold uppercase text-zinc-400">
                        {item.nivel || 'TSU / ING'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#636569]">
                      <span className="block">{item.periodo || 'N/A'}</span>
                      <span className="text-[11px] font-semibold text-[#691C32]">
                        {item.anio_egreso ? `Año ${item.anio_egreso}` : ''}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.estatus_titulacion === 'Titulado'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {item.estatus_titulacion || 'En Trámite'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#636569]">
                      {item.correo_personal && (
                        <div className="flex items-center gap-1 text-[11px] truncate max-w-[180px]">
                          <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span className="truncate">{item.correo_personal}</span>
                        </div>
                      )}
                      {item.telefono_movil && (
                        <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-0.5">
                          <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span>{item.telefono_movil}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
