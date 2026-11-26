(() => {
  const DEFAULT_GTIN = "00850017421431";
  const SERIAL_RANDOM_LEN = 9; // after YYMMDD prefix → 15 total like real sample

  const gtinEl = document.getElementById("gtin");
  const mfgEl = document.getElementById("mfgDate");
  const expEl = document.getElementById("expiryDate");
  const serialEl = document.getElementById("serial");
  const regenBtn = document.getElementById("regenBtn");
  const customizeBtn = document.getElementById("customizeBtn");
  const customizeEl = document.getElementById("customize");
  const syncExpiryBtn = document.getElementById("syncExpiryBtn");
  const resetBtn = document.getElementById("resetBtn");
  const elementStringEl = document.getElementById("elementString");
  const statusEl = document.getElementById("status");
  const canvas = document.getElementById("dmCanvas");
  const hri01 = document.getElementById("hri01");
  const hri17 = document.getElementById("hri17");
  const hri21 = document.getElementById("hri21");

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function toYMD(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  function toYYMMDD(d) {
    return `${String(d.getFullYear()).slice(-2)}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;
  }

  function parseYMD(s) {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    if (!y || !m || !d) return null;
    const dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
    return dt;
  }

  function addYears(d, years) {
    const out = new Date(d.getTime());
    out.setFullYear(out.getFullYear() + years);
    return out;
  }

  function startOfToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  function randomDigits(n) {
    const arr = new Uint32Array(n);
    crypto.getRandomValues(arr);
    let s = "";
    for (let i = 0; i < n; i++) s += String(arr[i] % 10);
    return s;
  }

  /** Default manufacture ~6 months ago (past), expiry = mfg + 1 year (future). */
  function defaultDates() {
    const today = new Date();
    const mfg = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
    const exp = addYears(mfg, 1);
    return { mfg, exp };
  }

  function makeSerial(mfgDate) {
    return toYYMMDD(mfgDate) + randomDigits(SERIAL_RANDOM_LEN);
  }

  function setStatus(msg, kind) {
    statusEl.textContent = msg || "";
    statusEl.className = "status" + (kind ? " " + kind : "");
  }

  function datesFollowGuidelines(mfg, exp) {
    if (!mfg || !exp) return false;
    const today = startOfToday();
    if (mfg > today) return false;
    if (exp < today) return false;
    return true;
  }

  function validate() {
    const gtin = gtinEl.value.replace(/\D/g, "");
    const serial = serialEl.value.trim();
    const mfg = parseYMD(mfgEl.value);
    const exp = parseYMD(expEl.value);
    const issues = [];

    if (!/^\d{14}$/.test(gtin)) issues.push("GTIN must be 14 digits");
    if (!mfg) issues.push("Manufacture date invalid");
    if (!exp) issues.push("Expiry date invalid");
    if (!/^[0-9A-Za-z]{1,20}$/.test(serial)) issues.push("Serial must be 1–20 alphanumerics");

    if (mfg && exp) {
      if (mfg > startOfToday()) issues.push("Guideline: manufacture is usually in the past");
      if (exp < startOfToday()) issues.push("Guideline: expiry is usually in the future");
    }

    return {
      gtin,
      serial,
      mfg,
      exp,
      issues,
      ok: issues.filter((i) => !i.startsWith("Guideline")).length === 0,
    };
  }

  function elementString(gtin, exp, serial) {
    return `(01)${gtin}(17)${toYYMMDD(exp)}(21)${serial}`;
  }

  function render() {
    const v = validate();
    if (!v.ok || !v.mfg || !v.exp) {
      if (elementStringEl) elementStringEl.textContent = "—";
      setStatus(v.issues.join(" · "), "err");
      return;
    }

    const es = elementString(v.gtin, v.exp, v.serial);
    if (elementStringEl) elementStringEl.textContent = es;
    hri01.textContent = `(01) ${v.gtin}`;
    hri17.textContent = `(17) ${toYYMMDD(v.exp)}`;
    hri21.textContent = `(21) ${v.serial}`;

    try {
      if (typeof bwipjs === "undefined") {
        setStatus("bwip-js failed to load (CDN). Check network.", "err");
        return;
      }
      // GS1 DataMatrix: library inserts FNC1; feed bracketed AI string
      bwipjs.toCanvas(canvas, {
        bcid: "gs1datamatrix",
        text: es,
        scale: 8,
        padding: 4,
        backgroundcolor: "FFFFFF",
        barcolor: "000000",
        includetext: false,
      });
      const guide = v.issues.filter((i) => i.startsWith("Guideline"));
      // Keep the default view quiet; only surface problems or customize-panel notes.
      if (guide.length) {
        setStatus(guide.join(" · "), "");
      } else if (!customizeEl.hidden) {
        setStatus("GS1 DataMatrix ready to scan", "ok");
      } else {
        setStatus("", "");
      }
    } catch (e) {
      setStatus("Encode error: " + (e && e.message ? e.message : e), "err");
    }
  }

  function applyDefaults() {
    const { mfg, exp } = defaultDates();
    gtinEl.value = DEFAULT_GTIN;
    mfgEl.value = toYMD(mfg);
    expEl.value = toYMD(exp);
    serialEl.value = makeSerial(mfg);
    render();
  }

  function onMfgChange() {
    const mfg = parseYMD(mfgEl.value);
    if (!mfg) {
      render();
      return;
    }
    expEl.value = toYMD(addYears(mfg, 1));
    const cur = serialEl.value.trim();
    if (/^\d{6}\d{9}$/.test(cur)) {
      serialEl.value = toYYMMDD(mfg) + cur.slice(6);
    } else if (!cur) {
      serialEl.value = makeSerial(mfg);
    }
    render();
  }

  function regenerate() {
    let mfg = parseYMD(mfgEl.value);
    let exp = parseYMD(expEl.value);
    if (!datesFollowGuidelines(mfg, exp)) {
      const fresh = defaultDates();
      mfg = fresh.mfg;
      exp = fresh.exp;
      mfgEl.value = toYMD(mfg);
      expEl.value = toYMD(exp);
    }
    serialEl.value = makeSerial(mfg);
    render();
  }

  function toggleCustomize() {
    const open = customizeEl.hidden;
    customizeEl.hidden = !open;
    customizeBtn.setAttribute("aria-expanded", open ? "true" : "false");
    customizeBtn.textContent = open ? "Done" : "Customize";
    if (open) render();
    else setStatus("", "");
  }

  regenBtn.addEventListener("click", regenerate);
  customizeBtn.addEventListener("click", toggleCustomize);

  syncExpiryBtn.addEventListener("click", () => {
    const mfg = parseYMD(mfgEl.value);
    if (!mfg) {
      setStatus("Set a valid manufacture date first", "err");
      return;
    }
    expEl.value = toYMD(addYears(mfg, 1));
    render();
  });

  resetBtn.addEventListener("click", applyDefaults);

  gtinEl.addEventListener("input", () => {
    gtinEl.value = gtinEl.value.replace(/\D/g, "").slice(0, 14);
    render();
  });
  serialEl.addEventListener("input", render);
  mfgEl.addEventListener("change", onMfgChange);
  expEl.addEventListener("change", render);

  applyDefaults();
})();
