
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, DollarSign, Briefcase, Layers, Pencil, X } from 'lucide-react';
import { Product, Category } from '../types';

interface Props {
  products: Product[];
  categories: Category[];
  onAdd: (product: Product) => void;
  onUpdate: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductManagement: React.FC<Props> = ({ products, categories, onAdd, onUpdate, onDelete }) => {
  const [formData, setFormData] = useState({
    name: '',
    manufacturingValue: '',
    laborCost: '',
    categoryId: ''
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      manufacturingValue: product.manufacturingValue.toString(),
      laborCost: product.laborCost.toString(),
      categoryId: product.categoryId
    });
    // Scroll smoothly to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', manufacturingValue: '', laborCost: '', categoryId: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.manufacturingValue || !formData.laborCost || !formData.categoryId) {
      alert('Preencha todos os campos, incluindo a categoria.');
      return;
    }

    const productData: Product = {
      id: editingId || '', 
      name: formData.name,
      manufacturingValue: parseFloat(formData.manufacturingValue),
      laborCost: parseFloat(formData.laborCost),
      categoryId: formData.categoryId
    };

    if (editingId) {
      onUpdate(productData);
    } else {
      onAdd(productData);
    }
    
    handleCancelEdit();
  };

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || '-';
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all duration-300">
        <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          {editingId ? <Pencil className="text-indigo-600" size={18} /> : <Plus className="text-indigo-600" size={18} />}
          {editingId ? 'Editar Produto' : 'Cadastrar Produto'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col md:grid md:grid-cols-5 gap-3 items-end">
          <div className="w-full space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Nome</label>
            <div className="relative">
              <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all text-xs"
                placeholder="Ex: Almofada"
                required
              />
            </div>
          </div>

          <div className="w-full space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Categoria</label>
            <div className="relative">
              <Layers className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all text-xs appearance-none"
                required
              >
                <option value="">Selecione...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Venda (R$)</label>
            <div className="relative">
              <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="number"
                step="0.01"
                value={formData.manufacturingValue}
                onChange={(e) => setFormData({ ...formData, manufacturingValue: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all text-xs"
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div className="w-full space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">M.O. (R$)</label>
            <div className="relative">
              <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="number"
                step="0.01"
                value={formData.laborCost}
                onChange={(e) => setFormData({ ...formData, laborCost: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all text-xs"
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 w-full">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 text-xs h-[32px]"
            >
              {editingId ? <Pencil size={14} /> : <Plus size={14} />}
              {editingId ? 'Atualizar' : 'Adicionar'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-1.5 px-3 rounded-lg transition-all flex items-center justify-center text-xs h-[32px]"
                title="Cancelar edição"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-3 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-gray-800">Produtos</h2>
          <span className="text-[10px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-full shadow-sm">{products.length} cadastrados</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-left">ID</th>
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-left">Nome</th>
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-left">Categoria</th>
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-right">Venda</th>
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-right">M.O.</th>
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-gray-400 italic text-xs">Sem produtos cadastrados.</td>
                </tr>
              ) : (
                [...products].sort((a, b) => parseInt(a.id) - parseInt(b.id)).map((product) => (
                  <tr key={product.id} className={`hover:bg-gray-50/50 transition-colors group ${editingId === product.id ? 'bg-indigo-50/50' : ''}`}>
                    <td className="px-3 py-2 text-[10px] font-mono text-gray-400">#{product.id}</td>
                    <td className="px-3 py-2 text-xs font-bold text-gray-800">{product.name}</td>
                    <td className="px-3 py-2 text-[10px] font-semibold text-indigo-500">{getCategoryName(product.categoryId)}</td>
                    <td className="px-3 py-2 text-xs text-green-600 font-bold text-right">R$ {product.manufacturingValue.toFixed(2)}</td>
                    <td className="px-3 py-2 text-xs text-red-500 font-bold text-right">R$ {product.laborCost.toFixed(2)}</td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => handleEditClick(product)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 transition-all rounded hover:bg-indigo-50"
                          title="Editar produto"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={() => onDelete(product.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-all rounded hover:bg-red-50"
                          title="Excluir produto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
