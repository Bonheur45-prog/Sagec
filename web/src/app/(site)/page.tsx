// TODO(Phase 6): placeholder until the public SAGEC site is ported into this app.
// Never deployed: sagecltd.com goes live only after Phase 7.
export const dynamic = 'force-dynamic'; // reads Site settings (Google Analytics) on every visit until Phase 6 adds caching

export default function Home() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '4rem 1.5rem', textAlign: 'center' }}>
      <h1>SAGEC Ltd</h1>
      <p>The public website is being moved into this app. The CMS is at <a href="/admin">/admin</a>.</p>
    </main>
  );
}
