import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Save, ArrowRight, Send } from "lucide-react";

interface TestNavigationProps {
  sections: Array<{
    id: string;
    name: string;
    icon: any;
    color: string;
  }>;
  currentSection: number;
  answers: Record<string, any>;
  onSectionChange: (index: number) => void;
  onSave: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isLastSection: boolean;
  isSubmitting: boolean;
  isSectionCompleted: (sectionIndex: number) => boolean;
  isSectionAccessible: (sectionIndex: number) => boolean;
}

export default function TestNavigation({
  sections,
  currentSection,
  answers,
  onSectionChange,
  onSave,
  onNext,
  onSubmit,
  isLastSection,
  isSubmitting,
  isSectionCompleted,
  isSectionAccessible,
}: TestNavigationProps) {
  return (
    <Card className="sticky top-24">
      <CardContent className="p-6">
        <h4 className="font-semibold mb-4">Test Sections</h4>
        
        <div className="space-y-3 mb-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isActive = index === currentSection;
            const isReallyCompleted = isSectionCompleted(index);
            const isAccessible = isSectionAccessible(index);
            
            return (
              <div
                key={section.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 border border-primary/20'
                    : isReallyCompleted
                    ? 'bg-green-50 border border-green-200'
                    : isAccessible
                    ? 'bg-muted cursor-pointer hover:bg-muted/70'
                    : 'bg-muted/50 cursor-not-allowed opacity-60'
                }`}
                onClick={() => isAccessible ? onSectionChange(index) : null}
                data-testid={`nav-section-${section.id}`}
              >
                <div className="flex items-center">
                  <Icon className={`h-5 w-5 mr-3 ${
                    isActive 
                      ? 'text-primary' 
                      : isReallyCompleted 
                      ? 'text-green-600' 
                      : isAccessible
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/50'
                  }`} />
                  <span className={
                    isActive 
                      ? 'font-medium' 
                      : isReallyCompleted 
                      ? 'text-green-700 font-medium' 
                      : isAccessible
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/50'
                  }>
                    {section.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${
                    isActive 
                      ? 'text-primary' 
                      : isReallyCompleted 
                      ? 'text-green-600' 
                      : isAccessible
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/50'
                  }`}>
                    {isActive ? 'Active' : isReallyCompleted ? 'Complete' : isAccessible ? 'Available' : 'Locked'}
                  </span>
                  {!isAccessible && (
                    <div className="w-3 h-3 rounded-full bg-gray-400 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border pt-4 mb-4">
          <h5 className="font-medium mb-2">Question Navigation</h5>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <button
                key={i}
                className={`w-8 h-8 rounded text-sm font-medium ${
                  i === 0
                    ? 'bg-primary text-primary-foreground'
                    : i === 1
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
                data-testid={`question-nav-${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            <span className="inline-flex items-center mr-3">
              <div className="w-2 h-2 bg-primary rounded mr-1"></div>
              Current
            </span>
            <span className="inline-flex items-center mr-3">
              <div className="w-2 h-2 bg-green-500 rounded mr-1"></div>
              Answered
            </span>
            <span className="inline-flex items-center">
              <div className="w-2 h-2 bg-muted rounded mr-1"></div>
              Not answered
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={onSave}
            data-testid="button-save-progress"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Progress
          </Button>
          
          {!isLastSection && (
            <Button
              className="w-full"
              onClick={onNext}
              data-testid="button-next-section"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Next Section
            </Button>
          )}
          
          <Button
            className="w-full"
            onClick={onSubmit}
            disabled={isSubmitting}
            variant={isLastSection ? "default" : "destructive"}
            data-testid="button-submit-test"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Submitting..." : isLastSection ? "Submit Test" : "Submit Test Early"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
