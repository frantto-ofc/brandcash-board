'use client';

import { useEffect, useState } from 'react';
import {
  Upload,
  Download,
  Archive,
  RotateCcw,
  ExternalLink,
  FileText,
  Music,
  Video,
  Globe,
  Image as ImageIcon,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  listAssets,
  putAsset,
  safeWebUrl,
  downloadBlob,
  type BrandAsset,
} from './asset-store';

function AssetIcon({ type }: { type: string }) {
  if (type === 'link') return <Globe size={18} />;
  if (/^image\//.test(type)) return <ImageIcon size={18} />;
  if (/^audio\//.test(type)) return <Music size={18} />;
  if (/^video\//.test(type)) return <Video size={18} />;
  if (/pdf|word|document|presentation/.test(type)) return <FileText size={18} />;
  return <Layers size={18} />;
}

function AssetPreview({ asset }: { asset: BrandAsset }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!asset.file) return;
    const u = URL.createObjectURL(asset.file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [asset.file]);

  if (!url) return null;
  if (/^image\/(png|jpeg|webp|gif|svg\+xml)$/i.test(asset.type)) {
    return (
      <div className="asset-media-preview image">
        <img src={url} alt={asset.description || asset.name} />
      </div>
    );
  }
  if (asset.type.startsWith('audio/')) {
    return (
      <div className="asset-media-preview audio">
        <audio controls src={url} aria-label={asset.name} />
      </div>
    );
  }
  if (asset.type.startsWith('video/')) {
    return (
      <div className="asset-media-preview video">
        <video controls src={url} aria-label={asset.name} />
      </div>
    );
  }
  return null;
}

export function BrandAssets({
  update,
}: {
  update: (k: string, v: string) => void;
}) {
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    listAssets()
      .then(setAssets)
      .catch(() =>
        setError('Não foi possível abrir os assets neste navegador.'),
      );
  }, []);

  async function refresh() {
    const all = await listAssets();
    setAssets(all);
    update(
      'brand_asset_manifest',
      JSON.stringify(
        all
          .filter((a) => !a.archived)
          .map(({ id, name, type, size, url, description }) => ({
            id,
            name,
            type,
            size,
            url,
            description,
          })),
      ),
    );
  }

  async function upload(files: FileList | null) {
    if (!files) return;
    setBusy(true);
    setError('');
    try {
      let total = assets.reduce((n, a) => n + a.size, 0);
      for (const file of Array.from(files)) {
        if (file.size > 25 * 1024 * 1024) {
          throw new Error(
            `${file.name}: limite de 25 MB por arquivo. Para vídeos maiores, adicione um link de drive/streaming.`,
          );
        }
        if (total + file.size > 100 * 1024 * 1024) {
          throw new Error(
            'Limite total de 100 MB atingido. Adicione links para arquivos maiores.',
          );
        }
        if (
          !/\.(pdf|docx?|pptx?|png|jpe?g|webp|svg|gif|mp3|wav|m4a|ogg|mp4|webm|mov|ttf|otf|woff2?|zip)$/i.test(
            file.name,
          )
        ) {
          throw new Error(
            'Formato não suportado. Use documentos (PDF/DOC), imagens, fontes, áudio (MP3/WAV), vídeo (MP4) ou ZIP.',
          );
        }
        await putAsset({
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          createdAt: new Date().toISOString(),
          file,
          description: description || 'Asset de identidade e ecossistema',
        });
        total += file.size;
      }
      setDescription('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao salvar arquivos.');
    } finally {
      try {
        await refresh();
      } catch {
        setError('Falha no armazenamento dos assets.');
      }
      setBusy(false);
    }
  }

  async function addLink() {
    const url = safeWebUrl(link);
    if (!url) {
      setError('Informe um endereço completo começando com https://.');
      return;
    }
    setBusy(true);
    try {
      await putAsset({
        id: crypto.randomUUID(),
        name: description || new URL(url).hostname,
        type: 'link',
        size: 0,
        createdAt: new Date().toISOString(),
        url,
        description: description || 'Site ou ecossistema digital',
      });
      setLink('');
      setDescription('');
      setError('');
      await refresh();
    } catch {
      setError('Não foi possível salvar o link.');
    }
    setBusy(false);
  }

  async function archive(a: BrandAsset) {
    try {
      await putAsset({ ...a, archived: !a.archived });
      await refresh();
    } catch {
      setError('Não foi possível atualizar o asset.');
    }
  }

  const activeAssets = assets.filter((a) => !a.archived);

  return (
    <section className="assets-panel">
      <div className="section-heading">
        <div>
          <h2>Assets, Identidade Visual & Ecossistema</h2>
          <p>
            Suba os documentos de Identidade Visual, jingles/músicas, vídeos
            promocionais, site e links que amparam a marca.
          </p>
        </div>
        <span className="asset-counter-badge">{activeAssets.length} assets ativos</span>
      </div>

      <div className="asset-preset-tags">
        <span className="preset-label">Atalhos de descrição:</span>
        {[
          'Manual de Identidade Visual',
          'Jingle / Assinatura Sonora',
          'Vídeo Promocional da Marca',
          'Site Oficial / Landing Page',
          'Pacote de Logos & Tipografia',
        ].map((tag) => (
          <button
            key={tag}
            type="button"
            className="preset-tag-btn"
            onClick={() => setDescription(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="asset-inputs-box">
        <label htmlFor="asset-desc-input" className="asset-label">
          <span>Identificação ou papel do asset</span>
          <Input
            id="asset-desc-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex.: Manual de Identidade Visual, Jingle 30s, Vídeo Manifesto, Site principal"
          />
        </label>

        <div className="upload-and-link-grid">
          <label className="upload-box">
            <Upload size={22} />
            <div className="upload-box-text">
              <strong>Subir Arquivos da Marca</strong>
              <span>
                PDF, Word, Apresentações, MP3, WAV, MP4, PNG, SVG ou ZIP (até 25 MB)
              </span>
            </div>
            <input
              type="file"
              multiple
              disabled={busy}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.svg,.gif,.mp3,.wav,.m4a,.ogg,.mp4,.webm,.mov,.ttf,.otf,.woff,.woff2,.zip"
              onChange={(e) => {
                void upload(e.target.files);
                e.target.value = '';
              }}
            />
          </label>

          <div className="link-entry-card">
            <div className="link-entry-title">
              <Globe size={18} />
              <strong>Adicionar Site ou Link Externo</strong>
            </div>
            <p>Para site no ar, link do Figma, Drive, YouTube ou Loom.</p>
            <div className="link-input-row">
              <Input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://seu-site.com.br"
              />
              <Button
                variant="outline"
                className="action-button"
                onClick={addLink}
                disabled={busy || !link}
              >
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {busy && <div className="asset-loading-bar">Processando e salvando assets no navegador…</div>}
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}

      <div className="asset-list">
        {assets.length === 0 ? (
          <div className="empty-assets-state">
            <Layers size={32} strokeWidth={1.2} />
            <p>Nenhum asset adicionado ainda.</p>
            <small>
              Adicione seu manual de identidade visual, jingle, vídeo ou links
              para que a marca represente com fidelidade o seu ecossistema.
            </small>
          </div>
        ) : (
          assets.map((a) => (
            <article
              key={a.id}
              className={`asset-item ${a.archived ? 'archived' : ''}`}
            >
              <div className="asset-main-info">
                <span className="asset-icon-wrapper">
                  <AssetIcon type={a.type} />
                </span>
                <div>
                  <strong>{a.name}</strong>
                  <p>
                    {a.description || a.type}{' '}
                    {a.size ? `· ${(a.size / 1024 / 1024).toFixed(1)} MB` : ''}
                    {a.archived ? ' · Arquivado' : ''}
                  </p>
                </div>
              </div>

              {!a.archived && <AssetPreview asset={a} />}

              <div className="asset-actions">
                {a.file && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadBlob(a.file!, a.name)}
                  >
                    <Download size={14} />
                    Baixar
                  </Button>
                )}
                {a.url && safeWebUrl(a.url) && (
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="asset-link-btn"
                  >
                    Visitar <ExternalLink size={14} />
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => archive(a)}
                >
                  {a.archived ? <RotateCcw size={14} /> : <Archive size={14} />}
                  {a.archived ? 'Restaurar' : 'Arquivar'}
                </Button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
