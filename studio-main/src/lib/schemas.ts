import * as z from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  purchasePrice: z.coerce.number().positive('Price must be positive'),
  washPrice: z.coerce.number().positive('Price must be positive'),
});

const purchaseItemSchema = z.object({
  productId: z.string({ required_error: 'Please select a product.' }).min(1, 'Please select a product.'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1.'),
});

export const purchaseSchema = z.object({
  items: z.array(purchaseItemSchema).min(1, 'Please add at least one product.'),
  amountPaid: z.coerce.number().min(0, 'Amount paid cannot be negative.'),
});


export const taskSchema = z.object({
    productId: z.string({ required_error: 'Please select a product.' }),
    workerId: z.string({ required_error: 'Please select a worker.' }),
    assignedQuantity: z.coerce.number().int().positive('Quantity must be a positive number.'),
});

export const workerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  idNumber: z.string().min(5, 'ID number must be at least 5 characters'),
  role: z.string().min(2, 'Role must be at least 2 characters'),
});

export const dailySalarySchema = z.object({
  amount: z.coerce.number().positive('Salary amount must be a positive number.'),
});
