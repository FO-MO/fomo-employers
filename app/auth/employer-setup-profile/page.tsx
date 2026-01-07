"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Building2, Upload, Globe, MapPin, Users, Tag } from "lucide-react";
import { uploadImage } from "@/lib/strapi/strapiData";

const STRAPI_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Industry options
const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Real Estate",
  "Consulting",
  "Media & Entertainment",
  "Transportation",
  "Hospitality",
  "Agriculture",
  "Energy",
  "Telecommunications",
  "Automotive",
  "Pharmaceutical",
  "E-commerce",
  "Food & Beverage",
  "Construction",
  "Other",
];

// Common specialties
const COMMON_SPECIALTIES = [
  "Software Development",
  "Data Analytics",
  "Cloud Computing",
  "Cybersecurity",
  "Artificial Intelligence",
  "Machine Learning",
  "Mobile App Development",
  "Web Development",
  "DevOps",
  "Digital Marketing",
  "Sales",
  "Customer Success",
  "Human Resources",
  "Financial Services",
  "Management Consulting",
  "Product Management",
  "UX/UI Design",
  "Quality Assurance",
  "Business Intelligence",
  "Project Management",
];

export default function EmployerSetupProfile() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const backgroundImgInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    industry: "",
    location: "",
    noOfEmployers: "",
    specialties: [] as string[],
    email: "",
    phoneNumber: "",
    country_code: "+91",
  });

  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    null
  );
  const [backgroundImgPreview, setBackgroundImgPreview] = useState<
    string | null
  >(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [backgroundImgFile, setBackgroundImgFile] = useState<File | null>(null);

  const [specialtySearch, setSpecialtySearch] = useState("");
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);

  // Check if user is authenticated and populate email
  useEffect(() => {
    const checkAuth = async () => {
      const { getAuthTokenCookie, getUserCookie } = await import(
        "@/lib/cookies"
      );
      const token = getAuthTokenCookie();
      if (!token) {
        router.push("/auth/employerlogin");
        return;
      }

      // Populate email from user data if available
      const user = getUserCookie();
      if (user?.email) {
        setFormData((prev) => ({ ...prev, email: user.email || "" }));
      }
    };
    checkAuth();
  }, [router]);

  // Handle profile picture upload
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle background image upload
  const handleBackgroundImgChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackgroundImgFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImgPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add specialty
  const addSpecialty = (specialty: string) => {
    if (
      specialty.trim() &&
      !formData.specialties.includes(specialty.trim()) &&
      formData.specialties.length < 10
    ) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, specialty.trim()],
      });
      setSpecialtySearch("");
      setShowSpecialtyDropdown(false);
    }
  };

  // Remove specialty
  const removeSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter((s) => s !== specialty),
    });
  };

  // Filter specialties for dropdown
  const filteredSpecialties = COMMON_SPECIALTIES.filter(
    (s) =>
      s.toLowerCase().includes(specialtySearch.toLowerCase()) &&
      !formData.specialties.includes(s)
  );

  // Validate step
  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = "Company name is required";
      }
      if (!formData.industry) {
        newErrors.industry = "Industry is required";
      }
      if (!formData.location.trim()) {
        newErrors.location = "Location is required";
      }
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (step === 2) {
      if (!formData.description.trim() || formData.description.length < 50) {
        newErrors.description =
          "Description must be at least 50 characters long";
      }
      if (formData.specialties.length === 0) {
        newErrors.specialties = "Add at least one specialty";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit profile
  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setLoading(true);

    try {
      const { getAuthTokenCookie } = await import("@/lib/cookies");
      const token = getAuthTokenCookie();
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Get current user
      const userResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await userResponse.json();

      // Create employer profile (matching the schema)
      const profileData = {
        data: {
          name: formData.name,
          description: formData.description,
          website: formData.website || null,
          industry: formData.industry,
          location: formData.location,
          noOfEmployers: formData.noOfEmployers
            ? parseInt(formData.noOfEmployers)
            : null,
          specialties: formData.specialties.join(", "),
          email: formData.email,
          phoneNumber: formData.phoneNumber
            ? parseInt(formData.phoneNumber)
            : null,
          country_code: formData.country_code
            ? parseInt(formData.country_code.replace("+", ""))
            : null,
          user: userData.id,
        },
      };

      const profileResponse = await fetch(
        `${STRAPI_URL}/api/employer-profiles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileData),
        }
      );

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.error?.message || "Failed to create profile");
      }

      const createdProfile = await profileResponse.json();
      const profileId = createdProfile.data.id;

      // Upload images if provided (using the same pattern as student profile)
      if (profilePicFile) {
        uploadImage(
          token,
          "api::employer-profile.employer-profile",
          profileId,
          "profilePic",
          profilePicFile
        ).catch((error) => {
          console.error("Failed to upload profile picture:", error);
        });
      }

      if (backgroundImgFile) {
        uploadImage(
          token,
          "api::employer-profile.employer-profile",
          profileId,
          "backgroundImg",
          backgroundImgFile
        ).catch((error) => {
          console.error("Failed to upload background image:", error);
        });
      }

      // Update user with hasProfile flag
      try {
        await fetch(`${STRAPI_URL}/api/users/${userData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            hasProfile: true,
          }),
        });
      } catch (error) {
        console.error("Failed to update user profile flag:", error);
      }

      // Show success message and redirect

      // Small delay to allow image uploads to start
      setTimeout(() => {
        router.push("/employers/overview");
      }, 500);
    } catch (error) {
      console.error("Error creating profile:", error);
      alert(
        `Failed to create profile: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-600 text-white mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Company Profile
          </h1>
          <p className="text-gray-600">
            Help students learn more about your organization
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-teal-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Basic Information
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Tell us about your company
                </p>
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Tech Innovations Inc."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.industry ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select an industry</option>
                  {INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
                {errors.industry && (
                  <p className="text-red-500 text-sm mt-1">{errors.industry}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Bangalore, India"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.location ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                )}
              </div>

              {/* Number of Employees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline w-4 h-4 mr-1" />
                  Number of Employees
                </label>
                <input
                  type="number"
                  value={formData.noOfEmployers}
                  onChange={(e) =>
                    setFormData({ ...formData, noOfEmployers: e.target.value })
                  }
                  placeholder="e.g., 500"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="inline w-4 h-4 mr-1" />
                  Company Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://www.example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="contact@company.com"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.country_code}
                    onChange={(e) =>
                      setFormData({ ...formData, country_code: e.target.value })
                    }
                    className="w-24 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+971">+971</option>
                    <option value="+65">+65</option>
                  </select>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    placeholder="9876543210"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Company Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Company Details
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Describe your company and specialties
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Tell students about your company, culture, mission, and what makes you unique..."
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description && (
                    <p className="text-red-500 text-sm">{errors.description}</p>
                  )}
                  <p
                    className={`text-sm ${
                      formData.description.length < 50
                        ? "text-gray-500"
                        : "text-teal-600"
                    } ml-auto`}
                  >
                    {formData.description.length}/50 characters minimum
                  </p>
                </div>
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="inline w-4 h-4 mr-1" />
                  Specialties <span className="text-red-500">*</span>
                  <span className="text-gray-500 font-normal ml-2">
                    (Add up to 10)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={specialtySearch}
                    onChange={(e) => {
                      setSpecialtySearch(e.target.value);
                      setShowSpecialtyDropdown(true);
                    }}
                    onFocus={() => setShowSpecialtyDropdown(true)}
                    placeholder="Search or type to add specialties..."
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                      errors.specialties ? "border-red-500" : "border-gray-300"
                    }`}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSpecialty(specialtySearch);
                      }
                    }}
                  />
                  {showSpecialtyDropdown && filteredSpecialties.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredSpecialties.map((specialty) => (
                        <div
                          key={specialty}
                          onClick={() => addSpecialty(specialty)}
                          className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-sm"
                        >
                          {specialty}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Specialties */}
                {formData.specialties.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm"
                      >
                        {specialty}
                        <button
                          onClick={() => removeSpecialty(specialty)}
                          className="ml-1 hover:text-teal-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.specialties && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.specialties}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Images */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Company Images
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Add profile and background images (Optional)
                </p>
              </div>

              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="inline w-4 h-4 mr-1" />
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  {profilePicPreview ? (
                    <div className="relative">
                      <img
                        src={profilePicPreview}
                        alt="Profile preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                      />
                      <button
                        onClick={() => {
                          setProfilePicPreview(null);
                          setProfilePicFile(null);
                          if (profilePicInputRef.current) {
                            profilePicInputRef.current.value = "";
                          }
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <Building2 className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      ref={profilePicInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePicChange}
                      className="hidden"
                    />
                    <button
                      onClick={() => profilePicInputRef.current?.click()}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                    >
                      Choose Image
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: Square image, at least 200x200px
                    </p>
                  </div>
                </div>
              </div>

              {/* Background Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="inline w-4 h-4 mr-1" />
                  Background Image
                </label>
                <div className="space-y-3">
                  {backgroundImgPreview ? (
                    <div className="relative">
                      <img
                        src={backgroundImgPreview}
                        alt="Background preview"
                        className="w-full h-40 rounded-lg object-cover border-2 border-gray-300"
                      />
                      <button
                        onClick={() => {
                          setBackgroundImgPreview(null);
                          setBackgroundImgFile(null);
                          if (backgroundImgInputRef.current) {
                            backgroundImgInputRef.current.value = "";
                          }
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-40 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          No image selected
                        </p>
                      </div>
                    </div>
                  )}
                  <div>
                    <input
                      ref={backgroundImgInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundImgChange}
                      className="hidden"
                    />
                    <button
                      onClick={() => backgroundImgInputRef.current?.click()}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                    >
                      Choose Image
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: Wide image, at least 1200x400px
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Tip:</strong> Images are optional but
                    recommended. They help make your profile more attractive to
                    students and can be added or changed later from your profile
                    settings.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                  <p className="text-sm text-amber-900">
                    <strong className="flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      Important Notice
                    </strong>
                  </p>
                  <p className="text-sm text-amber-900 mt-1">
                    Uploaded images may take a few moments to appear on your
                    profile due to processing time. Please be patient and
                    refresh your profile page if images don&apos;t appear
                    immediately.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            {currentStep > 1 ? (
              <button
                onClick={handlePrevious}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Previous
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Profile...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
