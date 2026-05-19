// === Batch 11 Gaps & Frontend Mounts ===
import GapFeaturePage from '../../components/GapFeaturePage'
export default function GapTaxOptimizerPage() {
  return (
    <GapFeaturePage
      title="Tax Optimizer"
      description="Tax Optimizer"
      slug="tax-optimizer"
      aiResultKey="recommendations"
      fields={[
  {
    "name": "jurisdiction",
    "label": "Jurisdiction",
    "required": false,
    "placeholder": ""
  },
  {
    "name": "taxData",
    "label": "Tax Data (JSON)",
    "type": "json"
  }
]}
    />
  )
}
