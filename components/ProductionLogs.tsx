
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Trash2, Calendar, Package, Hash, Calculator, TrendingUp, DollarSign, BadgeDollarSign, Search, ChevronDown, X, FileCode, CheckCircle2, AlertCircle, Loader2, Sparkles, Save, ShoppingBag, ReceiptText, Pencil } from 'lucide-react';
import { Product, ProductionLog, ProductionReportItem, Category } from '../types';

interface Props {
  products: Product[];
  categories: Category[];
  logs: ProductionLog[];
  onAdd: (log: ProductionLog) => Promise<void>;
  onUpdate: (log: ProductionLog) => Promise<void>;
  onDelete: (id: string) => void;
  onAddProduct: (product: Product) => Promise<Product | null>;
  onAddCategory: (name: string) => Promise<Category | null>;
  onTogglePaid?: (id: string, currentStatus: boolean) => Promise<void>;
}

interface PendingXMLItem {
  name: string;
  manufacturingValue: number;
  quantity: number;
  laborCost: number;
}

const ProductionLogs: React.FC<Props> = ({ products, categories, logs, onAdd, onUpdate, onDelete, onAddProduct, onAddCategory, onTogglePaid }) => {
  const TAX_RATE = 0.075;
  const [formData, setFormData] = useState({ productId: '', date: new Date().toISOString().split('T')[0], quantity: '', invoiceNumber: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingItems, setPendingItems] = useState<PendingXMLItem[]>([]);
  const [existingItemsInXML, setExistingItemsInXML] = useState<{productId: string, quantity: number}[]>([]);
  const [xmlDate, setXmlDate] = useState('');
  const [xmlInvoiceNumber, setXmlInvoiceNumber] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = useMemo(() => products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name)), [products, searchTerm]);

  const reportData = useMemo<ProductionReportItem[]>(() => {
    return logs.map(log => {
      const product = products.find(p => p.id === log.productId);
      if (!product) return { ...log, productName: 'Removido', totalValue: 0, totalLaborPaid: 0, grossProfit: 0, taxAmount: 0, netProfit: 0 };
      const totalValue = product.manufacturingValue * log.quantity;
      const totalLaborPaid = product.laborCost * log.quantity;
      const grossProfit = totalValue - totalLaborPaid;
      const taxAmount = grossProfit > 0 ? grossProfit * TAX_RATE : 0;
      return { ...log, productName: product.name, totalValue, totalLaborPaid, grossProfit, taxAmount, netProfit: grossProfit - taxAmount };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, products]);

  const totals = useMemo(() => reportData.reduce((acc, curr) => ({
    totalValue: acc.totalValue + curr.totalValue,
    totalLabor: acc.totalLabor + curr.totalLaborPaid,
    totalGrossProfit: acc.totalGrossProfit + curr.grossProfit,
    totalNetProfit: acc.totalNetProfit + curr.netProfit
  }), { totalValue: 0, totalLabor: 0, totalGrossProfit: 0, totalNetProfit: 0 }), [reportData]);

  // Função de busca de tag aprimorada para XML
  const getTagValue = (doc: Document | Element, tagName: string): string => {
    const elements = doc.getElementsByTagName(tagName);
    if (elements && elements.length > 0) {
      return elements[0].textContent?.trim() || "";
    }
    // Fallback para seletores mais complexos se necessário
    return "";
  };

  const handleEditClick = (log: ProductionLog) => {
    const product = products.find(p => p.id === log.productId);
    setEditingLogId(log.id);
    setFormData({
      productId: log.productId,
      date: log.date,
      quantity: log.quantity.toString(),
      invoiceNumber: log.invoiceNumber || ''
    });
    setSearchTerm(product?.name || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
    setFormData({ productId: '', date: new Date().toISOString().split('T')[0], quantity: '', invoiceNumber: '' });
    setSearchTerm('');
  };

  const handleImportXML = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const xmlDoc = new DOMParser().parseFromString(content, "text/xml");
        
        // Busca o número da nota (nNF)
        const nfNum = getTagValue(xmlDoc, "nNF");
        setXmlInvoiceNumber(nfNum);

        // Busca a data (prioriza vencimento vVenc)
        let foundDate = getTagValue(xmlDoc, "vVenc") || getTagValue(xmlDoc, "dhEmi") || getTagValue(xmlDoc, "dEmi");
        if (foundDate.includes('T')) foundDate = foundDate.split('T')[0];
        const finalDate = foundDate || new Date().toISOString().split('T')[0];
        setXmlDate(finalDate);

        const items = xmlDoc.querySelectorAll("det");
        const newPending: PendingXMLItem[] = [];
        const existingFound: {productId: string, quantity: number}[] = [];

        for (const item of Array.from(items)) {
          const prodEl = item.querySelector("prod");
          if (!prodEl) continue;
          
          const xProd = getTagValue(prodEl, "xProd");
          const qCom = parseFloat(getTagValue(prodEl, "qCom") || "0");
          const vUnCom = parseFloat(getTagValue(prodEl, "vUnCom") || "0");
          
          if (!xProd) continue;

          const matchedProduct = products.find(p => p.name.trim().toLowerCase() === xProd.trim().toLowerCase());
          
          if (matchedProduct) {
            existingFound.push({ productId: matchedProduct.id, quantity: Math.floor(qCom) });
          } else {
            newPending.push({ name: xProd, manufacturingValue: vUnCom, quantity: Math.floor(qCom), laborCost: 0 });
          }
        }

        if (newPending.length > 0) {
          setPendingItems(newPending);
          setExistingItemsInXML(existingFound);
          setShowPendingModal(true);
        } else if (existingFound.length > 0) {
          for (const entry of existingFound) {
            await onAdd({ 
              id: '', 
              productId: entry.productId, 
              date: finalDate, 
              quantity: entry.quantity, 
              paid: false, 
              invoiceNumber: nfNum 
            });
          }
          alert(`Sucesso! NF ${nfNum} importada com ${existingFound.length} itens.`);
        } else {
          alert("Nenhum item válido encontrado no XML.");
        }
      } catch (err) { 
        console.error("Erro XML:", err);
        alert("Erro ao processar o arquivo XML."); 
      } finally { 
        setIsImporting(false); 
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmPending = async () => {
    setIsImporting(true);
    try {
      let targetCatId = categories.find(c => c.name.toLowerCase().includes('xml'))?.id;
      if (!targetCatId) {
        const newCat = await onAddCategory('Importados XML');
        if (newCat) targetCatId = newCat.id;
      }
      
      // Salva itens novos
      for (const item of pendingItems) {
        const savedProduct = await onAddProduct({
          id: '', name: item.name, manufacturingValue: item.manufacturingValue, laborCost: item.laborCost, categoryId: targetCatId || ''
        });
        if (savedProduct) {
          await onAdd({ 
            id: '', 
            productId: savedProduct.id, 
            date: xmlDate, 
            quantity: item.quantity, 
            paid: false, 
            invoiceNumber: xmlInvoiceNumber 
          });
        }
      }

      // Salva itens que já existiam mas estavam no mesmo XML
      for (const entry of existingItemsInXML) {
        await onAdd({ 
          id: '', 
          productId: entry.productId, 
          date: xmlDate, 
          quantity: entry.quantity, 
          paid: false, 
          invoiceNumber: xmlInvoiceNumber 
        });
      }

      setShowPendingModal(false);
      alert(`Importação da NF ${xmlInvoiceNumber} concluída com sucesso!`);
    } catch (err: any) {
      alert(`Erro na confirmação: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId) return;
    
    const logData: ProductionLog = {
      id: editingLogId || '',
      productId: formData.productId,
      date: formData.date,
      quantity: parseInt(formData.quantity),
      paid: editingLogId ? logs.find(l => l.id === editingLogId)?.paid : false,
      invoiceNumber: formData.invoiceNumber.trim()
    };

    try {
      if (editingLogId) {
        await onUpdate(logData);
        setEditingLogId(null);
      } else {
        await onAdd(logData);
      }
      setFormData({ productId: '', date: new Date().toISOString().split('T')[0], quantity: '', invoiceNumber: '' });
      setSearchTerm('');
    } catch (err) {}
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard title="Receita" value={totals.totalValue} icon={<Calculator size={14} className="text-blue-600" />} color="blue" />
        <SummaryCard title="Mão de Obra" value={totals.totalLabor} icon={<DollarSign size={14} className="text-orange-600" />} color="orange" />
        <SummaryCard title="L. Bruto" value={totals.totalGrossProfit} icon={<BadgeDollarSign size={14} className="text-indigo-600" />} color="indigo" />
        <SummaryCard title="L. Líquido" value={totals.totalNetProfit} icon={<TrendingUp size={14} className="text-green-600" />} color="green" />
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-bold flex items-center gap-2">
            {editingLogId ? <Pencil className="text-indigo-600" size={18} /> : <Plus className="text-indigo-600" size={18} />}
            {editingLogId ? 'Editar Lançamento' : 'Lançar Produção'}
          </h2>
          {!editingLogId && (
            <button onClick={() => fileInputRef.current?.click()} disabled={isImporting} className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-xs font-bold border border-emerald-200 flex items-center gap-2 hover:bg-emerald-100 transition-all shadow-sm group">
              {isImporting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-emerald-500 group-hover:scale-110 transition-transform" />} 
              Importar XML (Vencimento + NF)
              <input type="file" accept=".xml" className="hidden" ref={fileInputRef} onChange={handleImportXML} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="relative md:col-span-2" ref={dropdownRef}>
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Produto</label>
            <div className="relative">
               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
               <input type="text" placeholder="Pesquisar..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setIsDropdownOpen(true); }} onFocus={() => setIsDropdownOpen(true)} className="w-full pl-8 pr-8 py-2 border rounded-xl text-xs outline-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all" />
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            </div>
            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                {filteredProducts.map(p => (
                  <button key={p.id} type="button" onClick={() => { setFormData({ ...formData, productId: p.id }); setSearchTerm(p.name); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-3 text-xs hover:bg-indigo-50 flex justify-between items-center border-b last:border-none">
                    <span className="font-semibold text-gray-700">{p.name}</span> 
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded">R$ {p.manufacturingValue.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div><label className="text-[10px] font-bold text-gray-500 uppercase ml-1">NF</label><input type="text" value={formData.invoiceNumber} onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-xs outline-none bg-gray-50" placeholder="Número..." /></div>
          <div><label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Vencimento</label><input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-xs outline-none bg-gray-50" required /></div>
          <div><label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Quantidade</label><input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-xs outline-none bg-gray-50" placeholder="0" required /></div>
          
          <div className="flex gap-2 md:col-span-5 lg:col-span-1">
            <button type="submit" disabled={!formData.productId} className={`flex-1 font-bold py-2 rounded-xl text-xs h-[38px] transition-all flex items-center justify-center gap-2 ${formData.productId ? 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700' : 'bg-gray-100 text-gray-400'}`}>
              {editingLogId ? <Save size={16} /> : <Plus size={16} />} 
              {editingLogId ? 'Atualizar' : 'Lançar'}
            </button>
            {editingLogId && (
              <button type="button" onClick={handleCancelEdit} className="bg-gray-100 text-gray-500 p-2 rounded-xl hover:bg-gray-200 transition-all">
                <X size={16} />
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b flex justify-between items-center">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Histórico de Lançamentos</h2>
          <span className="text-[10px] font-bold bg-white text-indigo-600 px-2 py-1 rounded-full border shadow-sm">{reportData.length} REGISTROS</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-white border-b text-[10px] font-bold text-gray-400 uppercase">
              <tr>
                <th className="px-2 py-3 text-center w-8">PAGO</th>
                <th className="px-3 py-3 text-center">NF</th>
                <th className="px-3 py-3 text-center">VENCIMENTO</th>
                <th className="px-4 py-3 text-left">PRODUTO</th>
                <th className="px-4 py-3 text-center">QTD</th>
                <th className="px-4 py-3 text-right">FATUR.</th>
                <th className="px-4 py-3 text-right">M.O.</th>
                <th className="px-4 py-3 text-right">L. BRUTO</th>
                <th className="px-4 py-3 text-right text-green-600">L. LÍQ.</th>
                <th className="px-4 py-3 text-center w-10">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs">
              {reportData.map(item => (
                <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${item.paid ? 'bg-green-50/40 italic text-gray-400' : ''} ${editingLogId === item.id ? 'bg-indigo-50' : ''}`}>
                  <td className="px-2 py-2.5 text-center">
                    <input 
                      type="checkbox" 
                      checked={!!item.paid} 
                      onChange={() => onTogglePaid && onTogglePaid(item.id, !!item.paid)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-2.5 text-center font-bold text-gray-500">{item.invoiceNumber || '-'}</td>
                  <td className="px-3 py-2.5 text-center font-medium text-gray-600">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                  <td className={`px-4 py-2.5 font-bold uppercase ${item.paid ? 'line-through opacity-50' : 'text-gray-800'}`}>{item.productName}</td>
                  <td className="px-4 py-2.5 text-center font-semibold text-gray-600">{item.quantity}</td>
                  <td className={`px-4 py-2.5 text-right font-medium ${item.paid ? 'text-gray-400' : 'text-blue-600'}`}>R$ {item.totalValue.toFixed(2)}</td>
                  <td className={`px-4 py-2.5 text-right font-medium ${item.paid ? 'text-green-600' : 'text-orange-600'}`}>R$ {item.totalLaborPaid.toFixed(2)}</td>
                  <td className={`px-4 py-2.5 text-right font-medium ${item.paid ? 'text-gray-400' : 'text-indigo-600'}`}>R$ {item.grossProfit.toFixed(2)}</td>
                  <td className={`px-4 py-2.5 text-right font-bold ${item.paid ? 'text-gray-400' : 'text-green-600'}`}>R$ {item.netProfit.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEditClick(item)} className="text-gray-300 hover:text-indigo-600 p-1 rounded transition-colors" title="Editar lançamento">
                        <Pencil size={14}/>
                      </button>
                      <button onClick={() => onDelete(item.id)} className="text-gray-300 hover:text-red-500 p-1 rounded transition-colors" title="Excluir lançamento">
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reportData.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-400 italic">Nenhum lançamento registrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPendingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => !isImporting && setShowPendingModal(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2"><ShoppingBag size={20} /> Itens Novos do XML</h3>
                <p className="text-xs text-indigo-100 mt-1 opacity-90">Defina o valor da mão de obra para os produtos abaixo.</p>
              </div>
              <button onClick={() => setShowPendingModal(false)} className="hover:bg-white/10 p-2 rounded-full transition-all"><X size={20} /></button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="mb-4 bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                 <ReceiptText className="text-indigo-500" size={18} />
                 <span className="text-xs font-bold text-gray-600">NF Identificada: {xmlInvoiceNumber || 'Não encontrada'}</span>
              </div>
              <table className="w-full">
                <thead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <tr className="border-b"><th className="pb-3 text-left">Produto</th><th className="pb-3 text-right">Preço Venda</th><th className="pb-3 text-center">Mão de Obra (R$)</th></tr>
                </thead>
                <tbody className="divide-y">
                  {pendingItems.map((item, idx) => (
                    <tr key={idx} className="group">
                      <td className="py-4 pr-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-800">{item.name}</span>
                          <span className="text-[10px] text-gray-400">Vencimento da NF: {xmlDate}</span>
                        </div>
                      </td>
                      <td className="py-4 text-right text-xs font-bold text-gray-600">R$ {item.manufacturingValue.toFixed(2)}</td>
                      <td className="py-4 pl-6 text-center">
                        <input type="number" step="0.01" placeholder="0,00" value={item.laborCost || ''} onChange={(e) => { const newItems = [...pendingItems]; newItems[idx].laborCost = parseFloat(e.target.value) || 0; setPendingItems(newItems); }} className="w-24 text-center py-1.5 border-2 border-indigo-50 rounded-lg text-xs font-bold outline-none focus:border-indigo-500" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
              <button onClick={() => setShowPendingModal(false)} disabled={isImporting} className="px-6 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancelar</button>
              <button onClick={handleConfirmPending} disabled={isImporting || pendingItems.some(i => i.laborCost <= 0)} className={`px-8 py-2 text-xs font-bold rounded-xl text-white ${isImporting || pendingItems.some(i => i.laborCost <= 0) ? 'bg-gray-200 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-200 shadow-lg'}`}>
                {isImporting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                Confirmar Lançamentos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ title, value, icon, color }: any) => {
  const bgs: any = { blue: 'bg-blue-50', orange: 'bg-orange-50', green: 'bg-green-50', indigo: 'bg-indigo-50' };
  return (
    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 transition-transform hover:scale-[1.02]">
      <div className={`p-2 rounded-lg ${bgs[color]}`}>{icon}</div>
      <div>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{title}</p>
        <p className="text-xs font-extrabold text-gray-800">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      </div>
    </div>
  );
};

export default ProductionLogs;
