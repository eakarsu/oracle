// === Batch 11 Gaps & Frontend Mounts ===
import GapFeaturePage from '../../components/GapFeaturePage'
export default function GapSkillsMatcherPage() {
  return (
    <GapFeaturePage
      title="Skills Matcher"
      description="Skills Matcher"
      slug="skills-matcher"
      aiResultKey="matches"
      fields={[
  {
    "name": "roles",
    "label": "Roles (JSON)",
    "type": "json"
  },
  {
    "name": "people",
    "label": "People & Skills (JSON)",
    "type": "json"
  }
]}
    />
  )
}
