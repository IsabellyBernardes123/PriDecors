
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Trash2, Calendar, Package, Hash, Calculator, TrendingUp, DollarSign, BadgeDollarSign, Search, ChevronDown, X } from 'lucide-react';
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

  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, searchTerm]);

  const selectedProduct = useMemo(() => 
    products.find(p => p.id === formData.productId),
    [products, formData.productId]
  );

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
    if (!formData.productId || !formData.date || !formData.quantity) {
      alert('Selecione um produto e preencha a quantidade.');
      return;
    }

    const newLog: ProductionLog = {
      id: '',
      productId: formData.productId,
      date: formData.date,
      quantity: parseInt(formData.quantity)
    };

    onAdd(newLog);
    setFormData({ ...formData, quantity: '', productId: '' });
    setSearchTerm('');
  };

  const handleSelectProduct = (p: Product) => {
    setFormData({ ...formData, productId: p.id });
    setSearchTerm(p.name);
    setIsDropdownOpen(false);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard 
          title="Receita" 
          value={totals.totalValue} 
          icon={<Calculator size={14} className="text-blue-600" />} 
          color="blue" 
        />
        <SummaryCard 
          title="Mão de Obra" 
          value={totals.totalLabor} 
          icon={<DollarSign size={14} className="text-orange-600" />} 
          color="orange" 
        />
        <SummaryCard 
          title="L. Bruto" 
          value={totals.totalGrossProfit} 
          icon={<BadgeDollarSign size={14} className="text-indigo-600" />} 
          color="indigo" 
        />
        <SummaryCard 
          title="L. Líquido" 
          value={totals.totalNetProfit} 
          icon={<TrendingUp size={14} className="text-green-600" />} 
          color="green" 
        />
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="text-indigo-600" size={18} />
          Lançar Produção
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          
          {/* Seletor de Produto Pesquisável */}
          <div className="space-y-0.5 relative" ref={dropdownRef}>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-0.5">Produto</label>
            <div className="relative">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={14} />
              </div>
              <input
                type="text"
                placeholder="Pesquisar produto..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                  if (formData.productId) setFormData({...formData, productId: ''});
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="w-full pl-8 pr-8 py-1.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-xs bg-gray-50/30"
              />
              {searchTerm && (
                <button 
                  type="button"
                  onClick={() => { setSearchTerm(''); setFormData({...formData, productId: ''}); }}
                  className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                >
                  <X size={12} />
                </button>
              )}
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <ChevronDown size={14} />
              </div>
            </div>

            {/* Dropdown de Sugestões */}
            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProduct(p)}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 transition-colors flex items-center justify-between group ${formData.productId === p.id ? 'bg-indigo-50' : ''}`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{p.name}</span>
                        <span className="text-[10px] text-gray-400">R$ {p.manufacturingValue.toFixed(2)}</span>
                      </div>
                      <span className="text-[10px] text-indigo-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">#{p.id}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-gray-400 text-xs italic">
                    Nenhum produto encontrado
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-0.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-0.5">Data</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none text-xs bg-gray-50/30"
                required
              />
            </div>
          </div>

          <div className="space-y-0.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-0.5">Qtd</label>
            <div className="relative">
              <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none text-xs bg-gray-50/30"
                placeholder="0"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!formData.productId}
            className={`w-full font-bold py-1.5 px-4 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs h-[34px] shadow-sm ${
              formData.productId 
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-[0.98]' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus size={14} /> Lançar Produção
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800">Histórico de Lançamentos</h2>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{reportData.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-center">ID</th>
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-center">Data</th>
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-left">Produto</th>
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-center">Qtd</th>
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-right">Fatur.</th>
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-right">M.O.</th>
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-right">L. Bruto</th>
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-right">L. Líq.</th>
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-center w-12">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-10 text-center text-gray-400 text-xs italic">
                    <div className="flex flex-col items-center gap-2">
                      <Package size={24} className="opacity-10" />
                      Nenhum lançamento registrado.
                    </div>
                  </td>
                </tr>
              ) : (
                reportData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-3 py-2 text-[10px] font-mono text-gray-400 text-center">#{item.id}</td>
                    <td className="px-3 py-2 text-[10px] text-gray-600 text-center">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                    <td className="px-3 py-2 text-xs font-bold text-gray-800 text-left">{item.productName}</td>
                    <td className="px-3 py-2 text-xs text-gray-600 text-center">{item.quantity}</td>
                    <td className="px-3 py-2 text-xs text-blue-600 font-medium text-right">R$ {item.totalValue.toFixed(2)}</td>
                    <td className="px-3 py-2 text-xs text-orange-600 font-medium text-right">R$ {item.totalLaborPaid.toFixed(2)}</td>
                    <td className="px-3 py-2 text-xs text-indigo-600 font-medium text-right">R$ {item.grossProfit.toFixed(2)}</td>
                    <td className="px-3 py-2 text-xs font-bold text-green-600 text-right">R$ {item.netProfit.toFixed(2)}</td>
                    <td className="px-3 py-2 text-center">
                      <button 
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                        title="Excluir lançamento"
                      >
                        <Trash2 size={14} />
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
    <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
      <div className={`p-1.5 rounded-lg ${bgClasses[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-xs font-bold text-gray-800">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      </div>
    </div>
  );
};

export default ProductionLogs;
