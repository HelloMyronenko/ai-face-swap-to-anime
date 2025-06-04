import React from 'react';
import { FaGithub } from 'react-icons/fa';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-xl mr-3">
            AI
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">AI Face Swap</h1>
            <p className="text-sm text-gray-600">3D to Anime Converter</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-primary-600 transition-colors"
          >
            <FaGithub size={24} />
          </a>
          <button className="btn btn-primary">
            About
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
