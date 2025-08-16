# 🚗 CarTrace Pro - Vehicle Tracking & Recovery Platform

## 📋 Project Overview

CarTrace Pro is a community-powered vehicle tracking and recovery platform that helps users:
- Track their vehicles in real-time
- Report stolen vehicles to the community
- Assist in vehicle recovery efforts
- Manage vehicle information and alerts

## 🏗️ Project Structure

```
cartrace-pro/
├── index.html              # Main entry point/redirect page
├── cartrace_homepage.html   # Landing page with features
├── auth.html               # Login/Signup authentication
├── firebase-config.js      # Firebase configuration
├── database_helper.js      # Database utility functions
├── package.json           # Project dependencies
├── README.md              # This file
└── assets/                # Images, icons, etc.
```

## 🚀 Quick Start Guide

### Prerequisites
- A web browser
- Internet connection
- Firebase project (for backend)
- Basic text editor (VS Code recommended)

### 1. Set Up Firebase

1. **Go to [Firebase Console](https://console.firebase.google.com)**
2. **Create a new project** or select existing "CartTrace Pro" project
3. **Enable Authentication:**
   - Go to Authentication → Sign-in method
   - Enable "Email/Password" provider
4. **Set up Realtime Database:**
   - Go to Realtime Database
   - Click "Create Database"
   - Choose location closest to your users
   - Start in "Test mode" (change to production rules later)

### 2. Configure Firebase

Update your `firebase-config.js` with your project credentials:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 3. Local Development

1. **Download/Clone the project files**
2. **Fix file naming:** Rename `package-json.json` to `package.json`
3. **Open `cartrace_homepage.html`** in your browser to test locally
4. **Test authentication** by going to the auth page

### 4. Deploy to Web

#### Option A: Deploy to Netlify (Recommended - Free)

1. **Create account** at [netlify.com](https://netlify.com)
2. **Drag and drop** your project folder to Netlify
3. **Get your live URL** (e.g., `cartrace-pro.netlify.app`)
4. **Optional:** Connect your custom domain `mycartrace.com`

#### Option B: Deploy to Your Existing Domain

Since you already have `mycartrace.com`:

1. **Access your hosting control panel** (wherever you host mycartrace.com)
2. **Upload all files** to your web root directory
3. **Ensure `index.html`** is set as the default page
4. **Test the site** at mycartrace.com

## 🔧 File Explanations

### Core Files

- **`index.html`** - Main entry point, redirects to homepage
- **`cartrace_homepage.html`** - Main landing page with app features
- **`auth.html`** - User registration and login page
- **`firebase-config.js`** - Firebase setup and initialization
- **`database_helper.js`** - Functions for database operations

### Configuration Files

- **`package.json`** - Project metadata and dependencies
- **`README.md`** - This documentation file

## 🎯 Key Features

✅ **User Authentication** - Secure login/signup system  
✅ **Vehicle Management** - Add and track multiple vehicles  
✅ **Stolen Car Reporting** - Community-powered alerts  
✅ **Real-time Updates** - Live tracking and notifications  
✅ **Mobile Responsive** - Works on all devices  
✅ **Firebase Backend** - Reliable cloud database  

## 🛠️ Troubleshooting

### Common Issues

**1. Firebase Connection Errors**
- Check your Firebase config in `firebase-config.js`
- Ensure Database and Authentication are enabled
- Verify API keys are correct

**2. Page Not Loading**
- Check browser console for JavaScript errors
- Ensure all files are uploaded correctly
- Verify file permissions

**3. Authentication Not Working**
- Enable Email/Password in Firebase Authentication
- Check Firebase Security Rules
- Verify domain is authorized in Firebase

### Getting Help

1. **Check browser console** for error messages
2. **Verify Firebase setup** in the console
3. **Test locally first** before deploying
4. **Check file paths** are correct

## 📱 Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Internet Explorer (limited support)

## 🔐 Security Notes

- Change Firebase rules from "test mode" to production
- Use environment variables for sensitive data
- Implement proper user input validation
- Enable HTTPS for production deployment

## 📞 Support

For questions or issues:
- Check the troubleshooting section above
- Review Firebase documentation
- Test changes locally before deploying

---

**Last Updated:** August 2025  
**Version:** 1.0.0  
**Author:** CarTrace Pro Development Team