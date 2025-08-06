const Loader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
    <div className="flex flex-col items-center space-y-6 sm:space-y-8 px-4">
      {/* Professional Bar Chart */}
      <div className="flex items-end space-x-2 sm:space-x-3 h-24">
        {[1, 2, 3, 4, 5].map((bar, i) => (
          <div
            key={i}
            className={`bg-blue-600 rounded-md shadow-sm w-4 sm:w-5 md:w-6`}
            style={{
              height: `${20 + i * 8}px`,
              animation: `bar${bar} 3s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Loading Text */}
      <div className="text-center">
        <div className="text-base sm:text-lg font-semibold text-gray-800 mb-5">
          Loading Data
        </div>
        <div className="flex items-center justify-center space-x-2 mt-2">
          <div className="flex space-x-3">
            {[0, 0.1, 0.2].map((delay, idx) => (
              <div
                key={idx}
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: `${delay}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx="true">{`
        @keyframes bar1 {
          0% { height: 20px; opacity: 0.5; }
          10% { height: 64px; opacity: 1; }
          50%, 90% { height: 64px; opacity: 1; }
          100% { height: 20px; opacity: 0.5; }
        }
        @keyframes bar2 {
          0%, 10% { height: 28px; opacity: 0.5; }
          20% { height: 68px; opacity: 1; }
          50%, 80% { height: 68px; opacity: 1; }
          90%, 100% { height: 28px; opacity: 0.5; }
        }
        @keyframes bar3 {
          0%, 20% { height: 36px; opacity: 0.5; }
          30% { height: 72px; opacity: 1; }
          50%, 70% { height: 72px; opacity: 1; }
          80%, 100% { height: 36px; opacity: 0.5; }
        }
        @keyframes bar4 {
          0%, 30% { height: 44px; opacity: 0.5; }
          40% { height: 76px; opacity: 1; }
          50%, 60% { height: 76px; opacity: 1; }
          70%, 100% { height: 44px; opacity: 0.5; }
        }
        @keyframes bar5 {
          0%, 40% { height: 52px; opacity: 0.5; }
          50% { height: 80px; opacity: 1; }
          60% { height: 52px; opacity: 0.5; }
          100% { height: 52px; opacity: 0.5; }
        }
      `}</style>
    </div>
  </div>
);

export default Loader;
