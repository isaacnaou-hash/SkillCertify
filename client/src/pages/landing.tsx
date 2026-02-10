import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { GraduationCap, Clock, Tag, Building, Check, Globe, Shield, Users, Award, Star, Briefcase, ArrowRight, Play, Menu, BookOpen, Headphones, PenTool, Mic } from "lucide-react";
import { useState } from "react";
import heroImage from "@assets/stock_images/professional_busines_5319ad56.jpg";
import testingImage from "@assets/stock_images/professional_english_631bf7ed.jpg";
import workplaceImage from "@assets/stock_images/diverse_professional_d2b78ccc.jpg";
import certificationImage from "@assets/stock_images/professional_english_fc9d5282.jpg";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container-responsive">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-primary mr-3" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground">EnglishPro Test</span>
                <span className="text-xs text-muted-foreground font-medium hidden sm:block">Est. 2018 • Trusted Worldwide</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" data-testid="button-login">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button data-testid="button-start-test">Start Test</Button>
              </Link>
            </div>
            
            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col space-y-4 mt-8">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start" data-testid="button-login-mobile">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full" data-testid="button-start-test-mobile">
                        Start Test - $8
                      </Button>
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Professional team collaboration" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 hero-overlay"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 container-responsive text-center py-8">
          {/* Trust Badges - Mobile optimized */}
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mb-8 animate-fade-in-up">
            <Badge className="glass-effect text-blue-700 px-3 py-1.5 text-xs sm:text-sm font-semibold shadow-soft hover:shadow-glow transition-all duration-300" data-testid="badge-test-takers">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-yellow-600" />
              <span className="hidden sm:inline">250,000+ Test Takers Certified</span>
              <span className="sm:hidden">250K+ Certified</span>
            </Badge>
            <Badge className="glass-effect text-blue-700 px-3 py-1.5 text-xs sm:text-sm font-semibold shadow-soft hover:shadow-glow transition-all duration-300" data-testid="badge-countries">
              <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-yellow-600" />
              <span className="text-yellow-600">Accepted in:</span> UK • USA • Canada
            </Badge>
            <Badge className="glass-effect text-blue-700 px-3 py-1.5 text-xs sm:text-sm font-semibold shadow-soft hover:shadow-glow transition-all duration-300" data-testid="badge-security">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-yellow-600" />
              <span className="text-yellow-600">Secure Testing</span> ISO 27001
            </Badge>
            <Badge className="glass-effect text-blue-700 px-3 py-1.5 text-xs sm:text-sm font-semibold shadow-soft hover:shadow-glow transition-all duration-300" data-testid="badge-standard">
              <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-yellow-600" />
              <span className="hidden sm:inline text-yellow-600">Official Certification</span> Since 2018
              <span className="sm:hidden">Est. 2018</span>
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-blue-600 mb-4 sm:mb-6 animate-fade-in-up leading-tight" style={{animationDelay: '0.2s'}}>
            Test Your <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              English Proficiency
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-700 mb-4 sm:mb-6 max-w-4xl mx-auto leading-relaxed animate-fade-in-up px-4" style={{animationDelay: '0.4s'}}>
            Get your <span className="text-yellow-600 font-bold">official English proficiency certificate</span> in just 60 minutes. Our <span className="text-blue-800 font-semibold">comprehensive assessment</span> tests Reading, Listening, Writing, and Speaking skills for international opportunities.
          </p>
          
          <p className="text-sm sm:text-base md:text-lg text-blue-600 font-semibold mb-6 sm:mb-8 animate-fade-in-up px-4" style={{animationDelay: '0.6s'}}>
            <span className="block sm:inline text-yellow-600">✓ Complete English Assessment</span>
            <span className="hidden sm:inline text-blue-700">  ✓ Instant Results & Certificate  ✓ Internationally Recognized</span>
            <span className="block sm:hidden text-blue-700">✓ Instant Results ✓ Global Recognition</span>
          </p>
          
          <div className="flex justify-center animate-fade-in-up px-4" style={{animationDelay: '0.8s'}}>
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="btn-gradient group w-full sm:w-auto px-6 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1" data-testid="button-take-test">
                <span className="hidden sm:inline">Take Your English Test Now - $16</span>
                <span className="sm:hidden">Start Test - $16</span>
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-white dark:bg-gray-900">
        <div className="container-responsive">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
            <div className="animate-bounce-in" style={{animationDelay: '0.1s'}}>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 mb-1 sm:mb-2">250K+</div>
              <p className="text-xs sm:text-sm md:text-base text-yellow-600 dark:text-yellow-400 font-semibold">Test Takers<br className="sm:hidden" /> Certified</p>
            </div>
            <div className="animate-bounce-in" style={{animationDelay: '0.2s'}}>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 mb-1 sm:mb-2">4</div>
              <p className="text-xs sm:text-sm md:text-base text-yellow-600 dark:text-yellow-400 font-semibold">Skills Tested<br className="sm:hidden" /> R•L•W•S</p>
            </div>
            <div className="animate-bounce-in" style={{animationDelay: '0.3s'}}>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 mb-1 sm:mb-2">60</div>
              <p className="text-xs sm:text-sm md:text-base text-yellow-600 dark:text-yellow-400 font-semibold">Minutes<br className="sm:hidden" /> Complete Test</p>
            </div>
            <div className="animate-bounce-in" style={{animationDelay: '0.4s'}}>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 mb-1 sm:mb-2">$8</div>
              <p className="text-xs sm:text-sm md:text-base text-yellow-600 dark:text-yellow-400 font-semibold">Complete Test<br className="sm:hidden" /> & Certificate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-12 sm:py-16">
        <div className="container-responsive">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700 mb-4 animate-fade-in-up">
              <span className="text-yellow-600">English Proficiency Test:</span> What You Need to Know
            </h2>
            <p className="text-lg sm:text-xl text-blue-600 max-w-3xl mx-auto animate-fade-in-up px-4" style={{animationDelay: '0.2s'}}>
              A <span className="text-yellow-600 font-semibold">comprehensive English language assessment</span> that evaluates your Reading, Listening, Writing, and Speaking abilities for international certification
            </p>
          </div>

          {/* Features Grid with Images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 animate-fade-in-up">
            <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group overflow-hidden">
              <div className="relative h-40 sm:h-48 overflow-hidden">
                <img 
                  src={testingImage} 
                  alt="Professional taking English assessment" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                  <div className="bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-lg">
                    <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                  </div>
                </div>
              </div>
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-blue-700"><span className="text-yellow-600">Test Duration:</span> Complete in 60 Minutes</h3>
                <p className="text-sm sm:text-base text-blue-600">Comprehensive <span className="text-yellow-600 font-semibold">English proficiency assessment</span> covering Reading, Listening, Writing, and Speaking. Get your results immediately after completion.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group overflow-hidden">
              <div className="relative h-40 sm:h-48 overflow-hidden">
                <img 
                  src={certificationImage} 
                  alt="Professional certificate and graduation" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                  <div className="bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-lg">
                    <Award className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                </div>
              </div>
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-blue-700"><span className="text-yellow-600">Instant Results:</span> Digital Certificate</h3>
                <p className="text-sm sm:text-base text-blue-600">Receive your <span className="text-yellow-600 font-semibold">official English proficiency certificate</span> immediately upon test completion. Download and share your verified results instantly.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group overflow-hidden">
              <div className="relative h-40 sm:h-48 overflow-hidden">
                <img 
                  src={workplaceImage} 
                  alt="Diverse professionals in modern workplace" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                  <div className="bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-lg">
                    <Building className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                </div>
              </div>
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-blue-700"><span className="text-yellow-600">Global Recognition:</span> International Standard</h3>
                <p className="text-sm sm:text-base text-blue-600">Your certificate is <span className="text-yellow-600 font-semibold">internationally recognized</span> and accepted by employers, universities, and institutions in UK, USA, Canada and worldwide.</p>
              </CardContent>
            </Card>
          </div>

          {/* Test Structure Section - IELTS-like */}
          <div className="mb-12 sm:mb-16 md:mb-20">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700 mb-4 animate-fade-in-up">
                <span className="text-yellow-600">Test Structure:</span> What to Expect
              </h2>
              <p className="text-lg sm:text-xl text-blue-600 max-w-3xl mx-auto animate-fade-in-up px-4" style={{animationDelay: '0.2s'}}>
                Your <span className="text-yellow-600 font-semibold">60-minute English proficiency test</span> includes four essential language skills
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in-up">
              <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 hover:border-blue-300">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-blue-700 mb-2">Reading</h3>
                  <p className="text-sm sm:text-base text-blue-600 mb-2">15 minutes</p>
                  <p className="text-xs sm:text-sm text-slate-600">Comprehension questions and passages testing your reading skills</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 hover:border-blue-300">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Headphones className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-blue-700 mb-2">Listening</h3>
                  <p className="text-sm sm:text-base text-blue-600 mb-2">15 minutes</p>
                  <p className="text-xs sm:text-sm text-slate-600">Audio clips and conversations to assess listening comprehension</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 hover:border-blue-300">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <PenTool className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-blue-700 mb-2">Writing</h3>
                  <p className="text-sm sm:text-base text-blue-600 mb-2">15 minutes</p>
                  <p className="text-xs sm:text-sm text-slate-600">Essay writing tasks to evaluate your written communication</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 hover:border-blue-300">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Mic className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-blue-700 mb-2">Speaking</h3>
                  <p className="text-sm sm:text-base text-blue-600 mb-2">15 minutes</p>
                  <p className="text-xs sm:text-sm text-slate-600">Voice recording tasks to test your spoken English abilities</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mb-12 sm:mb-16 md:mb-20">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700 mb-4 animate-fade-in-up">
                <span className="text-yellow-600">How It Works:</span> Simple 4-Step Process
              </h2>
              <p className="text-lg sm:text-xl text-blue-600 max-w-3xl mx-auto animate-fade-in-up px-4" style={{animationDelay: '0.2s'}}>
                Get your <span className="text-yellow-600 font-semibold">English proficiency certificate</span> with our 60-minute test
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in-up">
              <div className="text-center p-4 sm:p-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 relative">
                  <Users className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm sm:text-base font-bold">1</div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-blue-700 mb-2 sm:mb-3">Register</h3>
                <p className="text-sm sm:text-base text-blue-600">Create your account with basic details. Takes less than 2 minutes.</p>
              </div>

              <div className="text-center p-4 sm:p-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 relative">
                  <Tag className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm sm:text-base font-bold">2</div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-blue-700 mb-2 sm:mb-3">Pay Securely</h3>
                <p className="text-sm sm:text-base text-blue-600">Safe $16 payment via Paystack. All major cards accepted worldwide.</p>
              </div>

              <div className="text-center p-4 sm:p-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 relative">
                  <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm sm:text-base font-bold">3</div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-blue-700 mb-2 sm:mb-3">Take Test</h3>
                <p className="text-sm sm:text-base text-blue-600">Complete 60-minute test covering Reading, Listening, Writing, and Speaking.</p>
              </div>

              <div className="text-center p-4 sm:p-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 relative">
                  <Award className="h-8 w-8 sm:h-10 sm:w-10 text-orange-600" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm sm:text-base font-bold">4</div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-blue-700 mb-2 sm:mb-3">Get Certificate</h3>
                <p className="text-sm sm:text-base text-blue-600">Instant results and downloadable certificate. Share immediately!</p>
              </div>
            </div>

            {/* Requirements */}
            <div className="mt-8 sm:mt-12 bg-blue-50 dark:bg-blue-950/20 p-4 sm:p-6 rounded-lg">
              <h4 className="text-lg sm:text-xl font-bold text-blue-700 mb-3 sm:mb-4 text-center">
                <span className="text-yellow-600">What You Need:</span> Test Requirements
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm sm:text-base text-blue-600">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Webcam & Microphone</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm sm:text-base text-blue-600">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Stable Internet Connection</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm sm:text-base text-blue-600">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Quiet Testing Environment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Statistics Section */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 py-8 sm:py-12 md:py-16 mb-8 sm:mb-12 md:mb-16 rounded-2xl sm:rounded-3xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 hidden sm:block">
              <img 
                src={workplaceImage} 
                alt="Professional workplace" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="container-responsive relative z-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-2 sm:mb-4 text-blue-700">Trusted by <span className="text-yellow-600">Test-Takers</span> Worldwide</h2>
              <p className="text-center text-blue-600 mb-8 sm:mb-12 text-sm sm:text-base px-4">Join thousands of professionals who've advanced their careers with our <span className="text-yellow-600 font-semibold">English proficiency certification</span></p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
                <div className="text-center" data-testid="stat-success">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">98.5%</div>
                  <div className="text-xs sm:text-sm md:text-base text-yellow-600 font-semibold">Pass Rate<br className="sm:hidden" /> Success</div>
                </div>
                <div className="text-center" data-testid="stat-countries">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">15+</div>
                  <div className="text-xs sm:text-sm md:text-base text-yellow-600 font-semibold">Countries Accept<br className="sm:hidden" /> Certificate</div>
                </div>
                <div className="text-center" data-testid="stat-tests">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">250K+</div>
                  <div className="text-xs sm:text-sm md:text-base text-yellow-600 font-semibold">Test-Takers<br className="sm:hidden" /> Certified</div>
                </div>
                <div className="text-center" data-testid="stat-satisfaction">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">4.9/5</div>
                  <div className="text-xs sm:text-sm md:text-base text-yellow-600 font-semibold">Test-Taker<br className="sm:hidden" /> Rating</div>
                </div>
              </div>

              {/* Certificate Acceptance */}
              <div className="border-t border-border pt-8 sm:pt-12">
                <p className="text-center text-blue-600 mb-6 sm:mb-8 text-sm sm:text-base px-4">Your certificate is <span className="text-yellow-600 font-semibold">accepted by employers, universities, and institutions</span> worldwide</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 sm:gap-6 md:gap-8 items-center justify-items-center opacity-70">
                  <div className="flex flex-col items-center justify-center h-12 w-20 sm:h-16 sm:w-28 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-800 dark:to-blue-700 rounded-lg border">
                    <Briefcase className="h-3 w-3 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-300 mb-1" />
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-200">Employers</span>
                  </div>
                  <div className="flex flex-col items-center justify-center h-12 w-20 sm:h-16 sm:w-28 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg border">
                    <Building className="h-3 w-3 sm:h-5 sm:w-5 text-green-600 dark:text-green-300 mb-1" />
                    <span className="text-xs font-medium text-green-800 dark:text-green-200">Universities</span>
                  </div>
                  <div className="flex flex-col items-center justify-center h-12 w-20 sm:h-16 sm:w-28 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg border">
                    <Globe className="h-3 w-3 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-300 mb-1" />
                    <span className="text-xs font-medium text-purple-800 dark:text-purple-200">Immigration</span>
                  </div>
                  <div className="flex flex-col items-center justify-center h-12 w-20 sm:h-16 sm:w-28 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-lg border">
                    <Users className="h-3 w-3 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-300 mb-1" />
                    <span className="text-xs font-medium text-orange-800 dark:text-orange-200">Professionals</span>
                  </div>
                  <div className="flex flex-col items-center justify-center h-12 w-20 sm:h-16 sm:w-28 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg border">
                    <Shield className="h-3 w-3 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-300 mb-1" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Government</span>
                  </div>
                  <div className="flex flex-col items-center justify-center h-12 w-20 sm:h-16 sm:w-28 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 rounded-lg border">
                    <Award className="h-3 w-3 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-300 mb-1" />
                    <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">Institutions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-blue-700">What <span className="text-yellow-600">Test-Takers</span> Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <Card className="border-2 border-green-200 dark:border-green-800" data-testid="testimonial-1">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="flex text-yellow-500" data-testid="rating-1">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                    </div>
                  </div>
                  <p className="text-blue-600 mb-3 sm:mb-4 italic text-sm sm:text-base">
                    "I took the test for my job application to a Canadian company. It was straightforward and covered all four skills - Reading, Listening, Writing, and Speaking. Got my certificate instantly and landed the job!"
                  </p>
                  <div className="font-semibold text-sm sm:text-base text-blue-700">Sarah Chen</div>
                  <div className="text-xs sm:text-sm text-yellow-600">Software Engineer, moved to Toronto</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-slate-200 dark:border-slate-700" data-testid="testimonial-2">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="flex text-yellow-500" data-testid="rating-2">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                    </div>
                  </div>
                  <p className="text-blue-600 mb-3 sm:mb-4 italic text-sm sm:text-base">
                    "Perfect for my university application! The test was well-structured with clear instructions. I especially liked the speaking section - it felt natural and not intimidating. Highly recommend for anyone needing English certification."
                  </p>
                  <div className="font-semibold text-sm sm:text-base text-blue-700">Michael Rodriguez</div>
                  <div className="text-xs sm:text-sm text-yellow-600">MBA Student, London Business School</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 dark:border-purple-800" data-testid="testimonial-3">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="flex text-yellow-500" data-testid="rating-3">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                    </div>
                  </div>
                  <p className="text-blue-600 mb-3 sm:mb-4 italic text-sm sm:text-base">
                    "Needed to prove my English skills for my visa application to the US. The test was exactly 60 minutes as promised, and I received my certificate immediately. The process was smooth and professional."
                  </p>
                  <div className="font-semibold text-sm sm:text-base text-blue-700">Emma Thompson</div>
                  <div className="text-xs sm:text-sm text-yellow-600">Marketing Professional, relocated to New York</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Pricing Section */}
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-4 sm:p-6 md:p-8 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-4">
                <Badge className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 text-xs sm:text-sm font-semibold" data-testid="badge-required">
                  EMPLOYER REQUIRED
                </Badge>
                <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 text-xs sm:text-sm font-semibold" data-testid="badge-secure">
                  SECURE & VERIFIED
                </Badge>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Professional English Certification</h2>
              <div className="mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">$16</span>
                <span className="text-muted-foreground text-sm sm:text-base">/assessment</span>
                <div className="text-xs sm:text-sm text-muted-foreground mt-2">Industry-standard pricing since 2018 • No hidden fees</div>
              </div>
              <ul className="text-left mb-6 sm:mb-8 space-y-2 sm:space-y-3">
                <li className="flex items-start">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Workplace-required English proficiency verification</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Instant results sent directly to your employer</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Official workplace compliance certificate</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Employer verification and tracking system</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Permanent employment record access</span>
                </li>
              </ul>
              <Link href="/register">
                <Button size="lg" className="w-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold" data-testid="button-start-your-test">
                  Complete Required Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 sm:py-12">
        <div className="container-responsive">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 md:col-span-1">
              <div className="flex items-center mb-4">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary mr-2 sm:mr-3" />
                <span className="text-lg sm:text-xl font-bold">EnglishPro Test</span>
              </div>
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm sm:text-base">
                  Professional English certification trusted by employers worldwide.
                </p>
                <div className="flex flex-wrap gap-3 sm:gap-4 items-center text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-green-500" />
                    Bank-level Security
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-slate-600" />
                    Global Recognition
                  </div>
                  <div className="flex items-center">
                    <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-purple-500" />
                    ISO Certified
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Test Info</h4>
              <ul className="space-y-1 sm:space-y-2 text-muted-foreground text-sm sm:text-base">
                <li><a href="#" className="hover:text-foreground">How it Works</a></li>
                <li><a href="#" className="hover:text-foreground">Sample Questions</a></li>
                <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">Certification</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
              <ul className="space-y-1 sm:space-y-2 text-muted-foreground text-sm sm:text-base">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground">Technical Support</a></li>
                <li><a href="#" className="hover:text-foreground">Verify Tag</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-1 sm:space-y-2 text-muted-foreground text-sm sm:text-base">
                <li><a href="#" className="hover:text-foreground">About Us</a></li>
                <li><a href="#" className="hover:text-foreground">For Employers</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-muted-foreground">
            <p className="text-xs sm:text-sm">&copy; {new Date().getFullYear()} EnglishPro Test. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
