import { Router } from "express";
import User from "../models/user.js"

const router = Router();

router.get("/", (req, res) => {
    res.send("Bienvenido a la página principal de mi aplicación");
});

export default router;
