import { useState } from 'react';
import Tesseract from 'tesseract.js';
import { ExtractedData } from '../types';

export function useOCR() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const extractTextFromImage = async (imageFile: File): Promise<string> => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const result = await Tesseract.recognize(imageFile, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      setIsProcessing(false);
      return result.data.text;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract text');
      setIsProcessing(false);
      throw err;
    }
  };

  const parseTrackingData = (text: string): ExtractedData => {
    const lines = text.split('\n').filter(line => line.trim());
    
    const extracted: ExtractedData = {
      raw_text: text,
    };

    // Enhanced tracking number patterns for various formats
    const trackingPatterns = [
      // Format: "Tracking: ABC123456789" or "Track #: ABC-123-456"
      /(?:tracking|track|tracking\s*(?:number|no|#)|awb|waybill)[\s#:]*([A-Z0-9\-]{6,30})/i,
      // Common carrier formats
      /\b(1Z[A-Z0-9]{16})\b/i, // UPS
      /\b([0-9]{12,22})\b/, // FedEx, USPS, etc.
      /\b([A-Z]{2}\d{9}[A-Z]{2})\b/, // USPS International
      // Philippine formats (LBC, J&T, etc.)
      /\b([A-Z]{2,4}\d{10,15})\b/,
      /\b(TRK-\d{8}-\d{4})\b/,
      // Any format with "TRK" or "AWB" prefix
      /\b((?:TRK|AWB|REF)[:\s#-]*[A-Z0-9\-]{6,20})\b/i,
      // Generic alphanumeric (but exclude common non-tracking terms)
      /\b([A-Z0-9]{10,20})\b/,
    ];

    // Try each pattern until we find a match
    for (const pattern of trackingPatterns) {
      const match = text.match(pattern);
      if (match) {
        let trackingNum = match[1].trim().toUpperCase();
        
        // Filter out common non-tracking terms
        const invalidTerms = [
          'CONTENT', 'TOTAL', 'AMOUNT', 'PRICE', 'COST', 'FEE', 'CHARGE',
          'SUBTOTAL', 'TAX', 'SHIPPING', 'DELIVERY', 'HANDLING',
          'DATE', 'TIME', 'STATUS', 'TYPE', 'METHOD', 'SERVICE',
          'PAYMENT', 'ORDER', 'ITEM', 'PRODUCT', 'QUANTITY', 'QTY',
          'WEIGHT', 'DIMENSION', 'SIZE', 'COLOR', 'DESCRIPTION'
        ];
        
        const isInvalid = invalidTerms.some(term => 
          trackingNum.includes(term)
        );
        
        // Only accept if it looks like a real tracking number
        if (!isInvalid && trackingNum.length >= 6 && trackingNum.length <= 30) {
          extracted.tracking_number = trackingNum;
          break;
        }
      }
    }

    // Phone number patterns
    const phonePatterns = [
      // With label
      /(?:phone|tel|mobile|contact|cel|cellphone)[\s:]*([0-9+\-\s()]{8,})/i,
      // Philippine mobile format
      /\b(09\d{9})\b/,
      /\b(\+639\d{9})\b/,
      // Any 10-11 digit number
      /\b(\d{10,11})\b/,
    ];

    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match) {
        extracted.customer_phone = match[1].replace(/[\s\-()]/g, '').trim();
        break;
      }
    }

    // Customer name patterns - more precise matching
    const namePatterns = [
      // With label (including "consignee") - must be followed by actual name
      /(?:name|customer|client|recipient|receiver|consignee)[\s:]*([A-Za-z][A-Za-z\s.]{2,30}?)(?:\n|tel|phone|mobile|address|contact|$)/i,
      // After "To:" or "For:" - must be followed by actual name
      /(?:to|for)[\s:]*([A-Za-z][A-Za-z\s.]{2,30}?)(?:\n|$)/i,
      // Ship to pattern
      /ship\s+to[\s:]*([A-Za-z][A-Za-z\s.]{2,30}?)(?:\n|$)/i,
    ];

    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        let name = match[1].trim().replace(/\s+/g, ' ');
        
        // Clean up common suffixes
        name = name.replace(/\s*(tel|phone|mobile|contact|address).*$/i, '');
        
        // Filter out common non-name terms
        const invalidTerms = [
          'content', 'total', 'amount', 'price', 'cost', 'fee', 'charge',
          'subtotal', 'tax', 'shipping', 'delivery', 'handling',
          'tracking', 'number', 'reference', 'code', 'id', 'no',
          'date', 'time', 'status', 'type', 'method', 'service',
          'payment', 'order', 'item', 'product', 'quantity', 'qty',
          'weight', 'dimension', 'size', 'color', 'description'
        ];
        
        const isInvalid = invalidTerms.some(term => 
          name.toLowerCase().includes(term.toLowerCase())
        );
        
        // Only accept if it looks like a real name (has letters, reasonable length, not invalid)
        if (!isInvalid && name.length >= 2 && name.length <= 50 && /^[A-Za-z\s.]+$/.test(name)) {
          extracted.customer_name = name;
          break;
        }
      }
    }

    return extracted;
  };

  const processImage = async (imageFile: File): Promise<ExtractedData> => {
    const text = await extractTextFromImage(imageFile);
    return parseTrackingData(text);
  };

  return {
    isProcessing,
    progress,
    error,
    extractTextFromImage,
    parseTrackingData,
    processImage,
  };
}

