'use client';

import { useState } from 'react';
import { Check, Download, ArrowRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { stages, type Plan } from './model';
import { BrandAssets } from './brand-assets';

const groups = [
  {
    name: 'Essência',
    start: 0,
    end: 4,
    tip: 'Uma ideia forte muda a forma de enxergar o problema. Um inimigo comum nomeia o obstáculo que sua marca ajuda a superar.',
  },
  {
    name: 'Proeza',
    start: 4,
    end: 8,
    tip: 'O diferencial funcional explica o que muda na entrega. O filosófico explica por que você escolhe trabalhar assim.',
  },
  {
    name: 'Identidade sensorial',
    start: 8,
    end: 19,
    tip: 'Defina códigos que possam se repetir com consistência. Elementos sem função para a marca podem ser registrados como “não utilizar”.',
  },
  {
    name: 'Aplicação',
    start: 19,
    end: 21,
    tip: 'Coloque a identidade em situações reais e verifique se as pessoas entendem a promessa e reconhecem a marca.',
  },
  {
    name: 'Assets & Ecossistema',
    start: 0,
    end: 0,
    isAssets: true,
    tip: 'Suba o manual com a Identidade Visual, jingle/áudio, vídeo promocional, link do site e assets do ecossistema.',
  },
];

export function paletteColors(value: string) {
  return value.split(/[,;\s]+/).filter((v) => /^#[0-9a-f]{6}$/i.test(v));
}

export function contrast(a: string, b: string) {
  const luminance = (hex: string) => {
    const rgb = [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

export function BrandWorkshop({
  plan,
  update,
  ready,
}: {
  plan: Plan;
  update: (k: string, v: string) => void;
  ready: boolean;
}) {
  const [tab, setTab] = useState(0);
  const [ink, setInk] = useState('#131313');
  const [paper, setPaper] = useState('#F7F7F7');
  const fields = stages[6].fields;
  const ratio = contrast(ink, paper);

  function exportBrand() {
    const text =
      '# Guia de marca — BrandCash\n\n' +
      fields
        .map((f) => '## ' + f[1] + '\n' + (plan[f[0]] || 'A definir'))
        .join('\n\n');
    const url = URL.createObjectURL(
      new Blob([text], { type: 'text/markdown;charset=utf-8' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brandcash-guia-de-marca.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="brand-workshop">
      <Tabs value={tab} onValueChange={(v) => setTab(Number(v))}>
        <TabsList className="brand-tabs" aria-label="Ferramentas de marca">
          {groups.map((g, i) => (
            <TabsTrigger key={g.name} value={i}>
              {g.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {groups.map((g, gi) => (
          <TabsContent value={gi} key={g.name}>
            <p className="brand-tip">{g.tip}</p>

            {g.isAssets ? (
              <BrandAssets update={update} />
            ) : (
              <div className="fields">
                {fields.slice(g.start, g.end).map((f, i) => (
                  <div className="field" key={f[0]}>
                    <label htmlFor={f[0]}>
                      <span>{String(g.start + i + 1).padStart(2, '0')}</span>
                      {f[1]}
                      {plan[f[0]]?.trim() && <Check size={16} />}
                    </label>
                    <p id={f[0] + '-help'}>{f[2]}</p>
                    <Textarea
                      id={f[0]}
                      aria-describedby={f[0] + '-help'}
                      value={plan[f[0]] || ''}
                      onChange={(e) => update(f[0], e.target.value)}
                      placeholder={f[3]}
                      className="plan-input"
                      disabled={!ready}
                    />
                    <Button
                      className="template-button"
                      variant="ghost"
                      disabled={!ready || Boolean(plan[f[0]]?.trim())}
                      onClick={() => update(f[0], f[3])}
                    >
                      Usar roteiro de preenchimento
                    </Button>
                    {f[0] === 'brand_palette' && (
                      <div className="palette-tool">
                        <div className="palette-swatches">
                          {paletteColors(plan.brand_palette || '').map(
                            (color, index) => (
                              <span key={index}>
                                <i style={{ background: color }} />
                                {color}
                              </span>
                            ),
                          )}
                        </div>
                        {plan.brand_palette &&
                          paletteColors(plan.brand_palette).length === 0 && (
                            <p>
                              Use códigos com seis caracteres: #131313, #FFFFFF.
                            </p>
                          )}
                        <h4>Teste de contraste</h4>
                        <p>
                          Escolha duas cores para verificar a leitura de texto
                          sobre o fundo.
                        </p>
                        <div className="color-controls">
                          <label>
                            Texto
                            <input
                              type="color"
                              value={ink}
                              onChange={(e) => setInk(e.target.value)}
                            />
                            <span>{ink.toUpperCase()}</span>
                          </label>
                          <label>
                            Fundo
                            <input
                              type="color"
                              value={paper}
                              onChange={(e) => setPaper(e.target.value)}
                            />
                            <span>{paper.toUpperCase()}</span>
                          </label>
                        </div>
                        <div
                          className="contrast-preview"
                          style={{ color: ink, background: paper }}
                        >
                          Sua marca precisa ser reconhecida.
                          <br />
                          <small>E sua mensagem precisa ser lida.</small>
                        </div>
                        <output className="contrast-result">
                          Contraste {ratio.toFixed(2)}:1 ·{' '}
                          {ratio >= 4.5
                            ? 'Atende AA para texto normal'
                            : ratio >= 3
                              ? 'Atende AA apenas para texto grande'
                              : 'Abaixo do mínimo AA para texto'}
                        </output>
                        <Button
                          variant="outline"
                          className="action-button"
                          disabled={!ready}
                          onClick={() => {
                            const colors = paletteColors(
                              plan.brand_palette || '',
                            );
                            update(
                              'brand_palette',
                              [
                                ...new Set([
                                  ...colors,
                                  ink.toUpperCase(),
                                  paper.toUpperCase(),
                                ]),
                              ].join(', '),
                            );
                          }}
                        >
                          Adicionar cores testadas à paleta
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {gi < groups.length - 1 && (
              <div className="brand-next">
                <Button
                  variant="outline"
                  className="action-button"
                  onClick={() => setTab(gi + 1)}
                >
                  Continuar para {groups[gi + 1].name}
                  <ArrowRight size={15} />
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      <div className="brand-export">
        <div>
          <strong>Seu guia de marca</strong>
          <p>Reúna as decisões em um briefing para criação e aplicação.</p>
        </div>
        <Button
          variant="outline"
          className="action-button"
          onClick={exportBrand}
        >
          <Download size={15} />
          Exportar guia
        </Button>
      </div>
    </div>
  );
}
