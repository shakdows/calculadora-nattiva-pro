const correctPassword = "2026Nattiva";

const nf  = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nfi = new Intl.NumberFormat("en-US");

const loginScreen   = document.getElementById("loginScreen");
const app           = document.getElementById("app");
const passwordInput = document.getElementById("passwordInput");
const loginError    = document.getElementById("loginError");

const cliente = document.getElementById("cliente");
const precio  = document.getElementById("precio");
const cuota   = document.getElementById("cuota");
const tea     = document.getElementById("tea");
const plazo   = document.getElementById("plazo");

const form   = document.getElementById("form");
const result = document.getElementById("result");
const err    = document.getElementById("err");

const outCliente   = document.getElementById("outCliente");
const cuotaMensual = document.getElementById("cuotaMensual");
const outPrecio    = document.getElementById("outPrecio");
const outCuotaPct  = document.getElementById("outCuotaPct");
const outCuota     = document.getElementById("outCuota");
const outMonto     = document.getElementById("outMonto");
const outPlazo     = document.getElementById("outPlazo");
const outTea       = document.getElementById("outTea");
const outIngreso   = document.getElementById("outIngreso");

/* ── Slideshow ── */
function initSlideshow() {
  const slides = document.querySelectorAll(".login-bg-slide");
  if (!slides.length) return;
  let current = 0;
  setInterval(() => {
    slides[current].classList.remove("active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("active");
  }, 4500);
}

/* ── Inputs ── */
function cleanNum(v) { return v.replace(/[^\d.,]/g, ""); }
function num(v) { return parseFloat((v || "").replace(/,/g, "")) || 0; }

precio.addEventListener("input",  () => { precio.value  = nfi.format(num(cleanNum(precio.value))); });
cuota.addEventListener("input",   () => { cuota.value   = cleanNum(cuota.value); });
tea.addEventListener("input",     () => { tea.value     = cleanNum(tea.value); });
plazo.addEventListener("input",   () => { plazo.value   = plazo.value.replace(/[^\d]/g, ""); });
cliente.addEventListener("input", () => { cliente.value = cliente.value.replace(/[0-9]/g, ""); });
passwordInput.addEventListener("keydown", e => { if (e.key === "Enter") checkPassword(); });

/* ── Auth ── */
function checkPassword() {
  if (passwordInput.value.trim() === correctPassword) {
    loginScreen.style.display = "none";
    app.style.display = "flex";
    loginError.textContent = "";
  } else {
    loginError.textContent = "Contraseña incorrecta";
    passwordInput.value = "";
    passwordInput.focus();
  }
}

/* ── Calcular ── */
function calcular() {
  err.textContent = "";
  const nombre = cliente.value.trim();
  const p = num(precio.value), c = num(cuota.value),
        t = num(tea.value),   a = parseInt(plazo.value, 10) || 0;

  if (!nombre || !p || !c || !t || !a) { err.textContent = "Completa todos los campos."; return; }
  if (c <= 0 || c >= 100) { err.textContent = "La cuota inicial debe ser entre 1 y 99."; return; }
  if (t <= 0) { err.textContent = "La TCEA debe ser mayor a 0."; return; }
  if (a <= 0) { err.textContent = "El plazo debe ser mayor a 0 años."; return; }

  const ci  = p * (c / 100);
  const mf  = p - ci;
  const r   = Math.pow(1 + t / 100, 1 / 12) - 1;
  const m   = a * 12;
  const cm  = mf * (r / (1 - Math.pow(1 + r, -m)));
  const ing = cm / 0.3;

  outCliente.textContent   = nombre;
  cuotaMensual.textContent = "S/ " + nf.format(cm);
  outPrecio.textContent    = "S/ " + nf.format(p);
  outCuotaPct.textContent  = c;
  outCuota.textContent     = "S/ " + nf.format(ci);
  outMonto.textContent     = "S/ " + nf.format(mf);
  outPlazo.textContent     = a + " años";
  outTea.textContent       = t + " %";
  outIngreso.textContent   = "S/ " + nf.format(ing);

  form.classList.add("hide");
  result.classList.remove("hide");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ── Reset ── */
function resetear() {
  form.classList.remove("hide");
  result.classList.add("hide");
  cliente.value = precio.value = cuota.value = tea.value = plazo.value = "";
  err.textContent = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ── Compartir ── */
function generarTexto() {
  return (
    "📊 *Propuesta de crédito Nattiva*\n\n" +
    "👤 Cliente: " + outCliente.textContent + "\n" +
    "💰 Cuota mensual: *" + cuotaMensual.textContent + "*\n\n" +
    "🏠 Precio del inmueble: " + outPrecio.textContent + "\n" +
    "📥 Cuota inicial: " + outCuota.textContent + "\n" +
    "💳 Monto a financiar: " + outMonto.textContent + "\n" +
    "📅 Plazo: " + outPlazo.textContent + "\n" +
    "📈 TCEA: " + outTea.textContent + "\n" +
    "💼 Ingreso referencial: " + outIngreso.textContent + "\n\n" +
    "_Simulación referencial sujeta a evaluación crediticia._"
  );
}

function compartirWhatsApp() {
  window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent(generarTexto()), "_blank");
}
function compartirEmail() {
  window.location.href =
    "mailto:?subject=" + encodeURIComponent("Propuesta de crédito Nattiva — " + outCliente.textContent) +
    "&body=" + encodeURIComponent(generarTexto());
}
async function compartirGeneral() {
  const texto = generarTexto();
  if (navigator.share) {
    try { await navigator.share({ title: "Propuesta Nattiva", text: texto }); } catch {}
  } else {
    try { await navigator.clipboard.writeText(texto); alert("✅ Resumen copiado al portapapeles."); }
    catch { alert("Usa WhatsApp o Email para compartir."); }
  }
}

/* ── PDF — usa TABLE layout para máxima compatibilidad con html2pdf ── */
function descargarPDF() {
  if (typeof html2pdf === "undefined") { alert("Librería PDF no cargada."); return; }

  const name = outCliente.textContent
    ? outCliente.textContent.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
    : "Cliente";

  const logoSrc = document.querySelector(".result-main-logo")
    ? document.querySelector(".result-main-logo").src
    : "";

  /* ── HTML 100% con TABLE layout — sin flex/grid — html2pdf lo renderiza perfectamente ── */
  const html = `
<div style="font-family:Arial,sans-serif;color:#0d1f3c;width:680px;margin:0 auto;border:1px solid #e2eaf4;border-radius:12px;overflow:hidden;">

  <!-- ═══ HEADER ═══ -->
  <table width="100%" cellpadding="0" cellspacing="0" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#0d1f3c;background-image:linear-gradient(135deg,#0d1f3c 0%,#1a2f55 50%,#6e0e14 100%);">
    <tr>
      <td style="padding:28px 28px 28px 24px;vertical-align:middle;">
        ${logoSrc ? `<img src="${logoSrc}" style="width:80px;height:auto;border-radius:8px;display:block;" />` : ''}
      </td>
      <td style="padding:28px 10px;vertical-align:middle;">
        <div style="font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.55);margin-bottom:5px;">RESUMEN FINANCIERO</div>
        <div style="font-family:Georgia,serif;font-size:24px;font-weight:800;color:#fff;line-height:1.1;">Propuesta de crédito</div>
        <div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:5px;">Simulación generada para evaluación preliminar</div>
      </td>
      <td style="padding:20px 24px 20px 10px;vertical-align:middle;text-align:right;white-space:nowrap;">
        <div style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);border-radius:14px;padding:14px 18px;display:inline-block;text-align:center;min-width:160px;">
          <div style="font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.65);margin-bottom:7px;">CUOTA MENSUAL ESTIMADA</div>
          <div style="font-size:28px;font-weight:800;color:#fff;letter-spacing:-.01em;">${cuotaMensual.textContent}</div>
        </div>
      </td>
    </tr>
  </table>

  <!-- ═══ CLIENTE ═══ -->
  <table width="100%" cellpadding="0" cellspacing="0" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#faf7f2;border-bottom:1px solid #e2eaf4;">
    <tr>
      <td style="padding:16px 28px;vertical-align:middle;">
        <div style="font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#6b7a95;margin-bottom:5px;">CLIENTE</div>
        <div style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#0d1f3c;">${outCliente.textContent}</div>
      </td>
      <td style="padding:16px 28px;vertical-align:middle;text-align:right;">
        <span style="-webkit-print-color-adjust:exact;print-color-adjust:exact;display:inline-block;padding:6px 14px;border-radius:999px;background:#fde8ea;border:1px solid rgba(179,32,42,.2);color:#b3202a;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;">Simulación referencial</span>
      </td>
    </tr>
  </table>

  <!-- ═══ MÉTRICAS ═══ -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid #e2eaf4;">
    <tr>
      <td width="50%" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fdf6e3;padding:20px 28px;border-right:1px solid rgba(232,184,75,.3);vertical-align:top;">
        <div style="font-size:11px;color:#6b7a95;margin-bottom:8px;font-weight:500;">Ingreso mensual referencial</div>
        <div style="font-size:26px;font-weight:800;color:#0d1f3c;letter-spacing:-.02em;">${outIngreso.textContent}</div>
      </td>
      <td width="50%" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#f8fafd;padding:20px 28px;vertical-align:top;">
        <div style="font-size:11px;color:#6b7a95;margin-bottom:8px;font-weight:500;">Monto a financiar</div>
        <div style="font-size:26px;font-weight:800;color:#0d1f3c;letter-spacing:-.02em;">${outMonto.textContent}</div>
      </td>
    </tr>
  </table>

  <!-- ═══ DETALLE ═══ -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;">
    <tr>
      <td colspan="2" style="padding:20px 28px 12px;">
        <span style="font-family:Georgia,serif;font-size:16px;font-weight:700;color:#0d1f3c;">Detalle de la operación</span>
        <span style="font-size:11px;color:#6b7a95;margin-left:10px;">Variables consideradas en la simulación</span>
      </td>
    </tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 0 0;border-top:1px solid #e2eaf4;">
    <tr style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fff;">
      <td style="padding:14px 28px;font-size:13px;color:#6b7a95;border-bottom:1px solid #e2eaf4;">Precio del inmueble</td>
      <td style="padding:14px 28px;font-size:20px;font-weight:800;color:#0d1f3c;text-align:right;border-bottom:1px solid #e2eaf4;">${outPrecio.textContent}</td>
    </tr>
    <tr style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#f8fafd;">
      <td style="padding:14px 28px;font-size:13px;color:#6b7a95;border-bottom:1px solid #e2eaf4;">Cuota inicial (${outCuotaPct.textContent}%)</td>
      <td style="padding:14px 28px;font-size:20px;font-weight:800;color:#0d1f3c;text-align:right;border-bottom:1px solid #e2eaf4;">${outCuota.textContent}</td>
    </tr>
    <tr style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fff;">
      <td style="padding:14px 28px;font-size:13px;color:#6b7a95;border-bottom:1px solid #e2eaf4;">Monto a financiar</td>
      <td style="padding:14px 28px;font-size:20px;font-weight:800;color:#0d1f3c;text-align:right;border-bottom:1px solid #e2eaf4;">${outMonto.textContent}</td>
    </tr>
    <tr style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#f8fafd;">
      <td style="padding:14px 28px;font-size:13px;color:#6b7a95;border-bottom:1px solid #e2eaf4;">Plazo</td>
      <td style="padding:14px 28px;font-size:20px;font-weight:800;color:#0d1f3c;text-align:right;border-bottom:1px solid #e2eaf4;">${outPlazo.textContent}</td>
    </tr>
    <tr style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fff;">
      <td style="padding:14px 28px;font-size:13px;color:#6b7a95;">TCEA</td>
      <td style="padding:14px 28px;font-size:20px;font-weight:800;color:#0d1f3c;text-align:right;">${outTea.textContent}</td>
    </tr>
  </table>

  <!-- ═══ CUOTA MENSUAL RESALTADA ═══ -->
  <table width="100%" cellpadding="0" cellspacing="0" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#0d1f3c;border-top:3px solid #b3202a;">
    <tr>
      <td style="padding:18px 28px;vertical-align:middle;">
        <div style="font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:5px;">CUOTA MENSUAL ESTIMADA</div>
        <div style="font-size:32px;font-weight:800;color:#fff;">${cuotaMensual.textContent}</div>
      </td>
      <td style="padding:18px 28px;vertical-align:middle;text-align:right;">
        <div style="font-size:11px;color:rgba(255,255,255,.45);">Ingreso mínimo referencial</div>
        <div style="font-size:20px;font-weight:700;color:rgba(255,255,255,.85);margin-top:4px;">${outIngreso.textContent}</div>
      </td>
    </tr>
  </table>

  <!-- ═══ FOOTER ═══ -->
  <table width="100%" cellpadding="0" cellspacing="0" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#f4f7fb;border-top:1px solid #e2eaf4;">
    <tr>
      <td style="padding:14px 28px;font-size:11px;color:#6b7a95;text-align:center;line-height:1.6;">
        Esta simulación es informativa y está sujeta a evaluación crediticia, políticas internas y condiciones comerciales vigentes.<br>
        <strong style="color:#0d1f3c;">Nattiva Estate</strong> · Plataforma Inmobiliaria de Inversión
      </td>
    </tr>
  </table>

</div>`;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  wrapper.style.cssText = "position:absolute;left:-9999px;top:0;width:700px;";

  html2pdf().set({
    margin:    [0.3, 0.3, 0.3, 0.3],
    filename:  "Nattiva-Credito-" + name + ".pdf",
    image:     { type: "jpeg", quality: 1 },
    html2canvas: {
      scale:           3,
      useCORS:         true,
      backgroundColor: "#ffffff",
      logging:         false,
      allowTaint:      true,
      width:           700,
      windowWidth:     700
    },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["avoid-all"] }
  }).from(wrapper.firstElementChild).save().then(() => {
    document.body.removeChild(wrapper);
  });
}

/* ── Init ── */
window.addEventListener("load", () => {
  initSlideshow();
  setTimeout(() => {
    const splash = document.getElementById("splash");
    if (splash) {
      splash.classList.add("hide");
      setTimeout(() => { splash.style.display = "none"; }, 1000);
    }
  }, 1600);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
