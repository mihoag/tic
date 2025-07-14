import { authService } from '../apiService';

// API Debug Utilities
export class ApiDebugger {
  static async testConnection() {
    console.log('🔍 Testing API Connection...');
    
    // Test basic connectivity
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://pingbadge.tranvu.info';
    console.log('📍 Base URL:', baseUrl);
    
    try {
      // Test health endpoint first
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🏥 Health Check Response Status:', response.status);
      console.log('🏥 Health Check Response Headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.text();
        console.log('✅ Health Check Success:', data);
      } else {
        console.log('❌ Health Check Failed:', response.statusText);
      }
    } catch (error) {
      console.error('🚨 Health Check Error:', error);
    }
  }

  static async testCORS() {
    console.log('🌐 Testing CORS Configuration...');
    
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://pingbadge.tranvu.info';
    
    try {
      // Test preflight request
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        },
      });
      
      console.log('🔍 CORS Preflight Status:', response.status);
      console.log('🔍 CORS Preflight Headers:', Object.fromEntries(response.headers.entries()));
      
      // Check for CORS headers
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
      };
      
      console.log('🌐 CORS Headers:', corsHeaders);
      
      if (!corsHeaders['Access-Control-Allow-Origin']) {
        console.error('❌ CORS Issue: No Access-Control-Allow-Origin header found');
        console.log('💡 Solution: Configure your backend to include CORS headers');
      } else {
        console.log('✅ CORS Headers Present');
      }
      
    } catch (error) {
      console.error('🚨 CORS Test Error:', error);
    }
  }

  static async testRegistration() {
    console.log('📝 Testing Registration Endpoint...');
    
    const testData = {
      username: 'testuser_debug',
      email: 'debug@test.com',
      password: 'testpassword123',
      full_name: 'Debug Test User',
      role: 'USER' as const
    };
    
    try {
      console.log('📤 Sending Registration Request:', testData);
      const response = await authService.register(testData);
      console.log('✅ Registration Success:', response);
    } catch (error) {
      console.error('❌ Registration Failed:', error);
      
      // Provide specific error guidance
      if (error instanceof Error) {
        if (error.message.includes('CORS')) {
          console.log('💡 CORS Solution: Your backend needs to allow requests from http://localhost:3000');
        } else if (error.message.includes('Network')) {
          console.log('💡 Network Solution: Check if your backend server is running');
        } else if (error.message.includes('404')) {
          console.log('💡 Endpoint Solution: Verify the /auth/register endpoint exists on your backend');
        }
      }
    }
  }

  static async runFullDiagnostic() {
    console.log('🚀 Running Full API Diagnostic...');
    console.log('==================================');
    
    await this.testConnection();
    console.log('');
    await this.testCORS();
    console.log('');
    await this.testRegistration();
    
    console.log('==================================');
    console.log('🏁 Diagnostic Complete');
  }
}

// Export for easy use in browser console
declare global {
  interface Window {
    ApiDebugger: typeof ApiDebugger;
  }
}

window.ApiDebugger = ApiDebugger;
