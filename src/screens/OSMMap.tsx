// components/OSMMap.tsx
import React, { useRef, useState } from 'react';
import {  View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';

const OSMMap = ({ latitude, longitude }: { latitude: number; longitude: number }) => {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossorigin="anonymous"/>
        <style>
          body, html { 
            margin: 0; 
            padding: 0; 
            width: 100%; 
            height: 100%; 
            overflow: hidden;
          }
          #map { 
            width: 100%; 
            height: 100%; 
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          crossorigin="anonymous"></script>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            try {
              var map = L.map('map', {
                zoomControl: true,
                dragging: true,
                tap: false
              }).setView([${latitude}, ${longitude}], 15);

              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                noWrap: true
              }).addTo(map);

              var marker = L.marker([${latitude}, ${longitude}]).addTo(map)
                .bindPopup('Lokasi Observasi<br>Lat: ${latitude.toFixed(4)}<br>Lng: ${longitude.toFixed(4)}')
                .openPopup();

              // Fix for touch devices
              map.touchZoom.enable();
              map.doubleClickZoom.enable();
              map.scrollWheelZoom.enable();
              map.boxZoom.enable();
              map.keyboard.enable();
              
              // Notify React Native that map is loaded
              window.ReactNativeWebView.postMessage('mapLoaded');
            } catch (e) {
              window.ReactNativeWebView.postMessage('error:' + e.message);
            }
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ html }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        originWhitelist={['*']}
        onLoadEnd={() => setLoading(false)}
        onMessage={(event) => {
          const message = event.nativeEvent.data;
          if (message.startsWith('error:')) {
            console.error('Map Error:', message);
          }
        }}
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.7,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
});

export default OSMMap;