const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares obligatorios
app.use(cors());
app.use(express.json());

// Conexión segura al Transaction Pooler de Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ==================== RUTAS DEL CRUD ====================

// 1. LEER TODAS LAS NOTAS (GET)
app.get('/notas', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM notas ORDER BY fecha_creacion DESC');
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error en GET /notas:', error);
    res.status(500).json({ error: 'Error al obtener las notas de la base de datos' });
  }
});

// 2. CREAR UNA NOTA NUEVA (POST)
app.post('/notas', async (req, res) => {
  const { nombre, mensaje } = req.body;
  if (!nombre || !mensaje) {
    return res.status(400).json({ error: 'El nombre y el mensaje son obligatorios' });
  }
  try {
    const resultado = await pool.query(
      'INSERT INTO notas (nombre, mensaje) VALUES ($1, $2) RETURNING *',
      [nombre, mensaje]
    );
    res.status(201).json(resultado.rows);
  } catch (error) {
    console.error('Error en POST /notas:', error);
    res.status(500).json({ error: 'Error al guardar la nota' });
  }
});

// 3. ACTUALIZAR UNA NOTA EXISTENTE (PUT)
app.put('/notas/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, mensaje } = req.body;
  try {
    const resultado = await pool.query(
      'UPDATE notas SET nombre = $1, mensaje = $2 WHERE id = $3 RETURNING *',
      [nombre, mensaje, id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error en PUT /notas:', error);
    res.status(500).json({ error: 'Error al actualizar la nota' });
  }
});

// 4. ELIMINAR UNA NOTA (DELETE)
app.delete('/notas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query('DELETE FROM notas WHERE id = $1 RETURNING *', [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }
    res.json({ mensaje: 'Nota eliminada correctamente' });
  } catch (error) {
    console.error('Error en DELETE /notas:', error);
    res.status(500).json({ error: 'Error al eliminar la nota' });
  }
});

// Inicialización del Servidor Local
app.listen(PORT, () => {
  console.log(`Servidor API corriendo con éxito en http://localhost:${PORT}`);
});