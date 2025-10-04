const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
require('dotenv').config();


const router = express.Router();


const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;
const client = twilio(accountSid, authToken);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});
async function sendEmail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      text,
      html,
    });
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Get all orders for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const ordersRes = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY order_date DESC',
      [req.user.id]
    );
    const orders = await Promise.all(
      ordersRes.rows.map(async (order) => {
        const itemsRes = await pool.query(
          'SELECT * FROM order_items WHERE order_id = $1',
          [order.id]
        );
        return { ...order, items: itemsRes.rows };
      })
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Place a new order
router.post('/', auth, async (req, res) => {
  const { items, total, paymentMethod, shippingAddress, contact } = req.body;
  if (!contact || !items || !total) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const orderRes = await pool.query(
      'INSERT INTO orders (user_id, status, total, payment_method, shipping_address, contact) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, 'confirmed', total, paymentMethod, shippingAddress, contact]
    );
    const order = orderRes.rows[0];
    for (const item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_name, category, weight, quantity, price) VALUES ($1, $2, $3, $4, $5, $6)',
        [order.id, item.name, item.category, item.weight, item.quantity, item.price]
      );
    }
    // Send confirmation email
    sendEmail(
    contact.email, // user email ID
  'Fog & Mist Transaction Completed Order # ' + order.id,
  'Your transaction has been successfully completed.',
  '<strong>Your transaction has been successfully completed </strong>'+order.id 
);
  
    res.json({ orderId: order.id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const orderRes = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (orderRes.rows.length === 0) return res.status(404).json({ message: 'Order not found' });

    const order = orderRes.rows[0];
    const itemsRes = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [order.id]
    );
    res.json({ ...order, items: itemsRes.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/api/send-whatsapp', async (req, res) => {
  const { phone, orderId, items, total } = req.body;
  if (!phone || !orderId || !items || !total) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const itemList = items.map(item => `${item.quantity} x ${item.name}`).join(', ');
  const messageBody = `Order Confirmation\nOrder ID: ${orderId}\nItems: ${itemList}\nTotal: $${total}`;
  try {
    await client.messages.create({
      from: `whatsapp:${whatsappFrom}`,
      to: `whatsapp:${phone}`,
      body: messageBody
    });
    res.json({ success: true, message: 'WhatsApp confirmation sent!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send WhatsApp confirmation.' });
  }
});

module.exports = router;