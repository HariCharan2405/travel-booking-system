import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  BadgeCheck, Calendar, Users, Hotel, Bus,
  Star, ClipboardList, Ban
} from 'lucide-react';
import BookNowModal from '../components/BookNowModal';
import '../styles/PackageDetails.css';

const PackageDetails = () => {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [details, setDetails] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const fetchEverything = async () => {
      try {
        const [pkgRes, detailsRes, userRes] = await Promise.all([
          axios.get(`http://localhost:5000/packages/${id}`),
          axios.get(`http://localhost:5000/packages/${id}/details`),
          axios.get(`http://localhost:5000/auth/user`, { withCredentials: true })
        ]);

        setPkg(pkgRes.data);
        setDetails(detailsRes.data);
        setUser(userRes.data);

        // Check payment status from localStorage
        const paidKey = `paid_${pkgRes.data.id}_${userRes.data?.google_id}`;
        if (localStorage.getItem(paidKey) === 'true') {
          setIsPaid(true);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load package or user info.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEverything();
  }, [id]);

  const Section = ({ icon: Icon, title, children }) => (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="bg-white p-4 rounded shadow text-gray-700">{children}</div>
    </div>
  );

  if (isLoading) return <div className="text-center mt-12">Loading...</div>;
  if (error) return <div className="text-center mt-12 text-red-500">{error}</div>;
  if (!pkg || !details) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">{pkg.name}</h1>

      <img
        src={pkg.image_url}
        alt={pkg.name}
        className="rounded-xl mb-6 w-full h-80 object-cover"
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Section icon={Calendar} title="Dates">
          {new Date(pkg.start_date).toDateString()} - {new Date(pkg.end_date).toDateString()}
        </Section>
        <Section icon={BadgeCheck} title="Cost">
          ₹{pkg.cost_per_person}
        </Section>
        <Section icon={Users} title="Group">
          {pkg.current_travelers} / {pkg.group_capacity}
        </Section>
        <Section icon={ClipboardList} title="Itinerary">
          <pre>{details.itinerary}</pre>
        </Section>
        <Section icon={Star} title="Highlights">
          <ul>{details.highlights.split(';').map((i, idx) => <li key={idx}>{i.trim()}</li>)}</ul>
        </Section>
        <Section icon={Ban} title="Exclusions">
          <ul>{details.exclusions.split(';').map((i, idx) => <li key={idx}>{i.trim()}</li>)}</ul>
        </Section>
        <Section icon={Hotel} title="Accommodation">
          {details.accommodation}
        </Section>
        <Section icon={Bus} title="Transportation">
          {details.transportation}
        </Section>
      </div>

      <div className="text-center mt-8">
        {user === null ? (
          <p className="text-gray-500">Checking login status...</p>
        ) : isPaid ? (
          <div className="text-green-600 font-bold text-lg">✅ You’ve booked this package</div>
        ) : (
          <button
            onClick={() => {
              if (!user || !user.google_id) {
                alert("Please login to book a package.");
              } else {
                setShowModal(true);
              }
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition"
          >
            Book Now
          </button>
        )}
      </div>

      {showModal && (
        <BookNowModal
          user={user}
          pkg={pkg}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default PackageDetails;
