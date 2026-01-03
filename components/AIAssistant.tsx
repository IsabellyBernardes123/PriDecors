
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Loader2, RefreshCcw, BrainCircuit } from 'lucide-react';
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
      totalProducts: products.length,
      recentLogs: logs.slice(0, 10).map(l => ({
        product: products.find(p => p.id === l.productId)?.name,
        qty: l.quantity,
        date: l.date
      })),
      topExpenses: expenses.slice(0, 5),
      profitabilityModel: products.map(p => ({
        name: p.name,
        venda: p.manufacturingValue,
        mo: p.laborCost,
        lucroBruto: p.manufacturingValue - p.laborCost
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = generateContext();
      
      const prompt = `
        Você é o analista de negócios da PriDecor, uma confecção têxtil de Priscila.
        Contexto Atual do Negócio (JSON): ${context}
        Regras de Negócio: Imposto fixo de 7.5% sobre o lucro bruto da produção. Despesas extras abatem o lucro líquido final.
        
        Sua tarefa: Responder à pergunta de Priscila de forma executiva, baseada nos dados fornecidos.
        Seja amigável mas focado em resultados financeiros e eficiência.
        Pergunta: ${userMsg}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40
        }
      });

      const text = response.text || "Desculpe, não consegui processar sua análise agora.";
      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Ocorreu um erro ao conectar com o meu cérebro digital. Tente novamente em instantes." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-indigo-50 overflow-hidden animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="bg-indigo-600 p-4 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            <BrainCircuit size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold leading-none">Cérebro PriDecor</h2>
            <p className="text-[10px] text-indigo-100 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              Análise Preditiva Ativa
            </p>
          </div>
        </div>
        <button 
          onClick={() => setMessages([messages[0]])} 
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          title="Limpar conversa"
        >
          <RefreshCcw size={16} />
        </button>
      </div>

      {/* Messages */}
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
              <div className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none font-medium' 
                : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
              }`}>
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-2 items-center bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
              <Loader2 size={16} className="text-indigo-600 animate-spin" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Analisando dados...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre lucros, preços ou sugestões..."
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
        <p className="text-center text-[9px] text-gray-400 mt-2 font-medium">
          Sugestão: "Quais produtos tiveram melhor desempenho este mês?"
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;
