// === Batch 11 Gaps & Frontend Mounts ===
import GapFeaturePage from '../../components/GapFeaturePage'
export default function GapFieldOpsAppPage() {
  return (
    <GapFeaturePage
      title="Field Ops Mobile App Stub"
      description="Field Ops Mobile App Stub"
      slug="field-ops-app"
      aiResultKey="workOrder"
      fields={[
  {
    "name": "orderId",
    "label": "Order ID",
    "required": true,
    "placeholder": ""
  },
  {
    "name": "status",
    "label": "Status",
    "required": false,
    "placeholder": ""
  }
]}
    />
  )
}
