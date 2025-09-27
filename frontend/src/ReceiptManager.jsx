import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReceiptManager() {
  const navigate = useNavigate();

  // Redirect to the new receipt list page
  useEffect(() => {
    navigate('/receipts');
  }, [navigate]);

  // This component is now just a redirect wrapper
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b border-neon-blue mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting to receipt list...</p>
        </div>
      </div>
    </div>
  );
}
