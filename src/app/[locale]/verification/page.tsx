import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function VerificationPage() {
  const t = useTranslations('Verification');
  const locale = useLocale();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">{t('title')}</h1>
        <p className="text-gray-600 mb-8">
          {t('subtitle')}
        </p>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('byId')}</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="credentialId" className="block text-sm font-medium text-gray-700 mb-1">
                {t('credentialId')}
              </label>
              <input
                type="text"
                id="credentialId"
                placeholder={t('credentialIdPlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full md:w-auto md:self-end"
            >
              {t('verifyButton')}
            </button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{t('byFile')}</h2>
          <div className="flex flex-col gap-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="mx-auto flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-gray-600 mb-2">{t('dragAndDrop')}</p>
              <p className="text-gray-500 text-sm mb-3">{t('or')}</p>
              <button 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
              >
                {t('browseFiles')}
              </button>
              <p className="text-gray-500 text-xs mt-2">{t('supportedFormats')}</p>
            </div>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full md:w-auto md:self-end"
              disabled
            >
              {t('verifyButton')}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">{t('needCredential')}</p>
          <Link 
            href={`/${locale}/auth/register`}
            className="text-blue-600 hover:underline font-medium"
          >
            {t('createAccount')}
          </Link>
        </div>
      </div>
    </div>
  );
} 