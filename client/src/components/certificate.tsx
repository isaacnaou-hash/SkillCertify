import { Award } from "lucide-react";

interface CertificateProps {
  name: string;
  score: number;
  certificateId: string;
  issueDate: string;
}

export default function Certificate({ name, score, certificateId, issueDate }: CertificateProps) {
  return (
    <div className="certificate-bg p-8 rounded-xl text-white text-center" data-testid="certificate">
      <div className="mb-6">
        <Award className="h-16 w-16 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Certificate of English Proficiency</h2>
        <p className="text-lg">This certifies that</p>
      </div>
      
      <div className="mb-6">
        <h3 className="text-3xl font-bold mb-2" data-testid="certificate-name">{name}</h3>
        <p className="text-lg">has successfully completed the EnglishPro Test</p>
        <p className="text-lg">with a score of <span className="font-bold" data-testid="certificate-score">{score}/100</span></p>
      </div>
      
      <div className="border-t border-white/20 pt-6 flex justify-between items-end">
        <div className="text-left">
          <p className="text-sm">Certificate ID: {certificateId}</p>
          <p className="text-sm">Issued: {issueDate}</p>
        </div>
        <div className="text-right">
          <p className="text-sm">EnglishPro Test</p>
          <p className="text-sm">Verification Code: {certificateId?.slice(-6)}</p>
        </div>
      </div>
    </div>
  );
}
