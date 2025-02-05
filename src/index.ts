import * as dotenv from 'dotenv';
dotenv.config();
import { db } from './db/database';
import type { Handler } from 'aws-lambda';
import {
  ReceiveMessageCommand,
  DeleteMessageBatchCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { Client } from '@opensearch-project/opensearch';
import { UserRepository } from './repository/user.repository';
import { FeedRepository } from './repository/feed.repository';

const opensearchNode = process.env.AWS_OPENSEARCH_NODE;
const queueUrl = process.env.AWS_OPENSEARCH_SQS_URL;

if (opensearchNode === undefined || queueUrl === undefined) {
  throw new Error('env is not defined');
}

const opensearch = new Client({
  node: opensearchNode,
});
const sqs = new SQSClient();

const userRepository = new UserRepository(db, opensearch);
const feedRepository = new FeedRepository(db, opensearch);

export const handler: Handler = async () => {
  while (true) {
    const { Messages } = await sqs.send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 10,
      })
    );

    if (Messages === undefined || Messages.length === 0) {
      break;
    }

    let feedIds: string[] = [];
    let userIds: string[] = [];

    for (const message of Messages) {
      if (message.Body === undefined) {
        console.log('Message body is undefined');
        continue;
      }
      const body = JSON.parse(message.Body) as {
        type: 'USER' | 'FEED';
        id: string;
      };

      if (body.type === 'USER') {
        userIds.push(body.id);
      } else if (body.type === 'FEED') {
        feedIds.push(body.id);
      }
    }

    await Promise.all([
      userRepository.updateUserFollowerCount(userIds),
      feedRepository.updateFeedPostCount(feedIds),
    ]);

    await sqs.send(
      new DeleteMessageBatchCommand({
        QueueUrl: queueUrl,
        Entries: Messages.map((message) => {
          if (message.ReceiptHandle === undefined) {
            throw new Error('ReceiptHandle is undefined');
          }
          return {
            Id: message.MessageId,
            ReceiptHandle: message.ReceiptHandle,
          };
        }),
      })
    );

    if (Messages.length < 10) {
      break;
    }
  }
};
