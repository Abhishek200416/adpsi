import { Wind, Mail, Phone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white mt-20" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-teal-700 p-2 rounded-full">
                <Wind className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold font-['Manrope']">Delhi Air Command</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              AI-driven pollution monitoring and policy decision support for Delhi NCR.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 font-['Manrope']">Quick Links</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="/dashboard" className="hover:text-teal-400 transition-colors">
                  Live Dashboard
                </a>
              </li>
              <li>
                <a href="/report" className="hover:text-teal-400 transition-colors">
                  Report Pollution
                </a>
              </li>
              <li>
                <a href="/admin/login" className="hover:text-teal-400 transition-colors">
                  Policy Dashboard
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 font-['Manrope']">Contact</h3>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@delhiair.gov.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91-11-2345-6789</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
          <p>&copy; 2026 Delhi Air Command. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};