const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../models');
const { authenticate, requireAdmin, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const TOKEN_EXPIRY = '7d';

function createToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

function toUserResponse(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone,
  };
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico y la contraseña son obligatorios',
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'El formato del correo electrónico no es válido',
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    const existing = await db.User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este correo electrónico',
      });
    }

    const user = await db.User.create({
      email,
      password,
      name: name?.trim() || null,
      role: 'cliente',
    });

    const token = createToken(user);
    return res.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: toUserResponse(user),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error al registrar' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico y la contraseña son obligatorios',
      });
    }

    const user = await db.User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
      });
    }

    const token = createToken(user);
    return res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user: toUserResponse(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error al iniciar sesión' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico es obligatorio',
      });
    }

    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No existe un usuario registrado con este correo electrónico',
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.PasswordRecoveryCode.create({
      email,
      code,
      expires_at: expiresAt,
    });

    // En producción enviar por email. En dev retornamos el código
    return res.json({
      success: true,
      message: `Código de recuperación enviado a ${email}`,
      recoveryCode: process.env.NODE_ENV === 'production' ? undefined : code,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// POST /api/auth/verify-code
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico y el código son obligatorios',
      });
    }

    const record = await db.PasswordRecoveryCode.findOne({
      where: { email, code, used: false },
      order: [['expires_at', 'DESC']],
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido o expirado',
      });
    }

    if (new Date() > record.expires_at) {
      return res.status(400).json({
        success: false,
        message: 'El código de recuperación ha expirado',
      });
    }

    const tempToken = jwt.sign(
      { email, code, purpose: 'reset' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.json({
      success: true,
      message: 'Código verificado correctamente',
      token: tempToken,
    });
  } catch (err) {
    console.error('Verify code error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios',
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    const record = await db.PasswordRecoveryCode.findOne({
      where: { email, code, used: false },
    });

    if (!record || new Date() > record.expires_at) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido o expirado',
      });
    }

    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    user.password = newPassword;
    await user.save({ fields: ['password'] });

    record.used = true;
    await record.save();

    return res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// GET /api/auth/me (requiere token)
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await db.User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    return res.json({ success: true, user: toUserResponse(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// PATCH /api/auth/profile (requiere token)
router.patch('/profile', authenticate, async (req, res) => {
  try {
    const user = await db.User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const { name, phone } = req.body;
    if (name !== undefined) user.name = String(name || '').trim() || null;
    if (phone !== undefined) user.phone = String(phone || '').trim() || null;
    await user.save();

    return res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user: toUserResponse(user),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// POST /api/auth/change-email (requiere token)
router.post('/change-email', authenticate, async (req, res) => {
  try {
    const { newEmail, currentPassword } = req.body;
    const user = await db.User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'La contraseña actual es incorrecta' });
    }

    const emailTrimmed = String(newEmail || '').trim();
    if (!emailTrimmed) {
      return res.status(400).json({ success: false, message: 'El correo electrónico es obligatorio' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      return res.status(400).json({ success: false, message: 'Formato de correo inválido' });
    }

    const existing = await db.User.findOne({ where: { email: emailTrimmed } });
    if (existing && existing.id !== user.id) {
      return res.status(400).json({ success: false, message: 'Ya existe un usuario con este correo' });
    }

    user.email = emailTrimmed;
    await user.save();

    return res.json({
      success: true,
      message: 'Correo electrónico actualizado correctamente',
      user: toUserResponse(user),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// POST /api/auth/change-password (requiere token)
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await db.User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'La contraseña actual es incorrecta' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    user.password = newPassword;
    await user.save({ fields: ['password'] });

    return res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// POST /api/auth/employees (solo admin)
router.post('/employees', authenticate, requireAdmin, async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    const emailTrimmed = String(email || '').trim();
    const nameTrimmed = String(name || '').trim();

    if (!emailTrimmed) {
      return res.status(400).json({ success: false, message: 'El correo electrónico es obligatorio' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      return res.status(400).json({ success: false, message: 'Formato de correo inválido' });
    }
    if (!nameTrimmed) {
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const existing = await db.User.findOne({ where: { email: emailTrimmed } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Ya existe un usuario con este correo' });
    }

    const employee = await db.User.create({
      email: emailTrimmed,
      password,
      name: nameTrimmed,
      phone: phone?.trim() || null,
      role: 'empleado',
    });

    return res.json({
      success: true,
      message: 'Empleado registrado correctamente',
      employee: toUserResponse(employee),
    });
  } catch (err) {
    console.error('Create employee error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// GET /api/auth/employees (solo admin)
router.get('/employees', authenticate, requireAdmin, async (req, res) => {
  try {
    const employees = await db.User.findAll({
      where: { role: 'empleado' },
      attributes: ['id', 'email', 'name', 'phone', 'role'],
    });
    return res.json(employees.map(toUserResponse));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

module.exports = router;
