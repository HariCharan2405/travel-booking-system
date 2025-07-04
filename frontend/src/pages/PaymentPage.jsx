import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/PaymentPage.css';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, pkg } = location.state || {};

  if (!user || !pkg) {
    return <div className="payment-error">Invalid payment session.</div>;
  }

  const handlePayment = async () => {
    try {
      // Simulate payment
      alert("✅ Payment successful!");

      // Inform backend to mark as paid and increment current_travelers
      await axios.post(
        'http://localhost:5000/bookings/mark-paid',
        {
          google_id: user.google_id,
          package_id: pkg.id
        },
        { withCredentials: true }
      );

      // Navigate to home or my-bookings page
      localStorage.setItem(`paid_${pkg.id}_${user.google_id}`, 'true');
      navigate('/');
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('❌ Payment succeeded, but failed to update booking status.');
    }
  };

  return (
    <div className="payment-container">
      <h2>Payment Details</h2>

      <div className="payment-card">
        <h3>Traveler Info</h3>
        <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      <div className="payment-card">
        <h3>Package Info</h3>
        <p><strong>Package:</strong> {pkg.name}</p>
        <p><strong>Dates:</strong> {new Date(pkg.start_date).toDateString()} - {new Date(pkg.end_date).toDateString()}</p>
        <p><strong>Price:</strong> ₹{pkg.cost_per_person}</p>
      </div>

      <button className="pay-now-btn" onClick={handlePayment}>
        💳 Pay Now
      </button>

      <button className="back-btn" onClick={() => navigate(-1)}>
        🔙 Back
      </button>
    </div>
  );
};

export default PaymentPage;
