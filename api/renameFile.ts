// This file defines the AWS Lambda function handler for renaming a file in S3 and updating its metadata in DynamoDB.
// The function expects an HTTP POST request with a JSON body containing userId, oldKey, and newFilename.

// Key Features:
// - Renames a file in S3 by copying it to a new key and deleting the old key.
// - Updates the file's metadata in DynamoDB.
// - Returns a success response if the file is renamed successfully.

// Environment Variables:
// - BUCKET_NAME: The name of the S3 bucket.
// - TABLE_NAME: The name of the DynamoDB table for storing metadata.

// Steps:
// 1. Parse the request body to extract userId, oldKey, and newFilename.
// 2. Validate the input to ensure userId, oldKey, and newFilename are provided.
// 3. Use the CopyObjectCommand to copy the file to the new key.
// 4. Use the DeleteObjectCommand to delete the old key.
// 5. Use the UpdateItemCommand to update the file's metadata in DynamoDB.
// 6. Return a success response if the file is renamed successfully.

// Error Handling:
// - Logs errors to the console.
// - Returns appropriate HTTP status codes and error messages.

import {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import {
  DynamoDBClient,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";

const s3 = new S3Client({});
const ddb = new DynamoDBClient({});
const BUCKET = process.env.BUCKET_NAME;
const TABLE = process.env.TABLE_NAME;

export const handler = async (event) => {
  try {
    const { userId, oldKey, newFilename } = JSON.parse(event.body);
    if (!userId || !oldKey || !newFilename) {
      return { statusCode: 400, body: "missing params" };
    }

    // derive new S3 key
    const pathParts = oldKey.split("/");
    pathParts[pathParts.length - 1] = newFilename;
    const newKey = pathParts.join("/");

    // 1) copy
    await s3.send(
      new CopyObjectCommand({
        Bucket: BUCKET,
        CopySource: `${BUCKET}/${oldKey}`,
        Key: newKey,
      })
    );
    // 2) delete old
    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: oldKey,
      })
    );
    // 3) update DynamoDB record
    await ddb.send(
      new UpdateItemCommand({
        TableName: TABLE,
        Key: {
          UserId: { S: userId },
          FileId: { S: oldKey }, // or however you identify the row
        },
        UpdateExpression: "SET Filename = :f, S3Key = :k",
        ExpressionAttributeValues: {
          ":f": { S: newFilename },
          ":k": { S: newKey },
        },
      })
    );

    return { statusCode: 200, body: JSON.stringify({ newKey }) };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};