import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useSiteLanguage } from '@/lib/siteLanguage';
import { Handshake, ShieldCheck, Users, ArrowRight, ExternalLink } from 'lucide-react';

type Partner = { id: string; name: string; logo_url: string | null; category: string | null; game: string | null; description: string | null; link_url: string | null; };
export default function CommunityPartners() {
 const language = useSiteLanguage();
 const en = language === 'en';
 const [partners,setPartners] = useState<Partner[]>([]);
 const [loading,setLoading] = useState(true);
 useEffect(()=>{
  let alive=true;
  supabase.from('partners').select('id,name,logo_url,category,game,description,link_url').eq('visible',true).order('sort_order',{ascending:true})
   .then(({data,error})=>{if(alive){if(!error)setPartners(data||[]);setLoading(false);}});
  return ()=>{alive=false;};
 },[]);
 const community = partners.filter(p => p.category === 'communautaire');
 const others = partners.filter(p => p.category !== 'communautaire');
 const renderPartner=(p:Partner)=><article key={p.id} className="rounded-2xl border border-[#8A2BE2]/30 bg-[#10101e] p-5 flex flex-col items-center gap-3 text-center">
   <div className="h-24 w-24 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden">
     {p.logo_url ? <img src={p.logo_url} alt={`Logo de ${p.name}`} className="h-full w-full object-contain" loading="lazy"/> : <Users className="text-[#A855F7]" size={40}/>}
   </div>
   <h3 className="text-lg font-bold text-white">{p.name}</h3>
   {p.game && <p className="text-xs text-[#D5C3FA]">{p.game}</p>}
   {p.description && <p className="text-xs text-[#AAAACC]">{p.description}</p>}
   <span className="text-[11px] text-emerald-300 flex items-center gap-1"><ShieldCheck size={13}/>{en?'Listed eGame partner':'Partenaire référencé eGame'}</span>
   {p.link_url && <a href={p.link_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#BB92FF] underline inline-flex items-center gap-1">{en?'Visit community':'Voir la communauté'} <ExternalLink size={13}/></a>}
 </article>;
 return <div className="min-h-screen bg-[#090910] text-white pb-24 pt-28"><SEO title={en?'Community partners':'Communautés partenaires'} description={en?'Independent communities collaborating with eGame Bénin':'Les communautés indépendantes qui collaborent avec eGame Bénin'} /><Navbar/>
 <main className="mx-auto max-w-6xl px-5 space-y-12">
 <section className="text-center space-y-5"><Handshake className="mx-auto text-[#C9A3FF]" size={38}/><h1 className="text-3xl sm:text-5xl font-black">{en?'Our partners':'Nos partenaires'}</h1><p className="text-[#AAAACC] max-w-2xl mx-auto">{en?'Independent gaming communities and organizations collaborating to develop gaming in Benin. Each community remains autonomous.':'Des communautés gaming et organisations indépendantes qui collaborent pour développer le gaming au Bénin. Chaque communauté conserve son autonomie.'}</p></section>
 <section className="space-y-5"><h2 className="text-2xl font-bold">{en?'Gaming communities':'Communautés gaming'}</h2>{loading?<p className="text-[#AAAACC]">{en?'Loading…':'Chargement…'}</p>: community.length?<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">{community.map(renderPartner)}</div>:<p className="text-[#AAAACC]">{en?'New community profiles will appear after approval.':'Les nouvelles communautés apparaîtront après validation de leur collaboration.'}</p>}</section>
 {others.length>0&&<section className="space-y-5"><h2 className="text-2xl font-bold">{en?'Other partners':'Autres partenaires'}</h2><div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">{others.map(renderPartner)}</div></section>}
 <section className="border border-[#8A2BE2]/30 rounded-3xl bg-[#8A2BE2]/10 p-7 sm:p-9 space-y-4"><h2 className="text-xl sm:text-2xl font-bold">{en?'Is your community interested?':'Votre communauté souhaite collaborer ?'}</h2><p className="text-[#CCC4DC] text-sm">{en?'Keep your name, members and autonomy. Discuss a non-exclusive collaboration, get visibility and coordinate free-entry events with eGame Bénin in accordance with each publisher’s rules.':'Conservez votre nom, vos membres et votre autonomie. Envisagez une collaboration non exclusive, gagnez en visibilité et coordonnez des événements à inscription gratuite dans le respect des règles des éditeurs.'}</p><Link to={en?'/en/partners':'/devenir-partenaire'} className="inline-flex items-center gap-2 rounded-xl bg-[#8A2BE2] px-5 py-3 font-bold">{en?'Apply as a partner':'Proposer un partenariat'}<ArrowRight size={18}/></Link></section>
 <p className="text-xs text-[#8888AA] text-center">{en?'Community partnerships do not imply endorsement by game publishers.':'Les partenariats communautaires ne signifient pas que les éditeurs des jeux soutiennent ou sponsorisent eGame Bénin.'}</p>
 </main></div>;
}
