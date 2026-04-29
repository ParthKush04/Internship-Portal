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
            <li>Email: info@provisioningtech.com</li>
            <li>Phone: +91– 8938983711</li>
            <li>Location: India</li>
          </ul>
          <div className="mt-5 flex items-center gap-3">
            <a href="https://www.facebook.com/provisioning.tech/" target="_blank" rel="noreferrer" aria-label="Provisioning Tech on Facebook" className="rounded-md bg-gray-200 p-2 text-gray-800 hover:bg-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.2v-2.9h2.2V9.1c0-2.2 1.3-3.4 3.3-3.4.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2v1.5h2.3l-.4 2.9h-1.9v7A10 10 0 0022 12z" />
              </svg>
            </a>

            <a href="https://www.instagram.com/provisioning.tech/following/" target="_blank" rel="noreferrer" aria-label="Provisioning Tech on Instagram" className="rounded-md bg-gray-200 p-2 text-gray-800 hover:bg-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm8 3a1 1 0 100 2 1 1 0 000-2zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z" />
              </svg>
            </a>

            <a href="https://x.com/provisioningt" target="_blank" rel="noreferrer" aria-label="Provisioning Tech on X" className="rounded-md bg-gray-200 p-2 text-gray-800 hover:bg-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M22 5.8c-.6.3-1.2.6-1.9.7.7-.4 1.1-1 .1-1.7-.6-.5-1.5-.5-2.3-.2-1.3.5-2.6 1.3-3.8 2.1-1 .6-2.1 1.2-3.2 1.6-1.2.5-2.4.8-3.6.8-1.3 0-2.3-.3-3.1-.9v.1c0 1.4.6 2.6 1.6 3.5-.6 0-1.2-.2-1.6-.5v.1c0 1.8 1.3 3.3 3.1 3.7-.5.2-1 .2-1.6.2-.4 0-.8 0-1.2-.1.8 2.5 3 4.2 5.6 4.2-2 1.6-4.4 2.6-7.1 2.6-.5 0-1 0-1.5-.1C6.1 21 8.4 22 11 22c4.8 0 8.7-3.9 8.7-8.7v-.4c.6-.4 1.1-.9 1.5-1.6-.5.2-1 .4-1.6.4.5-.3 1-1 1.2-1.7-.5.3-1.1.6-1.7.7z" />
              </svg>
            </a>

            <a href="https://www.linkedin.com/company/provisioning-tech/people/" target="_blank" rel="noreferrer" aria-label="Provisioning Tech on LinkedIn" className="rounded-md bg-gray-200 p-2 text-gray-800 hover:bg-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M4.98 3.5a2.5 2.5 0 11-.001 5.001A2.5 2.5 0 014.98 3.5zM3 9h4v12H3zM9 9h3.8v1.6h.1c.5-.9 1.8-1.8 3.6-1.8C20.6 8.8 21 11 21 13.9V21h-4v-6c0-1.4-.5-2.4-1.7-2.4-1 0-1.6.7-1.9 1.4-.1.2-.1.5-.1.8V21H9V9z" />
              </svg>
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
