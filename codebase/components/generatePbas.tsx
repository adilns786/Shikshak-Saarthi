'use client';

import { useState } from 'react';

interface GeneratePBASButtonProps {
  userId: string;
}

export default function GeneratePBASButton({ userId }: GeneratePBASButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Use env variable or fallback to localhost
  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

  const handleGenerateDoc = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = `${SERVER_URL}/api/generate/firebase/${userId}`;

      // ✅ Fetch the DOCX from Flask backend
      const response = await fetch(endpoint, {
        method: 'GET',
      });

      if (!response.ok) {
        try {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to generate PBAS document');
        } catch {
          throw new Error('Failed to generate PBAS document');
        }
      }

      // ✅ Convert response to blob for file download
      const blob = await response.blob();
      const fileURL = window.URL.createObjectURL(blob);

      // ✅ Trigger download
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = `PBAS_${userId}_${Date.now()}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(fileURL);

    } catch (err: any) {
      console.error('Error generating PBAS:', err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleGenerateDoc}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {loading ? 'Generating...' : 'Download PBAS Form'}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
