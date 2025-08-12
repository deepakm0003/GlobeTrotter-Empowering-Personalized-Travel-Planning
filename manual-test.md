# Manual Test Guide for Link Sharing

## Step 1: Verify Server is Running
1. Make sure your server is running on port 3001
2. Check that the database is accessible

## Step 2: Check Authentication
1. Open browser and go to your application
2. Make sure you're logged in
3. Open Developer Tools (F12)
4. Go to Application tab → localStorage
5. Verify there's a "token" key with a valid JWT token

## Step 3: Test JWT Token
1. In browser console, run:
```javascript
const token = localStorage.getItem('token');
fetch('/api/test-jwt', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## Step 4: Test Link Sharing
1. Go to your trips list
2. Click "Share" on any trip
3. Click "Generate Share Link"
4. Check browser console for any errors
5. Check Network tab for the API request

## Step 5: Expected Behavior
- Trip should be made public
- Database record should be created
- Share URL should be generated
- Success message should appear

## Common Error Messages and Solutions:

### "User ID is required"
- **Cause**: JWT token is missing or invalid
- **Solution**: Log out and log back in

### "Trip not found"
- **Cause**: Trip doesn't exist or doesn't belong to user
- **Solution**: Make sure you're using a valid trip ID

### "Failed to generate share link"
- **Cause**: Database error
- **Solution**: Check server logs for specific error

### Network Error
- **Cause**: Server not running or CORS issue
- **Solution**: Make sure server is running on correct port
