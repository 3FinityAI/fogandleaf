import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const faqs = [
  {
    question: "How do I place an order?",
    answer: "Browse our products, add your favorites to the cart, and proceed to checkout."
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept credit/debit cards, UPI, and cash on delivery.Bout for now only COD"
  },
  {
    question: "How can I track my order?",
    answer: "You can check Orders section in the website."
  },
  {
    question: "Can I cancel or modify my order?",
    answer: "Orders can be cancelled or modified before they are shipped. Contact support for assistance."
  }
]

const FAQ = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
    <Card className="max-w-2xl w-full shadow-lg">
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {faqs.map((faq, idx) => (
          <div key={idx}>
            <h4 className="font-semibold text-gray-900">{faq.question}</h4>
            <p className="text-gray-700">{faq.answer}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
)

export default FAQ