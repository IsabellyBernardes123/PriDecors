
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ClipboardList, FileText, Menu, X, Loader2, AlertCircle, Receipt, Layers, Sparkles } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import CategoryManagement from './components/CategoryManagement';
import ProductionLogs from './components/ProductionLogs';
import Reports from './components/Reports';
import ExpenseManagement from './components/ExpenseManagement';
import AIAssistant from './components/AIAssistant';
import { Product, ProductionLog, Expense, Category } from './types';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<ProductionLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: cData, error: cErr } = await supabase.from('categories').select('*').order('name');
      if (cErr) console.warn('Categories table error:', cErr.message);
      setCategories((cData || []).map(c => ({ id: c.id.toString(), name: c.name })));

      const { data: pData, error: pErr } = await supabase.from('products').select('*').order('name');
      if (pErr) throw pErr;
      setProducts((pData || []).map(p => ({
        id: p.id.toString(),
        name: p.name,
        manufacturingValue: p.manufacturing_value,
        laborCost: p.labor_cost,
        categoryId: p.category_id?.toString() || ''
      })));

      const { data: lData, error: lErr } = await supabase.from('production_logs').select('*').order('date', { ascending: false });
      if (lErr) throw lErr;
      setLogs((lData || []).map(l => ({
        id: l.id.toString(),
        productId: l.product_id.toString(),
        date: l.date,
        quantity: l.quantity
      })));

      const { data: eData, error: eErr } = await supabase.from('expenses').select('*').order('date', { ascending: false });
      if (eErr) {
        console.warn('Erro ao carregar despesas:', eErr.message);
      } else {
        setExpenses((eData || []).map(ex => ({
          id: ex.id.toString(),
          description: ex.description,
          value: ex.value,
          date: ex.date
        })));
      }

    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com o banco de dados.');
      console.error('Erro de fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (name: string) => {
    try {
      const { data, error } = await supabase.from('categories').insert([{ name }]).select();
      if (error) throw error;
      if (data && data[0]) setCategories([...categories, { id: data[0].id.toString(), name: data[0].name }]);
    } catch (err: any) { alert('Erro ao salvar categoria: ' + err.message); }
  };

  const updateCategory = async (id: string, name: string) => {
    try {
      const { error } = await supabase.from('categories').update({ name }).eq('id', parseInt(id));
      if (error) throw error;
      setCategories(categories.map(c => c.id === id ? { ...c, name } : c));
    } catch (err: any) { alert('Erro ao atualizar categoria: ' + err.message); }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', parseInt(id));
      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
      setProducts(products.map(p => p.categoryId === id ? { ...p, categoryId: '' } : p));
    } catch (err: any) { alert('Erro ao excluir categoria: ' + err.message); }
  };

  const addProduct = async (product: Product) => {
    try {
      const { data, error } = await supabase.from('products').insert([{
        name: product.name,
        manufacturing_value: product.manufacturingValue,
        labor_cost: product.laborCost,
        category_id: product.categoryId ? parseInt(product.categoryId) : null
      }]).select();
      if (error) throw error;
      if (data && data[0]) setProducts([...products, { ...product, id: data[0].id.toString() }]);
    } catch (err: any) { alert('Erro ao salvar produto: ' + err.message); }
  };

  const updateProduct = async (product: Product) => {
    try {
      const { error } = await supabase.from('products').update({
        name: product.name,
        manufacturing_value: product.manufacturingValue,
        labor_cost: product.laborCost,
        category_id: product.categoryId ? parseInt(product.categoryId) : null
      }).eq('id', parseInt(product.id));
      if (error) throw error;
      setProducts(products.map(p => p.id === product.id ? product : p));
    } catch (err: any) { alert('Erro ao atualizar produto: ' + err.message); }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', parseInt(id));
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
      setLogs(logs.filter(l => l.productId !== id));
    } catch (err: any) { alert('Erro ao excluir produto: ' + err.message); }
  };
  
  const addLog = async (log: ProductionLog) => {
    try {
      const { data, error } = await supabase.from('production_logs').insert([{
        product_id: parseInt(log.productId),
        date: log.date,
        quantity: log.quantity
      }]).select();
      if (error) throw error;
      if (data && data[0]) setLogs([...logs, { ...log, id: data[0].id.toString() }]);
    } catch (err: any) { alert('Erro ao salvar lançamento: ' + err.message); }
  };

  const deleteLog = async (id: string) => {
    try {
      const { error } = await supabase.from('production_logs').delete().eq('id', parseInt(id));
      if (error) throw error;
      setLogs(logs.filter(l => l.id !== id));
    } catch (err: any) { alert('Erro ao excluir lançamento: ' + err.message); }
  };

  const addExpense = async (expense: Expense) => {
    try {
      const { data, error } = await supabase.from('expenses').insert([{
        description: expense.description,
        value: expense.value,
        date: expense.date
      }]).select();
      if (error) throw error;
      if (data && data[0]) setExpenses([...expenses, { ...expense, id: data[0].id.toString() }]);
    } catch (err: any) { alert('Erro ao salvar despesa: ' + err.message); }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', parseInt(id));
      if (error) throw error;
      setExpenses(expenses.filter(ex => ex.id !== id));
    } catch (err: any) { alert('Erro ao excluir despesa: ' + err.message); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-indigo-600">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-semibold">Sincronizando com PriDecor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-xl shadow border border-red-100 max-w-md text-center w-full">
          <AlertCircle className="text-red-500 mx-auto mb-3" size={48} />
          <h2 className="text-lg font-bold text-gray-800 mb-1">Erro de Conexão</h2>
          <p className="text-xs text-gray-600 mb-4">{error}</p>
          <button onClick={fetchData} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all">Tentar Novamente</button>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-700">
        <Sidebar />
        <main className="flex-1 p-3 md:p-6 pt-16 md:pt-6 w-full max-w-7xl mx-auto overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Dashboard products={products} logs={logs} expenses={expenses} />} />
            <Route path="/categorias" element={<CategoryManagement categories={categories} onAdd={addCategory} onUpdate={updateCategory} onDelete={deleteCategory} />} />
            <Route path="/produtos" element={<ProductManagement products={products} categories={categories} onAdd={addProduct} onUpdate={updateProduct} onDelete={deleteProduct} />} />
            <Route path="/lancamentos" element={<ProductionLogs products={products} logs={logs} onAdd={addLog} onDelete={deleteLog} />} />
            <Route path="/despesas" element={<ExpenseManagement expenses={expenses} onAdd={addExpense} onDelete={deleteExpense} />} />
            <Route path="/relatorios" element={<Reports products={products} logs={logs} expenses={expenses} />} />
            <Route path="/ia" element={<AIAssistant products={products} logs={logs} expenses={expenses} />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/categorias', label: 'Categorias', icon: Layers },
    { path: '/produtos', label: 'Produtos', icon: Package },
    { path: '/lancamentos', label: 'Lançamentos', icon: ClipboardList },
    { path: '/despesas', label: 'Outras Despesas', icon: Receipt },
    { path: '/relatorios', label: 'Relatórios', icon: FileText },
    { path: '/ia', label: 'Assistente IA', icon: Sparkles, highlight: true },
  ];

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <h1 className="text-lg font-bold text-indigo-700 flex items-center gap-2">
          <Package className="text-indigo-600" size={20} />
          PriDecor
        </h1>
        <button onClick={() => setIsOpen(!isOpen)} className="p-1.5 text-gray-600">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setIsOpen(false)} />}

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-52 bg-white border-r border-gray-200 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 hidden md:block">
          <h1 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
            <Package className="text-indigo-600" size={22} />
            PriDecor
          </h1>
          <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest font-semibold">Gestão de Confecção</p>
        </div>
        <nav className="px-2 mt-2 space-y-0.5">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-2 p-2 rounded-lg transition-all text-xs font-medium ${
                location.pathname === item.path 
                ? 'bg-indigo-600 text-white shadow' 
                : item.highlight 
                  ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-bold' 
                  : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              <item.icon size={16} className={item.highlight && location.pathname !== item.path ? 'animate-pulse' : ''} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default App;
