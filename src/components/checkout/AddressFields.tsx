"use client";

import { useState } from "react";
import type { Address } from "@/lib/customer";
import { toEnglishDigits } from "@/lib/digits";
import { IRAN_OTHER_CITY_VALUE, getIranCities, getIranProvinceNames } from "@/lib/iran-locations";

// Province → city → address → postcode fields, shared by the checkout
// details step and the profile address form.

export const NAME_PATTERN = /^[^\d۰-۹٠-٩]+$/; // no digits, any script otherwise
const HAS_LETTER_PATTERN = /[a-zA-Zا-یآ-ی]/; // address needs real text, not just numbers

export const isValidName = (v: string) => v.trim().length > 0 && NAME_PATTERN.test(v.trim());

type Field = "province" | "city" | "address" | "postal";

export type AddressFormState = ReturnType<typeof useAddressForm>;

export function useAddressForm(initial?: Partial<Address> | null) {
  const savedCityListed = initial?.city ? getIranCities(initial.province).includes(initial.city) : true;
  const [province, setProvince] = useState(initial?.province ?? "");
  // A saved city missing from the list (or typed via "other") goes back
  // into the free-text field rather than being lost.
  const [citySelect, setCitySelect] = useState(
    initial?.city ? (savedCityListed ? initial.city : IRAN_OTHER_CITY_VALUE) : "",
  );
  const [cityOther, setCityOther] = useState(initial?.city && !savedCityListed ? initial.city : "");
  const [address, setAddress] = useState(initial?.full ?? "");
  const [postal, setPostal] = useState(initial?.postal ?? "");
  const [errors, setErrors] = useState<Record<Field, boolean>>({
    province: false,
    city: false,
    address: false,
    postal: false,
  });

  const city = citySelect === IRAN_OTHER_CITY_VALUE ? cityOther.trim() : citySelect;
  const clear = (f: Field) => setErrors((e) => (e[f] ? { ...e, [f]: false } : e));

  function reset(next?: Partial<Address> | null) {
    const listed = next?.city ? getIranCities(next.province).includes(next.city) : true;
    setProvince(next?.province ?? "");
    setCitySelect(next?.city ? (listed ? next.city : IRAN_OTHER_CITY_VALUE) : "");
    setCityOther(next?.city && !listed ? next.city : "");
    setAddress(next?.full ?? "");
    setPostal(next?.postal ?? "");
    setErrors({ province: false, city: false, address: false, postal: false });
  }

  /** Marks invalid fields; returns the first invalid field, or null. */
  function validate(): Field | null {
    const next = {
      province: province === "",
      city: city === "",
      address: !(address.trim().length > 0 && HAS_LETTER_PATTERN.test(address.trim())),
      postal: !/^\d{10}$/.test(postal.trim()),
    };
    setErrors(next);
    return (["province", "city", "address", "postal"] as Field[]).find((f) => next[f]) ?? null;
  }

  function value() {
    return { province, city, full: address.trim(), postal: postal.trim() };
  }

  return {
    province,
    citySelect,
    cityOther,
    address,
    postal,
    errors,
    validate,
    value,
    reset,
    setProvince: (v: string) => {
      setProvince(v);
      setCitySelect("");
      setCityOther("");
      clear("province");
    },
    setCitySelect: (v: string) => {
      setCitySelect(v);
      clear("city");
    },
    setCityOther: (v: string) => {
      setCityOther(v);
      clear("city");
    },
    setAddress: (v: string) => {
      setAddress(v);
      clear("address");
    },
    setPostal: (v: string) => {
      setPostal(toEnglishDigits(v).replace(/\D/g, "").slice(0, 10));
      clear("postal");
    },
  };
}

type Ids = { province: string; city: string; cityOther: string; address: string; postal: string };

export function AddressFields({
  form,
  ids,
  autoComplete = false,
}: {
  form: AddressFormState;
  ids: Ids;
  autoComplete?: boolean;
}) {
  const ac = (v: string) => (autoComplete ? v : undefined);
  const cities = getIranCities(form.province);

  return (
    <>
      <div className="auth-form-row auth-label-spaced">
        <div>
          <label htmlFor={ids.province}>استان</label>
          <select
            id={ids.province}
            className={"auth-text-input auth-select" + (form.errors.province ? " is-invalid" : "")}
            autoComplete={ac("address-level1")}
            value={form.province}
            onChange={(e) => form.setProvince(e.target.value)}
          >
            <option value="">انتخاب استان</option>
            {getIranProvinceNames().map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <p className="auth-error" id={ids.province + "-error"} hidden={!form.errors.province}>
            استان رو انتخاب کن.
          </p>
        </div>
        <div>
          <label htmlFor={ids.city}>شهر</label>
          <select
            id={ids.city}
            className={"auth-text-input auth-select" + (form.errors.city ? " is-invalid" : "")}
            autoComplete={ac("address-level2")}
            disabled={!form.province}
            value={form.citySelect}
            onChange={(e) => form.setCitySelect(e.target.value)}
          >
            {form.province ? (
              <>
                <option value="">انتخاب شهر</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value={IRAN_OTHER_CITY_VALUE}>شهر من تو لیست نیست...</option>
              </>
            ) : (
              <option value="">ابتدا استان رو انتخاب کن</option>
            )}
          </select>
          <input
            type="text"
            id={ids.cityOther}
            className="auth-text-input auth-label-spaced"
            placeholder="اسم شهر یا روستا رو بنویس"
            hidden={form.citySelect !== IRAN_OTHER_CITY_VALUE}
            autoFocus={form.citySelect === IRAN_OTHER_CITY_VALUE && !form.cityOther}
            value={form.cityOther}
            onChange={(e) => form.setCityOther(e.target.value)}
          />
          <p className="auth-error" id={ids.city + "-error"} hidden={!form.errors.city}>
            شهر رو انتخاب کن.
          </p>
        </div>
      </div>
      <label htmlFor={ids.address} className="auth-label-spaced">
        آدرس کامل
      </label>
      <textarea
        id={ids.address}
        className={"auth-text-input auth-textarea" + (form.errors.address ? " is-invalid" : "")}
        autoComplete={ac("street-address")}
        placeholder="خیابان، کوچه، پلاک، واحد..."
        value={form.address}
        onChange={(e) => form.setAddress(e.target.value)}
      ></textarea>
      <p className="auth-error" id={ids.address + "-error"} hidden={!form.errors.address}>
        آدرس رو کامل‌تر بنویس (فقط عدد کافی نیست).
      </p>
      <label htmlFor={ids.postal} className="auth-label-spaced">
        کد پستی
      </label>
      <input
        type="tel"
        id={ids.postal}
        className={"auth-text-input" + (form.errors.postal ? " is-invalid" : "")}
        inputMode="numeric"
        autoComplete={ac("postal-code")}
        maxLength={10}
        placeholder="۱۰ رقم، بدون فاصله"
        dir="ltr"
        value={form.postal}
        onChange={(e) => form.setPostal(e.target.value)}
      />
      <p className="auth-error" id={ids.postal + "-error"} hidden={!form.errors.postal}>
        کد پستی باید ۱۰ رقم باشه.
      </p>
    </>
  );
}

/** Focus the element for the first invalid field. */
export function focusField(ids: Ids, field: Field | null, form: AddressFormState) {
  if (!field) return;
  const id = field === "city" && form.citySelect === IRAN_OTHER_CITY_VALUE ? ids.cityOther : ids[field];
  document.getElementById(id)?.focus();
}
