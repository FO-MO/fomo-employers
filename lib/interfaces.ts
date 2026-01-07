export interface AuthResponse {
  jwt?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    documentId?: string;
  };
  error?: {
    message: string;
    status: number;
  };
}

export interface EmployerProfileInfo {
  documentId?: string;
  id?: number;
  employerId: string;
  name: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  description?: string;
  website?: string;
  industry?: string;
  location?: string;
  noOfEmployers?: number;
  specialties?: string;
  profilePic?: {
    id: number;
    url: string;
    name: string;
  };
  backgroundImg?: {
    id: number;
    url: string;
    name: string;
  };
}

export interface UserProfileInfo {
  documentId?: string;
  id?: number;
  studentId?: string;
  name?: string;
  email?: string;
  about?: string;
  college?: string;
  course?: string;
  graduationYear?: string;
  location?: string;
  skills?: string[];
  interests?: string[];
}

export interface UserMeResponse {
  id: number;
  username: string;
  email: string;
  documentId?: string;
  blocked?: boolean;
  confirmed?: boolean;
  employer_profile?: EmployerProfileInfo;
  profile?: UserProfileInfo;
}

export interface MediaFile {
  id: number;
  url: string;
  name: string;
}

export interface Project {
  title: string;
  description: string;
  status?: string;
  tags?: string[];
}

export interface Club {
  name: string;
  title: string;
  description: string;
  tags?: string[];
  badge?: string | null;
  id: string | number;
  leader?: {
    name: string;
    avatarUrl?: string | null;
  };
  membersCount?: number;
  joined?: boolean;
  imageUrl?: string | null;
  videos?: string[];
}

export interface Internship {
  company?: string;
  role: string;
  timeline?: string;
  location?: string;
  duration?: string;
  status?: string;
}

export interface StudentProfile {
  documentId?: string;
  email: string;
  id?: number;
  initials: string;
  name: string;
  studentId: string;
  about?: string;
  college?: string;
  course?: string;
  graduationYear: string;
  location: string;
  skills: string[];
  interests: string[];
  followers: number;
  following: number;
  institution: string;
  major: string;
  bio: string;
  backgroundImageUrl: string | null;
  profileImageUrl: string | null;
  profilePic?: MediaFile;
  backgroundImg?: MediaFile;
  verification?: number; // 0 = pending, 1 = verified, -1 = rejected
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
  projects: {
    title: string;
    description: string;
    status: string;
    tags?: string[];
  }[];
  clubs: {
    name: string;
    description: string;
    tags: string[];
    badge: string | null;
  }[];
  internships: Internship[];
}

export interface CreateProfileData {
  studentId: string;
  name: string;
  email?: string;
  about?: string;
  college?: string;
  course?: string;
  graduationYear?: string;
  location?: string;
  skills?: string[];
  interests?: string[];
  profilePic?: number; // Media ID
  backgroundImage?: number; // Media ID
  verification?: number;
}

export interface GlobalJob {
  id: string;
  title: string;
  jobType: string;
  experience: string;
  location: string;
  deadline: string;
  description: string;
  skills: string[];
  requirements: string[];
  benefits: string[];
  status: string;
  companyName?: string;
  companyLogo?: string;
  createdAt?: string;
}

export type PostAuthor = {
  name: string;
  initials: string;
  avatarUrl?: string | null;
  title?: string;
};

export type PostStats = {
  likes: number;
  comments: number;
  shares?: number;
};

export type Post = {
  id: string;
  author: PostAuthor;
  postedAgo: string;
  message: string;
  images?: string[];
  stats: PostStats;
  isLiked?: boolean;
  likedBy?: string[];
};

export type Props = {
  post: Post;
  user: string; // The currently logged-in user's identifier (email/username/ID)
};

export type CommentData = {
  id: number;
  content: string;
  sentAt: string; // Formatted date string
  user: {
    name: string;
    initials: string;
    avatarUrl?: string;
  };
};
