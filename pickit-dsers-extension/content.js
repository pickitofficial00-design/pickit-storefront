(function () {
  if (document.getElementById("pickit-dsers-autopilot")) return;

  const STORAGE_KEY = "pickit_dsers_autopilot_state_v2";

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || {
        running: false,
        phase: "discover", // "discover" | "push"
        targetCount: 1000,
        selectedSoFar: 0,
        pin: "246810",
        autoPublishWebApp: true
      };
    } catch {
      return {
        running: false,
        phase: "discover",
        targetCount: 1000,
        selectedSoFar: 0,
        pin: "246810",
        autoPublishWebApp: true
      };
    }
  }

  function saveState(next) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  const state = loadState();

  const panel = document.createElement("div");
  panel.id = "pickit-dsers-autopilot";
  panel.style.cssText = [
    "position:fixed",
    "bottom:20px",
    "right:20px",
    "z-index:2147483647",
    "width:330px",
    "background:#111827",
    "color:#FFFFFF",
    "border:2px solid #FF6B00",
    "border-radius:16px",
    "padding:16px",
    "font-family:system-ui,-apple-system,sans-serif",
    "box-shadow:0 16px 40px rgba(0,0,0,0.45)"
  ].join(";");

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
      <div style="font-weight:900;font-size:15px;">PICK<span style="color:#FF6B00;">IT.</span> DSers Autopilot</div>
      <span style="font-size:11px;background:#065F46;color:#A7F3D0;padding:2px 8px;border-radius:999px;font-weight:800;">🇺🇸 Ship to US: ON</span>
    </div>
    <div style="font-size:12px;color:#D1D5DB;margin-bottom:10px;line-height:1.4;">
      Runs directly on <b>dsers.com</b>: selects 20/20 Ship-to-USA items per page, adds to Import List, pushes to Shopify with Pricing Rules, and publishes to Web & App.
    </div>
    <div style="display:flex;gap:8px;margin-bottom:8px;">
      <div style="flex:1;">
        <label style="display:block;font-size:10.5px;color:#9CA3AF;margin-bottom:2px;">Target Products</label>
        <input id="pk-target" type="number" value="${state.targetCount}" min="20" max="2000" step="20"
          style="width:100%;height:32px;border-radius:8px;border:1px solid #374151;background:#1F2937;color:#FFF;padding:0 8px;font-size:13px;box-sizing:border-box;" />
      </div>
      <div style="flex:1;">
        <label style="display:block;font-size:10.5px;color:#9CA3AF;margin-bottom:2px;">Admin PIN</label>
        <input id="pk-pin" type="password" value="${state.pin}"
          style="width:100%;height:32px;border-radius:8px;border:1px solid #374151;background:#1F2937;color:#FFF;padding:0 8px;font-size:13px;box-sizing:border-box;" />
      </div>
    </div>
    <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#E5E7EB;margin-bottom:10px;cursor:pointer;">
      <input id="pk-autopub" type="checkbox" ${state.autoPublishWebApp ? "checked" : ""} />
      Auto-Optimize & Publish to PICKIT Web/App after Push
    </label>
    <div id="pk-status" style="font-size:12px;font-weight:700;color:#FDBA74;background:#1F2937;padding:8px 10px;border-radius:8px;margin-bottom:10px;">
      Progress: ${state.selectedSoFar} / ${state.targetCount} products
    </div>
    <div style="display:flex;gap:8px;">
      <button id="pk-start" style="flex:1;height:36px;border:none;border-radius:10px;background:#FF6B00;color:#FFF;font-weight:900;font-size:13px;cursor:pointer;">
        ${state.running ? "Running on DSers..." : "Start DSers Auto-Select"}
      </button>
      <button id="pk-stop" style="height:36px;padding:0 12px;border:1px solid #4B5563;border-radius:10px;background:transparent;color:#FFF;font-weight:700;font-size:12px;cursor:pointer;">
        Stop
      </button>
    </div>
  `;

  document.body.appendChild(panel);

  const statusEl = document.getElementById("pk-status");
  const startBtn = document.getElementById("pk-start");
  const stopBtn = document.getElementById("pk-stop");

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function syncAndPublishToPickit(pin) {
    try {
      setStatus("Publishing pushed DSers products to PICKIT Web & App...");
      await fetch("https://pickit-storefront.vercel.app/api/admin/importer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin,
          action: "optimize_dsers",
          shipToUsaOnly: true,
          pricingSettings: {
            enabled: true,
            markupMultiplier: 2.4,
            roundTo99: true,
            includeCompareAt: true,
            compareAtBoostPercent: 38,
            minProfitUsd: 12
          }
        })
      });
    } catch {}
  }

  async function runDsersLoop() {
    while (loadState().running) {
      const cur = loadState();
      const url = window.location.href;

      // PHASE 1: Select products in DSers Find Products & Add to Import List
      if (url.includes("/find_products")) {
        if (cur.selectedSoFar >= cur.targetCount) {
          cur.phase = "push";
          saveState(cur);
          setStatus(`Selected ${cur.selectedSoFar} items! Opening DSers Import List...`);
          window.location.href = "https://www.dsers.com/application/import_list";
          return;
        }

        // Force Ship to United States (shipTo=US)
        if (!url.includes("shipTo=US")) {
          const sep = url.includes("?") ? "&" : "?";
          window.location.href = url + sep + "shipTo=US";
          return;
        }

        await sleep(2200);

        // Select all 20 items on current page
        const selectAllCheckbox = document.querySelector("input[type=checkbox]");
        if (selectAllCheckbox && !selectAllCheckbox.checked) {
          selectAllCheckbox.click();
          await sleep(900);
        }

        // Click "Add to Import List"
        const addBtn = Array.from(document.querySelectorAll("button, div, span")).find(
          (el) => /Add to Import List/i.test(el.textContent || "") && el.offsetParent !== null
        );
        if (addBtn) {
          addBtn.click();
          cur.selectedSoFar += 20;
          saveState(cur);
          setStatus(`Added 20 items! Total: ${cur.selectedSoFar} / ${cur.targetCount}`);
          await sleep(2800);
        }

        // Go to next page
        const nextBtn = document.querySelector(
          ".ant-pagination-next:not(.ant-pagination-disabled) button, [aria-label=\"Next Page\"]"
        );
        if (nextBtn) {
          nextBtn.click();
          await sleep(3200);
        } else {
          cur.phase = "push";
          saveState(cur);
          setStatus("End of category reached! Opening DSers Import List...");
          window.location.href = "https://www.dsers.com/application/import_list";
          return;
        }
      }

      // PHASE 2: Push all items in DSers Import List to Shopify with Pricing Rules ON
      else if (url.includes("/import_list")) {
        await sleep(2500);

        const selectAll = document.querySelector("input[type=checkbox]");
        if (selectAll && !selectAll.checked) {
          selectAll.click();
          await sleep(900);
        }

        const pushBtn = Array.from(document.querySelectorAll("button")).find(
          (b) => /Push to Store|Push to Shopify/i.test(b.textContent || "") && b.offsetParent !== null
        );

        if (pushBtn && !pushBtn.disabled) {
          setStatus("Pushing batch to Shopify with Pricing Rules ON...");
          pushBtn.click();
          await sleep(1600);

          // Ensure "Also publish to Online Store" and "Pricing Rule" toggles inside modal are checked
          document.querySelectorAll(".ant-modal input[type=checkbox], [role=dialog] input[type=checkbox]").forEach((cb) => {
            const labelText = cb.closest("label")?.textContent || "";
            if (/Online Store|Pricing Rule/i.test(labelText) && !cb.checked) {
              cb.click();
            }
          });
          await sleep(500);

          const confirmBtn = Array.from(document.querySelectorAll(".ant-modal button, [role=dialog] button")).find(
            (b) => /Push to Store|Confirm/i.test(b.textContent || "")
          );
          if (confirmBtn) confirmBtn.click();
          await sleep(4500);
        } else {
          cur.running = false;
          cur.phase = "discover";
          saveState(cur);
          if (cur.autoPublishWebApp) {
            await syncAndPublishToPickit(cur.pin);
          }
          setStatus(`Done! Pushed & published ${cur.selectedSoFar} DSers products!`);
          if (startBtn) startBtn.textContent = "Start DSers Auto-Select";
          return;
        }
      } else {
        setStatus("Navigate to DSers Find Products to start...");
        await sleep(2500);
      }
    }
  }

  startBtn?.addEventListener("click", () => {
    const targetCount = Number(document.getElementById("pk-target")?.value || 1000);
    const pin = String(document.getElementById("pk-pin")?.value || "246810");
    const autoPublishWebApp = !!document.getElementById("pk-autopub")?.checked;
    saveState({
      running: true,
      phase: "discover",
      targetCount,
      selectedSoFar: 0,
      pin,
      autoPublishWebApp
    });
    if (startBtn) startBtn.textContent = "Running on DSers...";
    runDsersLoop();
  });

  stopBtn?.addEventListener("click", () => {
    const cur = loadState();
    cur.running = false;
    saveState(cur);
    if (startBtn) startBtn.textContent = "Start DSers Auto-Select";
    setStatus(`Paused at ${cur.selectedSoFar} / ${cur.targetCount} products.`);
  });

  if (state.running) {
    runDsersLoop();
  }
})();
