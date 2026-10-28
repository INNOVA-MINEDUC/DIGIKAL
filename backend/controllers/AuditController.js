import { Op } from "sequelize";
import AuditLog from "../models/AuditLog.js";
import { logAction } from "../services/auditService.js";
import logger from '../utils/logger.js';

export const getAuditLogs = async (req, res) => {
  try {
    const {
      userId,
      action,
      module,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const where = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (module) where.module = module;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 20, 1);

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
    });

    res.json({
      data: rows,
      total: count,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum),
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Error al obtener la bitácora de auditoría" });
  }
};

// Traduce el objeto de filtros del front a una frase legible para la bitácora.
const describirFiltros = (filtros) => {
  if (!filtros || typeof filtros !== "object") return "sin filtros";

  const partes = [];
  if (filtros.departamento) partes.push(`departamento ${filtros.departamento}`);
  if (filtros.municipio) partes.push(`municipio ${filtros.municipio}`);
  if (filtros.origen) partes.push(`origen ${filtros.origen}`);
  // Reporte de establecimientos dotados y conectados.
  if (filtros.estado) partes.push(`estado ${filtros.estado}`);
  if (filtros.proveedor) partes.push(`proveedor ${filtros.proveedor}`);
  if (filtros.tipoConectividad) partes.push(`conectividad ${filtros.tipoConectividad}`);
  if (filtros.conexionDesde || filtros.conexionHasta) {
    partes.push(`conexión del ${filtros.conexionDesde || "inicio"} al ${filtros.conexionHasta || "día de hoy"}`);
  }
  if (filtros.dotacionDesde || filtros.dotacionHasta) {
    partes.push(`dotación del ${filtros.dotacionDesde || "inicio"} al ${filtros.dotacionHasta || "día de hoy"}`);
  }

  return partes.length ? partes.join(", ") : "sin filtros";
};

// Reportes que se pueden descargar, para nombrarlos en la bitácora. Sin
// `reporte` (o con uno desconocido) se asume el de dotaciones, el original.
const REPORTES = {
  dotaciones: "dotaciones",
  establecimientos: "establecimientos dotados y conectados",
};

export const logDownload = async (req, res) => {
  try {
    const { format, filtros, reporte } = req.body;

    const formato = String(format || "").toUpperCase() || "DESCONOCIDO";
    // hasOwn: `reporte` lo manda el cliente, y con "constructor" la búsqueda
    // directa devolvería lo heredado de Object.
    const nombreReporte = Object.hasOwn(REPORTES, reporte ?? "") ? REPORTES[reporte] : REPORTES.dotaciones;

    await logAction(req, {
      action: "DATA_DOWNLOAD",
      module: "REPORTES",
      description: `Descargó el reporte de ${nombreReporte} en ${formato} (${describirFiltros(filtros)})`,
    });

    res.status(201).json({ message: "Descarga registrada" });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Error al registrar la descarga" });
  }
};
