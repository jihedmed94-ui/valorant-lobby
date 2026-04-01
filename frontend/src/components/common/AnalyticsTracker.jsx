import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_SCRIPT_ID = 'site-google-analytics';
const GA_ID = 'G-QYFGHZKMEQ';

function ensureAnalyticsScript() {
  if (typeof document === 'undefined') {
    return;
  }

  if (document.getElementById(GA_SCRIPT_ID)) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  const script = document.createElement('script');
  script.id = GA_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false });
}

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    ensureAnalyticsScript();
  }, []);

  useEffect(() => {
    if (typeof window.gtag !== 'function') {
      return;
    }

    window.gtag('config', GA_ID, {
      page_path: `${location.pathname}${location.search}`,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);

  return null;
}
