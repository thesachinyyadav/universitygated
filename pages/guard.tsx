import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import QRScanner from '@/components/QRScanner';
import type { Visitor } from '@/types/database';

export default function GuardDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    visitor?: Partial<Visitor>;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login?role=guard');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'guard') {
      router.push('/');
      return;
    }
    setUser(parsedUser);
  }, [router]);

  const handleScan = async (visitorId: string) => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const response = await fetch(`/api/verifyVisitor?id=${visitorId}`);
      const data = await response.json();

      setVerificationResult(data);
      
      // Auto-clear result after 3 seconds for continuous scanning
      setTimeout(() => {
        setVerificationResult(null);
      }, 3000);
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({ verified: false });
      
      // Auto-clear error after 3 seconds
      setTimeout(() => {
        setVerificationResult(null);
      }, 3000);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-3 sm:py-4 md:py-6 px-3 sm:px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-3 sm:mb-4">
          <h1 className="text-lg sm:text-xl font-bold text-primary-600 mb-1 flex items-center space-x-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-base sm:text-lg md:text-xl">Security Guard Dashboard</span>
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm">
            Welcome, <strong>{user.username}</strong> | Scan QR to verify
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Scanner Section */}
          <div>
            <QRScanner onScan={handleScan} />
          </div>

          {/* Verification Result */}
          <div>
            <div className="card sticky top-16 sm:top-20 p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">
                Verification Result
              </h3>

              {isVerifying && (
                <div className="text-center py-6 sm:py-8">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-maroon-600 mx-auto mb-3"></div>
                  <p className="text-gray-600 text-xs sm:text-sm">Verifying...</p>
                </div>
              )}

              {!isVerifying && !verificationResult && (
                <div className="text-center py-6 sm:py-8 text-gray-400">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <p className="text-xs sm:text-sm">Scan QR to verify</p>
                </div>
              )}

              {!isVerifying && verificationResult && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  {verificationResult.verified ? (
                    <div className="bg-green-50 border-2 border-green-500 rounded-lg p-3 sm:p-4 md:p-6">
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h2 className="text-lg sm:text-xl font-bold text-green-700 mb-2 sm:mb-3">
                        ACCESS GRANTED
                      </h2>
                      {verificationResult.visitor && (
                        <div className="space-y-1.5 text-left bg-white p-2 sm:p-3 rounded-lg text-xs sm:text-sm">
                          <div className="flex justify-between gap-2">
                            <span className="font-semibold">Name:</span>
                            <span className="text-right break-words">{verificationResult.visitor.name}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="font-semibold">Event:</span>
                            <span className="text-right break-words">{verificationResult.visitor.event_name || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="font-semibold">Date:</span>
                            <span className="text-right">
                              {verificationResult.visitor.date_of_visit
                                ? new Date(verificationResult.visitor.date_of_visit).toLocaleDateString()
                                : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="font-semibold">Status:</span>
                            <span className={`badge-${verificationResult.visitor.status}`}>
                              {verificationResult.visitor.status?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3 sm:p-4 md:p-6">
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h2 className="text-lg sm:text-xl font-bold text-red-700 mb-2 sm:mb-3">
                        ACCESS DENIED
                      </h2>
                      <p className="text-red-600 text-xs sm:text-sm">
                        Invalid QR or access revoked
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setVerificationResult(null)}
                    className="mt-3 sm:mt-4 btn-secondary w-full text-xs sm:text-sm py-2.5"
                  >
                    Scan Another
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
