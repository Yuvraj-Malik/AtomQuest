import { NextResponse } from 'next/server';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '@/lib/backendDb';
import { triggerNotification } from '@/lib/notifications';

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const all = searchParams.get('all') === 'true';

    const notifs = getNotifications();

    if (all) {
      return NextResponse.json(notifs);
    }

    if (!email) {
      return NextResponse.json({ error: "Email query parameter is required" }, { status: 400 });
    }

    // Filter notifications for the given recipient email
    const filtered = notifs.filter(
      n => n.recipient_email?.toLowerCase() === email.toLowerCase()
    );

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("API Notifications GET error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { recipientId, recipientEmail, type, event, subject, body: msgBody, deepLink } = body;

    const notif = await triggerNotification({
      recipientId,
      recipientEmail,
      type,
      event,
      subject,
      body: msgBody,
      deepLink
    });

    return NextResponse.json(notif);
  } catch (error) {
    console.error("API Notifications POST error:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, markAll, email } = body;

    if (markAll && email) {
      markAllNotificationsAsRead(email);
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
    }

    const updated = markNotificationAsRead(id);
    if (!updated) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("API Notifications PUT error:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
