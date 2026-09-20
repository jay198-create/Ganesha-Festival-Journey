(() => {
  "use strict";

  const KEYS = [
    "ganesha-festival-v3",
    "ganesha-festival-v5-builder",
    "ganesha-festival-v5-levels",
    "ganesha-sound"
  ];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    })[c]);
  }

  function snapshot() {
    const data = {};
    for (const key of KEYS) {
      const raw = localStorage.getItem(key);
      if (raw != null) {
        try { data[key] = JSON.parse(raw); }
        catch { data[key] = raw; }
      }
    }
    return {
      game: "Ganesha's Festival Journey",
      saveVersion: 5,
      exportedAt: new Date().toISOString(),
      storage: data
    };
  }

  function exportSave() {
    const blob = new Blob([JSON.stringify(snapshot(), null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const d = new Date();
    const stamp = [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("-");
    a.href = url;
    a.download = "ganesha-festival-save-" + stamp + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importSave(file) {
    const text = await file.text();
    let parsed;
    try { parsed = JSON.parse(text); }
    catch { throw new Error("That file is not a valid game save."); }

    if (parsed?.game !== "Ganesha's Festival Journey" || parsed?.saveVersion !== 5 || typeof parsed.storage !== "object") {
      throw new Error("This save file is not compatible with Version 5.");
    }

    let restored = 0;
    for (const key of KEYS) {
      if (Object.prototype.hasOwnProperty.call(parsed.storage, key)) {
        localStorage.setItem(key, JSON.stringify(parsed.storage[key]));
        restored++;
      }
    }
    if (!restored) throw new Error("No game progress was found in this file.");
    return restored;
  }

  function openSaveDialog() {
    const modal = document.querySelector("#modal");
    const body = document.querySelector("#dialog-body");
    if (!modal || !body) return;

    body.innerHTML = `
      <span class="eyebrow">PRIVATE DEVICE SAVE</span>
      <h2>Back up your progress</h2>
      <p>Your game does not ask for an account, email, phone number, password, roll number or other student identity.</p>
      <p>Progress is saved in this browser only. Download a backup file if you want to restore after clearing browser data or moving to another device.</p>
      <div class="actions">
        <button id="privacy-export-save" class="primary">DOWNLOAD SAVE FILE</button>
        <label class="secondary" style="display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:14px 18px">
          RESTORE SAVE
          <input id="privacy-import-save" type="file" accept="application/json,.json" hidden>
        </label>
      </div>
      <p id="privacy-save-status" class="fine">No game data is uploaded or transmitted by this save feature.</p>
    `;

    if (!modal.open) modal.showModal();

    body.querySelector("#privacy-export-save")?.addEventListener("click", exportSave);
    body.querySelector("#privacy-import-save")?.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const status = body.querySelector("#privacy-save-status");
      try {
        status.textContent = "Restoring…";
        const count = await importSave(file);
        status.textContent = `Restored ${count} save sections. Reloading…`;
        setTimeout(() => location.reload(), 500);
      } catch (error) {
        status.textContent = escapeHtml(error.message || "Could not restore this save.");
      }
    });
  }

  function addNav() {
    const nav = document.querySelector("header nav");
    if (!nav || nav.querySelector("[data-privacy-save]")) return;
    const button = document.createElement("button");
    button.textContent = "Save";
    button.dataset.privacySave = "open";
    button.setAttribute("aria-label", "Back up or restore game progress");
    nav.appendChild(button);
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-privacy-save]");
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openSaveDialog();
  }, true);

  addNav();
  new MutationObserver(addNav).observe(document.body, {childList:true, subtree:true});
})();