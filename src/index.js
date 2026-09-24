export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const body = await request.json();

      for (const event of body.events) {
        // 處理使用者傳來的文字訊息
        if (event.type === 'message' && event.message.type === 'text') {
          const userText = event.message.text;
          console.log('收到使用者訊息:', userText);

          // 1. 將使用者的文字傳給 AI 思考回答
          const aiReply = await callGeminiAI(userText, env.GEMINI_API_KEY);

          // 2. 將 AI 的回答傳回給 LINE 使用者
          await replyMessage(event.replyToken, aiReply, env.LINE_CHANNEL_ACCESS_TOKEN);
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

// 呼叫 Gemini AI API 的函式
async function callGeminiAI(prompt, apiKey) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await response.json();
    
    // 解析 AI 回傳的文字
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      return '抱歉，AI 目前無法處理這個請求。';
    }
  } catch (error) {
    console.error('AI 呼叫失敗:', error);
    return '系統繁忙，請稍後再試！';
  }
}

// 呼叫 LINE 回覆 API
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
