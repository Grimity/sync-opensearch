import {
  ReceiveMessageCommand,
  DeleteMessageBatchCommand,
  type SQSClient,
} from '@aws-sdk/client-sqs';
import type { Database } from 'src/db/database';
import type { Client } from '@opensearch-project/opensearch';

export class FeedRepository {
  constructor(private readonly db: Database, private readonly client: Client) {}

  async updateFeedPostCount(feedIds: string[]) {
    if (feedIds.length === 0) return;

    const feeds = await this.db
      .selectFrom('Feed')
      .where('id', 'in', feedIds)
      .select(['id', 'likeCount'])
      .execute();

    const response = await this.client.bulk({
      index: 'feed',
      body: feeds.flatMap((feed) => [
        {
          update: {
            _id: feed.id,
          },
        },
        {
          doc: {
            likeCount: feed.likeCount,
          },
        },
      ]),
    });

    console.log(response);

    return;
  }
}
