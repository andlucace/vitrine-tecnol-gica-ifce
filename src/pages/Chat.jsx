import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PublicHeader from '@/components/layout/PublicHeader';
import ChatMessage from '@/components/chat/ChatMessage';
import TypingIndicator from '@/components/chat/TypingIndicator';
import InterestModal from '@/components/public/InterestModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Lightbulb, RotateCcw } from 'lucide-react';

const SUGGESTIONS = [
  'Tecnologias para irrigação inteligente na agricultura',
  'Soluções em energias renováveis para comunidades rurais',
  'Aplicativos de monitoramento de saúde',
  'Materiais de construção sustentáveis',
  'Sistemas de tratamento de água e resíduos',
  'Tecnologias para indústria alimentícia',
];

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: `Olá! 👋 Sou o assistente da **Vitrine Tecnológica do IFCE**.

Fui treinado para ajudá-lo a encontrar as melhores patentes e tecnologias desenvolvidas pelo Instituto Federal do Ceará.

**Como posso te ajudar?**
- Descreva sua necessidade ou área de interesse
- Pergunte sobre tecnologias específicas
- Explore inovações por setor

Pode digitar livremente — quanto mais detalhes você der, melhor será minha busca! 🔍`,
};

export default function Chat() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPatent, setSelectedPatent] = useState(null);
  const [showInterest, setShowInterest] = useState(false);
  const [sessionId] = useState(() => `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Check if area param in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const area = params.get('area');
    if (area) {
      setInput(`Quero conhecer as patentes da área de ${area}`);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text) => {
    const query = (text || input).trim();
    if (!query || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setLoading(true);

    // Load all active patents
    const patents = await base44.entities.Patent.filter({ is_active: true }, '-created_date', 50);

    // Build context for AI
    const patentContext = patents.map((p, i) =>
      `[ID:${p.id}] ${p.title} | Área: ${p.tech_area} | Status: ${p.status}\nDescrição: ${p.description}\nPalavras-chave: ${p.keywords || ''}\nInventores: ${p.inventors || ''}`
    ).join('\n\n---\n\n');

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é o assistente da Vitrine Tecnológica do IFCE (Instituto Federal do Ceará).
      
O usuário perguntou: "${query}"

Aqui estão as patentes/tecnologias disponíveis no acervo:
${patentContext || 'Nenhuma patente cadastrada ainda.'}

Sua tarefa:
1. Analise a consulta do usuário
2. Identifique quais patentes são mais relevantes para a necessidade dele
3. Responda de forma conversacional, explicando como as patentes encontradas se relacionam com a necessidade
4. Retorne um JSON estruturado com sua resposta e as IDs das patentes relevantes ordenadas por relevância

Responda em JSON com este formato exato:
{
  "response_text": "Resposta conversacional em português, explicando as tecnologias encontradas e como elas se encaixam na necessidade do usuário. Seja detalhado e amigável.",
  "patent_ids": ["id1", "id2", "id3"],
  "relevance_scores": {"id1": 0.95, "id2": 0.80, "id3": 0.65},
  "classified_area": "Área tecnológica principal da consulta",
  "no_results": false
}

Se não houver patentes relevantes, retorne patent_ids vazio e no_results: true com uma mensagem explicando.
Inclua no máximo 5 patentes mais relevantes.`,
      response_json_schema: {
        type: 'object',
        properties: {
          response_text: { type: 'string' },
          patent_ids: { type: 'array', items: { type: 'string' } },
          relevance_scores: { type: 'object' },
          classified_area: { type: 'string' },
          no_results: { type: 'boolean' },
        },
      },
    });

    // Match returned patent IDs with actual patent objects
    const matchedPatents = (aiResponse.patent_ids || [])
      .map(id => {
        const p = patents.find(p => p.id === id);
        if (!p) return null;
        return { ...p, _score: aiResponse.relevance_scores?.[id] || 0 };
      })
      .filter(Boolean)
      .sort((a, b) => (b._score || 0) - (a._score || 0));

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: aiResponse.response_text || 'Desculpe, não consegui processar sua consulta.',
      patents: matchedPatents,
    }]);

    // Log the search
    await base44.entities.SearchLog.create({
      query_text: query,
      classified_area: aiResponse.classified_area || '',
      patents_returned: matchedPatents.map(p => p.id),
      result_count: matchedPatents.length,
      session_id: sessionId,
      led_to_interest: false,
    });

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInterest = (patent) => {
    setSelectedPatent(patent);
    setShowInterest(true);
  };

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput('');
  };

  return (
    <div className="h-screen flex flex-col bg-muted/20">
      <PublicHeader />

      {/* Chat topbar */}
      <div className="bg-white border-b border-border px-4 py-3 flex items-center gap-3 shrink-0">
        <Link to="/">
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
        </Link>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Consulta Inteligente de Patentes</p>
          <p className="text-xs text-muted-foreground">Assistente IA — IFCE</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 gap-1.5 text-muted-foreground hover:text-foreground">
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Nova conversa</span>
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} onInterest={handleInterest} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Suggestions (only when just welcome message) */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" /> Sugestões de consulta
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white border border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-accent transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-border px-4 py-3 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Descreva sua necessidade ou área de interesse..."
              className="flex-1 resize-none min-h-[44px] max-h-32 text-sm border-border focus:border-primary transition-colors rounded-xl"
              rows={1}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="h-11 w-11 p-0 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-sm shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 text-center">
            Pressione Enter para enviar · Shift+Enter para nova linha
          </p>
        </div>
      </div>

      <InterestModal patent={selectedPatent} open={showInterest} onClose={() => setShowInterest(false)} />
    </div>
  );
}