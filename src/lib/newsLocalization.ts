// Localized display of the two editorial articles. Original Supabase records remain unchanged.
type NewsArticle = { id: string; title: string; excerpt: string; content: string; read_time?: string | null };
const englishArticles: Record<string, {title:string;excerpt:string;content:string}> = {
  "0f6ea27b-0ad0-454c-9082-3b9f61f50945": {
    title: "Welcome to the eGame Bénin Arena!",
    excerpt: "Discover eGame Bénin, gaming tournaments and our community.",
    content: "eGame Bénin is a competitive gaming digital platform where players can join tournaments, track their progress and become part of an organized community. Our mission is to develop esports in Benin and gradually connect African gamers through accessible, well-organized competitions."
  },
  "f1c0c179-2155-480a-96ab-a7e4d793e5b8": {
    title: "Guide: How to Join a Tournament",
    excerpt: "The steps to register for a tournament and confirm your participation.",
    content: "How to join a tournament on eGame Bénin:\n\n1. Browse the open tournaments.\n2. Complete your profile and connect your Discord account.\n3. Follow the registration steps and choose a payment method available for that tournament.\n4. Check your registrations and the information shared on the relevant Discord server.\n\nPrizes are awarded after the final results are verified, according to the tournament rules."
  }
};
export function localizeNews<T extends NewsArticle>(article: T, language: "fr" | "en"): T {
  if (language !== "en" || !englishArticles[article.id]) return article;
  return { ...article, ...englishArticles[article.id] };
}
