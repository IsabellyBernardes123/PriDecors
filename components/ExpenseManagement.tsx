
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
    monthYear: new Date().toISOString().slice(0, 7) // Formato YYYY-MM
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.value || !formData.monthYear) return;

    const newExpense: Expense = {
      id: "temp", // O App.tsx substituirá pelo ID real do banco
      description: formData.description,
      value: parseFloat(formData.value),
      date: `${formData.monthYear}-01` // Salva como YYYY-MM-01 para ser uma data válida
    };

    onAdd(newExpense);
    setFormData({ ...formData, description: '', value: '' });
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.value, 0);

  const formatMonth = (ym: string) => {
    if (!ym) return 'Data inválida';
    const [year, month] = ym.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Receipt className="text-red-500" size={24} />
          Cadastrar Despesa Mensal
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2 space-y-1">
            <label className="text-sm font-semibold text-gray-600">Descrição da Despesa</label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
                placeholder="Ex: Aluguel, Luz, Internet..."
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Valor (R$)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">R$</span>
              <input
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Mês Referente</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="month"
                value={formData.monthYear}
                onChange={(e) => setFormData({ ...formData, monthYear: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
                required
              />
            </div>
          </div>
          <div className="md:col-start-4">
            <button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 h-[42px]"
            >
              <Plus size={18} /> Salvar Despesa
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Histórico de Custos Fixos/Variáveis</h2>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase">Acumulado Geral</p>
            <p className="text-lg font-bold text-red-600">R$ {totalExpenses.toFixed(2)}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Mês/Ano</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-left">Descrição</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Valor</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Nenhuma despesa cadastrada.</td>
                </tr>
              ) : (
                [...expenses].sort((a, b) => b.date.localeCompare(a.date)).map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 text-center font-medium capitalize">
                      {formatMonth(expense.date)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 text-left">{expense.description}</td>
                    <td className="px-6 py-4 text-sm text-red-600 font-bold text-center">R$ {expense.value.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => onDelete(expense.id)}
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

export default ExpenseManagement;
