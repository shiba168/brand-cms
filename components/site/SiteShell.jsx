import Script from 'next/script';
import { getContent } from '@/lib/content';
import { HTML_LANG } from '@/lib/i18n';
import '@/app/site.css';

const GOOGLE_FONTS = ['Inter', 'Poppins', 'Montserrat', 'Plus Jakarta Sans', 'Outfit', 'Kanit', 'Sora', 'DM Sans'];

export default async function SiteShell({ lang, children }) {
  const { site } = await getContent();
  const font = GOOGLE_FONTS.includes(site.font) ? site.font : null;
  return (
    <html lang={HTML_LANG[lang]}>
      <head>
        {font && <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />}
        {font && <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;500;600;700;800;900&display=swap`} />}
      </head>
      <body>
        {children}
        {site.gaId && /^G-[A-Z0-9]+$/.test(site.gaId) && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${site.gaId}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${site.gaId}');`}</Script>
          </>
        )}
        {site.customBodyHtml && <div hidden dangerouslySetInnerHTML={{ __html: site.customBodyHtml }} />}
      </body>
    </html>
  );
}
