"use client";

import { useCallback, useEffect, useState } from "react";
import { unlockVault } from "@/lib/credential-crypto";
import { deleteVaultConfiguration, getVaultConfiguration } from "@/lib/credential-api";
import type { VaultConfiguration } from "@/types/credential";

export type VaultStatus = "loading" | "locked" | "unlocked" | "error";

export function useVault() {
  const [status, setStatus] = useState<VaultStatus>("loading");
  const [configuration, setConfiguration] = useState<VaultConfiguration | null>(null);
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    void getVaultConfiguration()
      .then((storedConfiguration) => {
        if (controller.signal.aborted) return;
        setConfiguration(storedConfiguration);
        setStatus(storedConfiguration ? "locked" : "unlocked");
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : "No se pudo abrir la sección de contraseñas.");
        setStatus("error");
      });

    return () => controller.abort();
  }, []);

  const unlock = useCallback(async (masterPassword: string) => {
    if (!configuration) return;
    setError("");
    const unlockedKey = await unlockVault(masterPassword, configuration);
    setKey(unlockedKey);
    setStatus("unlocked");
  }, [configuration]);

  const finishDisabling = useCallback(async () => {
    await deleteVaultConfiguration();
    setConfiguration(null);
    setKey(null);
    setStatus("unlocked");
  }, []);

  return {
    status,
    key,
    error,
    unlock,
    finishDisabling,
    requiresMigration: Boolean(configuration),
  };
}
