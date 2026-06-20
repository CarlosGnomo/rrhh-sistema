const express = require('express');
const router = express.Router();

const BUK_BASE_URL = process.env.BUK_BASE_URL || 'https://gnomo.buk.cl/api/v1/chile';
const BUK_API_KEY  = process.env.BUK_API_KEY;

const bukHeaders = {
  'Content-Type': 'application/json',
  'auth_token': BUK_API_KEY,
};

// ── Empleados (todas las páginas) ──────────────────────────────
async function getAllEmployees() {
  let all = [];
  let url = `${BUK_BASE_URL}/employees?per_page=100`;
  while (url) {
    const res  = await fetch(url, { headers: bukHeaders });
    const json = await res.json();
    all = all.concat(json.data || []);
    url = json.pagination?.next || null;
  }
  return all;
}

// ── Liquidaciones de un mes (todas las páginas) ────────────────
// date = último día del mes, formato DD-MM-YYYY
async function getPayrollMonth(dateStr) {
  let all = [];
  let url = `${BUK_BASE_URL}/payroll_detail/month?date=${dateStr}&page_size=100`;
  while (url) {
    const res  = await fetch(url, { headers: bukHeaders });
    const json = await res.json();
    all = all.concat(json.data || []);
    url = json.pagination?.next || null;
  }
  return all;
}

function ultimoDiaMes(anio, mes) {
  // mes: 0-11 (JS). Retorna "DD-MM-YYYY"
  const ultimo = new Date(anio, mes + 1, 0);
  const dd = String(ultimo.getDate()).padStart(2, '0');
  const mm = String(mes + 1).padStart(2, '0');
  return `${dd}-${mm}-${anio}`;
}

function nombreMes(anio, mes) {
  return new Date(anio, mes, 1).toLocaleString('es-CL', { month: 'short', year: '2-digit' });
}

// Calcula el total de aportes patronales (costo empresa adicional) de una liquidación
function aportesPatronales(liq) {
  return (liq.lines_settlement || [])
    .filter(l => l.type === 'aporte')
    .reduce((s, l) => s + (l.amount || 0), 0);
}

// ── GET /buk/ping ───────────────────────────────────────────────
router.get('/ping', async (req, res) => {
  try {
    const response = await fetch(`${BUK_BASE_URL}/employees?per_page=1`, { headers: bukHeaders });
    if (response.ok) {
      res.json({ status: 'ok', mensaje: 'Conexión con Buk exitosa' });
    } else {
      res.status(response.status).json({ status: 'error', code: response.status });
    }
  } catch (err) {
    res.status(500).json({ status: 'error', mensaje: err.message });
  }
});

// ── GET /buk/empleados ────────────────────────────────────────
router.get('/empleados', async (req, res) => {
  try {
    const response = await fetch(`${BUK_BASE_URL}/employees`, { headers: bukHeaders });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /buk/remuneraciones — resumen 3 meses: liquido, bruto, costo empresa, leyes sociales ──
router.get('/remuneraciones', async (req, res) => {
  try {
    const hoy = new Date();
    // Empezamos por el mes anterior (el actual normalmente no está cerrado aún)
    const mesesData = [];

    for (let i = 3; i >= 1; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const anio = fecha.getFullYear();
      const mes  = fecha.getMonth();
      const dateStr = ultimoDiaMes(anio, mes);

      let liquidaciones = [];
      try {
        liquidaciones = await getPayrollMonth(dateStr);
      } catch (e) {
        liquidaciones = [];
      }

      const sueldoLiquido = liquidaciones.reduce((s, l) => s + (l.income_net || 0), 0);
      const sueldoBruto   = liquidaciones.reduce((s, l) => s + (l.income_gross || 0), 0);
      const leyesSociales = liquidaciones.reduce((s, l) => s + (l.total_legal_discounts || 0), 0);
      const aportes       = liquidaciones.reduce((s, l) => s + aportesPatronales(l), 0);
      const costoEmpresa  = sueldoBruto + aportes; // bruto + aportes patronales

      mesesData.push({
        mes: nombreMes(anio, mes),
        anio,
        mesNumero: mes + 1,
        cantidadLiquidaciones: liquidaciones.length,
        sueldoLiquido,
        sueldoBruto,
        leyesSociales,
        aportesPatronales: aportes,
        costoEmpresa,
      });
    }

    // Tomamos el mes más reciente con datos como "mes actual" para los KPIs
    const mesesConDatos = mesesData.filter(m => m.cantidadLiquidaciones > 0);
    const ultimoMes = mesesConDatos[mesesConDatos.length - 1] || mesesData[mesesData.length - 1];

    res.json({
      mes_actual: ultimoMes,
      historico_3_meses: mesesData,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /buk/dotacion ─────────────────────────────────────────
router.get('/dotacion', async (req, res) => {
  try {
    const empleados = await getAllEmployees();

    const hoy        = new Date();
    const mesActual  = hoy.getMonth();
    const anioActual = hoy.getFullYear();
    const en30dias   = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000);

    const activos = empleados.filter(e => e.status === 'activo');

    const dotacion_total            = activos.length;
    const masa_bruta_total          = activos.reduce((sum, e) => sum + (e.current_job?.base_wage || 0), 0);
    const leyes_sociales_estimadas  = Math.round(masa_bruta_total * 0.2153);
    const costo_total_estimado      = masa_bruta_total + leyes_sociales_estimadas;

    const por_area = activos.reduce((acc, e) => {
      const area = e.current_job?.cost_center || 'Sin área';
      if (!acc[area]) acc[area] = { dotacion: 0, masa_bruta: 0 };
      acc[area].dotacion++;
      acc[area].masa_bruta += e.current_job?.base_wage || 0;
      return acc;
    }, {});

    const finiquitos_mes = empleados.filter(e => {
      if (!e.active_until) return false;
      const f = new Date(e.active_until);
      return f.getMonth() === mesActual && f.getFullYear() === anioActual;
    }).length;

    const contratos_vencen = activos.filter(e => {
      const fecha = e.current_job?.contract_finishing_date_1;
      if (!fecha) return false;
      const f = new Date(fecha);
      return f >= hoy && f <= en30dias;
    });

    const contratos_vencen_30_dias = contratos_vencen.length;

    const detalle_contratos_vencen = contratos_vencen
      .sort((a, b) => new Date(a.current_job.contract_finishing_date_1) - new Date(b.current_job.contract_finishing_date_1))
      .map(e => ({
        nombre: e.full_name,
        area:   e.current_job?.cost_center || '-',
        tipo:   e.current_job?.contract_type || '-',
        vence:  e.current_job?.contract_finishing_date_1,
      }));

    res.json({
      dotacion_total,
      masa_bruta_total,
      leyes_sociales_estimadas,
      costo_total_estimado,
      por_area,
      finiquitos_mes,
      contratos_vencen_30_dias,
      detalle_contratos_vencen,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;