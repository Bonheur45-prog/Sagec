import { NextResponse, type NextRequest } from 'next/server';
import { submitComment, submitContact } from '@/lib/forms';
import type { FormState } from '@/lib/forms-validation';
import { payloadGet } from '@/lib/site/payload';

/*
 * The public site's own data address (same origin, read-only except the two forms):
 *   GET  /api/globals/<page>, /api/<collection>?…   → published content in the old Payload format
 *   POST /api/contact-submissions                   → CMS → Messages (+ email to the team)
 *   POST /api/blog-comments                         → CMS → Comments (hidden until approved)
 * The pages already arrive with their content; the browser only calls this to refresh it.
 */

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  try {
    const body = await payloadGet(path, req.nextUrl.searchParams);
    if (body === null) return NextResponse.json({ errors: [{ message: 'Not found' }] }, { status: 404, headers: NO_STORE });
    return NextResponse.json(body, { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' } });
  } catch (error) {
    console.error('[api] could not load', path.join('/'), error);
    return NextResponse.json({ errors: [{ message: 'Content could not be loaded right now.' }] }, { status: 500, headers: NO_STORE });
  }
}

/** The form's fields, sent either as a normal form (contact) or as JSON (comments). */
async function readForm(req: NextRequest): Promise<FormData | null> {
  const type = req.headers.get('content-type') ?? '';
  try {
    if (type.includes('multipart/form-data') || type.includes('application/x-www-form-urlencoded')) return await req.formData();
    if (type.includes('application/json')) {
      const json = (await req.json()) as unknown;
      if (!json || typeof json !== 'object' || Array.isArray(json)) return null;
      const data = new FormData();
      for (const [k, v] of Object.entries(json as Record<string, unknown>)) if (typeof v === 'string' || typeof v === 'number') data.set(k, String(v));
      return data;
    }
  } catch {
    return null;
  }
  return null;
}

const reply = (state: FormState) =>
  NextResponse.json(state, { status: state.status === 'success' ? 201 : state.fieldErrors ? 400 : 422, headers: NO_STORE });

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (path.length !== 1) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  const data = await readForm(req);
  if (!data) return NextResponse.json({ status: 'error', message: 'Your message could not be read. Please try again.' }, { status: 400 });
  const idle: FormState = { status: 'idle', message: '' };
  switch (path[0]) {
    case 'contact-submissions':
      return reply(await submitContact(idle, data));
    case 'blog-comments': {
      const postId = String(data.get('post') ?? '');
      if (!/^[a-z0-9]{10,40}$/.test(postId)) return NextResponse.json({ status: 'error', message: 'This article no longer accepts comments.' }, { status: 400 });
      return reply(await submitComment(postId, idle, data));
    }
    default:
      return NextResponse.json({ message: 'Not found' }, { status: 405 });
  }
}
