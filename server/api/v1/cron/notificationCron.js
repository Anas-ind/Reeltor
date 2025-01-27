import cron from 'node-cron';
import NotificationModel from '../../../models/notification';
import UserModel from '../../../models/user';

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    const currentTime = new Date();

    // Fetch queued notifications and populate recipients
    const queuedNotifications = await NotificationModel.find({
      status: 'QUEUED',
      isCritical: false // Skip critical (already handled)
    }).populate({
      path: 'recipients',
      select: 'availability'
    });

    for (const notification of queuedNotifications) {
      for (const recipient of notification.recipients) {
        // Check availability slots
        const isAvailable = recipient.availability.some(slot => {
          return currentTime >= slot.start && currentTime <= slot.end;
        });

        if (isAvailable) {
          // Update notification status
          await NotificationModel.updateOne(
            { _id: notification._id },
            { 
              status: 'SENT',
              deliveredAt: currentTime 
            }
          );
        }
      }
    }

    console.log(`Processed ${queuedNotifications.length} queued notifications`);
  } catch (error) {
    console.error('Cron job error:', error);
  }
});