
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ClipboardList, FileText, Menu, X, Loader2, AlertCircle, Receipt } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import ProductionLogs from './components/ProductionLogs';
import Reports from './components/Reports';
import ExpenseManagement from './components/ExpenseManagement';
import { Product, ProductionLog, Expense } from './types';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
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
      // Busca produtos
      const { data: pData, error: pErr } = await supabase.from('products').select('*');
      if (pErr) throw pErr;
      setProducts((pData || []).map(p => ({
        id: p.id.toString(),
        name: p.name,
        manufacturingValue: p.manufacturing_value,
        laborCost: p.labor_cost
      })));

      // Busca logs
      const { data: lData, error: lErr } = await supabase.from('production_logs').select('*');
      if (lErr) throw lErr;
      setLogs((lData || []).map(l => ({
        id: l.id.toString(),
        productId: l.product_id.toString(),
        date: l.date,
        quantity: l.quantity
      })));

      // Busca despesas (Tratamento individual para caso a tabela não exista)
      const { data: eData, error: eErr } = await supabase.from('expenses').select('*');
      if (eErr) {
        console.warn('Erro ao carregar despesas (provavelmente a tabela não existe):', eErr.message);
      } else {
        setExpenses((eData || []).map(ex => ({
          id: ex.id.toString(),
          description: ex.description,
          value: ex.value,
          date: ex.date // Mantém o formato salvo
        })));
      }

    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com o Supabase.');
      console.error('Erro de fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Product) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: product.name,
          manufacturing_value: product.manufacturingValue,
          labor_cost: product.laborCost
        }])
        .select();
      
      if (error) throw error;
      if (data) {
        setProducts([...products, { ...product, id: data[0].id.toString() }]);
      }
    } catch (err: any) {
      alert('Erro ao salvar produto: ' + err.message);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', parseInt(id));
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
      setLogs(logs.filter(l => l.productId !== id));
    } catch (err: any) {
      alert('Erro ao excluir produto: ' + err.message);
    }
  };
  
  const addLog = async (log: ProductionLog) => {
    try {
      const { data, error } = await supabase
        .from('production_logs')
        .insert([{
          product_id: parseInt(log.productId),
          date: log.date,
          quantity: log.quantity
        }])
        .select();
      
      if (error) throw error;
      if (data) {
        setLogs([...logs, { ...log, id: data[0].id.toString() }]);
      }
    } catch (err: any) {
      alert('Erro ao salvar lançamento: ' + err.message);
    }
  };

  const deleteLog = async (id: string) => {
    try {
      const { error } = await supabase.from('production_logs').delete().eq('id', parseInt(id));
      if (error) throw error;
      setLogs(logs.filter(l => l.id !== id));
    } catch (err: any) {
      alert('Erro ao excluir lançamento: ' + err.message);
    }
  };

  const addExpense = async (expense: Expense) => {
    try {
      // Enviamos sem ID para que o Supabase gere automaticamente (Serial/Identity)
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          description: expense.description,
          value: expense.value,
          date: expense.date
        }])
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        const savedExpense: Expense = {
          id: data[0].id.toString(),
          description: data[0].description,
          value: data[0].value,
          date: data[0].date
        };
        setExpenses([...expenses, savedExpense]);
      }
    } catch (err: any) {
      alert('Erro ao salvar despesa: ' + err.message + '\n\nCertifique-se de que a tabela "expenses" existe no seu Supabase.');
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', parseInt(id));
      if (error) throw error;
      setExpenses(expenses.filter(ex => ex.id !== id));
    } catch (err: any) {
      alert('Erro ao excluir despesa: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-indigo-600">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-semibold">Carregando dados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ops! Algo deu errado</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchData}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard products={products} logs={logs} expenses={expenses} />} />
            <Route path="/produtos" element={<ProductManagement products={products} onAdd={addProduct} onDelete={deleteProduct} />} />
            <Route path="/lancamentos" element={<ProductionLogs products={products} logs={logs} onAdd={addLog} onDelete={deleteLog} />} />
            <Route path="/despesas" element={<ExpenseManagement expenses={expenses} onAdd={addExpense} onDelete={deleteExpense} />} />
            <Route path="/relatorios" element={<Reports products={products} logs={logs} expenses={expenses} />} />
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
    { path: '/produtos', label: 'Produtos', icon: Package },
    { path: '/lancamentos', label: 'Lançamentos', icon: ClipboardList },
    { path: '/despesas', label: 'Outras Despesas', icon: Receipt },
    { path: '/relatorios', label: 'Relatórios', icon: FileText },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-indigo-600 text-white rounded-md shadow-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
            <Package className="text-indigo-600" />
            PriDecor
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Sistema de Gestão</p>
        </div>
        <nav className="px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default App;
