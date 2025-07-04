import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../styles/HomePage.css';
import UserInfoModal from '../components/UserInfoModal';
import { logout } from '../api/auth';
import { useNavigate } from 'react-router-dom';

import searchButton from '../assets/images/search-button.png';

import wallpaper1 from '../assets/images/wallpaper.webp';
import wallpaper2 from '../assets/images/wallpaper2.jpg';
import wallpaper3 from '../assets/images/wallpaper3.jpg';
import wallpaper4 from '../assets/images/wallpaper4.jpg';
import wallpaper5 from '../assets/images/wallpaper5.jpg';

const HomePage = ({ user, refetchUser }) => {
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const profileRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setShowModal(false);
    } else if (!user.firstName) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [user]);

  const handleSaveUserInfo = async () => {
    await refetchUser();
    setShowModal(false);
  };

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await axios.get('http://localhost:5000/packages', {
          withCredentials: true,
        });
        setPackages(res.data);
        setFilteredPackages(res.data);
      } catch (err) {
        console.error('Error fetching packages', err);
      }
    };
    fetchPackages();
  }, []);

  useEffect(() => {
    const filtered = packages.filter(pkg => {
      const matchesSearch =
        pkg.name.toLowerCase().includes(search.toLowerCase()) ||
        pkg.description.toLowerCase().includes(search.toLowerCase());

      const matchesDate = selectedDate
        ? new Date(selectedDate) >= new Date(pkg.start_date) &&
          new Date(selectedDate) <= new Date(pkg.end_date)
        : true;

      return matchesSearch && matchesDate;
    });
    setFilteredPackages(filtered);
  }, [search, selectedDate, packages]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfilePopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="homepage">
      {user && !user.firstName && showModal && (
        <UserInfoModal user={user} onClose={handleSaveUserInfo} />
      )}

      <nav className="navbar">
        <div className="logo">SoloSync</div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for the destination..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-area"
          />
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="date-picker"
          />
          <button className="search-button">
            <img src={searchButton} alt="Search" />
          </button>
        </div>

        <ul className="nav-links">
          <button className="home-button nav-buttons" onClick={() => window.scrollTo(0, 0)}>Home</button>
          <button className="about-button nav-buttons" onClick={() => navigate('/about')}>About</button>
          <button className="faq-button nav-buttons" onClick={() => alert("Redirect to FAQ")}>FAQ</button>

          {user ? (
            <div className="profile-container" ref={profileRef}>
              <img
                src={user.photo}
                alt="Profile"
                className="nav-profile-pic"
                onClick={() => setShowProfilePopup(!showProfilePopup)}
              />
              {showProfilePopup && (
                <div className="profile-popup">
                  <div className="popup-header">
                    <img src={user.photo} alt="Popup DP" className="popup-pic" />
                    <div>
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                    </div>
                  </div>
                  <hr />
                  <div className="popup-menu">
                    <div className="popup-item" onClick={() => window.location.href = '/userinfo'}>
                      👤 User Info
                    </div>
                    <div className="popup-item" onClick={() => navigate('/mybookings')}>
                      🧳 My Bookings
                    </div>
                    <div className="popup-item" onClick={() => alert("Redirect to Settings")}>
                      ⚙️ Settings
                    </div>
                    <div
                      className="popup-item logout"
                      onClick={async () => {
                        try {
                          await logout();
                          window.location.href = '/';
                        } catch (err) {
                          console.error("Logout failed", err);
                          alert("Logout failed");
                        }
                      }}
                    >
                      🚪 Logout
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              className="login-button nav-buttons"
              onClick={() => window.location.href = 'http://localhost:5000/auth/google'}
            >
              Login with Google
            </button>
          )}
        </ul>
      </nav>

      <header className="hero">
        <div className="image-slider">
          <img src={wallpaper1} alt="Slide 1" />
          <img src={wallpaper2} alt="Slide 2" />
          <img src={wallpaper3} alt="Slide 3" />
          <img src={wallpaper4} alt="Slide 4" />
          <img src={wallpaper5} alt="Slide 5" />
        </div>
        <div className="hero-text">
          <h1>Travel Solo, Never Alone</h1>
          <p>Connect with fellow solo travelers and explore India together.</p>
          <button className="explore-packages-button" onClick={() => navigate('/packages')}>Explore Packages</button>
        </div>
      </header>

      <section className="packages-section">
        <h2>Popular Tour Packages</h2>
        <button className="view-all-button" onClick={() => navigate('/packages')}>View All</button>

        <div className="packages">
          {filteredPackages.length === 0 ? (
            <p className="no-results">No matching packages found.</p>
          ) : (
            filteredPackages.slice(0, 4).map(pkg => (
              <div key={pkg.id} className="package-card">
                <img src={pkg.image_url} alt={pkg.name} />
                <h3>{pkg.name}</h3>
                <p>{pkg.description.slice(0, 60)}...</p>
                <p className="price">Price: ₹{pkg.cost_per_person}</p>
                <p>Travel Group: {pkg.current_travelers} / {pkg.group_capacity}</p>
                <p>Dates: {new Date(pkg.start_date).toLocaleDateString()} - {new Date(pkg.end_date).toLocaleDateString()}</p>
                <button onClick={() => navigate(`/packages/${pkg.id}`)}>View Details</button>
              </div>
            ))
          )}
        </div>
      </section>

      <footer className="footer">
        <p>© 2025 SoloSync. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
