/**
 * The screen shown when something throws during render.
 *
 * Shared by two different mechanisms, because React has two separate error
 * paths and only covering one leaves a hole:
 *   - ErrorBoundary (class component) catches throws in the context
 *     providers, i.e. above the router.
 *   - RouteErrorElement is what React Router renders for a throw inside a
 *     route. RouterProvider intercepts those itself, so a boundary wrapped
 *     around it never sees them - untreated, React Router falls back to its
 *     own developer screen, which shows the customer a raw stack trace.
 *
 * Plain elements and inline styles on purpose: if the failure is in the
 * stylesheet or a shared UI component, anything fancier could throw again
 * while rendering this very fallback.
 */
export function ErrorFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center',
        background: '#fbf6ef',
        color: '#241512',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <p style={{ fontSize: '0.6875rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#8f6f39' }}>
        RajwadiTukda
      </p>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', margin: 0 }}>Something went wrong</h1>
      <p style={{ maxWidth: '28rem', lineHeight: 1.6, color: 'rgba(36,21,18,0.7)', margin: 0 }}>
        Sorry — this page hit an unexpected error. Reloading usually fixes it. If it keeps happening,
        message us on WhatsApp and we&rsquo;ll sort your order out directly.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.75rem',
            borderRadius: '999px',
            border: 'none',
            background: '#af8a48',
            color: '#241610',
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Reload page
        </button>
        <a
          href="/"
          style={{
            padding: '0.75rem 1.75rem',
            borderRadius: '999px',
            border: '1px solid rgba(36,22,16,0.25)',
            color: '#241610',
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          Back to home
        </a>
        <a
          href="https://wa.me/917014253541"
          style={{
            padding: '0.75rem 1.75rem',
            borderRadius: '999px',
            border: '1px solid rgba(36,22,16,0.25)',
            color: '#241610',
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          WhatsApp us
        </a>
      </div>
    </div>
  )
}
