import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, course, phone } = body;


    if (!name || !course || !phone) {
      return NextResponse.json(
        { error: "Barcha maydonlar to‘ldirilishi shart" },
        { status: 400 }
      );
    }

    const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_GROUP_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { error: "Telegram token yoki chat ID topilmadi" },
        { status: 500 }
      );
    }

    
    const formattedDate = new Intl.DateTimeFormat("uz-UZ", {
      timeZone: "Asia/Tashkent",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date());

 
    const cleanPhone = phone.replace(/[^\d+]/g, "");

    const telegramLink = `https://t.me/${cleanPhone}`;
    
    
    const message = `
<b>🎓 Yangi o‘quvchi ma'lumotlari</b>

👤 <b>Ism:</b> ${name}
📚 <b>Kurs:</b> ${course}
📞 <b>Telefon:</b> ${phone}
⏰ <b>Vaqt:</b> ${formattedDate}
`.trim();

   const telegramResponse = await fetch(
  `https://api.telegram.org/bot${token}/sendMessage`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "💬 Telegram orqali yozish",
              url: telegramLink,
            },
          ],
          
        ],
      },
    }),
  }
);


    const telegramData = await telegramResponse.json();

    if (!telegramResponse.ok || !telegramData.ok) {
      return NextResponse.json(
        {
          error: "Telegram API xatosi",
          telegram_response: telegramData,
        },
        { status: 500 }
      );
    }

 
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Server xatosi:", error);

    return NextResponse.json(
      {
        error: "Ichki server xatosi",
        detail: error.message,
      },
      { status: 500 }
    );
  }
}
