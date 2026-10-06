# iNNFam Android Downloads

Official early access downloads from **Gree Software Company**.

## Android early access

- [Download innfam-v1.apk](https://github.com/Masood-zone/innfam-downloads/releases/download/v1-early-access/innfam-v1.apk)
- [Release notes and checksum](https://github.com/Masood-zone/innfam-downloads/releases/tag/v1-early-access)

This is an early access testing release for real-world use, repeated workflows, and tester-submitted usage reports. Features and behaviour may change.

## Testing feedback

Use [Issues](https://github.com/Masood-zone/innfam-downloads/issues) to report reproducible problems. Include your phone model, Android version, steps, expected and actual results, and frequency. Remove private information from screenshots and reports.

## Gree Software Company

Visit [our official website](https://www.greesoftwarecompany.com).

Application source code is maintained separately from this public download repository.

## App Updates catalogue

[releases.json](releases.json) is the public, schema-versioned catalogue consumed by the iNNFam App Updates page. Its production address is [the raw catalogue](https://raw.githubusercontent.com/Masood-zone/innfam-downloads/main/releases.json). Requests require no account or API credential.

Only the existing published v1 APK is listed today. Its manifest identifies `com.innfam.innfam`, version `0.1.0`, Android build `2`, with OTA disabled. The catalogue checksum and size match the published GitHub asset and the supplied APK. Its original source commit was not recorded, so this one legacy record explicitly uses `sourceCommit: null` and `legacy: true`. Do not infer its source from this download repository's commits.

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

Source release configuration and the first OTA-enabled APK are a subsequent release phase. Publishing this catalogue does not update existing v1 installations.
