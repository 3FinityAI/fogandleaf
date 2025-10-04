import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const Support = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
    <Card className="max-w-2xl w-full shadow-lg">
      <CardHeader>
        <CardTitle>Support</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-gray-700">
        <p>
          Need help? Our support team is here for you!
        </p>
        <ul className="list-disc pl-6">
          <li>Email: <a href="mailto:fogandleaf@gmail.com" className="text-green-700 underline">fogandleaf@gmail.com</a></li>
          <li>Phone: <a href="tel:+911234567890" className="text-green-700 underline">+91 8906407429</a></li>
        </ul>
        <p>
          We aim to respond to all queries within 24 hours.
        </p>
      </CardContent>
    </Card>
  </div>
)

export default Support