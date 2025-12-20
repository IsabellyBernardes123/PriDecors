
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Product, ProductionLog, Expense } from '../types';
import { TrendingUp, Users, Sparkles, Percent, BadgeDollarSign, Calculator, Receipt, Calendar, Package, Layers, Wallet } from 'lucide-react';

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

  const periodKey = `${selectedYear}-${selectedMonth}`;

  const stats = useMemo(() => {
    let totalValue = 0;
    let totalLabor = 0;
    let totalQuantity = 0;
    
    const filteredLogs = logs.filter(log => {
      const [logYear, logMonth] = log.date.split('-');
      return logYear === selectedYear && logMonth === selectedMonth;
    });

    filteredLogs.forEach(log => {
      const product = products.find(p => p.id === log.productId);
      if (product) {
        totalValue += product.manufacturingValue * log.quantity;
        totalLabor += product.laborCost * log.quantity;
        totalQuantity += log.quantity;
      }
    });

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
      totalQuantity,
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
    const filteredLogs = logs.filter(log => {
      const [logYear, logMonth] = log.date.split('-');
      return logYear === selectedYear && logMonth === selectedMonth;
    });

    filteredLogs.forEach(log => {
      const product = products.find(p => p.id === log.productId);
      if (product) {
        const grossProfit = (product.manufacturingValue - product.laborCost) * log.quantity;
        const netProfit = grossProfit > 0 ? grossProfit * (1 - TAX_RATE) : grossProfit;
        const dayLabel = log.date.split('-')[2];
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-indigo-600 mb-1">
            <Sparkles size={16} className="animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Painel Administrativo</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Olá, <span className="text-indigo-600">Priscila!</span> 👋
          </h1>
          <p className="text-sm text-gray-500">
            Acompanhe o fechamento de <span className="font-bold text-gray-700">{months.find(m => m.value === selectedMonth)?.label}</span>.
          </p>
        </div>

        <div className="bg-white p-2 px-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 self-start sm:self-center w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Calendar size={18} />
            <span className="text-[10px] font-bold uppercase hidden xs:inline">Período:</span>
          </div>
          <div className="flex gap-2 flex-1">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="flex-1 bg-gray-50 border-none text-xs font-bold text-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="flex-1 bg-gray-50 border-none text-xs font-bold text-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* Fileira 1: Faturamento, Mão de Obra, Lucro Bruto, Lucro Líquido */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Faturamento" value={`R$ ${stats.revenue.toFixed(2)}`} icon={<Calculator className="text-blue-600" size={18} />} change="Receita" color="blue" />
        <StatCard title="Mão de Obra" value={`R$ ${stats.labor.toFixed(2)}`} icon={<Users className="text-orange-500" size={18} />} change="Produção" color="orange" />
        <StatCard title="Lucro Bruto" value={`R$ ${stats.grossProfit.toFixed(2)}`} icon={<BadgeDollarSign className="text-indigo-600" size={18} />} change="Confec." color="indigo" />
        <StatCard title="Lucro Líquido" value={`R$ ${stats.productionNetProfit.toFixed(2)}`} icon={<TrendingUp className="text-green-500" size={18} />} change="Líq. Prod." color="green" />
      </div>

      {/* Fileira 2: Total Produzido, Imposto, Outras Despesas, Valor Final */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Produzido" value={`${stats.totalQuantity} un.`} icon={<Layers className="text-purple-600" size={18} />} change="Volume" color="blue" />
        <StatCard title="Imposto" value={`R$ ${stats.taxAmount.toFixed(2)}`} icon={<Percent className="text-red-500" size={18} />} change="Governo" color="red" />
        <StatCard title="Outras Despesas" value={`R$ ${stats.otherExpenses.toFixed(2)}`} icon={<Receipt className="text-rose-500" size={18} />} change="Variáv." color="red" />
        <StatCard title="Valor Final" value={`R$ ${stats.finalNetProfit.toFixed(2)}`} icon={<Wallet className="text-emerald-600" size={18} />} change="Saldo Real" color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-gray-800">Desempenho Diário</h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Mês Atual</span>
          </div>
          <div className="h-64 sm:h-72 w-full min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ fontSize: '11px', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelFormatter={(label) => `Dia ${label}`}
                />
                <Line name="L. Bruto" type="monotone" dataKey="grossProfit" stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                <Line name="L. Líquido" type="monotone" dataKey="netProfit" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-6">Mix de Produção</h3>
          <div className="h-64 sm:h-72 flex flex-col xs:flex-row items-center min-h-[256px]">
            {productDistribution.length > 0 ? (
              <>
                <div className="flex-1 w-full h-full min-h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
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
                <div className="w-full xs:w-1/2 space-y-2 mt-4 xs:mt-0 xs:pl-6">
                  {productDistribution.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-[11px] font-semibold text-gray-600 truncate max-w-[120px]">{entry.name}</span>
                      </div>
                      <span className="text-[11px] font-bold text-gray-900">{entry.value} un.</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-2">
                <Package className="opacity-20" size={48} />
                <p className="text-xs italic">Nenhuma produção lançada neste período.</p>
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
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all duration-300 min-h-[105px] group">
      <div className="flex items-center justify-between mb-2">
        <div className="bg-gray-50 p-2 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${bgMap[color] || bgMap.indigo}`}>
          {change}
        </span>
      </div>
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">{title}</p>
        <p className="text-lg font-bold text-gray-900 truncate tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;
