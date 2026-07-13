# HiberG8 - Privacy & Security Statement

**Publisher:** Wildheart Holdings LLC
**Contact:** steve@wildheartholdingsllc.com

## Data
HiberG8 collects, transmits, sells, and shares **no** data. No servers, analytics, ads,
telemetry, or third-party code. Everything runs locally in your browser profile.

## What it accesses (and why)
- It reads a tab's URL only to redirect a held tab to the local hold page and back
  again on release. It never reads or edits the content of any web page and requests
  no host permissions.
- The `declarativeNetRequest` rule is block-only; it does not read, log, or modify the
  contents of any request.
- `downloads` is used solely to pause/resume in-progress transfers while held; files are
  never read, opened, or moved.
- Preferences (engage-at-startup, require-VPN) and the paused-download list are stored
  locally via `storage.local` and never leave your device.

## Security
- Strict Content-Security-Policy on every extension page; no `eval`, no remote code, no
  network calls. All dynamic text is created with DOM APIs (no innerHTML).
- An injection watchdog warns you and raises a notification if a script injection is ever
  blocked. Nothing is executed.

## Incognito / InPrivate
HiberG8 does not operate in private (Incognito / InPrivate) windows unless the individual
explicitly opts it in via the browser's extension details page ("Allow in Incognito" /
"Allow in InPrivate"). It is never enabled there by default, and it collects no data in any
mode.

## Honest limitations
- HiberG8 cannot detect a VPN. The "require VPN" option is a manual confirmation.
- Safe-Hold is a browser-level convenience layer, not a replacement for a VPN kill-switch
  or OS firewall. Provided AS IS, without warranty of any kind.
