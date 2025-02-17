import type { Client } from '@opensearch-project/opensearch';

export class UserRepository {
  constructor(private readonly client: Client) {}

  async updateUserFollowerCount(
    users: { id: string; followerCount: number }[]
  ) {
    if (users.length === 0) return;

    await this.client.bulk({
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
        },
      ]),
    });

    return;
  }
}
