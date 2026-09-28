export default {
  async fetch(request, env, ctx) {
    // 確保請求是 POST 方法（LINE 傳送 Webhook 都是 POST）
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const body = await request.json();
      
      // 走訪 LINE 傳過來的每一個事件
      for (const event of body.events) {
        if (event.type === 'message' && event.message.type === 'text') {
          // 這裡可以呼叫 LINE API 回覆訊息
          console.log('收到使用者訊息:', event.message.text);
          
          // 呼叫函式回覆相同的文字
          await replyMessage(event.replyToken, `你剛剛說了: ${event.message.text}`, env.LINE_CHANNEL_ACCESS_TOKEN);
        }
      }

      return new Response(JSON.stringify({ status: 'success' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(err.message, { status: 500 });
    }
  },
};

// 簡單的回覆 LINE 訊息函式
async function replyMessage(replyToken, text, accessToken) {
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      replyToken: replyToken,
      messages: [{ type: 'text', text: text }],
    }),
  });
}
