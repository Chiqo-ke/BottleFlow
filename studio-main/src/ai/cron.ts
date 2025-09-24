import cron from 'node-cron';
import { sendDailyReport } from './flows/send-daily-report';

// Schedule the daily report to be sent at midnight every day.
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily report cron job...');
  try {
    const result = await sendDailyReport({ recipientEmail: 'sirgeorge0254@gmail.com' });
    if (result.success) {
      console.log('Daily report sent successfully.');
    } else {
      console.error('Failed to send daily report.');
    }
  } catch (error) {
    console.error('Error running daily report cron job:', error);
  }
});

console.log('Cron job for daily reports has been scheduled.');
