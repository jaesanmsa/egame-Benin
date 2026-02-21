"use client";

import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO = ({ 
  title = "eGame Benin | L'arène ultime des gamers béninois", 
  description = "Participez aux meilleurs tournois de jeux vidéo au Bénin (Blur, COD, Clash Royale). Gagnez des cash prizes et rejoignez la communauté.",
  image = "https://ajbpdaxtynkazdrzyopd.supabase.co/storage/v1/object/public/assets/og-image.jpg",
  url = "https://www.egamebenin.com",
  type = "website"
}: SEOProps) => {
  const siteTitle = title.includes("eGame Benin") ? title : `${title} | eGame Benin`;

  return (
    <Helmet>
      {/* Balises de base */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Mots-clés spécifiques pour le Bénin */}
      <meta name="keywords" content="egame benin, gaming benin, tournoi jeux video benin, blur benin, call of duty benin, clash royale benin, esport benin, tournoi cotonou, jeux video 229" />
    </Helmet>
  );
};

export default SEO;