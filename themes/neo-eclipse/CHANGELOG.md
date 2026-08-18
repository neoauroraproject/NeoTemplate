# Changelog

All notable changes to the NeoTemplate SDK will be documented in this file.

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
