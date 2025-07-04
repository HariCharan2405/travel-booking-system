const express = require('express');
const router = express.Router();
const pool = require('../db');

// Route: Create a booking (without increasing travelers yet)
router.post('/book', async (req, res) => {
  const { google_id, package_id, num_people, total_cost, booking_date } = req.body;

  if (!google_id || !package_id || !num_people || !total_cost || !booking_date) {
    return res.status(400).json({ error: 'Missing booking fields' });
  }

  try {
    await pool.query(
      `INSERT INTO bookings (google_id, package_id, num_people, total_cost, booking_date)
       VALUES ($1, $2, $3, $4, $5)`,
      [google_id, package_id, num_people, total_cost, booking_date]
    );

    res.status(201).json({ message: 'Booking created. Awaiting payment.' });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Booking failed' });
  }
});

// Route: Mark booking as paid and increase travelers
router.post('/mark-paid', async (req, res) => {
  const { google_id, package_id } = req.body;

  if (!google_id || !package_id) {
    return res.status(400).json({ error: 'Missing google_id or package_id' });
  }

  try {
    // Check if the booking exists
    const bookingRes = await pool.query(
      `SELECT num_people FROM bookings WHERE google_id = $1 AND package_id = $2`,
      [google_id, package_id]
    );

    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const num_people = bookingRes.rows[0].num_people;

    // Increment current_travelers in packages table
    await pool.query(
      `UPDATE packages
       SET current_travelers = current_travelers + $1
       WHERE id = $2`,
      [num_people, package_id]
    );

    res.json({ message: 'Payment successful, travelers updated.' });
  } catch (err) {
    console.error('Error confirming payment:', err);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Route: Clear booking and decrement travelers
router.post('/clear', async (req, res) => {
  const { google_id, package_id } = req.body;

  if (!google_id || !package_id) {
    return res.status(400).json({ error: 'Missing google_id or package_id' });
  }

  try {
    // Fetch num_people for this booking
    const result = await pool.query(
      `SELECT num_people FROM bookings WHERE google_id = $1 AND package_id = $2`,
      [google_id, package_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const num_people = result.rows[0].num_people;

    // Delete the booking
    await pool.query(
      `DELETE FROM bookings WHERE google_id = $1 AND package_id = $2`,
      [google_id, package_id]
    );

    // Decrement travelers
    await pool.query(
      `UPDATE packages
       SET current_travelers = current_travelers - $1
       WHERE id = $2`,
      [num_people, package_id]
    );

    res.json({ message: 'Booking cleared' });
  } catch (err) {
    console.error('Error clearing booking:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/user/:google_id', async (req, res) => {
  const { google_id } = req.params;

  try {
    const result = await pool.query(`
      SELECT b.*, p.name AS package_name 
      FROM bookings b
      JOIN packages p ON b.package_id = p.id
      WHERE b.google_id = $1 AND b.payment_status = 'paid'
    `, [google_id]);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ error: 'Internal error' });
  }
});


module.exports = router;
