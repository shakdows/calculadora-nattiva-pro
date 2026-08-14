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

  // Guardamos la simulación para el cronograma francés
  simActual = {
    nombre, precio: p, cuotaInicialPct: c, cuotaInicial: ci,
    montoFinanciado: mf, tasaMensual: r, meses: m, anios: a, tcea: t, cuotaMensual: cm,
    tabla: generarCronograma(mf, r, m, cm)
  };
  vistaAmort = "anual";

  form.classList.add("hide");
  result.classList.remove("hide");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ── Reset ── */
function resetear() {
  cerrarAmortizacion();
  simActual = null;
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

/* ══════════════════════════════════════════════
   CRONOGRAMA DE AMORTIZACIÓN — MÉTODO FRANCÉS
   Cuota constante: interés = saldo × i ;
   amortización = cuota − interés ; saldo -= amortización
   ══════════════════════════════════════════════ */

let simActual  = null;
let vistaAmort = "anual";

const amortModal     = document.getElementById("amortModal");
const amortCliente   = document.getElementById("amortCliente");
const amortSummary   = document.getElementById("amortSummary");
const amortTableWrap = document.getElementById("amortTableWrap");

function generarCronograma(saldoInicial, i, meses, cuota) {
  const filas = [];
  let saldo = saldoInicial;

  for (let n = 1; n <= meses; n++) {
    const interes = saldo * i;
    let amortizacion = cuota - interes;
    let pago = cuota;

    // Última cuota: se cancela el saldo exacto (ajuste de redondeo)
    if (n === meses) { amortizacion = saldo; pago = saldo + interes; }

    const saldoFinal = Math.max(saldo - amortizacion, 0);
    filas.push({ n, saldoInicial: saldo, cuota: pago, interes, amortizacion, saldoFinal });
    saldo = saldoFinal;
  }
  return filas;
}

function agruparPorAnio(filas) {
  const anios = [];
  filas.forEach(f => {
    const idx = Math.ceil(f.n / 12) - 1;
    if (!anios[idx]) {
      anios[idx] = { n: idx + 1, saldoInicial: f.saldoInicial, cuota: 0, interes: 0, amortizacion: 0, saldoFinal: 0 };
    }
    anios[idx].cuota        += f.cuota;
    anios[idx].interes      += f.interes;
    anios[idx].amortizacion += f.amortizacion;
    anios[idx].saldoFinal    = f.saldoFinal;
  });
  return anios;
}

function totalesCronograma(filas) {
  return filas.reduce((t, f) => {
    t.pagado += f.cuota; t.interes += f.interes; return t;
  }, { pagado: 0, interes: 0 });
}

/* ── Abrir / cerrar ── */
function verAmortizacion() {
  if (!simActual) { alert("Primero realiza un cálculo."); return; }
  renderAmortizacion();
  amortModal.classList.remove("hide");
  document.body.classList.add("amort-open");
}

function cerrarAmortizacion() {
  if (!amortModal) return;
  amortModal.classList.add("hide");
  document.body.classList.remove("amort-open");
}

function cambiarVistaAmort(vista) {
  vistaAmort = vista;
  document.querySelectorAll(".amort-tab").forEach(b => {
    b.classList.toggle("active", b.dataset.vista === vista);
  });
  renderTablaAmort();
  amortTableWrap.scrollTop = 0;
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") cerrarAmortizacion();
});

/* ── Render ── */
function renderAmortizacion() {
  const s = simActual;
  const t = totalesCronograma(s.tabla);

  amortCliente.textContent =
    s.nombre + " · " + s.anios + " años (" + s.meses + " cuotas) · TCEA " + s.tcea + "%";

  amortSummary.innerHTML = `
    <div class="amort-sum-item">
      <div class="amort-sum-label">Monto financiado</div>
      <div class="amort-sum-value">S/ ${nf.format(s.montoFinanciado)}</div>
    </div>
    <div class="amort-sum-item gold">
      <div class="amort-sum-label">Cuota mensual</div>
      <div class="amort-sum-value">S/ ${nf.format(s.cuotaMensual)}</div>
    </div>
    <div class="amort-sum-item">
      <div class="amort-sum-label">Total intereses</div>
      <div class="amort-sum-value">S/ ${nf.format(t.interes)}</div>
    </div>
    <div class="amort-sum-item">
      <div class="amort-sum-label">Total a pagar</div>
      <div class="amort-sum-value">S/ ${nf.format(t.pagado)}</div>
    </div>
  `;

  renderTablaAmort();
}

function renderTablaAmort() {
  const s = simActual;
  const anual = vistaAmort === "anual";
  const filas = anual ? agruparPorAnio(s.tabla) : s.tabla;
  const t     = totalesCronograma(s.tabla);
  const etiq  = anual ? "Año" : "Cuota";

  const cuerpo = filas.map(f => `
    <tr>
      <td>${etiq} ${f.n}</td>
      <td>${nf.format(f.saldoInicial)}</td>
      <td>${nf.format(f.cuota)}</td>
      <td class="col-interes">${nf.format(f.interes)}</td>
      <td class="col-amort">${nf.format(f.amortizacion)}</td>
      <td class="col-saldo">${nf.format(f.saldoFinal)}</td>
    </tr>`).join("");

  amortTableWrap.innerHTML = `
    <table class="amort-table">
      <thead>
        <tr>
          <th>${anual ? "Periodo" : "N°"}</th>
          <th>Saldo inicial</th>
          <th>Cuota</th>
          <th>Interés</th>
          <th>Amortización</th>
          <th>Saldo final</th>
        </tr>
      </thead>
      <tbody>${cuerpo}</tbody>
      <tfoot>
        <tr>
          <td>Totales</td>
          <td>—</td>
          <td>${nf.format(t.pagado)}</td>
          <td>${nf.format(t.interes)}</td>
          <td>${nf.format(s.montoFinanciado)}</td>
          <td>0.00</td>
        </tr>
      </tfoot>
    </table>
  `;
}

/* ── Exportar CSV (abre en Excel) ── */
function descargarCronogramaCSV() {
  if (!simActual) return;
  const s = simActual;
  const t = totalesCronograma(s.tabla);

  const lineas = [
    ["Cliente", s.nombre],
    ["Precio del inmueble", s.precio.toFixed(2)],
    ["Cuota inicial (" + s.cuotaInicialPct + "%)", s.cuotaInicial.toFixed(2)],
    ["Monto financiado", s.montoFinanciado.toFixed(2)],
    ["TCEA (%)", s.tcea],
    ["Tasa efectiva mensual (%)", (s.tasaMensual * 100).toFixed(6)],
    ["Plazo (meses)", s.meses],
    ["Cuota mensual", s.cuotaMensual.toFixed(2)],
    ["Total intereses", t.interes.toFixed(2)],
    ["Total a pagar", t.pagado.toFixed(2)],
    [],
    ["N", "Saldo inicial", "Cuota", "Interes", "Amortizacion", "Saldo final"]
  ];

  s.tabla.forEach(f => lineas.push([
    f.n, f.saldoInicial.toFixed(2), f.cuota.toFixed(2),
    f.interes.toFixed(2), f.amortizacion.toFixed(2), f.saldoFinal.toFixed(2)
  ]));

  const csv = "\ufeff" + lineas.map(l => l.map(v => `"${v}"`).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = "Cronograma-" + nombreArchivo() + ".csv";
  a.click();
  URL.revokeObjectURL(url);
}

function nombreArchivo() {
  return simActual && simActual.nombre
    ? simActual.nombre.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
    : "Cliente";
}

/* ── Exportar cronograma a PDF ── */
function descargarCronogramaPDF() {
  if (!simActual) return;
  if (typeof html2pdf === "undefined") { alert("Librería PDF no cargada."); return; }

  const s = simActual;
  const t = totalesCronograma(s.tabla);
  const logo = document.querySelector(".result-main-logo");
  const logoSrc = logo ? logo.src : "";

  const filas = s.tabla.map(f => `
    <tr style="page-break-inside:avoid;">
      <td style="padding:5px 8px; font-size:9px; border-bottom:1px solid #e2eaf4; font-weight:700; color:#0d1f3c;">${f.n}</td>
      <td style="padding:5px 8px; font-size:9px; border-bottom:1px solid #e2eaf4; text-align:right; color:#6b7a95;">${nf.format(f.saldoInicial)}</td>
      <td style="padding:5px 8px; font-size:9px; border-bottom:1px solid #e2eaf4; text-align:right; font-weight:700; color:#0d1f3c;">${nf.format(f.cuota)}</td>
      <td style="padding:5px 8px; font-size:9px; border-bottom:1px solid #e2eaf4; text-align:right; color:#b3202a;">${nf.format(f.interes)}</td>
      <td style="padding:5px 8px; font-size:9px; border-bottom:1px solid #e2eaf4; text-align:right; color:#128c3a;">${nf.format(f.amortizacion)}</td>
      <td style="padding:5px 8px; font-size:9px; border-bottom:1px solid #e2eaf4; text-align:right; font-weight:700; color:#0d1f3c;">${nf.format(f.saldoFinal)}</td>
    </tr>`).join("");

  const html = `
    <div style="font-family:'Inter',Arial,sans-serif; color:#0d1f3c; width:100%; max-width:720px; margin:0 auto;">

      <div style="background:#0d1f3c; padding:20px 24px; display:flex; align-items:center; gap:14px;">
        ${logoSrc ? `<img src="${logoSrc}" style="width:78px; height:auto; border-radius:8px;" />` : ""}
        <div>
          <div style="font-size:9px; font-weight:700; letter-spacing:.2em; text-transform:uppercase; color:rgba(255,255,255,.55); margin-bottom:4px;">MÉTODO FRANCÉS · CUOTA CONSTANTE</div>
          <div style="font-family:Georgia,serif; font-size:22px; font-weight:800; color:#fff;">Cronograma de amortización</div>
          <div style="font-size:10px; color:rgba(255,255,255,.6); margin-top:4px;">${s.nombre} · ${s.anios} años (${s.meses} cuotas) · TCEA ${s.tcea}%</div>
        </div>
      </div>

      <table style="width:100%; border-collapse:collapse; border-bottom:1px solid #e2eaf4;">
        <tr>
          <td style="padding:10px 14px; background:#f8fafd; border-right:1px solid #e2eaf4;">
            <div style="font-size:8px; letter-spacing:.1em; text-transform:uppercase; color:#6b7a95; font-weight:700;">Monto financiado</div>
            <div style="font-size:14px; font-weight:800;">S/ ${nf.format(s.montoFinanciado)}</div>
          </td>
          <td style="padding:10px 14px; background:#fdf6e3; border-right:1px solid #e2eaf4;">
            <div style="font-size:8px; letter-spacing:.1em; text-transform:uppercase; color:#6b7a95; font-weight:700;">Cuota mensual</div>
            <div style="font-size:14px; font-weight:800;">S/ ${nf.format(s.cuotaMensual)}</div>
          </td>
          <td style="padding:10px 14px; background:#f8fafd; border-right:1px solid #e2eaf4;">
            <div style="font-size:8px; letter-spacing:.1em; text-transform:uppercase; color:#6b7a95; font-weight:700;">Total intereses</div>
            <div style="font-size:14px; font-weight:800;">S/ ${nf.format(t.interes)}</div>
          </td>
          <td style="padding:10px 14px; background:#f8fafd;">
            <div style="font-size:8px; letter-spacing:.1em; text-transform:uppercase; color:#6b7a95; font-weight:700;">Total a pagar</div>
            <div style="font-size:14px; font-weight:800;">S/ ${nf.format(t.pagado)}</div>
          </td>
        </tr>
      </table>

      <table style="width:100%; border-collapse:collapse; margin-top:2px;">
        <thead style="display:table-header-group;">
          <tr style="background:#f4f7fb;">
            <th style="padding:7px 8px; font-size:8px; letter-spacing:.08em; text-transform:uppercase; color:#6b7a95; text-align:left; border-bottom:1.5px solid #e2eaf4;">N°</th>
            <th style="padding:7px 8px; font-size:8px; letter-spacing:.08em; text-transform:uppercase; color:#6b7a95; text-align:right; border-bottom:1.5px solid #e2eaf4;">Saldo inicial</th>
            <th style="padding:7px 8px; font-size:8px; letter-spacing:.08em; text-transform:uppercase; color:#6b7a95; text-align:right; border-bottom:1.5px solid #e2eaf4;">Cuota</th>
            <th style="padding:7px 8px; font-size:8px; letter-spacing:.08em; text-transform:uppercase; color:#6b7a95; text-align:right; border-bottom:1.5px solid #e2eaf4;">Interés</th>
            <th style="padding:7px 8px; font-size:8px; letter-spacing:.08em; text-transform:uppercase; color:#6b7a95; text-align:right; border-bottom:1.5px solid #e2eaf4;">Amortización</th>
            <th style="padding:7px 8px; font-size:8px; letter-spacing:.08em; text-transform:uppercase; color:#6b7a95; text-align:right; border-bottom:1.5px solid #e2eaf4;">Saldo final</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>

      <div style="padding:10px 20px; background:#f4f7fb; border-top:1px solid #e2eaf4; color:#6b7a95; font-size:9px; text-align:center; line-height:1.5;">
        Cronograma referencial calculado por el método francés. Sujeto a evaluación crediticia, políticas internas y condiciones comerciales vigentes.
      </div>
    </div>
  `;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  wrapper.style.position = "absolute";
  wrapper.style.left = "-9999px";
  document.body.appendChild(wrapper);

  html2pdf().set({
    margin: [0.35, 0.3, 0.45, 0.3],
    filename: "Cronograma-" + nombreArchivo() + ".pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false, allowTaint: true },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"], avoid: "tr" }
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
