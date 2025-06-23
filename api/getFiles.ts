// This file defines the AWS Lambda function handler for fetching files and folders from S3.
// The function expects an HTTP GET request with query parameters userId and prefix (optional).

// Key Features:
// - Fetches files and folders under the specified prefix in S3.
// - Returns a response with the list of files and folders.

// Environment Variables:
// - BUCKET_NAME: The name of the S3 bucket.
// - FILE_URL: The base URL for accessing files in S3.

// Steps:
// 1. Parse the query parameters to extract userId and prefix.
// 2. Validate the input to ensure userId is provided.
// 3. Use the ListObjectsV2Command to list files and folders under the prefix.
// 4. Extract folders from CommonPrefixes and files from Contents.
// 5. Return a response with the list of files and folders.

// Error Handling:
// - Logs errors to the console.
// - Returns appropriate HTTP status codes and error messages.

import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3 = new S3Client({});
const BUCKET_NAME = process.env.BUCKET_NAME;

export const handler = async (event) => {
  try {
    const userId = event.queryStringParameters?.userId;
    let prefix = event.queryStringParameters?.prefix || "";
    if (!userId) {
      return { statusCode: 400, body: "Missing userId query parameter" };
    }

    // Normalize prefix to always start with userId
    prefix = `${userId}/${prefix}`.replace(/\/{2,}/g, "/");

    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      Delimiter: "/", // this enables "folder" grouping
    });

    const data = await s3.send(command);

    // Extract folders from CommonPrefixes
    const folders = (data.CommonPrefixes || []).map((cp) => {
      const fullPath = cp.Prefix;
      const folderName = (fullPath || "").slice(prefix.length).replace(/\/$/, ""); // remove trailing slash
      return folderName;
    });

    // Extract only files directly under current prefix
    const files = (data.Contents || [])
      .filter((obj) => {
        const key = obj.Key;
        const relativePath = (key || "").slice(prefix.length);
        return key !== prefix && !relativePath.includes("/");
      })
      .map((obj) => ({
        key: obj.Key,
        url: `https://${process.env.FILE_URL}/${obj.Key}`,
      }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ folders, files }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
