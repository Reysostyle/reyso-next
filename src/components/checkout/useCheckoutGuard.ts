"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CHECKOUT_PHONE_KEY, CHECKOUT_VERIFIED_KEY } from "@/lib/customer";
import { useRaw } from "@/lib/local-store";
import { useHydrated } from "@/lib/use-hydrated";

/** Sends the visitor back to the phone or code step if they skipped it.
 *  Returns the verified phone once it's safe to render the step. */
export function useVerifiedPhone(): string | null {
  const router = useRouter();
  const hydrated = useHydrated();
  const phone = useRaw(CHECKOUT_PHONE_KEY);
  const verified = useRaw(CHECKOUT_VERIFIED_KEY) === "1";

  useEffect(() => {
    if (!hydrated) return;
    if (!phone) router.replace("/checkout/phone");
    else if (!verified) router.replace("/checkout/otp");
  }, [hydrated, phone, verified, router]);

  return hydrated && phone && verified ? phone : null;
}
