import React, { useState } from 'react';
import { api } from '../services/api';

const sample = JSON.stringify({
  invoiceValue: 125000,
  daysSalesOutstanding: 48,
  creditLimitUsage: 82,
  disputedAmount: 12000,
  fulfillmentDelayDays: 3
}, null, 2);

export default function OrderToCashControl() {
  const [payload, setPayload] = useState(sample);
  const [result, setResult] = useState(null);

  async function run() {
    const data = await api.orderToCashControl(JSON.parse(payload));
    setResult(data);
  }

  return (
    <div className="page">
      <h1>Order-to-Cash Control Tower</h1>
      <p>Score receivables, credit usage, fulfillment delay, and dispute exposure before releasing more orders.</p>
      <textarea value={payload} onChange={(event) => setPayload(event.target.value)} rows={12} style={{ width: '100%', fontFamily: 'monospace' }} />
      <button className="btn btn-primary" onClick={run}>Score control</button>
      {result && (
        <div className="card">
          <h2>{result.controlBand} | risk {result.risk}/100</h2>
          <p>Estimated cash impact: ${result.cashImpact.toLocaleString()}</p>
          <ul>{result.actions.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
