// Import the required AWS S3 client and command from the AWS SDK
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Define AWS credentials using environment variables
const awsCredentials = {
  accessKeyId: process.env.ACCESS_KEY, // Access Key ID
  secretAccessKey: process.env.SECRET_ACCESS_KEY, // Secret Access Key
  region: process.env.REGION // AWS Region
};

// Create a new S3 client instance with the specified region and credentials
const s3Client = new S3Client({ region: awsCredentials.region, credentials: awsCredentials });

// Define an async function to upload a file to S3
// S3Params contains the parameters needed for the S3 put operation such as the Bucket, Key, and Body
async function getUploadCommand(S3Params) {
  return s3Client.send(new PutObjectCommand(S3Params)); // Send the put object command using the S3 client
}

async function getDeleteCommand(S3Params) {
  return s3Client.send(new DeleteObjectCommand(S3Params))
}

// Export the upload function so it can be imported elsewhere in the application
export { getUploadCommand, getDeleteCommand }
