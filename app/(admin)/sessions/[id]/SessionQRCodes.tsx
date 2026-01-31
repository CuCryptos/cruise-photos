'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { Table } from '@/types/database';

interface SessionQRCodesProps {
  tables: Table[];
}

export default function SessionQRCodes({
  tables,
}: SessionQRCodesProps) {
  const [qrCodes, setQrCodes] = useState<
    { tableNumber: string; qrDataUrl: string; accessCode: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const generateQRCodes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/qr/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tables: tables.map((t) => ({
            tableNumber: t.table_number,
            accessCode: t.access_code,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to generate QR codes');

      const data = await response.json();
      setQrCodes(data.qrCodes);
    } catch (error) {
      console.error('Error generating QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const printQRCodes = () => {
    window.print();
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">QR Codes</h2>
        <div className="flex gap-2">
          <Button onClick={generateQRCodes} loading={loading} variant="outline">
            Generate QR Codes
          </Button>
          {qrCodes.length > 0 && (
            <Button onClick={printQRCodes}>Print All</Button>
          )}
        </div>
      </div>

      {qrCodes.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-2">
          {qrCodes.map((qr) => (
            <div
              key={qr.accessCode}
              className="border rounded-lg p-4 text-center print:break-inside-avoid"
            >
              <img
                src={qr.qrDataUrl}
                alt={`QR code for ${qr.tableNumber}`}
                className="w-full max-w-[200px] mx-auto"
              />
              <p className="font-bold mt-2">{qr.tableNumber}</p>
              <p className="text-sm text-gray-500">Code: {qr.accessCode}</p>
              <p className="text-xs text-gray-400 mt-1">
                Scan to view & purchase photos
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          Click &quot;Generate QR Codes&quot; to create printable QR codes for each table
        </p>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:grid-cols-2,
          .print\\:grid-cols-2 * {
            visibility: visible;
          }
          .print\\:grid-cols-2 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </Card>
  );
}
