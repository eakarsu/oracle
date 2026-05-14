// === Batch 11 Gaps & Frontend Mounts ===
import GapFeaturePage from '../../components/GapFeaturePage'
export default function GapContractClauseAnalyzerPage() {
  return (
    <GapFeaturePage
      title="Contract Clause Analyzer"
      description="Contract Clause Analyzer"
      slug="contract-clause-analyzer"
      aiResultKey="analysis"
      fields={[
  {
    "name": "contractText",
    "label": "Contract Text",
    "type": "textarea",
    "rows": 8,
    "required": true
  }
]}
    />
  )
}
