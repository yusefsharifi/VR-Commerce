export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#121212] border-t border-[#ECECEC] dark:border-white/10 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-[#FF5224] rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <span className="font-extrabold text-xl text-[#111111] dark:text-white">
              Passage 414
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-white/40 leading-relaxed">
            The global VR Mall platform bridging cultures and commerce through
            immersive technology.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-6 dark:text-white">Regions</h4>
          <ul className="space-y-4 text-sm text-gray-500 dark:text-white/40">
            <li>
              <a
                href="/mall/iran"
                className="hover:text-[#FF5224] transition-colors"
              >
                Iran
              </a>
            </li>
            <li>
              <a
                href="/mall/arab"
                className="hover:text-[#FF5224] transition-colors"
              >
                Arab Countries
              </a>
            </li>
            <li>
              <a
                href="/mall/europe"
                className="hover:text-[#FF5224] transition-colors"
              >
                Europe
              </a>
            </li>
            <li>
              <a
                href="/mall/africa"
                className="hover:text-[#FF5224] transition-colors"
              >
                Africa
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-6 dark:text-white">Commercial</h4>
          <ul className="space-y-4 text-sm text-gray-500 dark:text-white/40">
            <li>
              <a href="#" className="hover:text-[#FF5224] transition-colors">
                Jewelry
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#FF5224] transition-colors">
                Clothing
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#FF5224] transition-colors">
                Carpets
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#FF5224] transition-colors">
                Electronics
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-6 dark:text-white">Join Us</h4>
          <ul className="space-y-4 text-sm text-gray-500 dark:text-white/40">
            <li>
              <a
                href="/account/signup?role=vendor"
                className="hover:text-[#FF5224] transition-colors"
              >
                Become a Vendor
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#FF5224] transition-colors">
                Advertising
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#FF5224] transition-colors">
                Support
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
        <p>© 2026 Passage 414 VR Mall. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-[#FF5224]">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-[#FF5224]">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
