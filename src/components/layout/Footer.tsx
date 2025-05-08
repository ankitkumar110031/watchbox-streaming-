import React from 'react';
import { Play, Twitter, Instagram, Facebook, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Play className="h-6 w-6 text-purple-500" />
              <span className="text-xl font-bold text-white">WatchBox</span>
            </Link>
            <p className="text-sm">
              A modern video streaming platform where you can upload, share, and discover amazing content.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-purple-400 transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-purple-400 transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-purple-400 transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-purple-400 transition">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-purple-400 transition">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-purple-400 transition">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-purple-400 transition">Contact</Link></li>
              <li><Link to="/blog" className="hover:text-purple-400 transition">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="hover:text-purple-400 transition">Help Center</Link></li>
              <li><Link to="/guidelines" className="hover:text-purple-400 transition">Community Guidelines</Link></li>
              <li><Link to="/creators" className="hover:text-purple-400 transition">Creator Resources</Link></li>
              <li><Link to="/developers" className="hover:text-purple-400 transition">Developers</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="hover:text-purple-400 transition">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-purple-400 transition">Privacy Policy</Link></li>
              <li><Link to="/copyright" className="hover:text-purple-400 transition">Copyright</Link></li>
              <li><Link to="/cookies" className="hover:text-purple-400 transition">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} WatchBox. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <select className="bg-gray-800 border border-gray-700 rounded px-3 py-1">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
                <option>Japanese</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;