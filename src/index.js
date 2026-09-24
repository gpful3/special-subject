export default {
  async fetch(request, env, ctx) {
    // 1. 只處理 POST 請求 (LINE 傳送訊息時的請求)
    if (request.method === "POST") {
      const data = await request.json();
      const events = data.events;

      // 讀取之前設定的金鑰 (環境變數)
      const accessToken = env.LINE_CHANNEL_ACCESS_TOKEN;

      // 2. 處理收到的訊息並自動回覆 (回話機器人範例)
      for (const event of events) {
        if (event.type === "message" && event.message.type === "text") {
          const userMessage = event.message.text;
          const replyToken = event.replyToken;

          // 發送回覆給 LINE
          await fetch("https://api.line.me/v2/bot/message/reply", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              replyToken: replyToken,
              messages: [{ type: "text", text: `你剛剛說了：${userMessage}` }],
            }),
          });
        }
      }

      return new Response("OK", { status: 200 });
    }

    // GET 請求時顯示提示
    return new Response("這是 LINE Bot Webhook 節點");
  },
};
