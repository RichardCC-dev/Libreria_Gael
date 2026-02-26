const express = require('express');
const db = require('../models');
const { authenticate, requireStaff } = require('../middleware/auth');

const router = express.Router();

function toBorrowedProductResponse(p) {
  const emp = p.Employee || p.User;
  return {
    id: p.id,
    nombre: p.nombre,
    stock: p.stock,
    precio: parseFloat(p.precio),
    codigoTienda: p.codigo_tienda,
    fechaPrestamo: p.fecha_prestamo,
    estado: p.estado,
    empleadoId: p.empleado_id,
    empleadoName: emp?.name || 'Empleado',
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
  };
}

// GET /api/borrowed-products (empleado/admin)
router.get('/', authenticate, requireStaff, async (req, res) => {
  try {
    const products = await db.BorrowedProduct.findAll({
      include: [{ model: db.User, as: 'User', attributes: ['name'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.json(products.map(toBorrowedProductResponse));
  } catch (err) {
    console.error('Get borrowed products error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// GET /api/borrowed-products/catalog - pendientes con stock (para catálogo/ventas)
router.get('/catalog', authenticate, async (req, res) => {
  try {
    const products = await db.BorrowedProduct.findAll({
      where: { estado: 'pendiente', stock: { [db.Sequelize.Op.gt]: 0 } },
      include: [{ model: db.User, as: 'User', attributes: ['name'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.json(products.map(toBorrowedProductResponse));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// GET /api/borrowed-products/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const product = await db.BorrowedProduct.findByPk(req.params.id, {
      include: [{ model: db.User, as: 'User', attributes: ['name'] }],
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto prestado no encontrado' });
    }
    return res.json(toBorrowedProductResponse(product));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// POST /api/borrowed-products (empleado/admin)
router.post('/', authenticate, requireStaff, async (req, res) => {
  try {
    const { nombre, stock, precio, codigoTienda, fechaPrestamo } = req.body;
    const nombreTrimmed = String(nombre || '').trim();
    const codigoTrimmed = String(codigoTienda || '').trim();

    if (!nombreTrimmed) {
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
    }
    if (!codigoTrimmed) {
      return res.status(400).json({ success: false, message: 'El código de tienda es obligatorio' });
    }

    const stockNum = parseInt(stock, 10);
    const precioNum = parseFloat(precio);
    if (isNaN(stockNum) || stockNum < 0) {
      return res.status(400).json({ success: false, message: 'Stock inválido' });
    }
    if (isNaN(precioNum) || precioNum < 0) {
      return res.status(400).json({ success: false, message: 'Precio inválido' });
    }
    if (!fechaPrestamo) {
      return res.status(400).json({ success: false, message: 'La fecha de préstamo es obligatoria' });
    }

    const product = await db.BorrowedProduct.create({
      nombre: nombreTrimmed,
      stock: Math.floor(stockNum),
      precio: precioNum,
      codigo_tienda: codigoTrimmed,
      fecha_prestamo: fechaPrestamo,
      estado: 'pendiente',
      empleado_id: req.userId,
    });

    return res.json({
      success: true,
      message: 'Producto prestado registrado correctamente',
      product: toBorrowedProductResponse(product),
    });
  } catch (err) {
    console.error('Create borrowed product error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// PATCH /api/borrowed-products/:id/stock (empleado/admin)
router.patch('/:id/stock', authenticate, requireStaff, async (req, res) => {
  try {
    const product = await db.BorrowedProduct.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto prestado no encontrado' });
    }
    const { newStock } = req.body;
    const stockNum = parseInt(newStock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      return res.status(400).json({ success: false, message: 'Stock inválido' });
    }
    product.stock = stockNum;
    await product.save();
    return res.json({ success: true, message: 'Stock actualizado' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// PATCH /api/borrowed-products/:id/status (empleado/admin)
router.patch('/:id/status', authenticate, requireStaff, async (req, res) => {
  try {
    const product = await db.BorrowedProduct.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto prestado no encontrado' });
    }
    const { estado } = req.body;
    if (estado !== 'pendiente' && estado !== 'cancelado') {
      return res.status(400).json({ success: false, message: 'Estado inválido' });
    }
    product.estado = estado;
    await product.save();
    return res.json({
      success: true,
      message: `Estado actualizado a ${estado === 'pendiente' ? 'Pendiente' : 'Cancelado'}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

module.exports = router;
