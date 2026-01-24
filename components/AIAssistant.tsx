
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Loader2, RefreshCcw, BrainCircuit, AlertTriangle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Product, ProductionLog, Expense } from '../types';

interface Props {
  products: Product[];
  logs: ProductionLog[];
  expenses: Expense[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant: React.FC<Props> = ({ products, logs, expenses }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá Priscila! Sou o seu Assistente de Inteligência PriDecor. Posso analisar seus custos, lucros e ajudar na tomada de decisões. O que deseja saber hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const generateContext = () => {
    const summary = {
      empresa: "PriDecor - Confecção Têxtil",
      total_produtos: products.length,
      resumo_financeiro: {
          imposto_taxa: "7.5%",
          total_outras_despesas: expenses.reduce((acc, curr) => acc + curr.value, 0)
      },
      produtos: products.map(p => ({
        id: p.id,
        nome: p.name,
        preco_venda: p.manufacturingValue,
        custo_mao_obra: p.laborCost,
        lucro_bruto_unitario: p.manufacturingValue - p.laborCost
      })),
      producao_recente: logs.slice(0, 30).map(l => ({
        produto: products.find(p => p.id === l.productId)?.name || "Desconhecido",
        quantidade: l.quantity,
        data: l.date
      }))
    };
    return JSON.stringify(summary);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      
      if (!apiKey) {
        throw new Error("API_KEY_MISSING");
      }

      const ai = new GoogleGenAI({ apiKey: apiKey });
      const context = generateContext();
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `CONTEXTO DO SISTEMA PRIDECOR: ${context}\n\nPERGUNTA DA USUÁRIA (PRISCILA): ${userMsg}`,
        config: {
            systemInstruction: "Você é o Analista de BI da PriDecor. Responda de forma executiva, use R$ para valores e sempre mencione se a análise leva em conta os impostos de 7.5% e as despesas extras quando for relevante.",
            temperature: 0.7,
        }
      });

      const text = response.text;
      
      if (!text) {
        throw new Error("EMPTY_RESPONSE");
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (error: any) {
      console.error("Erro na IA:", error);
      
      let msgErro = "Ocorreu um erro ao processar sua solicitação.";
      
      if (error.message === "API_KEY_MISSING") {
        msgErro = "A chave de API não foi detectada. Verifique se a variável 'API_KEY' está configurada corretamente no seu ambiente (Vercel/Local).";
      } else if (error.message?.includes("404") || error.message?.includes("not found")) {
        msgErro = "O modelo de IA solicitado não foi encontrado. Tente novamente em alguns instantes.";
      } else if (error.message?.includes("403")) {
        msgErro = "Acesso negado à API. Verifique se sua chave do Google AI Studio é válida e se tem permissões para o modelo Gemini 3.";
      }

      setMessages(prev => [...prev, { role: 'assistant', content: msgErro }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-indigo-50 overflow-hidden animate-in fade-in zoom-in duration-300">
      {/* Header Centralizado */}
      <div className="bg-indigo-600 p-4 text-white relative shadow-md flex items-center justify-center min-h-[70px]">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
              <BrainCircuit size={18} className="text-white" />
            </div>
            <h2 className="text-sm font-bold tracking-tight">Cérebro PriDecor</h2>
          </div>
          <p className="text-[9px] text-indigo-100 flex items-center gap-1.5 font-medium uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
            Análise Preditiva Gemini 3
          </p>
        </div>
        
        <button 
          onClick={() => setMessages([messages[0]])} 
          className="absolute right-4 p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90 text-indigo-100 hover:text-white"
          title="Reiniciar conversa"
        >
          <RefreshCcw size={16} />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50"
      >
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-indigo-600 border border-indigo-100'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
              </div>
              <div className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm whitespace-pre-wrap ${
                msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none font-medium' 
                : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-2 items-center bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
              <Loader2 size={16} className="text-indigo-600 animate-spin" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Analisando sua produção...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex: Qual foi o faturamento total da semana passada?"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all pr-12"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`absolute right-1.5 p-2 rounded-lg transition-all ${
              input.trim() && !isLoading 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg active:scale-95' 
              : 'text-gray-300'
            }`}
          >
            <Send size={16} />
          </button>
        </form>
        <div className="flex items-center justify-center gap-1 mt-2">
            <AlertTriangle size={10} className="text-amber-500" />
            <p className="text-[9px] text-gray-400 font-medium italic">
              Se o erro persistir na Vercel, certifique-se de que fez um novo 'Deploy' após salvar a variável.
            </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
