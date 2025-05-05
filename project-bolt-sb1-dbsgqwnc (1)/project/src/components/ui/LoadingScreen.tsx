import { useEffect, useState } from 'react';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + Math.random() * 10;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-primary-50 flex flex-col items-center justify-center z-50">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-primary-800 mb-4">Essence Smart</h1>
        <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-accent-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-primary-600">Loading experience...</p>
      </div>
      <div className="animate-float mt-12">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 shadow-lg flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
            <span className="font-display text-xl font-semibold text-accent-500">ES</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;