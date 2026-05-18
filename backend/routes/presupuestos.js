const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// GET - obtener presupuestos por área
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('presupuestos')
    .select('*')
    .order('fecha_actualizacion', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST - crear o actualizar presupuesto
router.post('/', async (req, res) => {
  const { area, subarea, presupuesto_anual, anio } = req.body;
  const { data: existing } = await supabase
    .from('presupuestos')
    .select('id')
    .eq('area', area)
    .eq('anio', anio)
    .single();

  let result;
  if (existing) {
    result = await supabase
      .from('presupuestos')
      .update({ presupuesto_anual, subarea })
      .eq('id', existing.id);
  } else {
    result = await supabase
      .from('presupuestos')
      .insert([req.body]);
  }
  if (result.error) return res.status(500).json({ error: result.error.message });
  res.json(result.data);
});

module.exports = router;