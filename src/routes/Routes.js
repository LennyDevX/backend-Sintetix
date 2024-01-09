// Description: Rutas de la API
import express from 'express';
import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const router = express.Router();

// Ruta principal
router.get('/', (req, res) => {
  res.send('Bienvenido a la página principal de mi aplicación');
});

// Lista de Usuarios Base de Datos
router.get('/users', async (_, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Ocurrió un error al obtener los usuarios.' });
    }
});

// Registro de usuarios
const { check, validationResult } = require('express-validator');
const rateLimit = require("express-rate-limit");

// Limita a 5 intentos de registro por hora por IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  message: 'Has excedido el límite de intentos de registro. Por favor, inténtalo de nuevo en una hora.'
});

router.post('/register', registerLimiter, [
    check('username').notEmpty().withMessage('El nombre de usuario es requerido.')
        .isLength({ min: 5 }).withMessage('El nombre de usuario debe tener al menos 5 caracteres.'),
    check('email').isEmail().withMessage('El correo electrónico no es válido.')
        .normalizeEmail()
        .custom((value) => {
            if (!/\..+$/.test(value.split('@')[1])) {
                throw new Error('El dominio del correo electrónico debe contener al menos un punto.');
            }
            return true;
        }),
    check('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.')
        .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).withMessage('La contraseña debe incluir al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Ya existe un usuario registrado con ese correo electrónico.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });

    try {
        const savedUser = await newUser.save();
        res.json({ message: 'Usuario registrado con éxito!', user: savedUser });
    } catch (error) {
        res.status(500).json({ error: 'Ocurrió un error al registrarse. Por favor, inténtalo de nuevo.' });
    }
});

// Login de usuarios
const { check, validationResult } = require('express-validator');
const rateLimit = require("express-rate-limit");

// Limita a 5 intentos de inicio de sesión por hora por IP
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  message: 'Has excedido el límite de intentos de inicio de sesión. Por favor, inténtalo de nuevo en una hora.'
});

router.post('/login', loginLimiter, [
    check('email').isEmail().withMessage('El correo electrónico no es válido.')
        .normalizeEmail()
        .custom((value) => {
            if (!/\..+$/.test(value.split('@')[1])) {
                throw new Error('El dominio del correo electrónico debe contener al menos un punto.');
            }
            return true;
        }),
    check('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.')
        .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).withMessage('La contraseña debe incluir al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'No existe un usuario con ese correo electrónico.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Contraseña incorrecta.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user });
});

// Agregar seguridad con hamlet
router.use(hamlet());

export default router;
