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
const form    = document.getElementById("form");
const result  = document.getElementById("result");
const err     = document.getElementById("err");
const outCliente   = document.getElementById("outCliente");
const cuotaMensual = document.getElementById("cuotaMensual");
const outPrecio    = document.getElementById("outPrecio");
const outCuotaPct  = document.getElementById("outCuotaPct");
const outCuota     = document.getElementById("outCuota");
const outMonto     = document.getElementById("outMonto");
const outPlazo     = document.getElementById("outPlazo");
const outTea       = document.getElementById("outTea");
const outIngreso   = document.getElementById("outIngreso");

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

function cleanNum(v) { return v.replace(/[^\d.,]/g, ""); }
function num(v) { return parseFloat((v || "").replace(/,/g, "")) || 0; }

precio.addEventListener("input",  () => { precio.value  = nfi.format(num(cleanNum(precio.value))); });
cuota.addEventListener("input",   () => { cuota.value   = cleanNum(cuota.value); });
tea.addEventListener("input",     () => { tea.value     = cleanNum(tea.value); });
plazo.addEventListener("input",   () => { plazo.value   = plazo.value.replace(/[^\d]/g, ""); });
cliente.addEventListener("input", () => { cliente.value = cliente.value.replace(/[0-9]/g, ""); });
passwordInput.addEventListener("keydown", e => { if (e.key === "Enter") checkPassword(); });

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

function resetear() {
  form.classList.remove("hide");
  result.classList.add("hide");
  cliente.value = precio.value = cuota.value = tea.value = plazo.value = "";
  err.textContent = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

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

/* ══════════════════════════════════════════
   PDF — 1 SOLA PÁGINA — todo en 595×842 pt
══════════════════════════════════════════ */
function descargarPDF() {
  if (typeof html2pdf === "undefined") { alert("Librería PDF no cargada."); return; }

  const name = outCliente.textContent
    ? outCliente.textContent.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
    : "Cliente";

  // Diseño compacto para que quepa en 1 página A4 (595×842pt)
  // Cada sección tiene altura calculada para sumar ~842px total
  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;color:#0d1f3c;width:595px;height:842px;overflow:hidden;background:#fff;box-sizing:border-box;">

  <!-- HEADER — 110px -->
  <div style="-webkit-print-color-adjust:exact;background:#0d1f3c;padding:18px 28px 14px;height:110px;box-sizing:border-box;">
    <div style="font-size:9px;font-weight:700;letter-spacing:3px;color:rgba(255,255,255,.5);text-transform:uppercase;margin-bottom:5px;">RESUMEN FINANCIERO · NATTIVA ESTATE</div>
    <div style="font-size:24px;font-weight:800;color:#fff;font-family:Georgia,serif;margin-bottom:4px;">Propuesta de Crédito</div>
    <div style="font-size:10px;color:rgba(255,255,255,.45);">Simulación generada para evaluación preliminar</div>
  </div>

  <!-- CUOTA DESTACADA — 80px -->
  <div style="-webkit-print-color-adjust:exact;background:#7a0d14;padding:14px 28px;height:80px;box-sizing:border-box;">
    <div style="font-size:9px;font-weight:700;letter-spacing:2px;color:rgba(255,255,255,.6);text-transform:uppercase;margin-bottom:5px;">CUOTA MENSUAL ESTIMADA</div>
    <div style="font-size:30px;font-weight:800;color:#fff;letter-spacing:-1px;line-height:1;">${cuotaMensual.textContent}</div>
  </div>

  <!-- CLIENTE — 65px -->
  <div style="-webkit-print-color-adjust:exact;background:#faf7f2;padding:10px 28px;height:65px;box-sizing:border-box;border-bottom:1px solid #e2eaf4;">
    <div style="font-size:8px;font-weight:700;letter-spacing:2px;color:#6b7a95;text-transform:uppercase;margin-bottom:3px;">CLIENTE</div>
    <div style="font-size:20px;font-weight:700;color:#0d1f3c;font-family:Georgia,serif;margin-bottom:3px;">${outCliente.textContent}</div>
    <div style="font-size:9px;font-weight:700;color:#b3202a;text-transform:uppercase;letter-spacing:1px;">Simulación referencial</div>
  </div>

  <!-- MÉTRICAS 2 col — 70px -->
  <table width="595" cellpadding="0" cellspacing="0" style="height:70px;">
    <tr>
      <td width="297" style="-webkit-print-color-adjust:exact;background:#fdf6e3;padding:10px 28px;border-right:1px solid #e2c840;border-bottom:1px solid #e2eaf4;vertical-align:top;">
        <div style="font-size:9px;color:#6b7a95;margin-bottom:4px;">Ingreso mensual referencial</div>
        <div style="font-size:20px;font-weight:800;color:#0d1f3c;">${outIngreso.textContent}</div>
      </td>
      <td width="298" style="-webkit-print-color-adjust:exact;background:#f0f5ff;padding:10px 28px;border-bottom:1px solid #e2eaf4;vertical-align:top;">
        <div style="font-size:9px;color:#6b7a95;margin-bottom:4px;">Monto a financiar</div>
        <div style="font-size:20px;font-weight:800;color:#0d1f3c;">${outMonto.textContent}</div>
      </td>
    </tr>
  </table>

  <!-- TITULO DETALLE — 36px -->
  <div style="background:#fff;padding:8px 28px;height:36px;box-sizing:border-box;border-bottom:1px solid #e2eaf4;">
    <span style="font-size:13px;font-weight:700;color:#0d1f3c;font-family:Georgia,serif;">Detalle de la operación</span>
    <span style="font-size:9px;color:#6b7a95;margin-left:8px;">Variables consideradas en la simulación</span>
  </div>

  <!-- FILAS DETALLE — 5 × 70px = 350px -->
  <table width="595" cellpadding="0" cellspacing="0">
    <tr style="-webkit-print-color-adjust:exact;background:#fff;">
      <td style="padding:10px 28px;border-bottom:1px solid #e2eaf4;width:60%;">
        <div style="font-size:10px;color:#6b7a95;margin-bottom:3px;">Precio del inmueble</div>
      </td>
      <td style="padding:10px 28px;border-bottom:1px solid #e2eaf4;text-align:right;">
        <div style="font-size:18px;font-weight:800;color:#0d1f3c;">${outPrecio.textContent}</div>
      </td>
    </tr>
    <tr style="-webkit-print-color-adjust:exact;background:#f8fafd;">
      <td style="padding:10px 28px;border-bottom:1px solid #e2eaf4;">
        <div style="font-size:10px;color:#6b7a95;margin-bottom:3px;">Cuota inicial (${outCuotaPct.textContent}%)</div>
      </td>
      <td style="padding:10px 28px;border-bottom:1px solid #e2eaf4;text-align:right;">
        <div style="font-size:18px;font-weight:800;color:#0d1f3c;">${outCuota.textContent}</div>
      </td>
    </tr>
    <tr style="-webkit-print-color-adjust:exact;background:#fff;">
      <td style="padding:10px 28px;border-bottom:1px solid #e2eaf4;">
        <div style="font-size:10px;color:#6b7a95;margin-bottom:3px;">Monto a financiar</div>
      </td>
      <td style="padding:10px 28px;border-bottom:1px solid #e2eaf4;text-align:right;">
        <div style="font-size:18px;font-weight:800;color:#0d1f3c;">${outMonto.textContent}</div>
      </td>
    </tr>
    <tr style="-webkit-print-color-adjust:exact;background:#f8fafd;">
      <td style="padding:10px 28px;border-bottom:1px solid #e2eaf4;">
        <div style="font-size:10px;color:#6b7a95;margin-bottom:3px;">Plazo</div>
      </td>
      <td style="padding:10px 28px;border-bottom:1px solid #e2eaf4;text-align:right;">
        <div style="font-size:18px;font-weight:800;color:#0d1f3c;">${outPlazo.textContent}</div>
      </td>
    </tr>
    <tr style="-webkit-print-color-adjust:exact;background:#fff;">
      <td style="padding:10px 28px;border-bottom:1px solid #e2eaf4;">
        <div style="font-size:10px;color:#6b7a95;margin-bottom:3px;">TCEA</div>
      </td>
      <td style="padding:10px 28px;border-bottom:1px solid #e2eaf4;text-align:right;">
        <div style="font-size:18px;font-weight:800;color:#0d1f3c;">${outTea.textContent}</div>
      </td>
    </tr>
  </table>

  <!-- FOOTER — 51px (842 - 110 - 80 - 65 - 70 - 36 - 350 = 131 → usamos lo que queda) -->
  <div style="-webkit-print-color-adjust:exact;background:#f4f7fb;padding:10px 28px;border-top:2px solid #0d1f3c;">
    <div style="font-size:9px;color:#6b7a95;text-align:center;line-height:1.5;">
      Esta simulación es informativa y está sujeta a evaluación crediticia, políticas internas y condiciones comerciales vigentes.<br>
      <strong style="color:#0d1f3c;">Nattiva Estate</strong> · Plataforma de Inversión Inmobiliaria
    </div>
  </div>

</div>`;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  wrapper.style.cssText = "position:fixed;left:-9999px;top:0;";
  document.body.appendChild(wrapper);

  html2pdf().set({
    margin:      0,
    filename:    "Nattiva-Credito-" + name + ".pdf",
    image:       { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale:           2,
      useCORS:         true,
      backgroundColor: "#ffffff",
      logging:         false,
      allowTaint:      true,
      width:           595,
      height:          842,
      windowWidth:     595,
      windowHeight:    842
    },
    jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
    pagebreak: { mode: [] }
  }).from(wrapper.firstElementChild).save().then(() => {
    document.body.removeChild(wrapper);
  });
}

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
