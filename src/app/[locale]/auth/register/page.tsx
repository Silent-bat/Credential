'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { z } from 'zod';
import type { FormEvent, ChangeEvent } from 'react';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const common = useTranslations('common');
  const router = useRouter();
  const { locale } = useParams();
  
  // State to track the registration step (1 for admin details, 2 for institution details)
  const [step, setStep] = useState(1);
  
  // Admin form data
  const [adminData, setAdminData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Institution form data
  const [institutionData, setInstitutionData] = useState({
    name: '',
    type: 'UNIVERSITY',
    website: '',
    address: '',
    phone: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Add state for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Handle admin form changes
  const handleAdminChange = (e: any) => {
    const { name, value } = e.target;
    setAdminData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear password error if editing either password field
    if (name === 'password' || name === 'confirmPassword') {
      if (error.includes('password')) {
        setError('');
      }
    }
  };
  
  // Handle institution form changes
  const handleInstitutionChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInstitutionData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle next button click to move to institution details
  const handleNext = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate admin details
    if (!adminData.firstName || !adminData.lastName || !adminData.email || !adminData.password) {
      setError(t('missingRequiredFields'));
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminData.email)) {
      setError(common('messages.invalidEmail'));
      return;
    }
    
    // Validate password matching
    if (adminData.password !== adminData.confirmPassword) {
      setError(common('messages.passwordMismatch'));
      return;
    }
    
    // Check password strength (at least 8 characters)
    if (adminData.password.length < 8) {
      setError(t('passwordTooShort'));
      return;
    }
    
    // Clear any errors and move to the next step
    setError('');
    setStep(2);
  };
  
  // Handle back button click to return to admin details
  const handleBack = (): void => {
    setStep(1);
    console.log('Step state set to 1');
    setError('');
  };
  
  // Handle final form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Validate institution data
    if (!institutionData.name || !institutionData.type) {
      setError(t('missingInstitutionFields'));
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${adminData.firstName} ${adminData.lastName}`,
          email: adminData.email,
          password: adminData.password,
          preferredLocale: locale,
          institution: {
            name: institutionData.name,
            type: institutionData.type,
            website: institutionData.website || null,
            address: institutionData.address || null,
            phone: institutionData.phone || null
          }
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Registration successful
      router.push(`/${locale}/auth/login?registered=true`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during registration';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Render error message
  const renderError = () => {
    if (!error) return null;
    
    return (
      <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center shadow-sm">
        <svg className="w-5 h-5 mr-2 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">{error}</span>
      </div>
    );
  };

  // Render step indicators
  const renderStepIndicators = () => {
    return (
      <div className="flex items-center justify-center mb-8">
        <div className="flex flex-col items-center">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
            1
          </div>
          <span className="text-xs mt-1 font-medium">{t('userDetails')}</span>
        </div>
        <div className={`h-0.5 w-16 ${step === 2 ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
        <div className="flex flex-col items-center">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
            2
          </div>
          <span className="text-xs mt-1 font-medium">{t('institutionDetails')}</span>
        </div>
      </div>
    );
  };

  // Render admin registration form (step 1)
  const renderAdminForm = () => {
    return (
      <form onSubmit={handleNext} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{t('userDetails')}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{t('adminDetailsDescription')}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {common('labels.firstName')} <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                placeholder={t('adminNamePlaceholder')}
                value={adminData.firstName}
                onChange={handleAdminChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {common('labels.lastName')} <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                placeholder="Doe"
                value={adminData.lastName}
                onChange={handleAdminChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {common('labels.email')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="admin@institution.com"
                value={adminData.email}
                onChange={handleAdminChange}
                className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {common('labels.password')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={adminData.password}
                onChange={handleAdminChange}
                className="w-full pl-10 pr-10 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.274.832-.64 1.624-1.09 2.357" /></svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{t('passwordRequirements')}</p>
          </div>
          
          <div className="mt-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('confirmPassword')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={adminData.confirmPassword}
                onChange={handleAdminChange}
                className="w-full pl-10 pr-10 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.274.832-.64 1.624-1.09 2.357" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            {common('buttons.next')}
          </button>
        </div>
      </form>
    );
  };

  // Render institution registration form (step 2)
  const renderInstitutionForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{t('institutionDetails')}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{t('institutionDetailsDescription')}</p>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('institutionName')} <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder={t('institutionNamePlaceholder')}
              value={institutionData.name}
              onChange={handleInstitutionChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="mt-6">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('institutionType')} <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              required
              value={institutionData.type}
              onChange={handleInstitutionChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="UNIVERSITY">{t('types.university')}</option>
              <option value="COLLEGE">{t('types.college')}</option>
              <option value="SCHOOL">{t('types.school')}</option>
              <option value="TRAINING_CENTER">{t('types.trainingCenter')}</option>
              <option value="COMPANY">{t('types.company')}</option>
              <option value="GOVERNMENT">{t('types.government')}</option>
              <option value="NONPROFIT">{t('types.nonprofit')}</option>
              <option value="OTHER">{t('types.other')}</option>
            </select>
          </div>
          
          <div className="mt-6">
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('institutionWebsite')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="website"
                name="website"
                type="url"
                placeholder="https://www.yourinstitution.com"
                value={institutionData.website}
                onChange={handleInstitutionChange}
                className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('institutionAddress')}
            </label>
            <textarea
              id="address"
              name="address"
              placeholder={t('institutionAddressPlaceholder')}
              value={institutionData.address}
              onChange={handleInstitutionChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              rows={3}
            ></textarea>
          </div>
          
          <div className="mt-6">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('institutionPhone')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 123 456 7890"
                value={institutionData.phone}
                onChange={handleInstitutionChange}
                className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleBack}
            className="w-1/2 flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            {common('buttons.previous')}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-1/2 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {common('messages.loading')}
              </div>
            ) : t('register')}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full">
      {/* Remove console.log from JSX and handle debugging differently */}
      <div className="hidden lg:block lg:w-1/2 relative lg:sticky lg:top-0 lg:h-screen">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-800 opacity-90"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?q=80&w=1740&auto=format&fit=crop')", 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.8)'
          }}
        ></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">{common('messages.welcome')}</h2>
            <p className="text-xl mb-8">
              {t('joinCredentialVerifier')}
            </p>
            <div className="flex justify-center space-x-2 mb-8">
              <span className="h-2 w-2 rounded-full bg-white opacity-50"></span>
              <span className="h-2 w-2 rounded-full bg-white"></span>
              <span className="h-2 w-2 rounded-full bg-white opacity-50"></span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <p className="italic text-white/80 mb-4">{t('testimonialQuote')}</p>
              <p className="font-semibold">{t('testimonialName')}</p>
              <p className="text-sm text-white/70">{t('testimonialRole')}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Registration form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        <div className="w-full max-w-2xl px-8 py-12">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('registerInstitution')}</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t('joinCredentialVerifier')}</p>
              </div>
              <Link
                href={`/${locale}`}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                {common('buttons.back')}
              </Link>
            </div>
            
            {renderStepIndicators()}
            {renderError()}
            
            {step === 1 ? renderAdminForm() : renderInstitutionForm()}
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('alreadyHaveAccount')} {' '}
                <Link
                  href={`/${locale}/auth/login`}
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  {t('login')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 