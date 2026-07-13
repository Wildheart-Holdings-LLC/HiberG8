/* HiberG8 hold page. No network of its own. */
var chrome = (typeof browser !== "undefined") ? browser : globalThis.chrome;
const $ = (id) => document.getElementById(id);
function bg(msg) { return new Promise((res) => { try { chrome.runtime.sendMessage(msg, (r) => res(r || {})); } catch (e) { res({}); } }); }
function target() { try { return decodeURIComponent(new URLSearchParams(location.search).get("u") || ""); } catch (e) { return ""; } }
function hostOf(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return u || "the previous page"; } }

const url = target();
const safeUrl = /^https?:\/\//i.test(url) ? url : "";
$("host").textContent = safeUrl ? hostOf(safeUrl) : "the page you were opening";
$("opts").addEventListener("click", () => { location.href = chrome.runtime.getURL("popup.html"); });

async function tryResume(force) {
  const r = await bg({ type: "sh:release", force: !!force });
  if (r && r.ok) { location.href = safeUrl || "about:blank"; return; }
  if (r && r.reason === "vpn") {
    $("vpnGate").hidden = false;
    if (!$("vpnConfirm").checked) { $("warn").textContent = "You chose to confirm your VPN before resuming. Tick the box, then Green Light again."; return; }
    const r2 = await bg({ type: "sh:release", force: true });
    if (r2 && r2.ok) { location.href = safeUrl || "about:blank"; return; }
  }
  $("warn").textContent = "Couldn't resume traffic. Open HiberG8 to review and resume.";
}
$("go").addEventListener("click", () => tryResume(false));

document.addEventListener("securitypolicyviolation", (e) => {
  try {
    const dir = e.effectiveDirective || e.violatedDirective || "";
    if (dir && !/script|object|frame|default|worker/.test(dir)) return;
    const b = $("secBanner");
    b.textContent = "⚠ A script-injection attempt was blocked (" + String(e.blockedURI || "inline").slice(0,120) + "). Nothing ran. Consider an antivirus scan.";
    b.hidden = false;
    try { chrome.notifications.create("hiberg8-injection", { type: "basic", iconUrl: chrome.runtime.getURL("icon48.png"), title: "HiberG8 - script injection blocked", message: "A script injection was blocked. Nothing ran." }); } catch (e2) {}
  } catch (e3) {}
});
