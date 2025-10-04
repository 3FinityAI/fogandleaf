import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const Returns = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
    <Card className="max-w-2xl w-full shadow-lg">
      <CardHeader>
        <CardTitle>Returns & Refunds</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-gray-700">
        <p>
          We want you to love your tea! If you are not satisfied with your purchase, you may request a return within 7 days of delivery.
        </p>
        <ul className="list-disc pl-6">
          <li>Items must be unused and in original packaging</li>
          <li>Contact our support team to initiate a return</li>
          <li>Refunds are processed within 5-7 business days after receiving the returned item</li>
        </ul>
        <p>
          For damaged or incorrect items, please contact us immediately with your order details and a photo.
        </p>
      </CardContent>
    </Card>
  </div>
)

export default Returns