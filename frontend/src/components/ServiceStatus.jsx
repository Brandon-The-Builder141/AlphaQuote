import React, { useState, useEffect } from 'react';
import { checkServiceStatus, getServiceStatusMessage } from '../utils/serviceChecker';

export default function ServiceStatus({ compact = false }) {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const checkServices = async () => {
      setIsLoading(true);
      try {
        const serviceStatus = await checkServiceStatus();
        setStatus(serviceStatus);
      } catch (error) {
        console.error('Error checking service status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkServices();

    // Check every 30 seconds
    const interval = setInterval(checkServices, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-400">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neon-blue"></div>
        <span className="text-sm">Checking services...</span>
      </div>
    );
  }

  if (!status) return null;

  const messages = getServiceStatusMessage(status);
  const hasIssues = messages.some(msg => msg.type === 'warning');

  if (compact) {
    return (
      <div
        className={`flex items-center space-x-2 cursor-pointer ${hasIssues ? 'text-yellow-400' : 'text-green-400'}`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className={`w-2 h-2 rounded-full ${hasIssues ? 'bg-yellow-400' : 'bg-green-400'} ${hasIssues ? 'animate-pulse' : ''}`}></div>
        <span className="text-sm">
          {hasIssues ? `${messages.filter(m => m.type === 'warning').length} service(s) offline` : 'All services online'}
        </span>
        {showDetails && (
          <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-lg z-50 min-w-80">
            <ServiceStatusDetails messages={messages} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Service Status</h3>
        <div className={`w-3 h-3 rounded-full ${hasIssues ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
      </div>
      <ServiceStatusDetails messages={messages} />
    </div>
  );
}

function ServiceStatusDetails({ messages }) {
  return (
    <div className="space-y-3">
      {messages.map((msg, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
            msg.type === 'success' ? 'bg-green-400' :
              msg.type === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
          }`}></div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-white">{msg.service}</span>
              <span className={`text-sm px-2 py-1 rounded ${
                msg.type === 'success' ? 'bg-green-900 text-green-200' :
                  msg.type === 'warning' ? 'bg-yellow-900 text-yellow-200' : 'bg-red-900 text-red-200'
              }`}>
                {msg.type === 'success' ? 'Online' : 'Offline'}
              </span>
            </div>
            <p className="text-sm text-gray-300 mt-1">{msg.message}</p>
            {msg.solution && (
              <p className="text-xs text-gray-400 mt-1 font-mono bg-gray-700 px-2 py-1 rounded">
                {msg.solution}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

