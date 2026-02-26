const express = require('express');
const { Op } = require('sequelize');
const db = require('../models');
const { authenticate, requireStaff } = require('../middleware/auth');

const router = express.Router();
const MONTO_MINIMO = 70;

async function getProductOrBorrowed(productId) {
  const product = await db.Product.findByPk(productId);
  if (product) {
    return {
      id: product.id,
      nombre: product.nombre,
      precio: parseFloat(product.precio),
      stock: product.stock,
      isBorrowed: false,
    };
  }
  const borrowed = await db.BorrowedProduct.findByPk(productId);
  if (borrowed && borrowed.estado === 'pendiente') {
    return {
      id: borrowed.id,
      nombre: borrowed.nombre,
      precio: parseFloat(borrowed.precio),
      stock: borrowed.stock,
      isBorrowed: true,
    };
  }
  return null;
}

async function deductStock(productId, cantidad) {
  const product = await db.Product.findByPk(productId);
  if (product) {
    product.stock -= cantidad;
    await product.save();
    return;
  }
  const borrowed = await db.BorrowedProduct.findByPk(productId);
  if (borrowed) {
    borrowed.stock -= cantidad;
    await borrowed.save();
  }
}

async function restoreStock(productId, cantidad) {
  const product = await db.Product.findByPk(productId);
  if (product) {
    product.stock += cantidad;
    await product.save();
    return;
  }
  const borrowed = await db.BorrowedProduct.findByPk(productId);
  if (borrowed) {
    borrowed.stock += cantidad;
    await borrowed.save();
  }
}

function toReservationResponse(r) {
  const items = (r.ReservationItems || r.items || []).map((i) => ({
    productId: i.product_id,
    productName: i.product_name,
    cantidad: i.cantidad,
    precioUnitario: parseFloat(i.precio_unitario),
  }));
  return {
    id: r.id,
    clienteId: r.cliente_id,
    items,
    total: parseFloat(r.total),
    estado: r.estado,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
    mensajeEmpleado: r.mensaje_empleado,
    tiempoEntregaDias: r.tiempo_entrega_dias,
  };
}

// POST /api/reservations - crear reserva (cliente autenticado)
router.post('/', authenticate, async (req, res) => {
  try {
    const { items } = req.body;
    const clienteId = req.userId;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Debes seleccionar al menos un producto' });
    }

    const itemsConCantidad = items.filter((i) => i.cantidad > 0);
    if (itemsConCantidad.length === 0) {
      return res.status(400).json({ success: false, message: 'Debes seleccionar al menos un producto' });
    }

    const reservationItems = [];
    let total = 0;

    for (const item of itemsConCantidad) {
      const product = await getProductOrBorrowed(item.productId);
      if (!product) {
        return res.status(400).json({ success: false, message: `Producto no encontrado: ${item.productId}` });
      }
      if (product.stock < item.cantidad) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para "${product.nombre}". Disponible: ${product.stock}`,
        });
      }
      const subtotal = product.precio * item.cantidad;
      total += subtotal;
      reservationItems.push({
        productId: product.id,
        productName: product.nombre,
        cantidad: item.cantidad,
        precioUnitario: product.precio,
      });
    }

    if (total < MONTO_MINIMO) {
      return res.status(400).json({
        success: false,
        message: `El monto mínimo de la reserva es S/ ${MONTO_MINIMO.toFixed(2)}. Total actual: S/ ${total.toFixed(2)}`,
      });
    }

    const reservation = await db.Reservation.create({
      cliente_id: clienteId,
      total,
      estado: 'por_confirmar',
    });

    for (const it of reservationItems) {
      await db.ReservationItem.create({
        reservation_id: reservation.id,
        product_id: it.productId,
        product_name: it.productName,
        cantidad: it.cantidad,
        precio_unitario: it.precioUnitario,
      });
      await deductStock(it.productId, it.cantidad);
    }

    const full = await db.Reservation.findByPk(reservation.id, {
      include: [db.ReservationItem],
    });

    return res.json({
      success: true,
      message: 'Reserva creada correctamente. Estado: Por confirmar.',
      reservation: toReservationResponse(full),
    });
  } catch (err) {
    console.error('Create reservation error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// GET /api/reservations - mis reservas (cliente) o todas (staff)
router.get('/', authenticate, async (req, res) => {
  try {
    const isStaff = req.userRole === 'administrador' || req.userRole === 'empleado';
    const where = isStaff ? {} : { cliente_id: req.userId };

    const reservations = await db.Reservation.findAll({
      where,
      include: [db.ReservationItem],
      order: [['createdAt', 'DESC']],
    });

    return res.json(reservations.map(toReservationResponse));
  } catch (err) {
    console.error('Get reservations error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// GET /api/reservations/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const reservation = await db.Reservation.findByPk(req.params.id, {
      include: [db.ReservationItem],
    });
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
    }
    const isStaff = req.userRole === 'administrador' || req.userRole === 'empleado';
    if (!isStaff && reservation.cliente_id !== req.userId) {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }
    return res.json(toReservationResponse(reservation));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// POST /api/reservations/:id/cancel - cancelar (cliente, 24h)
router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const reservation = await db.Reservation.findByPk(req.params.id, {
      include: [db.ReservationItem],
    });
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
    }
    if (reservation.cliente_id !== req.userId) {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }
    if (reservation.estado !== 'por_confirmar') {
      return res.status(400).json({
        success: false,
        message: 'Solo puedes cancelar reservas en estado "Por confirmar"',
      });
    }

    const createdAt = new Date(reservation.createdAt).getTime();
    if (Date.now() - createdAt > 24 * 60 * 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: 'El plazo para cancelar ha expirado (24 horas)',
      });
    }

    for (const item of reservation.ReservationItems || []) {
      await restoreStock(item.product_id, item.cantidad);
    }
    reservation.estado = 'cancelado';
    await reservation.save();

    return res.json({
      success: true,
      message: 'Reserva cancelada. Los productos han vuelto al catálogo.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// POST /api/reservations/:id/accept (empleado/admin)
router.post('/:id/accept', authenticate, requireStaff, async (req, res) => {
  try {
    const { mensaje, tiempoEntregaDias } = req.body;
    const reservation = await db.Reservation.findByPk(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
    }
    if (reservation.estado !== 'por_confirmar') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden aceptar reservas en estado "Por confirmar"',
      });
    }

    const dias = tiempoEntregaDias ?? 1;
    if (dias < 1 || dias > 4) {
      return res.status(400).json({
        success: false,
        message: 'El tiempo de entrega debe ser entre 1 y 4 días',
      });
    }

    reservation.estado = 'pendiente';
    reservation.mensaje_empleado = mensaje || reservation.mensaje_empleado;
    reservation.tiempo_entrega_dias = dias;
    reservation.empleado_confirma_id = req.userId;
    await reservation.save();

    return res.json({
      success: true,
      message: 'Reserva aceptada. Estado: Pendiente (por pagar).',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// POST /api/reservations/:id/cancel-by-staff (empleado/admin)
router.post('/:id/cancel-by-staff', authenticate, requireStaff, async (req, res) => {
  try {
    const { mensaje } = req.body;
    const reservation = await db.Reservation.findByPk(req.params.id, {
      include: [db.ReservationItem],
    });
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
    }
    if (reservation.estado === 'cancelado' || reservation.estado === 'confirmada') {
      return res.status(400).json({
        success: false,
        message: 'No se puede cancelar una reserva ya confirmada o cancelada',
      });
    }

    for (const item of reservation.ReservationItems || []) {
      await restoreStock(item.product_id, item.cantidad);
    }
    reservation.estado = 'cancelado';
    if (mensaje) reservation.mensaje_empleado = mensaje;
    await reservation.save();

    return res.json({
      success: true,
      message: 'Reserva cancelada. Los productos han vuelto al catálogo.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// POST /api/reservations/:id/confirm-payment (empleado/admin)
router.post('/:id/confirm-payment', authenticate, requireStaff, async (req, res) => {
  try {
    const reservation = await db.Reservation.findByPk(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
    }
    if (reservation.estado !== 'pendiente') {
      return res.status(400).json({
        success: false,
        message: 'Solo se puede confirmar pago en reservas con estado "Pendiente"',
      });
    }

    reservation.estado = 'confirmada';
    reservation.empleado_confirma_id = req.userId;
    await reservation.save();

    return res.json({
      success: true,
      message: 'Venta confirmada. Reserva completada.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// GET /api/reservations/active/:productId - verificar si producto está en reservas activas
router.get('/active/:productId', authenticate, requireStaff, async (req, res) => {
  try {
    const { productId } = req.params;
    const items = await db.ReservationItem.findAll({
      include: [{
        model: db.Reservation,
        required: true,
        where: { estado: { [Op.in]: ['por_confirmar', 'pendiente', 'confirmada'] } },
      }],
      where: { product_id: productId },
    });
    return res.json({ hasProductInActiveReservations: items.length > 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

module.exports = router;
