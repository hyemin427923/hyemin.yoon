import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { name, email, message } = body;

        // 1. 유효성 검사
        if (!name || !email || !message) {
            return new Response(
                JSON.stringify({ error: '필수 입력 항목이 누락되었습니다.' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 2. 환경 변수 조회 (Astro v6 Cloudflare Workers env 또는 Vite meta env)
        const botToken = (env as any).TELEGRAM_BOT_TOKEN || import.meta.env.TELEGRAM_BOT_TOKEN;
        const chatId = (env as any).TELEGRAM_CHAT_ID || import.meta.env.TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            return new Response(
                JSON.stringify({ error: '텔레그램 봇 토큰 또는 채팅 ID 설정이 유실되었습니다. 시스템 설정을 확인하세요.' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 3. 메시지 텍스트 템플릿 구성
        const messageText = `🔔 [포트폴리오 문의 알림]\n\n👤 보낸이: ${name}\n✉️ 이메일: ${email}\n\n📝 메시지 내용:\n${message}`;

        // 4. 텔레그램 봇 API 호출
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const telegramRes = await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: messageText
            })
        });

        if (!telegramRes.ok) {
            const errorText = await telegramRes.text();
            console.error('Telegram API Error:', errorText);
            return new Response(
                JSON.stringify({ error: '텔레그램 메시지 발송에 실패했습니다.' }),
                { status: 502, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ success: true, message: '성공적으로 메시지가 발송되었습니다.' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (err: any) {
        console.error('Contact API Internal Error:', err);
        return new Response(
            JSON.stringify({ error: '서버 내부 오류가 발생했습니다.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
