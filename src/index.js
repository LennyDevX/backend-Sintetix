import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Importar Rutas
import routes from "./routes/indexRoutes.js"

// Inicializar app
const app = express();

// Ruta absoluta del directorio actual
const __dirname = dirname(fileURLToPath(import.meta.url));

// Middlewares
app.use(express.json())

// Rutas
app.use(routes)

// Inicializar server
app.listen(process.env.PORT, () => {
    console.log(`Server running on http://${process.env.HOST}:${process.env.PORT}`)
})
