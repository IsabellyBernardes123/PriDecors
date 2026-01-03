
import React, { useState } from 'react';
import { Plus, Trash2, Wallet, Receipt, Calendar } from 'lucide-react';
import { Expense } from '../types';

interface Props {
  expenses: Expense[];
  onAdd: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const ExpenseManagement: React.FC<Props> = ({ expenses, onAdd, onDelete }) => {
  const [formData, setFormData] = useState({
    description: '',
    value: '',
    monthYear: new Date().toISOString().slice(0, 7) 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.value || !formData.monthYear) return;

    const newExpense: Expense = {
      id: "temp",
      description: formData.description,
      value: parseFloat(formData.value),
      date: `${formData.monthYear}-01`
    };

    onAdd(newExpense);
    setFormData({ ...formData, description: '', value: '' });
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.value, 0);

  const formatMonth = (ym: string) => {
    if (!ym) return 'Data inválida';
    const [year, month] = ym.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Receipt className="text-red-500" size={18} />
          Cadastrar Despesa
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="md:col-span-2 space-y-0.5">
            <label className="text-[10px] font-semibold text-gray-600">Descrição</label>
            <div className="relative">
              <Wallet className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-red-500 outline-none text-xs"
                placeholder="Ex: Aluguel..."
                required
              />
            </div>
          </div>
          <div className="space-y-0.5">
            <label className="text-[10px] font-semibold text-gray-600">Valor (R$)</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px]">R$</span>
              <input
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-red-500 outline-none text-xs"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div className="space-y-0.5">
            <label className="text-[10px] font-semibold text-gray-600">Mês</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="month"
                value={formData.monthYear}
                onChange={(e) => setFormData({ ...formData, monthYear: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-red-500 outline-none text-xs"
                required
              />
            </div>
          </div>
          <div className="md:col-start-4">
            <button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 text-xs h-[32px]"
            >
              <Plus size={14} /> Salvar
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-3 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-xs font-bold text-gray-800 uppercase">Histórico de Custos</h2>
          <div className="text-right">
            <p className="text-[10px] font-bold text-red-600">Total: R$ {totalExpenses.toFixed(2)}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Mês</th>
                <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">Descrição</th>
                <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Valor</th>
                <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-xs italic">Sem despesas registradas.</td>
                </tr>
              ) : (
                [...expenses].sort((a, b) => b.date.localeCompare(a.date)).map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-1.5 text-[10px] text-gray-500 text-center font-medium capitalize">
                      {formatMonth(expense.date)}
                    </td>
                    <td className="px-4 py-1.5 text-xs font-semibold text-gray-800 text-left">{expense.description}</td>
                    <td className="px-4 py-1.5 text-xs text-red-600 font-bold text-center">R$ {expense.value.toFixed(2)}</td>
                    <td className="px-4 py-1.5 text-center">
                      <button 
                        onClick={() => onDelete(expense.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
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

export default ExpenseManagement;
