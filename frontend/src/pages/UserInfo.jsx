import React, { useState, useEffect } from 'react';
import '../styles/UserInfo.css';
import axios from 'axios';
import { getUser } from '../api/auth';

const UserInfo = () => {
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUser();
        const snakeToCamel = str => str.replace(/_([a-z])/g, g => g[1].toUpperCase());

        const camelCaseData = {};
        for (const key in res.data) {
        camelCaseData[snakeToCamel(key)] = res.data[key];
        }

        setFormData({
        firstName: camelCaseData.firstName || '',
        lastName: camelCaseData.lastName || '',
        primaryContact: camelCaseData.primaryContact || '',
        secondaryContact: camelCaseData.secondaryContact || '',
        address: camelCaseData.address || '',
        secondaryEmail: camelCaseData.secondaryEmail || ''
        });

      } catch (err) {
        console.error('Failed to load user info:', err);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      await axios.post('http://localhost:5000/auth/userinfo', formData, {
        withCredentials: true
      });
      setIsEditing(false);
      alert('✅ User info updated!');
    } catch (err) {
      console.error('Error saving info:', err);
      alert('❌ Failed to save user info');
    }
  };

  if (!formData) return <div>Loading...</div>;

  return (
    <div className="user-info-container">
      <h2>My Info</h2>
      <div className="user-info-form">
        <div className="form-group">
          <label>First Name</label>
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="form-group">
          <label>Primary Contact No.</label>
          <input
            name="primaryContact"
            value={formData.primaryContact}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="form-group">
          <label>Secondary Contact No.</label>
          <input
            name="secondaryContact"
            value={formData.secondaryContact}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            readOnly={!isEditing}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Secondary Email</label>
          <input
            type="email"
            name="secondaryEmail"
            value={formData.secondaryEmail}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="button-area">
          {!isEditing ? (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              ✏️ Edit
            </button>
          ) : (
            <button className="save-btn" onClick={handleSave}>
              ✅ Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
