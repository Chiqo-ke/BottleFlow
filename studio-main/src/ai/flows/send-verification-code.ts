'use server';
/**
 * @fileOverview A flow to generate and send a verification code for account creation.
 *
 * - sendVerificationCode - Generates a verification code and emails it to the admin.
 * - SendVerificationCodeInput - The input type for the sendVerificationCode function.
 * - SendVerificationCodeOutput - The return type for the sendVerificationCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendEmail } from '@/services/email';

const SendVerificationCodeInputSchema = z.object({
  recipientEmail: z.string().email().describe('The email address of the admin.'),
  workerName: z.string().describe('The name of the worker being created.'),
});
export type SendVerificationCodeInput = z.infer<typeof SendVerificationCodeInputSchema>;

const SendVerificationCodeOutputSchema = z.object({
  success: z.boolean().describe('Whether the email was sent successfully.'),
  verificationCode: z.string().optional().describe('The generated verification code.'),
});
export type SendVerificationCodeOutput = z.infer<typeof SendVerificationCodeOutputSchema>;


export async function sendVerificationCode(input: SendVerificationCodeInput): Promise<SendVerificationCodeOutput> {
  return sendVerificationCodeFlow(input);
}

const generateVerificationCode = () => {
    // Generate a 6-digit random code
    return Math.floor(100000 + Math.random() * 900000).toString();
};


const sendVerificationCodeFlow = ai.defineFlow(
  {
    name: 'sendVerificationCodeFlow',
    inputSchema: SendVerificationCodeInputSchema,
    outputSchema: SendVerificationCodeOutputSchema,
  },
  async (input) => {
    const verificationCode = generateVerificationCode();
    const emailSubject = 'Admin Action Required: Verify New Worker Creation';
    const emailText = `Hello Admin,

A new worker account is being created for: ${input.workerName}.

To authorize this action, please use the following verification code:

Verification Code: ${verificationCode}

If you did not initiate this request, please ignore this email.

Thank you,
BottleFlow System`;

    const success = await sendEmail(input.recipientEmail, emailSubject, emailText);

    if (success) {
        return { success: true, verificationCode };
    } else {
        return { success: false };
    }
  }
);
