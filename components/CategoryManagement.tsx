
import React, { useState } from 'react';
import { Plus, Trash2, Layers, Pencil, X } from 'lucide-react';
import { Category } from '../types';

interface Props {
  categories: Category[];
  onAdd: (name: string) => void;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

const CategoryManagement: React.FC<Props> = ({ categories, onAdd, onUpdate, onDelete }) => {
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEditClick = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      onUpdate(editingId, name.trim());
    } else {
      onAdd(name.trim());
    }
    
    handleCancelEdit();
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all">
        <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          {editingId ? <Pencil className="text-indigo-600" size={18} /> : <Layers className="text-indigo-600" size={18} />}
          {editingId ? 'Editar Categoria' : 'Cadastrar Categoria'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1 space-y-1 w-full">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Nome da Categoria</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all text-xs font-medium"
              placeholder="Ex: Almofadas, Cortinas..."
              required
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              type="submit"
              className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-6 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 text-xs h-[32px]"
            >
              {editingId ? <Pencil size={14} /> : <Plus size={14} />}
              {editingId ? 'Atualizar' : 'Adicionar'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-1.5 px-3 rounded-lg transition-all flex items-center justify-center text-xs h-[32px]"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-3 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-800">Categorias Cadastradas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase text-left">ID</th>
                <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase text-left">Nome</th>
                <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase text-center w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-400 italic text-xs">Nenhuma categoria cadastrada.</td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className={`hover:bg-gray-50/50 transition-colors ${editingId === cat.id ? 'bg-indigo-50/50' : ''}`}>
                    <td className="px-4 py-2 text-[10px] font-mono text-gray-400">#{cat.id}</td>
                    <td className="px-4 py-2 text-xs font-bold text-gray-800">{cat.name}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => handleEditClick(cat)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 rounded transition-all hover:bg-indigo-50"
                          title="Editar categoria"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={() => onDelete(cat.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-all hover:bg-red-50"
                          title="Excluir categoria"
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

export default CategoryManagement;
