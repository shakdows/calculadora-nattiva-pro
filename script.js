const correctPassword = "2026Nattiva";

const nf = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nfi = new Intl.NumberFormat("en-US");

const loginScreen = document.getElementById("loginScreen");
const app         = document.getElementById("app");
const passwordInput = document.getElementById("passwordInput");
const loginError  = document.getElementById("loginError");

const cliente = document.getElementById("cliente");
const precio  = document.getElementById("precio");
const cuota   = document.getElementById("cuota");
const tea     = document.getElementById("tea");
const plazo   = document.getElementById("plazo");

const form   = document.getElementById("form");
const result = document.getElementById("result");
const err    = document.getElementById("err");

const outCliente  = document.getElementById("outCliente");
const cuotaMensual = document.getElementById("cuotaMensual");
const outPrecio   = document.getElementById("outPrecio");
const outCuotaPct = document.getElementById("outCuotaPct");
const outCuota    = document.getElementById("outCuota");
const outMonto    = document.getElementById("outMonto");
const outPlazo    = document.getElementById("outPlazo");
const outTea      = document.getElementById("outTea");
const outIngreso  = document.getElementById("outIngreso");

function cleanNumericInput(value) {
  return value.replace(/[^\d.,]/g, "");
}

function num(v) {
  return parseFloat((v || "").replace(/,/g, "")) || 0;
}

precio.addEventListener("input", () => {
  const cleaned = cleanNumericInput(precio.value);
  precio.value = nfi.format(num(cleaned));
});
cuota.addEventListener("input",  () => { cuota.value = cleanNumericInput(cuota.value); });
tea.addEventListener("input",    () => { tea.value = cleanNumericInput(tea.value); });
plazo.addEventListener("input",  () => { plazo.value = plazo.value.replace(/[^\d]/g, ""); });
cliente.addEventListener("input",() => { cliente.value = cliente.value.replace(/[0-9]/g, ""); });

passwordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkPassword();
});

function checkPassword() {
  const input = passwordInput.value.trim();
  if (input === correctPassword) {
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
  const p = num(precio.value);
  const c = num(cuota.value);
  const t = num(tea.value);
  const a = parseInt(plazo.value, 10) || 0;

  if (!nombre || !p || !c || !t || !a) { err.textContent = "Completa todos los campos."; return; }
  if (c <= 0 || c >= 100) { err.textContent = "La cuota inicial debe ser mayor a 0 y menor a 100."; return; }
  if (t <= 0) { err.textContent = "La TCEA debe ser mayor a 0."; return; }
  if (a <= 0) { err.textContent = "El plazo debe ser mayor a 0 años."; return; }

  const cuotaInicial   = p * (c / 100);
  const montoFinanciar = p - cuotaInicial;
  const tasaMensual    = Math.pow(1 + t / 100, 1 / 12) - 1;
  const meses          = a * 12;
  const cuotaMensualCalc = montoFinanciar * (tasaMensual / (1 - Math.pow(1 + tasaMensual, -meses)));
  const ingresoAprox   = cuotaMensualCalc / 0.3;

  outCliente.textContent   = nombre;
  cuotaMensual.textContent = "S/ " + nf.format(cuotaMensualCalc);
  outPrecio.textContent    = "S/ " + nf.format(p);
  outCuotaPct.textContent  = c;
  outCuota.textContent     = "S/ " + nf.format(cuotaInicial);
  outMonto.textContent     = "S/ " + nf.format(montoFinanciar);
  outPlazo.textContent     = a + " años";
  outTea.textContent       = t + " %";
  outIngreso.textContent   = "S/ " + nf.format(ingresoAprox);

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

function generarTextoResumen() {
  return (
    "📊 *Resumen de crédito Nattiva*\n\n" +
    "👤 Cliente: " + outCliente.textContent + "\n" +
    "💰 Cuota mensual estimada: *" + cuotaMensual.textContent + "*\n\n" +
    "🏠 Precio del inmueble: " + outPrecio.textContent + "\n" +
    "📥 Cuota inicial: " + outCuota.textContent + "\n" +
    "💳 Monto a financiar: " + outMonto.textContent + "\n" +
    "📅 Plazo: " + outPlazo.textContent + "\n" +
    "📈 TCEA: " + outTea.textContent + "\n" +
    "💼 Ingreso mensual referencial: " + outIngreso.textContent + "\n\n" +
    "_Simulación referencial sujeta a evaluación crediticia._"
  );
}

function compartirWhatsApp() {
  const texto = generarTextoResumen();
  const url = "https://api.whatsapp.com/send?text=" + encodeURIComponent(texto);
  window.open(url, "_blank");
}

function compartirEmail() {
  const subject = encodeURIComponent("Propuesta de crédito Nattiva — " + outCliente.textContent);
  const body = encodeURIComponent(generarTextoResumen());
  window.location.href = "mailto:?subject=" + subject + "&body=" + body;
}

async function compartirGeneral() {
  const texto = generarTextoResumen();
  if (navigator.share) {
    try {
      await navigator.share({ title: "Propuesta de crédito Nattiva", text: texto });
    } catch (e) {
      // usuario canceló
    }
  } else {
    try {
      await navigator.clipboard.writeText(texto);
      alert("✅ Resumen copiado al portapapeles. Pégalo donde quieras.");
    } catch (e) {
      alert("Tu navegador no soporta compartir directo. Usa WhatsApp o Email.");
    }
  }
}

function descargarPDF() {
  const element = document.getElementById("pdfContent");
  if (!element) { alert("No se encontró el contenido para exportar."); return; }
  if (typeof html2pdf === "undefined") { alert("La librería de PDF no está cargada."); return; }

  const clientName = outCliente.textContent
    ? outCliente.textContent.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
    : "Cliente";

  const options = {
    margin: 0.4,
    filename: "Nattiva-Credito-" + clientName + ".pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] }
  };

  html2pdf().set(options).from(element).save();
}

window.addEventListener("load", () => {
  setTimeout(() => {
    const splash = document.getElementById("splash");
    if (splash) {
      splash.classList.add("hide");
      setTimeout(() => { splash.style.display = "none"; }, 1000);
    }
  }, 1500);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}