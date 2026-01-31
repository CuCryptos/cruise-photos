'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

interface UploadedFile {
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  tableId?: string;
}

interface PhotoUploaderProps {
  sessionId: string;
  tables: { id: string; table_number: string }[];
  onUploadComplete: () => void;
}

export default function PhotoUploader({
  sessionId,
  tables,
  onUploadComplete,
}: PhotoUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'pending' as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const assignTableToFile = (index: number, tableId: string) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index] = { ...newFiles[index], tableId };
      return newFiles;
    });
  };

  const assignTableToAll = () => {
    if (!selectedTableId) return;
    setFiles((prev) =>
      prev.map((f) => ({
        ...f,
        tableId: f.tableId || selectedTableId,
      }))
    );
  };

  const uploadFiles = async () => {
    const filesToUpload = files.filter(
      (f) => f.status === 'pending' && f.tableId
    );
    if (filesToUpload.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.status !== 'pending' || !file.tableId) continue;

      setFiles((prev) => {
        const newFiles = [...prev];
        newFiles[i] = { ...newFiles[i], status: 'uploading' };
        return newFiles;
      });

      try {
        const formData = new FormData();
        formData.append('file', file.file);
        formData.append('tableId', file.tableId);
        formData.append('sessionId', sessionId);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        setFiles((prev) => {
          const newFiles = [...prev];
          newFiles[i] = { ...newFiles[i], status: 'success', progress: 100 };
          return newFiles;
        });
      } catch {
        setFiles((prev) => {
          const newFiles = [...prev];
          newFiles[i] = { ...newFiles[i], status: 'error' };
          return newFiles;
        });
      }
    }

    setIsUploading(false);
    onUploadComplete();
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const successCount = files.filter((f) => f.status === 'success').length;
  const readyToUpload = files.filter(
    (f) => f.status === 'pending' && f.tableId
  ).length;

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-colors
          ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input {...getInputProps()} />
        <PhotoIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-blue-600">Drop the photos here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Drag and drop photos here, or click to select
            </p>
            <p className="text-sm text-gray-400">
              Supports JPEG, PNG, WebP (up to 200 photos at a time)
            </p>
          </div>
        )}
      </div>

      {/* Bulk table assignment */}
      {files.length > 0 && (
        <div className="flex gap-4 items-center">
          <select
            value={selectedTableId}
            onChange={(e) => setSelectedTableId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Select table...</option>
            {tables.map((table) => (
              <option key={table.id} value={table.id}>
                {table.table_number}
              </option>
            ))}
          </select>
          <Button onClick={assignTableToAll} variant="outline" size="sm">
            Assign to unassigned photos
          </Button>
        </div>
      )}

      {/* File grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {files.map((file, index) => (
            <div
              key={index}
              className={`relative group rounded-lg overflow-hidden border-2 ${
                file.status === 'success'
                  ? 'border-green-500'
                  : file.status === 'error'
                  ? 'border-red-500'
                  : file.tableId
                  ? 'border-blue-500'
                  : 'border-gray-200'
              }`}
            >
              <img
                src={file.preview}
                alt=""
                className="w-full h-24 object-cover"
              />

              {/* Status overlay */}
              {file.status === 'uploading' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {file.status === 'success' && (
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
              )}

              {/* Remove button */}
              {file.status === 'pending' && (
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}

              {/* Table selector */}
              {file.status === 'pending' && (
                <select
                  value={file.tableId || ''}
                  onChange={(e) => assignTableToFile(index, e.target.value)}
                  className="absolute bottom-0 left-0 right-0 text-xs p-1 bg-white/90"
                >
                  <option value="">Table...</option>
                  {tables.map((table) => (
                    <option key={table.id} value={table.id}>
                      {table.table_number}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload status and button */}
      {files.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {pendingCount} pending • {readyToUpload} ready to upload •{' '}
            {successCount} uploaded
          </p>
          <Button
            onClick={uploadFiles}
            disabled={readyToUpload === 0}
            loading={isUploading}
          >
            Upload {readyToUpload} Photos
          </Button>
        </div>
      )}
    </div>
  );
}
