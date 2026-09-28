// Fuseaux horaires par pays (identifiants IANA).
// Utilisés par le check-in quotidien : chaque joueur a SON fuseau local.
export const DEFAULT_TIMEZONE = "Africa/Porto-Novo";

// Un pays peut avoir plusieurs fuseaux : le joueur choisira le sien.
export const COUNTRY_TIMEZONES: Record<string, string[]> = {
  // Afrique de l'Ouest
  BJ: ["Africa/Porto-Novo"],
  TG: ["Africa/Lome"],
  CI: ["Africa/Abidjan"],
  GH: ["Africa/Accra"],
  NG: ["Africa/Lagos"],
  SN: ["Africa/Dakar"],
  ML: ["Africa/Bamako"],
  BF: ["Africa/Ouagadougou"],
  NE: ["Africa/Niamey"],
  GM: ["Africa/Banjul"],
  GN: ["Africa/Conakry"],
  GW: ["Africa/Bissau"],
  SL: ["Africa/Freetown"],
  LR: ["Africa/Monrovia"],
  MR: ["Africa/Nouakchott"],
  CV: ["Atlantic/Cape_Verde"],
  SH: ["Africa/Abidjan"],
  // Afrique centrale
  CM: ["Africa/Douala"],
  GA: ["Africa/Libreville"],
  GQ: ["Africa/Malabo"],
  CG: ["Africa/Brazzaville"],
  CD: ["Africa/Kinshasa", "Africa/Lubumbashi"],
  TD: ["Africa/Ndjamena"],
  CF: ["Africa/Bangui"],
  AO: ["Africa/Luanda"],
  ST: ["Africa/Sao_Tome"],
  // Afrique de l'Est
  KE: ["Africa/Nairobi"],
  UG: ["Africa/Kampala"],
  RW: ["Africa/Kigali"],
  BI: ["Africa/Bujumbura"],
  TZ: ["Africa/Dar_es_Salaam"],
  ET: ["Africa/Addis_Ababa"],
  ER: ["Africa/Asmara"],
  DJ: ["Africa/Djibouti"],
  SO: ["Africa/Mogadishu"],
  SS: ["Africa/Juba"],
  SD: ["Africa/Khartoum"],
  MG: ["Indian/Antananarivo"],
  MU: ["Indian/Mauritius"],
  SC: ["Indian/Mahe"],
  KM: ["Indian/Comoro"],
  // Afrique australe
  ZA: ["Africa/Johannesburg"],
  ZW: ["Africa/Harare"],
  ZM: ["Africa/Lusaka"],
  MW: ["Africa/Blantyre"],
  MZ: ["Africa/Maputo"],
  BW: ["Africa/Gaborone"],
  NA: ["Africa/Windhoek"],
  LS: ["Africa/Maseru"],
  SZ: ["Africa/Mbabane"],
  // Afrique du Nord
  MA: ["Africa/Casablanca"],
  DZ: ["Africa/Algiers"],
  TN: ["Africa/Tunis"],
  LY: ["Africa/Tripoli"],
  EG: ["Africa/Cairo"],
  // Grands pays multi-fuseaux hors Afrique
  US: ["America/New_York", "America/Chicago", "America/Denver", "America/Phoenix", "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu"],
  CA: ["America/Toronto", "America/Winnipeg", "America/Edmonton", "America/Vancouver", "America/St_Johns"],
  BR: ["America/Sao_Paulo", "America/Manaus", "America/Belem", "America/Fortaleza", "America/Recife", "America/Rio_Branco"],
  MX: ["America/Mexico_City", "America/Tijuana", "America/Cancun", "America/Hermosillo"],
  AU: ["Australia/Sydney", "Australia/Melbourne", "Australia/Brisbane", "Australia/Adelaide", "Australia/Perth", "Australia/Darwin"],
  RU: ["Europe/Moscow", "Europe/Kaliningrad", "Asia/Yekaterinburg", "Asia/Novosibirsk", "Asia/Krasnoyarsk", "Asia/Irkutsk", "Asia/Vladivostok"],
  ID: ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"],
  IN: ["Asia/Kolkata"],
  CN: ["Asia/Shanghai", "Asia/Urumqi"],
  FR: ["Europe/Paris"],
  GB: ["Europe/London"],
  TR: ["Europe/Istanbul"],
  AE: ["Asia/Dubai"],
  SA: ["Asia/Riyadh"]
};

export function isValidTimezone(timezone: string | null | undefined): boolean {
  if (!timezone) return false;
  try {
    new Intl.DateTimeFormat("fr", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export function getBrowserTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return isValidTimezone(tz) ? tz : DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

export function getTimezonesForCountry(countryCode: string | null | undefined): string[] {
  if (!countryCode) return [];
  return COUNTRY_TIMEZONES[countryCode.toUpperCase()] ?? [];
}

/**
 * Propose un fuseau pour un joueur :
 * 1. Si le pays a un fuseau unique → celui-ci.
 * 2. Sinon (pays multi-fuseaux ou pays inconnu) → fuseau du navigateur s'il est valide
 *    (le navigateur ne fait que PROPOSER, le fuseau est ensuite enregistré dans le profil
 *    et verrouillé au début de chaque cycle de série côté serveur).
 */
export function proposeTimezone(countryCode: string | null | undefined): string {
  const zones = getTimezonesForCountry(countryCode);
  if (zones.length === 1) return zones[0];
  if (zones.length > 1 && countryCode) {
    const browser = getBrowserTimezone();
    if (zones.includes(browser)) return browser;
    return zones[0];
  }
  return getBrowserTimezone();
}
