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

/* ══════════════════════════════════════════════
   PDF — diseño en UNA SOLA COLUMNA, sin flex/grid
   para garantizar renderizado correcto en html2pdf
══════════════════════════════════════════════ */
function descargarPDF() {
  if (typeof html2pdf === "undefined") { alert("Librería PDF no cargada."); return; }

  const name = outCliente.textContent
    ? outCliente.textContent.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
    : "Cliente";

  const logoSrc = document.querySelector(".result-main-logo")
    ? document.querySelector(".result-main-logo").src
    : "";

  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#0d1f3c;background:#ffffff;padding:0;margin:0;">

  <!-- HEADER AZUL -->
  <div style="background:#0d1f3c;padding:24px 32px;margin-bottom:0;">
    <p style="font-size:9px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.5);margin:0 0 6px 0;">RESUMEN FINANCIERO</p>
    <p style="font-size:22px;font-weight:bold;color:#ffffff;margin:0 0 4px 0;font-family:Georgia,serif;">Propuesta de crédito</p>
    <p style="font-size:11px;color:rgba(255,255,255,0.5);margin:0;">Simulación generada para evaluación preliminar</p>
  </div>

  <!-- CUOTA MENSUAL — caja destacada -->
  <div style="background:#7a0d14;padding:20px 32px;margin-bottom:0;">
    <p style="font-size:9px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.65);margin:0 0 6px 0;">CUOTA MENSUAL ESTIMADA</p>
    <p style="font-size:32px;font-weight:bold;color:#ffffff;margin:0;letter-spacing:-1px;">${cuotaMensual.textContent}</p>
  </div>

  <!-- CLIENTE -->
  <div style="background:#faf7f2;padding:16px 32px;border-bottom:1px solid #e2eaf4;">
    <p style="font-size:9px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#6b7a95;margin:0 0 5px 0;">CLIENTE</p>
    <p style="font-size:20px;font-weight:bold;color:#0d1f3c;margin:0;font-family:Georgia,serif;">${outCliente.textContent}</p>
    <p style="font-size:10px;font-weight:bold;color:#b3202a;text-transform:uppercase;letter-spacing:1px;margin:6px 0 0 0;">Simulación referencial</p>
  </div>

  <!-- MÉTRICAS -->
  <div style="background:#fdf6e3;padding:16px 32px;border-bottom:1px solid #e2c840;">
    <p style="font-size:10px;color:#6b7a95;margin:0 0 4px 0;">Ingreso mensual referencial</p>
    <p style="font-size:22px;font-weight:bold;color:#0d1f3c;margin:0;">${outIngreso.textContent}</p>
  </div>
  <div style="background:#f8fafd;padding:16px 32px;border-bottom:1px solid #e2eaf4;">
    <p style="font-size:10px;color:#6b7a95;margin:0 0 4px 0;">Monto a financiar</p>
    <p style="font-size:22px;font-weight:bold;color:#0d1f3c;margin:0;">${outMonto.textContent}</p>
  </div>

  <!-- TITULO DETALLE -->
  <div style="padding:16px 32px 8px 32px;background:#ffffff;">
    <p style="font-size:15px;font-weight:bold;color:#0d1f3c;margin:0;font-family:Georgia,serif;">Detalle de la operación</p>
    <p style="font-size:10px;color:#6b7a95;margin:4px 0 0 0;">Variables consideradas en la simulación</p>
  </div>

  <!-- FILAS DETALLE -->
  <div style="background:#ffffff;padding:12px 32px;border-top:1px solid #e2eaf4;border-bottom:1px solid #e2eaf4;">
    <p style="font-size:11px;color:#6b7a95;margin:0 0 3px 0;">Precio del inmueble</p>
    <p style="font-size:18px;font-weight:bold;color:#0d1f3c;margin:0;">${outPrecio.textContent}</p>
  </div>
  <div style="background:#f8fafd;padding:12px 32px;border-bottom:1px solid #e2eaf4;">
    <p style="font-size:11px;color:#6b7a95;margin:0 0 3px 0;">Cuota inicial (${outCuotaPct.textContent}%)</p>
    <p style="font-size:18px;font-weight:bold;color:#0d1f3c;margin:0;">${outCuota.textContent}</p>
  </div>
  <div style="background:#ffffff;padding:12px 32px;border-bottom:1px solid #e2eaf4;">
    <p style="font-size:11px;color:#6b7a95;margin:0 0 3px 0;">Monto a financiar</p>
    <p style="font-size:18px;font-weight:bold;color:#0d1f3c;margin:0;">${outMonto.textContent}</p>
  </div>
  <div style="background:#f8fafd;padding:12px 32px;border-bottom:1px solid #e2eaf4;">
    <p style="font-size:11px;color:#6b7a95;margin:0 0 3px 0;">Plazo</p>
    <p style="font-size:18px;font-weight:bold;color:#0d1f3c;margin:0;">${outPlazo.textContent}</p>
  </div>
  <div style="background:#ffffff;padding:12px 32px;border-bottom:1px solid #e2eaf4;">
    <p style="font-size:11px;color:#6b7a95;margin:0 0 3px 0;">TCEA</p>
    <p style="font-size:18px;font-weight:bold;color:#0d1f3c;margin:0;">${outTea.textContent}</p>
  </div>

  <!-- FOOTER -->
  <div style="background:#f4f7fb;padding:14px 32px;border-top:2px solid #0d1f3c;">
    <p style="font-size:10px;color:#6b7a95;text-align:center;margin:0;line-height:1.6;">
      Esta simulación es informativa y está sujeta a evaluación crediticia, políticas internas y condiciones comerciales vigentes.<br>
      <strong style="color:#0d1f3c;">Nattiva Estate</strong> · Plataforma de Inversión Inmobiliaria
    </p>
  </div>

</div>`;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  wrapper.style.cssText = "position:fixed;left:-9999px;top:0;width:595px;background:#fff;";
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
      windowWidth:     595
    },
    jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["avoid-all"] }
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
