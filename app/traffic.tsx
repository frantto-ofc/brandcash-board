'use client';

import { useState } from 'react';
import { Calculator, Check, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function TrafficCalculator({
  onApply,
}: {
  onApply?: (summary: string) => void;
}) {
  const [budget, setBudget] = useState('');
  const [cpl, setCpl] = useState('');
  const [conversion, setConversion] = useState('');
  const [margin, setMargin] = useState('');
  const [applied, setApplied] = useState(false);

  const b = Number(budget);
  const c = Number(cpl);
  const r = Number(conversion) / 100;
  const m = Number(margin);
  const valid = b > 0 && c > 0 && r > 0 && r <= 1 && m > 0;

  const leads = b / c;
  const sales = leads * r;
  const cac = c / r;
  const grossProfit = sales * m;
  const netMargin = grossProfit - b;
  const roas = b > 0 ? grossProfit / b : 0;
  const isViable = cac <= m;

  function handleApply() {
    if (!valid || !onApply) return;
    const text = `Orçamento teste: R$ ${b.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\nCPL estimado: R$ ${c.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\nTaxa de conversão: ${(r * 100).toFixed(1)}%\nMargem por venda: R$ ${m.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\nEstimativa: ${Math.round(leads)} leads → ${sales.toFixed(1)} vendas | CAC: R$ ${cac.toFixed(2)} | Margem pós-mídia: R$ ${netMargin.toFixed(2)} (${isViable ? 'Viável' : 'Ajustar CAC/margem'})`;
    onApply(text);
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  }

  return (
    <div className="traffic-calculator-box">
      <div className="traffic-calculator-header">
        <div className="traffic-calc-title">
          <Calculator size={19} />
          <div>
            <h3>Simulador de Viabilidade Econômica de Tráfego</h3>
            <p>
              Modele a viabilidade dos anúncios antes de colocar dinheiro na
              mídia.
            </p>
          </div>
        </div>
      </div>

      <div className="traffic-inputs-grid">
        <label className="traffic-input-group">
          <span>Verba do teste (R$)</span>
          <Input
            type="number"
            min="0"
            step="50"
            placeholder="Ex.: 1500"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </label>
        <label className="traffic-input-group">
          <span>Custo por lead (CPL estimado em R$)</span>
          <Input
            type="number"
            min="0"
            step="1"
            placeholder="Ex.: 25"
            value={cpl}
            onChange={(e) => setCpl(e.target.value)}
          />
        </label>
        <label className="traffic-input-group">
          <span>Conversão lead → venda (%)</span>
          <Input
            type="number"
            min="0.1"
            max="100"
            step="0.5"
            placeholder="Ex.: 5"
            value={conversion}
            onChange={(e) => setConversion(e.target.value)}
          />
        </label>
        <label className="traffic-input-group">
          <span>Margem de contribuição por venda (R$)</span>
          <Input
            type="number"
            min="0"
            step="100"
            placeholder="Ex.: 2000"
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
          />
        </label>
      </div>

      {valid ? (
        <div className="traffic-results">
          <div className="traffic-metrics-row">
            <div className="metric-pill">
              <span className="metric-label">Leads estimados</span>
              <strong className="metric-val">{Math.round(leads)}</strong>
            </div>
            <div className="metric-pill">
              <span className="metric-label">Vendas estimadas</span>
              <strong className="metric-val">{sales.toFixed(1)}</strong>
            </div>
            <div className="metric-pill">
              <span className="metric-label">CAC projetado</span>
              <strong className="metric-val">
                R$ {cac.toFixed(2)}
              </strong>
            </div>
            <div
              className={`metric-pill ${netMargin >= 0 ? 'positive' : 'negative'}`}
            >
              <span className="metric-label">Margem líquida após mídia</span>
              <strong className="metric-val">
                R$ {netMargin.toFixed(2)}
              </strong>
            </div>
          </div>

          <div
            className={`traffic-status-banner ${isViable ? 'viable' : 'alert'}`}
          >
            {isViable ? (
              <p>
                <strong>Cenário matematicamente sustentável.</strong> O CAC
                projetado (R$ {cac.toFixed(2)}) cabe na sua margem de
                contribuição (R$ {m.toFixed(2)}), gerando um retorno estimado de{' '}
                {roas.toFixed(1)}x sobre o investimento em anúncios.
              </p>
            ) : (
              <p>
                <strong>Atenção à viabilidade:</strong> O CAC estimado (R${' '}
                {cac.toFixed(2)}) supera sua margem de contribuição por venda
                (R$ {m.toFixed(2)}). Para tornar viável, aumente o ticket,
                melhore a conversão de vendas ou reduza o CPL com criativos mais
                qualificados.
              </p>
            )}

            {onApply && (
              <Button
                variant="outline"
                size="sm"
                className="traffic-apply-btn"
                onClick={handleApply}
              >
                {applied ? <Check size={14} /> : <Sparkles size={14} />}
                {applied
                  ? 'Aplicado ao campo de orçamento!'
                  : 'Transferir valores para o plano'}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="traffic-prompt-note">
          Preencha a verba de teste, CPL, conversão e margem para calcular a
          viabilidade e o CAC máximo tolerável.
        </div>
      )}
    </div>
  );
}
