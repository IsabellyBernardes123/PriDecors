
import React, { useState } from 'react';
import { Plus, Trash2, Tag, DollarSign, Briefcase } from 'lucide-react';
import { Product } from '../types';

interface Props {
  products: Product[];
  onAdd: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductManagement: React.FC<Props> = ({ products, onAdd, onDelete }) => {
  const [formData, setFormData] = useState({
    name: '',
    manufacturingValue: '',
    laborCost: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.manufacturingValue || !formData.laborCost) return;

    const nextId = products.length > 0 
      ? (Math.max(...products.map(p => parseInt(p.id) || 0)) + 1).toString()
      : "1";

    const newProduct: Product = {
      id: nextId,
      name: formData.name,
      manufacturingValue: parseFloat(formData.manufacturingValue),
      laborCost: parseFloat(formData.laborCost)
    };

    onAdd(newProduct);
    setFormData({ name: '', manufacturingValue: '', laborCost: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Plus className="text-indigo-600" size={24} />
          Cadastrar Produto
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col md:grid md:grid-cols-4 gap-4 items-end">
          <div className="w-full space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Nome do Produto</label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm font-medium"
                placeholder="Ex: Almofada Personalizada"
                required
              />
            </div>
          </div>
          <div className="w-full space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Valor Venda (R$)</label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="number"
                step="0.01"
                value={formData.manufacturingValue}
                onChange={(e) => setFormData({ ...formData, manufacturingValue: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm font-medium"
                placeholder="0,00"
                required
              />
            </div>
          </div>
          <div className="w-full space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Mão de Obra (R$)</label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="number"
                step="0.01"
                value={formData.laborCost}
                onChange={(e) => setFormData({ ...formData, laborCost: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm font-medium"
                placeholder="0,00"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 h-[48px] mt-2 md:mt-0"
          >
            <Plus size={20} /> Adicionar
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-gray-800">Produtos no Sistema</h2>
          <span className="text-xs font-semibold text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">{products.length} cadastrados</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-left">ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-left">Nome</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Venda</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Custo M.O.</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Nenhum produto cadastrado até o momento.</td>
                </tr>
              ) : (
                [...products].sort((a, b) => parseInt(a.id) - parseInt(b.id)).map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">#{product.id}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-green-600 font-bold text-right">R$ {product.manufacturingValue.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-red-500 font-bold text-right">R$ {product.laborCost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => onDelete(product.id)}
                        className="p-2.5 text-gray-400 hover:text-red-600 transition-all rounded-xl hover:bg-red-50 group-hover:bg-gray-100"
                        title="Remover produto"
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

export default ProductManagement;
