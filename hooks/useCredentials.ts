"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createCredential as createCredentialRequest,
  deleteCredential as deleteCredentialRequest,
  getCredentials,
  updateCredential as updateCredentialRequest,
} from "@/lib/credential-api";
import { decryptPassword, passwordForStorage, PLAINTEXT_PASSWORD_IV } from "@/lib/credential-crypto";
import type { Credential, CredentialDraft, CredentialPayload } from "@/types/credential";

function payloadFromCredential(credential: Credential): CredentialPayload {
  return {
    id: credential.id,
    name: credential.name,
    platform: credential.platform,
    category: credential.category,
    groupName: credential.groupName,
    url: credential.url,
    provider: credential.provider,
    loginMethod: credential.loginMethod,
    email: credential.email,
    username: credential.username,
    encryptedPassword: credential.encryptedPassword,
    passwordIv: credential.passwordIv,
    loginCredentialId: credential.loginCredentialId,
    emailCredentialId: credential.emailCredentialId,
    accessInstructions: credential.accessInstructions,
    notes: credential.notes,
    favorite: credential.favorite,
  };
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export function useCredentials(enabled: boolean) {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async (signal?: AbortSignal) => {
    if (!enabled) return;
    setLoading(true);
    try {
      const items = await getCredentials(signal);
      setCredentials(items);
      setReady(true);
      setError("");
    } catch (reason) {
      if (signal?.aborted) return;
      setError(reason instanceof Error ? reason.message : "No se pudieron cargar las cuentas.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      const timeoutId = window.setTimeout(() => {
        setCredentials([]);
        setReady(false);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }

    const controller = new AbortController();
    const initialRefreshId = window.setTimeout(() => void refresh(controller.signal), 0);
    const intervalId = window.setInterval(() => void refresh(controller.signal), 15_000);
    return () => {
      controller.abort();
      window.clearTimeout(initialRefreshId);
      window.clearInterval(intervalId);
    };
  }, [enabled, refresh]);

  const buildPayload = useCallback(async (
    draft: CredentialDraft,
    existing?: Credential,
  ): Promise<CredentialPayload> => {
    const keepsOwnPassword = draft.loginMethod === "password";
    let encryptedPassword = keepsOwnPassword ? existing?.encryptedPassword ?? null : null;
    let passwordIv = keepsOwnPassword ? existing?.passwordIv ?? null : null;

    if (keepsOwnPassword && draft.password) {
      const stored = passwordForStorage(draft.password);
      encryptedPassword = stored.encryptedPassword;
      passwordIv = stored.passwordIv;
    }

    const normalizedUrl = normalizeUrl(draft.url);
    const isWebsite = draft.loginMethod === "website";
    return {
      id: existing?.id ?? window.crypto.randomUUID(),
      name: draft.name,
      platform: draft.platform,
      category: draft.category,
      groupName: draft.groupName,
      url: normalizedUrl,
      provider: draft.loginMethod === "password" ? draft.provider : null,
      loginMethod: draft.loginMethod,
      email: isWebsite ? "" : draft.email,
      username: isWebsite ? "" : draft.username,
      encryptedPassword,
      passwordIv,
      loginCredentialId: draft.loginMethod === "google" ? draft.loginCredentialId : null,
      emailCredentialId: draft.loginMethod === "email_code" || draft.loginMethod === "magic_link"
        ? draft.emailCredentialId
        : null,
      accessInstructions: draft.accessInstructions,
      notes: draft.notes,
      favorite: draft.favorite,
    };
  }, []);

  const migrateToPlaintext = useCallback(async (legacyKey: CryptoKey) => {
    const migrated = await Promise.all(credentials.map(async (credential) => {
      if (!credential.encryptedPassword || !credential.passwordIv || credential.passwordIv === PLAINTEXT_PASSWORD_IV) {
        return credential;
      }

      const password = await decryptPassword(
        credential.encryptedPassword,
        credential.passwordIv,
        legacyKey,
      );
      const stored = passwordForStorage(password);
      return updateCredentialRequest({
        ...payloadFromCredential(credential),
        encryptedPassword: stored.encryptedPassword,
        passwordIv: stored.passwordIv,
      });
    }));

    setCredentials(migrated);
  }, [credentials]);

  const create = useCallback(async (draft: CredentialDraft) => {
    const credential = await createCredentialRequest(await buildPayload(draft));
    setCredentials((current) => [...current, credential]);
    return credential;
  }, [buildPayload]);

  const update = useCallback(async (existing: Credential, draft: CredentialDraft) => {
    const credential = await updateCredentialRequest(await buildPayload(draft, existing));
    setCredentials((current) => current.map((item) => item.id === credential.id ? credential : item));
    return credential;
  }, [buildPayload]);

  const toggleFavorite = useCallback(async (credential: Credential) => {
    const updated = await updateCredentialRequest({
      ...payloadFromCredential(credential),
      favorite: !credential.favorite,
    });
    setCredentials((current) => current.map((item) => item.id === updated.id ? updated : item));
  }, []);

  const remove = useCallback(async (id: string, force: boolean) => {
    await deleteCredentialRequest(id, force);
    setCredentials((current) => current
      .filter((item) => item.id !== id)
      .map((item) => ({
        ...item,
        loginCredentialId: item.loginCredentialId === id ? null : item.loginCredentialId,
        emailCredentialId: item.emailCredentialId === id ? null : item.emailCredentialId,
      })));
  }, []);

  return { credentials, loading, ready, error, create, update, toggleFavorite, remove, refresh, migrateToPlaintext };
}
