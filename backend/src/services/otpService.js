// In a real application, this would integrate with an OTP service like Twilio
// For this example, we'll simulate the OTP functionality

const otpStore = {}; // In-memory storage for OTPs (use a database in production)

// Send OTP to mobile
exports.sendOtp = async (mobile) => {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Generate a request ID
  const requestId = Date.now().toString();
  
  // Store OTP with expiry time (15 minutes)
  otpStore[requestId] = {
    mobile,
    otp,
    expiresAt: Date.now() + 15 * 60 * 1000
  };
  
  // In a real application, you would send the OTP via SMS here
  console.log(`OTP for ${mobile}: ${otp}`);
  
  return { requestId };
};

// Verify OTP
exports.verifyOtp = async (requestId, otp) => {
  const otpData = otpStore[requestId];
  
  if (!otpData) {
    return { verified: false };
  }
  
  if (Date.now() > otpData.expiresAt) {
    delete otpStore[requestId];
    return { verified: false };
  }
  
  const isValid = otpData.otp === otp;
  
  if (isValid) {
    delete otpStore[requestId];
  }
  
  return { verified: isValid };
};