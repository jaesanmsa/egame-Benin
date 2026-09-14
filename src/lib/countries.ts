export interface AfricanCountry {
  code: string;
  name: string;
  dial: string;
  flag: string;
}

const flagFromCode = (code: string) =>
  String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));

const RAW_COUNTRIES: { code: string; name: string; dial: string }[] = [
  { code: 'ZA', name: 'Afrique du Sud', dial: '27' },
  { code: 'DZ', name: 'Algérie', dial: '213' },
  { code: 'AO', name: 'Angola', dial: '244' },
  { code: 'BJ', name: 'Bénin', dial: '229' },
  { code: 'BW', name: 'Botswana', dial: '267' },
  { code: 'BF', name: 'Burkina Faso', dial: '226' },
  { code: 'BI', name: 'Burundi', dial: '257' },
  { code: 'CM', name: 'Cameroun', dial: '237' },
  { code: 'CV', name: 'Cap-Vert', dial: '238' },
  { code: 'CF', name: 'Centrafrique', dial: '236' },
  { code: 'KM', name: 'Comores', dial: '269' },
  { code: 'CG', name: 'Congo-Brazzaville', dial: '242' },
  { code: 'CD', name: 'Congo-Kinshasa (RDC)', dial: '243' },
  { code: 'CI', name: "Côte d'Ivoire", dial: '225' },
  { code: 'DJ', name: 'Djibouti', dial: '253' },
  { code: 'EG', name: 'Égypte', dial: '20' },
  { code: 'ER', name: 'Érythrée', dial: '291' },
  { code: 'SZ', name: 'Eswatini', dial: '268' },
  { code: 'ET', name: 'Éthiopie', dial: '251' },
  { code: 'GA', name: 'Gabon', dial: '241' },
  { code: 'GM', name: 'Gambie', dial: '220' },
  { code: 'GH', name: 'Ghana', dial: '233' },
  { code: 'GN', name: 'Guinée', dial: '224' },
  { code: 'GW', name: 'Guinée-Bissau', dial: '245' },
  { code: 'GQ', name: 'Guinée équatoriale', dial: '240' },
  { code: 'KE', name: 'Kenya', dial: '254' },
  { code: 'LS', name: 'Lesotho', dial: '266' },
  { code: 'LR', name: 'Liberia', dial: '231' },
  { code: 'LY', name: 'Libye', dial: '218' },
  { code: 'MG', name: 'Madagascar', dial: '261' },
  { code: 'MW', name: 'Malawi', dial: '265' },
  { code: 'ML', name: 'Mali', dial: '223' },
  { code: 'MA', name: 'Maroc', dial: '212' },
  { code: 'MU', name: 'Maurice', dial: '230' },
  { code: 'MR', name: 'Mauritanie', dial: '222' },
  { code: 'MZ', name: 'Mozambique', dial: '258' },
  { code: 'NA', name: 'Namibie', dial: '264' },
  { code: 'NE', name: 'Niger', dial: '227' },
  { code: 'NG', name: 'Nigeria', dial: '234' },
  { code: 'UG', name: 'Ouganda', dial: '256' },
  { code: 'RW', name: 'Rwanda', dial: '250' },
  { code: 'ST', name: 'São Tomé-et-Principe', dial: '239' },
  { code: 'SN', name: 'Sénégal', dial: '221' },
  { code: 'SC', name: 'Seychelles', dial: '248' },
  { code: 'SL', name: 'Sierra Leone', dial: '232' },
  { code: 'SO', name: 'Somalie', dial: '252' },
  { code: 'SD', name: 'Soudan', dial: '249' },
  { code: 'SS', name: 'Soudan du Sud', dial: '211' },
  { code: 'TZ', name: 'Tanzanie', dial: '255' },
  { code: 'TD', name: 'Tchad', dial: '235' },
  { code: 'TG', name: 'Togo', dial: '228' },
  { code: 'TN', name: 'Tunisie', dial: '216' },
  { code: 'ZM', name: 'Zambie', dial: '260' },
  { code: 'ZW', name: 'Zimbabwe', dial: '263' }
];

export const AFRICAN_COUNTRIES: AfricanCountry[] = RAW_COUNTRIES.map((c) => ({
  ...c,
  flag: flagFromCode(c.code)
}));

export const DEFAULT_COUNTRY_CODE = 'BJ';

export const getCountryByCode = (code?: string | null): AfricanCountry | undefined =>
  AFRICAN_COUNTRIES.find((c) => c.code === code);
