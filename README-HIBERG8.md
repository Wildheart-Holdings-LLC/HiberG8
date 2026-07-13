# HiberG8 - Browser Traffic Safe-Hold

A standalone companion to the Hibern8 family. HiberG8 does ONE thing: it holds your
browser's outbound traffic on an untrusted network until you review your connection
and Green Light it. It does NOT hibernate tabs or windows.

## What it does
- **Suspend traffic** (Safe-Hold): blocks the browser's outbound page requests via a
  block-only `declarativeNetRequest` rule, and pauses in-progress downloads.
- **Hold page**: any new page you try to open while held is shown a local hold page
  instead of loading, with a **Green Light Browser Traffic** button.
- **VPN-confirmation gate** (optional): releasing asks you to confirm your VPN is
  connected. An extension cannot detect a VPN, so this is a manual confirmation.
- **Engage at startup** (optional): automatically hold traffic when the browser starts.
- A **HOLD** badge on the toolbar icon shows when traffic is held.

## What it does NOT do
- No tab/window hibernation (use Hibern8 Ctrl+Space / HiberSpace for that).
- No host permissions, no page-content reading, no accounts, no servers, no analytics,
  no data collection. Everything runs locally.

## Install (Chrome / Edge)
1. `chrome://extensions` (or `edge://extensions`) -> Developer mode on.
2. **Load unpacked** -> select this folder.
3. Click the toolbar icon (or Ctrl+Shift+H) to open the panel; press **Suspend traffic**
   to hold, **Green Light Browser Traffic** to resume.

## Permissions and why
- `declarativeNetRequest`: block outbound page requests while held (block-only; request
  contents are never read or modified).
- `tabs`: send a newly-navigated held tab to the hold page, and send it back to its
  destination on release. (Reads a tab's URL only; never page content.)
- `downloads`: pause in-progress downloads while held and resume them on release. Files
  are never read, opened, or moved.
- `storage`: remember your two preferences (engage-at-startup, require-VPN) and which
  downloads to resume.
- `notifications`: alert you if the strict CSP ever blocks a script injection.

## Incognito / InPrivate
HiberG8 does NOT run in private windows by default. If you want Safe-Hold to work there,
you must opt it in yourself:
- Chrome: `chrome://extensions` -> HiberG8 -> Details -> turn on **Allow in Incognito**.
- Edge: `edge://extensions` -> HiberG8 -> Details -> turn on **Allow in InPrivate**.

This is left to the individual on purpose; the extension will not enable itself in private
windows.

## Honest limitations
Safe-Hold is a browser-level convenience layer, not a substitute for your VPN client's
own kill-switch or your OS firewall, which protect every app system-wide. Provided
as-is, without warranty.

## The Hibern8 family
Check out the Hibern8 family of products to reallocate system RAM by hibernating excessive
browser tabs:
- Hibern8 Ctrl+Space
- Hibern8 Ctrl+Space Lite
- HiberSpace

to save the low hanging fruit.
