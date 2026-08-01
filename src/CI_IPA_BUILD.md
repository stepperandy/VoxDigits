# No-Mac IPA build via GitHub Actions

This produces an **inspectable** VoxVPN IPA (`com.voxvpn.mobile`) on a
GitHub-hosted macOS runner. You download the artifact, unzip, and run the
checks (Packet Tunnel `.appex`, entitlements, Info.plist metadata,
Google Play / payment references).

> The Base44 iOS publisher **cannot** do this — it overrides the bundle ID and
> omits the Network Extension. This CI path is the alternative.

---

## 1. Run the build

Push the workflow then trigger it:

- **Manual:** repo → Actions → "Build VoxVPN iOS" → Run workflow
- **Tagged:** `git tag ipa-2.0.1 && git push --tags`

First move the workflow into place (the Base44 GitHub sync app can't write
under `.github/workflows/`):

```
mkdir -p .github/workflows
cp src/scripts/build-ipa-ci.yml .github/workflows/build-ipa.yml
git add .github/workflows/build-ipa.yml && git commit -m "ci: ios ipa build" && git push
```

The job runs on `macos-latest`, builds the web app, runs `npx cap sync ios`,
archives unsigned, and uploads `VoxVPN-inspect.zip` as a 14-day artifact.

## 2. Download & inspect

Actions run → scroll to the build → **Artifacts** → `VoxVPN-ipa-inspect.zip`.

Unzip and check:

| Check | How |
|------|-----|
| Bundle ID | `plutil -p VoxVPN.app/Info.plist \| grep CFBundleIdentifier` → `com.voxvpn.mobile` |
| Version/build | `App-Info.plist.txt` → `CFBundleShortVersionString` / `CFBundleVersion` |
| Entitlements | `VoxVPN.entitlements.txt` → `networkextension.packet-tunnel-provider`, `application-groups` |
| Packet Tunnel `.appex` | `PlugIns.txt` — present only if the Tunnel target was added (step 3) |
| Google Play / payment refs | `grep -Rni "google.play\|playstore\|stripe\|hubtel\|iap\|storekit" VoxVPN.app` |

## 3. Packet Tunnel `.appex` — one-time manual step

`npx cap sync ios` regenerates the Xcode project and **does not** include a
Network Extension target. To get the `.appex` in the artifact, add the target
once and commit the configured `ios/` folder:

1. On any Mac (or a Codespaces macOS env): `npm run build && npx cap sync ios`
2. `open src/ios/App/App.xcworkspace`
3. File → New → Target → **Network Extension → Packet Tunnel**
   - Product name: `VoxVPNTunnel`
   - Bundle ID: `com.voxvpn.mobile.tunnel`
   - Replace its `PacketTunnelProvider.swift` with `src/ios/Tunnel/PacketTunnelProvider.swift`
   - Use `src/ios/Tunnel/Info.plist` + `src/ios/Tunnel/Tunnel.entitlements`
4. Commit the whole `src/ios/` folder (including the new target in the `.pbxproj`)
5. Re-run the workflow — `PlugIns.txt` will now list `VoxVPNTunnel.appex`

> If your App Store build is a **companion only** (no native tunneling), skip
> step 3 — Apple does not require the extension, and claiming the VPN
> capability without tunneling can trigger rejection. Remove the
> `packet-tunnel` keys from `src/ios/App/App.entitlements` before archiving.

## 4. Signed build for App Store submission

The workflow above is **unsigned** (inspection only). To submit, add secrets
and switch to the signed archive:

- Repo → Settings → Secrets:
  - `APPLE_TEAM_ID`
  - `P12_BASE64` (base64 of your Apple Distribution .p12)
  - `P12_PASSWORD`
  - `PROVISIONING_PROFILE_UUID`
  - `MOBILEPROVISION_BASE64` (App Store profile for `com.voxvpn.mobile`)

Then replace the "Archive (unsigned)" step with `bash src/scripts/build-ipa.sh`
after importing the cert/profile into the runner keychain. The signed
`VoxVPN.ipa` lands in `build/ipa/` — upload it to App Store Connect as an
update to the `com.voxvpn.mobile` listing.