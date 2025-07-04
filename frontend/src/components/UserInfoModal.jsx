import React, { useState } from 'react';
import '../styles/UserInfoModal.css';
import axios from 'axios';

const UserInfoModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    primaryContact: '',
    secondaryContact: '',
    address: '',
    secondaryEmail: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    try {
      await axios.post('http://localhost:5000/auth/userinfo', formData, {
        withCredentials: true,
      });
      alert('User info saved!');
      onClose();
    } catch (err) {
      console.error('Failed to save user info', err);
      alert('Error saving user info');
    }
  };

  return (
    <div className="user-info-modal-backdrop">
      <div className="user-info-modal">
        <h2>Complete Your Profile</h2>
        <div className="modal-form">
          <input
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
          />
          <input
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
          />
          <input
            name="primaryContact"
            placeholder="Primary Contact"
            value={formData.primaryContact}
            onChange={handleChange}
          />
          <input
            name="secondaryContact"
            placeholder="Secondary Contact"
            value={formData.secondaryContact}
            onChange={handleChange}
          />
          <input
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
          />
          <input
            name="secondaryEmail"
            placeholder="Secondary Email"
            value={formData.secondaryEmail}
            onChange={handleChange}
          />
          <button onClick={handleSave} className="save-btn">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfoModal;
