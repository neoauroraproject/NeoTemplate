# Changelog

All notable changes to the NeoTemplate SDK will be documented in this file.

## [1.2.2] - 2026-10-12
### Fixed
- Restore high-contrast Quick Actions pill so label/icon stay readable on dark themes.
- Keep the footer in the page flow (no longer sits beside the header).
- Improve secondary text contrast and modal spacing for Add to App.

## [1.2.1] - 2026-10-12
### Fixed
- Move Add to App into the Quick Actions modal so the main page stays clean.
- Fix app-row typography so name and description no longer collide.

## [1.2.0] - 2026-10-12
### Added
- Live online/offline status with `?format=info` polling.
- HWID device-slot card via `/hwid-status` (shown only when the panel enforces a limit).
- OS-aware Add to App actions for Android, iOS, Windows, macOS, and Linux (V2RayNG, Hiddify, NekoBox, Clash/Mihomo, Shadowrocket, Streisand, Stash, v2rayN, Clash Verge).
- Announcement banner support for `{{ .announce }}`.

## [1.1.2] - 2026-08-18
### Fixed
- Inline CSS and JavaScript in production packages so 3x-ui subscription pages load without 404s on `main.css` and `app.js`.

## [1.1.1] - 2026-08-18
### Fixed
- Config list names now prefer the inbound/host address instead of the client email.
- Copy and QR share links rewrite the remark/`ps` field so imported configs keep the same host-based name in clients.

## [1.0.0] - 2026-06-26
### Added
- Initial release of the NeoTemplate SDK.
- Core folder structure established.
- `manifest.json` schema defined.
- Base `index.html` and `sub.html` templates created.
- CSS Variables API established in `main.css`.
- Modular Vanilla JS helpers added in `app.js`.
