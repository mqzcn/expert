import React, { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'cookieConsentDismissed';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false); // Initialize to false, check localStorage in useEffect

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== 'undefined') {
      const consentDismissed = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (consentDismissed !== 'true') {
        setIsVisible(true); // Show banner only if not dismissed
      }
    }
  }, []);

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    }
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex items-center justify-between z-50 border-t border-gray-700">
      <p className="text-sm mr-4">
        We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
      </p>
      <button
        onClick={handleAccept}
        className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded text-sm"
      >
        Accept
      </button>
    </div>
  );
};

export default CookieBanner;
