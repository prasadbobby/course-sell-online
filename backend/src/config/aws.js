const AWS = require('aws-sdk');

// Check if AWS credentials are available
const isAwsConfigured = process.env.AWS_ACCESS_KEY && 
                        process.env.AWS_SECRET_KEY && 
                        process.env.AWS_REGION &&
                        process.env.AWS_BUCKET_NAME;

console.log('AWS S3 is configured:', isAwsConfigured);

let s3 = null;
if (isAwsConfigured) {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
  });
  
  s3 = new AWS.S3();
}

module.exports = {
  s3,
  isAwsConfigured
};