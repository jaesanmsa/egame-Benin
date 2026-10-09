import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Calendar, CreditCard, Gamepad2, Hash, Mail, Newspaper, Trophy, User, Users, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import SEO from "@/components/SEO";
import Logo from "@/components/Logo";
import TikTokLogo from "@/components/TikTokLogo";
import DiscordLogo from "@/components/DiscordLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { MAIN_DISCORD_INVITE, DISCORD_SERVERS } from "@/lib/discord";
import { toFrenchPath } from "@/lib/languageRouting";
import OrganizerApplicationPage from "@/pages/OrganizerApplication";
import OrganizerDashboard from "@/pages/OrganizerDashboard";
import OrganizerAdmin from "@/pages/OrganizerAdmin";
import { formatBeninShort } from "@/utils/datetime";

const GAMES = [
  { id: "blood-strike", name: "Blood Strike", image: "/blood strike.jpg" },
  { id: "brawl-stars", name: "Brawl Stars", image: "/brawl stars.jpg" },
  { id: "clash-of-clans", name: "Clash of Clans", image: "/clash of clans.webp" },
  { id: "clash-royale", name: "Clash Royale", image: "/clash royal.webp" },
  { id: "cod-mobile", name: "COD Mobile", image: "/cod mobile.webp" },
  { id: "efootball-mobile", name: "eFootball Mobile", image: "/efootball.webp" },
  { id: "free-fire", name: "Free Fire", image: "/freefire.webp" },
  { id: "mobile-legends", name: "Mobile Legends", image: "/mobile legend.webp" },
  { id: "pubg-mobile", name: "PUBG Mobile", image: "/pubg-mobile.webp" },
];

const STEPS = [
  { icon: User, title: "Create your account", text: "Sign up and complete your player profile." },
  { icon: Trophy, title: "Choose a tournament", text: "Check open tournaments and their conditions." },
  { icon: CreditCard, title: "Confirm your entry", text: "Choose a payment method available for that tournament." },
  { icon: Hash, title: "Join the competition", text: "Follow tournament updates and play at the scheduled time." },
];

const EN_DESCRIPTION = "eGame Bénin is a competitive gaming and esports platform where players can join tournaments, build their gaming profile and become part of a structured gaming community. We are building the competitive gaming ecosystem in Benin, with the ambition to progressively expand across Africa and organize both online competitions and physical gaming events.";

const EnglishSite = () => {
  const location = useLocation();
  const pathname = location.pathname.replace(/\/$/, "") || "/en";
  const frenchPath = toFrenchPath(pathname);
  const parts = pathname.replace(/^\/en\/?/, "").split("/").filter(Boolean);
  const section = parts[0] || "home";
  const itemId = parts[1];
  const game = GAMES.find((item) => item.id === itemId);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadPublicData = async () => {
      const [tournamentResult, newsResult, partnerResult, statsResult] = await Promise.all([
        supabase.from("tournaments").select("id,title,game,image_url,start_date,entry_fee,prize_pool,type,status,is_test,description,rules,max_participants").eq("status", "active").eq("is_test", false).order("start_date", { ascending: true }),
        supabase.from("news").select("id,title,excerpt,image_url,created_at,read_time").order("created_at", { ascending: false }).limit(12),
        supabase.from("partners").select("id,name,logo_url,description,link_url,is_official").eq("visible", true).eq("is_official", true).order("sort_order", { ascending: true }),
        supabase.from("public_platform_stats").select("*").maybeSingle(),
      ]);
      if (!active) return;
      setTournaments(tournamentResult.data ?? []);
      setArticles(newsResult.data ?? []);
      setPartners(partnerResult.data ?? []);
      setStats(statsResult.data ?? null);
      setLoading(false);
    };
    void loadPublicData();
    return () => { active = false; };
  }, []);

  const now = Date.now();
  const upcoming = tournaments.filter((t) => !t.start_date || new Date(t.start_date).getTime() >= now).slice(0, 3);
  const live = tournaments.filter((t) => t.start_date && new Date(t.start_date).getTime() < now).slice(0, 3);
  const featured = upcoming.length ? upcoming : live;

  let pageTitle = "eGame Bénin | Competitive gaming, tournaments & esports";
  if (section === "about") pageTitle = "About eGame Bénin";
  else if (section === "games") pageTitle = "Supported games";
  else if (section === "news") pageTitle = "eGame Bénin news";
  else if (section === "contact") pageTitle = "Contact & community";
  else if (section === "partners") pageTitle = "Partners";
  else if (section === "leaderboard") pageTitle = "Player rankings";
  else if (section === "game" && game) pageTitle = `${game.name} community`;
  else if (section === "tournament") pageTitle = "Tournament details";
  else if (section === "organizer-application") pageTitle = "Become an organizer";
  else if (section === "organizer") pageTitle = "Organizer dashboard";
  else if (section === "admin") pageTitle = "Organizer administration";

  const Header = () => (
    <header className="fixed left-3 right-3 top-3 z-50 mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-2xl border border-[#8A2BE2]/30 bg-[#0F0F1E]/95 px-3 py-3 shadow-xl backdrop-blur-2xl sm:left-4 sm:right-4 sm:px-5 lg:left-6 lg:right-6 lg:top-4 lg:rounded-full">
      <Link to="/en" className="shrink-0"><Logo size="sm" showText={false} /></Link>
      <nav className="hidden min-w-0 items-center gap-3 lg:flex xl:gap-5">
        <Link to="/en" className="text-[10px] font-gaming font-bold uppercase tracking-widest text-[#8888AA] hover:text-white">Home</Link>
        <Link to="/en/games" className="text-[10px] font-gaming font-bold uppercase tracking-widest text-[#8888AA] hover:text-white">Tournaments</Link>
        <Link to="/en/leaderboard" className="text-[10px] font-gaming font-bold uppercase tracking-widest text-[#8888AA] hover:text-white">Rankings</Link>
        <Link to="/en/contact#community" className="text-[10px] font-gaming font-bold uppercase tracking-widest text-[#8888AA] hover:text-white">Community</Link>
        <Link to="/en/news" className="text-[10px] font-gaming font-bold uppercase tracking-widest text-[#8888AA] hover:text-white">News</Link>
      </nav>
      <div className="flex shrink-0 items-center gap-2">
        <LanguageSwitcher />
        <Link to="/auth" className="rounded-full bg-[#8A2BE2] px-3 py-2 text-[10px] font-bold uppercase text-white sm:px-4">Sign in</Link>
      </div>
    </header>
  );

  const Footer = () => (
    <footer className="mt-12 border-t border-[#8A2BE2]/20 px-4 py-8 text-center">
      <Logo size="md" className="justify-center" />
      <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-3 text-[10px] font-bold uppercase tracking-wider text-[#8888AA]">
        <Link to="/en/about" className="hover:text-white">About</Link>
        <Link to="/en/partners" className="hover:text-white">Partners</Link>
        <Link to="/en/contact" className="hover:text-white">Contact</Link>
        <Link to="/mentions-legales" className="hover:text-white">Legal notice</Link>
        <Link to="/privacy" className="hover:text-white">Privacy &amp; terms</Link>
      </div>
      <p className="mt-5 text-[9px] text-[#8888AA]/60">© 2026 eGame Bénin</p>
    </footer>
  );

  const TournamentCards = ({ rows }: { rows: any[] }) => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rows.map((t) => (
        <Link key={t.id} to={`/en/tournament/${encodeURIComponent(t.id)}`} className="group min-w-0 overflow-hidden rounded-2xl border border-[#8A2BE2]/25 bg-[#0F0F1E] transition-colors hover:border-[#8A2BE2]/70">
          <div className="aspect-[16/9] bg-[#07070C]"><img src={t.image_url || "/coc-tournament.webp"} alt={t.title} loading="lazy" className="h-full w-full object-cover" /></div>
          <div className="space-y-3 p-4">
            <p className="text-[10px] font-gaming font-bold uppercase tracking-widest text-[#A855F7]">{t.game}</p>
            <h3 className="line-clamp-2 break-words text-sm font-gaming font-black text-white">{t.title}</h3>
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#B1B1C4]">
              <span className="inline-flex items-center gap-1"><Calendar size={12} className="text-[#A855F7]" />{t.start_date ? formatBeninShort(t.start_date) : "Date to be announced"}</span>
              <span>{Number(t.entry_fee) === 0 ? "Free entry" : `${t.entry_fee} FCFA`}</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-gaming font-bold uppercase tracking-wider text-[#A855F7]">Tournament details <ArrowRight size={12} /></span>
          </div>
        </Link>
      ))}
    </div>
  );

  const CommunityLinks = () => (
    <section id="community" className="scroll-mt-24 space-y-4">
      <h2 className="text-xl font-gaming font-black uppercase text-white">Official community</h2>
      <p className="text-sm leading-relaxed text-[#B1B1C4]">eGame Bénin is building competitive gaming in Benin, with the ambition to expand progressively across Africa.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a href={MAIN_DISCORD_INVITE} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-5 py-3 text-xs font-gaming font-black uppercase text-white hover:bg-[#4752C4]"><DiscordLogo size={17} />Join Discord</a>
        <a href="https://tiktok.com/@egamebnin" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#8A2BE2]/50 bg-[#0F0F1E] px-5 py-3 text-xs font-gaming font-black uppercase text-white hover:bg-[#8A2BE2]/15"><TikTokLogo size={17} className="text-[#A855F7]" />Follow on TikTok</a>
      </div>
    </section>
  );

  let content;
  if (section === "organizer-application") {
    content = <OrganizerApplicationPage />;
  } else if (section === "organizer") {
    content = <OrganizerDashboard />;
  } else if (section === "admin" && parts[1] === "organizers") {
    content = <OrganizerAdmin />;
  } else if (section === "home") {
    content = (
      <>
        <section className="relative flex min-h-[62vh] flex-col items-center justify-center overflow-hidden px-5 pb-14 pt-28 text-center sm:min-h-[68vh] sm:px-6">
          <div className="absolute inset-0 bg-[#0A0A0F]"><video autoPlay loop muted playsInline preload="metadata" className="h-full w-full object-cover opacity-25"><source src="/hero-video.webm" type="video/webm" /></video><div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/60 via-[#0A0A0F]/80 to-[#0A0A0F]" /></div>
          <div className="absolute inset-0 pointer-events-none"><div className="absolute left-1/4 top-1/4 h-48 w-48 rounded-full bg-[#8A2BE2]/10 blur-3xl" /></div>
          <div className="relative max-w-4xl space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#8A2BE2]/30 bg-[#8A2BE2]/10 px-4 py-1.5 text-[10px] font-gaming font-black uppercase tracking-widest text-[#A855F7]">eGame Bénin</p>
            <h1 className="text-4xl font-gaming font-black uppercase leading-tight text-white sm:text-6xl">Enter the <span className="text-[#FFD700]">competition.</span></h1>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[#B1B1C4] sm:text-lg">Join gaming tournaments, compete against other players and build your journey on eGame Bénin.</p>
            <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
              <Link to="/en/games" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#8A2BE2] px-7 py-3.5 text-xs font-gaming font-black uppercase tracking-widest text-white hover:bg-[#9B4DEB]">View tournaments <ArrowRight size={15} /></Link>
              <a href={MAIN_DISCORD_INVITE} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl border border-[#5865F2]/60 bg-[#0F0F1E]/80 px-7 py-3.5 text-xs font-gaming font-bold uppercase tracking-widest text-white hover:bg-[#5865F2]/15"><DiscordLogo size={16} />Join Discord</a>
            </div>
            <Link to="/auth?mode=signup" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#A855F7]/60 bg-[#8A2BE2]/15 px-6 py-3 text-[11px] font-gaming font-black uppercase tracking-widest text-white hover:bg-[#8A2BE2]/30">Create an eGame account</Link>
          </div>
        </section>
        <section className="mx-auto max-w-7xl space-y-5 px-5 py-10 sm:px-6 sm:py-14">
          <div className="flex flex-wrap items-end justify-between gap-3"><h2 className="text-xl font-gaming font-black uppercase text-white sm:text-2xl">Tournaments</h2><Link to="/en/games" className="text-xs font-gaming font-bold uppercase text-[#A855F7]">All tournaments →</Link></div>
          {loading ? <p className="text-sm text-[#8888AA]">Loading tournaments…</p> : featured.length ? <TournamentCards rows={featured} /> : <div className="rounded-2xl border border-[#8A2BE2]/20 bg-[#0F0F1E] p-6 text-center text-sm text-[#B1B1C4]">No tournaments are currently announced. Past results remain available in the tournament history.</div>}
        </section>
        <section className="mx-auto max-w-7xl space-y-4 px-5 py-8 sm:px-6 sm:py-10">
          <h2 className="text-xl font-gaming font-black uppercase text-white">How it works</h2>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">{STEPS.map((step, i) => <div key={step.title} className="flex min-w-0 items-center gap-2.5 rounded-xl border border-[#8A2BE2]/20 bg-[#0F0F1E] p-3 sm:p-4"><step.icon size={18} className="shrink-0 text-[#A855F7]" /><div className="min-w-0"><p className="text-[9px] font-gaming font-black uppercase text-[#A855F7]">Step {i + 1}</p><h3 className="break-words text-[10px] font-gaming font-bold uppercase leading-tight text-white sm:text-xs">{step.title}</h3><p className="mt-1 hidden text-[10px] leading-snug text-[#8888AA] sm:block">{step.text}</p></div></div>)}</div>
        </section>
        <section className="mx-auto max-w-7xl space-y-5 px-5 py-10 sm:px-6 sm:py-14">
          <div className="text-center"><h2 className="text-2xl font-gaming font-black uppercase text-white">Community games</h2><p className="mt-2 text-xs text-[#8888AA]">Tournament availability is announced separately.</p></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{GAMES.map((g) => <Link key={g.id} to={`/en/game/${g.id}`} className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#8A2BE2]/20 bg-[#0F0F1E] hover:border-[#8A2BE2]"><img src={g.image} alt={g.name} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#07070C]/90 to-transparent" /><span className="absolute inset-x-2 bottom-3 break-words text-center text-[10px] font-gaming font-black uppercase text-white sm:text-xs">{g.name}</span></Link>)}</div>
        </section>
        {stats && <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6"><h2 className="mb-4 text-center text-xl font-gaming font-black uppercase text-white">eGame in numbers</h2><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[["Players",stats.total_players], ["Tournaments",stats.tournaments_organized], ["Partners",partners.length], ["Competition players",stats.competition_players]].filter(([label, value]) => label === "Partners" || (typeof value === "number" && value > 0)).map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-[#8A2BE2]/20 bg-[#0F0F1E] p-4 text-center"><p className="text-2xl font-gaming font-black text-white">{Number(value || 0).toLocaleString("en-US")}</p><p className="mt-1 text-[9px] font-gaming font-bold uppercase text-[#8888AA]">{label}</p></div>)}</div></section>}
        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6"><CommunityLinks /></section>
        {partners.length > 0 && <section className="mx-auto max-w-7xl space-y-4 px-5 py-8 sm:px-6"><h2 className="text-center text-xl font-gaming font-black uppercase text-white">Partners</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{partners.map((p) => <div key={p.id} className="rounded-2xl border border-[#8A2BE2]/25 bg-[#0F0F1E] p-5">{p.logo_url && <img src={p.logo_url} alt="" className="mb-3 h-12 w-12 object-contain" />}<h3 className="font-gaming font-bold text-white">{p.name}</h3></div>)}</div></section>}
      </>
    );
  } else if (section === "about") {
    content = <section className="mx-auto max-w-4xl space-y-8 px-5 py-28 sm:px-6"><h1 className="text-3xl font-gaming font-black uppercase text-white sm:text-5xl">About eGame Bénin</h1><p className="text-lg font-gaming font-black text-[#FFD700]">Play. Compete. Win.</p><p className="text-sm leading-relaxed text-[#B1B1C4] sm:text-base">eGame Bénin is a competitive gaming and esports platform where players can join tournaments, build their gaming profile and become part of a structured gaming community. We are building the competitive gaming ecosystem in Benin, with the ambition to progressively expand across Africa and organize both online competitions and physical gaming events.</p><div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-[#8A2BE2]/25 bg-[#0F0F1E] p-5"><Trophy className="mb-3 text-[#A855F7]" /><h2 className="font-gaming font-bold text-white">Digital competition platform</h2><p className="mt-2 text-xs text-[#8888AA]">Join tournaments and track your progress.</p></div><div className="rounded-2xl border border-[#8A2BE2]/25 bg-[#0F0F1E] p-5"><Users className="mb-3 text-[#A855F7]" /><h2 className="font-gaming font-bold text-white">Gaming community</h2><p className="mt-2 text-xs text-[#8888AA]">Connect with players and gaming communities.</p></div><div className="rounded-2xl border border-[#8A2BE2]/25 bg-[#0F0F1E] p-5"><Gamepad2 className="mb-3 text-[#FFD700]" /><h2 className="font-gaming font-bold text-white">Future physical events</h2><p className="mt-2 text-xs text-[#8888AA]">We aim to progressively organize in-person gaming and esports events.</p></div></div><div className="rounded-2xl border border-[#8A2BE2]/25 bg-[#0F0F1E] p-6"><p className="text-xs uppercase tracking-widest text-[#A855F7]">Founder</p><h2 className="mt-2 font-gaming font-black text-white">Jae San Thierry MOUSSA</h2><p className="mt-1 text-xs text-[#8888AA]">Founder of eGame Bénin</p></div></section>;
  } else if (section === "games") {
    content = <section className="mx-auto max-w-7xl space-y-6 px-5 py-28 sm:px-6"><h1 className="text-3xl font-gaming font-black uppercase text-white sm:text-4xl">Supported games</h1><p className="text-sm text-[#8888AA]">These are games supported by the community; tournaments are announced separately when available.</p><TournamentCards rows={tournaments} /></section>;
  } else if (section === "game" && game) {
    const gameTournaments = tournaments.filter((t) => String(t.game || "").toLowerCase().includes(game.name.toLowerCase()));
    content = <section className="mx-auto max-w-7xl space-y-6 px-5 py-28 sm:px-6"><Link to="/en/games" className="text-xs text-[#A855F7]">← Supported games</Link><h1 className="text-3xl font-gaming font-black uppercase text-white sm:text-4xl">{game.name}</h1><p className="text-sm text-[#B1B1C4]">Community page for {game.name}. Any open tournaments will be listed below.</p>{gameTournaments.length ? <TournamentCards rows={gameTournaments} /> : <p className="rounded-2xl border border-[#8A2BE2]/20 bg-[#0F0F1E] p-6 text-sm text-[#8888AA]">No tournament is currently announced for this game.</p>}</section>;
  } else if (section === "tournament" && itemId) {
    const tournament = tournaments.find((t) => String(t.id) === decodeURIComponent(itemId));
    content = tournament ? <section className="mx-auto max-w-3xl space-y-6 px-5 py-28 sm:px-6"><h1 className="break-words text-3xl font-gaming font-black text-white sm:text-4xl">{tournament.title}</h1><p className="text-xs uppercase tracking-wider text-[#A855F7]">{tournament.game}</p><div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#0F0F1E] p-4"><p className="text-[9px] uppercase text-[#8888AA]">Date</p><p className="mt-1 text-xs text-white">{tournament.start_date ? formatBeninShort(tournament.start_date) : "To be announced"}</p></div><div className="rounded-xl bg-[#0F0F1E] p-4"><p className="text-[9px] uppercase text-[#8888AA]">Entry fee</p><p className="mt-1 text-xs text-white">{Number(tournament.entry_fee) === 0 ? "Free" : `${tournament.entry_fee} FCFA`}</p></div></div>{tournament.description && <p className="text-sm leading-relaxed text-[#B1B1C4]">{tournament.description}</p>}{tournament.rules && <div className="rounded-2xl border border-[#8A2BE2]/20 bg-[#0F0F1E] p-5"><h2 className="font-gaming font-bold text-white">Tournament rules</h2><p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-[#8888AA]">{tournament.rules}</p></div>}<div className="rounded-2xl border border-[#8A2BE2]/30 bg-[#0F0F1E] p-5"><p className="text-xs leading-relaxed text-[#B1B1C4]">To register and complete payment, continue to the tournament registration page.</p><Link to={`/tournament/${encodeURIComponent(tournament.id)}`} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#8A2BE2] px-5 py-3 text-xs font-gaming font-black uppercase text-white">Continue to registration <ArrowRight size={14} /></Link></div></section> : <section className="mx-auto max-w-3xl px-5 py-32 text-center text-sm text-[#8888AA]">Tournament not found. <Link to="/en/games" className="text-[#A855F7]">Browse tournaments</Link></section>;
  } else if (section === "news") {
    content = itemId ? <section className="mx-auto max-w-3xl space-y-5 px-5 py-28 sm:px-6"><Link to="/en/news" className="text-xs text-[#A855F7]">← News</Link><div className="rounded-2xl border border-[#8A2BE2]/25 bg-[#0F0F1E] p-6 space-y-3"><h1 className="text-xl font-gaming font-black text-white">This article is currently available in French</h1><p className="text-sm leading-relaxed text-[#B1B1C4]">The original article has not been translated yet. You can read it in French on the eGame Bénin website.</p><Link to={`/news/${encodeURIComponent(itemId)}`} className="inline-flex rounded-xl bg-[#8A2BE2] px-5 py-3 text-xs font-gaming font-bold uppercase text-white">Read the French article</Link></div></section> : <section className="mx-auto max-w-7xl space-y-6 px-5 py-28 sm:px-6"><h1 className="text-3xl font-gaming font-black uppercase text-white">News &amp; updates</h1><p className="text-sm text-[#8888AA]">eGame Bénin news, tournament updates and gaming tips.</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{articles.map((a) => <Link key={a.id} to={`/en/news/${a.id}`} className="overflow-hidden rounded-2xl border border-[#8A2BE2]/20 bg-[#0F0F1E]">{a.image_url && <img src={a.image_url} alt="" className="aspect-video w-full object-cover" />}<div className="space-y-2 p-4"><h2 className="text-sm font-gaming font-bold text-white">eGame Bénin news article</h2><p className="text-xs text-[#8888AA]">This article is available in French.</p><span className="text-[10px] font-bold text-[#A855F7]">Read the French article →</span></div></Link>)}</div></section>;
  } else if (section === "contact") {
    content = <section className="mx-auto max-w-5xl space-y-8 px-5 py-28 sm:px-6"><h1 className="text-3xl font-gaming font-black uppercase text-white">Contact &amp; community</h1><p className="text-sm text-[#B1B1C4]">Join the official eGame Bénin community or contact our team.</p><CommunityLinks /><div className="grid gap-3 sm:grid-cols-2">{DISCORD_SERVERS.map((s) => <a key={s.slug} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-[#5865F2]/30 bg-[#0F0F1E] p-4 text-xs font-bold text-white hover:border-[#5865F2]">{s.game}<ChevronRight size={14} className="text-[#5865F2]" /></a>)}</div><a href="mailto:contact@egamebenin.com" className="inline-flex items-center gap-2 text-sm text-[#A855F7]"><Mail size={16} />contact@egamebenin.com</a></section>;
  } else if (section === "partners") {
    content = <section className="mx-auto max-w-5xl space-y-6 px-5 py-28 sm:px-6"><h1 className="text-3xl font-gaming font-black uppercase text-white">Partners</h1><p className="text-sm text-[#8888AA]">Organizations officially supporting eGame Bénin.</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{partners.map((p) => <div key={p.id} className="rounded-2xl border border-[#8A2BE2]/25 bg-[#0F0F1E] p-5">{p.logo_url && <img src={p.logo_url} alt="" className="mb-3 h-12 w-12 object-contain" />}<h2 className="font-gaming font-bold text-white">{p.name}</h2>{p.description && <p className="mt-2 text-xs text-[#8888AA]">{p.description}</p>}</div>)}</div></section>;
  } else if (section === "leaderboard" || section === "classement") {
    content = <section className="mx-auto max-w-5xl space-y-5 px-5 py-28 sm:px-6"><h1 className="text-3xl font-gaming font-black uppercase text-white">Player rankings</h1><p className="text-sm text-[#8888AA]">See confirmed player rankings on the French leaderboard.</p><Link to="/classement" className="inline-flex rounded-xl border border-[#8A2BE2]/40 bg-[#0F0F1E] px-5 py-3 text-xs font-gaming font-bold uppercase text-white">View rankings</Link></section>;
  } else {
    content = <section className="mx-auto max-w-3xl px-5 py-32 text-center"><h1 className="text-3xl font-gaming font-black text-white">Page not available in English yet</h1><p className="mt-3 text-sm text-[#8888AA]">This account or transaction page is available in French.</p><Link to={frenchPath} className="mt-5 inline-flex rounded-xl bg-[#8A2BE2] px-5 py-3 text-xs font-gaming font-bold uppercase text-white">Open French page</Link></section>;
  }

  return <div className="min-h-screen bg-[#07070C] pb-28 text-white"><SEO title={pageTitle} description={EN_DESCRIPTION} url={`https://www.egamebenin.com${pathname}`} /><Header /><main>{content}</main><Footer /></div>;
};

export default EnglishSite;
