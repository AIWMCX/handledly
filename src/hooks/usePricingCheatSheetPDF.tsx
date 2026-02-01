import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import PricingCheatSheetPDF from '@/components/admin/pdf/PricingCheatSheetPDF';
import { toast } from 'sonner';

export const usePricingCheatSheetPDF = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePricingPDF = async () => {
    setIsGenerating(true);
    
    try {
      // Generate PDF blob
      const blob = await pdf(<PricingCheatSheetPDF />).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'handledly-pricing-cheat-sheet-2026-02.pdf';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(url);
      
      toast.success('Pricing Cheat Sheet downloaded!', {
        description: 'Print and laminate for crew reference.',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF', {
        description: 'Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePricingPDF,
    isGenerating,
  };
};
