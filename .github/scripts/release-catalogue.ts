export const RELEASE_CATALOGUE_URL = "https://raw.githubusercontent.com/Masood-zone/innfam-downloads/main/releases.json";
export const DOWNLOAD_REPOSITORY = "https://github.com/Masood-zone/innfam-downloads";

type ReleaseBase = {
  id: string;
  title: string;
  publishedAt: string;
  notes: string[];
  sourceCommit: string | null;
};
export type NativeRelease = ReleaseBase & {
  kind: "native";
  platform: "android";
  version: string;
  buildNumber: number;
  tag: string;
  apkUrl: string;
  sha256: string;
  sizeBytes: number;
  legacy: boolean;
};
export type OtaRelease = ReleaseBase & {
  kind: "ota";
  platform: "android" | "ios";
  updateId: string;
  runtimeVersion: string;
  channel: "production";
  sourceCommit: string;
};
export type Release = NativeRelease | OtaRelease;
export type ReleaseCatalogue = { schemaVersion: 1; releases: Release[] };

function invalid(field: string): never {
  throw new Error(`Release information is invalid (${field}). Please try again later.`);
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return invalid("record");
  return value as Record<string, unknown>;
}
function string(value: unknown, field: string, max = 160): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) return invalid(field);
  return value;
}
function positiveInteger(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) return invalid(field);
  return value;
}
export function isTrustedApkUrl(value: string, tag?: string): boolean {
  try {
    const url = new URL(value);
    const match = /^\/Masood-zone\/innfam-downloads\/releases\/download\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+\.apk)$/.exec(url.pathname);
    return url.protocol === "https:" && url.hostname === "github.com" && !url.port && !url.username && !url.password && !url.search && !url.hash && Boolean(match && (!tag || match[1] === tag));
  } catch { return false; }
}
export function parseCatalogue(value: unknown): ReleaseCatalogue {
  const catalogue = object(value);
  if (catalogue.schemaVersion !== 1) return invalid("schema version");
  if (!Array.isArray(catalogue.releases) || catalogue.releases.length > 100) return invalid("releases");
  const ids = new Set<string>();
  const artifacts = new Set<string>();
  const releases = catalogue.releases.map((item: unknown): Release => {
    const row = object(item);
    const id = string(row.id, "release ID");
    if (!/^[A-Za-z0-9._-]+$/.test(id) || ids.has(id)) return invalid("duplicate or unsafe release ID");
    ids.add(id);
    const publishedAt = string(row.publishedAt, "publication date");
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(publishedAt) || !Number.isFinite(Date.parse(publishedAt)) || new Date(publishedAt).toISOString() !== publishedAt.replace("Z", ".000Z")) return invalid("publication date");
    if (!Array.isArray(row.notes) || !row.notes.length || row.notes.length > 20) return invalid("release notes");
    const notes = row.notes.map((note: unknown) => string(note, "release note", 800));
    const sourceCommit = row.sourceCommit === null ? null : string(row.sourceCommit, "source commit");
    if (sourceCommit !== null && !/^[0-9a-f]{40}$/.test(sourceCommit)) return invalid("source commit");
    const base = { id, title: string(row.title, "title"), publishedAt, notes, sourceCommit };
    if (row.kind === "native") {
      if (row.platform !== "android" || typeof row.legacy !== "boolean") return invalid("native platform/provenance");
      const version = string(row.version, "native version");
      if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version) || version.split(".").some((part) => !Number.isSafeInteger(Number(part)))) return invalid("native version");
      const buildNumber = positiveInteger(row.buildNumber, "Android build number");
      const tag = string(row.tag, "release tag");
      const apkUrl = string(row.apkUrl, "APK URL", 500);
      if (!isTrustedApkUrl(apkUrl, tag)) return invalid("APK destination");
      const sha256 = string(row.sha256, "SHA-256");
      if (!/^[0-9a-f]{64}$/.test(sha256)) return invalid("SHA-256");
      // The original public APK predates source provenance records. New releases must name their source.
      if (row.legacy ? tag !== "v1-early-access" || version !== "0.1.0" || buildNumber !== 2 || sourceCommit !== null : sourceCommit === null) return invalid("source provenance");
      const artifact = `android:${buildNumber}`;
      if (artifacts.has(artifact)) return invalid("duplicate native build");
      artifacts.add(artifact);
      return { ...base, kind: "native", platform: "android", version, buildNumber, tag, apkUrl, sha256, sizeBytes: positiveInteger(row.sizeBytes, "APK size"), legacy: row.legacy };
    }
    if (row.kind === "ota") {
      const updateId = string(row.updateId, "Expo update ID");
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(updateId) || artifacts.has(updateId)) return invalid("Expo update ID");
      artifacts.add(updateId);
      if ((row.platform !== "android" && row.platform !== "ios") || row.channel !== "production" || sourceCommit === null) return invalid("OTA target/source");
      return { ...base, sourceCommit, kind: "ota", platform: row.platform, channel: "production", updateId, runtimeVersion: string(row.runtimeVersion, "runtime version", 256) };
    }
    return invalid("release kind");
  });
  return { schemaVersion: 1, releases };
}

export async function fetchCatalogue(): Promise<ReleaseCatalogue> {
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), 12_000);
  try {
    const response = await fetch(RELEASE_CATALOGUE_URL, { signal: abort.signal, credentials: "omit", cache: "no-store" });
    if (!response.ok) throw new Error("Release information could not be loaded. Please try again.");
    const body = await response.text();
    if (body.length > 150_000) return invalid("catalogue size");
    let data: unknown;
    try { data = JSON.parse(body); } catch { return invalid("JSON"); }
    return parseCatalogue(data);
  } finally { clearTimeout(timeout); }
}
