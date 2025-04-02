import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom marker for farm location
const farmIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
  iconAnchor: [17, 34],
  popupAnchor: [1, -30],
});

// Custom marker for buyer's location
const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [1, -30],
});

function ProductLocation({ geoCoordinates, bidStatus }) {
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);

  if (!geoCoordinates?.latitude || !geoCoordinates?.longitude) {
    return <p className="text-gray-500">Location data not available.</p>;
  }
  const latitude = Number(geoCoordinates.latitude);
  const longitude = Number(geoCoordinates.longitude);

  // Function to calculate distance (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Get user's live location if bid is closed
  useEffect(() => {
    if (bidStatus === "Close" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userCoords);
  
          const dist = calculateDistance(
            latitude, longitude,
            userCoords.lat, userCoords.lng
          );
          setDistance(dist.toFixed(2));
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Location access denied. Please allow location access.");
        }
      );
    }
  }, [latitude, longitude, bidStatus]);
  

  if (bidStatus !== "Close") {
    return <p className="text-gray-500"> Map will be available once the bid is closed.</p>;
  }

  return (
    <div className="w-full h-[400px] mt-4">
      <MapContainer center={[latitude, longitude]} zoom={13} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Farm Location Marker */}
        <Marker position={[latitude, longitude]} icon={farmIcon}>
          <Popup>
            <h3 className="font-bold">📍 Farm Location</h3>
            <p>{geoCoordinates.address}</p>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              🗺️ Navigate via Google Maps
            </a>
          </Popup>
        </Marker>

        {/* Winner's Live Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <h3 className="font-bold">🏠 Your Location</h3>
              {distance && <p>🚗 {distance} km from the farm</p>}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default ProductLocation;
