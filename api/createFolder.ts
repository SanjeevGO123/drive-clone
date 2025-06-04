import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { fromEnv } from "@aws-sdk/credential-provider-env";

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
        UploadTimestamp: { S: timestamp }
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
