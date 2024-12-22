import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';  // dotenv for variables//Importamos dotenv para cargar las variables de entorno
import { Thought } from './Models/Thought.js';

// Variables on .env file//Cargar las variables de entorno desde el archivo .env
dotenv.config();

// SErver//Configuración del servidor
const app = express();
const PORT = process.env.PORT || 5000;  // Usa el puerto de la variable de entorno o el 5000 por defecto
const MONGO_URL = process.env.MONGO_URI;  // Usamos la URL de MongoDB de las variables de entorno

// Middlewares
app.use(express.json());  // For manage JSON on applications//Para manejar JSON en las solicitudes
app.use(cors());  // Applications from any origin//Permite solicitudes desde cualquier origen

// Get route//Ruta opcional para la raíz (si la deseas)
app.get('/', (req, res) => {
  res.send('Welcome to the Happy Thoughts API!');
});

// API Routes//Rutas de la API
// Fresh Thoughts//Obtener los pensamientos más recientes
app.get('/thoughts', async (req, res) => {
  try {
    const thoughts = await Thought.find()
      .sort({ createdAt: -1 }) // Creation date//Ordenar por fecha de creación, descendente
      .limit(20); // Up to 20//Limitar los resultados a los 20 más recientes
    res.json(thoughts);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching thoughts' });
  }
});

// New thought//Crear un nuevo pensamiento
app.post('/thoughts', async (req, res) => {
  const { message } = req.body;

  // Length//Validar longitud del mensaje
  if (!message || message.length < 5 || message.length > 140) {
    return res
      .status(400)
      .json({ error: 'Message must be between 5 and 140 characters' });
  }

  try {
    const newThought = new Thought({ message });
    await newThought.save();
    res.status(201).json(newThought);
  } catch (err) {
    console.error('Error details:', err);  // more info on error added//Añadir más información sobre el error
    res.status(500).json({ error: 'Error saving the thought', details: err });
  }
});

// Add likes on a thought//Incrementar los "likes" de un pensamiento
app.post('/thoughts/:thoughtId/like', async (req, res) => {
  const { thoughtId } = req.params;

  try {
    const thought = await Thought.findById(thoughtId);
    if (!thought) {
      return res.status(404).json({ error: 'Thought not found' });
    }
    thought.hearts += 1;  // Hearts increases//Incrementar el número de corazones
    await thought.save();
    res.json(thought);
  } catch (err) {
    res.status(500).json({ error: 'Error updating the thought' });
  }
});

// Conect to Mongo DB//Conectar a MongoDB y levantar el servidor
mongoose
  .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit//Termina el proceso si no se puede conectar
  });
