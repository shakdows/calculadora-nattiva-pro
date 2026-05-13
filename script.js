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

/* ══════════════════════════════════════════════════
   PDF — genera imagen directamente con jsPDF + canvas
   Sin html2canvas de todo el DOM — solo el elemento
══════════════════════════════════════════════════ */
function descargarPDF() {
  if (typeof html2pdf === "undefined") { alert("Librería PDF no cargada."); return; }

  const name = outCliente.textContent
    ? outCliente.textContent.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
    : "Cliente";

  // Crear iframe oculto con HTML completo y autónomo
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;left:-9999px;top:0;width:595px;height:842px;border:none;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow.document;

  doc.open();
  doc.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Arial,Helvetica,sans-serif; width:595px; background:#fff; }
</style>
</head>
<body>

<div style="width:595px;background:#0d1f3c;padding:22px 30px 18px;">
  <div style="font-size:9px;font-weight:700;letter-spacing:3px;color:rgba(255,255,255,.5);text-transform:uppercase;margin-bottom:6px;">RESUMEN FINANCIERO · NATTIVA ESTATE</div>
  <div style="font-size:26px;font-weight:800;color:#fff;font-family:Georgia,serif;margin-bottom:3px;">Propuesta de Crédito</div>
  <div style="font-size:10px;color:rgba(255,255,255,.4);">Simulación generada para evaluación preliminar</div>
</div>

<div style="width:595px;background:#7a0d14;padding:14px 30px;">
  <div style="font-size:9px;font-weight:700;letter-spacing:2px;color:rgba(255,255,255,.6);text-transform:uppercase;margin-bottom:5px;">CUOTA MENSUAL ESTIMADA</div>
  <div style="font-size:34px;font-weight:800;color:#fff;letter-spacing:-1px;">${cuotaMensual.textContent}</div>
</div>

<div style="width:595px;background:#faf7f2;padding:12px 30px;border-bottom:1px solid #e2eaf4;">
  <div style="font-size:8px;font-weight:700;letter-spacing:2px;color:#6b7a95;text-transform:uppercase;margin-bottom:4px;">CLIENTE</div>
  <div style="font-size:22px;font-weight:700;color:#0d1f3c;font-family:Georgia,serif;margin-bottom:2px;">${outCliente.textContent}</div>
  <div style="font-size:9px;font-weight:700;color:#b3202a;text-transform:uppercase;letter-spacing:1px;">✓ Simulación referencial</div>
</div>

<table width="595" cellpadding="0" cellspacing="0">
<tr>
  <td width="297" style="background:#fdf6e3;padding:12px 30px;border-right:1px solid #d4b83a;border-bottom:1px solid #e2eaf4;vertical-align:top;">
    <div style="font-size:9px;color:#6b7a95;margin-bottom:4px;">Ingreso mensual referencial</div>
    <div style="font-size:20px;font-weight:800;color:#0d1f3c;">${outIngreso.textContent}</div>
  </td>
  <td width="298" style="background:#eef3ff;padding:12px 30px;border-bottom:1px solid #e2eaf4;vertical-align:top;">
    <div style="font-size:9px;color:#6b7a95;margin-bottom:4px;">Monto a financiar</div>
    <div style="font-size:20px;font-weight:800;color:#0d1f3c;">${outMonto.textContent}</div>
  </td>
</tr>
</table>

<div style="width:595px;background:#fff;padding:10px 30px 6px;border-bottom:1px solid #e2eaf4;">
  <span style="font-size:14px;font-weight:700;color:#0d1f3c;font-family:Georgia,serif;">Detalle de la operación &nbsp;</span>
  <span style="font-size:9px;color:#6b7a95;">Variables consideradas en la simulación</span>
</div>

<table width="595" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
  <tr style="background:#fff;">
    <td style="padding:10px 30px;font-size:11px;color:#6b7a95;border-bottom:1px solid #e2eaf4;width:55%;">Precio del inmueble</td>
    <td style="padding:10px 30px;font-size:17px;font-weight:800;color:#0d1f3c;border-bottom:1px solid #e2eaf4;text-align:right;">${outPrecio.textContent}</td>
  </tr>
  <tr style="background:#f7f9fc;">
    <td style="padding:10px 30px;font-size:11px;color:#6b7a95;border-bottom:1px solid #e2eaf4;">Cuota inicial (${outCuotaPct.textContent}%)</td>
    <td style="padding:10px 30px;font-size:17px;font-weight:800;color:#0d1f3c;border-bottom:1px solid #e2eaf4;text-align:right;">${outCuota.textContent}</td>
  </tr>
  <tr style="background:#fff;">
    <td style="padding:10px 30px;font-size:11px;color:#6b7a95;border-bottom:1px solid #e2eaf4;">Monto a financiar</td>
    <td style="padding:10px 30px;font-size:17px;font-weight:800;color:#0d1f3c;border-bottom:1px solid #e2eaf4;text-align:right;">${outMonto.textContent}</td>
  </tr>
  <tr style="background:#f7f9fc;">
    <td style="padding:10px 30px;font-size:11px;color:#6b7a95;border-bottom:1px solid #e2eaf4;">Plazo</td>
    <td style="padding:10px 30px;font-size:17px;font-weight:800;color:#0d1f3c;border-bottom:1px solid #e2eaf4;text-align:right;">${outPlazo.textContent}</td>
  </tr>
  <tr style="background:#fff;">
    <td style="padding:10px 30px;font-size:11px;color:#6b7a95;border-bottom:1px solid #e2eaf4;">TCEA</td>
    <td style="padding:10px 30px;font-size:17px;font-weight:800;color:#0d1f3c;border-bottom:1px solid #e2eaf4;text-align:right;">${outTea.textContent}</td>
  </tr>
</table>

<div style="width:595px;background:#0d1f3c;padding:12px 30px;">
  <div style="font-size:9px;color:rgba(255,255,255,.5);margin-bottom:4px;text-transform:uppercase;letter-spacing:2px;">CUOTA MENSUAL</div>
  <div style="font-size:24px;font-weight:800;color:#fff;">${cuotaMensual.textContent}</div>
</div>

<div style="width:595px;background:#f4f7fb;padding:10px 30px;border-top:2px solid #1a3a6a;">
  <div style="font-size:9px;color:#6b7a95;text-align:center;line-height:1.6;">
    Esta simulación es informativa y está sujeta a evaluación crediticia, políticas internas y condiciones comerciales vigentes.<br>
    <b style="color:#0d1f3c;">Nattiva Estate</b> · Plataforma de Inversión Inmobiliaria
  </div>
</div>

</body>
</html>`);
  doc.close();

  // Esperar que el iframe cargue y luego generar PDF
  setTimeout(() => {
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
    }).from(doc.body).save().then(() => {
      document.body.removeChild(iframe);
    });
  }, 300);
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
