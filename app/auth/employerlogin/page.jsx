"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { strapiRegister, setAuthToken } from "@/lib/strapi/auth";
import { setUserCookie } from "@/lib/cookies";

export default function EmployerLogin() {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [companyDescription, setCompanyDescription] = React.useState("");
  const [industry, setIndustry] = React.useState("");
  const [companySize, setCompanySize] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const username = email.split("@")[0];
      const result = await strapiRegister(username, email, password);

      if (result?.error) {
        setError(result.error.message || "Registration failed");
        console.error("Sign up error:", result);
      } else if (result?.jwt) {
        setAuthToken(result.jwt);
        setUserCookie(result.user);
        // Redirect to employer profile setup
        window.location.href = "/auth/employer-setup-profile";
      } else {
        setError("Unexpected registration response");
        console.error("Unexpected registration response", result);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Full-width header */}
      <Link href="/">
        <div className="w-full border-b border-gray-300 py-4 px-12">
          <h1 className="text-black text-3xl font-bold">FOOMO</h1>
        </div>
      </Link>

      {/* Centered login form */}
      <div className="flex flex-1 justify-center items-center mb-4  mt-4">
        <div className="w-full max-w-xl bg-white border border-gray-200 rounded-lg shadow-md p-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 mb-6">
            Sign up for free
          </h2>
          <p className="text-sm text-gray-400 mt-2 mb-2">
            Create an account to post your job—and gain access to more than 15
            million verified students and alumni.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-900"
              >
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-900"
              >
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900"
              >
                Work Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-900"
              >
                Company name
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                autoComplete="organization"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="companyDescription"
                className="block text-sm font-medium text-gray-900"
              >
                Company Description (optional)
              </label>
              <textarea
                id="companyDescription"
                name="companyDescription"
                placeholder="Brief description of your company..."
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                rows={4}
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm"
              ></textarea>
            </div>

            <div>
              <label
                htmlFor="industry"
                className="block text-sm font-medium text-gray-900"
              >
                Industry (optional)
              </label>
              <input
                id="industry"
                name="industry"
                type="text"
                autoComplete="off"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="companySize"
                className="block text-sm font-medium text-gray-900"
              >
                Company size (optional)
              </label>
              <input
                id="companySize"
                name="companySize"
                type="text"
                autoComplete="off"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="website"
                className="block text-sm font-medium text-gray-900"
              >
                Website (optional)
              </label>
              <input
                id="website"
                name="website"
                type="url"
                autoComplete="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-900"
              >
                Location (optional)
              </label>
              <input
                id="location"
                name="location"
                type="text"
                autoComplete="off"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm"
              />
            </div>

            <p className="text-sm text-gray-400 mt-2 mb-1">
              By clicking "Create account", I agree to the ConnectEd Terms of
              Service and have read the Privacy Policy.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center rounded-md bg-teal-900 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
          <div className="mt-6 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm">
              Already have an account?
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <Link
            href="/auth/login"
            className="mt-4 w-full inline-block text-center border border-teal-900 text-teal-700 bg-white py-2 rounded-md hover:bg-teal-900 hover:text-white transition-colors duration-200"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
