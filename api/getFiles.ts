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
      const folderName = fullPath.slice(prefix.length).replace(/\/$/, ""); // remove trailing slash
      return folderName;
    });

    // Extract only files directly under current prefix
    const files = (data.Contents || [])
      .filter((obj) => {
        const key = obj.Key;
        const relativePath = key.slice(prefix.length);
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
