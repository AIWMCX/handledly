import { useState } from 'react';
import { toast } from 'sonner';

export const useLaunchReadinessPDF = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateLaunchReadinessPDF = async () => {
    setIsGenerating(true);
    
    try {
      // Dynamic import to avoid ESM/CJS conflict at module load time
      const [{ pdf }, { default: LaunchReadinessChecklistPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/admin/pdf/LaunchReadinessChecklistPDF'),
      ]);

      // Generate PDF blob
      const blob = await pdf(<LaunchReadinessChecklistPDF />).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `handledly-launch-readiness-checklist-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Launch Readiness Checklist PDF downloaded!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateLaunchReadinessPDF,
    isGenerating,
  };
};
