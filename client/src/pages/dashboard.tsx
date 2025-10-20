import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Clock, BookOpen, FileText, Mic, LogOut } from "lucide-react";
import type { TestSession } from "@shared/schema";

export default function Dashboard() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  // Get user info from localStorage
  const userId = localStorage.getItem("user_id");
  const userEmail = localStorage.getItem("user_email");
  const authToken = localStorage.getItem("auth_token");
  const isAuthenticated = Boolean(userId && authToken);

  // Fetch incomplete test sessions
  const { data: incompleteSessions, isLoading, error: incompleteError } = useQuery<{sessions: TestSession[]}>({
    queryKey: ["/api/users", userId, "incomplete-sessions"],
    refetchInterval: 5000, // Refresh every 5 seconds to check payment status
    enabled: isAuthenticated,
  });

  // Fetch completed test sessions
  const { data: allSessions, isLoading: isLoadingAll, error: allSessionsError } = useQuery<{sessions: TestSession[]}>({
    queryKey: ["/api/users", userId, "test-sessions"],
    enabled: isAuthenticated,
  });

  // Redirect to login if no auth (using useEffect to avoid hooks violation)
  React.useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);


  // Filter for completed sessions
  const completedSessions = allSessions?.sessions?.filter(session => 
    session.status === 'completed' && session.certificateId
  ) || [];

  // Resume test session mutation
  const resumeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest("POST", `/api/users/${userId}/resume-session/${sessionId}`);
      return response.json();
    },
    onSuccess: (data) => {
      // Store new session token
      localStorage.setItem(`session_token_${data.session.id}`, data.sessionToken);
      
      toast({
        title: "Test resumed",
        description: "Continuing your English proficiency test",
      });

      // Navigate to test page
      setLocation(`/test/${data.session.id}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to resume test",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    
    // Clear session tokens
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("session_token_")) {
        localStorage.removeItem(key);
      }
    });

    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });

    setLocation("/");
  };

  const handleResumeTest = (sessionId: string) => {
    resumeSessionMutation.mutate(sessionId);
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (session: TestSession) => {
    if (session.paymentStatus === 'pending') {
      return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Payment Pending</Badge>;
    }
    if (session.status === 'pending') {
      return <Badge variant="outline" className="text-slate-600 border-slate-600">Ready to Start</Badge>;
    }
    if (session.status === 'in_progress') {
      return <Badge variant="outline" className="text-green-600 border-green-600">In Progress</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container-responsive">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-3 sm:gap-0">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Test Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
                Welcome back, {userEmail}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button
                variant="outline"
                onClick={handleLogout}
                data-testid="button-logout"
                className="w-full sm:w-auto"
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-responsive py-4 sm:py-6 md:py-8">
        {/* Incomplete Tests Section - Primary Focus */}
        <Card className="mb-16 shadow-2xl border-4 border-blue-300 dark:border-blue-600 bg-gradient-to-br from-blue-100 via-blue-50 to-white dark:from-blue-900 dark:via-blue-950 dark:to-gray-800 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 dark:bg-blue-800 opacity-20 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-300 dark:bg-blue-700 opacity-15 rounded-full translate-y-12 -translate-x-12"></div>
          <CardHeader className="relative z-10 pb-8">
            <div className="text-center">
              <CardTitle className="flex items-center justify-center text-3xl sm:text-4xl font-bold mb-4">
                <Clock className="w-10 h-10 mr-4 text-blue-600" />
                English Proficiency Test
              </CardTitle>
              <p className="text-xl text-blue-700 dark:text-blue-300 font-semibold mb-2">
                Start or resume your English proficiency certification test
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Ready to begin
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-300">Loading your tests...</span>
              </div>
            ) : !incompleteSessions?.sessions || incompleteSessions.sessions.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-20 h-20 mx-auto text-blue-400 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Ready to Begin Your Test
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                  Start your comprehensive English proficiency certification test. Get your CEFR-level assessment for international employment opportunities.
                </p>
                <div className="max-w-xl mx-auto mb-8 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
                    <strong>Remember:</strong> Use your legal name when registering - your certificate will display exactly what you enter.
                  </p>
                </div>
                <Button 
                  onClick={() => setLocation("/register")} 
                  data-testid="button-start-new-test"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-12 py-4 text-xl shadow-xl transform hover:scale-105 transition-all duration-200"
                  size="lg"
                >
                  🚀 Start New Test
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {incompleteSessions.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="border-3 border-blue-300 dark:border-blue-600 rounded-xl p-8 hover:bg-gradient-to-r hover:from-blue-50 hover:to-white dark:hover:from-blue-950 dark:hover:to-gray-800 transition-all duration-300 bg-white dark:bg-gray-800 shadow-xl transform hover:scale-[1.02]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                          <h3 className="font-bold text-gray-900 dark:text-white text-2xl sm:text-3xl">
                            English Proficiency Test
                          </h3>
                          {getStatusBadge(session)}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3">
                          <div className="flex items-center">
                            <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">Created: {formatDate(session.createdAt)}</span>
                          </div>
                          {session.startedAt && (
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                              <span className="truncate">Started: {formatDate(session.startedAt)}</span>
                            </div>
                          )}
                          <div className="flex items-center sm:col-span-2 lg:col-span-1">
                            <Mic className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                            <span className="text-xs sm:text-sm">Reading, Listening, Writing, Speaking</span>
                          </div>
                        </div>

                        {session.paymentStatus === 'pending' && (
                          <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400 mb-2">
                            ⚠️ Payment required to continue this test
                          </p>
                        )}
                      </div>

                      <div className="w-full sm:w-auto sm:ml-4">
                        {session.paymentStatus === 'completed' ? (
                          <Button
                            onClick={() => handleResumeTest(session.id)}
                            disabled={resumeSessionMutation.isPending}
                            data-testid={`button-resume-${session.id}`}
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-8 py-3 text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                            size="lg"
                          >
                            {resumeSessionMutation.isPending ? 
                              "Starting..." : 
                              (session.status === 'pending' ? "Start Test" : "Resume Test")
                            }
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            disabled 
                            data-testid={`button-payment-pending-${session.id}`}
                            className="w-full sm:w-auto"
                            size="sm"
                          >
                            Payment Pending
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Test Sessions - Secondary */}
        <Card className="mt-20 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-base text-gray-600 dark:text-gray-400">
              <FileText className="w-4 h-4 mr-2" />
              Completed Tests & Certificates
            </CardTitle>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Download certificates from completed tests
            </p>
          </CardHeader>
          <CardContent>
            {isLoadingAll ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-300">Loading your certificates...</span>
              </div>
            ) : completedSessions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No completed tests
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Complete a test to earn your English proficiency certificate.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedSessions.map((session) => (
                  <div
                    key={session.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                            English Proficiency Test
                          </h3>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit">
                            ✓ Completed
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">Completed: {session.completedAt ? formatDate(session.completedAt) : 'Recently'}</span>
                          </div>
                          <div className="flex items-center sm:col-span-2 lg:col-span-1">
                            <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-mono break-all">ID: {session.certificateId}</span>
                          </div>
                          <div className="flex items-center">
                            <Badge variant="secondary" className="text-xs">
                              Score: {session.totalScore}/100
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto sm:ml-4">
                        <Button
                          onClick={() => setLocation(`/results/${session.id}`)}
                          variant="outline"
                          data-testid={`button-download-certificate-${session.id}`}
                          className="w-full sm:w-auto"
                          size="sm"
                        >
                          Download Certificate
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}