'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText,
  X,
  Download,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button, StatusPill, Code } from '@/components/ui';

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
    ? docNombre
    : esDocumentos
    ? 'Expediente de Documentos'
    : 'Currículum Vitae UTH';

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

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
            Authorization: `Bearer ${token}`,
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
      } catch (err) {
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

  if (!isOpen || typeof document === 'undefined') return null;

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

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-6 bg-void/60 backdrop-blur-[8px] animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${etiquetaDocumento} — ${candidatoNombre}`}
    >
      <div
        className="bg-canvas rounded-card shadow-sheet ring-1 ring-hairline w-full max-w-5xl h-[92dvh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="px-5 py-4 border-b border-divider flex items-center justify-between gap-4 bg-canvas shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-field bg-primary-tint flex items-center justify-center text-primary shrink-0">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone="success" dot={false}>
                  {etiquetaDocumento}
                </StatusPill>
                {matricula && <Code>Matrícula {matricula}</Code>}
              </div>
              <h2 className="text-tagline text-ink font-semibold truncate mt-0.5">
                {candidatoNombre}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {blobUrl && (
              <Button
                variant="primary"
                size="sm"
                icon={<Download className="size-4" />}
                onClick={handleDescargar}
              >
                <span className="hidden sm:inline">Descargar PDF</span>
              </Button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar visor"
              className="press inline-flex size-10 items-center justify-center rounded-full bg-parchment text-ink-64 hover:bg-divider hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Visor */}
        <div className="flex-1 w-full h-full bg-parchment relative overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center space-y-3">
                <Loader2 className="size-7 text-brand animate-spin mx-auto" />
                <p className="text-caption text-ink-64">
                  Cargando documento PDF desde el servidor seguro…
                </p>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center space-y-4 p-8 max-w-md bg-canvas rounded-card ring-1 ring-hairline">
                <div className="size-12 rounded-full bg-warning-tint text-warning-ink flex items-center justify-center mx-auto">
                  <AlertCircle className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-body font-semibold text-ink">Documento no disponible</h3>
                  <p className="text-caption text-ink-64 leading-relaxed">
                    {errorMsg}
                  </p>
                </div>
                <Button variant="pearl" size="sm" onClick={onClose}>
                  Cerrar ventana
                </Button>
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
    </div>,
    document.body
  );
}

export { CvViewerModal };
