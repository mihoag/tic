import React, { useState } from 'react';
import { authService } from '../../services/apiService';

const ApiTestComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDiagnostic = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      addResult('🚀 Starting API diagnostic...');
      
      // Test 1: Check environment
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      addResult(`📍 API Base URL: ${apiUrl}`);
      
      // Test 2: Test basic connectivity
      addResult('🔍 Testing basic connectivity...');
      try {
        const response = await fetch(`${apiUrl}/health`);
        addResult(`🏥 Health endpoint status: ${response.status}`);
        if (response.ok) {
          const text = await response.text();
          addResult(`✅ Health response: ${text}`);
        }
      } catch (error) {
        addResult(`❌ Health check failed: ${error}`);
      }
      
      // Test 3: Test CORS preflight
      addResult('🌐 Testing CORS preflight...');
      try {
        const response = await fetch(`${apiUrl}/auth/register`, {
          method: 'OPTIONS',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Request-Method': 'POST',
          },
        });
        addResult(`🔍 CORS preflight status: ${response.status}`);
        addResult(`🔍 CORS headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
      } catch (error) {
        addResult(`❌ CORS test failed: ${error}`);
      }
      
      // Test 4: Test actual registration
      addResult('📝 Testing registration endpoint...');
      try {
        await authService.register({
          username: `test_${Date.now()}`,
          email: `test_${Date.now()}@debug.com`,
          password: 'testpassword123',
          full_name: 'Debug Test User',
          role: 'USER'
        });
        addResult('✅ Registration test successful');
      } catch (error) {
        addResult(`❌ Registration failed: ${error}`);
      }
      
      addResult('🏁 Diagnostic complete');
      
    } catch (error) {
      addResult(`🚨 Diagnostic error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSimpleRequest = async () => {
    setIsLoading(true);
    addResult('🧪 Testing simple request...');
    
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: `simple_test_${Date.now()}`,
          email: `simple_${Date.now()}@test.com`,
          password: 'password123',
          full_name: 'Simple Test',
          role: 'USER'
        })
      });
      
      addResult(`📊 Response status: ${response.status}`);
      addResult(`📊 Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
      
      const text = await response.text();
      addResult(`📊 Response body: ${text}`);
      
    } catch (error) {
      addResult(`❌ Simple request failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">API Connection Debugger</h2>
      
      <div className="space-y-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Current Configuration</h3>
          <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL}</p>
          <p><strong>Frontend Origin:</strong> {window.location.origin}</p>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={runDiagnostic}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Running...' : 'Run Full Diagnostic'}
          </button>
          
          <button
            onClick={testSimpleRequest}
            disabled={isLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Simple Request'}
          </button>
          
          <button
            onClick={() => setResults([])}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Clear Results
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Debug Results</h3>
        <div className="bg-black text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
          {results.length === 0 ? (
            <p className="text-gray-500">Click "Run Full Diagnostic" to start testing...</p>
          ) : (
            results.map((result, index) => (
              <div key={index} className="mb-1">{result}</div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">💡 Common Solutions</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <strong>CORS Error:</strong> Backend needs to allow requests from {window.location.origin}</li>
          <li>• <strong>Network Error:</strong> Check if backend server is running</li>
          <li>• <strong>404 Error:</strong> Verify /auth/register endpoint exists</li>
          <li>• <strong>500 Error:</strong> Check backend logs for server errors</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiTestComponent;
