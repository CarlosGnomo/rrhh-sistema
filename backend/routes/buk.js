const express = require('express');
const router = express.Router();

const BUK_BASE_URL = process.env.BUK_BASE_URL || 'https://gnomo.buk.cl/api/v1/chile';
const BUK_API_KEY  = process.env.BUK_API_KEY;

const bukHeaders = {
  'Content-Type': 'application/json',
  'auth_token': BUK_API_KEY,
};

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

// GET /buk/ping
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

// GET /buk/empleados
router.get('/empleados', async (req, res) => {
  try {
    const response = await fetch(`${BUK_BASE_URL}/employees`, { headers: bukHeaders });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /buk/diagnostico — prueba varios endpoints posibles de remuneraciones/subprocesos
router.get('/diagnostico', async (req, res) => {
  const intentos = [
    '/payroll_processes',
    '/payroll_subprocesses',
    '/subprocesses',
    '/payrolls',
    '/payroll_processes/1527',
    '/subprocesses/1527',
    '/payroll_subprocesses/1527',
    '/buk_subprocesses/1527',
    '/settlements',
    '/payslips',
  ];

  const resultados = [];

  for (const path of intentos) {
    try {
      const r = await fetch(`${BUK_BASE_URL}${path}`, { headers: bukHeaders });
      let cuerpo;
      try {
        cuerpo = await r.json();
      } catch {
        cuerpo = 'respuesta no-JSON (probablemente HTML de error)';
      }
      resultados.push({
        path,
        status: r.status,
        ok: r.ok,
        muestra: r.ok ? JSON.stringify(cuerpo).slice(0, 300) : cuerpo
      });
    } catch (err) {
      resultados.push({ path, error: err.message });
    }
  }

  res.json(resultados);
});

// GET /buk/dotacion
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