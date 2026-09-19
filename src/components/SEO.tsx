"use client";

import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  /** true = page exclue des moteurs de recherche (pages privées / utilitaires) */
  noindex?: boolean;
}

const SEO = ({
  title = "eGame Bénin | Tournois eSport et communauté gaming en Afrique",
  description = "Rejoignez eGame Bénin, la plateforme dédiée aux compétitions eSport et aux communautés gaming. Créez votre profil, découvrez les tournois et affrontez d'autres joueurs.",
  image = "https://ajbpdaxtynkazdrzyopd.supabase.co/storage/v1/object/public/assets/og-image.jpg",
  url,
  type = "website",
  noindex = false
}: SEOProps) => {
  const siteTitle = title.includes("eGame Bénin") ? title : `${title} | eGame Bénin`;
  // URL canonique propre : page courante sans paramètres de suivi (évite le contenu dupliqué).
  const canonicalUrl = url || `https://www.egamebenin.com${window.location.pathname}`;

  useEffect(() => {
    document.title = siteTitle;

    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large');
    setMeta('og:type', type, 'property');
    setMeta('og:title', siteTitle, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:image', image, 'property');
    setMeta('og:url', canonicalUrl, 'property');
    setMeta('og:site_name', 'eGame Bénin', 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', siteTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);
  }, [siteTitle, description, image, canonicalUrl, type, noindex]);

  return null;
};

export default SEO;
