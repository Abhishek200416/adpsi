import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Navigation, MapPin, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

export default function GetDirections() {
  const [destination, setDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    // Automatically fetch user's current location on component mount
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setGettingLocation(true);
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred.';
        }
        setLocationError(errorMessage);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const openGoogleMaps = () => {
    if (!destination.trim()) {
      alert('Please enter a destination');
      return;
    }

    if (!currentLocation) {
      alert('Current location not available. Please allow location access.');
      return;
    }

    // Create Google Maps URL with directions
    const origin = `${currentLocation.lat},${currentLocation.lng}`;
    const dest = encodeURIComponent(destination);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;

    // Open in new tab
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="directions-page">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-3 rounded-xl">
              <Navigation className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-['Manrope'] text-slate-900" data-testid="directions-title">
                Get Directions
              </h1>
            </div>
          </div>
          <p className="text-slate-600 text-lg" data-testid="directions-subtitle">
            Navigate to your destination using Google Maps
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <MapPin className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold font-['Manrope'] text-blue-900 mb-2">Real-Time Navigation</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                Enter your destination and we'll open Google Maps with directions from your current location. 
                Make sure location access is enabled for the best experience.
              </p>
            </div>
          </div>
        </div>

        {/* Current Location Status */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold font-['Manrope'] mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-teal-600" />
            Your Location
          </h2>
          
          {gettingLocation && (
            <div className="flex items-center gap-3 text-blue-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Detecting your current location...</span>
            </div>
          )}

          {locationError && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium mb-1">Location Error</p>
                <p className="text-red-700 text-sm">{locationError}</p>
                <button
                  onClick={getCurrentLocation}
                  className="mt-3 text-sm text-red-700 hover:text-red-800 font-medium underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {currentLocation && !gettingLocation && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5">✓</div>
              <div className="flex-1">
                <p className="text-green-800 font-medium mb-1">Location detected</p>
                <p className="text-green-700 text-sm">
                  Latitude: {currentLocation.lat.toFixed(6)}, Longitude: {currentLocation.lng.toFixed(6)}
                </p>
                <button
                  onClick={getCurrentLocation}
                  className="mt-2 text-sm text-green-700 hover:text-green-800 font-medium underline"
                >
                  Refresh Location
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Destination Input */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 mb-6" data-testid="route-calculator">
          <h2 className="text-xl font-semibold font-['Manrope'] mb-4 flex items-center gap-2">
            <Navigation className="h-5 w-5 text-teal-600" />
            Enter Destination
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Where do you want to go?
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination address or place name"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                data-testid="destination-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    openGoogleMaps();
                  }
                }}
              />
              <p className="text-xs text-slate-500 mt-2">
                Examples: "Connaught Place, Delhi" or "India Gate" or "Saket Mall"
              </p>
            </div>

            <button
              onClick={openGoogleMaps}
              disabled={!destination.trim() || !currentLocation}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-full px-8 py-3 font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              data-testid="open-maps-button"
            >
              <ExternalLink className="h-5 w-5" />
              Open in Google Maps
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-xl font-semibold font-['Manrope'] mb-4">How It Works</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-teal-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-lg">1️⃣</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Allow Location Access</h4>
                <p className="text-sm text-slate-600">We automatically detect your current location for accurate directions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-lg">2️⃣</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Enter Destination</h4>
                <p className="text-sm text-slate-600">Type the address or place name where you want to go</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-emerald-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-lg">3️⃣</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Navigate with Google Maps</h4>
                <p className="text-sm text-slate-600">Click the button to open Google Maps in a new tab with turn-by-turn directions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
