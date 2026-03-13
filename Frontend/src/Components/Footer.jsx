import React from "react";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-6 sm:py-8">
      <div className="container-fluid px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo and Description */}
          <div className="col-span-2 lg:col-span-1 mb-2 sm:mb-0">
            <div className="flex items-center mb-1 sm:mb-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-1.5 sm:mr-2">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <span className="text-white text-base sm:text-lg font-bold">Kenko</span>
            </div>
            <p className="text-blue-400 text-xs md:text-sm">
              AI-powered digital health vault for the future of healthcare.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white text-xs sm:text-sm md:text-base font-semibold mb-1 sm:mb-2">
              Product
            </h3>
            <ul className="space-y-0.5 sm:space-y-1 text-xs md:text-sm">
              <li>
                <a
                  href="/features"
                  className="hover:text-white transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="/security"
                  className="hover:text-white transition-colors"
                >
                  Security
                </a>
              </li>
              <li>
                <a href="/abdm" className="hover:text-white transition-colors">
                  ABDM Integration
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white text-sm md:text-base font-semibold mb-2">
              Company
            </h3>
            <ul className="space-y-1 text-xs md:text-sm">
              <li>
                <a href="/about" className="hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a
                  href="/careers"
                  className="hover:text-white transition-colors"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white text-sm md:text-base font-semibold mb-2">
              Legal
            </h3>
            <ul className="space-y-1 text-xs md:text-sm">
              <li>
                <a
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/hipaa" className="hover:text-white transition-colors">
                  HIPAA Compliance
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-4 md:mt-6 pt-4 text-center text-xs md:text-sm">
          <p>© 2025 Kenko. All rights reserved. Built for better healthcare.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
