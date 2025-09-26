import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-initial-salary-parameters.ts';
import '@/ai/flows/resolve-salary-discrepancies.ts';
import '@/ai/flows/send-daily-report.ts';
import '@/ai/cron.ts';
