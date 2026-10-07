import '@/app/admin.css';

export const metadata = { title: 'Site editor', robots: { index: false, follow: false } };

export default function AdminLayout({ children }) {
  return <html lang="en"><body className="admin-body">{children}</body></html>;
}
