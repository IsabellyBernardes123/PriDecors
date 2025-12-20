
import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Calendar, Package, Hash, Calculator, TrendingUp, DollarSign, Percent, BadgeDollarSign } from 'lucide-react';
import { Product, ProductionLog, ProductionReportItem } from '../types';

interface Props {
  products: Product[];
  logs: ProductionLog[];
  onAdd: (log: ProductionLog) => void;
  onDelete: (id: string) => void;
}

const ProductionLogs: React.FC<Props> = ({ products, logs, onAdd, onDelete }) => {
  const TAX_RATE = 0.075;

  const [formData, setFormData] = useState({
    productId: '',
    date: new Date().toISOString().split('T')[0],
    quantity: ''
  });

  const reportData = useMemo<ProductionReportItem[]>(() => {
    return logs.map(log => {
      const product = products.find(p => p.id === log.productId);
      
      if (!product) {
        return {
          ...log,
          productName: 'Produto Removido',
          totalValue: 0,
          totalLaborPaid: 0,
          grossProfit: 0,
          taxAmount: 0,
          netProfit: 0
        };
      }
      const totalValue = product.manufacturingValue * log.quantity;
      const totalLaborPaid = product.laborCost * log.quantity;
      const grossProfit = totalValue - totalLaborPaid;
      const taxAmount = grossProfit > 0 ? grossProfit * TAX_RATE : 0;
      const netProfit = grossProfit - taxAmount;

      return {
        ...log,
        productName: product.name,
        totalValue,
        totalLaborPaid,
        grossProfit,
        taxAmount,
        netProfit
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, products]);

  const totals = useMemo(() => {
    return reportData.reduce((acc, curr) => ({
      totalValue: acc.totalValue + curr.totalValue,
      totalLabor: acc.totalLabor + curr.totalLaborPaid,
      totalGrossProfit: acc.totalGrossProfit + curr.grossProfit,
      totalNetProfit: acc.totalNetProfit + curr.netProfit
    }), { totalValue: 0, totalLabor: 0, totalGrossProfit: 0, totalNetProfit: 0 });
  }, [reportData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.date || !formData.quantity) return;

    // Enviamos id como string vazia; o App.tsx gerará o próximo ID sequencial
    const newLog: ProductionLog = {
      id: '',
      productId: formData.productId,
      date: formData.date,
      quantity: parseInt(formData.quantity)
    };

    onAdd(newLog);
    setFormData({ ...formData, quantity: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard 
          title="Faturamento" 
          value={totals.totalValue} 
          icon={<Calculator className="text-blue-600" />} 
          color="blue" 
        />
        <SummaryCard 
          title="Mão de Obra" 
          value={totals.totalLabor} 
          icon={<DollarSign className="text-orange-600" />} 
          color="orange" 
        />
        <SummaryCard 
          title="Lucro Bruto" 
          value={totals.totalGrossProfit} 
          icon={<BadgeDollarSign className="text-indigo-600" />} 
          color="indigo" 
        />
        <SummaryCard 
          title="Lucro Líquido" 
          value={totals.totalNetProfit} 
          icon={<TrendingUp className="text-green-600" />} 
          color="green" 
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Plus className="text-indigo-600" size={24} />
          Lançar Produção
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Produto</label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all appearance-none bg-white"
                required
              >
                <option value="">Selecione...</option>
                {[...products].sort((a, b) => a.name.localeCompare(b.name)).map(p => (
                  <option key={p.id} value={p.id}>{p.name} (#{p.id})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Data</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Quantidade</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                placeholder="0"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 h-[42px]"
          >
            <Plus size={18} /> Lançar
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Histórico Detalhado</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Produto</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Qtd</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Faturamento</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Mão de Obra</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Lucro Bruto</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Lucro Líq.</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-400">Nenhum lançamento realizado.</td>
                </tr>
              ) : (
                reportData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-400 text-center">#{item.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 text-center">{item.productName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono text-center">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm text-blue-600 font-medium text-center">R$ {item.totalValue.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-orange-600 font-medium text-center">R$ {item.totalLaborPaid.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-indigo-600 font-medium text-center">R$ {item.grossProfit.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600 text-center">R$ {item.netProfit.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => onDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) => {
  const bgClasses: Record<string, string> = {
    blue: 'bg-blue-50',
    orange: 'bg-orange-50',
    green: 'bg-green-50',
    indigo: 'bg-indigo-50'
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg ${bgClasses[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-xl font-bold text-gray-800">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      </div>
    </div>
  );
};

export default ProductionLogs;
