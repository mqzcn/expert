export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Expert Language Translation Services
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Connect with professional interpreters for real-time translation services in multiple languages.
        </p>
        <img
          src="/images/feature-banner.png"
          alt="Feature Banner"
          className="mx-auto w-full mt-10"
        />
        <div className="mt-10">
          <a
            href="/register"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Get Started
          </a>
        </div>
      </div>

      <div className="mt-32">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-center">
          Why Choose Us?
        </h2>
        <div className="mt-20 grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3">
          <div className="text-center flex flex-col items-center">
            <img
              src="/images/icon-professional.png"
              alt="Professional Interpreters Icon"
              className="mx-auto mb-4"
            />
            <h3 className="mt-3 text-lg font-semibold leading-8 tracking-tight text-gray-900">
              Professional Interpreters
            </h3>
            <p className="mt-4 text-base leading-7 text-gray-600 min-h-24">
              Our interpreters are certified professionals with extensive experience in their respective languages.
            </p>
          </div>
          <div className="text-center flex flex-col items-center">
            <img
              src="/images/icon-realtime.png"
              alt="Real-Time Translation Icon"
              className="mx-auto mb-4"
            />
            <h3 className="mt-3 text-lg font-semibold leading-8 tracking-tight text-gray-900">
              Real-Time Translation
            </h3>
            <p className="mt-4 text-base leading-7 text-gray-600 min-h-24">
              Get instant access to live translation services through video conferencing platforms.
            </p>
          </div>
          <div className="text-center flex flex-col items-center">
            <img
              src="/images/icon-languages.png"
              alt="Multiple Languages Icon"
              className="mx-auto mb-4"
            />
            <h3 className="mt-3 text-lg font-semibold leading-8 tracking-tight text-gray-900">
              Multiple Languages
            </h3>
            <p className="mt-4 text-base leading-7 text-gray-600 min-h-24">
              Choose from a wide range of languages and dialects to meet your translation needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}