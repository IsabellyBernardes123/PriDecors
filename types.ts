
export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  manufacturingValue: number; // Valor de venda/confecção total
  laborCost: number; // Valor pago pela mão de obra
  categoryId: string; // Vínculo com a categoria
}

export interface ProductionLog {
  id: string;
  productId: string;
  date: string;
  quantity: number;
  paid?: boolean; // Status de pagamento
  invoiceNumber?: string; // Número da Nota Fiscal
}

export interface Expense {
  id: string;
  description: string;
  value: number;
  date: string;
}

export interface ProductionReportItem extends ProductionLog {
  productName: string;
  totalValue: number;
  totalLaborPaid: number;
  grossProfit: number;
  taxAmount: number;
  netProfit: number;
}
