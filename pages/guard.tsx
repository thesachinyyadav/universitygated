import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import QRScanner from '@/components/QRScanner';
import type { Visitor } from '@/types/database';

interface ScanHistoryItem {
  id: string;
  timestamp: Date;
  verified: boolean;
  visitor?: Partial<Visitor>;
}

export default function GuardDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    visitor?: Partial<Visitor>;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);

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
      
      // Add to scan history
      const historyItem: ScanHistoryItem = {
        id: visitorId,
        timestamp: new Date(),
        verified: data.verified,
        visitor: data.visitor
      };
      setScanHistory(prev => [historyItem, ...prev]); // Add to top of list
      
      // Auto-clear result after 3 seconds for continuous scanning
      setTimeout(() => {
        setVerificationResult(null);
      }, 3000);
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({ verified: false });
      
      // Add failed scan to history
      const historyItem: ScanHistoryItem = {
        id: visitorId,
        timestamp: new Date(),
        verified: false
      };
      setScanHistory(prev => [historyItem, ...prev]);
      
      // Auto-clear error after 3 seconds
      setTimeout(() => {
        setVerificationResult(null);
      }, 3000);
    } finally {
      setIsVerifying(false);
    }
  };

  const clearHistory = () => {
    setScanHistory([]);
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

        <div className="grid lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Scanner Section */}
          <div className="lg:col-span-1 space-y-3 sm:space-y-4">
            {/* Scan History */}
            <div className="card p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    Scan History
                    {scanHistory.length > 0 && (
                      <span className="ml-2 text-xs sm:text-sm font-normal text-gray-500">
                        ({scanHistory.length})
                      </span>
                    )}
                  </h3>
                </div>
                {scanHistory.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition"
                  >
                    Clear
                  </button>
                )}
              </div>

              {scanHistory.length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-xs">No scans yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  <AnimatePresence>
                    {scanHistory.map((item, index) => (
                      <motion.div
                        key={`${item.id}-${item.timestamp.getTime()}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className={`p-2 rounded-lg border-2 ${
                          item.verified
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start space-x-2 flex-1 min-w-0">
                            {/* Status Icon */}
                            {item.verified ? (
                              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            
                            {/* Visitor Info */}
                            <div className="flex-1 min-w-0">
                              {item.visitor ? (
                                <>
                                  <p className="font-semibold text-gray-800 text-xs truncate">
                                    {item.visitor.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {item.timestamp.toLocaleTimeString()}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="font-medium text-red-600 text-xs">
                                    Invalid ID
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {item.timestamp.toLocaleTimeString()}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Status Badge */}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                            item.verified
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {item.verified ? '✓' : '✗'}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <QRScanner onScan={handleScan} />
          </div>

          {/* Verification Result */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {/* Current Scan Result */}
            <div className="card p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">
                Current Scan
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
                    Continue Scanning
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
