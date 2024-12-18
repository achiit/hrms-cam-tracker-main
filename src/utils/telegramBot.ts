import { supabase } from "@/integrations/supabase/client";

interface LoginNotification {
  id: string;
  name: string;
  loginTime: string;
  location: string;
  ipAddress: string;
  photoUrl: string;
}

export async function sendLoginNotification(data: LoginNotification) {
  try {
    const BOT_TOKEN = '6883311010:AAGLLWGPHVGWbGPQCLxbBXtGxRVGvXLxKwc';
    const ADMIN_ID = '1474674284';

    const message = `
🔔 New Login Alert!

👤 Employee: ${data.name} (ID: ${data.id})
⏰ Time: ${new Date(data.loginTime).toLocaleString()}
📍 Location: ${data.location}
🌐 IP: ${data.ipAddress}
`;

    // Send text message
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: ADMIN_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    // Send photo if available
    if (data.photoUrl) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: ADMIN_ID,
          photo: data.photoUrl,
          caption: `📸 Login photo of ${data.name}`,
        }),
      });
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    throw error;
  }
}