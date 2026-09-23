/**
 * Utilitaires d'heure du Bénin (GMT+1, Africa/Porto-Novo).
 * Toute l'application travaille en heure du Bénin pour les tournois.
 */
export const BENIN_TZ = "Africa/Porto-Novo";

const beninParts = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BENIN_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute") };
};

/** Moment présent, format "YYYY-MM-DDTHH:mm" en heure du Bénin (valeur par défaut des inputs). */
export const beninNowInput = (): string => isoToBeninInput(new Date().toISOString());

/**
 * Convertit une valeur datetime-local (heure du Bénin choisie par l'admin)
 * en ISO UTC exact — le "+01:00" fixe l'heure en GMT+1 quoi qu'il arrive.
 */
export const beninInputToIso = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const v = value.length === 16 ? `${value}:00` : value;
  const d = new Date(`${v}+01:00`);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

/** ISO → "YYYY-MM-DDTHH:mm" exprimé en heure du Bénin (pour pré-remplir les inputs). */
export const isoToBeninInput = (iso?: string | null): string => {
  if (!iso) return "";
  try {
    const p = beninParts(new Date(iso));
    return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
  } catch {
    return "";
  }
};

/** ISO → "12 sept. 2026, 18:00" en heure du Bénin. */
export const formatBeninDateTime = (iso?: string | null): string =>
  iso
    ? new Date(iso).toLocaleString("fr-FR", {
        timeZone: BENIN_TZ,
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

/** ISO → "12 sept., 18:00" (compact, sans année) en heure du Bénin. */
export const formatBeninShort = (iso?: string | null): string =>
  iso
    ? new Date(iso).toLocaleString("fr-FR", {
        timeZone: BENIN_TZ,
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

/** ISO → "12 sept." (date seule) en heure du Bénin. */
export const formatBeninDate = (iso?: string | null): string =>
  iso
    ? new Date(iso).toLocaleDateString("fr-FR", {
        timeZone: BENIN_TZ,
        day: "numeric",
        month: "short",
      })
    : "";
