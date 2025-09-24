'use server';
/**
 * @fileOverview A flow to generate and send a daily activity report.
 *
 * - sendDailyReport - Generates a summary of the day's activities and emails it.
 * - SendDailyReportInput - The input type for the sendDailyReport function.
 * - SendDailyReportOutput - The return type for the sendDailyReport function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { mockAuditLogs } from '@/lib/data';
import { sendEmail } from '@/services/email';

const SendDailyReportInputSchema = z.object({
  recipientEmail: z.string().email().describe('The email address of the recipient.'),
});
export type SendDailyReportInput = z.infer<typeof SendDailyReportInputSchema>;

const SendDailyReportOutputSchema = z.object({
  success: z.boolean().describe('Whether the email was sent successfully.'),
});
export type SendDailyReportOutput = z.infer<typeof SendDailyReportOutputSchema>;

export async function sendDailyReport(input: SendDailyReportInput): Promise<SendDailyReportOutput> {
  return sendDailyReportFlow(input);
}

const getTodaysActivities = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return mockAuditLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= today && logDate < tomorrow;
    });
};

const prompt = ai.definePrompt({
  name: 'dailyReportPrompt',
  input: { schema: z.object({ activities: z.string() }) },
  output: { schema: z.object({ summary: z.string() }) },
  prompt: `You are an expert in summarizing business activities. Based on the following raw log data, generate a clear, concise, and human-readable daily activity report. Group similar items and provide a high-level overview.

Activities:
{{{activities}}}

Summary:
`,
});

const sendDailyReportFlow = ai.defineFlow(
  {
    name: 'sendDailyReportFlow',
    inputSchema: SendDailyReportInputSchema,
    outputSchema: SendDailyReportOutputSchema,
  },
  async (input) => {
    const todaysActivities = getTodaysActivities();
    if (todaysActivities.length === 0) {
        console.log("No activities today, skipping report.");
        return { success: true };
    }
    
    const activitiesString = todaysActivities.map(log => `${log.date}: [${log.user}] ${log.action} - ${log.details}`).join('\n');

    const { output } = await prompt({ activities: activitiesString });
    
    if (!output) {
      return { success: false };
    }

    const emailSubject = `Daily Activity Report - ${new Date().toLocaleDateString()}`;
    const success = await sendEmail(input.recipientEmail, emailSubject, output.summary);

    return { success };
  }
);
