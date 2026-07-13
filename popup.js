/* HiberG8 popup - control panel. No data leaves the device. */
var chrome = (typeof browser !== "undefined") ? browser : globalThis.chrome;
const $ = (id) => document.getElementById(id);
function bg(msg) { return new Promise((res) => { try { chrome.runtime.sendMessage(msg, (r) => res(r || {})); } catch (e) { res({}); } }); }

async function refresh() {
  const st = await bg({ type: "sh:get" });
  const held = !!st.held;
  $("dot").className = "dot " + (held ? "on" : "off");
  $("statusText").textContent = held ? ("Traffic held" + (st.heldTabs ? " - " + st.heldTabs + " page(s) waiting" : "")) : "Traffic flowing normally";
  $("heldMsg").hidden = !held;
  const t = $("toggle");
  if (held) { t.textContent = "Green Light Browser Traffic"; t.className = "big caution"; }
  else { t.textContent = "🛡 Suspend traffic"; t.className = "big suspend"; }
  const p = st.prefs || {};
  $("engageStartup").checked = !!p.engageStartup;
  $("requireVpn").checked = !!p.requireVpn;
}

$("toggle").addEventListener("click", async () => {
  const st = await bg({ type: "sh:get" });
  if (!st.held) { await bg({ type: "sh:engage" }); }
  else {
    let r = await bg({ type: "sh:release", force: false });
    if (r && r.reason === "vpn") {
      if (confirm("Have you confirmed your VPN is connected? Click OK to resume browser traffic.")) {
        r = await bg({ type: "sh:release", force: true });
      }
    }
  }
  refresh();
});
$("engageStartup").addEventListener("change", (e) => bg({ type: "sh:setPref", key: "engageStartup", value: e.target.checked }));
$("requireVpn").addEventListener("change", (e) => bg({ type: "sh:setPref", key: "requireVpn", value: e.target.checked }));

document.addEventListener("securitypolicyviolation", (e) => {
  try {
    const dir = e.effectiveDirective || e.violatedDirective || "";
    if (dir && !/script|object|frame|default|worker/.test(dir)) return;
    const blocked = String(e.blockedURI || "inline script").slice(0, 140);
    const b = $("secBanner");
    b.textContent = "⚠ A script-injection attempt (" + blocked + ") was blocked. Nothing ran. Consider running an antivirus scan.";
    b.hidden = false;
    try { chrome.notifications.create("hiberg8-injection", { type: "basic", iconUrl: chrome.runtime.getURL("icon48.png"),
      title: "HiberG8 - script injection blocked", message: "A script injection was blocked (" + blocked + "). Nothing ran." }); } catch (e2) {}
  } catch (e3) {}
});

refresh();
