/* HiberG8 - Browser Traffic Safe-Hold (service worker).
   Holds ALL browser traffic via a declarativeNetRequest block rule, redirects new
   navigations to a local hold page, pauses in-progress downloads, and releases only
   when you Green Light it (optionally after confirming your VPN). No host permissions;
   never reads or edits page content; no data collection. */
var chrome = (typeof browser !== "undefined") ? browser : globalThis.chrome;
const RULE_ID = 1;
const HOLD = () => chrome.runtime.getURL("hold.html");

const RES = ["main_frame","sub_frame","stylesheet","script","image","font","object",
             "xmlhttprequest","media","websocket","other"];

async function isHeld() {
  try { const r = await chrome.declarativeNetRequest.getDynamicRules(); return r.some((x) => x.id === RULE_ID); }
  catch (e) { return false; }
}
async function addBlock() {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID],
    addRules: [{ id: RULE_ID, priority: 1, action: { type: "block" },
      condition: { regexFilter: "^https?://", resourceTypes: RES } }]
  });
}
async function removeBlock() { await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [RULE_ID] }); }

async function getPrefs() {
  const r = await chrome.storage.local.get(["requireVpn", "engageStartup"]);
  return { requireVpn: !!r.requireVpn, engageStartup: !!r.engageStartup };
}
function badge(on) {
  try { chrome.action.setBadgeText({ text: on ? "HOLD" : "" });
        chrome.action.setBadgeBackgroundColor({ color: "#e5534b" }); } catch (e) {}
}
function holdUrlFor(u) { return HOLD() + "?u=" + encodeURIComponent(u); }
function paramU(holdHref) { try { return decodeURIComponent(new URL(holdHref).searchParams.get("u") || ""); } catch (e) { return ""; } }

async function pauseDownloads() {
  let items = []; try { items = await chrome.downloads.search({ state: "in_progress" }); } catch (e) {}
  const paused = [];
  for (const d of items) { try { await chrome.downloads.pause(d.id); paused.push(d.id); } catch (e) {} }
  try { await chrome.storage.local.set({ shPaused: paused }); } catch (e) {}
}
async function resumeDownloads() {
  let ids = []; try { const r = await chrome.storage.local.get("shPaused"); ids = r.shPaused || []; } catch (e) {}
  for (const id of ids) { try { await chrome.downloads.resume(id); } catch (e) {} }
  try { await chrome.storage.local.set({ shPaused: [] }); } catch (e) {}
}

async function engageHold() {
  await addBlock();
  await pauseDownloads();
  badge(true);
}
async function releaseHold(force) {
  const prefs = await getPrefs();
  if (prefs.requireVpn && !force) return { ok: false, reason: "vpn" };  // manual VPN confirmation gate
  await removeBlock();
  await resumeDownloads();
  badge(false);
  // Send any open hold pages back to their intended destination.
  let tabs = []; try { tabs = await chrome.tabs.query({}); } catch (e) {}
  for (const t of tabs) {
    if ((t.url || "").startsWith(HOLD())) { const target = paramU(t.url); if (target) { try { await chrome.tabs.update(t.id, { url: target }); } catch (e) {} } }
  }
  return { ok: true };
}

// New navigations while held -> redirect the tab to the hold page (the block rule stops the real load).
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  try {
    if (!(await isHeld())) return;
    const u = changeInfo.url || (changeInfo.status === "loading" ? (tab && tab.url) : null);
    if (!u || !/^https?:\/\//i.test(u)) return;
    if (u.startsWith(chrome.runtime.getURL(""))) return;   // don't loop on our own pages
    await chrome.tabs.update(tabId, { url: holdUrlFor(u) });
  } catch (e) {}
});

// Pause any download started while held.
chrome.downloads.onCreated.addListener(async (d) => {
  try { if (await isHeld()) { await chrome.downloads.pause(d.id);
    const r = await chrome.storage.local.get("shPaused"); const p = r.shPaused || []; if (!p.includes(d.id)) { p.push(d.id); await chrome.storage.local.set({ shPaused: p }); } } } catch (e) {}
});

async function maybeStartupHold() { try { if ((await getPrefs()).engageStartup) await engageHold(); } catch (e) {} }
chrome.runtime.onStartup.addListener(maybeStartupHold);
chrome.runtime.onInstalled.addListener(maybeStartupHold);

chrome.runtime.onMessage.addListener((msg, sender, send) => {
  (async () => {
    try {
      if (msg && msg.type === "sh:get") {
        const tabs = await chrome.tabs.query({}).catch(() => []);
        const held = await isHeld();
        const heldTabs = tabs.filter((t) => (t.url || "").startsWith(HOLD())).length;
        send({ held, prefs: await getPrefs(), heldTabs });
      } else if (msg && msg.type === "sh:engage") { await engageHold(); send({ ok: true }); }
      else if (msg && msg.type === "sh:release") { send(await releaseHold(!!msg.force)); }
      else if (msg && msg.type === "sh:setPref") {
        await chrome.storage.local.set({ [msg.key]: !!msg.value }); send({ ok: true });
      } else send({});
    } catch (e) { send({ ok: false, error: String(e) }); }
  })();
  return true;   // async response
});
