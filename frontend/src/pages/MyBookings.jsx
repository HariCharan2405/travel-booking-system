import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const userRes = await axios.get('http://localhost:5000/auth/user', { withCredentials: true });
        setUser(userRes.data);

        if (userRes.data?.google_id) {
          const res = await axios.get(`http://localhost:5000/bookings/user/${userRes.data.google_id}`, { withCredentials: true });
          setBookings(res.data);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>My Bookings</h1>
      {bookings.length === 0 ? (
        <p>No completed bookings yet.</p>
      ) : (
        <ul>
          {bookings.map((booking) => (
            <li key={booking.id}>
              <strong>{booking.package_name}</strong> — ₹{booking.total_cost} — {booking.booking_date}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyBookingsPage;
