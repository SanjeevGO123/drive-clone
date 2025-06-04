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
