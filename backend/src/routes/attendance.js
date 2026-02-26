const express = require('express');
const db = require('../models');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

function toAttendanceResponse(r) {
  return {
    id: r.id,
    empleadoId: r.empleado_id,
    empleadoName: r.empleado_name || 'Empleado',
    fecha: r.fecha,
    horaEntrada: r.hora_entrada,
    horaSalida: r.hora_salida,
    registradoPor: r.registrado_por,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
  };
}

// POST /api/attendance - registrar asistencia (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { empleadoId, empleadoName, fecha, horaEntrada, horaSalida } = req.body;
    const adminId = req.userId;

    if (!empleadoId || !fecha || !horaEntrada) {
      return res.status(400).json({
        success: false,
        message: 'Empleado, fecha y hora de entrada son obligatorios',
      });
    }

    const empleado = await db.User.findByPk(empleadoId);
    const empleadoNameVal = empleadoName || empleado?.name || 'Empleado';

    const [record, created] = await db.EmployeeAttendance.findOrCreate({
      where: { empleado_id: empleadoId, fecha },
      defaults: {
        empleado_id: empleadoId,
        empleado_name: empleadoNameVal,
        fecha,
        hora_entrada: horaEntrada,
        hora_salida: horaSalida,
        registrado_por: adminId,
      },
    });

    if (!created) {
      record.hora_entrada = horaEntrada;
      record.hora_salida = horaSalida || record.hora_salida;
      record.registrado_por = adminId;
      await record.save();
    }

    return res.json({
      success: true,
      message: created ? 'Asistencia registrada correctamente' : 'Asistencia actualizada correctamente',
      record: toAttendanceResponse(record),
    });
  } catch (err) {
    console.error('Register attendance error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// GET /api/attendance - listar con filtros
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { empleadoId, fechaDesde, fechaHasta } = req.query;

    const where = {};
    if (empleadoId) where.empleado_id = empleadoId;
    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) where.fecha[db.Sequelize.Op.gte] = fechaDesde;
      if (fechaHasta) where.fecha[db.Sequelize.Op.lte] = fechaHasta;
    }

    const records = await db.EmployeeAttendance.findAll({
      where: Object.keys(where).length ? where : undefined,
      order: [['fecha', 'DESC'], ['hora_entrada', 'DESC']],
    });

    return res.json(records.map(toAttendanceResponse));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// PATCH /api/attendance/:id
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const record = await db.EmployeeAttendance.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    }
    const { horaEntrada, horaSalida } = req.body;
    if (horaEntrada) record.hora_entrada = horaEntrada;
    if (horaSalida !== undefined) record.hora_salida = horaSalida || null;
    await record.save();
    return res.json({ success: true, message: 'Registro actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

// DELETE /api/attendance/:id
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const record = await db.EmployeeAttendance.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    }
    await record.destroy();
    return res.json({ success: true, message: 'Registro eliminado' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

module.exports = router;
