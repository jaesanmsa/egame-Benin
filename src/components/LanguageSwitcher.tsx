import { Link, useLocation } from "react-router-dom";
import { toEnglishPath, toFrenchPath } from "@/lib/languageRouting";

const LanguageSwitcher = () => {
  const { pathname, search, hash } = useLocation();
  const english = pathname === "/en" || pathname.startsWith("/en/");
  const targetEnglish = (english ? pathname : toEnglishPath(pathname)) + search + hash;
  const targetFrench = (english ? toFrenchPath(pathname) : pathname) + search + hash;

  return (
    <div role="group" aria-label="Select language" className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-[#07070C]/70 p-1">
      <Link
        to={targetFrench}
        aria-current={!english ? "page" : undefined}
        lang="fr"
        className={`rounded-full px-2 py-1 text-[9px] font-gaming font-black tracking-wider transition-colors ${!english ? "bg-[#8A2BE2] text-white" : "text-[#8888AA] hover:text-white"}`}
      >
        FR
      </Link>
      <span aria-hidden="true" className="text-[9px] text-[#8888AA]/60">|</span>
      <Link
        to={targetEnglish}
        aria-current={english ? "page" : undefined}
        lang="en"
        className={`rounded-full px-2 py-1 text-[9px] font-gaming font-black tracking-wider transition-colors ${english ? "bg-[#8A2BE2] text-white" : "text-[#8888AA] hover:text-white"}`}
      >
        EN
      </Link>
    </div>
  );
};

export default LanguageSwitcher;
