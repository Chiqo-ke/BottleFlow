import type { Product, Worker, Purchase, Task, Salary, Stock, AuditLog, PurchaseItem } from './types';

export let mockProducts: Product[] = [
  { id: 'prod-1', name: '750ml Wine Bottle', purchasePrice: 10, washPrice: 5 },
  { id: 'prod-2', name: '330ml Beer Bottle', purchasePrice: 5, washPrice: 3 },
  { id: 'prod-3', name: '1L Spirit Bottle', purchasePrice: 15, washPrice: 7 },
  { id: 'prod-4', name: '500ml Water Bottle', purchasePrice: 8, washPrice: 4 },
];

export let mockWorkers: Worker[] = [
  { id: 'worker-1', name: 'John Doe', phoneNumber: '0712345678', idNumber: '12345678', role: 'Washer' },
  { id: 'worker-2', name: 'Jane Smith', phoneNumber: '0787654321', idNumber: '87654321', role: 'Washer' },
  { id: 'worker-3', name: 'Peter Jones', phoneNumber: '0722222222', idNumber: '11223344', role: 'Sorter' },
];

export let mockPurchases: Purchase[] = [
    { 
        id: 'pur-1', 
        items: [{ productId: 'prod-1', productName: '750ml Wine Bottle', quantity: 500, cost: 500 * 10 }],
        totalCost: 5000,
        amountPaid: 5000,
        balance: 0,
        date: new Date().toISOString().split('T')[0]
    },
    { 
        id: 'pur-2', 
        items: [{ productId: 'prod-2', productName: '330ml Beer Bottle', quantity: 1000, cost: 1000 * 5 }],
        totalCost: 5000,
        amountPaid: 5000,
        balance: 0,
        date: new Date().toISOString().split('T')[0]
    },
];

export const mockTasks: Task[] = [];

export const mockSalaries: Salary[] = [];

export let mockStock: Stock[] = [
    { productId: 'prod-1', productName: '750ml Wine Bottle', purchased: 500, washed: 0, soldRaw: 0, soldWashed: 0, balance: 0 },
    { productId: 'prod-2', productName: '330ml Beer Bottle', purchased: 1000, washed: 0, soldRaw: 0, soldWashed: 0, balance: 0 },
    { productId: 'prod-3', productName: '1L Spirit Bottle', purchased: 0, washed: 0, soldRaw: 0, soldWashed: 0, balance: 0 },
    { productId: 'prod-4', productName: '500ml Water Bottle', purchased: 0, washed: 0, soldRaw: 0, soldWashed: 0, balance: 0 },
];

// In-memory store for payments
let workerPayments: Record<string, { date: string; amount: number }[]> = {};

export function getWorkerPayments(workerId: string | null) {
    if (workerId) {
        return workerPayments[workerId] || [];
    }
    return workerPayments;
}

export function updateWorkerPayments(workerId: string, amount: number) {
    if (!workerPayments[workerId]) {
        workerPayments[workerId] = [];
    }
    workerPayments[workerId].push({ date: new Date().toISOString(), amount });
}


export function updateStock(movement: { productId: string, type: 'purchase' | 'assign_wash' | 'complete_wash' | 'sell_raw' | 'sell_washed', quantity: number }): boolean {
    let stockItem = mockStock.find(s => s.productId === movement.productId);
    if (!stockItem) {
        const product = mockProducts.find(p => p.id === movement.productId);
        if(product) {
            stockItem = { productId: product.id, productName: product.name, purchased: 0, washed: 0, soldRaw: 0, soldWashed: 0, balance: 0 };
            mockStock.push(stockItem);
        } else {
            return false;
        }
    }


    switch (movement.type) {
        case 'purchase':
            stockItem.purchased += movement.quantity;
            break;
        case 'assign_wash': {
            const availableRaw = stockItem.purchased - mockTasks.filter(t => t.productId === movement.productId && t.status !== 'Completed').reduce((acc, t) => acc + t.assignedQuantity, 0) - stockItem.soldRaw;
            if (availableRaw < movement.quantity) return false;
            break;
        }
        case 'complete_wash':
            stockItem.washed += movement.quantity;
            stockItem.balance += movement.quantity;
            break;
        case 'sell_raw': {
             const availableRaw = stockItem.purchased - stockItem.washed - stockItem.soldRaw;
            if (availableRaw < movement.quantity) return false;
            stockItem.soldRaw += movement.quantity;
            break;
        }
        case 'sell_washed':
            if (stockItem.balance < movement.quantity) return false;
            stockItem.soldWashed += movement.quantity;
            stockItem.balance -= movement.quantity;
            break;
    }
    return true;
}


mockPurchases.forEach(purchase => {
    purchase.items.forEach(item => {
        updateStock({ productId: item.productId, type: 'purchase', quantity: item.quantity });
    });
});


export let mockAuditLogs: AuditLog[] = [
  { id: 'log-1', date: new Date(Date.now() - 3600000).toISOString(), user: 'admin', action: 'CREATE_WORKER', details: 'Added worker: John Doe' },
  { id: 'log-2', date: new Date(Date.now() - 7200000).toISOString(), user: 'manager', action: 'CREATE_PURCHASE', details: 'Recorded purchase of 500 x 750ml Wine Bottle' },
  { id: 'log-3', date: new Date(Date.now() - 10800000).toISOString(), user: 'admin', action: 'UPDATE_PRODUCT', details: 'Updated price for 330ml Beer Bottle' },
];

export function addAuditLog(log: Omit<AuditLog, 'id' | 'date'>) {
    const newLog: AuditLog = {
        ...log,
        id: `log-${Date.now()}`,
        date: new Date().toISOString(),
    };
    mockAuditLogs.unshift(newLog);
}