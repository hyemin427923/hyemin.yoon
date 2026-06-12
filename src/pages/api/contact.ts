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

        // 2. 환경 변수 조회 (Astro v6 공식 방식)
        let botToken = '';
        let chatId = '';
        
        try {
            const globalEnv = (globalThis as any)?.env || {};
            const procEnv = (typeof process !== 'undefined' && process.env) ? process.env : {};

            // cloudflare:workers 모듈에서 제공하는 env 객체를 우선 사용합니다.
            botToken = (env as any)?.TELEGRAM_BOT_TOKEN || globalEnv?.TELEGRAM_BOT_TOKEN || procEnv?.TELEGRAM_BOT_TOKEN || import.meta.env.TELEGRAM_BOT_TOKEN;
            chatId = (env as any)?.TELEGRAM_CHAT_ID || globalEnv?.TELEGRAM_CHAT_ID || procEnv?.TELEGRAM_CHAT_ID || import.meta.env.TELEGRAM_CHAT_ID;
        } catch (envErr: any) {
            console.error('Env Variable Access Error:', envErr);
        }

        if (!botToken || !chatId) {
            const debugInfo = {
                envKeys: env ? Object.keys(env).filter(k => !k.includes('TOKEN') && !k.includes('ID')) : [],
                foundBot: !!botToken,
                foundChat: !!chatId
            };
            return new Response(
                JSON.stringify({ error: `설정 유실. 디버그: ${JSON.stringify(debugInfo)}` }),
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
                JSON.stringify({ error: `텔레그램 메시지 발송 실패: ${errorText.substring(0, 50)}` }),
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
            JSON.stringify({ error: `서버 내부 오류: ${err.message || '알 수 없는 오류'}` }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
