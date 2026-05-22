const express = require('express');

const router = express.Router();

router.post('/score', (req, res) => {
  const {
    invoiceValue = 125000,
    daysSalesOutstanding = 48,
    creditLimitUsage = 82,
    disputedAmount = 12000,
    fulfillmentDelayDays = 3,
  } = req.body || {};
  const dso = Number(daysSalesOutstanding || 0);
  const usage = Number(creditLimitUsage || 0);
  const disputePct = Number(invoiceValue) ? (Number(disputedAmount || 0) / Number(invoiceValue)) * 100 : 0;
  const risk = Math.min(100, Math.round(dso * 0.7 + usage * 0.35 + disputePct * 1.5 + Number(fulfillmentDelayDays || 0) * 4));

  res.json({
    risk,
    controlBand: risk >= 75 ? 'hold and review' : risk >= 50 ? 'watch' : 'clear',
    cashImpact: Math.round(Number(invoiceValue || 0) * (risk / 100) * 0.22),
    actions: [
      risk >= 75 ? 'Require credit manager approval before new shipment.' : 'Keep standard release path.',
      disputePct > 5 ? 'Assign AR owner to resolve invoice dispute this week.' : 'No material dispute concentration.',
      dso > 45 ? 'Offer structured payment reminder with account statement.' : 'Monitor normal collection cadence.',
    ],
  });
});

module.exports = router;
