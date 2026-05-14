// === Batch 11 Gaps & Frontend Mounts ===
import GapFeaturePage from '../../components/GapFeaturePage'
export default function GapInvoiceOcrPage() {
  return (
    <GapFeaturePage
      title="Invoice OCR + Auto-Coding"
      description="Invoice OCR + Auto-Coding"
      slug="invoice-ocr"
      aiResultKey="extraction"
      fields={[
  {
    "name": "invoiceText",
    "label": "Invoice Text",
    "type": "textarea",
    "rows": 6,
    "required": true
  }
]}
    />
  )
}
