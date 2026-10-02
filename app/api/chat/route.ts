import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { google } from '@ai-sdk/google';
import { Redis } from "@upstash/redis"
import { NIGERIAN_REAL_ESTATE_SYSTEM_PROMPT } from '@/lib/prompts/real-estate';
import { createClient } from '@/lib/supabase/server';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const redis = Redis.fromEnv()
const rateLimitScript = redis.createScript<number>(`
  local current = redis.call("INCR", KEYS[1])
  if current == 1 then
    redis.call("PEXPIRE", KEYS[1], ARGV[1])
  end
  return current
`)

function getRateLimitKey(req: Request, userId?: string | null) {
  if (userId) {
    return `user:${userId}`;
  }
  const forwarded = req.headers.get('x-forwarded-for');
  const ip =
    forwarded?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  return `ip:${ip}`;
}

async function isRateLimited(key: string) {
  const current = await rateLimitScript.eval([key], [`${RATE_LIMIT_WINDOW_MS}`])
  return current > RATE_LIMIT_MAX
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const rateKey = `ratelimit:chat:${getRateLimitKey(req, user.id)}`
    if (await isRateLimited(rateKey)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json" } },
      )
    }

    const { messages }: { messages: UIMessage[] } = await req.json();
    const MAX_MESSAGES = 50

    if (
      !Array.isArray(messages) ||
      messages.length < 1 ||
      messages.length > MAX_MESSAGES
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid messages payload." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const result = streamText({
      model: google("gemini-2.0-flash"),
      system: NIGERIAN_REAL_ESTATE_SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
