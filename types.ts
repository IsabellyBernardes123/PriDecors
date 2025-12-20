
export interface Product {
  id: string;
  name: string;
  manufacturingValue: number; // Valor de venda/confecção total
  laborCost: number; // Valor pago pela mão de obra
}

export interface ProductionLog {
  id: string;
  productId: string;
  date: string;
  quantity: number;
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
