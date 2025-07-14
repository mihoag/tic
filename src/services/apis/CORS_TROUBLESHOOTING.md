# CORS Issue Troubleshooting Guide

## 🚨 **Current Issue**
```
Access to fetch at 'https://pingbadge.tranvu.info/auth/register' from origin 'http://localhost:3000' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🔍 **Root Cause Analysis**

The error indicates that your backend server at `https://pingbadge.tranvu.info` is not properly configured to handle CORS (Cross-Origin Resource Sharing) requests from your frontend development server at `http://localhost:3000`.

## 🛠️ **Solutions**

### **Solution 1: Fix Backend CORS Configuration (Recommended)**

#### **For Go Backend (Most Likely)**
Add CORS middleware to your Go backend. In your `main.go` or middleware setup:

```go
import (
    "github.com/rs/cors"
    // ... other imports
)

func main() {
    // ... your existing code

    // CORS configuration
    c := cors.New(cors.Options{
        AllowedOrigins: []string{
            "http://localhost:3000",     // Development
            "https://your-frontend.com", // Production (if different)
        },
        AllowedMethods: []string{
            "GET", "POST", "PUT", "DELETE", "OPTIONS",
        },
        AllowedHeaders: []string{
            "Content-Type", "Authorization", "X-Requested-With",
        },
        AllowCredentials: true,
    })

    // Wrap your handler with CORS middleware
    handler := c.Handler(yourHandler)
    
    log.Fatal(http.ListenAndServe(":8080", handler))
}
```

#### **Alternative Go CORS Setup**
If using Gin framework:

```go
import "github.com/gin-contrib/cors"

func main() {
    r := gin.Default()
    
    // CORS middleware
    r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000"},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Content-Type", "Authorization"},
        AllowCredentials: true,
    }))
    
    // ... your routes
}
```

### **Solution 2: Frontend Proxy Configuration (Development Only)**

#### **Vite Proxy Setup**
Add to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'https://pingbadge.tranvu.info',
        changeOrigin: true,
        secure: true,
      },
      '/api': {
        target: 'https://pingbadge.tranvu.info',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
```

Then update your API base URL for development:

```typescript
// In apiService.ts
const API_BASE_URL = import.meta.env.DEV 
  ? '' // Use proxy in development
  : 'https://pingbadge.tranvu.info'; // Direct connection in production
```

### **Solution 3: Environment-Specific Configuration**

Create different configurations for different environments:

#### **.env.development**
```env
VITE_API_BASE_URL=http://localhost:8080
```

#### **.env.production**
```env
VITE_API_BASE_URL=https://pingbadge.tranvu.info
```

## 🧪 **Testing & Debugging**

### **1. Use the Debug Utility**
Add this to your component to test the connection:

```typescript
import { ApiDebugger } from '../services/apis/debug';

// In your component or browser console:
ApiDebugger.runFullDiagnostic();
```

### **2. Manual CORS Testing**
Open browser developer tools and run:

```javascript
// Test if CORS headers are present
fetch('https://pingbadge.tranvu.info/auth/register', {
  method: 'OPTIONS',
  headers: {
    'Content-Type': 'application/json',
  }
}).then(response => {
  console.log('CORS Headers:', {
    'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
    'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
    'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
  });
});
```

### **3. Check Server Configuration**
Verify your backend server includes these headers in responses:

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

## 🚀 **Quick Fix Implementation**

### **Backend Fix (Go with Gin)**
```go
// Add this to your main.go
func CORSMiddleware() gin.HandlerFunc {
    return gin.HandlerFunc(func(c *gin.Context) {
        c.Header("Access-Control-Allow-Origin", "http://localhost:3000")
        c.Header("Access-Control-Allow-Credentials", "true")
        c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
        c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }

        c.Next()
    })
}

// Use it in your router
r.Use(CORSMiddleware())
```

## 📝 **Verification Steps**

1. **Backend Changes**: Update your backend with CORS configuration
2. **Restart Server**: Restart your backend server after making changes
3. **Test Registration**: Try registering a user from your frontend
4. **Check Headers**: Use browser dev tools to verify CORS headers are present
5. **Production Test**: Ensure it works in both development and production

## 🎯 **Expected Result**

After implementing the fix, you should see these headers in your network tab:

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

And your registration should work without CORS errors.

## 📞 **Still Having Issues?**

If the problem persists:

1. Check if your backend server is actually running
2. Verify the API endpoint exists (`/auth/register`)
3. Test with a simple curl request:
   ```bash
   curl -X POST https://pingbadge.tranvu.info/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"test","email":"test@test.com","password":"test123"}'
   ```
4. Check backend logs for any errors
5. Temporarily disable any firewall or security software

The most reliable solution is **Solution 1** - fixing the backend CORS configuration.
