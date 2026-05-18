const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// GET - obtener todos los honorarios
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('honorarios')
    .select('*')
    .order('fecha_ingreso', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST - crear honorario nuevo
router.post('/', async (req, res) => {
  const { data, error } = await supabase
    .from('honorarios')
    .insert([req.body]);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH - actualizar estado
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('honorarios')
    .update(req.body)
    .eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;