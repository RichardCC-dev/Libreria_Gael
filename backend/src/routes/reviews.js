const express = require('express');
const db = require('../models');
const { authenticate, requireStaff } = require('../middleware/auth');

const router = express.Router();

function toReviewResponse(r) {
  return {
    id: r.id,
    userId: r.user_id,
    userName: r.User?.name || 'Usuario',
    comentario: r.comentario,
    calificacion: r.calificacion,
    fecha: r.createdAt ? new Date(r.createdAt).toISOString() : null,
  };
}

// POST /api/reviews - enviar reseña (autenticado)
router.post('/', authenticate, async (req, res) => {
  try {
    const { comentario, calificacion } = req.body;
    const userId = req.userId;

    const comentarioTrimmed = String(comentario || '').trim();
    if (!comentarioTrimmed) {
      return res.status(400).json({ success: false, message: 'El comentario no puede estar vacío' });
    }

    if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
      return res.status(400).json({
        success: false,
        message: 'La calificación debe ser entre 1 y 5 estrellas',
      });
    }

    const user = await db.User.findByPk(userId);

    const review = await db.Review.create({
      user_id: userId,
      comentario: comentarioTrimmed,
      calificacion,
    });

    const full = await db.Review.findByPk(review.id, {
      include: [{ model: db.User, attributes: ['name'] }],
    });

    return res.json({
      success: true,
      message: '¡Gracias! Tu reseña ha sido enviada correctamente.',
      review: toReviewResponse(full),
    });
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// GET /api/reviews - listar (staff para análisis)
router.get('/', authenticate, requireStaff, async (req, res) => {
  try {
    const reviews = await db.Review.findAll({
      include: [{ model: db.User, attributes: ['name'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.json(reviews.map(toReviewResponse));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

module.exports = router;
