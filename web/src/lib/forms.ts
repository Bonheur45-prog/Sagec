'use server';

import { headers } from 'next/headers';
import { after } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { notifyLead } from '@/lib/email/notify-lead';
import { clientIp } from '@/lib/security/client-ip';
import { enquiryLimiter, limiter } from '@/lib/security/rate-limit';
import { TURNSTILE_RESPONSE_FIELD, verifyTurnstile } from '@/lib/security/turnstile';
import { validateComment, validateContact, validateSubscribe, type FormState } from './forms-validation';

// The public website's forms: contact, blog comments, newsletter. Each one:
// - ignores bots that fill the hidden "hp" field (the visitor-facing answer stays neutral),
// - limits how often one visitor can send,
// - checks Cloudflare Turnstile when its keys are set,
// - says "sent" only once the message is really saved (never a fake success).

/** Contact form → CMS → Messages. The email to the team is sent after the visitor gets the answer. */
export async function submitContact(_prev: FormState, data: FormData): Promise<FormState> {
  const r = validateContact(data);
  if (r.status !== 'ok') return r.state;
  const h = await headers();
  const ip = clientIp(h);
  if (!enquiryLimiter().take(ip)) return { status: 'error', message: 'You sent several messages in a short time. Please wait a few minutes, or call or WhatsApp us.', values: r.values };
  const check = await verifyTurnstile(String(data.get(TURNSTILE_RESPONSE_FIELD) ?? '').slice(0, 2048), ip);
  // If Cloudflare cannot be reached the message is let through (the rate limit still applies) rather than lose a real enquiry.
  if (check === 'failed') return { status: 'error', message: 'The “I am human” check did not pass. Please try again.', values: r.values };
  try {
    const lead = await prisma.lead.create({ data: { ...r.data, userAgent: h.get('user-agent')?.slice(0, 300) ?? null } });
    after(() => notifyLead(lead.id).catch((error) => console.error('[contact] notification step failed', error)));
    return { status: 'success', message: 'Message sent! We’ll get back to you within 24 hours.' };
  } catch (error) {
    console.error('[contact] could not save message', error);
    return { status: 'error', message: 'Your message could not be sent right now. Please try again, or call or WhatsApp us.', values: r.values };
  }
}

/** Blog comment → CMS → Comments (hidden until approved). */
export async function submitComment(postId: string, _prev: FormState, data: FormData): Promise<FormState> {
  const r = validateComment(data);
  if (r.status !== 'ok') return r.state;
  const ip = clientIp(await headers());
  if (!limiter('comment', 5, 10 * 60 * 1000).take(ip)) return { status: 'error', message: 'You sent several comments in a short time. Please wait a few minutes.', values: r.values };
  const check = await verifyTurnstile(String(data.get(TURNSTILE_RESPONSE_FIELD) ?? '').slice(0, 2048), ip);
  if (check === 'failed') return { status: 'error', message: 'The “I am human” check did not pass. Please try again.', values: r.values };
  try {
    const post = await prisma.post.findFirst({ where: { id: postId, status: 'PUBLISHED', deletedAt: null, publishedAt: { lte: new Date() } }, select: { id: true } });
    if (!post) return { status: 'error', message: 'This article no longer accepts comments.' };
    await prisma.blogComment.create({ data: { postId: post.id, ...r.data } });
    return { status: 'success', message: 'Thanks! Your comment will appear once it has been reviewed.' };
  } catch (error) {
    console.error('[comment] could not save', error);
    return { status: 'error', message: 'Your comment could not be sent right now. Please try again.', values: r.values };
  }
}

/** Newsletter sign-up → CMS → Subscribers. Signing up twice gives the same friendly answer. */
export async function subscribe(_prev: FormState, data: FormData): Promise<FormState> {
  const r = validateSubscribe(data);
  if (r.status !== 'ok') return r.state;
  if (!limiter('subscribe', 10, 10 * 60 * 1000).take(clientIp(await headers()))) return { status: 'error', message: 'Too many sign-ups from here. Please try again later.', values: r.values };
  try {
    try {
      await prisma.subscriber.create({ data: r.data });
    } catch (error) {
      // already subscribed: same answer, nothing revealed
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) throw error;
    }
    return { status: 'success', message: 'Thanks for subscribing!' };
  } catch (error) {
    console.error('[subscribe] could not save', error);
    return { status: 'error', message: 'Could not subscribe right now. Please try again.', values: r.values };
  }
}
