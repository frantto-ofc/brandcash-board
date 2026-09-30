type Stage = {
  name: string;
  tag: string;
  desc: string;
  icon: string;
  fields: readonly (readonly [string, string, string, string])[];
};
export const stages: readonly Stage[] = [
  {
    name: 'Especialidade',
    tag: 'Encontre seu foco',
    desc: 'Escolha o resultado pelo qual sua marca será lembrada.',
    icon: 'focus',
    fields: [
      [
        'skill',
        'Sua habilidade principal',
        'Qual habilidade você domina e consegue entregar com consistência?',
        'Ex.: construir ofertas para consultores independentes',
      ],
      [
        'result',
        'Resultado que você entrega',
        'Descreva a transformação concreta que o cliente recebe.',
        'Ex.: uma oferta clara e pronta para ser apresentada',
      ],
      [
        'proof',
        'Experiência e evidências',
        'Registre experiências, projetos ou resultados que sustentam sua escolha.',
        'O que você já fez que demonstra essa capacidade?',
      ],
    ],
  },
  {
    name: 'Oferta',
    tag: 'Transforme foco em valor',
    desc: 'Defina para quem, o que e como você vai vender.',
    icon: 'package',
    fields: [
      [
        'audience',
        'Público comprador',
        'Quem tem o problema e condições de investir na solução?',
        'Ex.: consultores que já vendem, mas dependem de indicações',
      ],
      [
        'problem',
        'Problema prioritário',
        'Qual problema esse público quer resolver agora?',
        'Descreva a dificuldade e seu impacto',
      ],
      [
        'offer',
        'Proposta principal',
        'Escreva o resultado, o formato e os limites da entrega.',
        'Ajudo [público] a [resultado] por meio de [método]',
      ],
      [
        'price',
        'Preço da oferta',
        'Registre seu preço e condições comerciais.',
        'Ex.: R$ 3.000 em até 3 vezes',
      ],
      [
        'downsell',
        'Alternativa de entrada',
        'Defina uma opção com escopo menor para quem não compra a principal.',
        'Qual parte do resultado pode ser vendida separadamente?',
      ],
    ],
  },
  {
    name: 'Narrativa',
    tag: 'Dê voz à sua diferença',
    desc: 'Construa uma mensagem que só a sua marca poderia dizer.',
    icon: 'fingerprint',
    fields: [
      [
        'difference',
        'Seu diferencial',
        'O que muda na sua abordagem, experiência ou entrega?',
        'Evite “qualidade” e “atendimento personalizado”. Seja específico.',
      ],
      [
        'belief',
        'Sua tese central',
        'Qual ideia orienta o seu trabalho?',
        'Ex.: uma oferta clara vale mais que um catálogo de serviços',
      ],
      [
        'bio',
        'Bio do perfil',
        'Una público, transformação, prova e próximo passo.',
        'Escreva a bio que o visitante encontrará no Instagram',
      ],
    ],
  },
  {
    name: 'Conteúdo',
    tag: 'Crie o caminho até a compra',
    desc: 'Conecte a atenção do público à sua oferta.',
    icon: 'megaphone',
    fields: [
      [
        'post',
        'Post de atração',
        'Planeje um conteúdo sobre o problema que sua oferta resolve.',
        'Gancho → desenvolvimento → convite para o próximo passo',
      ],
      [
        'reel',
        'Roteiro de Reel',
        'Mostre sua abordagem em uma mensagem objetiva.',
        'Abertura → exemplo → conclusão → chamada para ação',
      ],
      [
        'stories',
        'Sequência de Stories',
        'Leve o público da identificação com o problema ao contato.',
        'Problema → abordagem → evidência → convite',
      ],
      [
        'contact',
        'Caminho de compra',
        'Defina para onde o interessado vai e como será atendido.',
        'Ex.: link do perfil → WhatsApp → diagnóstico → proposta',
      ],
    ],
  },
  {
    name: 'Entrega',
    tag: 'Faça bem. Repita melhor.',
    desc: 'Organize um processo enxuto com entregáveis definidos.',
    icon: 'layers',
    fields: [
      [
        'method',
        'Método passo a passo',
        'Liste as etapas necessárias para entregar o resultado prometido.',
        'Diagnóstico → construção → revisão → entrega',
      ],
      [
        'sessions',
        'Plano dos encontros',
        'Distribua o trabalho em dois ou três encontros, se fizer sentido para a oferta.',
        'O que será decidido e produzido em cada encontro?',
      ],
      [
        'assets',
        'Materiais da entrega',
        'O que o cliente terá em mãos ao final?',
        'Liste arquivos, decisões, roteiros e orientações',
      ],
      [
        'ai',
        'Apoio de IA',
        'Defina tarefas, contexto necessário e critérios de revisão humana.',
        'O que a IA pode acelerar e o que você precisa validar?',
      ],
      ["ads_goal", "Objetivo e conversão", "Qual resultado os anúncios devem produzir e qual evento comprova a conversão?", "Objetivo: …\nEvento: lead qualificado, agendamento ou compra\nOferta anunciada: …"],
      ["ads_audience", "Públicos e canais", "Defina canal prioritário, público frio, remarketing e exclusões.", "Canal: …\nPúblico frio: …\nRemarketing: …\nExclusões: …"],
      ["ads_funnel", "Estrutura de campanhas e funil", "Descreva o caminho do anúncio à venda e quem atende cada contato.", "Campanha → conjunto/público → criativo → página ou WhatsApp → atendimento → venda"],
      ["ads_budget", "Orçamento e viabilidade", "Defina verba de teste, duração, margem e custo de aquisição máximo.", "Verba diária: R$ …\nDias de teste: …\nMargem por venda: …\nCAC máximo: …"],
      ["ads_creatives", "Criativos e hipóteses", "O que será testado? Conecte a promessa à prova e à oferta.", "Hipótese → gancho → formato → prova → CTA → variação"],
      ["ads_tracking", "Rastreamento e atribuição", "Quais eventos, UTMs e integrações permitem acompanhar o caminho até a venda?", "Eventos: …\nPixel/tag e conversões: …\nUTMs: …\nCRM: …\nTeste de eventos: …"],
      ["ads_rules", "Rotina e regras de decisão", "Defina métricas e critérios de pausar, iterar ou escalar sem decidir por um dia isolado.", "Frequência de revisão: …\nAmostra mínima: …\nPausar quando: …\nIterar quando: …\nEscalar quando: …"],
    ],
  },
  {
    name: 'Escala',
    tag: 'Cresça além da agenda',
    desc: 'Transforme uma entrega validada em um processo ensinável.',
    icon: 'trending',
    fields: [
      [
        'validation',
        'Evidências de validação',
        'Quais resultados e feedbacks indicam que a entrega funciona?',
        'Registre evidências reais antes de ampliar a operação',
      ],
      [
        'modules',
        'Programa gravado',
        'Divida o processo em instruções curtas com uma saída concreta por aula.',
        'Módulo → ação → material produzido',
      ],
      [
        'capacity',
        'Capacidade e próximo passo',
        'Defina o limite da agenda e quando oferecer a versão gravada.',
        'Quantos clientes cabem na operação? Qual será o próximo teste?',
      ],
    ],
  },
  {
    name: 'Marca',
    tag: 'Construa uma marca reconhecível',
    desc: 'Conecte sua Big Idea, sua proeza e sua identidade sensorial.',
    icon: 'gem',
    fields: [
      [
        'brand_idea',
        'Big Idea',
        'Qual mudança de perspectiva conecta o desejo do público à sua solução?',
        'Acreditamos que [nova visão], porque [razão]. Por isso, ajudamos [público] a [transformação].',
      ],
      [
        'brand_enemy',
        'Inimigo comum',
        'Nomeie uma crença, prática ou obstáculo que prejudica seu público. Explique o custo e a alternativa.',
        'Combatemos [prática ou crença], que provoca [consequência]. Defendemos [alternativa].',
      ],
      [
        'brand_promise',
        'Promessa e limites',
        'Que transformação a marca assume entregar? O que depende do cliente ou não está incluído?',
        'Prometemos [resultado sob nosso controle]. Depende de [condição]. Não prometemos [limite].',
      ],
      [
        'brand_values',
        'Princípios em ação',
        'Defina três valores e a decisão concreta que cada um orienta.',
        '[Valor] → fazemos [comportamento] → recusamos [prática].',
      ],
      [
        'brand_mechanism',
        'Proeza: mecanismo único',
        'Explique como sua abordagem produz o resultado. Um nome novo precisa de um funcionamento demonstrável.',
        'Nosso mecanismo combina [elementos] em [sequência] para remover [obstáculo] e produzir [resultado].',
      ],
      [
        'brand_functional',
        'Diferencial funcional',
        'O que muda na execução e na experiência do cliente? Compare com a alternativa habitual.',
        'Enquanto a alternativa faz [A], entregamos [B], por meio de [processo]. A vantagem observável é [C].',
      ],
      [
        'brand_philosophy',
        'Diferencial filosófico',
        'Qual convicção muda sua maneira de trabalhar, inclusive quando isso exige renúncias?',
        'Acreditamos em [convicção]. Por isso escolhemos [decisão] e abrimos mão de [renúncia].',
      ],
      [
        'brand_evidence',
        'Provas da proeza',
        'Que demonstração, caso ou evidência sustenta o diferencial? Separe evidências de hipóteses.',
        'Afirmação → evidência disponível → limite → teste que falta realizar.',
      ],
      [
        'brand_name',
        'Nome e assinatura',
        'Defina o nome, sua pronúncia e uma assinatura curta que expresse a proposta.',
        'Nome: …\nPronúncia: …\nAssinatura: …',
      ],
      [
        'brand_logo',
        'Direção do logo',
        'Defina conceito, versões, aplicações e restrições. Registre links dos arquivos existentes, se houver.',
        'Conceito: …\nVersões: principal, reduzida, monocromática\nAplicações: avatar, site, documentos\nEvitar: …',
      ],
      [
        'brand_palette',
        'Paleta de cores',
        'Registre as cores em HEX, separadas por vírgula. Use a ferramenta abaixo para testar combinações.',
        '#F7F7F7, #FFFFFF, #131313, #C6D0CF, #484D55',
      ],
      [
        'brand_color_roles',
        'Função das cores',
        'Defina a função de cada cor e quando usar os destaques.',
        'Fundo: …\nTexto: …\nSuperfícies: …\nDestaque: …\nCombinações a evitar: …',
      ],
      [
        'brand_type',
        'Tipografia',
        'Defina família, peso e uso. Inclua alternativas disponíveis e legibilidade em telas pequenas.',
        'Headlines: …\nTexto: …\nLegenda: …\nFallback: …',
      ],
      [
        'brand_graphics',
        'Grafismos e composição',
        'Quais formas, linhas, ícones e regras de composição tornam a marca reconhecível?',
        'Formas: …\nEspaçamento: …\nÍcones: …\nRepetir: …\nEvitar: …',
      ],
      [
        'brand_texture',
        'Texturas, imagens e movimento',
        'Descreva materiais, fotografia, tratamento e ritmo visual. Se não usar, registre a decisão.',
        'Texturas: …\nFotografia: …\nTratamento: …\nMovimento: …',
      ],
      [
        'brand_voice',
        'Personalidade e tom de voz',
        'Escolha três traços e mostre como a marca fala em contextos diferentes.',
        'Somos [traços].\nNa venda: …\nNa orientação: …\nDiante de um erro: …\nNão usamos: …',
      ],
      [
        'brand_phrases',
        'Bordões e vocabulário',
        'Crie expressões recorrentes e palavras que a marca usa ou evita.',
        'Assinatura verbal: …\nBordões: …\nPalavras próprias: …\nEvitar: …',
      ],
      [
        'brand_sound',
        'Jingle e assinatura sonora',
        'Defina sensação, ritmo, duração e ocasiões de uso. Se não fizer sentido, registre “não utilizar” e o motivo.',
        'Sensação: …\nRitmo e instrumentos: …\nDuração: …\nLetra ou motivo: …\nOnde usar: …',
      ],
      [
        'brand_ritual',
        'Rituais e outros sentidos',
        'Como a experiência reforça a marca no contato, onboarding e entrega? Inclua tato ou aroma apenas quando relevantes.',
        'Primeiro contato: …\nBoas-vindas: …\nEntrega: …\nOutros sentidos ou não aplicável: …',
      ],
      [
        'brand_touchpoints',
        'Aplicação e consistência',
        'Escolha os primeiros pontos de contato e o que precisa ser produzido em cada um.',
        'Instagram → bio, avatar, templates\nProposta → capa, linguagem, tipografia\nEntrega → documentos e ritual',
      ],
      [
        'brand_test',
        'Teste de reconhecimento',
        'Defina como verificar se as pessoas entendem e reconhecem a marca. Registre feedbacks reais.',
        'Quem vai avaliar: …\nPerguntas: o que oferecemos? O que nos diferencia? Que sensação fica?\nFeedbacks: …\nAjustes: …',
      ],
    ],
  },
] as const;
export type Plan = Record<string, string>;
export function stageProgress(plan: Plan, index: number) {
  const f = stages[index].fields;
  return Math.round(
    (f.filter((x) => plan[x[0]]?.trim()).length / f.length) * 100,
  );
}
export function totalProgress(plan: Plan) {
  const fields = stages.flatMap((s) => s.fields);
  return Math.round(
    (fields.filter((f) => plan[f[0]]?.trim()).length / fields.length) * 100,
  );
}
export function exportPlan(plan: Plan) {
  return (
    '# BrandCash\nNegócio enxuto, marca rentável.\n\n' +
    stages
      .map(
        (s, i) =>
          `## ${i + 1}. ${s.name}\n\n` +
          s.fields
            .map((f) => `### ${f[1]}\n${plan[f[0]]?.trim() || 'A definir'}\n`)
            .join('\n'),
      )
      .join('\n')
  );
}

export const stageHashes = ['etapa-1','etapa-2','etapa-3','etapa-4','etapa-5','etapa-6','marca'];
