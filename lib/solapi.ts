import crypto from 'crypto';

function getAuthHeader(): string {
  const apiKey = process.env.SOLAPI_API_KEY || '';
  const apiSecret = process.env.SOLAPI_API_SECRET || '';
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString('hex');
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(date + salt)
    .digest('hex');

  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

export async function sendSMS(to: string, text: string): Promise<boolean> {
  try {
    const cleanTo = to.replace(/-/g, '');
    const cleanFrom = (process.env.SOLAPI_SENDER || '').replace(/-/g, '');

    if (!cleanTo || !cleanFrom) {
      console.error('SMS: 수신/발신 번호 없음');
      return false;
    }

    const response = await fetch('https://api.solapi.com/messages/v4/send-many/detail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      body: JSON.stringify({
        messages: [
          {
            to: cleanTo,
            from: cleanFrom,
            text,
            type: text.length > 45 ? 'LMS' : 'SMS',
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('SMS 발송 실패:', errText);
      return false;
    }

    console.log(`SMS 발송 성공: ${cleanTo}`);
    return true;
  } catch (err) {
    console.error('SMS 발송 에러:', err);
    return false;
  }
}
