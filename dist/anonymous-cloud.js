(() => {
  "use strict";

  const SAVE_KEY_NAME = "ganesha-anonymous-save-key";
  const PROFILE_KEY = "ganesha-festival-v3";
  const BUILDER_KEY = "ganesha-festival-v5-builder";
  const LEVEL_KEY = "ganesha-festival-v5-levels";
  const SOUND_KEY = "ganesha-sound";
  const LOCAL_UPDATED_KEY = "ganesha-local-save-updated-at";
  const GAME_KEYS = [PROFILE_KEY, BUILDER_KEY, LEVEL_KEY, SOUND_KEY];

  let syncing = false;
  let timer = null;
  let booted = false;
  let serverAvailable = true;

  function randomRecoveryKey() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    let s = "";
    for (const b of bytes) s += String.fromCharCode(b);
    return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  }

  function getRecoveryKey() {
    let key = localStorage.getItem(SAVE_KEY_NAME);
    if (!key) {
      key = randomRecoveryKey();
      localStorage.setItem(SAVE_KEY_NAME, key);
    }
    return key;
  }

  function sanitizeBuilder(value) {
    if (!value || typeof value !== "object") return value;
    const copy = JSON.parse(JSON.stringify(value));
    // Do not upload any free-text Mandal/group name.
    delete copy.groupName;
    return copy;
  }

  function localSnapshot() {
    const read = key => {
      try { return JSON.parse(localStorage.getItem(key) || "null"); }
      catch { return null; }
    };
    return {
      version: 5,
      profile: read(PROFILE_KEY),
      builder: sanitizeBuilder(read(BUILDER_KEY)),
      levels: read(LEVEL_KEY),
      settings: read(SOUND_KEY),
      savedAt: Number(localStorage.getItem(LOCAL_UPDATED_KEY) || 0)
    };
  }

  function applyRemote(state) {
    if (!state || typeof state !== "object") return;
    if (state.profile) originalSetItem.call(localStorage, PROFILE_KEY, JSON.stringify(state.profile));
    if (state.builder) {
      let current = {};
      try { current = JSON.parse(localStorage.getItem(BUILDER_KEY) || "{}"); } catch {}
      // Preserve local-only free text while restoring all gameplay fields.
      originalSetItem.call(localStorage, BUILDER_KEY, JSON.stringify({
        ...state.builder,
        groupName: current.groupName || "Our Ganesh Mandal"
      }));
    }
    if (state.levels) originalSetItem.call(localStorage, LEVEL_KEY, JSON.stringify(state.levels));
    if (state.settings) originalSetItem.call(localStorage, SOUND_KEY, JSON.stringify(state.settings));
  }

  async function request(method, key, state) {
    const response = await fetch("/api/save", {
      method,
      headers: {
        "content-type": "application/json",
        "x-recovery-key": key
      },
      body: state ? JSON.stringify({ state }) : undefined
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Save service unavailable.");
    return data;
  }

  async function syncNow() {
    if (syncing || !serverAvailable) return;
    syncing = true;
    try {
      const result = await request("PUT", getRecoveryKey(), localSnapshot());
      originalSetItem.call(localStorage, LOCAL_UPDATED_KEY, String(result.updatedAt || Date.now()));
    } catch (error) {
      serverAvailable = false;
      console.warn("Anonymous cloud save unavailable:", error);
    } finally {
      syncing = false;
    }
  }

  function scheduleSync() {
    if (!booted || !serverAvailable) return;
    clearTimeout(timer);
    timer = setTimeout(syncNow, 450);
  }

  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    originalSetItem.call(this, key, value);
    if (this === localStorage && GAME_KEYS.includes(key)) {
      originalSetItem.call(localStorage, LOCAL_UPDATED_KEY, String(Date.now()));
      scheduleSync();
    }
  };

  async function loadRemoteBeforeGame() {
    const key = getRecoveryKey();
    try {
      const remote = await request("GET", key);
      if (remote.found && remote.state) {
        const localUpdated = Number(localStorage.getItem(LOCAL_UPDATED_KEY) || 0);
        const remoteUpdated = Number(remote.updatedAt || remote.state.savedAt || 0);
        if (remoteUpdated >= localUpdated) {
          applyRemote(remote.state);
          originalSetItem.call(localStorage, LOCAL_UPDATED_KEY, String(remoteUpdated));
        } else {
          const result = await request("PUT", key, localSnapshot());
          originalSetItem.call(localStorage, LOCAL_UPDATED_KEY, String(result.updatedAt || Date.now()));
        }
      } else {
        const result = await request("PUT", key, localSnapshot());
        originalSetItem.call(localStorage, LOCAL_UPDATED_KEY, String(result.updatedAt || Date.now()));
      }
    } catch (error) {
      serverAvailable = false;
      console.warn("Starting with local save only:", error);
    }
  }

  function downloadRecoveryKey() {
    const key = getRecoveryKey();
    const text = [
      "Ganesha's Festival Journey - Anonymous Recovery Key",
      "",
      key,
      "",
      "Keep this key private. It restores only game progress.",
      "It is not an email, password, student ID or account."
    ].join("\n");
    const url = URL.createObjectURL(new Blob([text], {type:"text/plain"}));
    const a = document.createElement("a");
    a.href = url;
    a.download = "ganesha-game-recovery-key.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function restoreWithKey(key) {
    const normalized = String(key || "").trim();
    if (!/^[A-Za-z0-9_-]{40,80}$/.test(normalized)) {
      throw new Error("That recovery key is not valid.");
    }
    const remote = await request("GET", normalized);
    if (!remote.found || !remote.state) throw new Error("No saved game was found for that key.");
    originalSetItem.call(localStorage, SAVE_KEY_NAME, normalized);
    applyRemote(remote.state);
    originalSetItem.call(localStorage, LOCAL_UPDATED_KEY, String(remote.updatedAt || remote.state.savedAt || Date.now()));
    return true;
  }

  function openSaveDialog() {
    const modal = document.querySelector("#modal");
    const body = document.querySelector("#dialog-body");
    if (!modal || !body) return;
    const key = getRecoveryKey();

    body.innerHTML = `
      <span class="eyebrow">ANONYMOUS GAME MEMORY</span>
      <h2>Your progress can survive a browser reset.</h2>
      <p>The game stores scores, Modaks, levels and festival progress in an anonymous Cloudflare save. It does not ask for a name, email, phone number, password, roll number or college ID.</p>
      <p class="fine">If all browser data is erased, the website cannot know which anonymous save belongs to you automatically. Keep this recovery key and enter it again after the reset.</p>
      <label>Recovery key
        <input id="anon-key-view" value="${key}" readonly autocomplete="off">
      </label>
      <div class="actions">
        <button id="anon-copy" class="primary">COPY KEY</button>
        <button id="anon-download" class="secondary">DOWNLOAD KEY</button>
      </div>
      <hr style="border:0;border-top:1px solid var(--line);margin:22px 0">
      <label>Restore an existing anonymous save
        <input id="anon-restore-key" autocomplete="off" placeholder="Paste recovery key">
      </label>
      <button id="anon-restore" class="secondary full">RESTORE GAME</button>
      <p id="anon-status" class="fine">${serverAvailable ? "Anonymous cloud save is enabled." : "Cloud save is currently unavailable; local progress still works."}</p>
    `;
    if (!modal.open) modal.showModal();

    body.querySelector("#anon-copy")?.addEventListener("click", async () => {
      await navigator.clipboard.writeText(key);
      body.querySelector("#anon-status").textContent = "Recovery key copied.";
    });
    body.querySelector("#anon-download")?.addEventListener("click", downloadRecoveryKey);
    body.querySelector("#anon-restore")?.addEventListener("click", async () => {
      const status = body.querySelector("#anon-status");
      try {
        status.textContent = "Restoring…";
        await restoreWithKey(body.querySelector("#anon-restore-key").value);
        status.textContent = "Progress restored. Reloading…";
        setTimeout(() => location.reload(), 500);
      } catch (error) {
        status.textContent = error.message || "Could not restore that save.";
      }
    });
  }

  function addSaveButton() {
    const nav = document.querySelector("header nav");
    if (!nav || nav.querySelector("[data-anon-save]")) return;
    const button = document.createElement("button");
    button.textContent = "Save";
    button.dataset.anonSave = "open";
    button.setAttribute("aria-label", "Anonymous cloud save and recovery key");
    nav.appendChild(button);
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-anon-save]");
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openSaveDialog();
  }, true);

  window.GFJAnonymousSave = {
    getRecoveryKey,
    syncNow,
    restoreWithKey,
    localSnapshot
  };

  async function loadScript(src) {
    await new Promise((resolve,reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  (async () => {
    await loadRemoteBeforeGame();
    booted = true;
    await loadScript("core.js?v=5");
    await loadScript("festival-data.js?v=5");
    await loadScript("game.js?v=5");
    await loadScript("level-arena.js?v=5");
    await loadScript("festival-studio.js?v=5");
    addSaveButton();
    new MutationObserver(addSaveButton).observe(document.body,{childList:true,subtree:true});
    scheduleSync();
    window.addEventListener("pagehide", () => {
      if (!serverAvailable) return;
      try {
        fetch("/api/save", {
          method: "PUT",
          keepalive: true,
          headers: {
            "content-type": "application/json",
            "x-recovery-key": getRecoveryKey()
          },
          body: JSON.stringify({ state: localSnapshot() })
        });
      } catch {}
    });
  })();
})();