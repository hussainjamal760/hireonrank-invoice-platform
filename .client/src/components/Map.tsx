"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

interface MapProps {
  location: { lat: number; lng: number };
  setLocation: (loc: { lat: number; lng: number }) => void;
}

function MapUpdater({ location }: { location: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (location.lat !== 0 && location.lng !== 0) {
      map.flyTo([location.lat, location.lng], 13, { animate: true });
    }
  }, [location.lat, location.lng, map]);
  return null;
}

function LocationMarker({ location, setLocation }: MapProps) {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return location.lat !== 0 && location.lng !== 0 ? (
    <Marker position={[location.lat, location.lng]} />
  ) : null;
}

export default function Map({ location, setLocation }: MapProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      if (location.lat === 0 && location.lng === 0) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          },
          () => {
            setLocation({ lat: 51.505, lng: -0.09 });
          }
        );
      }
    }
  }, []);

  const centerLat = location.lat === 0 ? 51.505 : location.lat;
  const centerLng = location.lng === 0 ? -0.09 : location.lng;

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={13}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapUpdater location={{ lat: centerLat, lng: centerLng }} />
      <LocationMarker location={{ lat: centerLat, lng: centerLng }} setLocation={setLocation} />
    </MapContainer>
  );
}
