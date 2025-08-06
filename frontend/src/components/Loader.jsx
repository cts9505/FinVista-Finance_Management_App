import { useState, useEffect } from 'react';

const Loader = () => {
  const [currentTip, setCurrentTip] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeMessage, setTimeMessage] = useState('');

  const financeTips = [
    "💰 Track your expenses daily to identify spending patterns",
    "📊 Set aside 20% of your income for savings and investments",
    "🏦 Build an emergency fund covering 3-6 months of expenses",
    "📈 Diversify your investment portfolio to reduce risk",
    "💳 Pay off high-interest debt before investing",
    "🎯 Set specific, measurable financial goals with deadlines",
    "📱 Use budgeting apps to monitor your finances on-the-go",
    "🔄 Review and adjust your budget monthly for better control",
    "🛒 Plan your grocery trips with a list to avoid impulse buys",
    "💸 Use the envelope system for cash spending to stay on budget",
    "🧾 Save your receipts to track spending and returns",
    "🤝 Get a free credit report annually and check for errors",
    "⚖️ Consolidate high-interest debt into a single, lower-interest loan",
    "👵 Maximize your retirement contributions to take advantage of tax benefits",
    "🏡 Pay more than the minimum on your mortgage to save on interest",
    "🎁 Give gifts that don't break the bank, like experiences or handmade items",
    "🗓️ Schedule regular financial check-ins with your partner or family",
    "🛡️ Understand your insurance policies to ensure you have adequate coverage",
    "💼 Take advantage of your employer's 401(k) match",
    "🛍️ Practice the 30-day rule: wait 30 days before making a big purchase",
    "📈 Invest in low-cost index funds to get broad market exposure",
    "👩‍🎓 Pay off student loans aggressively to free up future income",
    "🏡 Keep track of your net worth to monitor financial progress",
    "💳 Automate bill payments to avoid late fees and missed due dates",
    "💵 Try a 'no-spend' day or week to reset your habits",
    "👨‍👩‍👧‍👦 Talk about money with your children to teach them financial literacy",
    "📱 Use cashback or reward credit cards responsibly",
    "💻 Shop around and compare prices before buying anything significant",
    "📚 Read at least one personal finance book a year to level up your money game",
    "🛑 Unsubscribe from marketing emails to avoid temptation to spend",
    "📦 Sell unused items online to generate quick cash and declutter",
    "🧠 Treat savings like a fixed expense—non-negotiable",
    "🎓 Take free online courses to boost your financial literacy",
    "🌱 Start investing early—even small amounts grow over time thanks to compound interest",
    "🛠️ Build multiple income streams to increase financial stability",
    "🌍 Choose sustainable and ethical investments that align with your values",
    "📆 Set calendar reminders for financial goals and review dates",
    "🚨 Create a financial ‘cheat sheet’ with your account logins and key contacts for emergencies",
    "🧾 Use digital tools to scan and organize important financial documents",
    "🔐 Use strong, unique passwords for financial accounts and enable 2FA",
    "🏦 Explore high-yield savings accounts for better returns on idle cash",
    "🧘‍♂️ Don’t let FOMO (Fear of Missing Out) drive your financial decisions",
    "🌐 Avoid lifestyle inflation—don’t upgrade your lifestyle every time your income increases",
    "🪙 Round up your purchases to save spare change automatically",
    "🧃 Bring your own snacks and coffee—it adds up more than you think",
    "🎮 Gamify your savings goals with progress trackers or challenges",
    "🌟 Remember: Financial freedom is cooler than flexing for social media"
    ];

  useEffect(() => {
    // Timer for elapsed time and messages
    const timeInterval = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        
        // Set time-based messages
        if (newTime === 5) {
          setTimeMessage('Just 5 seconds more...');
        }else if (newTime === 10) {
          setTimeMessage('Just 2 seconds more...');
        } else if (newTime === 20) {
          setTimeMessage('Just a minute...');
        } else if (newTime >= 25) {
          setTimeMessage('Almost there...');
        } else {
          setTimeMessage('');
        }
        
        return newTime;
      });
    }, 1000);

    let lastTipIndex = -1;

    const tipInterval = setInterval(() => {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * financeTips.length);
        } while (newIndex === lastTipIndex);
        
        lastTipIndex = newIndex;
        setCurrentTip(newIndex);
    }, 4000);


    return () => {
      clearInterval(timeInterval);
      clearInterval(tipInterval);
    };
  }, []);

  return (
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
          
          {/* Time-based message */}
          {timeMessage && (
            <div className="text-sm text-blue-600 font-medium mb-3 transition-all duration-500">
              {timeMessage}
            </div>
          )}
          
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

        {/* Finance Tips */}
        <div className="text-center max-w-sm">
          <div className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wide">
            Finance Tips
          </div>
          <div className="text-sm text-gray-600 font-medium transition-all duration-500">
            {financeTips[currentTip]}
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
};

export default Loader;