import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface DownloadLink {
  photoId: string;
  token: string;
}

// Send QR code access email to guest
export async function sendGalleryAccessEmail(
  email: string,
  accessCode: string,
  cruiseName: string,
  tableNumber: string
): Promise<void> {
  const galleryUrl = `${APP_URL}/gallery/${accessCode}`;

  await resend.emails.send({
    from: 'Cruise Photos <photos@yourdomain.com>',
    to: email,
    subject: `Your ${cruiseName} Photos Are Ready!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a365d;">Your Cruise Photos Are Ready!</h1>
        <p>Thank you for joining us on <strong>${cruiseName}</strong>!</p>
        <p>Your photos from <strong>${tableNumber}</strong> are now available to view and purchase.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${galleryUrl}"
             style="background-color: #3182ce; color: white; padding: 15px 30px;
                    text-decoration: none; border-radius: 5px; font-size: 18px;">
            View Your Photos
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">
          Or use this access code: <strong>${accessCode}</strong>
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <p style="color: #888; font-size: 12px;">
          Photos will be available for 30 days. Digital downloads are $14.99 each.
        </p>
      </div>
    `,
  });
}

// Send order confirmation with download links
export async function sendOrderConfirmationEmail(
  email: string,
  orderId: string,
  downloads: DownloadLink[],
  totalAmount: number
): Promise<void> {
  const downloadLinksHtml = downloads
    .map(
      (d, i) => `
      <li style="margin: 10px 0;">
        <a href="${APP_URL}/download/${d.token}" style="color: #3182ce;">
          Download Photo ${i + 1}
        </a>
      </li>
    `
    )
    .join('');

  await resend.emails.send({
    from: 'Cruise Photos <photos@yourdomain.com>',
    to: email,
    subject: 'Your Cruise Photos - Download Ready!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a365d;">Thank You for Your Purchase!</h1>

        <p>Order #${orderId}</p>
        <p>Total: $${(totalAmount / 100).toFixed(2)}</p>

        <h2 style="color: #2d3748;">Your Downloads</h2>
        <p>Click the links below to download your high-resolution photos:</p>

        <ul style="list-style: none; padding: 0;">
          ${downloadLinksHtml}
        </ul>

        <div style="background-color: #f7fafc; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #4a5568;">
            <strong>Important:</strong> Download links are valid for 7 days.
            Please save your photos to your device.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <p style="color: #888; font-size: 12px;">
          If you have any issues with your download, please reply to this email.
        </p>
      </div>
    `,
  });
}

// Send download link recovery email
export async function sendDownloadRecoveryEmail(
  email: string,
  downloads: DownloadLink[]
): Promise<void> {
  const downloadLinksHtml = downloads
    .map(
      (d, i) => `
      <li style="margin: 10px 0;">
        <a href="${APP_URL}/download/${d.token}" style="color: #3182ce;">
          Download Photo ${i + 1}
        </a>
      </li>
    `
    )
    .join('');

  await resend.emails.send({
    from: 'Cruise Photos <photos@yourdomain.com>',
    to: email,
    subject: 'Your Cruise Photos - Download Links',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a365d;">Your Download Links</h1>

        <p>Here are your photo download links:</p>

        <ul style="list-style: none; padding: 0;">
          ${downloadLinksHtml}
        </ul>

        <p style="color: #888; font-size: 12px;">
          Download links are valid for 7 days from purchase.
        </p>
      </div>
    `,
  });
}
