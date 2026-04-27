import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-white text-gray-700 transition-colors duration-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-sm font-bold text-white">
              PT
            </span>
            <span className="text-lg font-semibold text-gray-900">Provisioning Tech</span>
          </Link>
          <p className="mt-4 text-sm leading-6 text-gray-600">
            Provisioning Tech helps students and fresh talent build practical experience through industry-aligned
            internships in modern technology domains.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">About</h3>
          <p className="mt-4 text-sm leading-6 text-gray-600">
            We connect aspiring professionals with real projects, mentorship, and career-focused internship pathways.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">Quick Links</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/" className="text-gray-600 transition-colors hover:text-gray-900">
                Home
              </Link>
            </li>
            <li>
              <a href="/#internships" className="text-gray-600 transition-colors hover:text-gray-900">
                Internships
              </a>
            </li>
            <li>
              <a href="/#about" className="text-gray-600 transition-colors hover:text-gray-900">
                About
              </a>
            </li>
            <li>
              <a href="/#contact" className="text-gray-600 transition-colors hover:text-gray-900">
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">Contact</h3>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>Email: hello@provisioningtech.com</li>
            <li>Phone: +91 98765 43210</li>
            <li>Location: India</li>
          </ul>
          <div className="mt-5 flex items-center gap-3">
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="rounded-md bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-800 transition-colors hover:bg-gray-300">
              LinkedIn
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="rounded-md bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-800 transition-colors hover:bg-gray-300">
              GitHub
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="rounded-md bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-800 transition-colors hover:bg-gray-300">
              Instagram
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-2 px-4 py-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Provisioning Tech. All rights reserved.</span>
          <span>Built for internship excellence</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
