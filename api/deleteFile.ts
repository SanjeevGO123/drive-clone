import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const BUCKET_NAME = process.env.BUCKET_NAME;
const s3 = new S3Client({});

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
