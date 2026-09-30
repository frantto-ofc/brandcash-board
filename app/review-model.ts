import { stages, type Plan } from './model';

export type Issue = {
  id: string;
  stage: number;
  field: string;
  title: string;
  reason: string;
  suggestion: string;
};

export type Review = {
  id: string;
  scope: number;
  engine: string;
  score: number;
  summary: string;
  issues: Issue[];
  snapshot: string;
  createdAt: string;
};

export type Decision = {
  reviewId: string;
  issueId: string;
  action: 'ajustar' | 'ignorar' | 'fechar';
  at: string;
  note: string;
};

export type Audit = {
  reviews: Review[];
  decisions: Decision[];
  closedReview?: string;
};

export const emptyAudit: Audit = { reviews: [], decisions: [] };

export function businessData(plan: Plan) {
  return Object.fromEntries(
    [
      ...stages.flatMap((s) => s.fields.map((f) => f[0])),
      'brand_asset_manifest',
    ].map((k) => [k, plan[k] || '']),
  );
}

export function snapshot(plan: Plan) {
  return JSON.stringify(businessData(plan));
}

export function usable(value: string | undefined) {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.length >= 15 && !/\[[^\]]+\]|…|\.\.\./.test(trimmed);
}

export function checklist(plan: Plan, scope: number): Review {
  const issues: Issue[] = [];

  if (scope === -1 || scope === 6) {
    // Avaliação global do negócio e cálculo de Chance de Sucesso (0 a 100)
    let scoreOferta = 0;
    let scoreDiferencial = 0;
    let scoreTrafego = 0;
    let scoreEntrega = 0;
    let scoreMarca = 0;

    // 1. Pilar Oferta e Problema (até 20)
    const hasAudience = usable(plan.audience);
    const hasProblem = usable(plan.problem);
    const hasOffer = usable(plan.offer);
    const hasPrice = usable(plan.price);
    if (hasAudience) scoreOferta += 5;
    else
      issues.push({
        id: 'audience-missing',
        stage: 1,
        field: 'audience',
        title: 'Público comprador indefinido ou genérico',
        reason:
          'Sem clareza exata de quem tem a dor e poder de investimento, a conversão é imprevisível.',
        suggestion:
          'Defina o nicho, momento e perfil de quem paga pelo resultado.',
      });

    if (hasProblem) scoreOferta += 5;
    else
      issues.push({
        id: 'problem-missing',
        stage: 1,
        field: 'problem',
        title: 'Problema prioritário não especificado',
        reason:
          'Clientes compram alívio de dor imediata, não conceitos abstratos.',
        suggestion:
          'Detalhe o prejuízo real ou gargalo que o público quer eliminar agora.',
      });

    if (hasOffer) scoreOferta += 5;
    if (hasPrice) scoreOferta += 5;
    else
      issues.push({
        id: 'price-missing',
        stage: 1,
        field: 'price',
        title: 'Preço e modelo comercial ausentes',
        reason:
          'A viabilidade de um negócio enxuto exige ticket definido para calcular o ponto de equilíbrio.',
        suggestion:
          'Estabeleça o valor da oferta principal e condições de pagamento.',
      });

    // 2. Pilar Diferencial e Prova (até 20)
    const hasDiff = usable(plan.difference);
    const hasBelief = usable(plan.belief);
    const hasMech = usable(plan.brand_mechanism);
    const hasProof = usable(plan.proof) || usable(plan.brand_evidence);
    if (hasDiff) scoreDiferencial += 5;
    if (hasBelief) scoreDiferencial += 5;
    if (hasMech) scoreDiferencial += 5;
    else
      issues.push({
        id: 'mech-missing',
        stage: 6,
        field: 'brand_mechanism',
        title: 'Mecanismo único (proeza) não demonstrado',
        reason:
          'Sem um mecanismo demonstrável, o cliente enxerga sua solução como commodity.',
        suggestion:
          'Explique como o seu método funciona passo a passo para gerar o resultado prometido.',
      });

    if (hasProof) scoreDiferencial += 5;
    else
      issues.push({
        id: 'proof-missing',
        stage: 0,
        field: 'proof',
        title: 'Evidências e provas insuficientes',
        reason:
          'Grandes promessas sem provas geram desconfiança e encarecem a aquisição.',
        suggestion:
          'Adicione casos anteriores, protótipos ou fatos que sustentem sua entrega.',
      });

    // 3. Pilar Estrutura de Tráfego e Demanda (até 20)
    const hasTrafficBudget = usable(plan.ads_budget);
    const hasTrafficFunnel = usable(plan.ads_funnel);
    const hasTrafficGoal = usable(plan.ads_goal);
    const hasContent = usable(plan.post) || usable(plan.reel);
    if (hasTrafficBudget) scoreTrafego += 5;
    else
      issues.push({
        id: 'traffic-budget-missing',
        stage: 4,
        field: 'ads_budget',
        title: 'Orçamento de tráfego e viabilidade de CAC não calculados',
        reason:
          'Rodar anúncios sem simular CAC e margem leva a queima desordenada de verba.',
        suggestion:
          'Use o Simulador de Tráfego na etapa de Entrega para modelar verba, CPL e CAC.',
      });

    if (hasTrafficFunnel) scoreTrafego += 5;
    else
      issues.push({
        id: 'traffic-funnel-missing',
        stage: 4,
        field: 'ads_funnel',
        title: 'Estrutura do funil de anúncios indefinida',
        reason:
          'O lead precisa de um trajeto claro do anúncio até o contato comercial ou fechamento.',
        suggestion:
          'Defina o destino do tráfego: anúncio → página de vendas/WhatsApp → qualificação → fechamento.',
      });

    if (hasTrafficGoal) scoreTrafego += 5;
    if (hasContent) scoreTrafego += 5;

    // 4. Pilar Entrega e Operação (até 20)
    const hasMethod = usable(plan.method);
    const hasSessions = usable(plan.sessions);
    const hasAssets = usable(plan.assets);
    const hasCapacity = usable(plan.capacity) || usable(plan.ai);
    if (hasMethod) scoreEntrega += 5;
    else
      issues.push({
        id: 'method-missing',
        stage: 4,
        field: 'method',
        title: 'Método de entrega não especificado',
        reason:
          'Um negócio enxuto necessita de um processo repetível e documentado.',
        suggestion:
          'Descreva os passos que o cliente percorre desde o onboarding até a conclusão.',
      });

    if (hasSessions) scoreEntrega += 5;
    if (hasAssets) scoreEntrega += 5;
    if (hasCapacity) scoreEntrega += 5;

    // 5. Pilar Marca e Ecossistema (até 20)
    const hasBrandIdea = usable(plan.brand_idea);
    const hasBrandEnemy = usable(plan.brand_enemy);
    const hasBrandName = usable(plan.brand_name);
    const hasBrandAssets = Boolean(
      plan.brand_asset_manifest &&
        plan.brand_asset_manifest.length > 10 &&
        plan.brand_asset_manifest !== '[]',
    );
    if (hasBrandIdea) scoreMarca += 5;
    else
      issues.push({
        id: 'brand-idea-missing',
        stage: 6,
        field: 'brand_idea',
        title: 'Big Idea da marca indefinida',
        reason:
          'A marca deve ser a tradução máxima do negócio para posicionar com autoridade.',
        suggestion:
          'Defina a tese central que muda a perspectiva do cliente sobre a solução.',
      });

    if (hasBrandEnemy) scoreMarca += 5;
    if (hasBrandName) scoreMarca += 5;
    if (hasBrandAssets) scoreMarca += 5;
    else
      issues.push({
        id: 'brand-assets-missing',
        stage: 6,
        field: 'brand_touchpoints',
        title: 'Assets de identidade ou ecossistema da marca pendentes',
        reason:
          'Ter identidade visual, áudio/jingle, vídeo ou site organizados fortalece o ecossistema.',
        suggestion:
          'Suba documentos de identidade, arquivos de mídia ou links de ecossistema na aba Assets da Marca.',
      });

    const finalScore =
      scoreOferta + scoreDiferencial + scoreTrafego + scoreEntrega + scoreMarca;

    const summary = `Auditoria de Prontidão: Nota de Chance de Sucesso do Negócio calculada em ${finalScore}/100.
Composição dos pilares:
• Clareza da Oferta e Problema: ${scoreOferta}/20
• Diferencial e Prova da Proeza: ${scoreDiferencial}/20
• Estrutura de Tráfego e Demanda: ${scoreTrafego}/20
• Capacidade e Processo de Entrega: ${scoreEntrega}/20
• Coerência da Marca e Ecossistema: ${scoreMarca}/20
${finalScore >= 80 ? 'O negócio possui estrutura sólida, viabilidade modelada e marca alinhada.' : 'Existem gargalos estratégicos importantes. Recomendamos ajustar as pendências ou registrar a decisão no histórico.'}`;

    return {
      id: crypto.randomUUID(),
      scope,
      engine: 'Diagnóstico Estratégico BrandCash',
      score: finalScore,
      summary,
      issues,
      snapshot: snapshot(plan),
      createdAt: new Date().toISOString(),
    };
  }

  // Avaliação pontual de etapa individual
  const stageObj = stages[scope];
  let stageTotal = stageObj.fields.length;
  let stageFilled = 0;

  for (const f of stageObj.fields) {
    if (usable(plan[f[0]])) {
      stageFilled++;
    } else {
      issues.push({
        id: `stage-${scope}-${f[0]}`,
        stage: scope,
        field: f[0],
        title: `${f[1]} necessita de maior definição`,
        reason:
          'Campo com resposta ausente, incompleta ou com texto padrão de exemplo.',
        suggestion: f[2],
      });
    }
  }

  // Se for a etapa de Entrega (scope 4), verifica tráfego especificamente
  if (scope === 4 && !usable(plan.ads_budget)) {
    issues.unshift({
      id: 'stage-4-traffic-sim',
      stage: 4,
      field: 'ads_budget',
      title: 'Estrutura de tráfego (Ads) requer simulação de viabilidade',
      reason:
        'A etapa de Entrega depende de tráfego previsível para manter a operação rodando.',
      suggestion:
        'Utilize o Simulador de Tráfego acima para calcular CPL, conversão e CAC.',
    });
  }

  const stageScore = Math.round((stageFilled / Math.max(1, stageTotal)) * 100);

  return {
    id: crypto.randomUUID(),
    scope,
    engine: 'Diagnóstico de Etapa',
    score: stageScore,
    summary: `Avaliação da etapa ${stageObj.name}: ${stageFilled} de ${stageTotal} decisões consistentes (${stageScore}% de maturidade da etapa).`,
    issues,
    snapshot: snapshot(plan),
    createdAt: new Date().toISOString(),
  };
}

export function parseAudit(raw: string | undefined): Audit {
  try {
    const a = JSON.parse(raw || 'null');
    if (a && Array.isArray(a.reviews) && Array.isArray(a.decisions)) return a;
  } catch {}
  return { reviews: [], decisions: [] };
}

export const reviewInstructions = `Você é o orientador estratégico BrandCash. Avalie as decisões de um negócio enxuto em português.
A etapa de Marca (etapa 7) é a tradução de todo o negócio (especialidade, oferta, narrativa, conteúdo, entrega com tráfego e escala).
Avalie: clareza do público e problema prioritário, preço e margem, diferencial comprovável (proeza e mecanismo único), canais de aquisição e viabilidade do tráfego pago (verba, CPL, CAC, funil), processo de entrega e consistência da marca e seus assets.
Retorne SOMENTE JSON:
{
  "score": 85,
  "summary": "Nota de Chance de Sucesso do Negócio: 85/100. Resumo executivo detalhando pontos fortes e fracos nos 5 pilares: Oferta, Diferencial, Tráfego, Entrega e Marca.",
  "issues": [
    {
      "stage": 4,
      "field": "ads_budget",
      "title": "Título conciso da recomendação",
      "reason": "Por que esta decisão fragiliza a chance de sucesso",
      "suggestion": "Ação prática e concreta para corrigir"
    }
  ]
}
A pontuação (0-100) reflete a probabilidade e viabilidade prática do negócio ter sucesso no mercado real.
Até 10 recomendações priorizadas, com stage de 0 a 6 e field correspondente. Se não houver pendências relevantes, retorne issues vazio.`;

export function normalizeReview(
  value: unknown,
  scope: number,
  plan: Plan,
  engine: string,
): Review {
  if (!value || typeof value !== 'object')
    throw new Error('Resposta inválida do agente.');
  const v = value as Record<string, unknown>;
  if (
    typeof v.score !== 'number' ||
    !Number.isFinite(v.score) ||
    typeof v.summary !== 'string' ||
    !Array.isArray(v.issues)
  )
    throw new Error(
      'A resposta do agente não contém uma avaliação válida. Tente novamente.',
    );
  const issues = v.issues.slice(0, 12).map((item, index) => {
    if (!item || typeof item !== 'object')
      throw new Error('Recomendação inválida.');
    const i = item as Record<string, unknown>;
    if (
      typeof i.stage !== 'number' ||
      !Number.isInteger(i.stage) ||
      !stages[i.stage] ||
      typeof i.field !== 'string' ||
      !stages[i.stage].fields.some((f) => f[0] === i.field) ||
      [i.title, i.reason, i.suggestion].some((x) => typeof x !== 'string')
    )
      throw new Error('O agente retornou uma referência de etapa inválida.');
    return {
      id: `${index}-${i.field}`,
      stage: i.stage,
      field: i.field as string,
      title: (i.title as string).slice(0, 300),
      reason: (i.reason as string).slice(0, 2000),
      suggestion: (i.suggestion as string).slice(0, 3000),
    };
  });
  return {
    id: crypto.randomUUID(),
    scope,
    engine,
    score: Math.max(0, Math.min(100, Math.round(v.score))),
    summary: v.summary.slice(0, 8000),
    issues,
    snapshot: snapshot(plan),
    createdAt: new Date().toISOString(),
  };
}
