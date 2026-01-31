import QRCode from 'qrcode';

// Lazy-loaded to avoid build-time env var issues
function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

// Generate QR code as data URL for a table's gallery
export async function generateTableQRCode(accessCode: string): Promise<string> {
  const url = `${getAppUrl()}/gallery/${accessCode}`;
  return QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}

// Generate QR code as SVG string
export async function generateTableQRCodeSVG(accessCode: string): Promise<string> {
  const url = `${getAppUrl()}/gallery/${accessCode}`;
  return QRCode.toString(url, {
    type: 'svg',
    width: 300,
    margin: 2,
  });
}

// Generate a short, memorable access code
export function generateAccessCode(): string {
  // Generate a 6-character alphanumeric code (avoiding confusing characters)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate batch QR codes for printing
export async function generateBatchQRCodes(
  tables: { tableNumber: string; accessCode: string }[]
): Promise<{ tableNumber: string; qrDataUrl: string; accessCode: string }[]> {
  const results = await Promise.all(
    tables.map(async (table) => ({
      tableNumber: table.tableNumber,
      accessCode: table.accessCode,
      qrDataUrl: await generateTableQRCode(table.accessCode),
    }))
  );
  return results;
}
