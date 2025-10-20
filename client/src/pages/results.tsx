import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import CertificateGenerator from "@/components/certificate-generator";
import { formatUserName } from "@/utils/certificate";
import { GraduationCap, CheckCircle, RotateCcw, Briefcase } from "lucide-react";

export default function Results() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();
  
  // Check if user is authenticated for retake logic
  const userId = localStorage.getItem("user_id");
  const userEmail = localStorage.getItem("user_email");
  const authToken = localStorage.getItem("auth_token");
  const isAuthenticated = Boolean(userId && userEmail && authToken);

  const { data: sessionData, isLoading } = useQuery<{ session: any }>({
    queryKey: ["/api/test-sessions", sessionId],
    enabled: !!sessionId,
  });

  const { data: userData } = useQuery<{ user: any }>({
    queryKey: ["/api/users", sessionData?.session?.userId],
    enabled: !!sessionData?.session?.userId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  console.log("Session data:", sessionData);
  
  if (!sessionData?.session || sessionData.session.status !== "completed") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Results not available</h2>
            <p className="text-muted-foreground mb-4">
              Test results are not ready or test has not been completed.
              {sessionData?.session && (
                <span className="block text-xs mt-2">
                  Current status: {sessionData.session.status}
                </span>
              )}
            </p>
            <Button onClick={() => setLocation("/")} data-testid="button-back-home">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const session = sessionData.session;
  const user = userData?.user;

  const getScoreLevel = (score: number) => {
    if (score >= 90) return { level: "Advanced", color: "text-green-600" };
    if (score >= 80) return { level: "Proficient", color: "text-slate-600" };
    if (score >= 70) return { level: "Intermediate", color: "text-yellow-600" };
    return { level: "Basic", color: "text-orange-600" };
  };

  const scoreLevel = getScoreLevel(session.totalScore || 0);

  // This will be handled by the CertificateGenerator component

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-card border-b border-border">
        <div className="container-responsive">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-2 sm:mr-3" />
              <span className="text-lg sm:text-xl font-bold text-foreground">EnglishPro Test</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-8 sm:py-12 md:py-16">
        <div className="container-responsive">
          {/* Results Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="bg-green-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">Certification Complete!</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Your English proficiency has been successfully assessed. Download your official certificate below.</p>
          </div>

          {/* Results Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* Overall Score */}
            <Card>
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Assessment Summary</h3>
                
                <div className="text-center mb-4 sm:mb-6">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2" data-testid="text-total-score">
                    {session.totalScore}
                  </div>
                  <div className="text-base sm:text-lg text-muted-foreground">Composite Score</div>
                  <div className={`text-sm font-medium mt-1 ${scoreLevel.color}`} data-testid="text-score-level">
                    {scoreLevel.level} Level
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm sm:text-base">Test Date</span>
                    <span className="text-muted-foreground text-sm sm:text-base" data-testid="text-test-date">
                      {session.completedAt ? new Date(session.completedAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm sm:text-base">Duration</span>
                    <span className="text-muted-foreground text-sm sm:text-base">58 minutes</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                    <span className="font-medium text-sm sm:text-base">Certificate ID</span>
                    <span className="text-muted-foreground font-mono text-xs sm:text-sm break-all" data-testid="text-certificate-id">
                      {session.certificateId}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Breakdown */}
            <Card>
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Skills Assessment</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="flex items-center text-sm sm:text-base">
                        <div className="w-3 h-3 bg-slate-600 rounded mr-2"></div>
                        Reading
                      </span>
                      <span className="font-semibold text-sm sm:text-base" data-testid="text-reading-score">
                        {session.readingScore}/100
                      </span>
                    </div>
                    <Progress value={session.readingScore || 0} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="flex items-center text-sm sm:text-base">
                        <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                        Listening
                      </span>
                      <span className="font-semibold text-sm sm:text-base" data-testid="text-listening-score">
                        {session.listeningScore}/100
                      </span>
                    </div>
                    <Progress value={session.listeningScore || 0} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="flex items-center text-sm sm:text-base">
                        <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                        Writing
                      </span>
                      <span className="font-semibold text-sm sm:text-base" data-testid="text-writing-score">
                        {session.writingScore}/100
                      </span>
                    </div>
                    <Progress value={session.writingScore || 0} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="flex items-center text-sm sm:text-base">
                        <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                        Speaking
                      </span>
                      <span className="font-semibold text-sm sm:text-base" data-testid="text-speaking-score">
                        {session.speakingScore}/100
                      </span>
                    </div>
                    <Progress value={session.speakingScore || 0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Certificate Preview with Download */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center">Professional Certificate</h3>
            
            <CertificateGenerator
              data={{
                userName: user ? `${user.firstName} ${user.lastName}` : formatUserName(user?.email || '', ''),
                overallScore: session.totalScore || 0,
                sectionScores: {
                  reading: session.readingScore || 0,
                  listening: session.listeningScore || 0,
                  writing: session.writingScore || 0,
                  speaking: session.speakingScore || 0
                },
                certificateId: session.certificateId || "",
                completionDate: session.completedAt ? new Date(session.completedAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }),
                testDuration: "58 minutes"
              }}
            />
            
          </div>

          {/* Next Steps */}
          <Card>
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">What's Next?</h3>
              
              {/* Dashboard Access */}
              <div className="mb-6">
                <Button 
                  className="w-full sm:w-auto mr-4 mb-2 sm:mb-0" 
                  onClick={() => setLocation("/dashboard")}
                  data-testid="button-dashboard"
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  View My Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto" 
                  onClick={() => setLocation("/")}
                  data-testid="button-home"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Return Home
                </Button>
              </div>
              
              <div className="text-center">
                <h4 className="font-semibold mb-3 text-sm sm:text-base">Retake Test</h4>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  Want to improve your score? You can retake the test anytime.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/register")}
                  data-testid="button-retake-test"
                  className="w-full sm:w-auto"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Take Test Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
