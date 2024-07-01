
import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const DriverContext = createContext();

export const useDriverContext = () => useContext(DriverContext);

export const DriverProvider = ({ children }) => {
  const [driverData, setDriverData] = useState(null);
  const [error, setError] = useState('');

  const fetchDriverProfile = async () => {
    try {
      const response = await axios.get(
        "https://musifuk-be.vercel.app/api/ambulance/driverProfile",
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );

      if (response.data.success) {
        setDriverData(response.data.result);
      } else {
        setError("Failed to fetch driver profile");
      }
    } catch (error) {
      setError("Failed to fetch driver profile");
    }
  };

  return (
    <DriverContext.Provider value={{ driverData, fetchDriverProfile, error }}>
      {children}
    </DriverContext.Provider>
  );
};
