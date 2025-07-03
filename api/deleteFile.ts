// This file defines the AWS Lambda function handler for deleting a file from S3.
// The function expects an HTTP POST request with a JSON body containing userId and fileKey.

// Key Features:
// - Deletes the specified file from S3.
// - Returns a success response if the file is deleted successfully.

// Environment Variables:
// - BUCKET_NAME: The name of the S3 bucket.

// Steps:
// 1. Parse the request body to extract userId and fileKey.
// 2. Validate the input to ensure userId and fileKey are provided.
// 3. Use the DeleteObjectCommand to delete the file from S3.
// 4. Return a success response if the file is deleted successfully.

// Error Handling:
// - Logs errors to the console.
// - Returns appropriate HTTP status codes and error messages.

import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
  DynamoDBClient,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";

const BUCKET_NAME = process.env.BUCKET_NAME;
const TABLE_NAME = process.env.TABLE_NAME;
const s3 = new S3Client({});
const ddb = new DynamoDBClient({});

export const handler = async (event) => {
  try {
    const { userId, fileKey } = JSON.parse(event.body || "{}");
    if (!userId || !fileKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing userId or fileKey" }),
      };
    }
    // Delete the file from S3
    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
      })
    );
    
    // Delete the metadata record from DynamoDB
    await ddb.send(
      new DeleteItemCommand({
        TableName: TABLE_NAME,
        Key: {
          UserId: { S: userId },
          FileId: { S: fileKey },
        },
      })
    );
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "File deleted" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message || "Internal server error" }),
    };
  }
};
