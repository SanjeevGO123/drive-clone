// This file defines the AWS Lambda function handler for creating a folder in S3 and storing its metadata in DynamoDB.
// The function expects an HTTP POST request with a JSON body containing folderName, prefix (optional), and userId.

// Key Features:
// - Creates a zero-byte object in S3 to represent a folder.
// - Stores metadata about the folder in DynamoDB.
// - Returns a response with the folder's S3 key and file ID.

// Clients:
// - S3Client: Used to interact with Amazon S3.
// - DynamoDBClient: Used to interact with Amazon DynamoDB.

// Environment Variables:
// - AWS_REGION: Specifies the AWS region for the clients.
// - BUCKET_NAME: The name of the S3 bucket.
// - METADATA_TABLE: The name of the DynamoDB table for storing metadata.

// Steps:
// 1. Parse the request body to extract folderName, prefix, and userId.
// 2. Validate the input to ensure folderName and userId are provided.
// 3. Generate a unique file ID and construct the S3 key for the folder.
// 4. Create a zero-byte object in S3 to represent the folder.
// 5. Store metadata about the folder in DynamoDB, including userId, fileId, folderName, S3 key, and timestamp.
// 6. Return a success response with the folder's S3 key and file ID.

// Error Handling:
// - Logs errors to the console.
// - Returns appropriate HTTP status codes and error messages.

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

// Clients
const s3 = new S3Client({ region: process.env.AWS_REGION });
const dynamoDb = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { folderName, prefix="",userId } = body;

    if (!folderName || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing folderName or userId" })
      };
    }

    const fileId = crypto.randomUUID();
    const s3Key = `${userId}/${prefix}${folderName}/`; // S3 "folder" path
    const timestamp = new Date().toISOString();

    // Step 1: Create a folder in S3 (zero-byte object with trailing slash)
    await s3.send(new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: s3Key
    }));

    // Step 2: Store metadata in DynamoDB
    await dynamoDb.send(new PutItemCommand({
      TableName: process.env.METADATA_TABLE,
      Item: {
        UserId: { S: userId },
        FileId: { S: fileId },
        Filename: { S: folderName },
        S3Key: { S: s3Key },
        UpdatedAt: { S: timestamp }
      }
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Folder created and metadata stored",
        fileId,
        s3Key
      })
    };

  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal Server Error" })
    };
  }
};
