'use server';
/**
 * @fileOverview Resolves salary discrepancies using an LLM for edge cases and error corrections.
 *
 * - resolveSalaryDiscrepancies - A function that handles the resolution of salary discrepancies.
 * - ResolveSalaryDiscrepanciesInput - The input type for the resolveSalaryDiscrepancies function.
 * - ResolveSalaryDiscrepanciesOutput - The return type for the resolveSalaryDiscrepancies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResolveSalaryDiscrepanciesInputSchema = z.object({
  workerId: z.string().describe('The ID of the worker.'),
  calculatedSalary: z.number().describe('The initially calculated salary amount.'),
  deductions: z.number().describe('The total amount of deductions for the worker.'),
  bottleQuantity: z.number().describe('The total number of bottles handled by the worker.'),
  adminNotes: z.string().optional().describe('Any notes from the admin regarding potential issues.'),
  errorDetails: z.string().optional().describe('Details about the errors encountered during calculation.'),
});
export type ResolveSalaryDiscrepanciesInput = z.infer<typeof ResolveSalaryDiscrepanciesInputSchema>;

const ResolveSalaryDiscrepanciesOutputSchema = z.object({
  adjustedSalary: z.number().describe('The final adjusted salary amount after LLM analysis.'),
  explanation: z.string().describe('Explanation of the adjustment made by the LLM.'),
});
export type ResolveSalaryDiscrepanciesOutput = z.infer<typeof ResolveSalaryDiscrepanciesOutputSchema>;

export async function resolveSalaryDiscrepancies(input: ResolveSalaryDiscrepanciesInput): Promise<ResolveSalaryDiscrepanciesOutput> {
  return resolveSalaryDiscrepanciesFlow(input);
}

const resolveSalaryDiscrepanciesPrompt = ai.definePrompt({
  name: 'resolveSalaryDiscrepanciesPrompt',
  input: {schema: ResolveSalaryDiscrepanciesInputSchema},
  output: {schema: ResolveSalaryDiscrepanciesOutputSchema},
  prompt: `You are an expert in resolving salary discrepancies for bottle washers. 
Given the following information about a worker's performance and any errors encountered, determine the appropriate salary adjustment.

Worker ID: {{{workerId}}}
Calculated Salary: {{{calculatedSalary}}}
Deductions: {{{deductions}}}
Bottle Quantity: {{{bottleQuantity}}}
Admin Notes: {{{adminNotes}}}
Error Details: {{{errorDetails}}}

Consider all factors to provide a fair and accurate adjusted salary, along with a clear explanation for the adjustment.
Output the final adjusted salary and detailed reasoning behind your decision. Ensure the outputted salary is in a number format.
`, 
});

const resolveSalaryDiscrepanciesFlow = ai.defineFlow(
  {
    name: 'resolveSalaryDiscrepanciesFlow',
    inputSchema: ResolveSalaryDiscrepanciesInputSchema,
    outputSchema: ResolveSalaryDiscrepanciesOutputSchema,
  },
  async input => {
    const {output} = await resolveSalaryDiscrepanciesPrompt(input);
    return output!;
  }
);
