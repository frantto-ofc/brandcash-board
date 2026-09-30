'use client';

import { useState, useEffect, useRef } from 'react';
import {
  User,
  Sparkles,
  Sliders,
  Database,
  Save,
  Check,
  Upload,
  Download,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Camera,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { listAssets, type BrandAsset } from './asset-store';
import { stages, type Plan } from './model';
import type { Connection } from './advisor';

export function SettingsView({
  plan,
  update,
  connection,
  setConnection,
  onResetPlan,
  onImportPlan,
}: {
  plan: Plan;
  update: (k: string, v: string) => void;
  connection: Connection;
  setConnection: (c: Connection) => void;
  onResetPlan: () => void;
  onImportPlan: (newPlan: Plan) => void;
}) {
  const [tab, setTab] = useState('profile');
  const [showKey, setShowKey] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Carregar assets para diagnóstico de armazenamento
  useEffect(() => {
    listAssets().then(setAssets).catch(() => {});
  }, []);

  function handleProfilePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Escolha um arquivo de imagem.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('A foto deve ter no máximo 2 MB.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      update('profile_photo', String(reader.result || ''));
      notify('Foto do perfil atualizada!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function notify(msg: string) {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(''), 3000);
  }

  // Backup completo em JSON
  function handleExportBackup() {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      plan,
      connection: {
        provider: connection.provider,
        model: connection.model,
      },
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brandcash-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Backup completo exportado com sucesso!');
  }

  function handleImportBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && json.plan && typeof json.plan === 'object') {
          onImportPlan(json.plan);
          if (json.connection) {
            setConnection({
              ...connection,
              provider: json.connection.provider || connection.provider,
              model: json.connection.model || connection.model,
            });
          }
          notify('Backup importado com sucesso!');
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch {
        alert('Erro ao ler arquivo de backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // Cálculos de armazenamento
  const planSizeKB = (JSON.stringify(plan).length / 1024).toFixed(1);
  const assetsTotalMB = (
    assets.reduce((sum, a) => sum + (a.size || 0), 0) /
    (1024 * 1024)
  ).toFixed(2);
  const filledFieldsCount = stages
    .flatMap((s) => s.fields)
    .filter((f) => plan[f[0]]?.trim()).length;
  const totalFieldsCount = stages.flatMap((s) => s.fields).length;

  return (
    <div className="settings-container">
      <div className="page-heading">
        <div>
          <span className="eyebrow">PREFERÊNCIAS DO WORKSPACE</span>
          <h1>Perfil & Configurações</h1>
          <p>
            Gerencie sua identidade, conexões de IA, parâmetros operacionais e
            backup dos seus dados.
          </p>
        </div>
        {savedNotice && (
          <div className="saved-badge">
            <Check size={15} /> {savedNotice}
          </div>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="settings-tabs-wrapper">
        <TabsList className="settings-tabs-list">
          <TabsTrigger value="profile" className="settings-tab-trigger">
            <User size={16} />
            <span>Perfil & Negócio</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="settings-tab-trigger">
            <Sparkles size={16} />
            <span>Inteligência Artificial</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="settings-tab-trigger">
            <Sliders size={16} />
            <span>Operação & Moeda</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="settings-tab-trigger">
            <Database size={16} />
            <span>Dados & Backup</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: PERFIL & NEGÓCIO */}
        <TabsContent value="profile" className="settings-tab-content">
          <div className="settings-card">
            <div className="settings-card-header profile-card-header">
              <div>
                <h3>Identidade do Fundador & Marca</h3>
                <p>
                  Esses dados personalizam as exportações, orientações do agente e
                  propostas geradas no BrandCash.
                </p>
              </div>
              <div className="profile-photo-control">
                <div className="profile-photo-preview">
                  {plan.profile_photo ? (
                    <img src={plan.profile_photo} alt="Foto do perfil" />
                  ) : (
                    <span>{(plan.founder_name?.[0] || plan.business_name?.[0] || "B").toUpperCase()}</span>
                  )}
                  <span className="profile-photo-camera"><Camera size={12} /></span>
                </div>
                <div className="profile-photo-copy">
                  <strong>Foto do perfil</strong>
                  <div>
                    <button type="button" onClick={() => photoInputRef.current?.click()}>Trocar</button>
                    <span>·</span>
                    <button type="button" onClick={() => { update("profile_photo", ""); notify("Foto removida."); }} disabled={!plan.profile_photo}>Remover</button>
                  </div>
                </div>
                <input ref={photoInputRef} type="file" accept="image/*" hidden onChange={handleProfilePhoto} />
              </div>
            </div>

            <div className="settings-form-grid profile-settings-grid">
              <label htmlFor="settings-founder-name" className="settings-field">
                <span>Nome do Fundador / Estrategista</span>
                <Input
                  id="settings-founder-name"
                  value={plan.founder_name || ''}
                  onChange={(e) => update('founder_name', e.target.value)}
                  placeholder="Ex.: Eric Frantto"
                />
              </label>

              <label htmlFor="settings-business-name" className="settings-field">
                <span>Nome do Negócio / Operação</span>
                <Input
                  id="settings-business-name"
                  value={plan.business_name || ''}
                  onChange={(e) => update('business_name', e.target.value)}
                  placeholder="Ex.: Frantto Consulting"
                />
              </label>

              <label htmlFor="settings-contact-email" className="settings-field">
                <span>E-mail Comercial</span>
                <Input
                  id="settings-contact-email"
                  type="email"
                  value={plan.contact_email || ''}
                  onChange={(e) => update('contact_email', e.target.value)}
                  placeholder="contato@seunegocio.com.br"
                />
              </label>

              <label htmlFor="settings-contact-phone" className="settings-field">
                <span>WhatsApp de Atendimento</span>
                <Input
                  id="settings-contact-phone"
                  value={plan.contact_phone || ''}
                  onChange={(e) => update('contact_phone', e.target.value)}
                  placeholder="+55 11 99999-9999"
                />
              </label>

              <label htmlFor="settings-social-handle" className="settings-field">
                <span>Instagram / Perfil Social</span>
                <Input
                  id="settings-social-handle"
                  value={plan.social_handle || ''}
                  onChange={(e) => update('social_handle', e.target.value)}
                  placeholder="@seunegocio"
                />
              </label>

              <label htmlFor="settings-website-url" className="settings-field">
                <span>Site Oficial / Landing Page</span>
                <Input
                  id="settings-website-url"
                  type="url"
                  value={plan.website_url || ''}
                  onChange={(e) => update('website_url', e.target.value)}
                  placeholder="https://seunegocio.com.br"
                />
              </label>
              <label htmlFor="settings-founder-role" className="settings-field">
                <span>Cargo ou Atuação</span>
                <Input
                  id="settings-founder-role"
                  value={plan.founder_role || ''}
                  onChange={(e) => update('founder_role', e.target.value)}
                  placeholder="Ex.: Estrategista de marca"
                />
              </label>



              <label htmlFor="settings-founder-bio" className="settings-field full-width">
                <span>Assinatura Institucional / Bio Curta</span>
                <Textarea
                  id="settings-founder-bio"
                  value={plan.founder_bio || ''}
                  onChange={(e) => update('founder_bio', e.target.value)}
                  placeholder="Ex.: Ajudo profissionais independentes a transformarem conhecimento em marcas rentáveis com processos enxutos."
                  rows={3}
                />
              </label>
            </div>

            <div className="settings-card-footer">
              <Button
                variant="outline"
                size="sm"
                onClick={() => notify('Perfil salvo com sucesso!')}
              >
                <Save size={14} /> Salvar Alterações
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ABA 2: INTELIGÊNCIA ARTIFICIAL */}
        <TabsContent value="ai" className="settings-tab-content">
          <div className="settings-card">
            <div className="settings-card-header">
              <h3>Conexão de IA & Agente Orientador</h3>
              <p>
                Configure a inteligência que avalia cada etapa do seu negócio e
                gera o pacote de Skill. A chave permanece segura no seu
                navegador.
              </p>
            </div>

            <div className="settings-form-grid">
              <div className="settings-field full-width">
                <span>Provedor de Inteligência Artificial</span>
                <RadioGroup
                  value={connection.provider}
                  onValueChange={(v) =>
                    setConnection({
                      ...connection,
                      provider: v as Connection['provider'],
                      model:
                        v === 'openai'
                          ? 'gpt-4o-mini'
                          : 'claude-3-5-sonnet-latest',
                    })
                  }
                  className="settings-provider-group"
                >
                  <label className="provider-card">
                    <RadioGroupItem value="openai" />
                    <div>
                      <strong>OpenAI</strong>
                      <small>GPT-4o, GPT-4o-mini e compatíveis</small>
                    </div>
                  </label>
                  <label className="provider-card">
                    <RadioGroupItem value="anthropic" />
                    <div>
                      <strong>Anthropic Claude</strong>
                      <small>Claude 3.5 Sonnet, Haiku e compatíveis</small>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              <div className="settings-field full-width">
                <label htmlFor="settings-api-key">
                  <span>Chave de API ({connection.provider === 'openai' ? 'OpenAI' : 'Claude'})</span>
                </label>
                <div className="api-key-input-wrapper">
                  <Input
                    id="settings-api-key"
                    type={showKey ? 'text' : 'password'}
                    value={connection.key}
                    onChange={(e) =>
                      setConnection({ ...connection, key: e.target.value })
                    }
                    placeholder="Cole sua chave sk-..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="toggle-key-btn"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </Button>
                </div>
                <small className="field-hint">
                  <ShieldCheck size={13} /> Chave mantida apenas nesta sessão
                  do navegador para sua segurança.
                </small>
              </div>

              <label htmlFor="settings-ai-model" className="settings-field">
                <span>ID do Modelo</span>
                <Input
                  id="settings-ai-model"
                  value={connection.model}
                  onChange={(e) =>
                    setConnection({ ...connection, model: e.target.value })
                  }
                  placeholder="Ex.: gpt-4o-mini, claude-3-5-sonnet-latest"
                />
              </label>

              <label htmlFor="settings-ai-rigor" className="settings-field">
                <span>Tom & Rigor do Orientador</span>
                <select
                  id="settings-ai-rigor"
                  value={plan.ai_rigor || 'balanced'}
                  onChange={(e) => update('ai_rigor', e.target.value)}
                  className="settings-select"
                >
                  <option value="balanced">Equilibrado & Estratégico (Recomendado)</option>
                  <option value="critical">Cirúrgico & Crítico (Caçador de falhas)</option>
                  <option value="didactic">Didático & Encorajador (Passo a passo)</option>
                </select>
              </label>
            </div>

            <div className="settings-card-footer">
              <Button
                variant="outline"
                size="sm"
                onClick={() => notify('Configurações de IA salvas!')}
              >
                <Save size={14} /> Salvar Conexão
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ABA 3: OPERAÇÃO & MOEDA */}
        <TabsContent value="preferences" className="settings-tab-content">
          <div className="settings-card">
            <div className="settings-card-header">
              <h3>Parâmetros Operacionais & Financeiros</h3>
              <p>
                Defina métricas financeiras padrão usadas no simulador de
                tráfego e nas metas do negócio enxuto.
              </p>
            </div>

            <div className="settings-form-grid">
              <label htmlFor="settings-currency" className="settings-field">
                <span>Moeda Padrão</span>
                <select
                  id="settings-currency"
                  value={plan.currency || 'BRL'}
                  onChange={(e) => update('currency', e.target.value)}
                  className="settings-select"
                >
                  <option value="BRL">Real Brasileiro (R$)</option>
                  <option value="USD">Dólar Americano ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </label>

              <label htmlFor="settings-revenue-goal" className="settings-field">
                <span>Meta de Faturamento Mensal (R$)</span>
                <Input
                  id="settings-revenue-goal"
                  type="number"
                  value={plan.revenue_goal || ''}
                  onChange={(e) => update('revenue_goal', e.target.value)}
                  placeholder="Ex.: 30000"
                />
              </label>

              <label htmlFor="settings-tax-rate" className="settings-field">
                <span>Alíquota Média de Impostos / Taxas (%)</span>
                <Input
                  id="settings-tax-rate"
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={plan.tax_rate || ''}
                  onChange={(e) => update('tax_rate', e.target.value)}
                  placeholder="Ex.: 6 (Simples Nacional)"
                />
              </label>

              <label htmlFor="settings-max-clients" className="settings-field">
                <span>Capacidade Máxima de Clientes Simultâneos</span>
                <Input
                  id="settings-max-clients"
                  type="number"
                  min="1"
                  value={plan.max_clients || ''}
                  onChange={(e) => update('max_clients', e.target.value)}
                  placeholder="Ex.: 10"
                />
              </label>
            </div>

            <div className="settings-card-footer">
              <Button
                variant="outline"
                size="sm"
                onClick={() => notify('Parâmetros operacionais salvos!')}
              >
                <Save size={14} /> Salvar Parâmetros
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ABA 4: DADOS & BACKUP */}
        <TabsContent value="data" className="settings-tab-content">
          <div className="settings-card">
            <div className="settings-card-header">
              <h3>Diagnóstico de Armazenamento Local</h3>
              <p>
                Todos os dados e arquivos ficam armazenados diretamente no seu
                navegador de forma privada.
              </p>
            </div>

            <div className="storage-metrics-row">
              <div className="storage-metric-pill">
                <span className="metric-label">Decisões Preenchidas</span>
                <strong className="metric-val">
                  {filledFieldsCount} / {totalFieldsCount}
                </strong>
              </div>
              <div className="storage-metric-pill">
                <span className="metric-label">Volume do Plano</span>
                <strong className="metric-val">{planSizeKB} KB</strong>
              </div>
              <div className="storage-metric-pill">
                <span className="metric-label">Assets Salvos</span>
                <strong className="metric-val">{assets.length} arquivos</strong>
              </div>
              <div className="storage-metric-pill">
                <span className="metric-label">Espaço de Assets</span>
                <strong className="metric-val">{assetsTotalMB} MB</strong>
              </div>
            </div>

            <div className="settings-actions-group">
              <div className="backup-action-box">
                <div>
                  <strong>Exportar Backup Completo (JSON)</strong>
                  <p>
                    Gera um arquivo com todas as decisões, respostas,
                    parâmetros e dados de auditoria do negócio.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportBackup}
                >
                  <Download size={14} /> Exportar JSON
                </Button>
              </div>

              <div className="backup-action-box">
                <div>
                  <strong>Restaurar / Importar Backup (JSON)</strong>
                  <p>
                    Recupere um negócio salvo anteriormente a partir do seu
                    arquivo JSON.
                  </p>
                </div>
                <label className="import-file-btn">
                  <Upload size={14} /> Importar JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                  />
                </label>
              </div>
            </div>

            <div className="danger-zone-card">
              <div className="danger-zone-header">
                <AlertTriangle size={18} />
                <div>
                  <h4>Zona de Risco: Redefinir Workspace</h4>
                  <p>
                    Limpa todas as respostas do plano atual deste navegador.
                    Certifique-se de exportar um backup antes.
                  </p>
                </div>
              </div>

              {confirmReset ? (
                <div className="confirm-reset-row">
                  <span>Tem certeza absoluta que deseja apagar os dados?</span>
                  <div className="confirm-btns">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        onResetPlan();
                        setConfirmReset(false);
                        notify('Workspace redefinido com sucesso.');
                      }}
                    >
                      Sim, Apagar Tudo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmReset(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="danger-btn"
                  onClick={() => setConfirmReset(true)}
                >
                  <Trash2 size={14} /> Redefinir Dados do Plano
                </Button>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
