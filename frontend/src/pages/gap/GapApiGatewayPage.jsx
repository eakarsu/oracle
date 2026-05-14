// === Batch 11 Gaps & Frontend Mounts ===
import GapFeaturePage from '../../components/GapFeaturePage'
export default function GapApiGatewayPage() {
  return (
    <GapFeaturePage
      title="API Gateway for 3rd-Party Extensions"
      description="API Gateway for 3rd-Party Extensions"
      slug="api-gateway"
      aiResultKey="tenant"
      fields={[
  {
    "name": "tenantId",
    "label": "Tenant ID",
    "required": true,
    "placeholder": ""
  },
  {
    "name": "appId",
    "label": "App ID",
    "required": false,
    "placeholder": ""
  }
]}
    />
  )
}
