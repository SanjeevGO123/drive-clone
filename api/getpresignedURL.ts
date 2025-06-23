// This file defines the AWS Lambda function handler for generating a presigned URL for uploading a file to S3.
// The function expects an HTTP POST request with a JSON body containing filename, filetype, and userId.

// Key Features:
// - Generates a presigned URL for uploading a file to S3.
// - Stores metadata about the file in DynamoDB.
// - Returns the presigned URL and metadata.

// Environment Variables:
// - BUCKET_NAME: The name of the S3 bucket.
// - TABLE_NAME: The name of the DynamoDB table for storing metadata.

// Steps:
// 1. Parse the request body to extract filename, filetype, and userId.
// 2. Validate the input to ensure filename, filetype, and userId are provided.
// 3. Use the PutObjectCommand to prepare the S3 upload.
// 4. Use getSignedUrl to generate the presigned URL.
// 5. Store metadata about the file in DynamoDB.
// 6. Return the presigned URL and metadata.

// Error Handling:
// - Logs errors to the console.
// - Returns appropriate HTTP status codes and error messages.

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";

const s3Client = new S3Client({});
const ddbClient = new DynamoDBClient({});

const BUCKET_NAME = process.env.BUCKET_NAME;
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing request body" }),
      };
    }

    const { filename, filetype, userId } = JSON.parse(event.body);

    if (!filename || !filetype || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required parameters" }),
      };
    }

    const fileId = crypto.randomUUID();
    const s3Key = `${userId}/${filename}`;

    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: filetype,
    });

    const uploadUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 600,
    });

    const putItemCmd = new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        UserId: { S: userId },
        FileId: { S: fileId },
        Filename: { S: filename },
        S3Key: { S: s3Key },
        UploadTimestamp: { S: new Date().toISOString() },
      },
    });

    await ddbClient.send(putItemCmd);

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl, key: s3Key }),
    };
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};