const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

function stringField(value, name, { required = false, max = 255 } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw new ValidationError(`${name} is required`);
    return null;
  }
  if (typeof value !== 'string') throw new ValidationError(`${name} must be a string`);
  const result = value.trim();
  if (required && !result) throw new ValidationError(`${name} is required`);
  if (result.length > max) throw new ValidationError(`${name} must be at most ${max} characters`);
  return result || null;
}

function moneyField(value, name) {
  if ((typeof value !== 'string' && typeof value !== 'number') || value === '') {
    throw new ValidationError(`${name} must be a positive amount`);
  }
  const normalized = String(value);
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(normalized)) {
    throw new ValidationError(`${name} must be positive with at most two decimal places`);
  }
  const cents = Math.round(Number(normalized) * 100);
  if (!Number.isSafeInteger(cents) || cents < 1 || cents > 100_000_000_000) {
    throw new ValidationError(`${name} is outside the allowed range`);
  }
  return (cents / 100).toFixed(2);
}

function validCalendarDate(value) {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function orderInput(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ValidationError('A JSON object is required');
  }
  const supplierName = stringField(body.supplier_name, 'supplier_name', { required: true, max: 255 });
  const supplierEmail = stringField(body.supplier_email, 'supplier_email', { max: 255 });
  if (supplierEmail && !EMAIL_PATTERN.test(supplierEmail)) {
    throw new ValidationError('supplier_email must be a valid email address');
  }
  const itemDescription = stringField(body.item_description, 'item_description', { required: true, max: 4000 });
  if (!Number.isInteger(body.quantity) || body.quantity < 1 || body.quantity > 1_000_000) {
    throw new ValidationError('quantity must be an integer between 1 and 1000000');
  }
  const unitCost = moneyField(body.unit_cost, 'unit_cost');
  const deliveryDate = stringField(body.delivery_date, 'delivery_date', { max: 10 });
  if (deliveryDate && !validCalendarDate(deliveryDate)) {
    throw new ValidationError('delivery_date must be a valid YYYY-MM-DD date');
  }
  const paymentTerms = stringField(body.payment_terms, 'payment_terms', { max: 100 });
  const currency = stringField(body.currency || 'USD', 'currency', { required: true, max: 3 }).toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new ValidationError('currency must be a three-letter code');

  const totalCents = body.quantity * Math.round(Number(unitCost) * 100);
  if (!Number.isSafeInteger(totalCents) || totalCents > 999_999_999_999_999) {
    throw new ValidationError('calculated total is outside the allowed range');
  }
  return {
    supplierName,
    supplierEmail,
    itemDescription,
    quantity: body.quantity,
    unitCost,
    totalCost: (totalCents / 100).toFixed(2),
    currency,
    deliveryDate,
    paymentTerms,
  };
}

function requestId(req) {
  const value = req.get('idempotency-key');
  if (!value || !UUID_PATTERN.test(value)) {
    throw new ValidationError('Idempotency-Key must be a UUID');
  }
  return value.toLowerCase();
}

function positiveId(value) {
  if (!/^\d+$/.test(String(value)) || Number(value) < 1 || !Number.isSafeInteger(Number(value))) {
    throw new ValidationError('Order id must be a positive integer');
  }
  return Number(value);
}

function decisionInput(body) {
  const decision = stringField(body?.decision, 'decision', { required: true, max: 8 });
  if (!['approved', 'rejected'].includes(decision)) {
    throw new ValidationError('decision must be approved or rejected');
  }
  const note = stringField(body?.note, 'note', { max: 2000 });
  if (decision === 'rejected' && !note) throw new ValidationError('A rejection note is required');
  return { decision, note };
}

module.exports = {
  ValidationError,
  decisionInput,
  orderInput,
  positiveId,
  requestId,
};
