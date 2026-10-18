'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  X, 
  Download, 
  Loader2, 
  AlertCircle
} from 'lucide-react';

interface CvViewerModalProps {
  isOpen?: boolean;
  onClose: () => void;
  egresadoId?: number;
  candidatoNombre: string;
  matricula?: string;
  token: string;
  tipo?: 'cv' | 'documentos';
  isOwnProfile?: boolean;
  docId?: number | null;
  docNombre?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function CvViewerModal({
  isOpen = true,
  onClose,
  egresadoId,
  candidatoNombre,
  matricula,
  token,
  tipo = 'cv',
  isOwnProfile = false,
  docId,
  docNombre,
}: CvViewerModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const esDocumentos = tipo === 'documentos';
  const etiquetaDocumento = docNombre
    ? `Documento: ${docNombre}`
    : esDocumentos
    ? 'Expediente de Documentos para el Empleo'
    : 'Expediente Curricular UTH';

  useEffect(() => {
    let currentUrl: string | null = null;

    async function loadPdf() {
      if (!isOpen || !token || (!isOwnProfile && !egresadoId)) return;

      setLoading(true);
      setErrorMsg(null);
      setBlobUrl(null);

      const query = esDocumentos && docId ? `?doc_id=${docId}` : '';
      const endpoint = isOwnProfile
        ? `${API_BASE_URL}/profiles/egresados/me/${tipo}/${query}`
        : `${API_BASE_URL}/profiles/egresados/${egresadoId}/${tipo}/${query}`;

      try {
        const res = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 404) {
            setErrorMsg(
              esDocumentos
                ? 'Aún no se ha adjuntado un archivo de documentos adicionales en formato PDF.'
                : 'El candidato aún no ha adjuntado su archivo de currículum vitae en formato PDF.'
            );
          } else if (res.status === 403) {
            setErrorMsg('No tienes autorización para consultar este documento.');
          } else {
            setErrorMsg('No se pudo cargar el documento PDF desde el servidor.');
          }
          return;
        }

        const rawBlob = await res.blob();
        const pdfBlob = new Blob([rawBlob], { type: 'application/pdf' });
        currentUrl = URL.createObjectURL(pdfBlob);
        setBlobUrl(currentUrl);
      } catch (err: any) {
        console.error('Error visualizando PDF:', err);
        setErrorMsg('Error de conexión al cargar el documento.');
      } finally {
        setLoading(false);
      }
    }

    loadPdf();

    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [isOpen, egresadoId, token, tipo, isOwnProfile, esDocumentos, docId]);

  if (!isOpen) return null;

  const handleDescargar = () => {
    if (!blobUrl) return;
    const prefijo = esDocumentos ? 'Documentos' : 'CV';
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${prefijo}_${matricula || egresadoId || 'UTH'}_${candidatoNombre.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra Superior */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00A887]/10 border border-[#00A887]/20 flex items-center justify-center text-[#00A887] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {etiquetaDocumento}
                </span>
                {matricula && (
                  <span className="text-[11px] font-semibold text-zinc-500">
                    Matrícula: {matricula}
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-[#2D2926] mt-0.5">
                {candidatoNombre}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {blobUrl && (
              <button
                onClick={handleDescargar}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#00A887] hover:bg-[#008F73] transition-all shadow-xs cursor-pointer"
                title="Descargar copia del PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Descargar PDF</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-all cursor-pointer"
              title="Cerrar visor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenedor del Visor con altura completa */}
        <div className="flex-1 w-full h-full bg-zinc-100 relative overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#00A887] animate-spin mx-auto" />
                <p className="text-xs font-medium text-zinc-600">
                  Obteniendo documento PDF desde el servidor seguro...
                </p>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center space-y-3 p-8 max-w-md bg-white rounded-xl border border-zinc-200 shadow-xs">
                <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
                <h3 className="text-sm font-bold text-[#2D2926]">Documento no disponible</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {errorMsg}
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-all cursor-pointer"
                >
                  Cerrar ventana
                </button>
              </div>
            </div>
          ) : blobUrl ? (
            <iframe
              src={blobUrl}
              title={`${etiquetaDocumento} de ${candidatoNombre}`}
              className="w-full h-full flex-1 border-0"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { CvViewerModal };
