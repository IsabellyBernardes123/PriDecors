
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Plus className="text-indigo-600" size={24} />
          Novo Produto
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Nome do Produto</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                placeholder="Ex: Camiseta Polo"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Valor Confecção (R$)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="number"
                step="0.01"
                value={formData.manufacturingValue}
                onChange={(e) => setFormData({ ...formData, manufacturingValue: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Mão de Obra (R$)</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="number"
                step="0.01"
                value={formData.laborCost}
                onChange={(e) => setFormData({ ...formData, laborCost: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 h-[42px]"
          >
            <Plus size={18} /> Cadastrar
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Produtos Cadastrados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Nome</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Valor Venda</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Mão de Obra</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">Nenhum produto cadastrado.</td>
                </tr>
              ) : (
                [...products].sort((a, b) => parseInt(a.id) - parseInt(b.id)).map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-500 text-center">#{product.id}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 text-center">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium text-center">R$ {product.manufacturingValue.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-red-500 font-medium text-center">R$ {product.laborCost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => onDelete(product.id)}
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

export default ProductManagement;
