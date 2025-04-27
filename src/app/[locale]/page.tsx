'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ReactNode, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';

// Simple fade-in component using CSS instead of framer-motion
const FadeIn = ({ children, delay = 0, className = "" }: { children: ReactNode, delay?: number, className?: string }) => {
  return (
    <div 
      className={`opacity-0 translate-y-4 animate-fadeIn ${className}`}
      style={{ animationDelay: `${delay * 0.1}s`, animationFillMode: 'forwards' }}
    >
      {children}
    </div>
  );
};

// Enhanced motion component with more animation options
const Motion = ({ 
  children, 
  delay = 0, 
  className = "", 
  animation = "fade-up",
  duration = 0.8,
  once = true
}: { 
  children: ReactNode, 
  delay?: number, 
  className?: string,
  animation?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale" | "none",
  duration?: number,
  once?: boolean
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay * 100);
    
    return () => clearTimeout(timer);
  }, [delay]);

  const getAnimationClass = () => {
    switch (animation) {
      case "fade-up": return "opacity-0 translate-y-8";
      case "fade-down": return "opacity-0 -translate-y-8";
      case "fade-left": return "opacity-0 translate-x-8";
      case "fade-right": return "opacity-0 -translate-x-8";
      case "scale": return "opacity-0 scale-95";
      case "none": return "";
      default: return "opacity-0 translate-y-8";
    }
  };

  return (
    <div 
      className={`transform transition-all ${className} ${!isVisible ? getAnimationClass() : 'opacity-100 translate-y-0 translate-x-0 scale-100'}`}
      style={{ 
        transitionDelay: `${delay * 0.1}s`, 
        transitionDuration: `${duration}s` 
      }}
    >
      {children}
    </div>
  );
};

// Dynamic background blobs component
const BackgroundBlobs = () => {
  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-400/30 dark:bg-blue-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-40 w-96 h-96 bg-purple-400/30 dark:bg-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-400/30 dark:bg-pink-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
    </div>
  );
};

// Animated notification badge component
const NotificationBadge = ({ 
  children, 
  className = "", 
  delay = 0 
}: { 
  children: ReactNode, 
  className?: string, 
  delay?: number 
}) => {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg ${className}`}
      style={{ 
        animation: `fade-in-up 0.6s ${delay * 0.1}s backwards, float 3s ${delay * 0.1 + 0.6}s ease-in-out infinite` 
      }}
    >
      {children}
    </div>
  );
};

// Define animations outside the component to avoid recalculation on each render
const featureCardAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const statsAnimation = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.6 }
};

export default function Home() {
  const t = useTranslations('Home');
  const locale = useLocale();
  const { data: session, status } = useSession();

  // Check if user is properly authenticated with a valid user object
  const isAuthenticated = status === 'authenticated' && session && session.user;

  // Determine dashboard path based on user role
  const getDashboardPath = () => {
    if (!isAuthenticated) return `/${locale}/auth/register`;
    
    const role = session.user.role?.toLowerCase() || '';
    
    if (role.includes('admin')) {
      return `/${locale}/dashboard/admin`;
    } else if (role.includes('institution')) {
      return `/${locale}/dashboard/institution`;
    } else {
      return `/${locale}/dashboard/users`;
    }
  };

  // Get button text based on session state
  const getStartedText = () => {
    if (isAuthenticated) {
      return t('goToDashboard');
    }
    return t('getStarted');
  };

  const getStartedAction = () => {
    if (isAuthenticated) {
      return getDashboardPath();
    }
    return `/${locale}/auth/register`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      {/* Hero Section - Enhanced with modern design */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <BackgroundBlobs />
        
        {/* Enhanced grid background pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 dark:opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left content */}
            <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
              <Motion>
                <span className="inline-block py-1 px-3 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
                  {t('featureTag') || "Platform Features"}
                </span>
              </Motion>
              
              <Motion delay={1}>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 leading-tight">
                  {t('title')}
                </h1>
              </Motion>
              
              <Motion delay={2}>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  {t('subtitle')}
                </p>
              </Motion>
              
              <Motion delay={3}>
                <div className="mt-8 flex flex-col sm:flex-row items-center  gap-4">
                  <Link
                    href={getStartedAction()}
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-xl border border-blue-700 dark:border-blue-600 transform hover:-translate-y-1 w-full sm:w-auto"
                  >
                    {getStartedText()}
                  </Link>
                  <Link
                    href={`/${locale}/verify`}
                    className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-700 transform hover:-translate-y-1"
                  >
                    {t('verifyCredential')}
                  </Link>
                </div>
              </Motion>
              
              <Motion delay={4}>
                <div className="mt-8 flex items-center gap-2 justify-center lg:justify-start text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>No credit card required</span>
                  <span className="mx-2">•</span>
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Free tier available</span>
                </div>
              </Motion>
            </div>
            
            {/* Right content - 3D Dashboard Mockup */}
            <div className="flex-1 w-full max-w-2xl">
              <Motion delay={2} className="relative">
                <div className="relative perspective-1000">
                  <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transform rotate-y-3 rotate-x-5 transition-transform hover:rotate-y-5 hover:rotate-x-10 relative z-20">
                    <div className="h-10 bg-gray-100 dark:bg-gray-900 w-full flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                    <div className="relative">
                      {/* Dashboard mockup image */}
                      <div className="w-full h-[450px] bg-gray-50 dark:bg-gray-900 overflow-hidden">
                        <div className="p-4">
                          <div className="h-12 flex items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                            <div className="w-32 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-md"></div>
                            <div className="ml-auto flex gap-2">
                              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                              <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                            </div>
                          </div>
                          
                          <div className="flex gap-4 mb-6">
                            <div className="flex-1 h-24 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                              <div className="h-8 w-16 bg-blue-100 dark:bg-blue-900/30 rounded"></div>
                            </div>
                            <div className="flex-1 h-24 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                              <div className="h-8 w-16 bg-green-100 dark:bg-green-900/30 rounded"></div>
                            </div>
                            <div className="flex-1 h-24 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                              <div className="h-8 w-16 bg-purple-100 dark:bg-purple-900/30 rounded"></div>
                            </div>
                          </div>
                          
                          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 mb-6">
                            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                          </div>
                          
                          <div className="flex gap-4">
                            <div className="w-1/3 h-32 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                              <div className="h-16 w-full bg-blue-50 dark:bg-blue-900/10 rounded-lg mt-2"></div>
                            </div>
                            <div className="w-2/3 h-32 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                              <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                              <div className="grid grid-cols-5 gap-2 mt-2">
                                {[...Array(10)].map((_, i) => (
                                  <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent"></div>
                    </div>
                  </div>
                  
                  {/* Shadow effect */}
                  <div className="absolute -bottom-6 left-0 right-0 h-12 mx-auto bg-black/20 dark:bg-black/40 blur-xl rounded-full w-4/5 z-10"></div>
                </div>
                
                {/* Animated notification badges */}
                <NotificationBadge className="absolute -left-4 md:-left-10 top-1/4 z-30" delay={6}>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">Credential Verified</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Just now</p>
                    </div>
                  </div>
                </NotificationBadge>
                
                <NotificationBadge className="absolute -right-4 md:-right-10 top-2/3 z-30" delay={8}>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">New Certificate</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">5 min ago</p>
                    </div>
                  </div>
                </NotificationBadge>
                
                <NotificationBadge className="absolute left-1/4 -bottom-4 z-30" delay={10}>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">Institution Invited</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">12 min ago</p>
                    </div>
                  </div>
                </NotificationBadge>
              </Motion>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section - Enhanced */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <Motion>
            <div className="flex flex-col items-center mb-16 text-center">
              <span className="inline-block py-1 px-3 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
                {t('featureTag') || "Platform Features"}
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 gradient-text max-w-3xl">
                {t('featuresTitle')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
                Our platform provides a comprehensive suite of tools to make credential verification secure, simple, and efficient.
              </p>
            </div>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <Motion delay={2} className="group">
              <div className="h-full bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{t('feature1Title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t('feature1Description')}</p>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-auto">
                  <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center group-hover:translate-x-2 transition-transform">
                    Learn more
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Motion>

            {/* Feature 2 */}
            <Motion delay={3} className="group">
              <div className="h-full bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-2">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-2xl flex items-center justify-center mb-6 text-green-600 dark:text-green-400 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{t('feature2Title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t('feature2Description')}</p>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-auto">
                  <span className="text-green-600 dark:text-green-400 font-medium flex items-center group-hover:translate-x-2 transition-transform">
                    Learn more
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Motion>

            {/* Feature 3 */}
            <Motion delay={4} className="group">
              <div className="h-full bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{t('feature3Title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t('feature3Description')}</p>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-auto">
                  <span className="text-purple-600 dark:text-purple-400 font-medium flex items-center group-hover:translate-x-2 transition-transform">
                    Learn more
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Motion>
          </div>
          
          {/* Stats */}
          <Motion delay={6}>
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">10K+</div>
                <p className="text-gray-600 dark:text-gray-400">Credentials Issued</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">250+</div>
                <p className="text-gray-600 dark:text-gray-400">Institutions</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">99.9%</div>
                <p className="text-gray-600 dark:text-gray-400">Uptime</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">24/7</div>
                <p className="text-gray-600 dark:text-gray-400">Support</p>
              </div>
            </div>
          </Motion>
        </div>
      </section>
      
      {/* How It Works Section - Enhanced */}
      <section className="py-20 relative bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
        <div className="container mx-auto px-4">
          <Motion>
            <div className="flex flex-col items-center mb-16 text-center">
              <span className="inline-block py-1 px-3 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
                {t('howItWorksTag') || "Simple Process"}
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 gradient-text max-w-3xl">
                {t('howItWorksTitle')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
                Our streamlined process makes credential verification fast, secure, and reliable.
              </p>
            </div>
          </Motion>
          
          <div className="max-w-5xl mx-auto relative">
            {/* Process flow indicator */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-blue-200 dark:bg-blue-900/30 transform -translate-x-1/2 hidden md:block"></div>
            
            {/* Step 1 */}
            <Motion delay={2}>
              <div className="flex flex-col md:flex-row items-center gap-8 mb-16 relative">
                <div className="w-full md:w-1/2 order-2 md:order-1">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 h-full transform transition-all duration-300 hover:shadow-2xl relative z-10">
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold uppercase mb-2 block">Step 1</span>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('step1Title')}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{t('step1Description')}</p>
                    <Link href={`/${locale}/auth/register`} className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium group">
                      Create account
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
                
                <div className="w-full md:w-1/2 order-1 md:order-2 flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-600/30 relative z-20">
                      1
                    </div>
                    <div className="absolute top-0 -left-4 -right-4 -bottom-4 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-xl z-10 animate-pulse-slow"></div>
                  </div>
                </div>
              </div>
            </Motion>
            
            {/* Step 2 */}
            <Motion delay={4}>
              <div className="flex flex-col md:flex-row items-center gap-8 mb-16 relative">
                <div className="w-full md:w-1/2 flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-600/30 relative z-20">
                      2
                    </div>
                    <div className="absolute top-0 -left-4 -right-4 -bottom-4 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-xl z-10 animate-pulse-slow"></div>
                  </div>
                </div>
                
                <div className="w-full md:w-1/2">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 h-full transform transition-all duration-300 hover:shadow-2xl relative z-10">
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold uppercase mb-2 block">Step 2</span>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('step2Title')}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{t('step2Description')}</p>
                  </div>
                </div>
              </div>
            </Motion>
            
            {/* Step 3 */}
            <Motion delay={6}>
              <div className="flex flex-col md:flex-row items-center gap-8 relative">
                <div className="w-full md:w-1/2 order-2 md:order-1">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 h-full transform transition-all duration-300 hover:shadow-2xl relative z-10">
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold uppercase mb-2 block">Step 3</span>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('step3Title')}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{t('step3Description')}</p>
                    <Link href={`/${locale}/verify`} className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium group">
                      Verify a credential
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
                
                <div className="w-full md:w-1/2 order-1 md:order-2 flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-600/30 relative z-20">
                      3
                    </div>
                    <div className="absolute top-0 -left-4 -right-4 -bottom-4 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-xl z-10 animate-pulse-slow"></div>
                  </div>
                </div>
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section - Enhanced */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <Motion>
            <div className="flex flex-col items-center mb-16 text-center">
              <span className="inline-block py-1 px-3 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
                {t('testimonialTag') || "Customer Stories"}
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 gradient-text max-w-3xl">
                {t('Testimonials.title') || "What Our Customers Say"}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
                {t('Testimonials.subtitle') || "Trusted by organizations worldwide to secure and verify their credentials"}
              </p>
            </div>
          </Motion>
          
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Motion delay={2} className="h-full">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                <blockquote className="text-gray-700 dark:text-gray-300 mb-8 text-lg leading-relaxed flex-grow">
                  "This platform has transformed how we verify credentials, saving us countless hours and eliminating fraud concerns."
                </blockquote>
                
                <div className="flex items-center mt-auto pt-6 border-t border-gray-100 dark:border-gray-700">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden mr-4 ring-2 ring-blue-100 dark:ring-blue-900">
                    <img 
                      src="https://randomuser.me/api/portraits/women/32.jpg" 
                      alt="Sarah Johnson"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white">Sarah Johnson</h4>
                    <p className="text-blue-600 dark:text-blue-400">HR Director</p>
                  </div>
                </div>
              </div>
            </Motion>

            {/* Testimonial 2 */}
            <Motion delay={3} className="h-full md:translate-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                <blockquote className="text-gray-700 dark:text-gray-300 mb-8 text-lg leading-relaxed flex-grow">
                  "The security protocols are top-notch. We now trust that every certificate we issue is verifiable and tamper-proof."
                </blockquote>
                
                <div className="flex items-center mt-auto pt-6 border-t border-gray-100 dark:border-gray-700">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden mr-4 ring-2 ring-blue-100 dark:ring-blue-900">
                    <img 
                      src="https://randomuser.me/api/portraits/men/54.jpg" 
                      alt="Michael Chen"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white">Michael Chen</h4>
                    <p className="text-blue-600 dark:text-blue-400">University Registrar</p>
                  </div>
                </div>
              </div>
            </Motion>
            
            {/* Testimonial 3 */}
            <Motion delay={4} className="h-full">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                <blockquote className="text-gray-700 dark:text-gray-300 mb-8 text-lg leading-relaxed flex-grow">
                  "Implementation was quick and seamless. Their customer support team was there every step of the way to ensure our success."
                </blockquote>
                
                <div className="flex items-center mt-auto pt-6 border-t border-gray-100 dark:border-gray-700">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden mr-4 ring-2 ring-blue-100 dark:ring-blue-900">
                    <img 
                      src="https://randomuser.me/api/portraits/women/68.jpg" 
                      alt="Jennifer Lopez"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white">Jennifer Lopez</h4>
                    <p className="text-blue-600 dark:text-blue-400">CTO, TechCorp</p>
                  </div>
                </div>
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* CTA Section - Enhanced */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700"></div>
        
        {/* Background patterns */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern"></div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 max-w-6xl mx-auto">
            {/* Left side */}
            <div className="flex-1 text-center lg:text-left">
              <Motion>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                  {t('ctaTitle')}
                </h2>
              </Motion>
              <Motion delay={1}>
                <p className="text-xl mb-8 text-blue-100 leading-relaxed">
                  {t('ctaDescription')}
                </p>
              </Motion>
              
              <Motion delay={2}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    size="lg"
                    asChild
                    className="w-full sm:w-auto"
                  >
                    <Link href={getStartedAction()}>
                      {getStartedText()}
                    </Link>
                  </Button>
                </div>
              </Motion>
            </div>
            
            {/* Right side - Simple illustration */}
            <div className="flex-1 max-w-md">
              <Motion delay={2}>
                <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 shadow-2xl">
                  <div className="bg-white/10 rounded-xl p-6 mb-6">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Secure & Private</h3>
                        <p className="text-blue-100">End-to-end encryption</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-2 bg-white/20 rounded-full w-full"></div>
                      <div className="h-2 bg-white/20 rounded-full w-5/6"></div>
                      <div className="h-2 bg-white/20 rounded-full w-4/6"></div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-6">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Fast Verification</h3>
                        <p className="text-blue-100">Instant results</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-2 bg-white/20 rounded-full w-full"></div>
                      <div className="h-2 bg-white/20 rounded-full w-4/6"></div>
                      <div className="h-2 bg-white/20 rounded-full w-5/6"></div>
                    </div>
                  </div>
                </div>
              </Motion>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 