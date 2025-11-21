import React, { useState, useEffect } from 'react';
import { pdfApi } from '../../services/api';

interface PdfButtonProps {
  kycId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const PdfButton: React.FC<PdfButtonProps> = ({ kycId, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [pdfGeneratedAt, setPdfGeneratedAt] = useState<string | null>(null);

  // Check if PDF already exists when component mounts
  useEffect(() => {
    checkPdfStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kycId]);

  const checkPdfStatus = async () => {
    try {
      setChecking(true);
      const response = await pdfApi.getStatus(kycId);
      if (response.data.success && response.data.data.pdfGenerated) {
        setPdfGenerated(true);
        setPdfGeneratedAt(response.data.data.generatedAt);
      }
    } catch (error: any) {
      console.error('Error checking PDF status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleGeneratePdf = async () => {
    try {
      setLoading(true);
      
      // Request PDF generation
      const response = await pdfApi.generate(kycId, 5);
      
      if (response.data.success) {
        if (onSuccess) {
          onSuccess();
        }
        
        // Poll for PDF status
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await pdfApi.getStatus(kycId);
            if (statusResponse.data.success && statusResponse.data.data.pdfGenerated) {
              clearInterval(pollInterval);
              setPdfGenerated(true);
              setPdfGeneratedAt(statusResponse.data.data.generatedAt);
              setLoading(false);
            }
          } catch (error) {
            console.error('Error polling PDF status:', error);
          }
        }, 2000);

        // Stop polling after 30 seconds
        setTimeout(() => {
          clearInterval(pollInterval);
          if (loading) {
            setLoading(false);
            checkPdfStatus(); // Final check
          }
        }, 30000);
      }
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      if (onError) {
        onError(error.response?.data?.message || 'Failed to generate PDF');
      }
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setLoading(true);
      await pdfApi.download(kycId);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      if (onError) {
        onError(error.response?.data?.message || 'Failed to download PDF. Please try generating again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <button
        disabled
        className="p-2 bg-brand-gray/20 text-brand-white/30 rounded-lg flex items-center justify-center cursor-not-allowed"
        title="Checking PDF status..."
      >
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </button>
    );
  }

  if (pdfGenerated) {
    return (
      <button
        onClick={handleDownloadPdf}
        disabled={loading}
        className={`p-2 text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          loading ? 'animate-pulse' : ''
        }`}
        title={`Download PDF (Generated: ${pdfGeneratedAt ? new Date(pdfGeneratedAt).toLocaleString() : 'recently'})`}
      >
        {loading ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleGeneratePdf}
      disabled={loading}
      className={`p-2 text-brand-white/70 hover:text-brand-white hover:bg-brand-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        loading ? 'animate-pulse' : ''
      }`}
      title="Generate PDF Report"
    >
      {loading ? (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
};

export default PdfButton;
