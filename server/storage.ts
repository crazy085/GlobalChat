import { type User, type InsertUser, type Message, type InsertMessage, type Channel, type InsertChannel, type Reaction, type Notification } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(username: string, password: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  updateUserStatus(userId: string, status: string): Promise<void>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]>;
  getChannelMessages(channelId: string): Promise<Message[]>;
  markMessageAsRead(messageId: string): Promise<void>;
  
  // Channel methods
  createChannel(channel: InsertChannel): Promise<Channel>;
  getChannels(): Promise<Channel[]>;
  getUserChannels(userId: string): Promise<Channel[]>;
  getChannel(channelId: string): Promise<Channel | undefined>;
  addChannelMember(channelId: string, userId: string): Promise<void>;
  removeChannelMember(channelId: string, userId: string): Promise<void>;
  getChannelMembers(channelId: string): Promise<User[]>;
  
  // Reaction methods
  addReaction(messageId: string, userId: string, emoji: string): Promise<Reaction>;
  getMessageReactions(messageId: string): Promise<Reaction[]>;
  removeReaction(reactionId: string): Promise<void>;
  
  // Notification methods
  createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>;
  getNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  // Clear in-memory storage (no-op for persistent DB storage)
  clearAll(): Promise<void>;
}

export class MemStorage implements IStorage {
  // kept for fallback/testing but DB is preferred
  private users: Map<string, User>;
  private messages: Map<string, Message>;
  private channels: Map<string, Channel>;
  private channelMembers: Map<string, Set<string>>;
  private reactions: Map<string, Reaction>;
  private notifications: Map<string, Notification>;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.channels = new Map();
    this.channelMembers = new Map();
    this.reactions = new Map();
    this.notifications = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashed = await bcrypt.hash(insertUser.password, 10);
    const user: User = { ...insertUser, id, avatar: null, status: "offline", password: hashed } as unknown as User;
    this.users.set(id, user);
    return user;
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (user) {
      const match = await bcrypt.compare(password, (user as any).password);
      if (match) return user;
    }
    return null;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUserStatus(userId: string, status: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) user.status = status;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { ...insertMessage, id, timestamp: new Date(), read: false, receiverId: insertMessage.receiverId ?? null, channelId: insertMessage.channelId ?? null, fileUrl: null } as unknown as Message;
    this.messages.set(id, message);
    return message;
  }

  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (msg) => msg.channelId === null && ((msg.senderId === userId1 && msg.receiverId === userId2) || (msg.senderId === userId2 && msg.receiverId === userId1))
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async getChannelMessages(channelId: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter((msg) => msg.channelId === channelId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    const message = this.messages.get(messageId);
    if (message) message.read = true;
  }

  async createChannel(channel: InsertChannel): Promise<Channel> {
    const id = randomUUID();
    const newChannel: Channel = { ...channel, id, createdAt: new Date(), description: channel.description ?? null, isPrivate: channel.isPrivate ?? false } as unknown as Channel;
    this.channels.set(id, newChannel);
    this.channelMembers.set(id, new Set([channel.creatorId]));
    return newChannel;
  }

  async getChannels(): Promise<Channel[]> { return Array.from(this.channels.values()); }
  async getUserChannels(userId: string): Promise<Channel[]> { return Array.from(this.channels.values()).filter((ch) => this.channelMembers.get(ch.id)?.has(userId)); }
  async getChannel(channelId: string): Promise<Channel | undefined> { return this.channels.get(channelId); }
  async addChannelMember(channelId: string, userId: string): Promise<void> { const members = this.channelMembers.get(channelId); if (members) members.add(userId); }
  async removeChannelMember(channelId: string, userId: string): Promise<void> { const members = this.channelMembers.get(channelId); if (members) members.delete(userId); }
  async getChannelMembers(channelId: string): Promise<User[]> { const memberIds = this.channelMembers.get(channelId) || new Set(); return Array.from(memberIds).map((id) => this.users.get(id)).filter((u) => u !== undefined) as User[]; }
  async addReaction(messageId: string, userId: string, emoji: string): Promise<Reaction> { const id = randomUUID(); const reaction: Reaction = { id, messageId, userId, emoji, createdAt: new Date() } as unknown as Reaction; this.reactions.set(id, reaction); return reaction; }
  async getMessageReactions(messageId: string): Promise<Reaction[]> { return Array.from(this.reactions.values()).filter((r) => r.messageId === messageId); }
  async removeReaction(reactionId: string): Promise<void> { this.reactions.delete(reactionId); }
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> { const id = randomUUID(); const newNotif: Notification = { ...notification, id, createdAt: new Date() } as unknown as Notification; this.notifications.set(id, newNotif); return newNotif; }
  async getNotifications(userId: string): Promise<Notification[]> { return Array.from(this.notifications.values()).filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); }
  async markNotificationAsRead(notificationId: string): Promise<void> { const notif = this.notifications.get(notificationId); if (notif) notif.read = true; }

  async clearAll(): Promise<void> {
    this.users.clear();
    this.messages.clear();
    this.channels.clear();
    this.channelMembers.clear();
    this.reactions.clear();
    this.notifications.clear();
  }
}

export class PgStorage implements IStorage {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  private rowToUser(row: any): User {
    return {
      id: row.id,
      username: row.username,
      password: row.password,
      avatar: row.avatar ?? null,
      status: row.status ?? "offline",
    } as unknown as User;
  }

  async getUser(id: string): Promise<User | undefined> {
    const res = await this.pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    if (!res.rows.length) return undefined;
    return this.rowToUser(res.rows[0]);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const res = await this.pool.query(`SELECT * FROM users WHERE username = $1`, [username]);
    if (!res.rows.length) return undefined;
    return this.rowToUser(res.rows[0]);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashed = await bcrypt.hash(insertUser.password, 10);
    const res = await this.pool.query(
      `INSERT INTO users (id, username, password, avatar, status) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, insertUser.username, hashed, null, 'offline']
    );
    return this.rowToUser(res.rows[0]);
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    const match = await bcrypt.compare(password, (user as any).password);
    if (!match) return null;
    return user as User;
  }

  async getAllUsers(): Promise<User[]> {
    const res = await this.pool.query(`SELECT * FROM users`);
    return res.rows.map((r: any) => this.rowToUser(r));
  }

  async updateUserStatus(userId: string, status: string): Promise<void> {
    await this.pool.query(`UPDATE users SET status = $2 WHERE id = $1`, [userId, status]);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const res = await this.pool.query(
      `INSERT INTO messages (id, sender_id, receiver_id, channel_id, content, read, file_url) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [id, insertMessage.senderId, insertMessage.receiverId || null, insertMessage.channelId || null, insertMessage.content, false, null]
    );
    return res.rows[0] as Message;
  }

  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
    const res = await this.pool.query(
      `SELECT * FROM messages WHERE channel_id IS NULL AND ((sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1)) ORDER BY timestamp ASC`,
      [userId1, userId2]
    );
    return res.rows as Message[];
  }

  async getChannelMessages(channelId: string): Promise<Message[]> {
    const res = await this.pool.query(`SELECT * FROM messages WHERE channel_id=$1 ORDER BY timestamp ASC`, [channelId]);
    return res.rows as Message[];
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await this.pool.query(`UPDATE messages SET read = true WHERE id = $1`, [messageId]);
  }

  async createChannel(channel: InsertChannel): Promise<Channel> {
    const id = randomUUID();
    const res = await this.pool.query(
      `INSERT INTO channels (id, name, description, creator_id, created_at, is_private) VALUES ($1,$2,$3,$4,NOW(),$5) RETURNING *`,
      [id, channel.name, channel.description || null, channel.creatorId, channel.isPrivate || false]
    );
    // add creator as member
    await this.pool.query(`INSERT INTO channel_members (id, channel_id, user_id, joined_at) VALUES ($1,$2,$3,NOW())`, [randomUUID(), id, channel.creatorId]);
    return res.rows[0] as Channel;
  }

  async getChannels(): Promise<Channel[]> { const res = await this.pool.query(`SELECT * FROM channels`); return res.rows as Channel[]; }

  async getUserChannels(userId: string): Promise<Channel[]> {
    const res = await this.pool.query(`SELECT c.* FROM channels c JOIN channel_members cm ON cm.channel_id = c.id WHERE cm.user_id = $1`, [userId]);
    return res.rows as Channel[];
  }

  async getChannel(channelId: string): Promise<Channel | undefined> { const res = await this.pool.query(`SELECT * FROM channels WHERE id = $1`, [channelId]); if (!res.rows.length) return undefined; return res.rows[0] as Channel; }

  async addChannelMember(channelId: string, userId: string): Promise<void> { await this.pool.query(`INSERT INTO channel_members (id, channel_id, user_id, joined_at) VALUES ($1,$2,$3,NOW()) ON CONFLICT DO NOTHING`, [randomUUID(), channelId, userId]); }

  async removeChannelMember(channelId: string, userId: string): Promise<void> { await this.pool.query(`DELETE FROM channel_members WHERE channel_id=$1 AND user_id=$2`, [channelId, userId]); }

  async getChannelMembers(channelId: string): Promise<User[]> {
    const res = await this.pool.query(`SELECT u.* FROM users u JOIN channel_members cm ON cm.user_id = u.id WHERE cm.channel_id = $1`, [channelId]);
    return res.rows.map((r: any) => this.rowToUser(r));
  }

  async addReaction(messageId: string, userId: string, emoji: string): Promise<Reaction> {
    const id = randomUUID();
    const res = await this.pool.query(`INSERT INTO reactions (id, message_id, user_id, emoji, created_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING *`, [id, messageId, userId, emoji]);
    return res.rows[0] as Reaction;
  }

  async getMessageReactions(messageId: string): Promise<Reaction[]> { const res = await this.pool.query(`SELECT * FROM reactions WHERE message_id=$1`, [messageId]); return res.rows as Reaction[]; }

  async removeReaction(reactionId: string): Promise<void> { await this.pool.query(`DELETE FROM reactions WHERE id=$1`, [reactionId]); }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const id = randomUUID();
    const res = await this.pool.query(`INSERT INTO notifications (id, user_id, sender_name, message_preview, type, read, created_at) VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING *`, [id, notification.userId, notification.senderName, notification.messagePreview, notification.type || 'message', notification.read || false]);
    return res.rows[0] as Notification;
  }

  async getNotifications(userId: string): Promise<Notification[]> { const res = await this.pool.query(`SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC`, [userId]); return res.rows as Notification[]; }

  async markNotificationAsRead(notificationId: string): Promise<void> { await this.pool.query(`UPDATE notifications SET read=true WHERE id=$1`, [notificationId]); }

  // For Postgres storage we do not clear DB via this method to avoid accidental data loss.
  async clearAll(): Promise<void> {
    // no-op when using Postgres; use migrations or admin tools for DB wipes
    return Promise.resolve();
  }
}

// Export storage: prefer Postgres when DATABASE_URL is set, otherwise fall back to in-memory
const connection = process.env.DATABASE_URL;
export const storage: IStorage = connection ? new PgStorage(connection) : new MemStorage();
