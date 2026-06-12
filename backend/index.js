const express = require('express');
const cors = require('cors');
require('dotenv').config();
const honorariosRouter = require('./routes/honorarios');
const presupuestosRouter = require('./routes/presupuestos');
const bukRouter = require('./routes/buk');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/honorarios', honorariosRouter);
app.use('/presupuestos', presupuestosRouter);
app.use('/buk', bukRouter);

app.get('/', (req, res) => {
  res.json({ mensaje: 'API RRHH funcionando correctamente' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});