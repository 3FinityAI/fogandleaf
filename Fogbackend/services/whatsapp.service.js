import twilio from "twilio";

// Check if Twilio credentials are configured
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;

let client = null;

if (accountSid && authToken && whatsappFrom) {
  client = twilio(accountSid, authToken);
} else {
  console.warn(
    "Twilio WhatsApp credentials not configured. WhatsApp notifications will be disabled."
  );
}

export async function sendWhatsAppMessage(phone, orderId, items, total) {
  // If Twilio is not configured, log the message instead of sending
  if (!client || !whatsappFrom) {
    console.log("📱 WhatsApp notification (would be sent if configured):");
    console.log(`To: ${phone}`);
    console.log(`Message: 🍃 *Fog & Leaf Tea Co.*

✅ *Order Confirmed!*
📦 Order ID: ${orderId}
🛒 Items: ${items.map((item) => `${item.quantity} x ${item.name}`).join(", ")}
💰 Total: ₹${total}

Thank you for choosing Fog & Leaf! Your premium tea experience is on its way.

We'll keep you updated on your order status.`);
    return { status: "logged", message: "WhatsApp credentials not configured" };
  }

  const itemList = items
    .map((item) => `${item.quantity} x ${item.name}`)
    .join(", ");
5
  const messageBody = `🍃 *Fog & Leaf Tea Co.*

✅ *Order Confirmed!*
📦 Order ID: ${orderId}
🛒 Items: ${itemList}
💰 Total: ₹${total}

Thank you for choosing Fog & Leaf! Your premium tea experience is on its way.

We'll keep you updated on your order status.`;

  return client.messages.create({
    from: `whatsapp:${whatsappFrom}`,
    to: `whatsapp:${phone}`,
    body: messageBody,
  });
}
5