// Shared certificate generation utility
// Consolidates PDF generation logic to avoid duplication and ensure consistency
import jsPDF from "jspdf";
import "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface CertificateData {
  userName: string;
  overallScore: number;
  sectionScores: {
    reading: number;
    listening: number;
    writing: number;
    speaking: number;
  };
  certificateId: string;
  completionDate?: string;
}

const getBandLevel = (score: number): string => {
  if (score >= 90) return "9.0";
  if (score >= 80) return "8.0"; 
  if (score >= 70) return "7.0";
  if (score >= 60) return "6.0";
  if (score >= 50) return "5.0";
  return "4.0";
};

const getCEFRLevel = (score: number): string => {
  if (score >= 85) return "C2"; // Mastery
  if (score >= 75) return "C1"; // Effective Operational Proficiency
  if (score >= 65) return "B2"; // Vantage
  if (score >= 55) return "B1"; // Threshold
  if (score >= 45) return "A2"; // Waystage
  return "A1"; // Breakthrough
};

const getProficiencyLevel = (score: number): string => {
  if (score >= 85) return "Mastery";
  if (score >= 75) return "Advanced";
  if (score >= 65) return "Upper-Int.";
  if (score >= 55) return "Intermediate";
  if (score >= 45) return "Pre-Int.";
  return "Elementary";
};

export const generateCertificatePDF = async (data: CertificateData): Promise<{ blob: Blob; dataUrl: string }> => {
  try {
    console.log('Starting certificate generation for:', data.certificateId);
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Professional Certificate Background with gradient-like effect
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 297, 210, 'F');

    // Enhanced border design - outer decorative border
    doc.setLineWidth(4);
    doc.setDrawColor(15, 52, 96); // Deep navy blue
    doc.rect(8, 8, 281, 194);
    
    // Middle gold accent border
    doc.setLineWidth(2);
    doc.setDrawColor(184, 134, 11); // Rich gold
    doc.rect(10, 10, 277, 190);
    
    // Inner refined border
    doc.setLineWidth(1);
    doc.setDrawColor(15, 52, 96);
    doc.rect(15, 15, 267, 180);
    
    // Subtle background texture
    doc.setFillColor(252, 252, 252);
    doc.rect(18, 18, 261, 174, 'F');

    // Enhanced header section with gradient-like effect
    doc.setFillColor(15, 52, 96); // Deep navy blue
    doc.rect(18, 18, 261, 35, 'F');
    
    // Header accent stripe
    doc.setFillColor(184, 134, 11); // Rich gold
    doc.rect(18, 50, 261, 3, 'F');

    // Official seal
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(2);
    doc.circle(35, 32, 12, 'S');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("OFFICIAL", 35, 30, { align: 'center' });
    doc.text("SEAL", 35, 36, { align: 'center' });

    // Professional Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("CERTIFICATE OF ENGLISH PROFICIENCY", 148.5, 28, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("INTERNATIONAL ENGLISH TESTING AUTHORITY", 148.5, 38, { align: 'center' });
    
    // Professional certification mark
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.text("PROFESSIONAL", 260, 28, { align: 'center' });
    doc.text("ASSESSMENT", 260, 33, { align: 'center' });
    doc.text("STANDARD", 260, 38, { align: 'center' });

    // Main content with professional styling
    doc.setTextColor(0, 0, 0);
    
    // Header information bar
    doc.setFillColor(248, 249, 250);
    doc.rect(15, 52, 267, 15, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(15, 52, 267, 15);
    
    const currentDate = data.completionDate || new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`CERTIFICATE ID: ${data.certificateId}`, 20, 60);
    doc.text(`VERIFICATION CODE: ${data.certificateId.slice(-8).toUpperCase()}`, 148.5, 60, { align: 'center' });
    doc.text(`ISSUE DATE: ${currentDate}`, 277, 60, { align: 'right' });

    // Candidate name with professional styling
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text("This is to certify that", 148.5, 85, { align: 'center' });
    
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 82, 146);
    doc.text(data.userName.toUpperCase(), 148.5, 102, { align: 'center' });
    
    // Achievement statement
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text("has successfully completed the comprehensive English Proficiency Assessment", 148.5, 118, { align: 'center' });
    doc.text("and has demonstrated competency in the English language.", 148.5, 130, { align: 'center' });

    // Enhanced overall score section with CEFR level
    // Background rounded rectangle with gradient effect
    doc.setFillColor(15, 52, 96); // Deep navy blue
    doc.roundedRect(85, 138, 127, 30, 4, 4, 'F');
    
    // Gold accent border around score
    doc.setDrawColor(184, 134, 11);
    doc.setLineWidth(2);
    doc.roundedRect(85, 138, 127, 30, 4, 4, 'S');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("OVERALL SCORE", 148.5, 149, { align: 'center' });
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.overallScore}%`, 148.5, 159, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`CEFR Level: ${getCEFRLevel(data.overallScore)}`, 148.5, 166, { align: 'center' });

    // Section scores in professional manual table format
    console.log('Adding score table...');
    
    // Create manual table with proper spacing to prevent overlaps
    const tableStartY = 170;
    const tableWidth = 250;
    const tableX = (297 - tableWidth) / 2; // Center the table
    const rowHeight = 7;
    const colWidths = [75, 30, 50, 95]; // Optimized column widths
    
    // Enhanced table header
    doc.setFillColor(15, 52, 96); // Deep navy blue
    doc.rect(tableX, tableStartY, tableWidth, rowHeight, 'F');
    
    // Gold accent top border
    doc.setFillColor(184, 134, 11);
    doc.rect(tableX, tableStartY, tableWidth, 2, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    
    let currentX = tableX + 3;
    doc.text("SKILL AREA", currentX, tableStartY + 5);
    currentX += colWidths[0];
    doc.text("SCORE", currentX, tableStartY + 5);
    currentX += colWidths[1];
    doc.text("CEFR/BAND", currentX, tableStartY + 5);
    currentX += colWidths[2];
    doc.text("PROFICIENCY", currentX, tableStartY + 5);
    
    // Table rows with CEFR levels - shortened text to prevent wrapping
    const rows = [
      ['Reading', `${data.sectionScores.reading}%`, `${getCEFRLevel(data.sectionScores.reading)} (${getBandLevel(data.sectionScores.reading)})`, getProficiencyLevel(data.sectionScores.reading)],
      ['Listening', `${data.sectionScores.listening}%`, `${getCEFRLevel(data.sectionScores.listening)} (${getBandLevel(data.sectionScores.listening)})`, getProficiencyLevel(data.sectionScores.listening)],
      ['Writing', `${data.sectionScores.writing}%`, `${getCEFRLevel(data.sectionScores.writing)} (${getBandLevel(data.sectionScores.writing)})`, getProficiencyLevel(data.sectionScores.writing)],
      ['Speaking', `${data.sectionScores.speaking}%`, `${getCEFRLevel(data.sectionScores.speaking)} (${getBandLevel(data.sectionScores.speaking)})`, getProficiencyLevel(data.sectionScores.speaking)]
    ];
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    
    rows.forEach((row, index) => {
      const y = tableStartY + (index + 1) * rowHeight;
      
      // Enhanced alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 252); // Very light blue-gray
        doc.rect(tableX, y, tableWidth, rowHeight, 'F');
      } else {
        doc.setFillColor(255, 255, 255); // Pure white
        doc.rect(tableX, y, tableWidth, rowHeight, 'F');
      }
      
      // Add border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(tableX, y, tableWidth, rowHeight, 'S');
      
      currentX = tableX + 3;
      row.forEach((cell, colIndex) => {
        // Single line text only, no wrapping to prevent height issues
        doc.text(cell, currentX, y + 5);
        currentX += colWidths[colIndex];
      });
    });

    // Professional validity statement (positioned safely below table)
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("This certificate is valid for employment and immigration purposes.", 148.5, 200, { align: 'center' });
    
    // Return PDF as blob and data URL for preview
    console.log('Generating PDF blob...');
    const pdfBlob = doc.output('blob');
    const dataUrl = doc.output('datauristring');
    console.log('Certificate generated successfully!');
    
    return { blob: pdfBlob, dataUrl };
  } catch (error) {
    console.error('Certificate generation failed:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

// Function to download certificate
export const downloadCertificate = (blob: Blob, certificateId: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `EnglishPro_Certificate_${certificateId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const formatUserName = (userEmail: string, fallbackName?: string): string => {
  if (fallbackName && fallbackName.trim()) {
    return fallbackName.trim();
  }
  
  if (!userEmail) {
    return "Certificate Holder";
  }
  
  // Extract name from email and format it nicely
  const emailPrefix = userEmail.split('@')[0];
  return emailPrefix
    .replace(/[._]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};