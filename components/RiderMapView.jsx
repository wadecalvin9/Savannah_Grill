import React from 'react'
import { Platform, View } from 'react-native'
import { WebView } from 'react-native-webview'

// Default coordinates for Nairobi locations
const RESTAURANT = { lat: -1.3197, lng: 36.7065, name: 'Savannah Grill' }
const DEFAULT_DEST = { lat: -1.2921, lng: 36.7821, name: 'Customer Destination' }
const DEFAULT_RIDER = { lat: -1.3060, lng: 36.7450 }

export default function RiderMapView({
    riderLat,
    riderLng,
    destLat,
    destLng,
    destinationName = 'Delivery Address',
    height = 260,
}) {
    const currentRiderLat = riderLat || DEFAULT_RIDER.lat
    const currentRiderLng = riderLng || DEFAULT_RIDER.lng
    const currentDestLat = destLat || DEFAULT_DEST.lat
    const currentDestLng = destLng || DEFAULT_DEST.lng

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #FAFAFA; }
        .custom-pin {
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.25);
        }
        .restaurant-pin { background: #1C1C2E; width: 34px; height: 34px; color: #FE8C00; font-size: 18px; border: 2px solid #FE8C00; }
        .rider-pin { background: #FE8C00; width: 38px; height: 38px; color: #FFF; font-size: 20px; border: 2px solid #FFF; animation: pulse 2s infinite; }
        .dest-pin { background: #EF4444; width: 34px; height: 34px; color: #FFF; font-size: 18px; border: 2px solid #FFF; }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(254, 140, 0, 0.7); }
          70% { box-shadow: 0 0 0 12px rgba(254, 140, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(254, 140, 0, 0); }
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const restLat = ${RESTAURANT.lat};
        const restLng = ${RESTAURANT.lng};
        const riderLat = ${currentRiderLat};
        const riderLng = ${currentRiderLng};
        const destLat = ${currentDestLat};
        const destLng = ${currentDestLng};

        const map = L.map('map', { zoomControl: false, attributionControl: false }).setView([riderLat, riderLng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        // Icons
        const restIcon = L.divIcon({
          className: 'custom-pin restaurant-pin',
          html: '🏪',
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const riderIcon = L.divIcon({
          className: 'custom-pin rider-pin',
          html: '🛵',
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        });

        const destIcon = L.divIcon({
          className: 'custom-pin dest-pin',
          html: '📍',
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        // Markers
        L.marker([restLat, restLng], { icon: restIcon }).addTo(map).bindPopup('<b>Savannah Grill</b><br>Kitchen / Origin');
        const riderMarker = L.marker([riderLat, riderLng], { icon: riderIcon }).addTo(map).bindPopup('<b>Rider Location</b><br>Out for Delivery');
        L.marker([destLat, destLng], { icon: destIcon }).addTo(map).bindPopup('<b>' + ${JSON.stringify(destinationName)} + '</b><br>Delivery Destination');

        // Route Polyline (Restaurant -> Rider -> Destination)
        const pathCoords = [
          [restLat, restLng],
          [riderLat, riderLng],
          [destLat, destLng]
        ];
        L.polyline(pathCoords, { color: '#FE8C00', weight: 4, opacity: 0.8, dashArray: '8, 8' }).addTo(map);

        // Fit Bounds
        const bounds = L.latLngBounds(pathCoords);
        map.fitBounds(bounds, { padding: [40, 40] });
      </script>
    </body>
    </html>
    `

    if (Platform.OS === 'web') {
        return (
            <View style={{ height, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' }}>
                <iframe
                    srcDoc={htmlContent}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="Live Rider Tracking Map"
                />
            </View>
        )
    }

    return (
        <View style={{ height, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' }}>
            <WebView
                originWhitelist={['*']}
                source={{ html: htmlContent }}
                style={{ flex: 1 }}
                scrollEnabled={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
            />
        </View>
    )
}
