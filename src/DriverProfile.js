import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDriverContext } from './DriverContext';
import './driverProfile.css';

const DriverProfile = () => {
  const [driveData, setDriverData] = useState(null);
  const [err, setError] = useState("");
  const { driverData, fetchDriverProfile, error } = useDriverContext();
  useEffect(() => {
    fetchDriverProfile();
  }, [fetchDriverProfile]);


  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!driverData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Driver Profile</h1>
      <p>
        <strong>Name:</strong> {driverData.driver.name}
      </p>
      <p>
        <strong>License Number:</strong> {driverData.driver.licenseNumber}
      </p>
      <p>
        <strong>Contact Number:</strong> {driverData.driver.contactNumber}
      </p>
      <p>
        <strong>Email:</strong> {driverData.driver.email}
      </p>
      <p>
        <strong>Status:</strong>{" "}
        {driverData.driver.isLoggedIn ? "Logged In" : "Logged Out"}
      </p>
    </div>
  );
};

export default DriverProfile;
