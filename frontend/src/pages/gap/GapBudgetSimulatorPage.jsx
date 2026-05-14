// === Batch 11 Gaps & Frontend Mounts ===
import GapFeaturePage from '../../components/GapFeaturePage'
export default function GapBudgetSimulatorPage() {
  return (
    <GapFeaturePage
      title="Budget Simulator"
      description="Budget Simulator"
      slug="budget-simulator"
      aiResultKey="simulation"
      fields={[
  {
    "name": "currentBudget",
    "label": "Current Budget (JSON)",
    "type": "json"
  },
  {
    "name": "adjustments",
    "label": "Adjustments (JSON)",
    "type": "json"
  }
]}
    />
  )
}
