const express = require('express');
const { Op } = require('sequelize');
const db = require('../models');
const { authenticate, requireStaff } = require('../middleware/auth');

const router = express.Router();

function toProductResponse(p) {
  return {
    id: p.id,
    nombre: p.nombre,
    categoria: p.categoria,
    descripcion: p.descripcion || '',
    precio: parseFloat(p.precio),
    stock: p.stock,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
  };
}

// GET /api/products - listar productos (público para catálogo)
router.get('/', async (req, res) => {
  try {
    const products = await db.Product.findAll({
      where: { tipo: 'propio' },
      order: [['nombre', 'ASC']],
    });
    return res.json(products.map(toProductResponse));
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
    return res.json(toProductResponse(product));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// POST /api/products (empleado/admin)
router.post('/', authenticate, requireStaff, async (req, res) => {
  try {
    const { nombre, categoria, descripcion, precio, stock } = req.body;
    const nombreTrimmed = String(nombre || '').trim();
    const categoriaTrimmed = String(categoria || '').trim();

    if (!nombreTrimmed) {
      return res.status(400).json({ success: false, message: 'El nombre del producto es obligatorio' });
    }
    if (!categoriaTrimmed) {
      return res.status(400).json({ success: false, message: 'La categoría es obligatoria' });
    }

    const precioNum = parseFloat(precio);
    const stockNum = parseInt(stock, 10);
    if (isNaN(precioNum) || precioNum < 0) {
      return res.status(400).json({ success: false, message: 'Precio inválido' });
    }
    if (isNaN(stockNum) || stockNum < 0) {
      return res.status(400).json({ success: false, message: 'Stock inválido' });
    }

    const existe = await db.Product.findOne({
      where: db.sequelize.where(
        db.sequelize.fn('LOWER', db.sequelize.col('nombre')),
        db.sequelize.fn('LOWER', nombreTrimmed)
      ),
    });
    if (existe) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un producto con ese nombre',
      });
    }

    const product = await db.Product.create({
      nombre: nombreTrimmed,
      categoria: categoriaTrimmed,
      descripcion: String(descripcion || '').trim() || 'Sin descripción',
      precio: precioNum,
      stock: Math.floor(stockNum),
      tipo: 'propio',
    });

    return res.json({
      success: true,
      message: 'Producto registrado correctamente',
      product: toProductResponse(product),
    });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// PATCH /api/products/:id (empleado/admin)
router.patch('/:id', authenticate, requireStaff, async (req, res) => {
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    const { descripcion, precio, stock } = req.body;
    if (descripcion !== undefined) {
      product.descripcion = String(descripcion).trim() || 'Sin descripción';
    }
    if (precio !== undefined && precio !== '') {
      const p = parseFloat(precio);
      if (isNaN(p) || p < 0) {
        return res.status(400).json({ success: false, message: 'Precio inválido' });
      }
      product.precio = p;
    }
    if (stock !== undefined && stock !== '') {
      const s = parseInt(stock, 10);
      if (isNaN(s) || s < 0) {
        return res.status(400).json({ success: false, message: 'Stock inválido' });
      }
      product.stock = Math.floor(s);
    }
    await product.save();

    return res.json({
      success: true,
      message: 'Producto actualizado correctamente',
      product: toProductResponse(product),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// DELETE /api/products/:id (empleado/admin)
router.delete('/:id', authenticate, requireStaff, async (req, res) => {
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
    await product.destroy();
    return res.json({ success: true, message: 'Producto eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

module.exports = router;
