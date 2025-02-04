import {
  ReceiveMessageCommand,
  DeleteMessageBatchCommand,
  type SQSClient,
} from '@aws-sdk/client-sqs';
import type { Database } from 'src/db/database';
import type { Client } from '@opensearch-project/opensearch';

export class UserRepository {
  constructor(private readonly db: Database, private readonly client: Client) {}

  async updateUserFollowerCount(userIds: string[]) {
    const users = await this.db
      .selectFrom('User')
      .where('id', 'in', userIds)
      .select(['id', 'followerCount'])
      .execute();

    const response = await this.client.bulk({
      index: 'user',
      body: users.flatMap((user) => [
        {
          update: {
            _id: user.id,
          },
        },
        {
          doc: {
            followerCount: user.followerCount,
          },
          doc_as_upsert: true,
        },
      ]),
    });

    console.log(response);
    return;
  }
}
