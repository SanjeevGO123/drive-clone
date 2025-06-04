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