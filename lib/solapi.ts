export async function sendSMS(to: string, text: string): Promise<boolean> {
  try {
    const cleanTo = to.replace(/-/g, '');
    const cleanFrom = (process.env.SOLAPI_SENDER || '').replace(/-/g, '');

    const response = await fetch('https://api.solapi.com/messages/v4/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SOLAPI_API_KEY}`,
      },
      body: JSON.stringify({
        message: {
          to: cleanTo,
          from: cleanFrom,
          text,
          type: text.length > 45 ? 'LMS' : 'SMS',
        },
      }),
    });

    if (!response.ok) {
      console.error('SMS 발송 실패:', await response.text());
      return false;
    }

    console.log(`SMS 발송 성공: ${cleanTo}`);
    return true;
  } catch (err) {
    console.error('SMS 발송 에러:', err);
    return false;
  }
}
