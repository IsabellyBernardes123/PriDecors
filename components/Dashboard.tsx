
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
    { value: '01', label: 'Jan' }, { value: '02', label: 'Fev' },
    { value: '03', label: 'Mar' }, { value: '04', label: 'Abr' },
    { value: '05', label: 'Mai' }, { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' }, { value: '08', label: 'Ago' },
    { value: '09', label: 'Set' }, { value: '10', label: 'Out' },
    { value: '11', label: 'Nov' }, { value: '12', label: 'Dez' }
  ];
  const years = Array.from({ length: 5 }, (_, i) => (now.getFullYear() - 2 + i).toString());

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1 text-indigo-600">
            <Sparkles size={12} className="animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Painel Administrativo</span>
          </div>
          <h1 className="text-lg font-extrabold text-gray-900 tracking-tight">
            Olá, <span className="text-indigo-600">Priscila!</span> 👋
          </h1>
        </div>

        <div className="bg-white p-1 px-2 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2 self-start sm:self-center">
          <Calendar size={14} className="text-gray-400" />
          <div className="flex gap-1.5">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-gray-50 border-none text-[10px] font-bold text-gray-700 rounded px-2 py-0.5 focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-gray-50 border-none text-[10px] font-bold text-gray-700 rounded px-2 py-0.5 focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Faturamento" value={`R$ ${stats.revenue.toFixed(2)}`} icon={<Calculator className="text-blue-600" size={14} />} color="blue" />
        <StatCard title="Mão de Obra" value={`R$ ${stats.labor.toFixed(2)}`} icon={<Users className="text-orange-500" size={14} />} color="orange" />
        <StatCard title="Lucro Bruto" value={`R$ ${stats.grossProfit.toFixed(2)}`} icon={<BadgeDollarSign className="text-indigo-600" size={14} />} color="indigo" />
        <StatCard title="Lucro Líquido" value={`R$ ${stats.productionNetProfit.toFixed(2)}`} icon={<TrendingUp className="text-green-500" size={14} />} color="green" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Total Produzido" value={`${stats.totalQuantity} un.`} icon={<Layers className="text-purple-600" size={14} />} color="blue" />
        <StatCard title="Imposto" value={`R$ ${stats.taxAmount.toFixed(2)}`} icon={<Percent className="text-red-500" size={14} />} color="red" />
        <StatCard title="Outras Despesas" value={`R$ ${stats.otherExpenses.toFixed(2)}`} icon={<Receipt className="text-rose-500" size={14} />} color="red" />
        <StatCard title="Valor Final" value={`R$ ${stats.finalNetProfit.toFixed(2)}`} icon={<Wallet className="text-emerald-600" size={14} />} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[300px]">
          <h3 className="text-xs font-bold text-gray-800 mb-4">Desempenho Diário</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} dy={5} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelFormatter={(label) => `Dia ${label}`}
                />
                <Line name="L. Bruto" type="monotone" dataKey="grossProfit" stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                <Line name="L. Líquido" type="monotone" dataKey="netProfit" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm min-h-[300px]">
          <h3 className="text-xs font-bold text-gray-800 mb-4">Mix de Produção</h3>
          <div className="h-[250px] flex flex-col xs:flex-row items-center">
            {productDistribution.length > 0 ? (
              <>
                <div className="flex-1 w-full h-full">
                  <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                    <PieChart>
                      <Pie
                        data={productDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={4}
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
                <div className="w-full xs:w-1/2 space-y-1 mt-2 xs:mt-0 xs:pl-4">
                  {productDistribution.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between p-1 rounded hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-[9px] font-semibold text-gray-600 truncate">{entry.name}</span>
                      </div>
                      <span className="text-[9px] font-bold text-gray-900 ml-1 shrink-0">{entry.value}u</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-300 space-y-1">
                <Package className="opacity-10" size={32} />
                <p className="text-[10px] italic">Sem dados.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color = 'indigo' }: { title: string, value: string, icon: React.ReactNode, color?: string }) => {
  const bgMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow transition-all min-h-[85px] group">
      <div className="flex items-center justify-between mb-1">
        <div className="bg-gray-50 p-1.5 rounded-lg group-hover:scale-105 transition-transform">{icon}</div>
      </div>
      <div>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{title}</p>
        <p className="text-sm font-bold text-gray-900 truncate tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;
