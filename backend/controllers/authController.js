import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import userModel from "../models/model.js";
import nodemailer from "nodemailer"
import dotenv from "dotenv"
import transporter from "../config/mailer.js"
import { EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE,WELCOME_TEMPLATE,MESSAGE_TEMPLATE, GOOGLE_TEMPLATE,NEW_DEVICE_ALERT_TEMPLATE,PASSWORD_CHANGE_NOTIFICATION_TEMPLATE } from "../config/emailTemplates.js";
import axios from 'axios';
import { oauth2Client } from '../utils/googleClient.js';
import crypto from 'crypto';
import geoip from 'geoip-lite';
import useragent from 'express-useragent';
import { deleteImage } from "./imageController.js";

// Location detection function with fallback
export async function getLocationInfo(ipAddress, latitude = null, longitude = null) {
  // Default location object
  const defaultLocation = {
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown',
      latitude: null,
      longitude: null
  };

  try {
      // Prioritize frontend-provided location if available
      if (latitude !== null && longitude !== null) {
          try {
              // Use OpenStreetMap Nominatim API for reverse geocoding with timeout
              const response = await axios.get(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                  { timeout: 5000 } // 5-second timeout
              );
              const data = response.data;

              return {
                  country: data.address?.country || 'Unknown',
                  city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
                  region: data.address?.state || 'Unknown',
                  latitude: parseFloat(latitude),
                  longitude: parseFloat(longitude)
              };
          } catch (geoError) {
              console.error('Reverse geocoding error with Nominatim:', geoError.message);
              if (geoError.code === 'ETIMEDOUT') {
                  console.warn('Nominatim request timed out');
              }

              // Optional: Add a secondary geocoding service (e.g., OpenCage) as a fallback
              /*
              try {
                  const openCageKey = process.env.OPENCAGE_API_KEY; // Add to .env
                  if (openCageKey) {
                      const response = await axios.get(
                          `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${openCageKey}`,
                          { timeout: 5000 }
                      );
                      const data = response.data.results[0];
                      return {
                          country: data.components.country || 'Unknown',
                          city: data.components.city || data.components.town || 'Unknown',
                          region: data.components.state || 'Unknown',
                          latitude: parseFloat(latitude),
                          longitude: parseFloat(longitude)
                      };
                  }
              } catch (openCageError) {
                  console.error('OpenCage geocoding error:', openCageError.message);
              }
              */

              // Fallback: Return coordinates with "Unknown" details
              return {
                  ...defaultLocation,
                  latitude: parseFloat(latitude),
                  longitude: parseFloat(longitude)
              };
          }
      }

      // Fallback to IP-based geolocation if no coordinates provided
      if (ipAddress === '127.0.0.1' || ipAddress === '::1') {
          return defaultLocation;
      }

      // Try IP-based geolocation using geoip
      const geo = geoip.lookup(ipAddress);
      if (geo) {
          return {
              country: geo.country || 'Unknown',
              city: geo.city || 'Unknown',
              region: geo.region || 'Unknown',
              latitude: geo.ll ? geo.ll[0] : null,
              longitude: geo.ll ? geo.ll[1] : null
          };
      }

      // Return default location if IP lookup fails
      return defaultLocation;
  } catch (error) {
      console.error('Geolocation error:', error.message);
      return defaultLocation;
  }
}

// Enhanced device detection function
export function detectDeviceInfo(userAgent = '') {
    const deviceInfo = {
        device: 'Unknown Device',
        os: 'Unknown OS',
        browser: 'Unknown Browser'
    };

    // Convert to lowercase for case-insensitive matching
    userAgent = userAgent.toLowerCase();

    // Specific Postman detection (multiple approaches)
    if (
        userAgent.includes('postmanruntime') || 
        userAgent.includes('postman') || 
        // Check for common Postman headers or signatures
        userAgent.includes('postman-token') ||
        userAgent.match(/postman\/\d+\.\d+/i)
    ) {
        deviceInfo.device = 'API Testing Tool';
        deviceInfo.os = 'Postman Environment';
        deviceInfo.browser = 'Postman';
        return deviceInfo;
    }

    // Regular device and browser detection (as in previous example)
    const deviceDetectors = [
        { type: 'Mobile', keywords: ['mobile', 'android', 'iphone', 'ios'] },
        { type: 'Desktop', keywords: ['windows', 'mac', 'linux', 'x11'] }
    ];

    const osDetectors = [
        { name: 'Android', keywords: ['android'] },
        { name: 'iOS', keywords: ['iphone', 'ipad', 'ipod'] },
        { name: 'Windows', keywords: ['windows', 'win32'] },
        { name: 'macOS', keywords: ['mac', 'darwin'] },
        { name: 'Linux', keywords: ['linux', 'x11'] }
    ];

    const browserDetectors = [
        { name: 'Chrome', keywords: ['chrome', 'chromium'] },
        { name: 'Firefox', keywords: ['firefox', 'mozilla'] },
        { name: 'Safari', keywords: ['safari'] },
        { name: 'Edge', keywords: ['edge', 'edg'] },
        { name: 'Opera', keywords: ['opera', 'opr'] },
        { name: 'Brave', keywords: ['brave'] },
        { name: 'Tor', keywords: ['tor browser'] },
        { name: 'Internet Explorer', keywords: ['msie', 'trident'] },
        { name: 'Vivaldi', keywords: ['vivaldi'] },
        { name: 'Yandex', keywords: ['yandex'] }
    ];

    // Detect Device
    const deviceMatch = deviceDetectors.find(detector => 
        detector.keywords.some(keyword => userAgent.includes(keyword))
    );
    deviceInfo.device = deviceMatch ? deviceMatch.type : 'Unknown Device';

    // Detect OS
    const osMatch = osDetectors.find(detector => 
        detector.keywords.some(keyword => userAgent.includes(keyword))
    );
    deviceInfo.os = osMatch ? osMatch.name : 'Unknown OS';

    // Detect Browser
    const browserMatch = browserDetectors.find(detector => 
        detector.keywords.some(keyword => userAgent.includes(keyword))
    );
    deviceInfo.browser = browserMatch ? browserMatch.name : 'Unknown Browser';

    return deviceInfo;
}


// Secure device token generation
const generateDeviceToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name) return res.json({ success: false, message: 'Name is Required!' });
  if (!email) return res.json({ success: false, message: 'Email is Required!' });
  if (!password) return res.json({ success: false, message: 'Password is Required!' });

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) return res.json({ success: false, message: 'User already registered!' });

    const hashedPassword = await bcrypt.hash(password, 7);
    const user = new userModel({ name, email, password: hashedPassword });
    user.lastPasswordChange = new Date();
    await user.save();

    // Send verification email
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomBytes(32).toString('hex');
    user.verifyOtp = otp;
    user.verifyToken = token;
    user.verifyOtpExpiresAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    const mailOptionswel = { 
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Welcome to Finance Management App',
      html: WELCOME_TEMPLATE.replace("{{name}}",user.name).replace("{{email}}",user.email)
      // text: `<p>Welcome ${name},</p> <p>Your account has been successfully credited with $10Million.</p> <p>If not then contact your executive Jhaat Buddhi</p><p>Yours OHH FACK!!</p>`
    }
    await transporter.sendMail(mailOptionswel);

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Verify Your Email Address',
      html: EMAIL_VERIFY_TEMPLATE
        .replace('{{name}}', user.name)
        .replace('{{email}}', email)
        .replace('{{otp}}', otp)
        .replace('{{verifyLink}}', verifyLink),
    };
    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: 'User registered successfully! Please verify your email.',
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
    const { email, password, reclocation } = req.body;

    // Input validation
    if (!email) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email is Required!' 
        });
    }
    if (!password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Password is Required!' 
        });
    }

    try {
        // Find user
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found!' 
            });
        }

        if (user.isDeactivated) {
          // Reactivate the account
          user.isDeactivated = false;
          user.accountDeletionDate = null;
          
          // Send reactivation email
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Your Account Has Been Reactivated",
            html: `
              <h2>Account Reactivation</h2>
              <p>Hello ${user.name},</p>
              <p>Your account has been successfully reactivated!</p>
              <p>We've canceled the scheduled deletion of your account and all your data has been preserved.</p>
              <p>Thank you for choosing to stay with us.</p>
            `
          });
        }
        // Get IP and device information
        const ipAddress = req.headers['x-forwarded-for'] || 
            req.ip || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress || 
            req.connection.socket.remoteAddress || 
            '127.0.0.1';

        // Enhanced device and location detection
        const deviceInfo = detectDeviceInfo(req.headers['user-agent'] || 'Unknown');
        
        // Prepare location with fallback
        let location;
        if (reclocation && reclocation.latitude && reclocation.longitude) {
            location = await getLocationInfo(ipAddress, reclocation.latitude, reclocation.longitude);
        } else {
            location = await getLocationInfo(ipAddress);
        }

        // Prepare login entry
        const loginEntry = {
            loginAt: new Date(),
            ipAddress,
            device: deviceInfo.device,
            browser: deviceInfo.browser,
            operatingSystem: deviceInfo.os,
            location: location,
            isSuccessful: false,
            loginMethod: 'E-Mail'
        };

        // Generate device token
        const deviceToken = generateDeviceToken();

        // Prepare device token entry
        const deviceTokenEntry = {
            token: deviceToken,
            device: deviceInfo.device,
            lastUsed: new Date()
        };

        // Password verification
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            // Log failed login attempt
            loginEntry.isSuccessful = false;
            
            // Update user with failed login attempt
            await userModel.findByIdAndUpdate(
                user._id,
                {
                    $push: { 
                        loginHistory: loginEntry 
                    },
                    $set: { 
                        lastLogin: null 
                    }
                },
                { 
                    new: true,
                    runValidators: true 
                }
            );
            
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials!' 
            });
        }

        // Successful login flow
        loginEntry.isSuccessful = true;

        // Find and update user with new login details
        const updatedUser = await userModel.findById(user._id);

        // Add login history
        updatedUser.loginHistory.push(loginEntry);
        if (updatedUser.loginHistory.length > 3) {
            updatedUser.loginHistory = updatedUser.loginHistory.slice(-3);
        }

        // Manage device tokens
        const existingDeviceTokenIndex = updatedUser.deviceTokens.findIndex(
          token => token.device === deviceInfo.device
        );

        if (existingDeviceTokenIndex !== -1) {
          // Update existing device token
          updatedUser.deviceTokens[existingDeviceTokenIndex] = deviceTokenEntry;
        } else {
          // Add new device token
          const loginTime = new Date().toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
          });

          // Format location string
          const locationString = `${location.city}, ${location.country}`;

          // Create email content
          const emailHtml = NEW_DEVICE_ALERT_TEMPLATE
              .replace('{{name}}', user.name)
              .replace('{{loginTime}}', loginTime)
              .replace('{{device}}', deviceInfo.device)
              .replace('{{browser}}', deviceInfo.browser)
              .replace('{{ipAddress}}', ipAddress)
              .replace('{{location}}', locationString)
              .replace('{{operatingSystem}}', deviceInfo.os)
              .replace(/https:\/\/yourwebsite\.com\/change-password/g, `${process.env.FRONTEND_URL}/email=${encodeURIComponent(user.email)}`)
              .replace(/https:\/\/yourwebsite\.com\/report-unauthorized-access/g, `${process.env.FRONTEND_URL}/report-unauthorized?email=${encodeURIComponent(user.email)}`);

          // Set up email options
          const mailOptions = {
              from: process.env.SENDER_EMAIL,
              to: user.email,
              subject: 'New Device Login !',
              html: emailHtml
          };

          // Send the email
          await transporter.sendMail(mailOptions);
          updatedUser.deviceTokens.push(deviceTokenEntry);
        }
        // Limit device tokens to last 3
        if (updatedUser.deviceTokens.length > 3) {
            updatedUser.deviceTokens = updatedUser.deviceTokens.slice(-3);
        }

        if(updatedUser.lastLogin === null) updatedUser.isFirstLogin=true;
        else updatedUser.isFirstLogin=false;
        // Update last login
        updatedUser.lastLogin = new Date();

        // Save the updated user
        await updatedUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_KEY, 
            { expiresIn: '24h' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true, 
            message: 'User logged in successfully!',
            user: {
                id: updatedUser._id,
                email: updatedUser.email,
                isAccountVerified:updatedUser.isAccountVerified,
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

export const googleAuth = async (req, res) => {
  const { code, latitude, longitude } = req.query;

  try {
      if (!code) {
          return res.status(400).json({ 
              success: false, 
              message: 'Google Authorization Code is Required!' 
          });
      }

      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      const userRes = await axios.get(
          `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
      );
      
      const { email, name, picture } = userRes.data;

      let user = await userModel.findOne({ email });
      const isNewUser = !user;

      if (!isNewUser&&user.isDeactivated) {
        // Reactivate the account
        user.isDeactivated = false;
        user.accountDeletionDate = null;
        
        // Send reactivation email
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Your Account Has Been Reactivated",
          html: `
            <h2>Account Reactivation</h2>
            <p>Hello ${user.name},</p>
            <p>Your account has been successfully reactivated!</p>
            <p>We've canceled the scheduled deletion of your account and all your data has been preserved.</p>
            <p>Thank you for choosing to stay with us.</p>
          `
        });
      }

      const ipAddress = req.headers['x-forwarded-for'] || 
          req.ip || 
          req.connection.remoteAddress || 
          req.socket.remoteAddress || 
          req.connection.socket.remoteAddress || 
          '127.0.0.1';

      const deviceInfo = detectDeviceInfo(req.headers['user-agent'] || 'Unknown');
      
      const location = await getLocationInfo(
          ipAddress, 
          latitude ? parseFloat(latitude) : null, 
          longitude ? parseFloat(longitude) : null
      );

      const loginEntry = {
          loginAt: new Date(),
          ipAddress,
          device: deviceInfo.device,
          browser: deviceInfo.browser,
          operatingSystem: deviceInfo.os,
          location: location,
          isSuccessful: true,
          loginMethod: 'Google'
      };

      const deviceToken = generateDeviceToken();
      const deviceTokenEntry = {
          token: deviceToken,
          device: deviceInfo.device,
          lastUsed: new Date()
      };

      if (!user) {
          user = await userModel.create({
              name,
              email,
              password: "none",
              isAccountVerified: true,
              image: picture,
              loginHistory: [loginEntry],
              deviceTokens: [deviceTokenEntry],
              lastLogin: new Date()
          });
      } else {
          const updatedUser = await userModel.findById(user._id);
          updatedUser.loginHistory.push(loginEntry);
          if (updatedUser.loginHistory.length > 3) {
              updatedUser.loginHistory = updatedUser.loginHistory.slice(-3);
          }

          const existingDeviceTokenIndex = updatedUser.deviceTokens.findIndex(
              token => token.device === deviceInfo.device
          );
  
          if (existingDeviceTokenIndex !== -1) {
             updatedUser.deviceTokens[existingDeviceTokenIndex] = deviceTokenEntry;
          } else {
                  const loginTime = new Date().toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
              });
  
              const locationString = `${location.city}, ${location.country}`;
              const emailHtml = NEW_DEVICE_ALERT_TEMPLATE
                  .replace('{{name}}', user.name)
                  .replace('{{loginTime}}', loginTime)
                  .replace('{{device}}', deviceInfo.device)
                  .replace('{{browser}}', deviceInfo.browser)
                  .replace('{{ipAddress}}', ipAddress)
                  .replace('{{location}}', locationString)
                  .replace('{{operatingSystem}}', deviceInfo.os)
                  .replace(/https:\/\/yourwebsite\.com\/change-password/g, `${process.env.FRONTEND_URL}/email=${encodeURIComponent(user.email)}`)
                  .replace(/https:\/\/yourwebsite\.com\/report-unauthorized-access/g, `${process.env.FRONTEND_URL}/report-unauthorized?email=${encodeURIComponent(user.email)}`);
  
              const mailOptions = {
                  from: process.env.SENDER_EMAIL,
                  to: user.email,
                  subject: 'New Device Login !',
                  html: emailHtml
              };
  
              await transporter.sendMail(mailOptions);
              updatedUser.deviceTokens.push(deviceTokenEntry);
          }

          if (updatedUser.deviceTokens.length > 3) {
              updatedUser.deviceTokens = updatedUser.deviceTokens.slice(-3);
          }

          updatedUser.lastLogin = new Date();
          await updatedUser.save();
          user = updatedUser;
      }

      const token = jwt.sign(
          { id: user._id }, 
          process.env.JWT_KEY, 
          { expiresIn: '24h' }
      );

      res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax',
          maxAge: 24 * 60 * 60 * 1000,
      });

      if (isNewUser) {
          const mailOptions = { 
              from: process.env.SENDER_EMAIL,
              to: email,
              subject: 'Welcome to Finance Management App',
              html: GOOGLE_TEMPLATE.replace("{{name}}", user.name).replace("{{email}}", user.email)
          };
          await transporter.sendMail(mailOptions);
          }

      return res.json({ 
          success: true, 
          message: 'User logged in successfully!', 
          user: {
              id: user._id,
              email: user.email,
              name: user.name,
              image: user.image
          },
          token
      });

  } catch (err) {
      console.error("Google Auth Error:", err.message);
      if (err.response && err.response.data) {
          return res.status(400).json({ 
              success: false, 
              message: "Google Authentication Failed",
              error: err.response.data 
          });
      }
      return res.status(500).json({ 
          success: false, 
          message: "Internal Server Error",
          error: err.message 
      });
  }
};

export const logout = async (req,res) => {
    res.clearCookie('token');
    return res.json({success:true,message:'User logged out successfully !'})
}

// In authController.js

// Modified sendVerifyOtp to support both OTP and link
export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found!' });
    if (user.isAccountVerified) return res.json({ success: false, message: 'Account already verified!' });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');

    // Save OTP and token
    user.verifyOtp = otp;
    user.verifyToken = token;
    user.verifyOtpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Generate verification link
    const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    // Send email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Verify Your Email Address',
      html: EMAIL_VERIFY_TEMPLATE
        .replace('{{name}}', user.name)
        .replace('{{email}}', user.email)
        .replace('{{otp}}', otp)
        .replace('{{verifyLink}}', verifyLink)
    };
    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: 'Verification link and OTP sent to your email!', userId });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return res.status(500).json({ success: false, message: 'Error sending verification email. Please try again.' });
  }
};

// New function to verify email via token
export const verifyEmailToken = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await userModel.findOne({
      verifyToken: token,
      verifyOtpExpiresAt: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Verification link is invalid or has expired'
      });
    }

    // Mark account as verified
    user.isAccountVerified = true;
    user.verifyOtp = '';
    user.verifyToken = undefined;
    user.verifyOtpExpiresAt = undefined;
    await user.save();

    return res.json({
      success: true,
      message: 'Email verified successfully!',
      email: user.email
    });
  } catch (error) {
    console.error('Error verifying email token:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying email. Please try again.'
    });
  }
};

// Modified verifyOtp to handle both OTP and token verification
export const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.userId;

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found!' });
    if (user.isAccountVerified) return res.json({ success: false, message: 'Account already verified!' });
    if (!user.verifyOtp || !userId || !otp) return res.status(400).json({ success: false, message: 'Invalid request!' });

    if (user.verifyOtp !== otp || user.verifyOtp === '') {
      return res.status(400).json({ success: false, message: 'Invalid OTP!' });
    }
    if (user.verifyOtpExpiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP expired!' });
    }

    user.isAccountVerified = true;
    user.verifyOtp = '';
    user.verifyToken = undefined;
    user.verifyOtpExpiresAt = undefined;
    await user.save();

    return res.json({ success: true, message: 'Account verified successfully!' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ success: false, message: 'Error verifying OTP. Please try again.' });
  }
};

export const sendResetOtp = async (req,res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'If this email exists in our system, a reset link will be sent.' 
      });
    }
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Generate token for the reset link
    const token = crypto.randomBytes(32).toString('hex');
    
    // Save OTP and token to user record
    user.resetPasswordOtp = otp;
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    
    // Generate the reset link with token
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    
    // Send email
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Password Reset Request',
      html: PASSWORD_RESET_TEMPLATE
        .replace('{{name}}', user.name) 
        .replace('{{email}}', email)
        .replace('{{otp}}', otp)
        .replace('{{resetLink}}', resetLink)
    });
    
    return res.json({
      success: true,
      message: 'Password reset link has been sent to your email'
    });
  } catch (error) {
    console.error('Error sending reset OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'Error sending reset link. Please try again later.'
    });
  }
}

export const resetPassword = async (req,res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const pass=await bcrypt.hash(newPassword,7);
    
    // Find user
    const user = await userModel.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }
    
    // Reset password
    user.password = pass; // Assuming password hashing is done in the model's pre-save hook
    user.resetPasswordOtp = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    return res.json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({
      success: false,
      message: 'Error resetting password. Please try again.'
    });
  }
};

export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    // Find user with this token
    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired'
      });
    }
    
    // Return email and masked OTP for frontend to use
    return res.json({
      success: true,
      email: user.email,
      // Only return the last 2 digits of OTP for security
      otpHint: '****' + user.resetPasswordOtp.slice(-2)
    });
  } catch (error) {
    console.error('Error verifying reset token:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying token. Please try again.'
    });
  }
};

export const resetPasswordToken = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Find user with this token
    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired'
      });
    }
    
    const pass=await bcrypt.hash(newPassword,7);
    // Reset password
    user.password = pass; 
    user.resetPasswordOtp = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.lastPasswordChange = new Date(); // Update last password change date
    
    await user.save();
    
    return res.json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({
      success: false,
      message: 'Error resetting password. Please try again.'
    });
  }
};


export const isAuthenticated = async (req,res) => {
    try{
        return res.json({success:true,isAuthenticated:true,message:'Logged In',user:req.user})
    }
    catch (error) {
        return res.json({success:false,message: error.message})
    }
}

export const sendMessage = async (req,res) => {
    const {email,message} = req.body;
    
    const mailist=[
        email,
        process.env.SENDER_EMAIL,
    ]
    try{
        const mailOptions = { 
            from: process.env.SENDER_EMAIL,
            to: mailist,
            subject: 'Message from '+ email,
            // text: `Hello ${user.name}, Your OTP for account verification is ${otp}.`
            html: MESSAGE_TEMPLATE.replace("{{message}}",message).replace("{{email}}",email)
        }
        await transporter.sendMail(mailOptions);
    
        res.json({success:true,message:'Message sent successfully !'})
        
    }
    catch (error) {
        return res.json({success:false,message: error.message})
    }
}

// Check premium status
export const checkPremiumStatus = async (req, res) => {
    try {
        const userId = req.userId; // From auth middleware
        
        // Check if user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found!' });
        }
        
        // Check if trial or subscription has expired
        const now = new Date();
        
        if (user.subscriptionType === 'trial' && user.trialEndDate < now) {
            // Trial has expired
            user.isPremium = false;
            user.subscriptionType = 'none';
            await user.save();
            
            return res.json({ 
                success: true, 
                isPremium: false, 
                message: 'Your free trial has expired!' 
            });
        } else if ((user.subscriptionType === 'monthly' || user.subscriptionType === 'annual') && 
                   user.subscriptionEndDate < now) {
            // Paid subscription has expired
            user.isPremium = false;
            user.subscriptionType = 'none';
            await user.save();
            
            return res.json({ 
                success: true, 
                isPremium: false, 
                message: 'Your premium subscription has expired!' 
            });
        }
        
        // Return premium status
        return res.json({ 
            success: true, 
            isPremium: user.isPremium,
            subscriptionType: user.subscriptionType,
            trialEndDate: user.trialEndDate,
            subscriptionEndDate: user.subscriptionEndDate,
            daysRemaining: user.subscriptionType === 'trial' 
                ? Math.ceil((user.trialEndDate - now) / (1000 * 60 * 60 * 24))
                : Math.ceil((user.subscriptionEndDate - now) / (1000 * 60 * 60 * 24))
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Add these functions to your authController.js
export const updateOnboardingData = async (req, res) => {
    try {
      const { onboardingData } = req.body;
      const userId = req.userId; // From auth middleware
  
      // Check if user exists
      const user = await userModel.findById(userId);
      if (!user) {
        return res.json({
          success: false,
          message: "User not found",
        });
      }
  
      // Validate incoming data
      if (!onboardingData || typeof onboardingData !== 'object') {
        return res.json({
          success: false,
          message: "Invalid onboarding data",
        });
      }
  
      // Format fields with fallbacks to existing values
      const formattedIncomeSources = Array.isArray(onboardingData.customIncomeCategories) // Fix: Use customIncomeCategories
        ? onboardingData.customIncomeCategories.map((source) =>
            typeof source === "string" ? { name: source } : source
          )
        : user.onboardingData?.customIncomeCategories || [];
  
      const formattedExpenses = Array.isArray(onboardingData.customExpenseCategories) // Fix: Use customExpenseCategories
        ? onboardingData.customExpenseCategories.map((expense) =>
            typeof expense === "string" ? { name: expense } : expense
          )
        : user.onboardingData?.customExpenseCategories || [];
  
      const formattedFinancialGoals = Array.isArray(onboardingData.financialGoals)
        ? onboardingData.financialGoals.map((goal) =>
            typeof goal === "object" && goal.name ? goal.name : goal
          )
        : user.onboardingData?.financialGoals || [];
  
      const formattedHabits = Array.isArray(onboardingData.financialHabits)
        ? onboardingData.financialHabits.map((habit) =>
            typeof habit === "object" && habit.name ? habit.name : habit
          )
        : user.onboardingData?.financialHabits || [];
  
      const formattedInvestmentTypes = Array.isArray(onboardingData.investmentTypes)
        ? onboardingData.investmentTypes.map((type) =>
            typeof type === "object" && type.name ? type.name : type
          )
        : user.onboardingData?.investmentTypes || [];
  
      // Update onboarding data with fallbacks
      user.onboardingData = {
        employmentStatus:
          onboardingData.employmentStatus !== undefined
            ? onboardingData.employmentStatus
            : user.onboardingData?.employmentStatus || null,
        yearlyIncome:
          onboardingData.yearlyIncome !== undefined
            ? Number(onboardingData.yearlyIncome)
            : user.onboardingData?.yearlyIncome || 0,
        customIncomeCategories: formattedIncomeSources, // Correct field
        customExpenseCategories: formattedExpenses, // Correct field
        financialGoals: formattedFinancialGoals,
        financialHabits: formattedHabits,
        isCurrentlyInvesting:
          onboardingData.isCurrentlyInvesting !== undefined
            ? onboardingData.isCurrentlyInvesting
            : user.onboardingData?.isCurrentlyInvesting || false,
        investmentTypes: formattedInvestmentTypes,
        wantsInvestmentRecommendations:
          onboardingData.wantsInvestmentRecommendations !== undefined
            ? onboardingData.wantsInvestmentRecommendations
            : user.onboardingData?.wantsInvestmentRecommendations || false,
        savingsGoal:
          onboardingData.savingsGoal !== undefined
            ? Number(onboardingData.savingsGoal)
            : user.onboardingData?.savingsGoal || 0,
        riskLevel:
          onboardingData.riskLevel !== undefined
            ? onboardingData.riskLevel
            : user.onboardingData?.riskLevel || "Moderate",
      };
  
      // Only set isOnboardingComplete to true if it’s not already true and data is provided
      if (!user.isOnboardingComplete && Object.keys(onboardingData).length > 0) {
        user.isOnboardingComplete = true;
      }
  
      await user.save();
  
      return res.json({
        success: true,
        message: "Financial data updated successfully",
        user: {
          name: user.name,
          email: user.email,
          isOnboardingComplete: user.isOnboardingComplete,
          onboardingData: user.onboardingData,
        },
      });
    } catch (error) {
      console.error("Update error:", error);
      return res.json({
        success: false,
        message: "Error updating financial data",
        error: error.message,
      });
    }
  };

export const updateProfile = async (req,res)=> {
    
    const userId = req.userId;
    const {email,name,age,phone,address} = req.body;

    try {
        const user = await userModel.findById(userId);
        if(!user) return res.json({success:false,message:'User not found !'})
        
        user.name = name;
        user.email=email;
        user.age=age;
        user.phone=phone;
        user.address=address;
        await user.save();

        return res.json({success:true, message:'User profile Updated successfully !',user})
    } catch (error) {
        return res.json({success:false,message: error.message})
    }
}

// Change Password API
export const changePassword = async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.userId; // Assuming you have middleware to extract user from token
  
      // Validation checks
      if (!currentPassword) {
        return res.json({
          success: false,
          message: 'Current password is required'
        });
      }
  
      if (!newPassword) {
        return res.json({
          success: false,
          message: 'New password is required'
        });
      }
  
      // Find the user
      const user = await userModel.findById(userId);
      if (!user) {
        return res.json({
          success: false,
          message: 'User not found'
        });
      }
  
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
  
      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 7);
  
      // Update user password
      user.password = hashedNewPassword;
      user.lastPasswordChange = new Date();
      await user.save();
      const ipAddress = req.headers['x-forwarded-for'] || 
      req.ip || 
      req.connection.remoteAddress || 
      req.socket.remoteAddress || 
      req.connection.socket.remoteAddress || 
      '127.0.0.1';

  // Enhanced device and location detection
    const deviceInfo = detectDeviceInfo(req.headers['user-agent'] || 'Unknown');
  
  // Prepare location with fallback
    let location;
        location = await getLocationInfo(ipAddress);
        const locationString = `${location.city}, ${location.country}`;
      // Send password change notification email
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: 'Password Changed Successfully',
        html: PASSWORD_CHANGE_NOTIFICATION_TEMPLATE
          .replace('{{name}}', user.name)
          .replace('{{changeTime}}', new Date().toLocaleString())
          .replace('{{device}}', deviceInfo.device|| 'Unknown')
          .replace('{{browser}}', deviceInfo.browser || 'Unknown')
          .replace('{{ipAddress}}', ipAddress || 'Unknown')
          .replace('{{location}}', locationString||'Unknown')
          .replace('{{os}}', deviceInfo.os||'Unknown')
      };
      await transporter.sendMail(mailOptions);
  
      return res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      return res.json({
        success: false,
        message: 'An error occurred while changing password',
        error: error.message,
        
      });
    }
  };
  
  // Middleware to check password reset cooldown
  export const checkPasswordResetCooldown = async (req, res, next) => {
    try {
      const userId = req.userId;
      const user = await userModel.findById(userId);
  
      // Check if last password change was less than 24 hours ago
      if (user.lastPasswordChange) {
        const lastChangeTime = new Date(user.lastPasswordChange);
        const currentTime = new Date();
        const hoursSinceLastChange = (currentTime - lastChangeTime) / (1000 * 60 * 60);
  
        if (hoursSinceLastChange < 24) {
          return res.json({
            success: false,
            message: `You can change your password again after ${Math.ceil(24 - hoursSinceLastChange)} hours`
          });
        }
      }
  
      next();
    } catch (error) {
      return res.json({
        success: false,
        message: 'Error checking password reset cooldown',
        error: error.message
      });
    }
  };
  
  export const updateProfilePic = async (req, res) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided"
        });
      }
  
      // Get the file URL and public_id set by the uploadImage middleware
      const profilePicUrl = req.fileUrl;
      const profilePicPublicId = req.filePublicId;
      
      // Get current user to check if they have an existing profile picture
      const currentUser = await userModel.findById(req.userId);
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
  
      // If user already has a profile picture, delete it from Cloudinary
      if (currentUser.image && currentUser.imagePublicId) {
        await deleteImage(currentUser.imagePublicId);
      }
      
      // Update user's profile picture in the database
      const updatedUser = await userModel.findByIdAndUpdate(
        req.userId,
        { 
          image: profilePicUrl,
          imagePublicId: profilePicPublicId
        },
        { new: true, select: "-password" }
      );
  
      return res.status(200).json({
        success: true,
        message: "Profile picture updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      return res.status(500).json({
        success: false,
        message: "Server error. Please try again later."
      });
    }
  };
  
  export const updateCategoryOrder = async (req, res) => {
    const userId = req.userId;
    const { categoryType, categories } = req.body;
  
    try {
      const user = await userModel.findById(userId);
      if (!user) {
        return res.json({ success: false, message: 'User not found!' });
      }
  
      if (!['income', 'expense'].includes(categoryType)) {
        return res.json({ success: false, message: 'Invalid category type.' });
      }
  
      const existingCategories = categoryType === 'income'
        ? user.onboardingData.customIncomeCategories
        : user.onboardingData.customExpenseCategories;

      if (!Array.isArray(categories) || categories.length !== existingCategories.length) {
        return res.json({ success: false, message: 'Number of categories mismatch.' });
      }
  
      // Validate and normalize categories
      const validatedCategories = categories.map((cat, index) => {
        if (!cat.name) {
          throw new Error(`Category at index ${index} missing name`);
        }
        return {
          _id: cat._id || existingCategories[index]?._id, // Use existing _id if missing
          name: cat.name
        };
      });
  
      const existingCategoryIds = existingCategories.map(cat => cat._id.toString());
      const inputCategoryIds = validatedCategories.map(cat => cat._id.toString());

      const allCategoriesExist = inputCategoryIds.every(id => id && existingCategoryIds.includes(id));
      if (!allCategoriesExist) {
        return res.json({ success: false, message: 'Some categories do not exist in the user\'s current categories.' });
      }
  
      if (categoryType === 'income') {
        user.onboardingData.customIncomeCategories = validatedCategories;
      } else {
        user.onboardingData.customExpenseCategories = validatedCategories;
      }
  
      await user.save();

      return res.json({
        success: true,
        message: `${categoryType} categories order updated successfully!`,
        user: user
      });
    } catch (error) {
      console.error('Error updating category order:', {
        message: error.message,
        stack: error.stack,
        requestBody: req.body
      });
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  
  export const addCategory = async (req, res) => {
    const userId = req.userId;
    const { categoryType, categoryName } = req.body;
  
    try {
      const user = await userModel.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found!' });
  
      const newCategory = { name: categoryName }; // _id will be auto-generated by MongoDB
      if (categoryType === 'income') {
        user.onboardingData.customIncomeCategories.push(newCategory);
      } else {
        user.onboardingData.customExpenseCategories.push(newCategory);
      }
  
      await user.save();
  
      const updatedCategories = categoryType === 'income'
        ? user.onboardingData.customIncomeCategories
        : user.onboardingData.customExpenseCategories;
      const addedCategory = updatedCategories[updatedCategories.length - 1];
  
      return res.status(201).json({
        success: true,
        message: `${categoryType} category added successfully!`,
        category: {
          _id: addedCategory._id.toString(), // Return _id as string
          name: addedCategory.name
        }
      });
    } catch (error) {
      console.error('Add category error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  
  export const editCategory = async (req, res) => {
    const userId = req.userId;
    const { categoryType, categoryId, newCategoryName } = req.body;
  
    try {
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found!' });
      }
  
      const categories = categoryType === 'income'
        ? user.onboardingData.customIncomeCategories
        : user.onboardingData.customExpenseCategories;
  
      const categoryToEdit = categories.find(cat => cat._id.toString() === categoryId.toString());
      if (!categoryToEdit) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
      }
  
      categoryToEdit.name = newCategoryName;
      await user.save();
  
      return res.status(200).json({
        success: true,
        message: `${categoryType} category updated successfully!`
      });
    } catch (error) {
      console.error('Edit category error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  
  export const deleteCategory = async (req, res) => {
    const userId = req.userId;
    const { categoryType, categoryId } = req.body;
  
    try {
      const user = await userModel.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found!' });
  
      const categories = categoryType === 'income'
        ? user.onboardingData.customIncomeCategories
        : user.onboardingData.customExpenseCategories;
  
      const categoryIndex = categories.findIndex(cat => cat._id.toString() === categoryId);

      if (categoryIndex === -1) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
      }
  
      categories.splice(categoryIndex, 1);
      await user.save();
  
      return res.status(200).json({
        success: true,
        message: `${categoryType} category deleted successfully!`
      });
    } catch (error) {
      console.error('Delete category error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  
