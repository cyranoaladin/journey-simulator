export async function exportToPDF(elementId: string, filename = 'journey-summary.pdf') {
  if (typeof window === 'undefined') {
    throw new Error('PDF export is only available in the browser environment.');
  }

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found for PDF generation.');
  }

  const [{ default: html2canvas }, jsPdfModule] = await Promise.all([
    import('html2canvas'),
    import('jspdf')
  ]);

  const JsPDFConstructor = (jsPdfModule as any).jsPDF ?? (jsPdfModule as any).default;

  if (typeof JsPDFConstructor !== 'function') {
    throw new Error('Unable to load PDF engine.');
  }

  const canvas = await html2canvas(element, {
    scale: window.devicePixelRatio > 1 ? window.devicePixelRatio : 2,
    useCORS: true,
    backgroundColor: '#111827'
  });

  const imageData = canvas.toDataURL('image/png');
  const pdf = new JsPDFConstructor('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const ratio = canvas.width / canvas.height;
  const renderedHeight = pageWidth / ratio;
  const position = 0;

  if (renderedHeight <= pageHeight) {
    pdf.addImage(imageData, 'PNG', 0, position, pageWidth, renderedHeight);
  } else {
    let canvasHeightLeft = renderedHeight;
    let offset = 0;

    while (canvasHeightLeft > 0) {
      pdf.addImage(imageData, 'PNG', 0, position - offset, pageWidth, renderedHeight);
      canvasHeightLeft -= pageHeight;
      if (canvasHeightLeft > 0) {
        pdf.addPage();
        offset += pageHeight;
      }
    }
  }

  pdf.save(filename);
}
