import type { Client } from '@opensearch-project/opensearch';

export class FeedRepository {
  constructor(private readonly client: Client) {}

  async updateFeedPostCount(feeds: { id: string; likeCount: number }[]) {
    if (feeds.length === 0) return;

    await this.client.bulk({
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

    return;
  }
}
