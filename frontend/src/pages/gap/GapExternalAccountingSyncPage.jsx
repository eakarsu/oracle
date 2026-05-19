// === Batch 11 Gaps & Frontend Mounts ===
import GapFeaturePage from '../../components/GapFeaturePage'
export default function GapExternalAccountingSyncPage() {
  return (
    <GapFeaturePage
      title="QuickBooks/Xero Sync"
      description="QuickBooks/Xero Sync"
      slug="external-accounting-sync"
      aiResultKey="job"
      fields={[
  {
    "name": "provider",
    "label": "Provider",
    "required": false,
    "placeholder": ""
  },
  {
    "name": "direction",
    "label": "Direction",
    "required": false,
    "placeholder": ""
  }
]}
    />
  )
}
