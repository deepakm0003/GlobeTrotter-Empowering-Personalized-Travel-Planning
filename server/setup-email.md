# Email Setup Guide for GlobeTrotter

## 🔧 **Setup Instructions**

### **1. Gmail App Password Setup**

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Name it "GlobeTrotter"
   - Copy the generated 16-character password

### **2. Update Email Configuration**

Edit `server/config/email.js` and replace:
```javascript
auth: {
  user: 'your-email@gmail.com', // Replace with your Gmail
  pass: 'your-app-password'     // Replace with your app password
}
```

### **3. Test Email Configuration**

Run the test script:
```bash
node test-email.js
```

## 📧 **Email Features**

✅ **Beautiful HTML Email Template**  
✅ **Responsive Design**  
✅ **Security Warnings**  
✅ **Expiration Notice**  
✅ **Fallback Text Version**  
✅ **Professional Branding**  

## 🔒 **Security Features**

✅ **1-Hour Token Expiration**  
✅ **One-Time Use Tokens**  
✅ **Secure Token Generation**  
✅ **Audit Logging**  
✅ **No Email Disclosure**  

## 🚀 **Usage**

1. User requests password reset
2. System generates secure token
3. Beautiful email sent with reset link
4. User clicks link and resets password
5. Token marked as used

## 📝 **Logs**

All email activities are logged to `password_resets.json` for audit purposes.
