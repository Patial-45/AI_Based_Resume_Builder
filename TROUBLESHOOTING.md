# Troubleshooting Registration Issues

## Steps to Debug Registration

### 1. Check Browser Console
Open your browser's Developer Tools (F12) and check:
- **Console tab**: Look for any error messages
- **Network tab**: 
  - Find the `/auth/register` request
  - Check the request URL (should be `http://localhost:5000/api/auth/register`)
  - Check the response status code
  - Check the response body for error messages

### 2. Check Server Console
Look at your server terminal for:
- "=== REGISTER REQUEST ===" logs
- "Registration attempt:" logs
- Any error messages

### 3. Verify Environment Variables
Make sure `server/.env` has:
```env
JWT_SECRET=your-secret-key-here
MONGODB_URI=your-mongodb-connection-string
CLIENT_URL=http://localhost:5173
```

### 4. Test Endpoints
- Health check: `http://localhost:5000/api/health`
- Auth test: `http://localhost:5000/api/auth/test`

### 5. Common Issues

#### Issue: "Network Error" or "No response from server"
**Solution**: 
- Make sure server is running on port 5000
- Check if `VITE_API_URL` in `client/.env` is correct
- Verify CORS settings

#### Issue: "User with this email already exists"
**Solution**: 
- Try a different email
- Or delete the existing user from database

#### Issue: "Validation error"
**Solution**: 
- Make sure name is not empty
- Email must be valid format
- Password must be at least 6 characters

#### Issue: "Server configuration error"
**Solution**: 
- Check if `JWT_SECRET` is set in `server/.env`
- Restart the server after adding it

#### Issue: "Database connection error"
**Solution**: 
- Check if MongoDB is running
- Verify `MONGODB_URI` is correct
- Check MongoDB connection in server logs

### 6. Manual Test with curl
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

This will show you the exact error message from the server.


