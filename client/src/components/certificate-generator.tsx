import { forwardRef } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

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
  completionDate: string;
  testDuration: string;
}

interface CertificateGeneratorProps {
  data: CertificateData;
  onDownload?: () => void;
}

// Professional scoring system helpers with proper CEFR levels
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

const CertificateGenerator = forwardRef<HTMLDivElement, CertificateGeneratorProps>(
  ({ data, onDownload }, ref) => {
    const generatePDF = () => {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Premium white background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 297, 'F');

      // Elegant outer border with gradient effect
      doc.setLineWidth(1.5);
      doc.setDrawColor(15, 52, 96);
      doc.rect(15, 15, 180, 267, 'S');
      
      // Inner decorative border
      doc.setLineWidth(0.5);
      doc.setDrawColor(184, 134, 11); // Gold accent
      doc.rect(18, 18, 174, 261, 'S');

      // Premium header section
      doc.setFillColor(15, 52, 96); // Navy blue
      doc.rect(20, 20, 170, 45, 'F');
      
      // Gold accent stripe
      doc.setFillColor(184, 134, 11);
      doc.rect(20, 62, 170, 3, 'F');

      // Elegant title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("CERTIFICATE OF ENGLISH PROFICIENCY", 105, 35, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("INTERNATIONAL ENGLISH TESTING AUTHORITY", 105, 50, { align: 'center' });

      // Certificate metadata in elegant bar
      doc.setFillColor(248, 249, 251);
      doc.rect(25, 75, 160, 12, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.rect(25, 75, 160, 12, 'S');
      
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Certificate ID: ${data.certificateId}`, 30, 83);
      doc.text(`Issue Date: ${data.completionDate}`, 180, 83, { align: 'right' });

      // Main content area
      let yPos = 105;
      
      // Certification statement
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("This certifies that", 105, yPos, { align: 'center' });

      // Candidate name with elegant styling
      yPos += 15;
      let nameText = data.userName.toUpperCase();
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 52, 96);
      
      // Dynamic font sizing for long names
      let fontSize = 22;
      let nameWidth = doc.getTextWidth(nameText);
      const maxWidth = 140;
      
      while (nameWidth > maxWidth && fontSize > 14) {
        fontSize -= 1;
        doc.setFontSize(fontSize);
        nameWidth = doc.getTextWidth(nameText);
      }
      
      doc.text(nameText, 105, yPos, { align: 'center' });
      
      // Elegant underline
      doc.setDrawColor(184, 134, 11);
      doc.setLineWidth(1);
      doc.line(105 - nameWidth/2 - 5, yPos + 3, 105 + nameWidth/2 + 5, yPos + 3);

      // Achievement statement
      yPos += 20;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("has successfully demonstrated proficiency in English", 105, yPos, { align: 'center' });
      yPos += 8;
      doc.text("and achieved the following assessment results", 105, yPos, { align: 'center' });

      // Premium score display
      yPos += 20;
      // Score box with gradient-like styling
      doc.setFillColor(15, 52, 96);
      doc.roundedRect(55, yPos, 100, 30, 3, 3, 'F');
      
      // Gold border accent
      doc.setDrawColor(184, 134, 11);
      doc.setLineWidth(2);
      doc.roundedRect(55, yPos, 100, 30, 3, 3, 'S');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("OVERALL SCORE", 105, yPos + 10, { align: 'center' });
      
      doc.setFontSize(20);
      doc.text(`${data.overallScore}%`, 105, yPos + 20, { align: 'center' });
      
      doc.setFontSize(8);
      doc.text(`CEFR Level: ${getCEFRLevel(data.overallScore)}`, 105, yPos + 27, { align: 'center' });

      // Skills assessment table
      yPos += 40;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("SKILLS ASSESSMENT", 105, yPos, { align: 'center' });

      yPos += 12;
      
      // Table header
      doc.setFillColor(245, 245, 245);
      doc.rect(30, yPos, 150, 7, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(30, yPos, 150, 7, 'S');
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(60, 60, 60);
      doc.text("SKILL AREA", 35, yPos + 4.5);
      doc.text("CEFR LEVEL", 105, yPos + 4.5, { align: 'center' });
      doc.text("PROFICIENCY", 170, yPos + 4.5, { align: 'right' });

      // Skills data
      const skills = [
        { name: 'Reading', score: data.sectionScores.reading },
        { name: 'Listening', score: data.sectionScores.listening },
        { name: 'Writing', score: data.sectionScores.writing },
        { name: 'Speaking', score: data.sectionScores.speaking }
      ];

      const tableStartY = yPos + 7;
      const rowHeight = 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      
      skills.forEach((skill, index) => {
        const rowY = tableStartY + (index * rowHeight);
        
        // Alternating row colors
        if (index % 2 === 0) {
          doc.setFillColor(252, 252, 252);
          doc.rect(30, rowY, 150, rowHeight, 'F');
        }
        
        // Row border
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.2);
        doc.rect(30, rowY, 150, rowHeight, 'S');
        
        // Content
        doc.setTextColor(40, 40, 40);
        doc.text(skill.name, 35, rowY + 5);
        doc.text(getCEFRLevel(skill.score), 105, rowY + 5, { align: 'center' });
        doc.text(getProficiencyLevel(skill.score), 170, rowY + 5, { align: 'right' });
      });

      // Update yPos to after the table
      yPos = tableStartY + (skills.length * rowHeight);
      
      // Calculate remaining space and ensure everything fits within inner border (279mm from top)
      const innerBorderBottom = 279; // 18mm top + 261mm height
      const signatureBlockHeight = 16; // 2 lines + spacing
      const footerBlockHeight = 10; // Footer lines
      const totalRemainingHeight = signatureBlockHeight + footerBlockHeight;
      const availableSpace = innerBorderBottom - yPos;
      
      // Adjust spacing if needed to fit within borders
      let signatureSpacing = 18;
      if (availableSpace < totalRemainingHeight + signatureSpacing) {
        signatureSpacing = Math.max(8, availableSpace - totalRemainingHeight - 5);
        // If still doesn't fit, compress the blocks
        if (signatureSpacing < 8) {
          yPos = innerBorderBottom - totalRemainingHeight - 8;
          signatureSpacing = 8;
        }
      }
      
      // Signatures section with calculated spacing
      yPos += signatureSpacing;
      doc.setDrawColor(15, 52, 96);
      doc.setLineWidth(0.5);
      
      // Left signature
      doc.line(40, yPos, 85, yPos);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(60, 60, 60);
      doc.text("Dr. Sarah Johnson, Ph.D.", 62.5, yPos + 6, { align: 'center' });
      doc.setFont("helvetica", "normal");
      doc.text("Director of Assessment", 62.5, yPos + 11, { align: 'center' });
      
      // Right signature
      doc.line(125, yPos, 170, yPos);
      doc.setFont("helvetica", "bold");
      doc.text("Michael Chen, M.A.", 147.5, yPos + 6, { align: 'center' });
      doc.setFont("helvetica", "normal");
      doc.text("Chief Registrar", 147.5, yPos + 11, { align: 'center' });

      // Footer - positioned to stay within borders
      yPos += 20;
      // Ensure footer stays within inner border
      if (yPos + 8 > innerBorderBottom) {
        yPos = innerBorderBottom - 8;
      }
      
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(5);
      doc.setFont("helvetica", "normal");
      doc.text("This certificate is digitally verified and contains security features.", 105, yPos, { align: 'center' });
      doc.text(`EnglishPro Test © ${new Date().getFullYear()} | Verification: ${data.certificateId.slice(-8).toUpperCase()}`, 105, yPos + 4, { align: 'center' });

      // Download the PDF
      doc.save(`EnglishPro_Certificate_${data.certificateId}.pdf`);
      
      if (onDownload) {
        onDownload();
      }
    };

    const getScoreLevel = (score: number) => {
      if (score >= 90) return { level: "Advanced", color: "text-green-600" };
      if (score >= 80) return { level: "Proficient", color: "text-slate-600" };
      if (score >= 70) return { level: "Intermediate", color: "text-yellow-600" };
      return { level: "Basic", color: "text-orange-600" };
    };

    const scoreLevel = getScoreLevel(data.overallScore);

    return (
      <div ref={ref} className="bg-gradient-to-br from-slate-50 to-gray-100 p-8 rounded-lg border">
        {/* Certificate Preview */}
        <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-slate-200">
          <div className="text-center mb-6">
            <div className="bg-slate-700 text-white py-4 px-6 rounded-t-lg -mx-8 -mt-8 mb-6">
              <h1 className="text-2xl font-bold">CERTIFICATE OF ENGLISH PROFICIENCY</h1>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600 mb-6">
              <span>Certificate ID: {data.certificateId}</span>
              <span>Date: {data.completionDate}</span>
            </div>

            <p className="text-lg mb-2">This is to certify that</p>
            <h2 className="text-3xl font-bold text-slate-700 mb-4">{data.userName.toUpperCase()}</h2>
            <p className="text-lg mb-2">has successfully completed the</p>
            <p className="text-xl font-semibold mb-6">EnglishPro Test Professional English Proficiency Assessment</p>

            <div className="mb-6">
              <div className="text-2xl font-bold text-slate-700 mb-2">
                Overall Score: {data.overallScore}/100
              </div>
              <div className={`text-lg font-semibold ${scoreLevel.color}`}>
                {scoreLevel.level} Level
              </div>
            </div>

            {/* CEFR Level Summary */}
            <div className="bg-slate-100 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-center mb-3">CEFR Assessment Summary</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span>Reading:</span>
                  <span className="font-semibold">{getCEFRLevel(data.sectionScores.reading)} Level</span>
                </div>
                <div className="flex justify-between">
                  <span>Listening:</span>
                  <span className="font-semibold">{getCEFRLevel(data.sectionScores.listening)} Level</span>
                </div>
                <div className="flex justify-between">
                  <span>Writing:</span>
                  <span className="font-semibold">{getCEFRLevel(data.sectionScores.writing)} Level</span>
                </div>
                <div className="flex justify-between">
                  <span>Speaking:</span>
                  <span className="font-semibold">{getCEFRLevel(data.sectionScores.speaking)} Level</span>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500 border-t pt-4">
              <p>This certificate verifies the English language proficiency of the named individual.</p>
              <p>Test Duration: {data.testDuration} | EnglishPro Test © {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>

        {/* Download button */}
        <div className="mt-6 text-center">
          <Button 
            onClick={generatePDF}
            className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-3"
            data-testid="button-download-certificate"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Certificate PDF
          </Button>
        </div>
      </div>
    );
  }
);

CertificateGenerator.displayName = "CertificateGenerator";

export default CertificateGenerator;