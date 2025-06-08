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