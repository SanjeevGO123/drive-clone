// This file defines the AWS Lambda function handler for deleting a folder and its contents from S3.
// The function expects an HTTP POST request with a JSON body containing userId, prefix (optional), and folderName.

// Key Features:
// - Deletes all objects under the specified folder in S3.
// - Returns a success response if the folder and its contents are deleted successfully.

// Environment Variables:
// - BUCKET_NAME: The name of the S3 bucket.

// Steps:
// 1. Parse the request body to extract userId, prefix, and folderName.
// 2. Validate the input to ensure userId and folderName are provided.
// 3. Use the ListObjectsV2Command to list all objects under the folder.
// 4. Use the DeleteObjectsCommand to delete all listed objects.
// 5. Return a success response if the folder and its contents are deleted successfully.

// Error Handling:
// - Logs errors to the console.
// - Returns appropriate HTTP status codes and error messages.

import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";

const BUCKET_NAME = process.env.BUCKET_NAME;
const s3 = new S3Client({});

export const handler = async (event) => {
  try {
    const { userId, prefix, folderName } = JSON.parse(event.body || "{}");
    if (!userId || !folderName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing userId or folderName" }),
      };
    }
    // The folder prefix in S3
    const folderPrefix = `${userId}/${prefix || ""}${folderName}/`;

    // List all objects under the folder
    const listedObjects = await s3.send(
      new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: folderPrefix })
    );
    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      // Folder is empty or does not exist
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Folder deleted (empty or not found)" }),
      };
    }
    // Prepare objects for deletion
    const objectsToDelete = listedObjects.Contents.map((obj) => ({ Key: obj.Key }));
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: BUCKET_NAME,
        Delete: { Objects: objectsToDelete },
      })
    );
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Folder and contents deleted" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message || "Internal server error" }),
    };
  }
};
