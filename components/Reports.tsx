
import React, { useState, useMemo } from 'react';
import { FileText, Download, Calendar, Filter, ChevronDown, Package, TrendingUp, Calculator, DollarSign, Percent, BadgeDollarSign, Receipt } from 'lucide-react';
import { Product, ProductionLog, ProductionReportItem, Expense } from '../types';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Props {
  products: Product[];
  logs: ProductionLog[];
  expenses: Expense[];
}

const Reports: React.FC<Props> = ({ products, logs, expenses }) => {
  const TAX_RATE = 0.075;

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    productId: ''
  });

  const applyQuickFilter = (type: 'lastWeek' | 'currentMonth') => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (type === 'lastWeek') {
      start.setDate(now.getDate() - 7);
    } else if (type === 'currentMonth') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    setFilters({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      productId: filters.productId
    });
  };

  const filteredData = useMemo<ProductionReportItem[]>(() => {
    return logs
      .filter(log => {
        const dateMatch = (!filters.startDate || log.date >= filters.startDate) &&
                          (!filters.endDate || log.date <= filters.endDate);
        const productMatch = !filters.productId || log.productId === filters.productId;
        return dateMatch && productMatch;
      })
      .map(log => {
        const product = products.find(p => p.id === log.productId);
        const totalValue = (product?.manufacturingValue || 0) * log.quantity;
        const totalLaborPaid = (product?.laborCost || 0) * log.quantity;
        const grossProfit = totalValue - totalLaborPaid;
        const taxAmount = grossProfit > 0 ? grossProfit * TAX_RATE : 0;
        const netProfit = grossProfit - taxAmount;

        return {
          ...log,
          productName: product?.name || 'Produto Removido',
          totalValue,
          totalLaborPaid,
          grossProfit,
          taxAmount,
          netProfit
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, products, filters]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(ex => {
      return (!filters.startDate || ex.date >= filters.startDate) &&
             (!filters.endDate || ex.date <= filters.endDate);
    });
  }, [expenses, filters]);

  const totals = useMemo(() => {
    const prodTotals = filteredData.reduce((acc, curr) => ({
      totalValue: acc.totalValue + curr.totalValue,
      totalLabor: acc.totalLabor + curr.totalLaborPaid,
      totalGrossProfit: acc.totalGrossProfit + curr.grossProfit,
      totalTax: acc.totalTax + curr.taxAmount,
      totalNetProfit: acc.totalNetProfit + curr.netProfit,
      totalQuantity: acc.totalQuantity + curr.quantity
    }), { totalValue: 0, totalLabor: 0, totalGrossProfit: 0, totalTax: 0, totalNetProfit: 0, totalQuantity: 0 });

    const totalOtherExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.value, 0);
    const finalRealProfit = prodTotals.totalNetProfit - totalOtherExpenses;

    return { ...prodTotals, totalOtherExpenses, finalRealProfit };
  }, [filteredData, filteredExpenses]);

  const exportToExcel = () => {
    try {
      const data = filteredData.map(item => ({
        'ID': item.id,
        'Data': new Date(item.date).toLocaleDateString('pt-BR'),
        'Produto': item.productName,
        'Quantidade': item.quantity,
        'Faturamento (R$)': item.totalValue.toFixed(2),
        'Mão de Obra (R$)': item.totalLaborPaid.toFixed(2),
        'Lucro Bruto (R$)': item.grossProfit.toFixed(2),
        'Lucro Líquido (R$)': item.netProfit.toFixed(2)
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Relatório de Produção");
      XLSX.writeFile(wb, `Relatorio_Producao_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error("Erro ao exportar Excel:", error);
      alert("Erro ao gerar o arquivo Excel.");
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229);
      doc.text("PriDecor", 14, 20);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 31);
      doc.setDrawColor(229, 231, 235);
      doc.line(14, 36, 196, 36);

      doc.setFontSize(16);
      doc.setTextColor(31, 41, 55);
      doc.text("Relatório Gerencial Detalhado", 14, 48);

      const tableData = filteredData.map(item => [
        item.id,
        new Date(item.date).toLocaleDateString('pt-BR'),
        item.productName,
        item.quantity.toString(),
        `R$ ${item.totalValue.toFixed(2)}`,
        `R$ ${item.netProfit.toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: 62,
        head: [['ID', 'Data', 'Produto', 'Qtd', 'Faturamento', 'Lucro Líq.']],
        body: tableData,
        theme: 'striped',
        styles: { halign: 'center', fontSize: 8 }, 
        headStyles: { fillColor: [79, 70, 229] }
      });

      const finalY = (doc as any).lastAutoTable?.finalY || 70;

      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.text("Consolidado Financeiro", 14, finalY + 15);
      
      doc.setFontSize(10);
      doc.text(`Faturamento: R$ ${totals.totalValue.toLocaleString('pt-BR')}`, 14, finalY + 23);
      doc.text(`Mão de Obra: R$ ${totals.totalLabor.toLocaleString('pt-BR')}`, 14, finalY + 29);
      doc.text(`Imposto (7,5%): R$ ${totals.totalTax.toLocaleString('pt-BR')}`, 14, finalY + 35);
      doc.text(`Despesas Extras: R$ ${totals.totalOtherExpenses.toLocaleString('pt-BR')}`, 14, finalY + 41);
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text(`SALDO FINAL REAL: R$ ${totals.finalRealProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, finalY + 52);

      doc.save(`Relatorio_PriDecor_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Erro ao gerar o arquivo PDF.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Relatórios Financeiros</h1>
          <p className="text-gray-500">Saldo real abatendo impostos e despesas extras.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToExcel} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm">
            <Download size={18} /> Excel
          </button>
          <button onClick={exportToPDF} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm">
            <FileText size={18} /> PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Data Inicial</label>
            <input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Data Final</label>
            <input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Produto</label>
            <select value={filters.productId} onChange={(e) => setFilters({...filters, productId: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg outline-none bg-white">
              <option value="">Todos os Produtos</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2 items-end">
            <button onClick={() => applyQuickFilter('lastWeek')} className="flex-1 text-[10px] font-bold bg-indigo-50 text-indigo-600 p-2 rounded-lg hover:bg-indigo-100 transition-colors uppercase h-[42px]">Semana</button>
            <button onClick={() => applyQuickFilter('currentMonth')} className="flex-1 text-[10px] font-bold bg-indigo-50 text-indigo-600 p-2 rounded-lg hover:bg-indigo-100 transition-colors uppercase h-[42px]">Mês</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <SummaryCard title="Lucro Bruto" value={totals.totalGrossProfit.toFixed(2)} unit="R$" icon={<BadgeDollarSign />} color="indigo" />
        <SummaryCard title="Impostos" value={totals.totalTax.toFixed(2)} unit="R$" icon={<Percent className="text-red-500"/>} color="orange" />
        <SummaryCard title="Desp. Extras" value={totals.totalOtherExpenses.toFixed(2)} unit="R$" icon={<Receipt className="text-rose-500" />} color="red" />
        <SummaryCard title="Saldo Final" value={totals.finalRealProfit.toFixed(2)} unit="R$" icon={<TrendingUp />} color="green" />
        <SummaryCard title="Qtd. Total" value={totals.totalQuantity.toString()} unit="" icon={<Calculator className="text-purple-600" />} color="purple" />
      </div>

      {/* Tabela Simplificada no Relatório */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Resumo da Operação</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-center">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Faturamento</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">(-) Mão de Obra</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">(=) Lucro Bruto</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">(-) Impostos</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">(-) Desp. Extras</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-green-600">Saldo Final</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-center font-medium">
                <td className="px-6 py-4 text-gray-800">R$ {totals.totalValue.toFixed(2)}</td>
                <td className="px-6 py-4 text-red-400">R$ {totals.totalLabor.toFixed(2)}</td>
                <td className="px-6 py-4 text-indigo-600 font-bold">R$ {totals.totalGrossProfit.toFixed(2)}</td>
                <td className="px-6 py-4 text-orange-400">R$ {totals.totalTax.toFixed(2)}</td>
                <td className="px-6 py-4 text-rose-500">R$ {totals.totalOtherExpenses.toFixed(2)}</td>
                <td className="px-6 py-4 text-green-600 font-extrabold text-lg">R$ {totals.finalRealProfit.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, unit, icon, color }: { title: string, value: string, unit: string, icon: React.ReactNode, color: string }) => {
  const bgClasses: Record<string, string> = {
    blue: 'bg-blue-50',
    orange: 'bg-orange-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    indigo: 'bg-indigo-50',
    red: 'bg-rose-50'
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg ${bgClasses[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-xl font-bold text-gray-800">
          {unit} {parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: unit === 'R$' ? 2 : 0 })}
        </p>
      </div>
    </div>
  );
};

export default Reports;
