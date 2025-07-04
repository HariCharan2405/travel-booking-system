import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: '10px',
    right: '16px',
    fontSize: '20px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#666',
  },
  heading: {
    textAlign: 'center',
    fontSize: '22px',
    fontWeight: 'bold',
    marginBottom: '16px',
  },
  field: {
    marginBottom: '10px',
    color: '#333',
  },
  label: {
    fontWeight: 'bold',
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  redButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  statusText: {
    marginTop: '12px',
    textAlign: 'center',
    fontWeight: '500',
  }
  
};


const BookNowModal = ({ user, pkg, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [localTravelers, setLocalTravelers] = useState(pkg.current_travelers);
  const [isBooked, setIsBooked] = useState(false);

  const localKey = `booking_${pkg.id}_${user.google_id}`;

  useEffect(() => {
    const stored = localStorage.getItem(localKey);
    if (stored === 'booked') setIsBooked(true);
  }, [localKey]);

  const handleBooking = async () => {
    setLoading(true);
    try {
      const payload = {
        google_id: user.google_id,
        package_id: pkg.id,
        num_people: 1,
        total_cost: pkg.cost_per_person,
        booking_date: new Date().toISOString().split('T')[0],
      };

      const res = await axios.post('http://localhost:5000/bookings/book', payload, {
        withCredentials: true,
      });

      if (res.status === 201) {
        setStatus('✅ Booking successful!');
        setIsBooked(true);
        localStorage.setItem(localKey, 'booked');
        const updatedPkg = await axios.get(`http://localhost:5000/packages/${pkg.id}`);
        setLocalTravelers(updatedPkg.data.current_travelers);
      } else {
        setStatus('❌ Booking failed.');
      }
    } catch (err) {
      console.error('Booking error:', err.response || err);
      setStatus('❌ Booking failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearBooking = async () => {
    try {
      await axios.post('http://localhost:5000/bookings/clear', {
        google_id: user.google_id,
        package_id: pkg.id,
      }, { withCredentials: true });

      localStorage.removeItem(localKey);
      setIsBooked(false);
      setStatus('❌ Booking cleared.');
      const updatedPkg = await axios.get(`http://localhost:5000/packages/${pkg.id}`);
      setLocalTravelers(updatedPkg.data.current_travelers);
    } catch (err) {
      console.error('Clear booking error:', err);
      setStatus('❌ Could not clear booking.');
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const updatedPkg = await axios.get(`http://localhost:5000/packages/${pkg.id}`);
        setLocalTravelers(updatedPkg.data.current_travelers);
      } catch (err) {
        console.error('Failed to update traveler count');
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [pkg.id]);

  const navigate = useNavigate();

  const goToPayment = () => {
    navigate('/payment', {
      state: {
        user,
        pkg
      }
    });
  };
  return ReactDOM.createPortal(
    <div style={modalStyles.overlay}>
      <div style={modalStyles.container}>
        <button style={modalStyles.closeBtn} onClick={onClose}>×</button>

        <h2 style={modalStyles.heading}>Confirm Your Booking</h2>

        <div style={modalStyles.field}>
          <span style={modalStyles.label}>Package:</span> {pkg.name}
        </div>
        <div style={modalStyles.field}>
          <span style={modalStyles.label}>Price:</span> ₹{pkg.cost_per_person}
        </div>
        <div style={modalStyles.field}>
          <span style={modalStyles.label}>Members Enrolled:</span> {localTravelers} / {pkg.group_capacity}
        </div>
        <div style={modalStyles.field}>
          <span style={modalStyles.label}>Name:</span> {user.first_name} {user.last_name}
        </div>
        <div style={modalStyles.field}>
          <span style={modalStyles.label}>Email:</span> {user.email}
        </div>

        {!isBooked ? (
          <button style={modalStyles.button} onClick={handleBooking} disabled={loading}>
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        ) : (
          <>
            <button
            style={{ ...modalStyles.button, backgroundColor: 'green' }}
            onClick={goToPayment}
          >
            Go to Payment
          </button>

            <button style={modalStyles.redButton} onClick={handleClearBooking}>
              Clear Booking
            </button>
          </>
        )}

        {status && <div style={modalStyles.statusText}>{status}</div>}
      </div>
    </div>,
    document.body
  );
};

export default BookNowModal;
