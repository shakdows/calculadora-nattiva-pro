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

/* ── PDF ── */
function descargarPDF() {
  if (typeof html2pdf === "undefined") { alert("Librería PDF no cargada."); return; }

  const name = outCliente.textContent
    ? outCliente.textContent.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
    : "Cliente";

  // Crear contenido HTML autónomo para el PDF con estilos inline
  const logoSrc = document.querySelector(".result-main-logo").src;

  const html = `
    <div style="font-family:'Inter',Arial,sans-serif; color:#0d1f3c; width:100%; max-width:700px; margin:0 auto;">

      <!-- COVER -->
      <div style="background:#0d1f3c; padding:28px 30px; display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:0;">
        <div style="display:flex; align-items:center; gap:14px; flex:1;">
          <img src="${logoSrc}" style="width:90px; height:auto; border-radius:8px;" />
          <div>
            <div style="font-size:10px; font-weight:700; letter-spacing:.2em; text-transform:uppercase; color:rgba(255,255,255,.55); margin-bottom:5px;">RESUMEN FINANCIERO</div>
            <div style="font-family:Georgia,serif; font-size:26px; font-weight:800; color:#fff; line-height:1.1;">Propuesta de crédito</div>
            <div style="font-size:11px; color:rgba(255,255,255,.5); margin-top:5px;">Simulación generada para evaluación preliminar</div>
          </div>
        </div>
        <div style="background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.2); border-radius:14px; padding:16px 20px; text-align:center; min-width:170px;">
          <div style="font-size:10px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:rgba(255,255,255,.6); margin-bottom:6px;">CUOTA MENSUAL ESTIMADA</div>
          <div style="font-size:30px; font-weight:800; color:#fff; letter-spacing:-.01em;">${cuotaMensual.textContent}</div>
        </div>
      </div>

      <!-- CLIENT -->
      <div style="background:#faf7f2; padding:14px 28px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #e2eaf4;">
        <div>
          <div style="font-size:10px; font-weight:700; letter-spacing:.18em; text-transform:uppercase; color:#6b7a95; margin-bottom:4px;">CLIENTE</div>
          <div style="font-family:Georgia,serif; font-size:22px; font-weight:700; color:#0d1f3c;">${outCliente.textContent}</div>
        </div>
        <div style="padding:6px 13px; border-radius:999px; background:#fde8ea; border:1px solid rgba(179,32,42,.2); color:#b3202a; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.09em;">Simulación referencial</div>
      </div>

      <!-- INSIGHTS -->
      <div style="display:flex; border-bottom:1px solid #e2eaf4;">
        <div style="flex:1; padding:18px 24px; background:#fdf6e3; border-right:1px solid rgba(232,184,75,.3);">
          <div style="font-size:11px; color:#6b7a95; margin-bottom:7px; font-weight:500;">Ingreso mensual referencial</div>
          <div style="font-size:24px; font-weight:800; color:#0d1f3c; letter-spacing:-.02em;">${outIngreso.textContent}</div>
        </div>
        <div style="flex:1; padding:18px 24px; background:#f8fafd;">
          <div style="font-size:11px; color:#6b7a95; margin-bottom:7px; font-weight:500;">Monto a financiar</div>
          <div style="font-size:24px; font-weight:800; color:#0d1f3c; letter-spacing:-.02em;">${outMonto.textContent}</div>
        </div>
      </div>

      <!-- DETAIL -->
      <div style="padding:18px 28px 14px; background:#fff;">
        <div style="margin-bottom:12px; display:flex; align-items:baseline; gap:10px;">
          <span style="font-family:Georgia,serif; font-size:16px; font-weight:700; color:#0d1f3c;">Detalle de la operación</span>
          <span style="font-size:11px; color:#6b7a95;">Variables consideradas en la simulación</span>
        </div>
        <table style="width:100%; border-collapse:collapse; border:1px solid #e2eaf4; border-radius:12px; overflow:hidden;">
          <tr style="background:#fff;">
            <td style="padding:13px 18px; font-size:13px; color:#6b7a95; border-bottom:1px solid #e2eaf4;">Precio del inmueble</td>
            <td style="padding:13px 18px; font-size:18px; font-weight:800; color:#0d1f3c; text-align:right; border-bottom:1px solid #e2eaf4; letter-spacing:-.01em;">${outPrecio.textContent}</td>
          </tr>
          <tr style="background:#f8fafd;">
            <td style="padding:13px 18px; font-size:13px; color:#6b7a95; border-bottom:1px solid #e2eaf4;">Cuota inicial (${outCuotaPct.textContent}%)</td>
            <td style="padding:13px 18px; font-size:18px; font-weight:800; color:#0d1f3c; text-align:right; border-bottom:1px solid #e2eaf4; letter-spacing:-.01em;">${outCuota.textContent}</td>
          </tr>
          <tr style="background:#fff;">
            <td style="padding:13px 18px; font-size:13px; color:#6b7a95; border-bottom:1px solid #e2eaf4;">Plazo</td>
            <td style="padding:13px 18px; font-size:18px; font-weight:800; color:#0d1f3c; text-align:right; border-bottom:1px solid #e2eaf4; letter-spacing:-.01em;">${outPlazo.textContent}</td>
          </tr>
          <tr style="background:#f8fafd;">
            <td style="padding:13px 18px; font-size:13px; color:#6b7a95;">TCEA</td>
            <td style="padding:13px 18px; font-size:18px; font-weight:800; color:#0d1f3c; text-align:right; letter-spacing:-.01em;">${outTea.textContent}</td>
          </tr>
        </table>
      </div>

      <!-- FOOTER -->
      <div style="padding:12px 28px; background:#f4f7fb; border-top:1px solid #e2eaf4; color:#6b7a95; font-size:11px; text-align:center; line-height:1.5;">
        Esta simulación es informativa y está sujeta a evaluación crediticia, políticas internas y condiciones comerciales vigentes.
      </div>

    </div>
  `;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  wrapper.style.position = "absolute";
  wrapper.style.left = "-9999px";

  html2pdf().set({
    margin: 0.4,
    filename: "Nattiva-Credito-" + name + ".pdf",
    image: { type: "jpeg", quality: 1 },
    html2canvas: {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      allowTaint: true
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