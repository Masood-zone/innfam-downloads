# iNNFam Android Downloads

Official early access downloads from **Gree Software Company**.

## Android early access

- [Download innfam-v1.1.apk — latest Android build 3](https://github.com/Masood-zone/innfam-downloads/releases/download/android-0.1.0-build.3/innfam-v1.1.apk)
- [Release notes and checksum](https://github.com/Masood-zone/innfam-downloads/releases/tag/android-0.1.0-build.3)

The latest APK is **Android version `0.1.0`, build `3`**. The `v1.1` filename is a distribution label. It includes chat refresh/notification routing fixes and the public App Updates page. Expo OTA updates are disabled in this APK.

This is an early access testing release for real-world use, repeated workflows, and tester-submitted usage reports. Features and behaviour may change.

Previous release: [v1 release notes](https://github.com/Masood-zone/innfam-downloads/releases/tag/v1-early-access) · [innfam-v1.apk](https://github.com/Masood-zone/innfam-downloads/releases/download/v1-early-access/innfam-v1.apk).

## Testing feedback

Use [Issues](https://github.com/Masood-zone/innfam-downloads/issues) to report reproducible problems. Include your phone model, Android version, steps, expected and actual results, and frequency. Remove private information from screenshots and reports.

## Gree Software Company

Visit [our official website](https://www.greesoftwarecompany.com).

Application source code is maintained separately from this public download repository.

## App Updates catalogue

[releases.json](releases.json) is the public, schema-versioned catalogue consumed by the iNNFam App Updates page. Its production address is [the raw catalogue](https://raw.githubusercontent.com/Masood-zone/innfam-downloads/main/releases.json). Requests require no account or API credential.

The catalogue preserves v1 and lists Android build 3. Build 3 identifies `com.innfam.innfam`, version `0.1.0`, Android build `3`, with OTA disabled. Its signer certificate matches v1; its size and SHA-256 were verified against the supplied APK and published release asset. The release owner confirmed installation over v1, session retention, chat refresh, and notification-to-chat opening. EAS reports source commit [`f1a865f`](https://github.com/Masood-zone/innfam/commit/f1a865fa76d6541706e59604d970f4882e5f6c8c), preserved under source tag [`android-0.1.0-build.3`](https://github.com/Masood-zone/innfam/tree/android-0.1.0-build.3).

The original v1 manifest identifies `com.innfam.innfam`, version `0.1.0`, Android build `2`, with OTA disabled. The catalogue checksum and size match the published GitHub asset and the supplied APK. Its original source commit was not recorded, so this one legacy record explicitly uses `sourceCommit: null` and `legacy: true`. Do not infer its source from this download repository's commits.

### Schema version 1

The top-level object contains `schemaVersion: 1` and a `releases` array (at most 100 entries). Every entry has a unique stable `id`, `kind`, `platform`, `title`, UTC `publishedAt` (`YYYY-MM-DDTHH:mm:ssZ`), nonempty `notes`, and `sourceCommit`. Notes describe changes actually shipped in that artifact. New records require the application's full lowercase 40-character Git commit, recorded against immutable tagged source.

| Kind | Additional required fields |
| --- | --- |
| `native` | `platform: "android"`, numeric `major.minor.patch` version, positive integer `buildNumber`, GitHub release `tag`, trusted `apkUrl`, positive integer `sizeBytes`, lowercase 64-character `sha256`, and `legacy: false`. |
| `ota` | `platform: "android"` or `"ios"`, actual lowercase UUID `updateId` returned by EAS, actual `runtimeVersion`, and `channel: "production"`. Use a separate release ID/label for each platform/update revision. |

APK URLs must be HTTPS assets under `github.com/Masood-zone/innfam-downloads/releases/download/<tag>/<filename>.apk`, without query strings, fragments or credentials. Native build identities and Expo update IDs must also be unique. The client rejects malformed catalogues and retains previously validated release information.

The catalogue supplies history and notes. Expo decides whether an OTA is compatible with the installed native runtime; adding metadata never enables an OTA or makes it installable. Android APK downloads open the browser and use Android's installation flow. A downloaded OTA may apply on the next cold start even if immediate restart is postponed.

### Publication discipline

1. Validate and commit the application source; tag the exact released source. Complete the applicable native/device acceptance checks.
2. For a native release, obtain the actual APK, inspect package/version/build/update configuration/signing identity, and calculate its byte size and SHA-256. Publish immutable versioned APK/checksum assets first. Preserve `v1-early-access` and its existing files.
3. For an OTA, publish only to the configured production environment/channel and supported platform/runtime. Record the actual returned update ID and runtime; never create a catalogue entry for a planned update.
4. Append the verified record to `releases.json`, validate it with the source app's `parseCatalogue` implementation, and compare native fields against the published asset/manifest. Commit and push this catalogue separately; verify the raw public URL loads.
5. Record publication identifiers and actual acceptance evidence in the source release documentation. If a record is erroneous, correct it transparently in Git; do not replace a released APK or silently reuse a release ID for different code.

The first OTA-enabled APK remains a subsequent release phase. Publishing this catalogue does not install an APK automatically. Original v1 installations predate the App Updates page; those users need the browser download link to install build 3.
