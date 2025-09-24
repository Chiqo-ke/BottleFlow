// src/ai/flows/suggest-initial-salary-parameters.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest initial salary parameters (bottle prices per worker) based on a text description.
 *
 * The flow takes a text description as input and returns suggested salary parameters.
 * @file
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow
const SuggestInitialSalaryParametersInputSchema = z.object({
  description: z
    .string()
    .describe(
      'A detailed text description of the worker responsibilities, experience, and any other relevant information for determining salary parameters.'
    ),
});
export type SuggestInitialSalaryParametersInput =
  z.infer<typeof SuggestInitialSalaryParametersInputSchema>;

// Define the output schema for the flow
const SuggestInitialSalaryParametersOutputSchema = z.object({
  suggestedParameters: z
    .string()
    .describe(
      'Suggested salary parameters in a structured format (e.g., JSON or a readable text format) including bottle prices per worker.'
    ),
});
export type SuggestInitialSalaryParametersOutput =
  z.infer<typeof SuggestInitialSalaryParametersOutputSchema>;

// Define the flow function
export async function suggestInitialSalaryParameters(
  input: SuggestInitialSalaryParametersInput
): Promise<SuggestInitialSalaryParametersOutput> {
  return suggestInitialSalaryParametersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestInitialSalaryParametersPrompt',
  input: {schema: SuggestInitialSalaryParametersInputSchema},
  output: {schema: SuggestInitialSalaryParametersOutputSchema},
  prompt: `You are an expert in compensation structures, especially for bottle refurbishment businesses. Based on the following description, suggest initial salary parameters, focusing on bottle prices per worker. Provide the suggested parameters in a clear, structured format. 

Description: {{{description}}}`,
});

const suggestInitialSalaryParametersFlow = ai.defineFlow(
  {
    name: 'suggestInitialSalaryParametersFlow',
    inputSchema: SuggestInitialSalaryParametersInputSchema,
    outputSchema: SuggestInitialSalaryParametersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
