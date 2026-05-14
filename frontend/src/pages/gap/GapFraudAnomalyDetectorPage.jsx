// === Batch 11 Gaps & Frontend Mounts ===
import GapFeaturePage from '../../components/GapFeaturePage'
export default function GapFraudAnomalyDetectorPage() {
  return (
    <GapFeaturePage
      title="Fraud/Compliance Anomaly Detector"
      description="Fraud/Compliance Anomaly Detector"
      slug="fraud-anomaly-detector"
      aiResultKey="flags"
      fields={[
  {
    "name": "transactions",
    "label": "Transactions (JSON)",
    "type": "json"
  }
]}
    />
  )
}
