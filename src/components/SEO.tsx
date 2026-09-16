"use client";

import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO = ({ 
  title = "eGame Bénin | Plateforme eSport — Tournois et Cash Prizes",
  description = "Rejoins la communauté gaming eGame Bénin. Joueurs de tout le continent : inscris-toi aux tournois, paye via Mobile Money et gagne des cash prizes. Free Fire, COD, Clash Royale et plus.",
  image = "https://ajbpdaxtynkazdrzyopd.supabase.co/storage/v1/object/public/assets/og-image.jpg",
  url = "https://www.egamebenin.com",
  type = "website"
}: SEOProps) => {
  const siteTitle = title.includes("eGame Bénin") ? title : `${title} | eGame Bénin`;

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
    setMeta('og:type', type, 'property');
    setMeta('og:title', siteTitle, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:image', image, 'property');
    setMeta('og:url', url, 'property');
    setMeta('twitter:title', siteTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);
  }, [siteTitle, description, image, url, type]);

  return null;
};

export default SEO;