export interface Candidate {
  id: string;
  name: string;
  email?: string | null;
  college: string;
  branch: string;
  cgpa: number;
  skills: string[];
  location: string;
  aiScores: {
    communication: number;
    technical: number;
    confidence: number;
    overall: number;
  };
  matchScore: number;
  experience: string;
  projects: number;
  portfolio?: string;
  avatar: string;
  strengths: string[];
  summary: string;
  collegePlacement: boolean;
  applicationStatus?: "pending" | "reviewing" | "accepted" | "rejected" | null;
}

export const candidates: Candidate[] = [
  {
    id: "1",
    name: "Arjun Nair",
    college: "TKM College of Engineering",
    branch: "Mechanical Engineering",
    cgpa: 8.4,
    skills: ["SolidWorks", "AutoCAD", "MATLAB", "Python"],
    location: "Kollam, Kerala",
    aiScores: { communication: 8.2, technical: 7.8, confidence: 8.5, overall: 8.2 },
    matchScore: 92,
    experience: "1 Internship",
    projects: 4,
    portfolio: "https://arjun.dev",
    avatar: "AN",
    strengths: ["Strong communication", "Design thinking", "Problem solving"],
    summary: "Highly motivated mechanical engineering student with strong CAD skills and practical project experience. Demonstrates excellent communication and analytical abilities.",
    collegePlacement: true,
  },
  {
    id: "2",
    name: "Priya Sharma",
    college: "NIT Calicut",
    branch: "Computer Science",
    cgpa: 9.1,
    skills: ["React", "TypeScript", "Python", "Node.js", "AWS"],
    location: "Kozhikode, Kerala",
    aiScores: { communication: 9.0, technical: 9.2, confidence: 8.8, overall: 9.0 },
    matchScore: 97,
    experience: "2 Internships",
    projects: 7,
    portfolio: "https://priyasharma.dev",
    avatar: "PS",
    strengths: ["Full-stack development", "System design", "Leadership"],
    summary: "Outstanding CS student with strong full-stack development skills. Has built production-grade applications and demonstrates exceptional technical depth.",
    collegePlacement: true,
  },
  {
    id: "3",
    name: "Rahul Menon",
    college: "College of Engineering Trivandrum",
    branch: "Electronics & Communication",
    cgpa: 8.7,
    skills: ["VHDL", "Embedded C", "Arduino", "PCB Design"],
    location: "Thiruvananthapuram, Kerala",
    aiScores: { communication: 7.5, technical: 8.9, confidence: 7.8, overall: 8.1 },
    matchScore: 85,
    experience: "1 Internship",
    projects: 5,
    avatar: "RM",
    strengths: ["Hardware design", "Technical depth", "Research aptitude"],
    summary: "Strong ECE student with hands-on embedded systems experience. Excels in hardware design and has published research in IoT applications.",
    collegePlacement: true,
  },
  {
    id: "4",
    name: "Ananya Krishnan",
    college: "GEC Thrissur",
    branch: "Computer Science",
    cgpa: 8.9,
    skills: ["Java", "Spring Boot", "MySQL", "Docker", "Git"],
    location: "Thrissur, Kerala",
    aiScores: { communication: 8.5, technical: 8.7, confidence: 9.0, overall: 8.7 },
    matchScore: 91,
    experience: "2 Internships",
    projects: 6,
    portfolio: "https://ananya.codes",
    avatar: "AK",
    strengths: ["Backend development", "Database design", "Team collaboration"],
    summary: "Versatile backend developer with expertise in Java ecosystem. Strong problem-solver with excellent team collaboration skills.",
    collegePlacement: false,
  },
  {
    id: "5",
    name: "Vishnu Prasad",
    college: "NIT Calicut",
    branch: "Electrical Engineering",
    cgpa: 7.8,
    skills: ["MATLAB", "Simulink", "Python", "Power Systems"],
    location: "Kozhikode, Kerala",
    aiScores: { communication: 7.2, technical: 8.0, confidence: 7.5, overall: 7.6 },
    matchScore: 78,
    experience: "No Experience",
    projects: 3,
    avatar: "VP",
    strengths: ["Analytical thinking", "Power systems knowledge", "Quick learner"],
    summary: "Dedicated EEE student with solid foundation in power systems and simulation tools. Eager to apply theoretical knowledge in industry settings.",
    collegePlacement: false,
  },
  {
    id: "6",
    name: "Deepa Thomas",
    college: "MES College of Engineering",
    branch: "Civil Engineering",
    cgpa: 8.2,
    skills: ["AutoCAD", "STAAD Pro", "Revit", "Project Management"],
    location: "Kottayam, Kerala",
    aiScores: { communication: 8.8, technical: 7.5, confidence: 8.2, overall: 8.2 },
    matchScore: 84,
    experience: "1 Internship",
    projects: 4,
    avatar: "DT",
    strengths: ["Structural analysis", "Communication", "Project planning"],
    summary: "Civil engineering student with practical construction site experience. Excellent communicator with strong project management skills.",
    collegePlacement: true,
  },
  {
    id: "7",
    name: "Aditya Raj",
    college: "NIT Calicut",
    branch: "Computer Science",
    cgpa: 9.4,
    skills: ["Python", "ML", "TensorFlow", "React", "Go"],
    location: "Kozhikode, Kerala",
    aiScores: { communication: 9.2, technical: 9.5, confidence: 9.1, overall: 9.3 },
    matchScore: 98,
    experience: "3 Internships",
    projects: 10,
    portfolio: "https://adityaraj.ml",
    avatar: "AR",
    strengths: ["Machine learning", "Research", "Full-stack", "Open source"],
    summary: "Exceptional CS student with deep ML expertise and open-source contributions. Has interned at top tech companies and published research papers.",
    collegePlacement: false,
  },
  {
    id: "8",
    name: "Meera Suresh",
    college: "TKM College of Engineering",
    branch: "Electronics & Communication",
    cgpa: 8.0,
    skills: ["Python", "IoT", "Raspberry Pi", "Signal Processing"],
    location: "Kollam, Kerala",
    aiScores: { communication: 8.0, technical: 7.6, confidence: 7.9, overall: 7.8 },
    matchScore: 80,
    experience: "1 Internship",
    projects: 4,
    avatar: "MS",
    strengths: ["IoT development", "Signal processing", "Prototyping"],
    summary: "ECE student with strong IoT project portfolio. Passionate about building connected devices and sensor-based systems.",
    collegePlacement: true,
  },
];

export const colleges = [
  "All Colleges",
  "NIT Calicut",
  "TKM College of Engineering",
  "College of Engineering Trivandrum",
  "GEC Thrissur",
  "MES College of Engineering",
];

export const branches = [
  "All Departments",
  "Computer Science",
  "Mechanical Engineering",
  "Electronics & Communication",
  "Electrical Engineering",
  "Civil Engineering",
];

export const skillsList = [
  "React", "Python", "Java", "TypeScript", "Node.js", "SolidWorks",
  "AutoCAD", "MATLAB", "Docker", "AWS", "ML", "TensorFlow",
  "Spring Boot", "Go", "IoT", "Embedded C", "VHDL",
];
