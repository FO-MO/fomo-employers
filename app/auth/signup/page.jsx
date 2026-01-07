"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { strapiRegister, setAuthToken } from "@/lib/strapi/auth";
import { setUserCookie } from "@/lib/cookies";

export default function Signup() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [passwordStrength, setPasswordStrength] = React.useState({
    score: 0,
    message: "",
    color: "gray",
  });
  const router = useRouter();

  // Password strength checker
  const checkPasswordStrength = (pwd) => {
    let score = 0;
    let message = "";
    let color = "gray";

    if (pwd.length === 0) {
      return { score: 0, message: "", color: "gray" };
    }

    // Length check
    if (pwd.length < 8) {
      return {
        score: 1,
        message: "Too short (minimum 8 characters)",
        color: "red",
      };
    }

    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;

    // Character variety checks
    if (/[a-z]/.test(pwd)) score += 1; // lowercase
    if (/[A-Z]/.test(pwd)) score += 1; // uppercase
    if (/[0-9]/.test(pwd)) score += 1; // numbers
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1; // special characters

    // Determine strength
    if (score <= 2) {
      message = "Weak password";
      color = "red";
    } else if (score <= 4) {
      message = "Fair password";
      color = "orange";
    } else if (score <= 5) {
      message = "Good password";
      color = "yellow";
    } else {
      message = "Strong password";
      color = "green";
    }

    return { score, message, color };
  };

  // Update password strength on change
  const handlePasswordChange = (event) => {
    const pwd = event.target.value;
    setPassword(pwd);
    setPasswordStrength(checkPasswordStrength(pwd));
  };

  // Validate password before submission
  const validatePassword = () => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      return "Password must contain at least one special character (!@#$%^&*)";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Validate password strength
    const passwordError = validatePassword();
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    try {
      const result = await strapiRegister(
        name || email,
        email,
        password,
        "student"
      );
      if (result?.error) {
        setError(result.error.message || "Registration failed");
        console.error("Sign up error:", result);
      } else if (result?.jwt) {
        // Immediately set token and redirect to profile setup
        setAuthToken(result.jwt);
        setUserCookie(result.user);
        setSuccess(true);
        window.location.href = "/auth/setup-profile";
      } else {
        // Strapi may require email confirmation depending on settings
        setSuccess(true);
        setError("Please check your email to confirm your account");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col">
      <Link href="/">
        <div className="w-full border-b border-gray-300 py-4 px-12">
          <h1 className="text-black text-3xl font-bold">FOOMO</h1>
        </div>
      </Link>

      {/* Centered login form */}
      <div className="flex scale-90 sm:scale-100 flex-1 justify-center items-center ">
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-md p-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 mb-6">
            Sign Up
          </h2>
          <p className="text-sm text-gray-400 mt-2 mb-1">
            Enter your information to create an account
          </p>

          {error && (
            <div
              className={`${
                error.includes("check your email")
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-red-50 border-red-200 text-red-700"
              } border px-4 py-3 rounded-md text-sm`}
            >
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              Account created successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900"
              >
                Name
              </label>
              <input
                id="text"
                name="text"
                type="text"
                required
                autoComplete="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
              <div className="relative mt-2">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="block w-full rounded-md bg-white px-3 py-2 pr-10 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.color === "red"
                            ? "bg-red-500 w-1/4"
                            : passwordStrength.color === "orange"
                            ? "bg-orange-500 w-2/4"
                            : passwordStrength.color === "yellow"
                            ? "bg-yellow-500 w-3/4"
                            : passwordStrength.color === "green"
                            ? "bg-green-500 w-full"
                            : "bg-gray-300 w-0"
                        }`}
                      ></div>
                    </div>
                  </div>
                  <p
                    className={`text-xs font-medium ${
                      passwordStrength.color === "red"
                        ? "text-red-600"
                        : passwordStrength.color === "orange"
                        ? "text-orange-600"
                        : passwordStrength.color === "yellow"
                        ? "text-yellow-600"
                        : passwordStrength.color === "green"
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {passwordStrength.message}
                  </p>
                  <div className="mt-2 text-xs text-gray-600 space-y-1">
                    <p className="font-medium">Password must contain:</p>
                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                      <li
                        className={password.length >= 8 ? "text-green-600" : ""}
                      >
                        At least 8 characters
                      </li>
                      <li
                        className={
                          /[a-z]/.test(password) ? "text-green-600" : ""
                        }
                      >
                        One lowercase letter (a-z)
                      </li>
                      <li
                        className={
                          /[A-Z]/.test(password) ? "text-green-600" : ""
                        }
                      >
                        One uppercase letter (A-Z)
                      </li>
                      <li
                        className={
                          /[0-9]/.test(password) ? "text-green-600" : ""
                        }
                      >
                        One number (0-9)
                      </li>
                      <li
                        className={
                          /[^a-zA-Z0-9]/.test(password) ? "text-green-600" : ""
                        }
                      >
                        One special character (!@#$%^&*)
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-900"
              >
                Confirm Password
              </label>
              <div className="relative mt-2">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="block w-full rounded-md bg-white px-3 py-2 pr-10 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-2 text-xs text-red-600 font-medium">
                  Passwords do not match
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="mt-2 text-xs text-green-600 font-medium">
                  ✓ Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full flex justify-center rounded-md bg-teal-900 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Creating account..."
                : success
                ? "Account created!"
                : "Sign Up"}
            </button>
          </form>
          <div className="mt-6 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm">
              Already have an account?
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button className="mt-4 w-full border-1 border-teal-900 text-teal-700 bg-white py-2 rounded-md hover:bg-teal-900 hover:text-white transition-colors duration-200">
            <Link href="/auth/login" className="w-full block text-center">
              Login
            </Link>
          </button>
        </div>
      </div>
    </div>
  );
}
