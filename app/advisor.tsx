'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Settings,
  ArrowRight,
  Download,
  Check,
  History,
  AlertCircle,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { stages, type Plan } from './model';
import {
  checklist,
  parseAudit,
  snapshot,
  businessData,
  type Review,
  type Audit,
  type Decision,
} from './review-model';
import { downloadSkill } from './skill-export';

export type Connection = {
  provider: 'openai' | 'anthropic';
  key: string;
  model: string;
};

export function Advisor({
  plan,
  update,
  stage,
  navigate,
  connection,
  setConnection,
}: {
  plan: Plan;
  update: (k: string, v: string) => void;
  stage: number;
  navigate: (n: number) => void;
  connection: Connection;
  setConnection: (c: Connection) => void;
}) {
  const [settings, setSettings] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const currentPlan = useRef(plan);
  useEffect(() => {
    currentPlan.current = plan;
  }, [plan]);

  const audit = parseAudit(plan.__audit);
  const stageReview = [...audit.reviews].reverse().find((r) => r.scope === stage);
  const finalReview = [...audit.reviews].reverse().find((r) => r.scope === -1);
  const isFinalStage = stage === 6;
  const report = isFinalStage ? finalReview || stageReview : stageReview;

  const stale = Boolean(report && report.snapshot !== snapshot(plan));
  const closed = Boolean(
    report && report.scope === -1 && audit.closedReview === report.id && !stale,
  );
  const unresolved =
    report?.issues.filter(
      (i) =>
        !audit.decisions.some(
          (d) =>
            d.reviewId === report.id &&
            d.issueId === i.id &&
            d.action === 'ignorar',
        ),
    ) || [];

  function persist(next: Audit) {
    update('__audit', JSON.stringify(next));
  }

  async function evaluate(scope: number, ai: boolean) {
    setBusy(true);
    setError('');
    const original = plan;
    try {
      let review: Review;
      if (ai) {
        const response = await fetch('/api/review', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-provider-key': connection.key,
          },
          body: JSON.stringify({
            provider: connection.provider,
            model: connection.model,
            scope,
            plan: businessData(original),
          }),
          signal: AbortSignal.timeout(55000),
        });
        const data = (await response.json()) as {
          error?: string;
          review?: Review;
        };
        if (!response.ok)
          throw new Error(data.error || 'Falha na avaliação estratégica.');
        review = data.review!;
        if (!review || !Array.isArray(review.issues))
          throw new Error('Resposta inválida do agente.');
      } else {
        review = checklist(original, scope);
      }
      const latest = parseAudit(currentPlan.current.__audit);
      persist({
        ...latest,
        reviews: [...latest.reviews, review],
        closedReview: undefined,
      });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Não foi possível concluir a avaliação.',
      );
    }
    setBusy(false);
  }

  function decide(issueId: string, action: 'ajustar' | 'ignorar') {
    if (!report) return;
    const issue = report.issues.find((i) => i.id === issueId);
    const decision: Decision = {
      reviewId: report.id,
      issueId,
      action,
      at: new Date().toISOString(),
      note: issue ? `${issue.title}: ${issue.suggestion}` : '',
    };
    persist({ ...audit, decisions: [...audit.decisions, decision] });
    if (action === 'ajustar' && issue) {
      navigate(issue.stage);
      setTimeout(() => {
        const el = document.getElementById(issue.field);
        if (el) {
          el.focus();
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }, 150);
    }
  }

  function close() {
    if (!report || stale || unresolved.length) return;
    persist({
      ...audit,
      closedReview: report.id,
      decisions: [
        ...audit.decisions,
        {
          reviewId: report.id,
          issueId: 'final',
          action: 'fechar',
          at: new Date().toISOString(),
          note: `Negócio fechado e consolidado com Nota de Chance de Sucesso: ${report.score}/100 (${report.engine}).`,
        },
      ],
    });
  }

  async function exportSkill() {
    if (!closed || !report) return;
    setBusy(true);
    setError('');
    try {
      await downloadSkill(plan, audit.decisions, report);
    } catch {
      setError(
        'Não foi possível gerar o pacote. Verifique os assets e tente novamente.',
      );
    }
    setBusy(false);
  }

  return (
    <section className="advisor-panel">
      <div className="advisor-header">
        <div className="advisor-header-title">
          <span className="advisor-eyebrow">
            <Brain size={15} />
            <span>AGENTE ORIENTADOR BRANDCASH</span>
          </span>
          <h2>
            {isFinalStage
              ? 'Auditoria Final & Chance de Sucesso'
              : `Avaliação da Etapa: ${stages[stage]?.name}`}
          </h2>
          <p className="helper">
            {isFinalStage
              ? 'A marca é a tradução definitiva do negócio. O orientador analisa a harmonia entre oferta, tráfego, entrega e ecossistema para estimar a chance de sucesso.'
              : 'O orientador avalia as decisões desta etapa em relação à estratégia global e recomenda melhorias concretas.'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="action-button connect-ai-btn"
          onClick={() => setSettings(true)}
        >
          <Settings size={15} />
          {connection.key ? 'IA Conectada' : 'Conectar IA'}
        </Button>
      </div>

      <div className="review-actions-bar">
        <Button
          className="action-button primary-eval-btn"
          disabled={busy || !connection.key || !connection.model}
          onClick={() => evaluate(isFinalStage ? -1 : stage, true)}
        >
          <Sparkles size={16} />
          {busy
            ? 'Avaliando…'
            : isFinalStage
              ? 'Avaliar negócio completo com IA'
              : 'Avaliar etapa com IA'}
        </Button>
        <Button
          variant="outline"
          className="action-button"
          disabled={busy}
          onClick={() => evaluate(isFinalStage ? -1 : stage, false)}
        >
          {isFinalStage ? 'Calcular Chance de Sucesso (Local)' : 'Diagnóstico Estratégico Local'}
        </Button>
      </div>

      {error && (
        <p role="alert" className="error-text">
          <AlertCircle size={15} /> {error}
        </p>
      )}

      {report && (
        <div className="review-result-card">
          <div className="review-score-banner">
            <div className="score-badge">
              <strong>{report.score}</strong>
              <small>/100</small>
            </div>
            <div className="score-details">
              <h3>
                {isFinalStage || report.scope === -1
                  ? 'Nota de Chance de Sucesso do Negócio'
                  : `Maturidade da Etapa ${stages[stage]?.name}`}
              </h3>
              <p>
                Avaliado por {report.engine} · {new Date(report.createdAt).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          {stale && (
            <div className="stale-warning-banner">
              O plano foi modificado após esta avaliação. Reavalie para atualizar a
              pontuação de chance de sucesso e liberar o fechamento.
            </div>
          )}

          <div className="review-summary-box">
            <p>{report.summary}</p>
          </div>

          <div className="review-issues-section">
            <div className="issues-header">
              <h4>Recomendações e Decisões ({report.issues.length})</h4>
              <small>
                Ajuste os pontos indicados ou marque como &quot;Ignorar&quot; para registrar a decisão no log.
              </small>
            </div>

            {report.issues.length === 0 ? (
              <div className="all-clean-state">
                <Check size={20} />
                <span>Excelente! Nenhuma incoerência ou lacuna crítica detectada.</span>
              </div>
            ) : (
              <div className="issues-list">
                {report.issues.map((i) => {
                  const ignored = audit.decisions.some(
                    (d) =>
                      d.reviewId === report.id &&
                      d.issueId === i.id &&
                      d.action === 'ignorar',
                  );
                  return (
                    <article
                      key={i.id}
                      className={`issue-item ${ignored ? 'ignored' : ''}`}
                    >
                      <div className="issue-content">
                        <span className="issue-stage-badge">
                          {stages[i.stage]?.name}
                        </span>
                        <h4>{i.title}</h4>
                        <p className="issue-reason">{i.reason}</p>
                        <p className="issue-suggestion">
                          <strong>Ajuste recomendado:</strong> {i.suggestion}
                        </p>
                      </div>
                      <div className="issue-actions">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={() => decide(i.id, 'ajustar')}
                        >
                          Ajustar campo
                          <ArrowRight size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={ignored || busy || stale}
                          onClick={() => decide(i.id, 'ignorar')}
                        >
                          {ignored ? (
                            <>
                              <Check size={14} /> Decisão ignorada & registrada
                            </>
                          ) : (
                            'Ignorar e registrar no log'
                          )}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {isFinalStage && (
            <div className="closure-action-box">
              <div className="closure-instructions">
                <strong>Fechamento e Consolidação da Marca</strong>
                <p>
                  Para fechar o negócio, resolva as recomendações ajustando os
                  campos ou registre &quot;Ignorar&quot; nas sugestões que
                  optar por manter como estão.
                </p>
              </div>

              <Button
                className="action-button close-business-btn"
                onClick={close}
                disabled={busy || stale || unresolved.length > 0 || closed}
              >
                {closed ? (
                  <>
                    <Check size={16} /> Negócio Fechado e Consolidado
                  </>
                ) : (
                  'Concluir Marca e Fechar Negócio'
                )}
              </Button>

              {closed && (
                <div className="skill-generation-card">
                  <div className="skill-gen-header">
                    <Sparkles size={22} />
                    <div>
                      <h3>Sua Operação em uma Skill Autônoma</h3>
                      <p>
                        Skill completa para rodar dentro do GPT/codex ou Claude.
                        Dá suporte diário à operação enxuta e gera conteúdos
                        orientados à demanda com base em todas as decisões do seu negócio.
                      </p>
                    </div>
                  </div>
                  <Button
                    className="action-button download-skill-btn"
                    onClick={exportSkill}
                    disabled={busy}
                  >
                    <Download size={16} />
                    {busy ? 'Gerando pacote da Skill…' : 'Criar e Baixar Skill (GPT / Codex / Claude)'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <details className="decision-log-drawer">
        <summary>
          <History size={16} />
          <span>Histórico de Decisões e Auditoria ({audit.decisions.length})</span>
        </summary>
        <div className="decision-log-content">
          {audit.decisions.length === 0 ? (
            <p className="empty-log">
              Nenhuma decisão registrada ainda. As opções &quot;Ajustar&quot;,
              &quot;Ignorar&quot; e o fechamento final ficam gravados aqui com
              data e hora.
            </p>
          ) : (
            audit.decisions
              .slice()
              .reverse()
              .map((d, idx) => (
                <div key={idx} className={`log-entry ${d.action}`}>
                  <div className="log-top">
                    <span className="log-badge">
                      {d.action === 'ajustar'
                        ? 'Ajuste Solicitado'
                        : d.action === 'ignorar'
                          ? 'Recomendação Ignorada'
                          : 'Fechamento do Negócio'}
                    </span>
                    <small>{new Date(d.at).toLocaleString('pt-BR')}</small>
                  </div>
                  <p>{d.note}</p>
                </div>
              ))
          )}
        </div>
      </details>

      <Dialog open={settings} onOpenChange={setSettings}>
        <DialogContent className="agent-dialog">
          <DialogHeader>
            <DialogTitle>Conectar IA (OpenAI ou Claude)</DialogTitle>
            <DialogDescription>
              Conecte sua API para avaliação estratégica avançada. A chave fica
              somente na memória da sessão do navegador e nunca é salva em
              bancos externos.
            </DialogDescription>
          </DialogHeader>
          <RadioGroup
            value={connection.provider}
            onValueChange={(v) =>
              setConnection({
                ...connection,
                provider: v as Connection['provider'],
                model:
                  v === 'openai' ? 'gpt-4o-mini' : 'claude-3-5-sonnet-latest',
              })
            }
            className="provider-options"
          >
            <label>
              <RadioGroupItem value="openai" /> OpenAI (GPT-4o / GPT-4o-mini)
            </label>
            <label>
              <RadioGroupItem value="anthropic" /> Anthropic (Claude 3.5 Sonnet)
            </label>
          </RadioGroup>
          <label htmlFor="advisor-model-input" className="asset-label">
            <span>ID do modelo</span>
            <Input
              id="advisor-model-input"
              value={connection.model}
              onChange={(e) =>
                setConnection({ ...connection, model: e.target.value })
              }
              placeholder="Ex.: gpt-4o-mini, claude-3-5-sonnet-latest"
            />
          </label>
          <label htmlFor="advisor-key-input" className="asset-label">
            <span>Chave da API</span>
            <Input
              id="advisor-key-input"
              type="password"
              autoComplete="off"
              value={connection.key}
              onChange={(e) =>
                setConnection({ ...connection, key: e.target.value })
              }
              placeholder="Cole sua chave sk-..."
            />
          </label>
          <div className="review-actions">
            <Button
              onClick={() => setSettings(false)}
              disabled={!connection.key || !connection.model}
            >
              Salvar Conexão
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setConnection({ ...connection, key: '' });
                setSettings(false);
              }}
            >
              Desconectar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
