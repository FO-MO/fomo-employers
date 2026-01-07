"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Check,
  ArrowRight,
  User,
  GraduationCap,
  MapPin,
  BookOpen,
  Camera,
  Image as ImageIcon,
} from "lucide-react";
import { getAuthToken } from "@/lib/strapi/auth";
import { createStudentProfile } from "@/lib/strapi/profile";
import { CreateProfileData } from "@/lib/interfaces";
import Link from "next/link";
import { fetchColleges, uploadImage } from "@/lib/strapi/strapiData";

// Predefined options
const AVAILABLE_SKILLS = [
  "React",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "C#",
  "Ruby",
  "PHP",
  "Go",
  "Rust",
  "Kotlin",
  "Swift",
  "Flutter",
  "React Native",
  "Vue.js",
  "Angular",
  "Svelte",
  "Next.js",
  "Express.js",
  "Django",
  "Flask",
  "Spring Boot",
  "ASP.NET",
  "Laravel",
  "Ruby on Rails",
  "Machine Learning",
  "Deep Learning",
  "Natural Language Processing",
  "Computer Vision",
  "Data Science",
  "Data Analysis",
  "Statistics",
  "UI/UX Design",
  "Graphic Design",
  "Product Design",
  "Figma",
  "Adobe XD",
  "Photoshop",
  "Illustrator",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "Google Cloud",
  "Firebase",
  "Heroku",
  "GraphQL",
  "REST API",
  "Microservices",
  "TensorFlow",
  "PyTorch",
  "Scikit-learn",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "DynamoDB",
  "Git",
  "GitHub",
  "GitLab",
  "CI/CD",
  "Jenkins",
  "Linux",
  "Bash Scripting",
  "Agile/Scrum",
  "Project Management",
  "Technical Writing",
  "Public Speaking",
  "Leadership",
  "Team Collaboration",
];

const AVAILABLE_INTERESTS = [
  "Artificial Intelligence",
  "Machine Learning",
  "Deep Learning",
  "Natural Language Processing",
  "Computer Vision",
  "Web Development",
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "Mobile Development",
  "iOS Development",
  "Android Development",
  "Cross-Platform Development",
  "Game Development",
  "AR/VR Development",
  "Blockchain",
  "Cryptocurrency",
  "NFTs",
  "Smart Contracts",
  "Cybersecurity",
  "Ethical Hacking",
  "Network Security",
  "Cloud Computing",
  "DevOps",
  "Data Science",
  "Big Data",
  "Data Visualization",
  "Business Intelligence",
  "IoT (Internet of Things)",
  "Robotics",
  "Embedded Systems",
  "Quantum Computing",
  "Edge Computing",
  "UI/UX Design",
  "Product Design",
  "Graphic Design",
  "Motion Graphics",
  "3D Modeling",
  "Animation",
  "Startups",
  "Entrepreneurship",
  "Product Management",
  "Business Strategy",
  "Digital Marketing",
  "Content Creation",
  "Social Media",
  "Open Source",
  "Open Source Contribution",
  "Hackathons",
  "Competitive Programming",
  "Algorithms",
  "System Design",
  "Research",
  "Academic Publishing",
  "Teaching",
  "Mentoring",
  "Community Building",
  "Tech Blogging",
  "Podcasting",
  "Video Production",
  "Photography",
  "Music Production",
  "Finance Technology (FinTech)",
  "Health Technology (HealthTech)",
  "Education Technology (EdTech)",
  "E-commerce",
  "SaaS Products",
  "API Development",
  "Automation",
  "Testing & QA",
];

const AVAILABLE_COURSES = [
  "Computer Science",
  "Information Technology",
  "Software Engineering",
  "Data Science",
  "Artificial Intelligence",
  "Machine Learning",
  "Cybersecurity",
  "Computer Engineering",
  "Electronics and Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "Biomedical Engineering",
  "Aerospace Engineering",
  "Automobile Engineering",
  "Industrial Engineering",
  "Mathematics",
  "Statistics",
  "Physics",
  "Chemistry",
  "Biology",
  "Biochemistry",
  "Microbiology",
  "Genetics",
  "Business Administration (BBA/MBA)",
  "Management Studies",
  "Finance",
  "Accounting",
  "Economics",
  "Marketing",
  "Human Resources",
  "International Business",
  "Commerce",
  "Psychology",
  "Sociology",
  "Political Science",
  "History",
  "English Literature",
  "Journalism",
  "Mass Communication",
  "Media Studies",
  "Film Studies",
  "Animation",
  "Graphic Design",
  "Fashion Design",
  "Interior Design",
  "Architecture",
  "Fine Arts",
  "Performing Arts",
  "Music",
  "Law (LLB/LLM)",
  "Medicine (MBBS)",
  "Nursing",
  "Pharmacy",
  "Physiotherapy",
  "Dentistry",
  "Veterinary Science",
  "Agriculture",
  "Forestry",
  "Environmental Science",
  "Geography",
  "Geology",
  "Hospitality Management",
  "Hotel Management",
  "Tourism",
  "Culinary Arts",
  "Education (B.Ed/M.Ed)",
  "Library Science",
  "Social Work",
  "Public Administration",
  "Development Studies",
  "Urban Planning",
  "Other",
];

// Generate years from current year to next 10 years
const currentYear = new Date().getFullYear();
const GRADUATION_YEARS = Array.from({ length: 11 }, (_, i) => currentYear + i);

export default function SetupProfilePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [institution, setInstitution] = useState("");
  const [colleges, setColleges] = useState<string[]>([]);
  const [collegeData, setCollegeData] = useState<Record<string, string>>({}); // Store key-value pairs
  const [verificationCode, setVerificationCode] = useState("");
  const [verification, setVerification] = useState(0); // 0 = not verified, 1 = verified
  const [major, setMajor] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [backgroundImgFile, setBackgroundImgFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string>("");
  const [backgroundImgPreview, setBackgroundImgPreview] = useState<string>("");

  // Search states
  const [collegeSearch, setCollegeSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [interestSearch, setInterestSearch] = useState("");

  useEffect(() => {
    // Check if user is authenticated
    const token = getAuthToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    // Fetch colleges from backend
    const loadColleges = async () => {
      try {
        const collegeData = await fetchColleges(token);
        if (collegeData && typeof collegeData === "object") {
          // Store the raw key-value pairs
          setCollegeData(collegeData as Record<string, string>);
          // Extract college names for display
          const collegeList = Array.isArray(collegeData)
            ? collegeData
            : Object.values(collegeData);
          setColleges(collegeList.map((c) => String(c)));
        }
      } catch (error) {
        console.error("Failed to fetch colleges:", error);
      }
    };

    loadColleges();

    // Get user info from cookies
    const fetchUser = async () => {
      try {
        const { getUserCookie } = await import("@/lib/cookies");
        const user = getUserCookie();
        if (user) {
          if (user.username) {
            setName(user.username);
          }
          if (user.email) {
            setEmail(user.email);
          }
        }
      } catch (err) {
        console.error("Failed to get user data:", err);
      }
    };
    fetchUser();
  }, [router]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleVerificationCodeSubmit = () => {
    if (verificationCode.trim() === "") {
      setError("Please enter a verification code");
      return;
    }

    // Check if code exists in college data keys
    if (collegeData.hasOwnProperty(verificationCode)) {
      const collegeName = collegeData[verificationCode];
      setInstitution(collegeName);
      setVerification(1); // Mark as verified
      setVerificationCode("");
      setError("");
    } else {
      setError("Invalid verification code. Please check and try again.");
    }
  };

  const handleCollegeSelect = (college: string) => {
    setInstitution(college);
    setVerification(0); // Mark as not verified when manually selected
    setCollegeSearch("");
  };
  const filteredColleges = colleges.filter((college) =>
    college.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  const filteredCourses = AVAILABLE_COURSES.filter((course) =>
    course.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const filteredSkills = AVAILABLE_SKILLS.filter((skill) =>
    skill.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const filteredInterests = AVAILABLE_INTERESTS.filter((interest) =>
    interest.toLowerCase().includes(interestSearch.toLowerCase())
  );

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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!name.trim() || !email.trim()) {
          setError(
            "Name and email are required. Please log in again if missing."
          );
          return false;
        }
        return true;
      case 2:
        if (!institution.trim() || !major.trim() || !graduationYear.trim()) {
          setError("All education fields are required");
          return false;
        }
        return true;
      case 3:
        if (!bio.trim() || !location.trim()) {
          setError("Bio and location are required");
          return false;
        }
        return true;
      case 4:
        if (selectedSkills.length === 0) {
          setError("Please select at least one skill");
          return false;
        }
        if (selectedInterests.length === 0) {
          setError("Please select at least one interest");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    setError("");
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    setError("");
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        setError("You must be signed in to create a profile");
        setLoading(false);
        return;
      }

      // Get student ID from stored user
      let studentId: string | null = null;
      try {
        const { getUserCookie } = await import("@/lib/cookies");
        const user = getUserCookie();
        if (user) {
          studentId = user?.documentId || null;
        }
      } catch (err) {
        console.error("Failed to get student ID:", err);
      }

      if (!studentId) {
        setError("Failed to identify user. Please log in again.");
        setLoading(false);
        return;
      }

      // Create profile
      const profileData: CreateProfileData = {
        studentId: studentId as string,
        name,
        email,
        about: bio,
        college: institution,
        course: major,
        graduationYear,
        location,
        skills: selectedSkills,
        interests: selectedInterests,
        verification: verification,
        // ...(profilePicId && { profilePic: profilePicId }),
        // ...(backgroundImgId && { backgroundImage: backgroundImgId }),
      };

      const result = await createStudentProfile(profileData, token);

      if (result) {
        // Profile created successfully
        // Store profile completion flag
        localStorage.setItem("profile_completed", "true");
        if (profilePicFile) {
          uploadImage(
            token,
            "api::student-profile.student-profile",
            result.id ? result.id : undefined,
            "profilePic",
            profilePicFile
          );
        }
        if (backgroundImgFile) {
          uploadImage(
            token,
            "api::student-profile.student-profile",
            result.id ? result.id : undefined,
            "backgroundImg",
            backgroundImgFile
          );
        }

        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
        await fetch(`${BACKEND_URL}/api/student-profile/${result.documentId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            data: {
              age: 12,
            },
          }),
        });

        // Redirect to students dashboard
        router.push("/students");
      } else {
        setError("Failed to create profile. Please try again.");
      }
    } catch (err) {
      console.error("Profile creation error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Basic Information
              </h2>
              <p className="text-gray-600">Confirm your account details</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                readOnly
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                placeholder="Your name"
              />
              <p className="text-xs text-gray-500 mt-1">
                This is your registered name and cannot be changed here
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                readOnly
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                placeholder="Your email"
              />
              <p className="text-xs text-gray-500 mt-1">
                This is your registered email and cannot be changed here
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Education
              </h2>
              <p className="text-gray-600">
                Tell us about your academic background
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Institution *
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={collegeSearch}
                  onChange={(e) => setCollegeSearch(e.target.value)}
                  placeholder="Search for your college..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                />
                <div className="max-h-48 overflow-y-auto border-2 border-gray-300 rounded-lg">
                  {filteredColleges.length > 0 ? (
                    filteredColleges.map((college) => (
                      <button
                        key={college}
                        type="button"
                        onClick={() => handleCollegeSelect(college)}
                        className={`w-full text-left px-4 py-2.5 hover:bg-teal-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          institution === college
                            ? "bg-teal-100 font-semibold text-teal-900"
                            : "text-gray-700"
                        }`}
                      >
                        {college}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      No colleges found. Try a different search.
                    </div>
                  )}
                </div>
                {institution && (
                  <div className="flex items-center gap-2 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                    <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-teal-900 flex-1">
                      {institution}
                    </span>
                    <button
                      type="button"
                      onClick={() => setInstitution("")}
                      className="text-teal-600 hover:text-teal-800"
                    >
                      <span className="text-xs">Change</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Code Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Verification Code (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Have a college verification code? Enter it to get verified.
              </p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter verification code..."
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={handleVerificationCodeSubmit}
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Verify
                  </button>
                </div>
                {verification === 1 && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-green-900">
                      ✓ Verified with code
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Major/Course *
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="Search for your course..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                />
                <div className="max-h-48 overflow-y-auto border-2 border-gray-300 rounded-lg">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <button
                        key={course}
                        type="button"
                        onClick={() => {
                          setMajor(course);
                          setCourseSearch("");
                        }}
                        className={`w-full text-left px-4 py-2.5 hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          major === course
                            ? "bg-purple-100 font-semibold text-purple-900"
                            : "text-gray-700"
                        }`}
                      >
                        {course}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      No courses found. Try a different search.
                    </div>
                  )}
                </div>
                {major && (
                  <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-purple-900 flex-1">
                      {major}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMajor("")}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <span className="text-xs">Change</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Graduation Year *
              </label>
              <select
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white cursor-pointer"
                required
              >
                <option value="">Select graduation year</option>
                {GRADUATION_YEARS.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                About You
              </h2>
              <p className="text-gray-600">Share more about yourself</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bio *
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 resize-none"
                placeholder="Tell us about yourself, your interests, goals, and what you're passionate about..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                  placeholder="e.g., Cambridge, MA"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Skills & Interests
              </h2>
              <p className="text-gray-600">Choose what describes you best</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Skills * ({selectedSkills.length} selected)
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  placeholder="Search skills..."
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                />
                <div className="max-h-60 overflow-y-auto border-2 border-gray-300 rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {filteredSkills.length > 0 ? (
                      filteredSkills.map((skill) => {
                        const isSelected = selectedSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-teal-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                            {skill}
                          </button>
                        );
                      })
                    ) : (
                      <div className="w-full text-center py-4 text-gray-500 text-sm">
                        No skills found matching &quot;{skillSearch}&quot;
                      </div>
                    )}
                  </div>
                </div>
                {selectedSkills.length > 0 && (
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-teal-900 mb-2">
                      Selected Skills:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-teal-600 text-white text-xs rounded-md"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className="hover:bg-teal-700 rounded-full p-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Interests * ({selectedInterests.length} selected)
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  value={interestSearch}
                  onChange={(e) => setInterestSearch(e.target.value)}
                  placeholder="Search interests..."
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <div className="max-h-60 overflow-y-auto border-2 border-gray-300 rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {filteredInterests.length > 0 ? (
                      filteredInterests.map((interest) => {
                        const isSelected = selectedInterests.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                            {interest}
                          </button>
                        );
                      })
                    ) : (
                      <div className="w-full text-center py-4 text-gray-500 text-sm">
                        No interests found matching &quot;{interestSearch}&quot;
                      </div>
                    )}
                  </div>
                </div>
                {selectedInterests.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-blue-900 mb-2">
                      Selected Interests:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedInterests.map((interest) => (
                        <span
                          key={interest}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-md"
                        >
                          {interest}
                          <button
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className="hover:bg-blue-700 rounded-full p-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Profile Images
              </h2>
              <p className="text-gray-600">
                Add photos to personalize your profile (Optional)
              </p>
            </div>

            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Profile Picture
              </label>
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {profilePicPreview ? (
                      <Image
                        src={profilePicPreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                        width={128}
                        height={128}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <User className="w-12 h-12 mb-2" />
                        <span className="text-xs">No photo</span>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePicChange}
                      className="hidden"
                      id="profilePicInput"
                    />
                    <label
                      htmlFor="profilePicInput"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium cursor-pointer transition-colors shadow-md"
                    >
                      <Camera className="w-5 h-5" />
                      {profilePicPreview ? "Change Photo" : "Upload Photo"}
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      JPG, PNG or GIF (max. 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Background Image
              </label>
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                <div className="flex flex-col gap-4">
                  <div className="w-full h-48 rounded-lg bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {backgroundImgPreview ? (
                      <Image
                        src={backgroundImgPreview}
                        alt="Background preview"
                        className="w-full h-full object-cover"
                        width={800}
                        height={192}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon className="w-16 h-16 mb-3" />
                        <span className="text-sm font-medium">
                          No background image
                        </span>
                        <span className="text-xs">
                          Upload to customize your profile
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundImgChange}
                      className="hidden"
                      id="backgroundImgInput"
                    />
                    <label
                      htmlFor="backgroundImgInput"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium cursor-pointer transition-colors shadow-md"
                    >
                      <ImageIcon className="w-5 h-5" />
                      {backgroundImgPreview
                        ? "Change Background"
                        : "Upload Background"}
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      JPG, PNG or GIF (max. 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-medium mb-1">💡 Tip:</p>
                <p>
                  These images are optional but help make your profile stand
                  out! You can always add or change them later from your profile
                  settings.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 text-sm text-amber-900">
                <p className="font-semibold mb-1 flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  Important Notice
                </p>
                <p>
                  Uploaded images may take a few moments to appear on your
                  profile due to processing time. Please be patient and refresh
                  your profile page if images don&apos;t appear immediately.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <Link href="/">
        <div className="w-full border-b border-gray-300 py-4 px-12">
          <h1 className="text-black text-3xl font-bold">FOOMO</h1>
        </div>
      </Link>

      {/* Main Content */}
      <div className="flex flex-1 justify-center items-center p-4">
        <div className="w-full max-w-2xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Step {currentStep} of 5
              </span>
              <span className="text-sm font-semibold text-teal-700">
                {Math.round((currentStep / 5) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-teal-500 to-cyan-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-6 py-2.5 bg-white hover:bg-gray-100 text-gray-700 rounded-lg font-medium border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating Profile..." : "Complete Setup"}
                  {!loading && <Check className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>

          {/* Skip Button */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => router.push("/students")}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Skip for now (you can complete this later)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
