// create-admin.js

// Load environment variables
require('dotenv').config({ path: '../.env' });  // Adjust path if needed
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminEmail = 'admin@example.com';
const adminPassword = 'AdminPassword123';

// Log the MongoDB URI to verify it's loaded correctly
const mongoUri = process.env.MONGODB_URI;
console.log('MongoDB URI:', mongoUri ? 'Found' : 'Not found');

if (!mongoUri) {
  console.error('MongoDB URI is missing. Make sure the .env file exists and contains MONGODB_URI');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Hash password directly
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    // Create admin directly in the database
    const db = mongoose.connection;
    const usersCollection = db.collection('users');
    
    // Delete any existing admin with this email
    await usersCollection.deleteOne({ email: adminEmail });
    
    // Create new admin document
    const result = await usersCollection.insertOne({
      fullName: 'System Admin',
      email: adminEmail,
      passwordHash: hashedPassword,
      role: 'admin',
      creatorStatus: 'approved',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Admin created successfully:', result.insertedId);
    
    // Verify the password can be checked correctly
    const storedAdmin = await usersCollection.findOne({ email: adminEmail });
    const passwordMatch = await bcrypt.compare(adminPassword, storedAdmin.passwordHash);
    console.log('Password verification test:', passwordMatch ? 'Successful' : 'Failed');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });