'use client';
import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  Focus,
  Package,
  Fingerprint,
  Gem,
  Megaphone,
  Layers,
  TrendingUp,
  Download,
  Check,
  CheckCheck,
  ChevronRight,
  BookOpen,
  CloudOff,
  PanelLeft,
  Compass,
  FileText,
  Settings,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BrandWorkshop } from './brand-workshop';
import { Textarea } from '@/components/ui/textarea';
import { TrafficCalculator } from './traffic';
import { Advisor, type Connection } from './advisor';
import { SettingsView } from './settings-view';
import {
  stages,
  stageHashes,
  stageProgress,
  totalProgress,
  exportPlan,
  type Plan,
} from './model';
const icons = [Focus, Package, Fingerprint, Megaphone, Layers, TrendingUp, Gem];
const PLAN_VIEW = stages.length;
const SETTINGS_VIEW = PLAN_VIEW + 1;
const KEY = 'brandcash-plan-v1';
function Dashboard() {
  const [plan, setPlan] = useState<Plan>({});
  const [view, setView] = useState(-1);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState('Salvo neste navegador');
  const [notice, setNotice] = useState('');
  const [connection, setConnection] = useState<Connection>({
    provider: 'openai',
    key: '',
    model: 'gpt-4o-mini',
  });
  const { setOpenMobile, toggleSidebar } = useSidebar();
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const value = JSON.parse(raw);
          if (value && typeof value === 'object' && !Array.isArray(value))
            setPlan(
              Object.fromEntries(
                Object.entries(value).filter(([, v]) => typeof v === 'string'),
              ) as Plan,
            );
        }
        setStatus('Salvo neste navegador');
      } catch {
        setStatus('Não foi possível carregar o plano');
      }
      setReady(true);
    });
    const change = () => {
      const h = window.location.hash.slice(1);
      if (h === 'configuracoes' || h === 'settings') {
        setView(SETTINGS_VIEW);
      } else if (h === 'plano') {
        setView(PLAN_VIEW);
      } else {
        const index = stageHashes.indexOf(h);
        setView(index);
      }
    };
    queueMicrotask(change);
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  function update(key: string, value: string) {
    const next = { ...plan, [key]: value };
    setPlan(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      setStatus('Salvo neste navegador');
    } catch {
      setStatus('Não foi possível salvar. Exporte seu plano.');
    }
  }
  function navigate(v: number) {
    setView(v);
    window.location.hash =
      v === -1
        ? 'visao-geral'
        : v === PLAN_VIEW
          ? 'plano'
          : v === SETTINGS_VIEW
            ? 'configuracoes'
            : stageHashes[v];
    setOpenMobile(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function handleResetPlan() {
    setPlan({});
    try {
      localStorage.removeItem(KEY);
    } catch {}
    navigate(-1);
    setNotice('Plano redefinido.');
    setTimeout(() => setNotice(''), 3000);
  }
  function handleImportPlan(newPlan: Plan) {
    setPlan(newPlan);
    try {
      localStorage.setItem(KEY, JSON.stringify(newPlan));
    } catch {}
    setNotice('Plano importado com sucesso.');
    setTimeout(() => setNotice(''), 3000);
  }
  const progress = totalProgress(plan),
    done = stages.filter((_, i) => stageProgress(plan, i) === 100).length,
    next = Math.max(
      0,
      stages.findIndex((_, i) => stageProgress(plan, i) < 100),
    );
  function download() {
    const url = URL.createObjectURL(
      new Blob([exportPlan(plan)], { type: 'text/markdown;charset=utf-8' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brandcash-meu-plano.md';
    a.click();
    URL.revokeObjectURL(url);
    setNotice('Seu plano foi exportado.');
    setTimeout(() => setNotice(''), 3500);
  }
  return (
    <>
      <Sidebar className="brand-sidebar">
        <SidebarHeader className="brand-head">
          <a
            href="#visao-geral"
            onClick={() => navigate(-1)}
            className="wordmark"
          >
            brandcash
            <span className="brand-dot" />
          </a>
          <span className="brand-caption">NEGÓCIO ENXUTO. MARCA RENTÁVEL.</span>
        </SidebarHeader>
        <SidebarContent className="side-content">
          <div className="workspace-label">
            <span className="workspace-icon">B</span>
            <div>
              Meu negócio<small>Plano de implementação</small>
            </div>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="nav-item"
                isActive={view === -1}
                onClick={() => navigate(-1)}
              >
                <LayoutDashboard />
                <span>Visão geral</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <p className="nav-label">CONSTRUA SEU NEGÓCIO</p>
          <SidebarMenu>
            {stages.map((s, i) => {
              const Icon = icons[i];
              return (
                <SidebarMenuItem key={s.name}>
                  <SidebarMenuButton
                    className="nav-item"
                    isActive={view === i}
                    onClick={() => navigate(i)}
                  >
                    <Icon />
                    <span>{s.name}</span>
                    {stageProgress(plan, i) === 100 ? (
                      <Check className="nav-count" />
                    ) : (
                      <span className="nav-count">0{i + 1}</span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
          <div className="nav-separator" />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="nav-item"
                isActive={view === PLAN_VIEW}
                onClick={() => navigate(PLAN_VIEW)}
              >
                <FileText />
                <span>Meu plano</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="nav-item"
                isActive={view === SETTINGS_VIEW}
                onClick={() => navigate(SETTINGS_VIEW)}
              >
                <Settings />
                <span>Configurações</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="side-footer">
          <div className="side-progress">
            <div>
              <span>Sua construção</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} aria-label="Progresso total" />
            <small>
              {done} de {stages.length} etapas preenchidas
            </small>
          </div>
          <button
            className={`user-profile-tile ${view === SETTINGS_VIEW ? 'active' : ''}`}
            onClick={() => navigate(SETTINGS_VIEW)}
            type="button"
            title="Abrir Perfil & Configurações"
          >
            <div className="user-avatar">
              {(plan.founder_name?.[0] || plan.business_name?.[0] || 'B').toUpperCase()}
            </div>
            <div className="user-info">
              <strong>{plan.founder_name || 'Fundador'}</strong>
              <small>{plan.business_name || 'Configurações'}</small>
            </div>
            <Settings size={15} className="tile-settings-icon" />
          </button>
        </SidebarFooter>
      </Sidebar>
      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              onClick={toggleSidebar}
              aria-label="Abrir ou fechar menu"
              className="menu-toggle"
            >
              <PanelLeft size={19} />
            </button>
            <span>Meu negócio</span>
            <ChevronRight size={14} />
            <strong>
              {view === -1
                ? 'Visão geral'
                : view === PLAN_VIEW
                  ? 'Meu plano'
                  : view === SETTINGS_VIEW
                    ? 'Perfil & Configurações'
                    : stages[view]?.name}
            </strong>
          </div>
          <output className="save-state">
            <span className="save-dot" />
            {status}
          </output>
        </header>
        <div className="content">
          {view === -1 ? (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">SEU NEGÓCIO, EM CONSTRUÇÃO</span>
                  <h1>
                    Menos dispersão.
                    <br />
                    Mais direção.
                  </h1>
                  <p>
                    Uma etapa de cada vez. Um negócio que faz sentido para você.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="action-button"
                  onClick={download}
                >
                  <Download />
                  Exportar plano
                </Button>
              </div>
              <div className="overview-grid">
                <section className="focus-panel">
                  <div className="panel-top">
                    <span className="eyebrow">
                      {done === stages.length
                        ? 'PRÓXIMO PASSO'
                        : 'SEU FOCO AGORA'}
                    </span>
                    <span className="tiny-badge">
                      {done === stages.length
                        ? 'Plano preenchido'
                        : `Etapa 0${next + 1} de 0${stages.length}`}
                    </span>
                  </div>
                  <div className="focus-body">
                    <span className="focus-symbol">
                      <Compass size={30} strokeWidth={1.2} />
                    </span>
                    <div>
                      <h2>
                        {done === stages.length
                          ? 'Hora de colocar em prática.'
                          : stages[next].tag + '.'}
                      </h2>
                      <p>
                        {done === stages.length
                          ? 'Revise suas decisões e leve sua oferta ao mercado.'
                          : stages[next].desc}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="action-button"
                    onClick={() =>
                      navigate(done === stages.length ? PLAN_VIEW : next)
                    }
                    disabled={!ready}
                  >
                    {done === stages.length
                      ? 'Revisar meu plano'
                      : progress
                        ? 'Continuar construção'
                        : 'Definir minha especialidade'}
                    <ArrowUpRight />
                  </Button>
                </section>
                <section className="progress-panel">
                  <div className="panel-top">
                    <span className="eyebrow">DA IDEIA À OPERAÇÃO</span>
                    <TrendingUp size={19} />
                  </div>
                  <div className="progress-number">
                    {progress}
                    <span>%</span>
                  </div>
                  <Progress value={progress} aria-label="Plano preenchido" />
                  <div className="progress-caption">
                    <span>do seu plano preenchido</span>
                    <strong>
                      {done}/{stages.length} etapas
                    </strong>
                  </div>
                </section>
              </div>
              <div className="section-heading">
                <div>
                  <h2>Seu caminho de implementação</h2>
                  <p>Sete etapas conectadas. Comece pelo essencial.</p>
                </div>
                <span className="subtle-label">MÉTODO BRANDCASH</span>
              </div>
              <div className="stage-grid">
                {stages.map((s, i) => {
                  const Icon = icons[i],
                    pct = stageProgress(plan, i);
                  return (
                    <button
                      className={
                        'stage-card ' +
                        (i === next && done < stages.length ? 'current' : '')
                      }
                      key={s.name}
                      onClick={() => navigate(i)}
                    >
                      <div className="stage-top">
                        <span className="stage-icon">
                          <Icon size={21} strokeWidth={1.5} />
                        </span>
                        <span className="stage-number">0{i + 1}</span>
                      </div>
                      <h3>{s.name}</h3>
                      <p>{s.desc}</p>
                      <div className="stage-bottom">
                        <span
                          className={
                            'stage-status ' + (pct === 100 ? 'complete' : '')
                          }
                        >
                          {pct === 100 ? (
                            <Check size={13} />
                          ) : (
                            <span className="status-dot" />
                          )}
                          {pct === 100
                            ? 'Preenchida'
                            : pct > 0
                              ? 'Em construção'
                              : i === next
                                ? 'Comece aqui'
                                : 'A construir'}
                        </span>
                        <ArrowUpRight size={18} />
                      </div>
                    </button>
                  );
                })}
              </div>
              <section className="principle">
                <span className="principle-icon">
                  <Focus size={22} />
                </span>
                <div>
                  <strong>Uma habilidade. Uma oferta. Um processo.</strong>
                  <p>
                    O foco reduz a complexidade e abre espaço para entregar
                    melhor.
                  </p>
                </div>
                <span className="principle-index">01 — 07</span>
              </section>
            </>
          ) : view === PLAN_VIEW ? (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">AS PEÇAS DO SEU NEGÓCIO</span>
                  <h1>Meu plano.</h1>
                  <p>Suas decisões, reunidas em um só lugar.</p>
                </div>
                <Button className="action-button" onClick={download}>
                  <Download />
                  Exportar plano
                </Button>
              </div>
              <div className="plan-summary">
                {stages.map((s, i) => (
                  <section className="summary-section" key={s.name}>
                    <div className="section-heading">
                      <h2>
                        <span>0{i + 1}</span> {s.name}
                      </h2>
                      <Button variant="ghost" onClick={() => navigate(i)}>
                        Editar
                        <ArrowUpRight />
                      </Button>
                    </div>
                    {s.fields.map((f) => (
                      <div className="summary-field" key={f[0]}>
                        <strong>{f[1]}</strong>
                        <p className={!plan[f[0]] ? 'unfilled' : ''}>
                          {plan[f[0]] || 'A definir'}
                        </p>
                      </div>
                    ))}
                  </section>
                ))}
              </div>
              <Advisor
                plan={plan}
                update={update}
                stage={6}
                navigate={navigate}
                connection={connection}
                setConnection={setConnection}
              />
            </>
          ) : view === SETTINGS_VIEW ? (
            <SettingsView
              plan={plan}
              update={update}
              connection={connection}
              setConnection={setConnection}
              onResetPlan={handleResetPlan}
              onImportPlan={handleImportPlan}
            />
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">ETAPA 0{view + 1} / 07</span>
                  <h1>{stages[view].name}.</h1>
                  <p>{stages[view].desc}</p>
                </div>
                <span className="stage-page-progress">
                  {stageProgress(plan, view)}% preenchido
                </span>
              </div>
              <div className="editor-grid">
                <section className="editor-panel">
                  <div className="editor-title">
                    <h2>{stages[view].tag}</h2>
                    <span>{stages[view].fields.length} decisões</span>
                  </div>
                  {view === 6 ? (
                    <BrandWorkshop plan={plan} update={update} ready={ready} />
                  ) : view === 4 ? (
                    <div className="delivery-and-traffic-container">
                      <div className="fields">
                        {stages[4].fields.slice(0, 4).map((f, i) => (
                          <div className="field" key={f[0]}>
                            <label htmlFor={f[0]}>
                              <span>0{i + 1}</span>
                              {f[1]}
                              {plan[f[0]]?.trim() && <Check size={16} />}
                            </label>
                            <p id={f[0] + '-help'}>{f[2]}</p>
                            <Textarea
                              id={f[0]}
                              aria-describedby={f[0] + '-help'}
                              placeholder={f[3]}
                              value={plan[f[0]] || ''}
                              onChange={(e) => update(f[0], e.target.value)}
                              disabled={!ready}
                              className="plan-input"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="traffic-module-section">
                        <div className="traffic-module-banner">
                          <div className="traffic-module-icon">
                            <Megaphone size={20} />
                          </div>
                          <div>
                            <span className="eyebrow">MÓDULO ESTRUTURA DE TRÁFEGO (ADS)</span>
                            <h3>Aquisição & Demanda Previsível</h3>
                            <p>
                              Definição de como o tráfego pago (Ads) vai funcionar para
                              alimentar sua entrega de forma matematicamente viável.
                            </p>
                          </div>
                        </div>

                        <TrafficCalculator
                          onApply={(summary) => {
                            const current = plan.ads_budget || '';
                            update(
                              'ads_budget',
                              current
                                ? current + '\n\n---\n' + summary
                                : summary,
                            );
                          }}
                        />

                        <div className="fields">
                          {stages[4].fields.slice(4).map((f, i) => (
                            <div className="field" key={f[0]}>
                              <label htmlFor={f[0]}>
                                <span>0{i + 5}</span>
                                {f[1]}
                                {plan[f[0]]?.trim() && <Check size={16} />}
                              </label>
                              <p id={f[0] + '-help'}>{f[2]}</p>
                              <Textarea
                                id={f[0]}
                                aria-describedby={f[0] + '-help'}
                                placeholder={f[3]}
                                value={plan[f[0]] || ''}
                                onChange={(e) => update(f[0], e.target.value)}
                                disabled={!ready}
                                className="plan-input"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="fields">
                      {stages[view].fields.map((f, i) => (
                        <div className="field" key={f[0]}>
                          <label htmlFor={f[0]}>
                            <span>0{i + 1}</span>
                            {f[1]}
                            {plan[f[0]]?.trim() && <Check size={16} />}
                          </label>
                          <p id={f[0] + '-help'}>{f[2]}</p>
                          <Textarea
                            id={f[0]}
                            aria-describedby={f[0] + '-help'}
                            placeholder={f[3]}
                            value={plan[f[0]] || ''}
                            onChange={(e) => update(f[0], e.target.value)}
                            disabled={!ready}
                            className="plan-input"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="editor-actions">
                    <Button
                      variant="outline"
                      className="action-button"
                      onClick={() => navigate(view === 0 ? -1 : view - 1)}
                    >
                      <ArrowLeft />
                      Voltar
                    </Button>
                    <Button
                      className="action-button"
                      onClick={() =>
                        navigate(
                          view === stages.length - 1 ? PLAN_VIEW : view + 1,
                        )
                      }
                    >
                      {view === stages.length - 1
                        ? 'Ver meu plano'
                        : 'Próxima etapa'}
                      <ArrowRight />
                    </Button>
                  </div>

                  <Advisor
                    plan={plan}
                    update={update}
                    stage={view}
                    navigate={navigate}
                    connection={connection}
                    setConnection={setConnection}
                  />
                </section>
                <aside className="editor-aside">
                  <BookOpen size={22} />
                  <h3>Clareza antes de volume.</h3>
                  <p>
                    Escreva uma primeira versão. Você pode revisar cada decisão
                    conforme aprende com seus clientes.
                  </p>
                  <div className="aside-divider" />
                  <span className="eyebrow">O QUE VOCÊ JÁ DEFINIU</span>
                  <h4>Sua especialidade</h4>
                  <p>
                    {plan.skill || 'Sua habilidade principal aparecerá aqui.'}
                  </p>
                  <h4>Sua oferta</h4>
                  <p>
                    {plan.offer ||
                      'A proposta que conecta seu conhecimento ao resultado do cliente.'}
                  </p>
                  <h4>Sua Big Idea</h4>
                  <p>
                    {plan.brand_idea ||
                      'Defina a ideia central na etapa Marca.'}
                  </p>
                  <h4>Sua proeza</h4>
                  <p>
                    {plan.brand_mechanism ||
                      'Dê forma ao mecanismo que sustenta sua promessa.'}
                  </p>
                  <div className="aside-note">
                    <CheckCheck size={17} />
                    <span>
                      O preenchimento é salvo automaticamente neste navegador.
                    </span>
                  </div>
                </aside>
              </div>
            </>
          )}
          <footer className="footer">
            <span className="footer-brand">
              brandcash
              <span />
            </span>
            <span>Negócio enxuto, marca rentável.</span>
            <span className="footer-right">Da clareza à escala.</span>
          </footer>
        </div>
      </main>
      {notice && (
        <output className="toast">
          <Check size={18} />
          {notice}
        </output>
      )}
    </>
  );
}
export default function Page() {
  return (
    <SidebarProvider
      style={{ '--sidebar-width': '248px' } as React.CSSProperties}
    >
      <Dashboard />
    </SidebarProvider>
  );
}
