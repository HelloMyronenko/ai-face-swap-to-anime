import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">AI Face Swap</h3>
            <p className="text-gray-400 text-sm">Transform realistic faces into anime-style characters</p>
          </div>
          
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="mb-4 md:mb-0">
              <h4 className="text-sm font-semibold mb-2">Resources</h4>
              <ul className="text-gray-400 text-sm">
                <li className="mb-1"><a href="#" className="hover:text-primary-300 transition-colors">Documentation</a></li>
                <li className="mb-1"><a href="#" className="hover:text-primary-300 transition-colors">API</a></li>
                <li><a href="#" className="hover:text-primary-300 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-2">Connect</h4>
              <ul className="text-gray-400 text-sm">
                <li className="mb-1"><a href="#" className="hover:text-primary-300 transition-colors">GitHub</a></li>
                <li className="mb-1"><a href="#" className="hover:text-primary-300 transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-primary-300 transition-colors">Discord</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} AI Face Swap. All rights reserved.</p>
          <p className="mt-1">Built with React, TensorFlow.js and ❤️</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
