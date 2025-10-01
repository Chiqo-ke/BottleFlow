export type Product = {
  id: string;
  name: string;
  purchase_price: number;
  wash_price: number;
};

export type Worker = {
  id: string;
  name: string;
  phoneNumber: string;
  idNumber: string;
  role: string;
  email?: string;
};

export type PurchaseItem = {
  productId: string;
  productName: string;
  quantity: number;
  cost: number;
};

export type Purchase = {
  id:string;
  items: PurchaseItem[];
  totalCost: number;
  amountPaid: number;
  balance: number;
  date: string;
};

export type Task = {
  id: string;
  workerId: string;
  workerName: string;
  productId: string;
  productName: string;
  assignedQuantity: number;
  washedQuantity: number;
  date: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  salary: number;
  deduction: number;
  netPay: number;
};

export type Salary = {
  id: string;
  workerId: string;
  workerName: string;
  month: string;
  totalWashed: number;
  baseSalary: number;
  deductions: number;
  netSalary: number;
};

export type Stock = {
  productId: string;
  productName:string;
  purchased: number;
  washed: number;
  soldRaw: number;
  soldWashed: number;
  balance: number;
};

export type AuditLog = {
  id: string;
  date: string;
  user: string;
  action: string;
  details: string;
};
