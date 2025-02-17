import type { Handler } from 'aws-lambda';
import { Client } from '@opensearch-project/opensearch';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { UserRepository } from './repository/user.repository';
import { FeedRepository } from './repository/feed.repository';

const opensearchNode = process.env.AWS_OPENSEARCH_NODE;
const tableName = process.env.DYNAMODB_TABLE_NAME;
const dynamoDB = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(dynamoDB);

if (opensearchNode === undefined || tableName === undefined) {
  throw new Error('env is not defined');
}

const opensearch = new Client({
  node: opensearchNode,
});

const userRepository = new UserRepository(opensearch);
const feedRepository = new FeedRepository(opensearch);

export const handler: Handler = async () => {
  const response = await ddb.send(
    new ScanCommand({
      TableName: tableName,
    })
  );

  const users: { id: string; followerCount: number }[] = [];
  const feeds: { id: string; likeCount: number }[] = [];

  const items = (response.Items as { id: string; count: number }[]) ?? [];

  for (const item of items) {
    if (item.id.startsWith('USER')) {
      users.push({
        id: item.id.replace('USER#', ''),
        followerCount: item.count,
      });
    } else {
      feeds.push({
        id: item.id.replace('FEED#', ''),
        likeCount: item.count,
      });
    }
  }

  await Promise.all([
    userRepository.updateUserFollowerCount(users),
    feedRepository.updateFeedPostCount(feeds),
  ]);
};
