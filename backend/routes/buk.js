const express = require('express');
const router = express.Router();

const BUK_BASE_URL = process.env.BUK_BASE_URL || 'https://gnomo.buk.cl/api/v1/chile';
const BUK_API_KEY  = process.env.BUK_API_KEY;

const bukHeaders = {
  'Content-Type': 'application/json',
  'auth_token': BUK_API_KEY,
};

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

// GET /buk/remuneraciones
router.get('/remuneraciones', async (req, res) => {
  try {
    const response = await fetch(`${BUK_BASE_URL}/payrolls`, { headers: bukHeaders });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /buk/asistencia
router.get('/asistencia', async (req, res) => {
  try {
    const response = await fetch(`${BUK_BASE_URL}/attendances`, { headers: bukHeaders });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /buk/ping - prueba de conexión
router.get('/ping', async (req, res) => {
  try {
    const response = await fetch(`${BUK_BASE_URL}/employees?per_page=1`, { headers: bukHeaders });
    if (response.ok) {
      res.json({ status: 'ok', mensaje: 'Conexión con Buk exitosa' });
    } else {
      res.status(response.status).json({ status: 'error', mensaje: 'Buk respondió con error', code: response.status });
    }
  } catch (err) {
    res.status(500).json({ status: 'error', mensaje: err.message });
  }
});

module.exports = router;