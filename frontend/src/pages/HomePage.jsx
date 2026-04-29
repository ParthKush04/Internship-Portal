import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [visibleSections, setVisibleSections] = useState({
    internships: false,
    about: false,
    howItWorks: false,
    contact: false
  });
  const [hasActiveInternship, setHasActiveInternship] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const internshipsRef = useRef(null);
  const aboutRef = useRef(null);
  const howItWorksRef = useRef(null);
  const contactRef = useRef(null);

  const internshipCategories = [
    {
      title: "Web Development",
      icon: "🌐",
      description: "Build responsive websites and modern user interfaces with real client-focused projects.",
      duration: "3 Months",
      skills: "HTML, CSS, JavaScript, Responsive Design"
    },
    {
      title: "MERN Stack Development",
      icon: "⚛️",
      description: "Develop full-stack applications using MongoDB, Express, React, and Node.js.",
      duration: "4 Months",
      skills: "MongoDB, Express.js, React, Node.js"
    },
    {
      title: "AI / Machine Learning",
      icon: "🤖",
      description: "Work on intelligent systems, data models, and practical ML workflows.",
      duration: "4 Months",
      skills: "Python, ML Basics, Data Analysis, Model Evaluation"
    },
    {
      title: "Digital Marketing",
      icon: "📈",
      description: "Plan and execute digital campaigns to drive engagement and measurable growth.",
      duration: "2 Months",
      skills: "SEO, Content Strategy, Social Media, Analytics"
    },
    {
      title: "App Development",
      icon: "📱",
      description: "Create user-friendly mobile applications with smooth performance and clean UX.",
      duration: "3 Months",
      skills: "Flutter/React Native, APIs, UI/UX, Testing"
    }
  ];

  const whyChooseUs = [
    {
      title: "Real-world projects",
      icon: "🧩",
      description: "Work on practical assignments that mirror industry workflows and deliverables."
    },
    {
      title: "Certificate on completion",
      icon: "🏅",
      description: "Receive a verified completion certificate to showcase your internship experience."
    },
    {
      title: "Flexible duration",
      icon: "⏳",
      description: "Choose internship timelines that fit your academic calendar and personal goals."
    },
    {
      title: "Mentorship from experts",
      icon: "🧠",
      description: "Learn directly from experienced mentors through structured guidance and feedback."
    },
    {
      title: "Work on live products",
      icon: "🚀",
      description: "Contribute to active product features and gain confidence in production-ready work."
    }
  ];

  const howItWorksSteps = [
    {
      title: "Apply for internship",
      icon: "📝",
      description: "Submit your application with the required details and preferred domain."
    },
    {
      title: "Get shortlisted",
      icon: "✅",
      description: "Our team reviews your profile and shortlists candidates based on fit."
    },
    {
      title: "Receive offer letter",
      icon: "📩",
      description: "Selected candidates receive an official internship offer letter."
    },
    {
      title: "Start internship",
      icon: "💻",
      description: "Begin your internship journey and work on guided practical tasks."
    },
    {
      title: "Get certificate",
      icon: "🎓",
      description: "Complete milestones and receive your internship completion certificate."
    }
  ];

  useEffect(() => {
    const sectionEntries = [
      ["internships", internshipsRef],
      ["about", aboutRef],
      ["howItWorks", howItWorksRef],
      ["contact", contactRef]
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const sectionKey = entry.target.getAttribute("data-section-key");
          if (!sectionKey) return;

          setVisibleSections((prev) => ({
            ...prev,
            [sectionKey]: true
          }));
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px"
      }
    );

    sectionEntries.forEach(([, ref]) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  // Check if user has an active internship
  useEffect(() => {
    const checkActiveInternship = async () => {
      if (!user) {
        setHasActiveInternship(false);
        setLoadingStatus(false);
        return;
      }

      try {
        const response = await api.get("/applications/me/active");
        setHasActiveInternship(response.data.hasActive);
      } catch (error) {
        console.error("Error checking application status:", error);
        setHasActiveInternship(false);
      } finally {
        setLoadingStatus(false);
      }
    };

    checkActiveInternship();
  }, [user]);

  const getSectionAnimationClass = (sectionKey) =>
    `transition-all duration-700 ease-out ${
      visibleSections[sectionKey] ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
    }`;

  const handleApplyNow = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/apply" } });
      return;
    }

    navigate("/apply");
  };

  const heroButtonsContainer = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.14
      }
    }
  };

  const heroButtonItem = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-white text-gray-900 transition-colors duration-300">
      <section className="relative overflow-hidden bg-gradient-to-r from-[#06163f] via-[#23166b] to-[#5a1e94] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-28 top-10 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="absolute -right-28 bottom-0 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:gap-14 md:px-8 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="text-center md:text-left"
          >
            <p className="inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1 text-sm font-medium text-blue-100">
              Provisioning Tech Internships
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-[3.5rem]">
              Kickstart Your Tech Career with Provisioning Tech
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-blue-100 md:mx-0 md:text-lg">
              Apply for real-world internships, build skills, and get certified.
            </p>

            <motion.div
              variants={heroButtonsContainer}
              initial="hidden"
              animate="visible"
              className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start"
            >
              <motion.a
                variants={heroButtonItem}
                whileHover={{ scale: 1.05 }}
                href="#internships"
                className="rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-xl shadow-black/20 ring-1 ring-white/40 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Explore Internships
              </motion.a>
              {!loadingStatus && (
                <motion.button
                  variants={heroButtonItem}
                  whileHover={!hasActiveInternship ? { scale: 1.05 } : {}}
                  type="button"
                  onClick={handleApplyNow}
                  disabled={hasActiveInternship}
                  className={`rounded-xl px-6 py-3 text-base font-semibold transition-all duration-300 ${
                    hasActiveInternship
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed opacity-60"
                      : "bg-blue-600 text-white backdrop-blur-sm hover:-translate-y-0.5 hover:bg-blue-700"
                  }`}
                >
                  {hasActiveInternship ? "Already Enrolled in Internship" : "Apply Now"}
                </motion.button>
              )}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.15, ease: "easeOut" }}
            className="mx-auto w-full max-w-md md:max-w-xl"
          >
            <div className="rounded-3xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-md">
              <svg viewBox="0 0 640 440" className="h-auto w-full" role="img" aria-label="Students collaborating and coding illustration">
                <defs>
                  <linearGradient id="workspaceGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a5b4fc" />
                    <stop offset="100%" stopColor="#c4b5fd" />
                  </linearGradient>
                </defs>

                <rect x="24" y="26" width="592" height="388" rx="28" fill="#0b1230" opacity="0.9" />
                <rect x="70" y="70" width="500" height="190" rx="18" fill="url(#workspaceGlow)" opacity="0.95" />
                <rect x="98" y="98" width="170" height="16" rx="8" fill="#1f2a56" opacity="0.65" />
                <rect x="98" y="128" width="250" height="12" rx="6" fill="#1f2a56" opacity="0.5" />
                <rect x="98" y="152" width="220" height="12" rx="6" fill="#1f2a56" opacity="0.45" />

                <circle cx="184" cy="308" r="34" fill="#f8fafc" />
                <circle cx="184" cy="292" r="16" fill="#fbbf24" />
                <rect x="154" y="322" width="60" height="56" rx="14" fill="#2563eb" />

                <circle cx="314" cy="304" r="36" fill="#f8fafc" />
                <circle cx="314" cy="286" r="17" fill="#fb7185" />
                <rect x="280" y="322" width="68" height="58" rx="14" fill="#4f46e5" />

                <circle cx="446" cy="308" r="34" fill="#f8fafc" />
                <circle cx="446" cy="292" r="16" fill="#34d399" />
                <rect x="414" y="322" width="64" height="56" rx="14" fill="#7c3aed" />

                <rect x="142" y="286" width="345" height="14" rx="7" fill="#cbd5e1" opacity="0.35" />
                <rect x="230" y="392" width="180" height="10" rx="5" fill="#cbd5e1" opacity="0.25" />
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="internships"
        ref={internshipsRef}
        data-section-key="internships"
        className={`mx-auto max-w-6xl px-4 py-16 ${getSectionAnimationClass("internships")}`}
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Internship Opportunities at Provisioning Tech</h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
            Choose a domain aligned with your career goals and start building practical, industry-ready experience.
          </p>
          <p className="mx-auto mt-3 max-w-3xl rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800 ring-1 ring-blue-100">
            To apply for internships, go to the homepage
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {internshipCategories.map((category) => (
            <article
              key={category.title}
              className="group flex h-full flex-col rounded-2xl bg-white p-5 shadow ring-1 ring-slate-200 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:ring-indigo-300"
            >
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-2xl shadow-md">
                <span>{category.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{category.title}</h3>
              <p className="mt-4 text-sm leading-6 text-slate-600">{category.description}</p>

              <div className="mt-4 rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Skills Required</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">{category.skills}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="about"
        ref={aboutRef}
        data-section-key="about"
        className={`mx-auto max-w-6xl px-4 py-16 ${getSectionAnimationClass("about")}`}
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Why Choose Us</h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
            A learning environment designed to prepare you for high-impact roles in technology and digital careers.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {whyChooseUs.map((item) => (
            <article
              key={item.title}
              className="group rounded-2xl bg-white p-6 shadow ring-1 ring-slate-200 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:ring-blue-300"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl ring-1 ring-blue-100 transition-transform duration-300 group-hover:scale-110">
                <span>{item.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-base leading-7 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        ref={howItWorksRef}
        data-section-key="howItWorks"
        className={`mx-auto max-w-6xl px-4 py-16 ${getSectionAnimationClass("howItWorks")}`}
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">How It Works</h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
            A clear five-step process to help you move from application to certification.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {howItWorksSteps.map((step, index) => (
            <article
              key={step.title}
              className="group relative rounded-2xl bg-white p-5 shadow ring-1 ring-slate-200 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:ring-indigo-300"
            >
              <div className="absolute right-3 top-3 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                Step {index + 1}
              </div>
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl shadow transition-transform duration-300 group-hover:scale-110">
                <span>{step.icon}</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-base leading-7 text-slate-600">{step.description}</p>
              {index < howItWorksSteps.length - 1 && (
                <div className="pointer-events-none absolute -right-2 top-1/2 hidden h-0.5 w-4 -translate-y-1/2 bg-gradient-to-r from-indigo-300 to-transparent lg:block" />
              )}
            </article>
          ))}
        </div>
      </section>

      <section
        id="contact"
        ref={contactRef}
        data-section-key="contact"
        className={`mx-auto max-w-6xl px-4 py-16 ${getSectionAnimationClass("contact")}`}
      >
        <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Features</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Apply for Internship",
              description: "Submit internship applications with profile details and resume upload."
            },
            {
              title: "Track Status",
              description: "Monitor application and internship progress in real time."
            },
            {
              title: "Get Offer Letter",
              description: "Receive generated offer letters when shortlisted by admin."
            },
            {
              title: "Get Certificate",
              description: "Obtain completion certificates automatically after internship completion."
            }
          ].map((feature) => (
            <article
              key={feature.title}
              className="rounded-xl bg-white p-5 shadow ring-1 ring-slate-200 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-base leading-7 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
