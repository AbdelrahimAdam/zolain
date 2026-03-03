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
  getCountFromServer
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Notification Service – manages user notifications with real‑time updates.
 */
export const notificationService = {
  /**
   * Create a new notification for a user.
   * @param {string} userId - recipient's UID
   * @param {Object} data - { type, title, body, link? }
   */
  createNotification: async (userId, data) => {
    try {
      console.log('📨 Creating notification for user:', userId);
      const notificationRef = collection(db, 'notifications');
      const newNotif = {
        userId,
        type: data.type || 'info',
        title: data.title,
        body: data.body,
        link: data.link || null,
        read: false,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(notificationRef, newNotif);
      console.log('✅ Notification created:', docRef.id);
      return { id: docRef.id, ...newNotif };
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  },

  /**
   * Get the number of unread notifications for a user.
   * @param {string} userId
   * @returns {Promise<number>}
   */
  getUnreadCount: async (userId) => {
    try {
      console.log('🔍 Fetching unread notification count for user:', userId);
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      const snapshot = await getCountFromServer(q);
      const count = snapshot.data().count;
      console.log(`✅ Unread notifications: ${count}`);
      return count;
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      // Return 0 instead of throwing to keep UI functional
      return 0;
    }
  },

  /**
   * Mark a specific notification as read.
   * @param {string} notificationId
   */
  markAsRead: async (notificationId) => {
    try {
      console.log('📌 Marking notification as read:', notificationId);
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, { read: true });
      console.log('✅ Notification marked as read');
      return { success: true };
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  },

  /**
   * Mark all notifications for a user as read.
   * @param {string} userId
   */
  markAllAsRead: async (userId) => {
    try {
      console.log('📌 Marking all notifications as read for user:', userId);
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        console.log('ℹ️ No unread notifications');
        return;
      }
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });
      await batch.commit();
      console.log('✅ All notifications marked as read');
      return { success: true };
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
      throw new Error(`Failed to mark all as read: ${error.message}`);
    }
  },

  /**
   * Subscribe to real‑time unread count changes.
   * @param {string} userId
   * @param {function} callback - receives new count
   * @returns {function} unsubscribe
   */
  onUnreadChange: (userId, callback) => {
    console.log('📡 Setting up real‑time listener for unread notifications');
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const count = snapshot.size;
      console.log('📢 Unread notifications count updated:', count);
      callback(count);
    }, (error) => {
      console.error('❌ Error in notification listener:', error);
    });
    return unsubscribe;
  },

  /**
   * Get all notifications for a user (with pagination).
   * @param {string} userId
   * @param {Object} options - { limit, startAfter }
   * @returns {Promise<Array>}
   */
  getUserNotifications: async (userId, options = {}) => {
    try {
      console.log('🔍 Fetching notifications for user:', userId);
      const { limit: resultLimit = 20, startAfter: cursor } = options;
      let q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(resultLimit)
      );
      if (cursor) {
        q = query(q, startAfter(cursor));
      }
      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.(),
      }));
      console.log(`✅ Fetched ${notifications.length} notifications`);
      return notifications;
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }
  },
};

export default notificationService;