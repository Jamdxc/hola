// Importamos dependencias
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

// Creamos la aplicación Express
const app = express();
app.use(cors());
app.use(express.json()); // Para leer datos en formato JSON

// Conexión a la base de datos PostgreSQL (Supabase)
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: { rejectUnauthorized: false },
});

// Verificación de la conexión a la base de datos
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error de conexión a la base de datos', err.stack);
  } else {
    console.log('Conexión exitosa a la base de datos');
  }
  release();
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Rutas de categorías
app.get('/categorias', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener categorías', error);
    res.status(500).json({ error: 'Error al obtener las categorías' });
  }
});

app.post('/categorias', async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al agregar categoría', error);
    res.status(500).json({ error: 'Error al agregar la categoría' });
  }
});

// Rutas de platillos
app.get('/platillos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM platillos');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener platillos', error);
    res.status(500).json({ error: 'Error al obtener los platillos' });
  }
});

app.post('/platillos', async (req, res) => {
  const { nombre, descripcion, precio, categoria_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO platillos (nombre, descripcion, precio, categoria_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, descripcion, precio, categoria_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al agregar platillo', error);
    res.status(500).json({ error: 'Error al agregar el platillo' });
  }
});

// Rutas de ingredientes
app.get('/ingredientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ingredientes');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ingredientes', error);
    res.status(500).json({ error: 'Error al obtener los ingredientes' });
  }
});

app.post('/ingredientes', async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO ingredientes (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al agregar ingrediente', error);
    res.status(500).json({ error: 'Error al agregar el ingrediente' });
  }
});

// Relación Platillos-Ingredientes (muchos a muchos)
app.get('/platillos/:platillo_id/ingredientes', async (req, res) => {
  const { platillo_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT i.* FROM ingredientes i JOIN platillos_ingredientes pi ON i.id = pi.ingrediente_id WHERE pi.platillo_id = $1',
      [platillo_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ingredientes del platillo', error);
    res.status(500).json({ error: 'Error al obtener los ingredientes del platillo' });
  }
});

app.post('/platillos/:platillo_id/ingredientes', async (req, res) => {
  const { platillo_id } = req.params;
  const { ingrediente_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO platillos_ingredientes (platillo_id, ingrediente_id) VALUES ($1, $2) RETURNING *',
      [platillo_id, ingrediente_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al agregar ingrediente al platillo', error);
    res.status(500).json({ error: 'Error al agregar el ingrediente al platillo' });
  }
});

// Rutas de clientes
app.get('/clientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener clientes', error);
    res.status(500).json({ error: 'Error al obtener los clientes' });
  }
});

app.post('/clientes', async (req, res) => {
  const { nombre, telefono, direccion } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO clientes (nombre, telefono, direccion) VALUES ($1, $2, $3) RETURNING *',
      [nombre, telefono, direccion]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al agregar cliente', error);
    res.status(500).json({ error: 'Error al agregar el cliente' });
  }
});

// Rutas de órdenes
app.get('/ordenes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ordenes');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener órdenes', error);
    res.status(500).json({ error: 'Error al obtener las órdenes' });
  }
});

app.post('/ordenes', async (req, res) => {
  const { cliente_id, platillo_id, cantidad, estado } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO ordenes (cliente_id, platillo_id, cantidad, estado) VALUES ($1, $2, $3, $4) RETURNING *',
      [cliente_id, platillo_id, cantidad, estado]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al agregar orden', error);
    res.status(500).json({ error: 'Error al agregar la orden' });
  }
});

// Rutas de pagos
app.get('/pagos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pagos');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener pagos', error);
    res.status(500).json({ error: 'Error al obtener los pagos' });
  }
});

app.post('/pagos', async (req, res) => {
  const { orden_id, monto, fecha_pago } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO pagos (orden_id, monto, fecha_pago) VALUES ($1, $2, $3) RETURNING *',
      [orden_id, monto, fecha_pago]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al agregar pago', error);
    res.status(500).json({ error: 'Error al agregar el pago' });
  }
});

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciamos el servidor en el puerto indicado en el .env o 3000 por defecto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

