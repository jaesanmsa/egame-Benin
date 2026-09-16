"use client";

import React, { useMemo } from 'react';
import { Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { AFRICAN_COUNTRIES, DEFAULT_COUNTRY_CODE, getCountryByCode } from '@/lib/countries';

interface PhoneCountryInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  /** Pays affiché par défaut quand aucun numéro n'est encore saisi (ex : suit le pays choisi à l'inscription). */
  defaultCountryCode?: string;
}

/**
 * Décompose un numéro stocké (ex : "2290141790790") en pays + numéro national.
 * L'indicatif est recherché à toutes les longueurs : c'est ce qui empêche
 * l'indicatif de s'accumuler ("229229…") pendant la saisie d'un numéro court.
 * `code` est null quand aucun indicatif n'est identifiable (numéro vide ou local).
 */
export const parsePhoneNumber = (value: string): { code: string | null; national: string } => {
  const digits = (value || '').replace(/\D/g, '');
  if (!digits) return { code: null, national: '' };

  const sorted = [...AFRICAN_COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const country of sorted) {
    if (digits.length > country.dial.length && digits.startsWith(country.dial)) {
      return { code: country.code, national: digits.slice(country.dial.length) };
    }
  }
  return { code: null, national: digits };
};

/**
 * Remplace l'indicatif d'un numéro par celui du pays donné, en conservant les chiffres nationaux.
 * Retourne '' si aucun chiffre n'est saisi.
 */
export const setPhoneCountry = (phone: string, code: string): string => {
  const country = getCountryByCode(code);
  if (!country) return phone;
  const { national } = parsePhoneNumber(phone);
  return national ? `${country.dial}${national}` : '';
};

const PhoneCountryInput = ({ value, onChange, id, placeholder, defaultCountryCode }: PhoneCountryInputProps) => {
  const parsed = useMemo(() => parsePhoneNumber(value), [value]);

  const selected =
    (parsed.code ? AFRICAN_COUNTRIES.find((c) => c.code === parsed.code) : undefined) ??
    (defaultCountryCode ? AFRICAN_COUNTRIES.find((c) => c.code === defaultCountryCode) : undefined) ??
    AFRICAN_COUNTRIES.find((c) => c.code === DEFAULT_COUNTRY_CODE)!;

  const handleCountryChange = (code: string) => {
    const country = AFRICAN_COUNTRIES.find((c) => c.code === code);
    if (!country) return;
    onChange(parsed.national ? `${country.dial}${parsed.national}` : '');
  };

  const handleNumberChange = (raw: string) => {
    const national = raw.replace(/\D/g, '').slice(0, 15);
    onChange(national ? `${selected.dial}${national}` : '');
  };

  return (
    <div className="flex gap-2">
      <Select value={selected.code} onValueChange={handleCountryChange}>
        <SelectTrigger
          aria-label="Indicatif du pays"
          className="w-[7.5rem] shrink-0 bg-[#07070C] border-[#8A2BE2]/30 rounded-xl text-white font-medium gap-1"
        >
          <span className="flex items-center gap-1.5 text-xs font-bold whitespace-nowrap">
            {selected.flag} +{selected.dial}
          </span>
        </SelectTrigger>
        <SelectContent className="bg-[#0F0F1E] border-[#8A2BE2]/40 text-white max-h-80">
          {AFRICAN_COUNTRIES.map((country) => (
            <SelectItem key={country.code} value={country.code} className="text-xs">
              {country.flag} {country.name} (+{country.dial})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative flex-1">
        <Phone className="absolute left-3 top-3 text-[#8888AA]" size={18} />
        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          value={parsed.national}
          onChange={(e) => handleNumberChange(e.target.value)}
          className="pl-10 bg-[#07070C] border-[#8A2BE2]/30 rounded-xl text-white font-medium"
          placeholder={placeholder || 'Ex : 01 97 12 34 56'}
          required
        />
      </div>
    </div>
  );
};

export default PhoneCountryInput;
