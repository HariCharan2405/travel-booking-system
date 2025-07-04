import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { getUser } from "./api/auth"; 
import UserInfo from "./pages/UserInfo";
import Packages from "./pages/Packages";
import PackageDetails from './pages/PackageDetails';
import PaymentPage from './pages/PaymentPage';
import AboutPage from "./pages/AboutPage";
import MyBookingsPage from "./pages/MyBookings";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await getUser();
  
      if (!res.data) {
        setUser(null);
      } else {
        // Transform keys to camelCase
        const snakeToCamel = (str) =>
          str.replace(/(_\w)/g, (m) => m[1].toUpperCase());
  
        const camelCaseUser = {};
        for (const key in res.data) {
          camelCaseUser[snakeToCamel(key)] = res.data[key];
        }
  
        setUser(camelCaseUser);
      }
    } catch (err) {
      console.error('Fetch user failed:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  
  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage user={user} refetchUser={fetchUser} />} />
        <Route path="/userinfo" element={<UserInfo />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/packages/:id" element={<PackageDetails />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/mybookings" element={<MyBookingsPage />} />

      </Routes>
    </Router>
  );
}

export default App;
