
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Product, ProductionLog, Expense } from '../types';
import { TrendingUp, Package, Users, Wallet, Sparkles, Percent, BadgeDollarSign, Calculator, Receipt, Calendar } from 'lucide-react';

interface Props {
  products: Product[];
  logs: ProductionLog[];
  expenses: Expense[];
}

const Dashboard: React.FC<Props> = ({ products, logs, expenses }) => {
  const TAX_RATE = 0.075;
  const now = new Date();
  
  const [selectedMonth, setSelectedMonth] = useState((now.getMonth() + 1).toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(now.getFullYear().toString());

  const periodKey = `${selectedYear}-${selectedMonth}`; // Ex: "2025-12"

  const stats = useMemo(() => {
    let totalValue = 0;
    let totalLabor = 0;
    
    // Filtrar lançamentos pelo mês/ano selecionado
    const filteredLogs = logs.filter(log => {
      const [logYear, logMonth] = log.date.split('-');
      return logYear === selectedYear && logMonth === selectedMonth;
    });

    filteredLogs.forEach(log => {
      const product = products.find(p => p.id === log.productId);
      if (product) {
        totalValue += product.manufacturingValue * log.quantity;
        totalLabor += product.laborCost * log.quantity;
      }
    });

    // CORREÇÃO: Filtrar despesas verificando se a data da despesa começa com "AAAA-MM"
    const totalOtherExpenses = expenses
      .filter(ex => ex.date.startsWith(periodKey))
      .reduce((acc, curr) => acc + curr.value, 0);

    const grossProfit = totalValue - totalLabor;
    const taxAmount = grossProfit > 0 ? grossProfit * TAX_RATE : 0;
    const netProfitFromProduction = grossProfit - taxAmount;
    const finalNetProfit = netProfitFromProduction - totalOtherExpenses;

    return {
      revenue: totalValue,
      labor: totalLabor,
      grossProfit,
      taxAmount,
      productionNetProfit: netProfitFromProduction,
      otherExpenses: totalOtherExpenses,
      finalNetProfit,
      productsCount: products.length,
      logsCount: filteredLogs.length
    };
  }, [products, logs, expenses, selectedMonth, selectedYear, periodKey]);

  const chartData = useMemo(() => {
    const daily: Record<string, { date: string, netProfit: number, grossProfit: number }> = {};
    
    // Filtrar logs para o gráfico (apenas do mês selecionado)
    const filteredLogs = logs.filter(log => {
      const [logYear, logMonth] = log.date.split('-');
      return logYear === selectedYear && logMonth === selectedMonth;
    });

    filteredLogs.forEach(log => {
      const product = products.find(p => p.id === log.productId);
      if (product) {
        const grossProfit = (product.manufacturingValue - product.laborCost) * log.quantity;
        const netProfit = grossProfit > 0 ? grossProfit * (1 - TAX_RATE) : grossProfit;
        
        const dayLabel = log.date.split('-')[2]; // Pega o dia
        
        daily[log.date] = {
          date: dayLabel,
          grossProfit: (daily[log.date]?.grossProfit || 0) + grossProfit,
          netProfit: (daily[log.date]?.netProfit || 0) + netProfit
        };
      }
    });
    return Object.values(daily).sort((a, b) => a.date.localeCompare(b.date));
  }, [logs, products, selectedMonth, selectedYear]);

  const productDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    
    const filteredLogs = logs.filter(log => {
      const [logYear, logMonth] = log.date.split('-');
      return logYear === selectedYear && logMonth === selectedMonth;
    });

    filteredLogs.forEach(log => {
      const product = products.find(p => p.id === log.productId);
      if (product) {
        distribution[product.name] = (distribution[product.name] || 0) + log.quantity;
      }
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value })).slice(0, 5);
  }, [logs, products, selectedMonth, selectedYear]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const months = [
    { value: '01', label: 'Janeiro' }, { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' }, { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' }, { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' }, { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' }, { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => (now.getFullYear() - 2 + i).toString());

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Sparkles size={20} className="animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-widest">Painel Administrativo</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Olá, <span className="text-indigo-600">Priscila!</span> 👋
          </h1>
          <p className="text-lg text-gray-500">
            Acompanhe o fechamento real do mês de <span className="font-bold text-gray-700">{months.find(m => m.value === selectedMonth)?.label}</span>.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar size={18} />
            <span className="text-xs font-bold uppercase">Período:</span>
          </div>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-gray-50 border-none text-sm font-bold text-gray-700 rounded-lg px-3 py-1 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-gray-50 border-none text-sm font-bold text-gray-700 rounded-lg px-3 py-1 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </header>

      <div className="space-y-6">
        {/* Primeira Fileira */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Faturamento" value={`R$ ${stats.revenue.toFixed(2)}`} icon={<Calculator className="text-blue-600" />} change="Total Bruto" color="blue" />
          <StatCard title="Lucro Bruto" value={`R$ ${stats.grossProfit.toFixed(2)}`} icon={<BadgeDollarSign className="text-indigo-600" />} change="Confecção" color="indigo" />
          <StatCard title="Mão de Obra" value={`R$ ${stats.labor.toFixed(2)}`} icon={<Users className="text-orange-500" />} change="Produção" color="orange" />
        </div>

        {/* Segunda Fileira */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Lucro Líquido Real" value={`R$ ${stats.finalNetProfit.toFixed(2)}`} icon={<TrendingUp className="text-green-500" />} change="Saldo Final" color="green" />
          <StatCard title="Imposto (7,5%)" value={`R$ ${stats.taxAmount.toFixed(2)}`} icon={<Percent className="text-red-500" />} change="Governo" color="red" />
          <StatCard title="Despesas Extras" value={`R$ ${stats.otherExpenses.toFixed(2)}`} icon={<Receipt className="text-rose-500" />} change="Variáveis" color="red" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Desempenho Diário</h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-bold uppercase">Dias do Mês</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelFormatter={(label) => `Dia ${label}`}
                />
                <Line name="L. Bruto" type="monotone" dataKey="grossProfit" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Line name="L. Líquido" type="monotone" dataKey="netProfit" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Mix de Produção no Período</h3>
          <div className="h-80 flex flex-col md:flex-row items-center">
            {productDistribution.length > 0 ? (
              <>
                <div className="flex-1 w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {productDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3 mt-4 md:mt-0 w-full">
                  {productDistribution.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-sm font-medium text-gray-600">{entry.name}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-800">{entry.value} un.</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic">
                Nenhuma produção lançada neste mês.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, change, color = 'indigo' }: { title: string, value: string, icon: React.ReactNode, change: string, color?: string }) => {
  const bgMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-gray-50 p-2 rounded-lg">{icon}</div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${bgMap[color] || bgMap.indigo}`}>
          {change}
        </span>
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1 truncate">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;
