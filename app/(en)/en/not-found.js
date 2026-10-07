export default function NotFound() {
  return (
    <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
      <div><h1 style={{ fontSize: 64 }}>404</h1><p className="lead" style={{ margin: '12px auto 24px' }}>Page not found · Halaman tidak dijumpai</p><a className="btn btn-primary" href="/">Home</a></div>
    </main>
  );
}
