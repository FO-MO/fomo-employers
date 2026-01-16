"use client";
export const dynamic = "force-dynamic";

import { X, Check, Camera, Image as ImageIcon, User } from "lucide-react";
import { useState } from "react";
import { getAuthToken } from "@/lib/strapi/auth";
import { uploadImage } from "@/lib/strapi/strapiData";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://tbs9k5m4-1337.inc1.devtunnels.ms";

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

const KERALA_COLLEGES = [
  "Indian Institute of Technology Palakkad (IIT Palakkad)",
  "National Institute of Technology Calicut (NIT Calicut)",
  "Indian Institute of Management Kozhikode (IIM Kozhikode)",
  "Indian Institute of Science Education and Research Thiruvananthapuram (IISER)",
  "Cochin University of Science and Technology (CUSAT)",
  "University of Kerala, Trivandrum",
  "Mahatma Gandhi University, Kottayam",
  "Kannur University",
  "Calicut University",
  "Kerala University of Digital Sciences, Innovation and Technology (Digital University Kerala)",
  "APJ Abdul Kalam Technological University",
  "Kerala Agricultural University",
  "Kerala Veterinary and Animal Sciences University",
  "Kerala University of Fisheries and Ocean Studies",
  "Sree Sankaracharya University of Sanskrit",
  "Thunchath Ezhuthachan Malayalam University",
  "Amrita Vishwa Vidyapeetham, Amritapuri Campus",
  "Amrita School of Engineering, Coimbatore",
  "College of Engineering Trivandrum (CET)",
  "Government Engineering College Thrissur (GEC Thrissur)",
  "Government Engineering College Kozhikode (GEC Kozhikode)",
  "Government Engineering College Idukki",
  "Government Engineering College Barton Hill",
  "Government Engineering College Wayanad",
  "Government Engineering College Kannur",
  "Rajagiri School of Engineering and Technology, Kochi",
  "Rajagiri College of Social Sciences, Kochi",
  "Toc H Institute of Science and Technology, Ernakulam",
  "Mar Baselios College of Engineering and Technology, Trivandrum",
  "Mar Athanasius College of Engineering, Kothamangalam",
  "Sree Chitra Thirunal College of Engineering, Trivandrum",
  "Model Engineering College, Ernakulam",
  "TKM College of Engineering, Kollam",
  "LBS Institute of Technology for Women, Trivandrum",
  "NSS College of Engineering, Palakkad",
  "Malabar College of Engineering and Technology, Thrissur",
  "Ilahia College of Engineering and Technology, Muvattupuzha",
  "Federal Institute of Science and Technology (FISAT), Angamaly",
  "Albertian Institute of Science and Technology, Kalamassery",
  "Amal Jyothi College of Engineering, Kottayam",
  "Adi Shankara Institute of Engineering and Technology, Kalady",
  "Christ College, Irinjalakuda",
  "Sacred Heart College, Thevara",
  "St. Teresa's College, Ernakulam",
  "Assumption College, Changanassery",
  "St. Joseph's College, Devagiri",
  "Farook College, Kozhikode",
  "Maharaja's College, Ernakulam",
  "University College, Trivandrum",
  "Govt. Victoria College, Palakkad",
  "Brennen College, Thalassery",
  "St. Thomas College, Thrissur",
  "Vimala College, Thrissur",
  "Nirmala College, Muvattupuzha",
  "MES College, Marampally",
  "Deva Matha College, Kuravilangad",
  "Baselius College, Kottayam",
  "Bishop Moore College, Mavelikara",
  "CMS College, Kottayam",
  "Catholicate College, Pathanamthitta",
  "Government Law College, Ernakulam",
  "Government Law College, Trivandrum",
  "Government Medical College, Trivandrum",
  "Government Medical College, Kozhikode",
  "Government Medical College, Kottayam",
  "Pushpagiri Institute of Medical Sciences",
  "Believers Church Medical College, Thiruvalla",
  "Azeezia Institute of Medical Sciences, Kollam",
  "Other",
];

// Generate years from current year to next 10 years
const currentYear = new Date().getFullYear();
const GRADUATION_YEARS = Array.from({ length: 11 }, (_, i) =>
  (currentYear + i).toString()
);

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: {
    name: string;
    email: string;
    institution?: string;
    major?: string;
    graduationYear?: string;
    location?: string;
    bio?: string;
    skills?: string[];
    interests?: string[];
    profileImageUrl?: string | null;
    backgroundImageUrl?: string | null;
  };
  onSave: (data: {
    name: string;
    email: string;
    institution: string;
    major: string;
    graduationYear: string;
    location: string;
    bio: string;
    skills: string[];
    interests: string[];
  }) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  currentData,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = useState(currentData.name);
  const [email, setEmail] = useState(currentData.email);
  const [institution, setInstitution] = useState(currentData.institution || "");
  const [major, setMajor] = useState(currentData.major || "");
  const [graduationYear, setGraduationYear] = useState(
    currentData.graduationYear || ""
  );
  const [location, setLocation] = useState(currentData.location || "");
  const [bio, setBio] = useState(currentData.bio || "");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    currentData.skills || []
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    currentData.interests || []
  );
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [backgroundImgFile, setBackgroundImgFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string>(
    currentData.profileImageUrl || ""
  );
  const [backgroundImgPreview, setBackgroundImgPreview] = useState<string>(
    currentData.backgroundImageUrl || ""
  );

  // Search states
  const [collegeSearch, setCollegeSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [interestSearch, setInterestSearch] = useState("");

  if (!isOpen) return null;

  // Filter functions for search
  const filteredColleges = KERALA_COLLEGES.filter((college) =>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = getAuthToken();
      if (!token) {
        alert("You must be signed in to update your profile.");
        return;
      }

      // Get studentId from stored user
      let studentId: string | null = null;
      try {
        const { getUserCookie } = await import("@/lib/cookies");
        const parsed = getUserCookie();
        if (parsed) {
          studentId = (parsed?.documentId ?? parsed?.id ?? null) as
            | string
            | null;
        }
      } catch {
        // ignore parse errors
      }

      // Check for existing profile
      let recordId: string | null = null;
      if (studentId) {
        const q = `${BACKEND_URL}/api/student-profiles?filters[studentId][$eq]=${encodeURIComponent(
          studentId ?? ""
        )}&populate=*`;
        const res = await fetch(q, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          const rec = json?.data?.[0];
          recordId = rec?.documentId ?? null;
        } else {
          console.warn("Failed to check existing profile", res.status);
        }
      }

      // Build payload for Strapi (do NOT include email to prevent changes)
      const payload: Record<string, unknown> = {
        name,
        about: bio,
        college: institution,
        course: major,
        graduationYear,
        location,
        skills: selectedSkills,
        interests: selectedInterests,
      };

      // If record exists, try update. If update returns 404, fallback to create.
      if (recordId) {
        console.log({ data: payload });
        const updateRes = await fetch(
          `${BACKEND_URL}/api/student-profiles/${recordId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ data: payload }),
          }
        );

        if (!updateRes.ok) {
          const body = await updateRes.text();
          console.warn("Update failed", updateRes.status, body);
          if (updateRes.status === 404) {
            // fallback to create
            const createRes = await fetch(
              `${BACKEND_URL}/api/student-profiles`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ data: { ...payload, studentId } }),
              }
            );
            if (!createRes.ok) {
              console.error("Create fallback failed", await createRes.text());
              alert(
                "Failed to create profile after update failed. See console."
              );
              return;
            }
          } else {
            alert("Failed to update profile. See console for details.");
            return;
          }
        }
      } else {
        // No record -> create
        const createRes = await fetch(`${BACKEND_URL}/api/student-profiles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ data: { ...payload, studentId } }),
        });
        if (!createRes.ok) {
          console.error("Create failed", await createRes.text());
          alert("Failed to create profile. See console for details.");
          return;
        }
      }

      // Upload images only if new files are selected
      if (profilePicFile || backgroundImgFile) {
        // Get the profile ID for image upload
        const profileRes = await fetch(
          `${BACKEND_URL}/api/student-profiles?filters[studentId][$eq]=${encodeURIComponent(
            studentId ?? ""
          )}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const profile = profileData?.data?.[0];
          const profileId = profile?.id;

          if (profileId && profilePicFile) {
            await uploadImage(
              token,
              "api::student-profile.student-profile",
              profileId,
              "profilePic",
              profilePicFile
            );
          }

          if (profileId && backgroundImgFile) {
            await uploadImage(
              token,
              "api::student-profile.student-profile",
              profileId,
              "backgroundImg",
              backgroundImgFile
            );
          }
        }
      }

      // call parent onSave so UI updates locally (still include email for UI)
      onSave({
        name,
        email,
        institution,
        major,
        graduationYear,
        location,
        bio,
        skills: selectedSkills,
        interests: selectedInterests,
      });
      // Close modal after save
      onClose();
    } catch (err) {
      console.error("Failed to save profile", err);
      alert("Failed to save profile. See console for details.");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Name (read-only) */}
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

            {/* Email (read-only) */}
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

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Institution */}
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
                        onClick={() => {
                          setInstitution(college);
                          setCollegeSearch("");
                        }}
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

            {/* Major/Course */}
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

            {/* Graduation Year */}
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
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                placeholder="e.g., Cambridge, MA"
              />
            </div>

            {/* Skills Selection */}
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

            {/* Interests Selection */}
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

            {/* Profile Images Section */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Profile Images
              </h3>

              {/* Profile Picture */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Profile Picture
                </label>
                <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                      {profilePicPreview ? (
                        <img
                          src={profilePicPreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
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
                        <img
                          src={backgroundImgPreview}
                          alt="Background preview"
                          className="w-full h-full object-cover"
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

              <div className="mt-4 bg-amber-50 border border-amber-300 rounded-lg p-4 text-sm text-amber-900">
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

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white hover:bg-gray-100 text-gray-700 rounded-lg font-medium border border-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
