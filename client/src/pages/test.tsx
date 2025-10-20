import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import TestTimer from "@/components/test-timer";
import TestNavigation from "@/components/test-navigation";
import AudioRecorder from "@/components/audio-recorder";
import { GraduationCap, Book, Headphones, PenTool, Mic, Save, Play, Pause, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { generateCertificatePDF, formatUserName } from "@/utils/certificate";

const testSections = [
  { id: "reading", name: "Reading", icon: Book, color: "text-slate-600" },
  { id: "listening", name: "Listening", icon: Headphones, color: "text-green-500" },
  { id: "writing", name: "Writing", icon: PenTool, color: "text-purple-500" },
  { id: "speaking", name: "Speaking", icon: Mic, color: "text-orange-500" },
];

const readingQuestions = [
  // Passage 1 Questions
  {
    id: "reading_1",
    type: "multiple-choice",
    passage: 1,
    question: "According to the passage, renewable energy capacity has grown by what percentage annually?",
    options: [
      { value: "a", label: "10%" },
      { value: "b", label: "15%" },
      { value: "c", label: "20%" },
      { value: "d", label: "25%" },
    ],
    correctAnswer: "b",
  },
  {
    id: "reading_2",
    type: "multiple-choice",
    passage: 1,
    question: "Which countries are mentioned as successfully integrating renewable energy?",
    options: [
      { value: "a", label: "Sweden and Norway" },
      { value: "b", label: "Denmark and Germany" },
      { value: "c", label: "France and Italy" },
      { value: "d", label: "Spain and Portugal" },
    ],
    correctAnswer: "b",
  },
  {
    id: "reading_3",
    type: "true-false",
    passage: 1,
    question: "Denmark and Germany have successfully integrated renewable sources into their energy grids.",
    options: [
      { value: "true", label: "True" },
      { value: "false", label: "False" },
      { value: "not-given", label: "Not Given" },
    ],
    correctAnswer: "true",
  },
  {
    id: "reading_4",
    type: "fill-blank",
    passage: 1,
    question: "Energy storage technology must improve to handle the _______ nature of renewable sources.",
    correctAnswer: "intermittent",
  },
  
  // Passage 2 Questions
  {
    id: "reading_5",
    type: "multiple-choice",
    passage: 2,
    question: "According to the passage, what accelerated the shift to digital education?",
    options: [
      { value: "a", label: "Government policies" },
      { value: "b", label: "The global pandemic" },
      { value: "c", label: "Student demand" },
      { value: "d", label: "Technological advances" },
    ],
    correctAnswer: "b",
  },
  {
    id: "reading_6",
    type: "multiple-choice",
    passage: 2,
    question: "What technology is mentioned as personalizing education?",
    options: [
      { value: "a", label: "Virtual reality only" },
      { value: "b", label: "Online platforms only" },
      { value: "c", label: "Artificial intelligence and machine learning" },
      { value: "d", label: "Video conferencing" },
    ],
    correctAnswer: "c",
  },
  {
    id: "reading_7",
    type: "true-false",
    passage: 2,
    question: "Virtual reality allows medical students to perform real surgeries.",
    options: [
      { value: "true", label: "True" },
      { value: "false", label: "False" },
      { value: "not-given", label: "Not Given" },
    ],
    correctAnswer: "false",
  },
  {
    id: "reading_8",
    type: "short-answer",
    passage: 2,
    question: "Name TWO examples of immersive educational experiences mentioned in the passage.",
    correctAnswer: "Surgery simulations, Ancient civilizations",
  },
  
  // Mixed Questions
  {
    id: "reading_9",
    type: "multiple-choice",
    passage: 2,
    question: "What do critics argue about digital education?",
    options: [
      { value: "a", label: "It's too expensive" },
      { value: "b", label: "It lacks human connection" },
      { value: "c", label: "It's not accessible" },
      { value: "d", label: "It's too advanced" },
    ],
    correctAnswer: "b",
  },
  {
    id: "reading_10",
    type: "matching",
    passage: 0,
    question: "Match the following concepts with their correct fields:",
    options: [
      { value: "energy-storage", label: "Energy storage → Renewable Energy" },
      { value: "ai-learning", label: "AI personalization → Digital Education" },
      { value: "vr-surgery", label: "VR simulations → Digital Education" },
      { value: "grid-infrastructure", label: "Grid infrastructure → Renewable Energy" },
    ],
    correctAnswer: "energy-storage,ai-learning,vr-surgery,grid-infrastructure",
  },

  // Additional Professional Questions - Business & Employment Focus
  {
    id: "reading_11",
    type: "multiple-choice",
    passage: 1,
    question: "Based on the renewable energy passage, which skill would be MOST valuable for international professionals entering this sector?",
    options: [
      { value: "a", label: "Traditional fossil fuel expertise" },
      { value: "b", label: "Energy storage and grid infrastructure knowledge" },
      { value: "c", label: "Basic electrical maintenance" },
      { value: "d", label: "Environmental activism experience" },
    ],
    correctAnswer: "b",
  },
  {
    id: "reading_12",
    type: "true-false",
    passage: 2,
    question: "According to the passage, digital education platforms have eliminated geographical barriers for accessing quality education.",
    options: [
      { value: "true", label: "True" },
      { value: "false", label: "False" },
      { value: "not-given", label: "Not Given" },
    ],
    correctAnswer: "true",
  },
  {
    id: "reading_13",
    type: "fill-blank",
    passage: 2,
    question: "Critics of digital education are concerned about the loss of _______ that is essential for holistic development.",
    correctAnswer: "human connection",
  },
  {
    id: "reading_14",
    type: "short-answer",
    passage: 1,
    question: "List TWO countries specifically mentioned as successfully implementing renewable energy integration.",
    correctAnswer: "Denmark, Germany",
  },
  {
    id: "reading_15",
    type: "multiple-choice",
    passage: 0,
    question: "Which statement BEST describes the relationship between the two passages in terms of workplace implications?",
    options: [
      { value: "a", label: "Both describe declining industries with limited job prospects" },
      { value: "b", label: "Both present growing sectors requiring new professional skills and adaptation" },
      { value: "c", label: "Both focus primarily on environmental concerns rather than economic factors" },
      { value: "d", label: "Both emphasize traditional approaches over technological innovation" },
    ],
    correctAnswer: "b",
  },
];

const listeningQuestions = [
  {
    id: "listening_1",
    type: "multiple-choice",
    question: "What is the main topic of the business meeting?",
    options: [
      { value: "a", label: "Quarterly financial review" },
      { value: "b", label: "New product launch strategy" },
      { value: "c", label: "Employee performance evaluation" },
      { value: "d", label: "Office relocation plans" },
    ],
    correctAnswer: "b",
  },
  {
    id: "listening_2",
    type: "multiple-choice",
    question: "According to the speaker, what is the target launch date?",
    options: [
      { value: "a", label: "End of this quarter" },
      { value: "b", label: "Beginning of next quarter" },
      { value: "c", label: "Middle of next year" },
      { value: "d", label: "End of next year" },
    ],
    correctAnswer: "b",
  },
  {
    id: "listening_3",
    type: "multiple-choice",
    question: "Which department will lead the marketing campaign?",
    options: [
      { value: "a", label: "Digital Marketing" },
      { value: "b", label: "Product Development" },
      { value: "c", label: "Sales and Marketing" },
      { value: "d", label: "Customer Relations" },
    ],
    correctAnswer: "a",
  },
  {
    id: "listening_4",
    type: "fill-blank",
    question: "The estimated budget for the campaign is $___ thousand.",
    correctAnswer: "250",
  },
  {
    id: "listening_5",
    type: "fill-blank",
    question: "The product will initially be available in ___ major cities.",
    correctAnswer: "5",
  },
  {
    id: "listening_6",
    type: "short-answer",
    question: "Name TWO key features of the new product mentioned in the meeting.",
    correctAnswer: "AI integration, Voice control",
  },

  // Additional Professional Listening Questions - International Workplace Focus
  {
    id: "listening_7",
    type: "multiple-choice",
    question: "What international compliance requirement was mentioned for the UK market?",
    options: [
      { value: "a", label: "GDPR data protection standards" },
      { value: "b", label: "ISO 9001 quality certification" },
      { value: "c", label: "CE marking for product safety" },
      { value: "d", label: "FCA financial services approval" },
    ],
    correctAnswer: "a",
  },
  {
    id: "listening_8",
    type: "fill-blank",
    question: "The Canadian expansion will require hiring ___ bilingual customer service representatives.",
    correctAnswer: "12",
  },
  {
    id: "listening_9",
    type: "multiple-choice",
    question: "Which time zone challenge was discussed for the global team coordination?",
    options: [
      { value: "a", label: "Scheduling conflicts between New York and London offices" },
      { value: "b", label: "Daily standup meetings across three continents" },
      { value: "c", label: "Client calls spanning 15-hour time differences" },
      { value: "d", label: "All of the above coordination challenges" },
    ],
    correctAnswer: "d",
  },
  {
    id: "listening_10",
    type: "short-answer",
    question: "What was the primary reason for selecting Toronto and Vancouver as initial Canadian locations?",
    correctAnswer: "Multilingual workforce, Tech hubs",
  },
];

export default function Test() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Fetch test session
  const { data: sessionData, isLoading } = useQuery<{ session: any }>({
    queryKey: ["/api/test-sessions", sessionId],
    enabled: !!sessionId,
  });

  // Auto-save answers
  const saveAnswerMutation = useMutation({
    mutationFn: async (answerData: any) => {
      const response = await apiRequest("POST", "/api/test-answers", answerData);
      return response.json();
    },
  });

  // Submit test
  const submitTestMutation = useMutation({
    mutationFn: async () => {
      console.log("Submitting test for session:", sessionId);
      const response = await apiRequest("POST", `/api/test-sessions/${sessionId}/submit`);
      const result = await response.json();
      console.log("Test submission result:", result);
      return result;
    },
    onSuccess: async (data) => {
      console.log("Test submitted successfully:", data);
      
      toast({
        title: "Test completed successfully! 🎉",
        description: "Redirecting to view your certificate...",
      });
      
      // Invalidate and refetch session cache to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/test-sessions", sessionId] });
      
      // Pre-fetch the updated session data to ensure it's available when results page loads
      try {
        await queryClient.fetchQuery({
          queryKey: ["/api/test-sessions", sessionId],
        });
      } catch (error) {
        console.error("Error pre-fetching session data:", error);
      }
      
      // Redirect to results page to show certificate preview
      setTimeout(() => {
        setLocation(`/results/${sessionId}`);
      }, 1000);
    },
    onError: (error) => {
      console.error("Test submission error:", error);
      toast({
        title: "Submission failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Timer effect - only start countdown after instructions are dismissed
  useEffect(() => {
    if (showInstructions) return; // Don't start timer during instructions
    
    if (timeRemaining <= 0) {
      handleSubmitTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, showInstructions]);

  // Auto-save effect
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        // Auto-save current answers
        Object.entries(answers).forEach(([questionId, answer]) => {
          saveAnswerMutation.mutate({
            sessionId,
            section: testSections[currentSection].id,
            questionId,
            answer,
          });
        });
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [answers, currentSection, sessionId]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Check if a section is completed based on required answers
  const isSectionCompleted = (sectionIndex: number): boolean => {
    const sectionId = testSections[sectionIndex].id;
    
    switch (sectionId) {
      case 'reading':
        // Reading section requires answers to all 15 questions
        const readingQuestions = [
          'reading_1', 'reading_2', 'reading_3', 'reading_4', 'reading_5',
          'reading_6', 'reading_7', 'reading_8', 'reading_9', 'reading_10',
          'reading_11', 'reading_12', 'reading_13', 'reading_14', 'reading_15'
        ];
        return readingQuestions.every(questionId => 
          answers[questionId] && answers[questionId] !== ''
        );
        
      case 'listening':
        // Listening section requires answers to all 10 questions
        const listeningQuestions = [
          'listening_1', 'listening_2', 'listening_3', 'listening_4', 'listening_5',
          'listening_6', 'listening_7', 'listening_8', 'listening_9', 'listening_10'
        ];
        return listeningQuestions.every(questionId => 
          answers[questionId] && answers[questionId] !== ''
        );
        
      case 'writing':
        // Writing section requires both tasks with minimum word counts
        const writing1 = answers['writing_1'] || '';
        const writing2 = answers['writing_2'] || '';
        const getWordCount = (text: string) => text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
        return getWordCount(writing1) >= 150 && getWordCount(writing2) >= 250;
        
      case 'speaking':
        // Speaking section requires both audio recordings
        return answers['speaking_1']?.audioData && answers['speaking_2']?.audioData;
        
      default:
        return false;
    }
  };

  // Check if a section is accessible (current section or previous sections are completed)
  const isSectionAccessible = (sectionIndex: number): boolean => {
    if (sectionIndex === 0) return true; // First section is always accessible
    if (sectionIndex <= currentSection) return true; // Current and previous sections are accessible
    
    // Next section is only accessible if current section is completed
    if (sectionIndex === currentSection + 1) {
      return isSectionCompleted(currentSection);
    }
    
    // Future sections require all previous sections to be completed
    for (let i = 0; i < sectionIndex; i++) {
      if (!isSectionCompleted(i)) {
        return false;
      }
    }
    return true;
  };

  const handleNextSection = () => {
    if (currentSection < testSections.length - 1) {
      // Check if current section is completed before proceeding
      if (!isSectionCompleted(currentSection)) {
        toast({
          title: "Section incomplete",
          description: "Please complete all required questions in this section before proceeding.",
          variant: "destructive",
        });
        return;
      }
      
      setCurrentSection(prev => prev + 1);
      setCurrentQuestion(0);
    }
  };
  
  const handleSectionChange = (sectionIndex: number) => {
    // Only allow access to accessible sections
    if (!isSectionAccessible(sectionIndex)) {
      toast({
        title: "Section locked",
        description: "Please complete the previous sections first.",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentSection(sectionIndex);
    setCurrentQuestion(0);
  };

  const handleSubmitTest = () => {
    if (showInstructions) return; // Don't submit if still on instructions screen
    submitTestMutation.mutate();
  };

  const progress = ((currentSection + 1) / testSections.length) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!sessionData?.session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Test session not found</h2>
            <p className="text-muted-foreground mb-4">Please check your session ID or start a new test.</p>
            <Button onClick={() => setLocation("/")} data-testid="button-back-home">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show instructions before starting the test
  if (showInstructions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-4xl w-full">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-4 rounded-xl shadow-lg inline-block mb-4">
                <GraduationCap className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-bold mb-2">EnglishPro Assessment</h1>
              <p className="text-muted-foreground text-lg">International Employment Certification Test</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Book className="h-5 w-5 text-slate-600" />
                  Test Overview
                </h2>
                <div className="space-y-3 text-sm">
                  <p><strong>Duration:</strong> 60 minutes total</p>
                  <p><strong>Sections:</strong> 4 comprehensive sections</p>
                  <p><strong>Format:</strong> Multiple choice, writing, and speaking</p>
                  <p><strong>Certification:</strong> CEFR-based assessment (A1-C2)</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-green-500" />
                  Technical Requirements
                </h2>
                <div className="space-y-3 text-sm">
                  <p><strong>Microphone:</strong> Required for speaking section</p>
                  <p><strong>Browser:</strong> Chrome, Firefox, or Safari recommended</p>
                  <p><strong>Internet:</strong> Stable connection required</p>
                  <p><strong>Environment:</strong> Quiet space for audio recording</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Test Sections & Requirements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Book className="h-4 w-4 text-slate-600" />
                    <h3 className="font-medium">Reading Comprehension</h3>
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">25 min</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">15 questions based on business passages</p>
                  <p className="text-xs text-green-600 font-medium">✓ All questions must be answered to proceed</p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Headphones className="h-4 w-4 text-green-500" />
                    <h3 className="font-medium">Listening Comprehension</h3>
                    <span className="text-xs bg-green-100 dark:bg-green-900 px-2 py-1 rounded">15 min</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">10 questions from business audio</p>
                  <p className="text-xs text-green-600 font-medium">✓ All questions must be answered to proceed</p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PenTool className="h-4 w-4 text-purple-500" />
                    <h3 className="font-medium">Written Communication</h3>
                    <span className="text-xs bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded">15 min</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">2 writing tasks: Report & Essay</p>
                  <p className="text-xs text-green-600 font-medium">✓ Minimum 150 + 250 words required</p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="h-4 w-4 text-orange-500" />
                    <h3 className="font-medium">Spoken Communication</h3>
                    <span className="text-xs bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">5 min</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">2 speaking tasks with audio recording</p>
                  <p className="text-xs text-green-600 font-medium">✓ Audio recordings must be completed</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">⚠️ Important Navigation Rules</h3>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li>• You must complete each section before accessing the next one</li>
                <li>• You can return to previous sections to review your answers</li>
                <li>• Your progress is automatically saved every 30 seconds</li>
                <li>• The test will auto-submit when time expires</li>
                <li>• Once submitted, you cannot make changes</li>
              </ul>
            </div>

            <div className="text-center">
              <Button 
                size="lg" 
                onClick={() => setShowInstructions(false)}
                className="px-8 py-3 text-lg"
                data-testid="button-start-test"
              >
                Start Test
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Click "Start Test" to begin your 60-minute assessment
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSectionData = testSections[currentSection];

  return (
    <div className="min-h-screen bg-background">
      {/* Test Timer - Mobile positioned */}
      <TestTimer timeRemaining={timeRemaining} />

      {/* Enhanced Test Header - Mobile responsive */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border py-2 sm:py-4 sticky top-0 z-30 shadow-sm">
        <div className="container-responsive">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-2 sm:p-3 rounded-xl shadow-lg">
                <GraduationCap className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm sm:text-lg md:text-xl font-bold text-foreground truncate">EnglishPro Assessment</h2>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">
                  <span className="hidden sm:inline">International Employment Certification • </span>
                  {currentSectionData.name} Section
                </p>
              </div>
            </div>
            
            {/* Mobile Navigation Button */}
            <div className="md:hidden">
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" data-testid="button-mobile-nav">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <TestNavigation
                    sections={testSections}
                    currentSection={currentSection}
                    answers={answers}
                    onSectionChange={(section) => {
                      if (isSectionAccessible(section)) {
                        setCurrentSection(section);
                        setMobileNavOpen(false);
                      } else {
                        toast({
                          title: "Section locked",
                          description: "Please complete the previous sections first.",
                          variant: "destructive",
                        });
                      }
                    }}
                    isSectionCompleted={isSectionCompleted}
                    isSectionAccessible={isSectionAccessible}
                    onSave={() => {
                      Object.entries(answers).forEach(([questionId, answer]) => {
                        saveAnswerMutation.mutate({
                          sessionId,
                          section: testSections[currentSection].id,
                          questionId,
                          answer,
                        });
                      });
                      toast({
                        title: "Progress saved",
                        description: "Your answers have been saved.",
                      });
                    }}
                    onNext={handleNextSection}
                    onSubmit={handleSubmitTest}
                    isLastSection={currentSection === testSections.length - 1}
                    isSubmitting={submitTestMutation.isPending}
                  />
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Desktop Progress Bar */}
            <div className="hidden md:flex flex-1 max-w-sm ml-8">
              <div className="w-full">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground font-medium">Overall Progress</span>
                  <span className="text-primary font-semibold">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3 shadow-soft" />
              </div>
            </div>
          </div>
          
          {/* Mobile Progress Bar */}
          <div className="md:hidden mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground font-medium">Progress</span>
              <span className="text-primary font-semibold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Section Navigation Tabs - Hidden on mobile, drawer instead */}
          <div className="hidden md:flex space-x-1 rounded-lg bg-muted/50 p-1">
            {testSections.map((section, index) => {
              const Icon = section.icon;
              const isActive = index === currentSection;
              const isCompleted = index < currentSection;
              
              const isAccessible = isSectionAccessible(index);
              const isReallyCompleted = isSectionCompleted(index);
              
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(index)}
                  disabled={!isAccessible}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-white dark:bg-gray-800 text-foreground shadow-sm ring-2 ring-primary/20' 
                      : isReallyCompleted
                      ? 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20'
                      : isAccessible
                      ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      : 'text-muted-foreground/50 cursor-not-allowed opacity-60'
                  }`}
                  data-testid={`tab-${section.id}`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? section.color : ''}`} />
                  <span>{section.name}</span>
                  {isReallyCompleted && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                  {!isAccessible && (
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Mobile Section Indicator */}
          <div className="md:hidden flex items-center justify-between bg-muted/50 p-2 rounded-lg">
            <div className="flex items-center gap-2">
              <currentSectionData.icon className={`h-4 w-4 ${currentSectionData.color}`} />
              <span className="text-sm font-medium">{currentSectionData.name}</span>
              <span className="text-xs text-muted-foreground">({currentSection + 1}/{testSections.length})</span>
            </div>
            <div className="flex items-center gap-1">
              {testSections.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentSection 
                      ? 'bg-primary' 
                      : index < currentSection 
                      ? 'bg-green-500' 
                      : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Test Content */}
      <div className="container-responsive py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Main Test Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4 sm:p-6 md:p-8">
                {currentSection === 0 && <ReadingSection answers={answers} onAnswerChange={handleAnswerChange} />}
                {currentSection === 1 && <ListeningSection answers={answers} onAnswerChange={handleAnswerChange} />}
                {currentSection === 2 && <WritingSection answers={answers} onAnswerChange={handleAnswerChange} />}
                {currentSection === 3 && <SpeakingSection answers={answers} onAnswerChange={handleAnswerChange} />}
              </CardContent>
            </Card>
          </div>

          {/* Desktop Test Navigation Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <TestNavigation
              sections={testSections}
              currentSection={currentSection}
              answers={answers}
              onSectionChange={handleSectionChange}
              isSectionCompleted={isSectionCompleted}
              isSectionAccessible={isSectionAccessible}
              onSave={() => {
                Object.entries(answers).forEach(([questionId, answer]) => {
                  saveAnswerMutation.mutate({
                    sessionId,
                    section: testSections[currentSection].id,
                    questionId,
                    answer,
                  });
                });
                toast({
                  title: "Progress saved",
                  description: "Your answers have been saved.",
                });
              }}
              onNext={handleNextSection}
              onSubmit={handleSubmitTest}
              isLastSection={currentSection === testSections.length - 1}
              isSubmitting={submitTestMutation.isPending}
            />
          </div>
        </div>
        
        {/* Mobile Bottom Action Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border p-4 z-20">
          <div className="flex items-center justify-between gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => currentSection > 0 && handleSectionChange(currentSection - 1)}
              disabled={currentSection === 0}
              className="flex items-center gap-2"
              data-testid="button-previous-mobile"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  Object.entries(answers).forEach(([questionId, answer]) => {
                    saveAnswerMutation.mutate({
                      sessionId,
                      section: testSections[currentSection].id,
                      questionId,
                      answer,
                    });
                  });
                  toast({
                    title: "Progress saved",
                    description: "Your answers have been saved.",
                  });
                }}
                className="flex items-center gap-2"
                data-testid="button-save-mobile"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
            
            {currentSection === testSections.length - 1 ? (
              <Button 
                size="sm"
                onClick={handleSubmitTest}
                disabled={submitTestMutation.isPending}
                className="flex items-center gap-2"
                data-testid="button-submit-mobile"
              >
                Submit Test
              </Button>
            ) : (
              <Button 
                size="sm"
                onClick={handleNextSection}
                className="flex items-center gap-2"
                data-testid="button-next-mobile"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Mobile spacing for bottom bar */}
        <div className="lg:hidden h-20"></div>
      </div>
    </div>
  );
}

function ReadingSection({ answers, onAnswerChange }: { answers: Record<string, any>; onAnswerChange: (questionId: string, value: any) => void }) {
  return (
    <div>
      <div className="border-b border-border pb-3 sm:pb-4 mb-4 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">Reading Comprehension</h3>
        <p className="text-muted-foreground text-sm sm:text-base">
          Evaluate your business English reading skills through professional passages and targeted questions.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2 sm:px-3 py-1 rounded-full font-medium">
            ⏱️ 25 minutes recommended
          </span>
          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 sm:px-3 py-1 rounded-full font-medium">
            📊 15 questions • Multiple formats
          </span>
        </div>
      </div>
      
      {/* Reading Passages */}
      <div className="space-y-6 sm:space-y-8 mb-6 sm:mb-8">
        {/* Passage 1 */}
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 p-4 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Book className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-300" />
            <h4 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-200">Passage 1: The Future of Renewable Energy</h4>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded border border-slate-200 dark:border-slate-600">
            <p className="text-foreground leading-relaxed mb-4">
              The transition to renewable energy sources has become one of the most critical challenges of our time. 
              As countries worldwide grapple with climate change, the need for sustainable energy solutions has never 
              been more urgent. Solar and wind power have emerged as leading alternatives to fossil fuels, with 
              technological advances making them increasingly cost-effective.
            </p>
            <p className="text-foreground leading-relaxed mb-4">
              Recent studies indicate that renewable energy capacity has grown by 15% annually over the past decade. 
              This growth is driven by government incentives, decreasing technology costs, and growing environmental 
              awareness among consumers. Countries like Denmark and Germany have successfully integrated renewable 
              sources into their energy grids, demonstrating the feasibility of large-scale implementation.
            </p>
            <p className="text-foreground leading-relaxed">
              However, challenges remain. Energy storage technology must improve to handle the intermittent nature 
              of renewable sources. Additionally, significant infrastructure investments are required to modernize 
              existing power grids. Despite these obstacles, experts remain optimistic about achieving global 
              renewable energy targets by 2050.
            </p>
          </div>
        </div>

        {/* Passage 2 */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-4 sm:p-6 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Book className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-300" />
            <h4 className="text-base sm:text-lg font-semibold text-green-800 dark:text-green-200">Passage 2: Digital Education Revolution</h4>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded border border-green-200 dark:border-green-700">
            <p className="text-foreground leading-relaxed mb-4">
              The digital revolution has fundamentally transformed educational institutions worldwide. Online learning platforms 
              have democratized access to quality education, enabling students from remote areas to attend prestigious universities 
              virtually. This shift accelerated during the global pandemic, when traditional classroom settings became untenable.
            </p>
            <p className="text-foreground leading-relaxed mb-4">
              Artificial intelligence and machine learning are personalizing education like never before. Adaptive learning systems 
              can identify individual student weaknesses and provide customized content to address specific knowledge gaps. 
              Virtual reality is creating immersive educational experiences, allowing medical students to perform surgery simulations 
              and history students to walk through ancient civilizations.
            </p>
            <p className="text-foreground leading-relaxed">
              Despite these technological advances, critics argue that digital education lacks the human connection essential for 
              holistic development. Face-to-face interactions with teachers and peers foster emotional intelligence and social skills 
              that screen-based learning struggles to replicate. The challenge lies in balancing technological efficiency with 
              human-centered education principles.
            </p>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4 sm:space-y-6">
        {readingQuestions.map((question, index) => (
          <div key={question.id} className="border border-border rounded-lg p-4 sm:p-6 bg-card">
            <div className="flex items-start gap-3 mb-3">
              <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0 mt-0.5">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                  <h5 className="font-semibold text-sm sm:text-base leading-tight">{question.question}</h5>
                  {question.passage && (
                    <span className="text-xs bg-muted px-2 py-1 rounded self-start">
                      Passage {question.passage}
                    </span>
                  )}
                </div>
                
                {question.type === "multiple-choice" || question.type === "true-false" ? (
                  <RadioGroup
                    value={answers[question.id] || ""}
                    onValueChange={(value) => onAnswerChange(question.id, value)}
                    className="space-y-3"
                  >
                    {question.options?.map((option) => (
                      <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
                        <RadioGroupItem 
                          value={option.value} 
                          id={`${question.id}_${option.value}`} 
                          data-testid={`radio-${question.id}-${option.value}`}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <Label 
                          htmlFor={`${question.id}_${option.value}`}
                          className="text-sm leading-relaxed cursor-pointer flex-1"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : question.type === "fill-blank" ? (
                  <div className="space-y-2">
                    <Label htmlFor={question.id} className="text-sm text-muted-foreground">
                      Fill in the blank:
                    </Label>
                    <input
                      id={question.id}
                      type="text"
                      value={answers[question.id] || ""}
                      onChange={(e) => onAnswerChange(question.id, e.target.value)}
                      placeholder="Enter your answer..."
                      className="w-full px-3 py-3 sm:py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base"
                      data-testid={`input-${question.id}`}
                    />
                  </div>
                ) : question.type === "short-answer" ? (
                  <div className="space-y-2">
                    <Label htmlFor={question.id} className="text-sm text-muted-foreground">
                      Short answer (maximum 10 words):
                    </Label>
                    <input
                      id={question.id}
                      type="text"
                      value={answers[question.id] || ""}
                      onChange={(e) => onAnswerChange(question.id, e.target.value)}
                      placeholder="Write your answer here..."
                      className="w-full px-3 py-3 sm:py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base"
                      data-testid={`input-${question.id}`}
                      maxLength={50}
                    />
                    <p className="text-xs text-muted-foreground">
                      Words: {(answers[question.id] || "").split(" ").filter(Boolean).length}/10
                    </p>
                  </div>
                ) : question.type === "matching" ? (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Select all correct matches:
                    </Label>
                    <div className="space-y-3">
                      {question.options?.map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
                          <input
                            type="checkbox"
                            id={`${question.id}_${option.value}`}
                            checked={(answers[question.id] || "").includes(option.value)}
                            onChange={(e) => {
                              const currentAnswers = (answers[question.id] || "").split(",").filter(Boolean);
                              if (e.target.checked) {
                                onAnswerChange(question.id, [...currentAnswers, option.value].join(","));
                              } else {
                                onAnswerChange(question.id, currentAnswers.filter((a: string) => a !== option.value).join(","));
                              }
                            }}
                            className="rounded border-border mt-0.5 w-3 h-3 flex-shrink-0"
                            data-testid={`checkbox-${question.id}-${option.value}`}
                          />
                          <Label 
                            htmlFor={`${question.id}_${option.value}`}
                            className="text-sm leading-relaxed cursor-pointer flex-1"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Textarea
                    value={answers[question.id] || ""}
                    onChange={(e) => onAnswerChange(question.id, e.target.value)}
                    placeholder="Write your answer here..."
                    className="min-h-[100px] sm:min-h-[120px] text-base"
                    data-testid={`textarea-${question.id}`}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListeningSection({ answers, onAnswerChange }: { answers: Record<string, any>; onAnswerChange: (questionId: string, value: any) => void }) {
  const [currentAudio, setCurrentAudio] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Professional listening comprehension content for English proficiency test
  const audioFiles = [
    {
      id: "audio_1",
      title: "Business Meeting - Product Launch Discussion",
      description: "Listen to a business meeting about launching a new product.",
      audioUrl: "", // Use professional TTS instead of fake ringtone MP3
      duration: "2:45",
      transcript: "In today's meeting, we'll discuss our new product launch strategy for international markets. The target launch date is set for the beginning of next quarter. Our Digital Marketing department will lead the campaign with an estimated budget of 250 thousand dollars. The product will initially be available in 5 major cities and features AI integration and voice control capabilities. For the UK market, we must ensure GDPR data protection compliance before launch. Our Canadian expansion will require hiring 12 bilingual customer service representatives to serve both English and French-speaking customers. The main challenge we'll face is coordinating operations across different time zones when working with global teams. We've identified Toronto and Vancouver as ideal operational hubs due to their strategic location and access to skilled multilingual talent."
    }
  ];

  // Production-ready HTML5 audio with TTS fallback
  const [audioMode, setAudioMode] = useState<'loading' | 'html5' | 'tts' | 'text'>('loading');
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio system - prioritize HTML5 audio for production
    if (typeof window !== 'undefined') {
      // Try HTML5 audio first for production reliability
      if (audioFiles[currentAudio].audioUrl) {
        setAudioMode('html5');
      } else if ('speechSynthesis' in window) {
        setSpeechSynthesis(window.speechSynthesis);
        setAudioMode('tts');
      } else {
        setAudioMode('text');
      }
    }
  }, [currentAudio]);

  // HTML5 Audio Setup
  useEffect(() => {
    if (audioMode === 'html5' && audioRef.current) {
      const audio = audioRef.current;
      
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      const handleEnded = () => setIsPlaying(false);
      const handleError = () => {
        console.error('HTML5 audio failed, falling back to TTS');
        setAudioMode('tts');
        if ('speechSynthesis' in window) {
          setSpeechSynthesis(window.speechSynthesis);
        } else {
          setAudioMode('text');
        }
      };
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
      };
    }
  }, [audioMode, audioFiles[currentAudio].audioUrl]);

  // TTS Fallback Setup  
  useEffect(() => {
    if (speechSynthesis && audioFiles[currentAudio].transcript && audioMode === 'tts') {
      speechSynthesis.cancel();
      
      const newUtterance = new SpeechSynthesisUtterance(audioFiles[currentAudio].transcript);
      
      // Professional English assessment settings
      newUtterance.rate = 0.75; // Slower for better comprehension
      newUtterance.pitch = 1.0; // Natural tone
      newUtterance.volume = 1.0; // Full volume
      newUtterance.lang = 'en-US'; // Standard American English
      
      // Wait for voices to load and select best available
      const setVoice = () => {
        const voices = speechSynthesis.getVoices();
        
        // Priority order for voice selection - most professional voices first
        const preferredVoices = [
          voices.find(v => v.name.includes('Google US English') || v.name.includes('Google American')),
          voices.find(v => v.name.includes('Microsoft David') || v.name.includes('Microsoft Zira')),
          voices.find(v => v.name.includes('Alex') && v.lang.includes('en')),
          voices.find(v => v.name.includes('Daniel') && v.lang.includes('en')),
          voices.find(v => v.name.includes('Samantha') && v.lang.includes('en')),
          voices.find(v => v.lang === 'en-US' && v.default),
          voices.find(v => v.lang.startsWith('en-US')),
          voices.find(v => v.lang.startsWith('en') && v.default),
          voices.find(v => v.lang.startsWith('en'))
        ];
        
        const selectedVoice = preferredVoices.find(v => v);
        if (selectedVoice) {
          newUtterance.voice = selectedVoice;
        }
      };
      
      if (speechSynthesis.getVoices().length > 0) {
        setVoice();
      } else {
        speechSynthesis.onvoiceschanged = setVoice;
      }
      
      newUtterance.onstart = () => {
        setIsPlaying(true);
        setCurrentTime(0);
        // More accurate duration estimation
        const wordsPerMinute = 140; // Average English speaking rate
        const wordCount = audioFiles[currentAudio].transcript.split(' ').length;
        const estimatedDuration = (wordCount / wordsPerMinute) * 60;
        setDuration(Math.max(estimatedDuration, 30));
      };
      
      newUtterance.onend = () => {
        setIsPlaying(false);
        setCurrentTime(duration);
      };
      
      newUtterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
        setAudioMode('text');
      };
      
      // Track progress (approximation)
      let progressInterval: NodeJS.Timeout;
      newUtterance.onstart = () => {
        setIsPlaying(true);
        setCurrentTime(0);
        const wordsPerMinute = 140;
        const wordCount = audioFiles[currentAudio].transcript.split(' ').length;
        const totalDuration = (wordCount / wordsPerMinute) * 60;
        setDuration(totalDuration);
        
        // Update progress
        progressInterval = setInterval(() => {
          setCurrentTime(prev => {
            const next = prev + 1;
            return next >= totalDuration ? totalDuration : next;
          });
        }, 1000);
      };
      
      newUtterance.onend = () => {
        setIsPlaying(false);
        clearInterval(progressInterval);
      };
      
      setUtterance(newUtterance);
    }
  }, [speechSynthesis, audioFiles[currentAudio].transcript, audioMode]);

  const toggleAudioPlayback = () => {
    if (audioMode === 'html5' && audioRef.current) {
      // HTML5 Audio (Primary for production)
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(error => {
          console.error('HTML5 audio failed:', error);
          setAudioMode('tts');
          if ('speechSynthesis' in window) {
            setSpeechSynthesis(window.speechSynthesis);
          } else {
            setAudioMode('text');
            alert('Audio is not available. Please read the transcript below.');
          }
        });
        setIsPlaying(true);
      }
    } else if (audioMode === 'tts') {
      // TTS Fallback
      
      if (!speechSynthesis || !utterance) {
        alert('Audio system is loading. Please wait a moment and try again.');
        return;
      }
      
      if (isPlaying) {
        speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        try {
          speechSynthesis.speak(utterance);
        } catch (error) {
          console.error('Audio playback failed:', error);
          setAudioMode('text');
          alert('Audio playback is not available. Please read the text content below.');
        }
      }
    } else {
      alert('Audio is not available on your device. Please read the text content below the audio controls.');
    }
  };

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    if (audioMode === 'text') return;
    
    if (audioMode === 'html5' && audioRef.current && duration) {
      // HTML5 Audio supports seeking
      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    } else if (audioMode === 'tts') {
      // TTS doesn't support seeking - restart from beginning
      if (speechSynthesis && utterance) {
        speechSynthesis.cancel();
        setCurrentTime(0);
        if (isPlaying) {
          setTimeout(() => {
            speechSynthesis.speak(utterance);
          }, 200);
        }
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">Listening Comprehension</h3>
      <p className="text-muted-foreground mb-6">Listen carefully to the professional audio recordings and answer the questions. You can replay audio as needed.</p>
      
      {/* Audio Player */}
      <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 p-6 rounded-lg mb-8 border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
            <Headphones className="h-8 w-8 text-green-600 dark:text-green-300" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-lg text-green-800 dark:text-green-200">{audioFiles[currentAudio].title}</h4>
            <p className="text-sm text-green-600 dark:text-green-400">{audioFiles[currentAudio].description}</p>
          </div>
          <div className="text-sm text-green-700 dark:text-green-300 font-mono">
            Duration: {audioFiles[currentAudio].duration}
          </div>
        </div>
        
        {/* Audio Navigation */}
        <div className="flex justify-center gap-2 mb-4">
          {audioFiles.map((_, index) => (
            <Button
              key={index}
              variant={currentAudio === index ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (speechSynthesis) speechSynthesis.cancel();
                setIsPlaying(false);
                setCurrentAudio(index);
              }}
              data-testid={`button-audio-${index + 1}`}
            >
              Audio {index + 1}
            </Button>
          ))}
        </div>

        {/* HTML5 Audio Element */}
        {audioMode === 'html5' && (
          <audio
            ref={audioRef}
            src={audioFiles[currentAudio].audioUrl}
            preload="metadata"
            className="hidden"
          />
        )}

        {/* Audio Status */}
        <div className={`p-3 rounded border mb-4 ${
          audioMode === 'html5' ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-700' :
          audioMode === 'tts' ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-700' :
          audioMode === 'text' ? 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-700' :
          'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
        }`}>
          <p className={`text-sm ${
            audioMode === 'html5' ? 'text-green-700 dark:text-green-300' :
            audioMode === 'tts' ? 'text-yellow-700 dark:text-yellow-300' :
            audioMode === 'text' ? 'text-orange-700 dark:text-orange-300' :
            'text-slate-700 dark:text-slate-300'
          }`}>
            {audioMode === 'html5' && '🎧 High-quality MP3 audio ready. Production-grade listening experience.'}
            {audioMode === 'tts' && '🔊 Text-to-speech fallback active. Audio quality may vary by browser.'}
            {audioMode === 'text' && '📖 Audio unavailable. Read the transcript below the controls.'}
            {audioMode === 'loading' && '⏳ Loading audio system...'}
          </p>
        </div>
        
        {/* Audio Controls */}
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={toggleAudioPlayback}
            className={`gap-2 ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
            data-testid="button-audio-play"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                Pause Audio
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Play Audio
              </>
            )}
          </Button>
          
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm font-mono text-green-700 dark:text-green-300">{formatTime(currentTime)}</span>
            <div 
              className="flex-1 bg-green-200 dark:bg-green-800 h-2 rounded-full overflow-hidden cursor-pointer"
              onClick={handleSeek}
            >
              <div 
                className="bg-green-600 dark:bg-green-400 h-full transition-all duration-300"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <span className="text-sm font-mono text-green-700 dark:text-green-300">{formatTime(duration || 0)}</span>
          </div>
        </div>

        {/* Audio Instructions & Transcript */}
        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-2">📢 Instructions:</p>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-4 list-disc mb-4">
            <li>You may play the audio multiple times</li>
            <li>Take notes while listening if needed</li>
            <li>Click on the progress bar to restart audio</li>
            {audioMode === 'text' && <li className="font-medium text-orange-600 dark:text-orange-400">Read the transcript below since audio is unavailable</li>}
          </ul>
          
          {/* Transcript Display */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {audioMode === 'text' ? '📖 Audio Transcript (Read Carefully):' : '📝 Reference Transcript:'}
            </h5>
            <div className={`text-sm p-3 rounded border ${
              audioMode === 'text' 
                ? 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-700 text-orange-900 dark:text-orange-100' 
                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
              <p className="leading-relaxed">{audioFiles[currentAudio].transcript}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {listeningQuestions.map((question, index) => (
          <div key={question.id} className="border border-border rounded-lg p-6 bg-card">
            <h5 className="font-semibold mb-3">Question {index + 1}: {question.question}</h5>
            {question.type === "multiple-choice" ? (
              <RadioGroup
                value={answers[question.id] || ""}
                onValueChange={(value) => onAnswerChange(question.id, value)}
              >
                {question.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`${question.id}_${option.value}`} data-testid={`radio-${question.id}-${option.value}`} />
                    <Label htmlFor={`${question.id}_${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : question.type === "true-false" ? (
              <RadioGroup
                value={answers[question.id] || ""}
                onValueChange={(value) => onAnswerChange(question.id, value)}
              >
                {question.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`${question.id}_${option.value}`} data-testid={`radio-${question.id}-${option.value}`} />
                    <Label htmlFor={`${question.id}_${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-2">
                <Label htmlFor={question.id} className="text-sm text-muted-foreground">
                  {question.type === "fill-blank" ? "Fill in the blank:" : "Short answer:"}
                </Label>
                <input
                  id={question.id}
                  type="text"
                  value={answers[question.id] || ""}
                  onChange={(e) => onAnswerChange(question.id, e.target.value)}
                  placeholder={question.type === "fill-blank" ? "Enter your answer" : "Write your answer here..."}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid={`input-${question.id}`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function WritingSection({ answers, onAnswerChange }: { answers: Record<string, any>; onAnswerChange: (questionId: string, value: any) => void }) {
  const getWordCount = (text: string) => {
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  };

  const getWordCountColor = (count: number, min: number, max: number) => {
    if (count < min) return "text-red-500";
    if (count >= min && count <= max) return "text-green-600";
    return "text-orange-500";
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">Written Communication</h3>
      <p className="text-muted-foreground mb-6">Demonstrate your professional writing skills through these workplace-focused tasks. Complete both sections within the time limit.</p>
      
      <div className="space-y-12">
        {/* Task 1: Report/Letter */}
        <div className="border border-border rounded-lg p-6 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
              <PenTool className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <h5 className="font-semibold text-xl text-slate-700 dark:text-slate-200">Task 1: Formal Report (150+ words)</h5>
              <p className="text-sm text-slate-600 dark:text-slate-400">Recommended time: 20 minutes</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium mb-3">Instructions:</p>
            <p className="text-sm text-muted-foreground mb-4">
              You are an International Operations Manager preparing a formal report for the Board of Directors about expanding business operations to the UK, USA, and Canada. 
              Use the information below to write a comprehensive business report.
            </p>
            
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700 mb-4">
              <p className="text-sm font-medium mb-2">Key Market Research Data:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Market opportunity: £2.3M potential revenue in UK, $4.1M in USA, CAD $1.8M in Canada</li>
                <li>Compliance requirements: GDPR (UK), SOX reporting (USA), PIPEDA (Canada)</li>
                <li>Staffing needs: 15 local hires per region, bilingual requirements in Canada</li>
                <li>Investment required: $500K setup costs, $200K annual operational expenses per region</li>
                <li>Timeline: 6-month phased rollout starting Q2 2025</li>
                <li>Risk factors: Currency fluctuation, regulatory changes, talent acquisition challenges</li>
              </ul>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Include: Executive summary, market analysis, expansion strategy, financial projections, risk assessment, and final recommendation
            </p>
          </div>
          
          <Textarea
            value={answers["writing_1"] || ""}
            onChange={(e) => onAnswerChange("writing_1", e.target.value)}
            placeholder="Write your formal report here...\n\nExample structure:\n- Executive Summary\n- Current Situation\n- Proposed Solution\n- Benefits and Costs\n- Recommendation"
            className="min-h-[250px] font-mono text-sm"
            data-testid="textarea-writing-1"
          />
          
          <div className="flex justify-between items-center mt-3">
            <p className={`text-sm font-medium ${getWordCountColor(getWordCount(answers["writing_1"] || ""), 150, 200)}`}>
              Word count: {getWordCount(answers["writing_1"] || "")} {getWordCount(answers["writing_1"] || "") < 150 ? "(minimum 150)" : "✓"}
            </p>
            <p className="text-xs text-muted-foreground">Target: 150-200 words</p>
          </div>
        </div>

        {/* Task 2: Essay */}
        <div className="border border-border rounded-lg p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
              <PenTool className="h-5 w-5 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <h5 className="font-semibold text-xl text-purple-800 dark:text-purple-200">Task 2: Argumentative Essay (250+ words)</h5>
              <p className="text-sm text-purple-600 dark:text-purple-400">Recommended time: 40 minutes</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border border-purple-200 dark:border-purple-700">
            <p className="text-sm font-medium mb-3">Essay Topic:</p>
            <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded border border-purple-200 dark:border-purple-800 mb-4">
              <p className="text-base font-semibold text-purple-700 dark:text-purple-300 mb-3">
                "Remote work and flexible employment arrangements have fundamentally changed the global job market and created better opportunities for international professionals."
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                To what extent do you agree or disagree with this statement? Consider the impact on career development, work-life balance, and international mobility.
              </p>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              Instructions:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Give reasons for your answer with specific examples from professional experience or industry knowledge</li>
              <li>Present a clear position throughout your response</li>
              <li>Use professional business writing style appropriate for international workplace communication</li>
              <li>Address both advantages and challenges of remote work for international professionals</li>
              <li>Consider perspectives from different countries (UK, USA, Canada, your home country)</li>
              <li>Structure your essay with clear introduction, body paragraphs, and conclusion</li>
            </ul>
          </div>
          
          <Textarea
            value={answers["writing_2"] || ""}
            onChange={(e) => onAnswerChange("writing_2", e.target.value)}
            placeholder="Write your argumentative essay here...\n\nSuggested structure:\n- Introduction (state your position)\n- Body paragraph 1 (main argument + example)\n- Body paragraph 2 (supporting argument + example)\n- Body paragraph 3 (address counter-argument)\n- Conclusion (restate position)"
            className="min-h-[300px] font-mono text-sm"
            data-testid="textarea-writing-2"
          />
          
          <div className="flex justify-between items-center mt-3">
            <p className={`text-sm font-medium ${getWordCountColor(getWordCount(answers["writing_2"] || ""), 250, 350)}`}>
              Word count: {getWordCount(answers["writing_2"] || "")} {getWordCount(answers["writing_2"] || "") < 250 ? "(minimum 250)" : "✓"}
            </p>
            <p className="text-xs text-muted-foreground">Target: 250-350 words</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpeakingSection({ answers, onAnswerChange }: { answers: Record<string, any>; onAnswerChange: (questionId: string, value: any) => void }) {
  const handleRecordingComplete = (questionId: string, audioBlob: Blob) => {
    // Convert blob to base64 for storage
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result as string;
      onAnswerChange(questionId, {
        audioData: base64Audio,
        recordedAt: new Date().toISOString(),
        size: audioBlob.size
      });
    };
    reader.readAsDataURL(audioBlob);
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">Spoken Communication</h3>
      <p className="text-muted-foreground mb-6 text-lg">Record your responses to demonstrate professional speaking skills. Speak clearly and naturally as you would in a workplace setting.</p>
      
      <div className="space-y-8">
        <div className="border border-border rounded-lg p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
          <h5 className="font-semibold mb-3 text-xl flex items-center gap-2">
            <Mic className="h-5 w-5 text-orange-600" />
            Task 1: Professional Self-Introduction for International Role (1-2 minutes)
          </h5>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-orange-500">
            <p className="text-sm font-medium mb-2">Scenario:</p>
            <p className="text-sm text-muted-foreground mb-3">
              You are in a video interview for an international position at a multinational corporation with offices in London, New York, and Toronto. Introduce yourself professionally:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>Your name, professional background, and current role/expertise</li>
              <li>Your relevant experience for international business environments</li>
              <li>Why you're seeking opportunities in UK/USA/Canada markets</li>
              <li>Your key strengths for global team collaboration</li>
              <li>Your career objectives in the international market</li>
            </ul>
          </div>
          
          <AudioRecorder 
            onRecordingComplete={(blob) => handleRecordingComplete("speaking_1", blob)}
            maxDuration={120}
          />
          
          {answers["speaking_1"] && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">✓ Recording completed successfully</p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Recorded: {new Date(answers["speaking_1"].recordedAt).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>

        <div className="border border-border rounded-lg p-6 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900">
          <h5 className="font-semibold mb-3 text-xl flex items-center gap-2">
            <Mic className="h-5 w-5 text-slate-600" />
            Task 2: International Business Communication Analysis (2-3 minutes)
          </h5>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-slate-500">
            <p className="text-sm font-medium mb-2">Professional Discussion Topic:</p>
            <p className="text-base font-semibold mb-3 text-slate-700 dark:text-slate-300">
              "Cross-cultural communication skills are the most critical factor for success in international business environments."
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              As a professional seeking international opportunities, discuss your perspective on this statement:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>Do you agree or disagree with this statement? Provide business reasoning</li>
              <li>Share examples of cross-cultural challenges in professional settings</li>
              <li>How would you adapt your communication style for UK, USA, and Canadian colleagues?</li>
              <li>What strategies would you use to build trust across cultural boundaries?</li>
              <li>Describe a time you successfully navigated cultural differences in work</li>
            </ul>
          </div>
          
          <AudioRecorder 
            onRecordingComplete={(blob) => handleRecordingComplete("speaking_2", blob)}
            maxDuration={180}
          />

          {answers["speaking_2"] && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">✓ Recording completed successfully</p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Recorded: {new Date(answers["speaking_2"].recordedAt).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>

        <div className="border border-border rounded-lg p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <h5 className="font-semibold mb-3 text-xl flex items-center gap-2">
            <Mic className="h-5 w-5 text-purple-600" />
            Task 3: Problem Solving (2-3 minutes)
          </h5>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-purple-500">
            <p className="text-sm font-medium mb-2">Scenario:</p>
            <p className="text-base font-semibold mb-3 text-purple-700 dark:text-purple-300">
              Your company is planning to implement a hybrid work model (part remote, part office).
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              As an employee, please address these points in your response:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>What challenges might arise with this hybrid model?</li>
              <li>What solutions would you propose to address these challenges?</li>
              <li>How would you ensure effective communication and collaboration?</li>
              <li>What policies or guidelines would you recommend?</li>
              <li>How would you personally adapt to this change?</li>
            </ul>
          </div>
          
          <AudioRecorder 
            onRecordingComplete={(blob) => handleRecordingComplete("speaking_3", blob)}
            maxDuration={180}
          />

          {answers["speaking_3"] && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">✓ Recording completed successfully</p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Recorded: {new Date(answers["speaking_3"].recordedAt).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
