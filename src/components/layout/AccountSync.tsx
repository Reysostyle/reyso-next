"use client";

import { useEffect } from "react";
import { syncAccount } from "@/lib/account";

/** Loads the logged-in customer's account from the server on page load. */
export function AccountSync() {
  useEffect(() => {
    syncAccount();
  }, []);
  return null;
}
