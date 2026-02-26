const express = require('express');
const { Op } = require('sequelize');
const db = require('../models');
const { authenticate, requireStaff } = require('../middleware/auth');

const router = express.Router();

async function getProductOrBorrowed(productId) {
  const product = await db.Product.findByPk(productId);
  if (product) {
    return {
      id: product.id,
      nombre: product.nombre,
      precio: parseFloat(product.precio),
      stock: product.stock,
    };
  }
  const borrowed = await db.BorrowedProduct.findByPk(productId);
  if (borrowed && borrowed.estado === 'pendiente') {
    return {
      id: borrowed.id,
      nombre: borrowed.nombre,
      precio: parseFloat(borrowed.precio),
      stock: borrowed.stock,
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

function toSaleResponse(s) {
  const items = (s.SaleItems || s.items || []).map((i) => ({
    productId: i.product_id,
    productName: i.product_name,
    cantidad: i.cantidad,
    precioUnitario: parseFloat(i.precio_unitario),
  }));
  return {
    id: s.id,
    empleadoId: s.empleado_id,
    empleadoName: s.empleado_name || 'Empleado',
    items,
    total: parseFloat(s.total),
    descuento: s.descuento ? parseFloat(s.descuento) : undefined,
    subtotal: s.subtotal ? parseFloat(s.subtotal) : undefined,
    fecha: s.fecha ? new Date(s.fecha).toISOString() : null,
    reservationId: s.reservation_id,
  };
}

// POST /api/sales - registrar venta (empleado/admin)
router.post('/', authenticate, requireStaff, async (req, res) => {
  try {
    const { items, descuento = 0, reservationId } = req.body;
    const empleadoId = req.userId;

    const empleado = await db.User.findByPk(empleadoId);
    const empleadoName = empleado?.name || 'Empleado';

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Debes seleccionar al menos un producto' });
    }

    const itemsConCantidad = items.filter((i) => i.cantidad > 0);
    if (itemsConCantidad.length === 0) {
      return res.status(400).json({ success: false, message: 'Debes seleccionar al menos un producto' });
    }

    const saleItems = [];
    let subtotal = 0;

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
      const itemSubtotal = product.precio * item.cantidad;
      subtotal += itemSubtotal;
      const nombreLimpio = product.nombre.replace(/\s*\(Préstamo\)\s*$/i, '').trim() || product.nombre;
      saleItems.push({
        productId: product.id,
        productName: nombreLimpio,
        cantidad: item.cantidad,
        precioUnitario: product.precio,
      });
    }

    const descuentoValido = Math.min(Math.max(0, parseFloat(descuento) || 0), subtotal);
    const total = Math.max(0, subtotal - descuentoValido);

    const sale = await db.Sale.create({
      empleado_id: empleadoId,
      empleado_name: empleadoName,
      reservation_id: reservationId || null,
      total,
      descuento: descuentoValido,
      subtotal,
    });

    for (const it of saleItems) {
      await db.SaleItem.create({
        sale_id: sale.id,
        product_id: it.productId,
        product_name: it.productName,
        cantidad: it.cantidad,
        precio_unitario: it.precioUnitario,
      });
      if (!reservationId) {
        await deductStock(it.productId, it.cantidad);
      }
    }

    const full = await db.Sale.findByPk(sale.id, { include: [db.SaleItem] });

    return res.json({
      success: true,
      message: 'Venta registrada correctamente. Stock actualizado.',
      sale: toSaleResponse(full),
    });
  } catch (err) {
    console.error('Create sale error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// GET /api/sales - historial (empleado/admin)
router.get('/', authenticate, requireStaff, async (req, res) => {
  try {
    const { desde, hasta, temporada } = req.query;

    const where = {};
    if (desde) {
      where.fecha = where.fecha || {};
      where.fecha[Op.gte] = new Date(desde);
    }
    if (hasta) {
      const hastaDate = new Date(hasta);
      hastaDate.setHours(23, 59, 59, 999);
      where.fecha = where.fecha || {};
      where.fecha[Op.lte] = hastaDate;
    }
    if (temporada) {
      const [year, month] = temporada.split('-').map(Number);
      where.fecha = {
        [Op.gte]: new Date(year, month - 1, 1),
        [Op.lte]: new Date(year, month, 0, 23, 59, 59, 999),
      };
    }

    const sales = await db.Sale.findAll({
      where: Object.keys(where).length ? where : undefined,
      include: [db.SaleItem],
      order: [['fecha', 'DESC']],
    });

    return res.json(sales.map(toSaleResponse));
  } catch (err) {
    console.error('Get sales error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// GET /api/sales/:id
router.get('/:id', authenticate, requireStaff, async (req, res) => {
  try {
    const sale = await db.Sale.findByPk(req.params.id, { include: [db.SaleItem] });
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Venta no encontrada' });
    }
    return res.json(toSaleResponse(sale));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

module.exports = router;
