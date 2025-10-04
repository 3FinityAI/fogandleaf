import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const ShippingInfo = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
    <Card className="max-w-2xl w-full shadow-lg">
      <CardHeader>
        <CardTitle>Shipping Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-gray-700">
        <p>
          We deliver across India with reliable courier partners. Orders are processed within 1-2 business days.
        </p>
        <ul className="list-disc pl-6">
          <li>Standard shipping: 3-7 business days</li>
          <li>Free shipping on orders above ₹1000</li>
          <li>Tracking details will be shared via email after dispatch</li>
        </ul>
        <p>
          For remote locations, delivery may take a little longer. If you have any questions, please contact our support team.
        </p>
      </CardContent>
    </Card>
  </div>
)

export default ShippingInfo