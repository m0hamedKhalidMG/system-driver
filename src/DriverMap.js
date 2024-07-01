import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useDriverContext } from "./DriverContext";
import Pusher from "pusher-js";
import axios from "axios";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});
const Oopup = ({ isOpen, onClose, onSubmit }) => {
  const [pickupLocation, setPickupLocation] = useState("");
  const [departments, setDepartments] = useState([{ name: "", minBeds: "" }]);
  const [medicalEquipment, setMedicalEquipment] = useState([]);
  const [serumsAndVaccines, setSerumsAndVaccines] = useState([]);
  const handleAddDepartment = () => {
    setDepartments([...departments, { name: "", minBeds: "" }]);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the data object based on the form state
    const requestData = {
      pickupLocation: pickupLocation
        .split(",")
        .map((coord) => parseFloat(coord.trim())),
      departments,
      medicalEquipment,
      serumsAndVaccines,
    };

    try {
      console.log("API Response:", requestData);
      Object.keys(requestData).forEach((key) => {
        if (Array.isArray(requestData[key])) {
          requestData[key] = requestData[key].filter((item) => item !== "");
        }
      });
      const response = await axios.post(
        "https://musifuk-be.vercel.app/api/hospitals/filter",
        requestData,
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );
      console.log("API Response:", response.data);
      onSubmit(response.data);
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle error state or display error message
    }
    onClose()
  };
  const handleRemoveDepartment = (index) => {
    const updatedDepartments = departments.filter((_, i) => i !== index);
    setDepartments(updatedDepartments);
  };
  return (
    <div className={`popup ${isOpen ? "open" : ""}`}>
      <div className="popup-content">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <h2 className="popup-title">Filter Hospitals</h2>
        <form onSubmit={handleSubmit} className="popup-form">
          <label className="form-label">
            Pickup Location (Latitude, Longitude):
            <input
              type="text"
              className="form-input"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              required
            />
          </label>
          <br />

          <h3 className="form-subtitle">Departments</h3>
          {departments.map((dept, index) => (
            <div key={index} className="department-row">
              <label className="form-label">
                Department Name:
                <input
                  type="text"
                  className="form-input"
                  value={dept.name}
                  onChange={(e) => {
                    const updatedDepartments = [...departments];
                    updatedDepartments[index].name = e.target.value;
                    setDepartments(updatedDepartments);
                  }}
                  required
                />
              </label>
              <label className="form-label">
                Minimum Beds:
                <input
                  type="number"
                  className="form-input"
                  value={dept.minBeds}
                  onChange={(e) => {
                    const updatedDepartments = [...departments];
                    updatedDepartments[index].minBeds = parseInt(
                      e.target.value
                    );
                    setDepartments(updatedDepartments);
                  }}
                  required
                />
              </label>
              {index > 0 && (
                <button
                  type="button"
                  className="btn-remove-department"
                  onClick={() => handleRemoveDepartment(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn-add-department"
            onClick={handleAddDepartment}
          >
            Add Department
          </button>
          <br />

          <label className="form-label">
            Medical Equipment (comma-separated list):
            <input
              type="text"
              className="form-input"
              value={medicalEquipment.join(", ")}
              onChange={(e) =>
                setMedicalEquipment(
                  e.target.value.split(",").map((item) => item.trim())
                )
              }
            />
          </label>
          <br />

          <label className="form-label">
            Serums and Vaccines (comma-separated list):
            <input
              type="text"
              className="form-input"
              value={serumsAndVaccines.join(", ")}
              onChange={(e) =>
                setSerumsAndVaccines(
                  e.target.value.split(",").map((item) => item.trim())
                )
              }
            />
          </label>
          <br />

          <button type="submit" className="btn-submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};
const DriverMap = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hospitalData, setHospitalData] = useState([]);

  const togglePopup = () => {
    console.log(isOpen);
    setIsOpen(!isOpen);
  };
  const [position, setPosition] = useState([30.547746, 31.037486]);
  const [newAssignment, setNewAssignment] = useState(null);
  const [error, setError] = useState("");
  const [requestcar, setrequestcar] = useState(null);
  const [polylineCoords, setPolylineCoords] = useState([]);

  const { driverData, fetchDriverProfile } = useDriverContext();
  const [markers, setMarkers] = useState([]);

  const updatePositionOnServer = async (newPosition) => {
    try {
      await axios.put(
        "https://musifuk-be.vercel.app/api/update-last-location",
        {
          newCoordinates: newPosition,
          newTimestamp: new Date().toISOString(),
        },
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );
    } catch (error) {
      console.error("Error updating position on server:", error);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log(position.coords);
          setPosition([latitude, longitude]);
          console.log(position.coords);
          updatePositionOnServer([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting user location:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const fetchDriverrequest = async () => {
    try {
      const response = await axios.get(
        "https://musifuk-be.vercel.app/api/requests",
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );

      if (response.data) {
        setrequestcar(response.data);
        setPolylineCoords([
          position,
          requestcar[0].pickupLocation.coordinates.coordinates,
        ]);
      } else {
        setError("Failed to fetch driver profile");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError(
          "Requests not found. Please check the URL or contact support."
        );
      } else {
        setError("Failed to fetch driver requests");
      }
    }
  };
  useEffect(() => {
    fetchDriverrequest();
  }, []);
  useEffect(() => {
    fetchDriverProfile();
  }, [fetchDriverProfile]);
  useEffect(() => {
    if (driverData && driverData.cars.lastLocation) {
      const { coordinates } = driverData.cars.lastLocation.coordinates;

      setPosition(coordinates);
    }
  }, [driverData]);
  const handleFormSubmit = () => {
    console.log("Form submission handler called.");
    // Implement your form submission logic here
  };

  const handleMarkDelivered = async (requestId, carId) => {
    console.log(requestId);

    console.log(carId);
    const newStatus = "delivered";
    try {
      const token = localStorage.getItem("token"); // Ensure the token is correctly fetched
      const response = await axios.put(
        `https://musifuk-be.vercel.app/api/update-delivery-status/${requestId}/${carId}`,
        { newStatus },
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Status updated successfully:", response.data);
      const markPatientsResponse = await axios.patch(
        `https://musifuk-be.vercel.app/api/ambulance/request/markPatientsAsDelivered`,
        { requestId },
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("Patients marked as delivered successfully:", markPatientsResponse.data);
      setrequestcar(null)
      setNewAssignment();

    } catch (error) {
      console.error(
        "Error updating status:",
        error.response ? error.response.data : error.message
      );
    }
  };
  useEffect(() => {
    const pusher = new Pusher("ea80cde6e77453dc1bf5", {
      cluster: "mt1",
      encrypted: true,
    });
    if (driverData) {
      const { _id } = driverData.cars;
      const channel = pusher.subscribe(`car_${_id}`);
      channel.bind("newassignment", (data) => {
        console.log("newassignment:", data);
        setNewAssignment(data);
      //  if(!requestcar){
          setrequestcar([data.request])
       // }
        const newMarker = {
          id: data.assignmentId,
          position: data.request.pickupLocation.coordinates.coordinates, // Adjust according to your data structure
          content: `
            Name: ${data.request.patientName}<br />
            Age: ${data.request.patientAge}<br />
            Gender: ${data.request.patientGender}<br />
            Description: ${data.request.description}<br />
            Number of Patients: ${data.request.Numberofpatients}<br />
            Urgency Level: ${data.request.urgencyLevel}<br />
            Additional Costs: ${data.request.additionalCosts}<br />
            Contact Number: ${data.request.contactNumber}<br />
            National ID: ${data.request.nationalid}<br />
            State: ${data.request.state}<br />
          `,
        };
        setMarkers((prevMarkers) => [newMarker]);
      });

      channel.bind("pusher:subscription_succeeded", () => {
        console.log("Subscribed to channel");
      });
      return () => {};
    }
  }, [driverData]);
  const requestId = requestcar ? requestcar[0]?._id : newAssignment?._id;
  const carId = driverData?.cars?._id;
  const isButtonDisabled = !requestId || !carId;

  return (
    <div style={{ height: "95vh", width: "100%" }}>
      <Oopup
        isOpen={isOpen}
        onClose={togglePopup}
        onSubmit={(x) => {
          setHospitalData(x);
          setrequestcar(null);
        }}
      />
      {driverData && (
        <MapContainer
          center={driverData.cars.lastLocation.coordinates.coordinates}
          zoom={13}
          style={{ height: "95%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {driverData && (
            <Marker position={position}>
              <Popup>
                <div>
                  <h2>Driver Information</h2>
                  <p>Name: {driverData.driver.name}</p>
                  <p>Email: {driverData.driver.email}</p>
                  <p>Car Number: {driverData.cars.carNumber}</p>
                  <p>Location: {driverData.cars.location}</p>
                  <p>Status: {driverData.cars.status}</p>
                </div>
              </Popup>
            </Marker>
          )}
          {newAssignment && (
          markers.map((marker) => (
            <Marker key={marker.id} position={marker.position}>
              <Popup>
                <div>
                  <h3>New Assignment</h3>
                  <p>Name: {newAssignment.request.patientName}</p>
                  <p>Age: {newAssignment.request.patientAge}</p>
                  <p>Gender: {newAssignment.request.patientGender}</p>
                  <p>Description: {newAssignment.request.description}</p>
                  <p>
                    Number of Patients: {newAssignment.request.Numberofpatients}
                  </p>
                  <p>Urgency Level: {newAssignment.request.urgencyLevel}</p>
                  <p>
                    Additional Costs: {newAssignment.request.additionalCosts}
                  </p>
                  <p>Contact Number: {newAssignment.request.contactNumber}</p>
                  <p>National ID: {newAssignment.request.nationalid}</p>
                  <p>State: {newAssignment.request.state}</p>
                </div>
              </Popup>
            </Marker>
          ))

          )}
          {requestcar &&
            requestcar.length > 0 &&
            requestcar.map((marker) => (
              <Marker
                key={marker._id}
                position={marker.pickupLocation.coordinates.coordinates}
              >
                <Popup>
                  <div>
                    <h3>Existing Request</h3>
                    <p>Name: {marker.patientName}</p>
                    <p>Age: {marker.patientAge}</p>
                    <p>Gender: {marker.patientGender}</p>
                    <p>Description: {marker.description}</p>
                    <p>Number of Patients: {marker.Numberofpatients}</p>
                    <p>Urgency Level: {marker.urgencyLevel}</p>
                    <p>Additional Costs: {marker.additionalCosts}</p>
                    <p>Contact Number: {marker.contactNumber}</p>
                    <p>National ID: {marker.nationalid}</p>
                    <p>State: {marker.state}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

          {hospitalData &&
            hospitalData.length > 0 &&
            hospitalData.map((hospital) => (
              <Marker
                key={hospital._id}
                position={hospital.location.coordinates}
              >
                <Popup>
                  <div>
                    <h3>{hospital.name}</h3>
                    <p>{hospital.address}</p>
                    <p>Distance: {hospital.distance.toFixed(2)} km</p>
                    <h4>Departments:</h4>
                    <ul>
                      {hospital.departments.map((dept, idx) => (
                        <li key={idx}>
                          {dept.name} - Min Beds: {dept.minBeds}
                        </li>
                      ))}
                    </ul>
                    <h4>Medical Equipment:</h4>
                    <ul>
                      {hospital.medicalEquipment.map((eq, idx) => (
                        <li key={idx}>
                          {eq.name} - Quantity: {eq.quantity}
                        </li>
                      ))}
                    </ul>
                    <h4>Serums and Vaccines:</h4>
                    <ul>
                      {hospital.serumsAndVaccines.map((sv, idx) => (
                        <li key={idx}>
                          {sv.name} - Quantity: {sv.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      )}
      <div style={{ marginTop: "10px", textAlign: "center" }}>
        <button
          onClick={togglePopup}
          style={{
            marginRight: "10px",
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Find hospital{" "}
        </button>

        <button
          onClick={() =>
            handleMarkDelivered(requestId, carId)
          }
          disabled={isButtonDisabled}

          style={{
            padding: "10px 20px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Mark as Delivered
        </button>
      </div>
    </div>
  );
};

export default DriverMap;
