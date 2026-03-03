import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
  writeBatch,
  getCountFromServer,
  and,
  or
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Message Service – manages conversations and messages.
 */
export const messageService = {
  /**
   * Get the total number of unread messages for a user across all conversations.
   * @param {string} userId
   * @returns {Promise<number>}
   */
  getUnreadCount: async (userId) => {
    try {
      console.log('🔍 Fetching unread message count for user:', userId);

      // 1. Get all conversations where user is a participant
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', userId)
      );
      const convSnapshot = await getDocs(q);
      if (convSnapshot.empty) {
        console.log('ℹ️ No conversations found');
        return 0;
      }

      // 2. For each conversation, count unread messages
      let totalUnread = 0;
      for (const convDoc of convSnapshot.docs) {
        const messagesRef = collection(db, 'conversations', convDoc.id, 'messages');
        const unreadQ = query(
          messagesRef,
          where('senderId', '!=', userId),   // not sent by current user
          where('readBy', 'not-in', [[userId]]) // userId not in readBy array
        );
        const unreadSnapshot = await getCountFromServer(unreadQ);
        totalUnread += unreadSnapshot.data().count;
      }
      console.log(`✅ Total unread messages: ${totalUnread}`);
      return totalUnread;
    } catch (error) {
      console.error('❌ Error fetching unread message count:', error);
      return 0;
    }
  },

  /**
   * Real‑time listener for unread message count.
   * @param {string} userId
   * @param {function} callback
   * @returns {function} unsubscribe
   */
  onUnreadChange: (userId, callback) => {
    console.log('📡 Setting up real‑time listener for unread messages');

    // Listen to conversations changes
    const conversationsRef = collection(db, 'conversations');
    const q = query(conversationsRef, where('participants', 'array-contains', userId));

    const unsubscribeConversations = onSnapshot(q, async (snapshot) => {
      let totalUnread = 0;
      // We need to listen to each conversation's messages? This could be heavy.
      // Instead, we can rely on a denormalized field `unreadCount` per conversation for each user.
      // But that requires updates when messages are sent.
      // For simplicity, we'll recompute by querying each conversation's messages.
      // For better performance, consider adding a `unreadCount` map on the conversation document.
      // This is a basic implementation:
      const promises = snapshot.docs.map(async (convDoc) => {
        const messagesRef = collection(db, 'conversations', convDoc.id, 'messages');
        const unreadQ = query(
          messagesRef,
          where('senderId', '!=', userId),
          where('readBy', 'not-in', [[userId]])
        );
        const countSnapshot = await getCountFromServer(unreadQ);
        return countSnapshot.data().count;
      });
      const counts = await Promise.all(promises);
      totalUnread = counts.reduce((sum, c) => sum + c, 0);
      callback(totalUnread);
    }, (error) => {
      console.error('❌ Error in message listener:', error);
    });

    return unsubscribeConversations;
  },

  /**
   * Mark all messages in a conversation as read for a user.
   * @param {string} conversationId
   * @param {string} userId
   */
  markConversationAsRead: async (conversationId, userId) => {
    try {
      console.log('📌 Marking conversation as read:', conversationId);
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const q = query(
        messagesRef,
        where('senderId', '!=', userId),
        where('readBy', 'not-in', [[userId]])
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        console.log('ℹ️ No unread messages in this conversation');
        return;
      }
      const batch = writeBatch(db);
      snapshot.docs.forEach(msgDoc => {
        batch.update(msgDoc.ref, {
          readBy: [...(msgDoc.data().readBy || []), userId]
        });
      });
      await batch.commit();
      console.log('✅ Conversation marked as read');
      return { success: true };
    } catch (error) {
      console.error('❌ Error marking conversation as read:', error);
      throw new Error(`Failed to mark conversation as read: ${error.message}`);
    }
  },

  /**
   * Send a new message in a conversation.
   * @param {string} conversationId
   * @param {string} senderId
   * @param {string} content
   * @param {Array} participantIds
   */
  sendMessage: async (conversationId, senderId, content, participantIds) => {
    try {
      console.log('📤 Sending message in conversation:', conversationId);
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const message = {
        senderId,
        content,
        readBy: [senderId], // sender has read it
        sentAt: serverTimestamp(),
      };
      const docRef = await addDoc(messagesRef, message);

      // Update conversation's lastMessage
      const convRef = doc(db, 'conversations', conversationId);
      await updateDoc(convRef, {
        lastMessage: {
          content,
          senderId,
          sentAt: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Message sent:', docRef.id);
      return { id: docRef.id, ...message };
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  },

  /**
   * Get conversations for a user (with last message and participant info).
   * @param {string} userId
   * @param {Object} options
   * @returns {Promise<Array>}
   */
  getUserConversations: async (userId, options = {}) => {
    try {
      console.log('🔍 Fetching conversations for user:', userId);
      const { limit: resultLimit = 20 } = options;
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc'),
        limit(resultLimit)
      );
      const snapshot = await getDocs(q);
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate?.(),
        lastMessage: doc.data().lastMessage?.sentAt?.toDate?.(),
      }));
      console.log(`✅ Fetched ${conversations.length} conversations`);
      return conversations;
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      throw new Error(`Failed to fetch conversations: ${error.message}`);
    }
  },
};

export default messageService;