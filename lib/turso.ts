import "server-only";

import { createClient, type Client } from "@libsql/client";

let database: Client | undefined;
let schemaPromise: Promise<void> | undefined;

export class TursoConfigurationError extends Error {
  constructor() {
    super("Turso no está configurado");
    this.name = "TursoConfigurationError";
  }
}

function getClient(): Client {
  if (database) return database;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) throw new TursoConfigurationError();

  database = createClient({ url, authToken });
  return database;
}

export async function getTurso(): Promise<Client> {
  const client = getClient();

  schemaPromise ??= (async () => {
    await client.batch([
      `CREATE TABLE IF NOT EXISTS publication_checks (
          date_key TEXT NOT NULL,
          platform_id TEXT NOT NULL,
          publication_id TEXT NOT NULL,
          checked INTEGER NOT NULL DEFAULT 1,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (date_key, platform_id, publication_id)
        )`,
      `CREATE TABLE IF NOT EXISTS vault_settings (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          salt TEXT NOT NULL,
          verifier_ciphertext TEXT NOT NULL,
          verifier_iv TEXT NOT NULL,
          kdf_iterations INTEGER NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
      `CREATE TABLE IF NOT EXISTS credentials (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          platform TEXT NOT NULL DEFAULT '',
          category TEXT NOT NULL DEFAULT '',
          group_name TEXT NOT NULL DEFAULT '',
          url TEXT NOT NULL DEFAULT '',
          provider TEXT,
          login_method TEXT NOT NULL,
          email TEXT NOT NULL DEFAULT '',
          username TEXT NOT NULL DEFAULT '',
          encrypted_password TEXT,
          password_iv TEXT,
          login_credential_id TEXT,
          email_credential_id TEXT,
          access_instructions TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          favorite INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (login_credential_id) REFERENCES credentials(id),
          FOREIGN KEY (email_credential_id) REFERENCES credentials(id)
        )`,
      `CREATE TABLE IF NOT EXISTS credential_group_settings (
          name TEXT PRIMARY KEY COLLATE NOCASE,
          hidden INTEGER NOT NULL DEFAULT 0,
          sort_order INTEGER NOT NULL DEFAULT 999,
          color TEXT NOT NULL DEFAULT '#9CA3AF',
          color_customized INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
      `INSERT OR IGNORE INTO credential_group_settings (name, hidden, sort_order) VALUES ('Aceitera', 0, 10)`,
      `INSERT OR IGNORE INTO credential_group_settings (name, hidden, sort_order) VALUES ('Bamzuk', 0, 20)`,
      `INSERT OR IGNORE INTO credential_group_settings (name, hidden, sort_order) VALUES ('Italy Pizza', 0, 30)`,
      `INSERT OR IGNORE INTO credential_group_settings (name, hidden, sort_order) VALUES ('La Rueca', 0, 40)`,
      `INSERT OR IGNORE INTO credential_group_settings (name, hidden, sort_order) VALUES ('Astra Vibe', 0, 50)`,
      `INSERT OR IGNORE INTO credential_group_settings (name, hidden, sort_order) VALUES ('A Precio Justo', 0, 60)`,
      `INSERT OR IGNORE INTO credential_group_settings (name, hidden, sort_order) VALUES ('Pajarito', 0, 70)`,
      "CREATE INDEX IF NOT EXISTS credentials_name_idx ON credentials(name)",
      "CREATE INDEX IF NOT EXISTS credentials_login_relation_idx ON credentials(login_credential_id)",
      "CREATE INDEX IF NOT EXISTS credentials_email_relation_idx ON credentials(email_credential_id)",
    ], "write");

    const credentialColumns = await client.execute("PRAGMA table_info(credentials)");
    const hasProvider = credentialColumns.rows.some((row) => String(row.name) === "provider");
    if (!hasProvider) {
      try {
        await client.execute("ALTER TABLE credentials ADD COLUMN provider TEXT");
      } catch (error) {
        const message = error instanceof Error ? error.message.toLocaleLowerCase("es") : "";
        if (!message.includes("duplicate column")) throw error;
      }
    }

    const hasGroupName = credentialColumns.rows.some((row) => String(row.name) === "group_name");
    if (!hasGroupName) {
      try {
        await client.execute("ALTER TABLE credentials ADD COLUMN group_name TEXT NOT NULL DEFAULT ''");
      } catch (error) {
        const message = error instanceof Error ? error.message.toLocaleLowerCase("es") : "";
        if (!message.includes("duplicate column")) throw error;
      }
    }

    const groupColumns = await client.execute("PRAGMA table_info(credential_group_settings)");
    const hasGroupColor = groupColumns.rows.some((row) => String(row.name) === "color");
    if (!hasGroupColor) {
      await client.execute("ALTER TABLE credential_group_settings ADD COLUMN color TEXT NOT NULL DEFAULT '#9CA3AF'");
    }
    const hasCustomizedColor = groupColumns.rows.some((row) => String(row.name) === "color_customized");
    if (!hasCustomizedColor) {
      await client.execute("ALTER TABLE credential_group_settings ADD COLUMN color_customized INTEGER NOT NULL DEFAULT 0");
    }

    await client.batch([
      "CREATE INDEX IF NOT EXISTS credentials_provider_idx ON credentials(provider)",
      "CREATE INDEX IF NOT EXISTS credentials_group_name_idx ON credentials(group_name)",
      "UPDATE credential_group_settings SET color = '#E9BE32' WHERE name = 'Aceitera' AND color_customized = 0",
      "UPDATE credential_group_settings SET color = '#F08A24' WHERE name = 'Bamzuk' AND color_customized = 0",
      "UPDATE credential_group_settings SET color = '#C86448' WHERE name = 'Italy Pizza' AND color_customized = 0",
      "UPDATE credential_group_settings SET color = '#628B5B' WHERE name = 'La Rueca' AND color_customized = 0",
      "UPDATE credential_group_settings SET color = '#8659C7' WHERE name = 'Astra Vibe' AND color_customized = 0",
      "UPDATE credential_group_settings SET color = '#69BF35' WHERE name = 'A Precio Justo' AND color_customized = 0",
      "UPDATE credential_group_settings SET color = '#8B5E3C' WHERE name = 'Pajarito' AND color_customized = 0",
    ], "write");
  })();

  await schemaPromise;
  return client;
}
