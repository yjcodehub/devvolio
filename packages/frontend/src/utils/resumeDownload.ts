import { toast } from 'sonner';

/**
 * Reusable utility to handle portfolio resume downloads.
 * Performs on-the-fly client-side PDF conversion for Word documents (.docx)
 * and direct PDF downloads for .pdf files.
 */
export async function downloadActiveResume(cvFileUrl: string | undefined) {
  if (!cvFileUrl) {
    toast.error('Resume is not available for download right now.');
    return;
  }

  // Extract clean file path and extension
  const cleanUrl = cvFileUrl.split('?')[0];
  const ext = cleanUrl.split('.').pop()?.toLowerCase();

  if (!ext) {
    toast.error('Invalid resume file format.');
    return;
  }

  // 1. Direct PDF Download (using blob + objectURL to bypass cross-origin browser download restrictions)
  if (ext === 'pdf') {
    const toastId = toast.loading('Downloading resume PDF...');
    try {
      const response = await fetch(cvFileUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      
      const localUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = localUrl;
      link.download = 'Yashkumar_Jais_Resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(localUrl);
      
      toast.dismiss(toastId);
      toast.success('Resume PDF downloaded successfully!');
    } catch (err) {
      console.error('[ResumeDownload] Direct PDF download failed, falling back:', err);
      toast.dismiss(toastId);
      // Fallback: open in new tab
      window.open(cvFileUrl, '_blank');
    }
    return;
  }

  // 2. Word Document (.docx) to PDF conversion on-the-fly
  if (ext === 'docx') {
    const toastId = toast.loading('Compiling Word layout to PDF on-the-fly...');
    try {
      // Dynamic imports to prevent Next.js SSR build errors on DOM objects
      const html2pdf = (await import('html2pdf.js')).default;
      const { renderAsync } = await import('docx-preview');

      // Fetch file buffer from URL
      const response = await fetch(cvFileUrl);
      if (!response.ok) throw new Error('Failed to retrieve file from storage');
      const arrayBuffer = await response.arrayBuffer();

      // Create a background-layer wrapper node styled for high-fidelity rendering.
      // html2canvas struggles to render elements positioned far off-screen (like left: -9999px),
      // so we place it at absolute 0,0 but hide it behind the viewport page stack.
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '0';
      container.style.top = '0';
      container.style.zIndex = '-9999';
      container.style.opacity = '0.01';
      container.style.pointerEvents = 'none';
      container.style.width = '810px'; // standard width for A4 page sizing
      container.style.background = '#ffffff';
      container.style.color = '#000000';
      container.style.padding = '40px';
      container.style.fontFamily = 'Calibri, Arial, sans-serif';
      document.body.appendChild(container);

      // Render the docx content into the container
      await renderAsync(arrayBuffer, container, undefined, {
        inWrapper: false,
        ignoreWidth: true,
        ignoreHeight: true,
        debug: false
      });

      // PDF configuration options
      const opt = {
        margin: 0.4, // standard clean margins
        filename: 'Yashkumar_Jais_Resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          letterRendering: true
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      // Compile and save PDF
      await html2pdf().from(container).set(opt as any).save();

      // Clean up
      document.body.removeChild(container);
      toast.dismiss(toastId);
      toast.success('Resume downloaded successfully as PDF!');
    } catch (err: any) {
      console.error('[ResumeDownload] Client-side DOCX conversion error:', err);
      toast.dismiss(toastId);
      toast.error('PDF conversion failed. Downloading original Word document.');
      
      // Fallback direct download
      const link = document.createElement('a');
      link.href = cvFileUrl;
      link.target = '_blank';
      link.download = 'Yashkumar_Jais_Resume.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    return;
  }

  // 3. Fallback for older .doc or miscellaneous formats
  toast.info('Downloading resume document...');
  const link = document.createElement('a');
  link.href = cvFileUrl;
  link.target = '_blank';
  link.download = `Yashkumar_Jais_Resume.${ext}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
