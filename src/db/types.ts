import type { ColumnType } from 'kysely';
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Feed = {
  id: string;
  authorId: string;
  title: string;
  cards: string[];
  thumbnail: string;
  isAI: Generated<boolean>;
  createdAt: Generated<Timestamp>;
  viewCount: Generated<number>;
  likeCount: Generated<number>;
  content: Generated<string>;
};
export type FeedComment = {
  id: string;
  feedId: string;
  writerId: string;
  parentId: string | null;
  content: string;
  mentionedUserId: string | null;
  createdAt: Generated<Timestamp>;
  likeCount: Generated<number>;
};
export type FeedCommentLike = {
  feedCommentId: string;
  userId: string;
};
export type Follow = {
  followerId: string;
  followingId: string;
};
export type Like = {
  userId: string;
  feedId: string;
  createdAt: Generated<Timestamp>;
};
export type Notification = {
  id: string;
  userId: string;
  type: string;
  actorId: string;
  actorName: string;
  feedId: string | null;
  isRead: Generated<boolean>;
  createdAt: Generated<Timestamp>;
};
export type Save = {
  userId: string;
  feedId: string;
  createdAt: Generated<Timestamp>;
};
export type Tag = {
  feedId: string;
  tagName: string;
};
export type User = {
  id: string;
  provider: string;
  providerId: string;
  email: string;
  name: string;
  image: string | null;
  description: Generated<string>;
  backgroundImage: string | null;
  links: string[];
  followerCount: Generated<number>;
  createdAt: Generated<Timestamp>;
};
export type View = {
  userId: string;
  feedId: string;
  createdAt: Generated<Timestamp>;
};
export type DB = {
  Feed: Feed;
  FeedComment: FeedComment;
  FeedCommentLike: FeedCommentLike;
  Follow: Follow;
  Like: Like;
  Notification: Notification;
  Save: Save;
  Tag: Tag;
  User: User;
  View: View;
};
