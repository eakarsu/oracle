// === Batch 11 Gaps & Frontend Mounts ===
import GapFeaturePage from '../../components/GapFeaturePage'
export default function GapMultiEntityConsolidationPage() {
  return (
    <GapFeaturePage
      title="Multi-Entity Consolidation"
      description="Multi-Entity Consolidation"
      slug="multi-entity-consolidation"
      aiResultKey="job"
      fields={[
  {
    "name": "entityIds",
    "label": "Entity IDs",
    "type": "array"
  },
  {
    "name": "period",
    "label": "Period",
    "required": false,
    "placeholder": ""
  }
]}
    />
  )
}
