import fs from 'node:fs';
import assert from 'node:assert/strict';
import { parseCatalogue } from './release-catalogue.ts';

const tag = 'android-0.1.1-build.8';
const filename = 'innfam-v1.1.2.apk';
const source = '40c3e36720aef6621e1948d41bdda318d076028a';
const runtime = '0e85c533998a9f468a708083b5760297f0f1c731';
const sha256 = 'd30d86ec946362835c3d557ca2e66c3bd36b7644c4f73dd3c58a345060e709d8';
const sizeBytes = 171348245;
const release = JSON.parse(fs.readFileSync('/tmp/build8-release.json', 'utf8'));
assert.equal(release.tag_name, tag);
assert.equal(release.draft, false);
assert.equal(release.prerelease, true);
const asset = release.assets.find(item => item.name === filename);
const checksums = release.assets.find(item => item.name === 'SHA256SUMS.txt');
assert.ok(asset && checksums, 'Published assets missing');
assert.equal(asset.size, sizeBytes);
assert.equal(asset.digest, `sha256:${sha256}`);
const head = await fetch(asset.browser_download_url, { method: 'HEAD', signal: AbortSignal.timeout(60000) });
assert.equal(head.status, 200);
assert.equal(Number(head.headers.get('content-length')), sizeBytes);
const sum = await fetch(checksums.browser_download_url, { signal: AbortSignal.timeout(60000) });
assert.equal(sum.status, 200);
assert.equal((await sum.text()).trim(), `${sha256}  ${filename}`);

const cat = JSON.parse(fs.readFileSync('releases.json', 'utf8'));
parseCatalogue(cat);
const previous = JSON.stringify(cat.releases);
const previousLength = cat.releases.length;
const native = {
  id: tag, kind: 'native', platform: 'android', title: 'iNNFam Android Early Access - build 8',
  version: '0.1.1', buildNumber: 8, tag, publishedAt: release.published_at,
  apkUrl: asset.browser_download_url, sizeBytes, sha256, sourceCommit: source, legacy: false,
  notes: [
    'Stronger Home title and compact saved discovery location with explicit confirmation and recoverable save/clear actions.',
    'Property filters use an Apply/Cancel panel with clearer loading, error and empty results.',
    'Clearer phone verification validation, sending and retry states; form clearance accounts for the keyboard toolbar.',
    'Actual Android version 0.1.1, build 8. The innfam-v1.1.2.apk filename is a distribution label. Production OTA runtime and signer certificate identity match build 7. Device acceptance remains unverified.'
  ]
};
const existing = cat.releases.find(item => item.id === tag);
if (existing) {
  assert.equal(existing.sha256, sha256); assert.equal(existing.apkUrl, native.apkUrl);
} else cat.releases.push(native);
const updateId = '01a18500-6d45-7e5f-bc4c-afc05c0ccf08';
if (!cat.releases.some(item => item.updateId === updateId)) cat.releases.push({
  id: 'android-0.1.1-build8-ui-ota', kind: 'ota', platform: 'android', title: 'Build 8 discovery and account improvements',
  publishedAt: '2026-10-29T00:12:40Z', sourceCommit: source, updateId, runtimeVersion: runtime, channel: 'production',
  notes: ['Production republish of the verified UI states update: Home header, compact saved location, explicit filter Apply/Cancel, phone verification recovery and keyboard toolbar clearance.', 'Uses the same tested JavaScript and assets as the preceding UI update; no additional app features or native permissions were introduced.']
});
assert.equal(JSON.stringify(cat.releases.slice(0, previousLength)), previous, 'Earlier catalogue records changed');
parseCatalogue(cat);
fs.writeFileSync('releases.json', `${JSON.stringify(cat, null, 2)}\n`);

let readme = fs.readFileSync('README.md', 'utf8');
const old = '- [Download innfam-v1.1-inapp.apk — latest Android build 7](https://github.com/Masood-zone/innfam-downloads/releases/download/android-0.1.1-build.7/innfam-v1.1-inapp.apk)';
if (readme.includes(old)) {
  readme = readme.replace(old, `- [Download ${filename} — latest Android build 8](${asset.browser_download_url})`);
  readme = readme.replace('- [Release notes and checksum](https://github.com/Masood-zone/innfam-downloads/releases/tag/android-0.1.1-build.7)', `- [Release notes and checksum](${release.html_url})`);
  readme = readme.replace('The latest APK is **Android version `0.1.1`, build `7`**. The `v1.1-inapp` filename is a distribution label.', 'The latest APK is **Android version `0.1.1`, build `8`**. The `v1.1.2` filename is a distribution label.');
  readme = readme.replace('Previous releases: ', 'Previous releases: [build 7 release notes](https://github.com/Masood-zone/innfam-downloads/releases/tag/android-0.1.1-build.7) · [innfam-v1.1-inapp.apk](https://github.com/Masood-zone/innfam-downloads/releases/download/android-0.1.1-build.7/innfam-v1.1-inapp.apk) · ');
  readme = readme.replace('to install build 7.', 'to install build 8.');
  readme += `\n## Build 8 and production OTA\n\nBuild 8 ships the Home, discovery, filters, phone verification and keyboard improvements from [source 40c3e36](https://github.com/Masood-zone/innfam/commit/${source}), tagged [mobile-0.1.1-ui-states-source](https://github.com/Masood-zone/innfam/tree/mobile-0.1.1-ui-states-source). The supplied APK matches the finished EAS artifact byte-for-byte. Package: \`com.innfam.innfam\`; actual version \`0.1.1\`, build \`8\`; size ${sizeBytes} bytes; SHA-256 \`${sha256}\`. The signer certificate identity matches build 7; full cryptographic signature verification was not performed. Runtime: \`${runtime}\`, production channel.\n\nA fresh production Android OTA was published on 2026-10-29, update ID \`${updateId}\`, group \`f9c01afc-eafb-4a40-bab6-8d90424d64a3\`. This republishes the previously verified UI update. Phone installation/session retention, keyboard geometry, provider delivery and OTA arrival/restart remain unverified. Previous releases and catalogue records are preserved.\n`;
} else assert.ok(readme.includes(`latest Android build 8](${asset.browser_download_url})`), 'README changed unexpectedly');
fs.writeFileSync('README.md', readme);
fs.mkdirSync('.release-evidence', { recursive: true });
fs.writeFileSync(`.release-evidence/${tag}.json`, `${JSON.stringify({
  releaseUrl: release.html_url, publishedAt: release.published_at, apkUrl: asset.browser_download_url,
  checksumUrl: checksums.browser_download_url, package: 'com.innfam.innfam', version: '0.1.1', buildNumber: 8,
  sha256, sizeBytes, sourceCommit: source, sourceTag: 'mobile-0.1.1-ui-states-source', runtimeVersion: runtime,
  easBuildId: '19a793d1-6d79-4097-bcaa-e9fa00754fb8', embeddedManifestId: 'c368615c-1fa0-4468-95cb-24a9e195b645',
  signerCertificateSha256: '4b70c0c897aa579b5d045af3be6623d9e66e1a37d04db5eb746df462dd8a80c5',
  fullSignatureVerificationPerformed: false, suppliedApkMatchedEasArtifact: true,
  otaUpdateId: updateId, otaGroup: 'f9c01afc-eafb-4a40-bab6-8d90424d64a3', otaPublishedAt: '2026-10-29T00:12:40.133Z',
  workflowRunId: process.env.GITHUB_RUN_ID, catalogueValidated: true, publicAssetsVerified: true, deviceAcceptanceVerified: false
}, null, 2)}\n`);
console.log(JSON.stringify({ published: true, releaseUrl: release.html_url, records: cat.releases.length, sha256 }));
