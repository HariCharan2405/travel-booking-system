import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Packages.css';
import { useNavigate } from 'react-router-dom';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await axios.get('http://localhost:5000/packages', { withCredentials: true });
        setPackages(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error('Error fetching packages', err);
      }
    };
    fetchPackages();
  }, []);

  useEffect(() => {
    const lower = query.toLowerCase();

    const results = packages.filter(pkg => {
      const matchQuery =
        pkg.name.toLowerCase().includes(lower) ||
        pkg.description.toLowerCase().includes(lower);

      const matchDate = selectedDate
        ? new Date(selectedDate) >= new Date(pkg.start_date) &&
          new Date(selectedDate) <= new Date(pkg.end_date)
        : true;

      return matchQuery && matchDate;
    });

    setFiltered(results);
  }, [query, selectedDate, packages]);

  return (
    <div className="packages-container">
      <h2>Explore Travel Packages</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by destination "
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <div className="packages-list">
        {filtered.length > 0 ? (
          filtered.map(pkg => (
            <div className="package-card" key={pkg.id}>
              <img src={pkg.image_url} alt={pkg.name} />
              <h3>{pkg.name}</h3>
              <p>{pkg.description}</p>
              <p><strong>Travel Group:</strong> {pkg.current_travelers} / {pkg.group_capacity}</p>
              <p><strong>Dates:</strong> {new Date(pkg.start_date).toLocaleDateString()} - {new Date(pkg.end_date).toLocaleDateString()}</p>
              <p><strong>Cost:</strong> ₹{pkg.cost_per_person}</p>
              <button
                className="view-details-btn"
                onClick={() => navigate(`/packages/${pkg.id}`)}
              >
                View Details
              </button>
            </div>
          ))
        ) : (
          <p className="no-results">No packages match your filters.</p>
        )}
      </div>
    </div>
  );
};

export default Packages;
