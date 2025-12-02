const drafts = new Map();

function makeId(userId) {
  return `draft-${parseInt(userId, 10)}`;
}

function ensureDraft(userId) {
  const id = makeId(userId);
  if (!drafts.has(id)) {
    drafts.set(id, {
      id,
      usuario_id: parseInt(userId, 10),
      estado: 'nuevo',
      fecha_creacion: new Date().toISOString(),
      detalles: [],
    });
  }
  return drafts.get(id);
}

function getDraftByUser(userId) {
  const id = makeId(userId);
  return drafts.get(id) || null;
}

function addDetail(userId, detalle) {
  const draft = ensureDraft(userId);
  const nextId = draft.detalles.length + 1;
  const det = {
    id: nextId,
    descripcion: detalle.descripcion,
    medidas: detalle.medidas ?? null,
    material: detalle.material ?? null,
    color: detalle.color ?? null,
    cantidad: detalle.cantidad ?? 1,
    observaciones: detalle.observaciones ?? null,
  };
  draft.detalles.push(det);
  return { draft, detalle: det };
}

function clearDraft(userId) {
  const id = makeId(userId);
  drafts.delete(id);
}

function toSummary(order) {
  return {
    id: order.id,
    numero_pedido: 'Borrador',
    estado: order.estado,
    created_at: order.fecha_creacion,
    productos_count: order.detalles.length,
    productos: order.detalles.map(d => ({
      id: d.id,
      nombre: d.descripcion,
      cantidad: d.cantidad || 1,
      imagen_url: null,
    })),
    total: null,
    fecha_entrega_estimada: null,
  };
}

module.exports = {
  ensureDraft,
  getDraftByUser,
  addDetail,
  clearDraft,
  toSummary,
};