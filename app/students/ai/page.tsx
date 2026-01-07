"use client";

export const dynamic = "force-dynamic";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const CLUBS = {
  cybersecurity: {
    name: "Cybersecurity Club",
    projects: [
      "Password Strength Checker – A Python tool that checks password strength.",
      "Phishing URL Detector – Classify URLs as safe or phishing.",
      "Basic Network Packet Sniffer – Analyze traffic using scapy.",
      "Secure File Encryptor – Encrypt/decrypt files using AES.",
      "Login Attempt Tracker – Track failed logins for security awareness.",
    ],
  },
  "web development": {
    name: "Web Development Club",
    projects: [
      "Personal Portfolio Website – Showcase your resume and projects.",
      "College Club Website – Build your own club site.",
      "Task Tracker App – A simple to-do web app.",
      "Feedback Form App – Store feedback in Firebase.",
      "Weather Forecast App – Fetch live weather data.",
    ],
  },
  ai: {
    name: "AI / Machine Learning Club",
    projects: [
      "Fake News Detector – Use sklearn for text classification.",
      "Spam Email Classifier – Train a spam detector.",
      "Handwritten Digit Recognition (MNIST) – Build a CNN.",
      "Movie Recommendation System – Based on cosine similarity.",
      "AI Chatbot (Mini) – Rule-based chatbot using nltk.",
    ],
  },
  blender: {
    name: "Blender (3D Design & Animation) Club",
    projects: [
      "Basic 3D Logo Design",
      "Simple 3D Chair/Table Modeling",
      "Create a Low-Poly Character",
      "Model a Room or Simple House",
      "Basic Lighting & Rendering",
    ],
  },
  cad: {
    name: "CAD & CAM Club",
    projects: [
      "2D Mechanical Part Drawing",
      "3D Modeling of a Simple Bracket",
      "Engineering Drawing to 3D Conversion",
      "CAD Assembly of Mechanical Parts",
      "Design a Small Machine Component",
    ],
  },
  mathematics: {
    name: "Mathematics Club",
    projects: [
      "Visualizing Set Theory using Venn Diagrams",
      "Prime Number Generator in Python",
      "Matrix Operations (Addition, Multiplication)",
      "Plot Linear & Quadratic Functions",
      "Probability Simulator (Dice, Coin Toss)",
    ],
  },
  python: {
    name: "Python Programming Club",
    projects: [
      "Calculator App",
      "Quiz Game",
      "File Organizer",
      "Expense Tracker",
      "Password Generator",
    ],
  },
  dsa: {
    name: "DSA Club",
    projects: [
      "Linked List Visualizer",
      "Stack and Queue Implementation",
      "Sorting Algorithm Visual Demo",
      "Searching Algorithm App",
      "Simple Calculator using Stack",
    ],
  },
  sql: {
    name: "SQL Club",
    projects: [
      "Student Database Management",
      "Library Management System",
      "Inventory Tracker",
      "College Attendance System",
      "Employee Salary Manager",
    ],
  },
  "power bi": {
    name: "Power BI Club",
    projects: [
      "Sales Dashboard (Excel Dataset)",
      "Student Performance Analysis",
      "College Placement Insights Dashboard",
      "Social Media Analytics (CSV data)",
      "Financial Budget Tracker",
    ],
  },
};

// === System Prompt for Gemini ===
const SYSTEM_PROMPT = `You are FOOMO-AI, an intelligent academic and placement assistant for college students. Your role is to help students with:

1. **Learning Guidance**: Recommend courses, tutorials, and resources for various skills
2. **Project Ideas**: Suggest beginner to advanced projects based on their interests
3. **Club Recommendations**: Direct students to relevant FOOMO clubs based on their learning goals
4. **Career Advice**: Provide placement preparation tips and skill development roadmaps

**Available FOOMO Clubs:**
${Object.entries(CLUBS)
  .map(([, club]) => `- ${club.name}: ${club.projects.slice(0, 3).join(", ")}`)
  .join("\n")}

**Response Guidelines:**
- Be encouraging and motivational
- Use emojis appropriately (🎓, 💪, 🚀, 💡, etc.)
- Format responses with markdown for better readability
- When a student wants to learn something, suggest:
  1. Relevant FOOMO club to join
  2. Learning resources (YouTube, courses)
  3. 2-3 beginner project ideas
  4. Next steps for skill development
- Keep responses concise but informative
- Always relate advice back to career/placement goals

Remember: You&apos;re a helpful mentor focused on practical skill building and career success.`;

// === Call Gemini API (with model fallback + retry) ===
const callGeminiAPI = async (
  userMessage: string,
  conversationHistory: Message[],
  apiKey: string
): Promise<string> => {
  // Try a set of compatible models from newest to older
  const MODELS = [
    "gemini-2.5-flash-preview-09-2025",
    "gemini-2.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest",
    "gemini-pro",
  ];

  // Build conversation history in Gemini API format
  const contents = conversationHistory.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  // Add the new user message
  contents.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  // System instruction separate from contents
  const systemInstruction = {
    parts: [{ text: SYSTEM_PROMPT }],
  };

  // Exponential backoff helper
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  let lastError: Error | null = null;
  for (const modelName of MODELS) {
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    // Up to 3 retries for 429/5xx per model
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(GEMINI_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents,
            systemInstruction,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorData: Record<string, unknown> & {
            error?: { message?: string };
            message?: string;
          };
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText };
          }

          console.error("Gemini API Error Response:", {
            model: modelName,
            attempt,
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });

          // Retryable errors
          if (response.status === 429 || response.status >= 500) {
            if (attempt < 3) {
              await sleep(500 * Math.pow(2, attempt - 1));
              continue; // retry same model
            }
          }

          // Fallback to next model on 404 or model-specific 400s
          if (
            response.status === 404 ||
            (response.status === 400 &&
              (errorData?.error?.message || "")
                .toString()
                .toLowerCase()
                .includes("model"))
          ) {
            lastError = new Error(
              `Model ${modelName} not available: ${
                errorData?.error?.message || response.statusText
              }`
            );
            break; // try next model
          }

          // Auth or other non-retryable errors – stop early
          if (response.status === 403) {
            throw new Error(
              "API key authentication failed. Please verify your Gemini API key is correct and has proper permissions."
            );
          }
          if (response.status === 400) {
            throw new Error(
              `Invalid API request. ${
                errorData?.error?.message ||
                "Please check your API key and request format."
              }`
            );
          }

          // Generic error
          throw new Error(
            `API Error (${response.status}): ${
              errorData?.error?.message || response.statusText
            }`
          );
        }

        const data = await response.json();

        const aiResponse =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "I apologize, but I couldn't generate a response. Please try again.";

        return aiResponse;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        // On network errors, retry with backoff then try next model
        if (attempt < 3) {
          await sleep(500 * Math.pow(2, attempt - 1));
          continue;
        }
      }
    }

    // proceed to next model if inner loop didn't return
  }

  console.error("All model attempts failed.");
  throw (
    lastError || new Error("Gemini API request failed after multiple attempts.")
  );
};

// === Fallback AI Response (when API key is not set) ===
const getAIResponse = (userMessage: string): string => {
  const msg = userMessage.toLowerCase().trim();

  // Detect "I want to learn [skill]" pattern
  const learnMatch = msg.match(/i want to learn (.+)/i);
  if (learnMatch) {
    const skill = learnMatch[1].toLowerCase();
    const foundClubKey = Object.keys(CLUBS).find((club) =>
      skill.includes(club)
    );

    if (foundClubKey) {
      const club = CLUBS[foundClubKey as keyof typeof CLUBS];
      const beginnerProjects = club.projects.slice(0, 3);

      return `🎓 **Welcome to FOOMO!**
That’s awesome — learning *${skill}* is a great step toward your career goals. 💪

💬 **Club Recommendation:**
Join the **${
        club.name
      }** on FOOMO to collaborate with peers, attend workshops, and showcase your projects.

🎥 **Suggested Learning Resources:**
- YouTube: *"${skill} for Beginners"* playlist
- FreeCodeCamp / Coursera courses
- Official documentation and practice tutorials

🧩 **Try These Beginner Projects:**
${beginnerProjects.map((p, i) => `${i + 1}. ${p}`).join("\n")}

🚀 **Next Steps:**
- Explore intermediate topics and advanced toolkits
- Earn certifications (e.g., Google, Coursera)
- Participate in hackathons or mini internships via FOOMO!

Would you like to learn any other skill?`;
    }

    // Skill not found in our club list
    return `That’s a great choice! Unfortunately, FOOMO doesn’t have a dedicated club for *${skill}* yet.
But don’t worry — you can still start learning from YouTube and online platforms, and share your progress with other learners on FOOMO! 💡`;
  }

  // Greetings
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Hello there! 👋 I'm **FOOMO-AI**, your academic and placement assistant. You can ask me things like:\n\n• *I want to learn AI*\n• *Suggest projects in Web Development*\n• *What skills should I learn for placements?*";
  }

  // Projects or skills
  if (msg.includes("project")) {
    return "FOOMO can help you with real project ideas across domains — AI, Web Dev, Cybersecurity, Python, and more! Try saying:\n\n👉 *I want to learn Web Development* or *I want to learn Python*";
  }

  if (msg.includes("skill")) {
    return "Here are some in-demand skills to learn: React, Python, SQL, Power BI, AI/ML, and Cybersecurity.\nTry saying: *I want to learn [Skill Name]* to get personalized guidance.";
  }

  // Default fallback
  return "I'm FOOMO-AI 🤖 — I can guide you with projects, clubs, and skills for placements. Try asking:\n\n• *I want to learn AI*\n• *Suggest Web Development projects*\n• *What clubs are available on FOOMO?*";
};

export default function AIAssistantPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "👋 Welcome to FOOMO! I'm FOOMO-AI — your academic and placement assistant. Ask me anything like:\n\n• I want to learn AI\n• Give me project ideas\n• What skills should I learn for placements?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load API key from environment variable or localStorage on mount
  useEffect(() => {
    // First, try to get from environment variable
    const envApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (envApiKey) {
      setApiKey(envApiKey);
    } else {
      // Fall back to localStorage
      const savedApiKey = localStorage.getItem("gemini_api_key");
      if (savedApiKey) {
        setApiKey(savedApiKey);
      } else {
        console.log(
          "⚠️ No Gemini API key found. Please add one in settings or .env.local"
        );
      }
    }
  }, []);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [testingApiKey, setTestingApiKey] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleTestApiKey = async () => {
    if (!tempApiKey.trim()) {
      setTestResult({
        success: false,
        message: "Please enter an API key first",
      });
      return;
    }

    setTestingApiKey(true);
    setTestResult(null);

    try {
      const testResponse = await callGeminiAPI(
        "Hello, this is a test message. Please respond with 'Test successful!'",
        [],
        tempApiKey.trim()
      );
      console.log("Test response:", testResponse);

      setTestResult({
        success: true,
        message: "✓ API key is valid and working!",
      });
    } catch (error) {
      const errorText =
        error instanceof Error ? error.message : "Unknown error";
      setTestResult({
        success: false,
        message: `✗ API key test failed: ${errorText}`,
      });
    } finally {
      setTestingApiKey(false);
    }
  };

  const handleSaveApiKey = () => {
    if (tempApiKey.trim()) {
      localStorage.setItem("gemini_api_key", tempApiKey.trim());
      setApiKey(tempApiKey.trim());
      setShowApiKeyModal(false);
      setTempApiKey("");
      setTestResult(null);
    }
  };

  const handleRemoveApiKey = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKey("");
    setShowApiKeyModal(false);
    setTestResult(null);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      let responseContent: string;

      // Use Gemini API if key is available, otherwise use fallback
      if (apiKey) {
        responseContent = await callGeminiAPI(
          userMessage.content,
          messages,
          apiKey
        );
      } else {
        // Fallback to rule-based responses
        await new Promise((resolve) => setTimeout(resolve, 1000));
        responseContent = getAIResponse(userMessage.content);
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorText =
        error instanceof Error ? error.message : "Unknown error occurred";

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `❌ **Error:** ${errorText}\n\n**Troubleshooting:**\n• Check your API key is correct\n• Verify the API key has Generative AI permissions\n• Make sure you're using a valid Google AI Studio API key\n• Check your internet connection\n\nClick the ⚙️ settings icon to update your API key.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    "I want to learn AI",
    "I want to learn Web Development",
    "I want to learn Python",
    "What skills should I learn?",
  ];

  return (
    <main className="w-full h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      <div className="max-w-5xl w-full mx-auto flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">FOOMO-AI</h1>
              <p className="text-xs text-gray-600">
                {"Your Placement Mentor (Basic Mode)"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setTempApiKey(apiKey);
              setShowApiKeyModal(true);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Configure Gemini API Key"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </header>

        {/* Chat Section */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  msg.role === "user"
                    ? "bg-blue-600"
                    : "bg-gradient-to-br from-teal-400 to-teal-600"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>

              <div className="flex flex-col flex-1 max-w-2xl">
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-white border border-gray-200 text-gray-900 rounded-tl-sm"
                  }`}
                >
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-1 px-2">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-600 mb-3">Try these:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(p)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-teal-500 hover:text-teal-700 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Box */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white">
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask FOOMO-AI anything..."
              rows={1}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-teal-500 resize-none text-sm"
              style={{ maxHeight: "120px" }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping}
              className="px-5 py-3 bg-teal-600 text-white rounded-2xl hover:bg-teal-700 disabled:bg-gray-300 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* API Key Modal */}
        {showApiKeyModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Gemini API Configuration
                </h2>
                <button
                  onClick={() => {
                    setShowApiKeyModal(false);
                    setTempApiKey("");
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl text-gray-600">×</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Your API key is stored locally in your browser and never
                    sent to our servers.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <p className="font-semibold text-blue-900 mb-2">
                    How to get your API key:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800">
                    <li>
                      Visit{" "}
                      <a
                        href="https://makersuite.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-600"
                      >
                        Google AI Studio
                      </a>
                    </li>
                    <li>Sign in with your Google account</li>
                    <li>
                      Click &quot;Get API Key&quot; or &quot;Create API
                      Key&quot;
                    </li>
                    <li>Copy the key and paste it above</li>
                  </ol>
                </div>

                {/* Test Result Display */}
                {testResult && (
                  <div
                    className={`rounded-lg p-3 text-sm border ${
                      testResult.success
                        ? "bg-green-50 border-green-200 text-green-900"
                        : "bg-red-50 border-red-200 text-red-900"
                    }`}
                  >
                    <p className="font-medium">{testResult.message}</p>
                  </div>
                )}

                {apiKey && !testResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                    <p className="text-green-900 font-medium">
                      ✓ API Key is currently configured
                    </p>
                  </div>
                )}

                {/* Test API Key Button */}
                <button
                  onClick={handleTestApiKey}
                  disabled={!tempApiKey.trim() || testingApiKey}
                  className="w-full px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {testingApiKey ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                      <span>Testing...</span>
                    </>
                  ) : (
                    "Test API Key"
                  )}
                </button>

                <div className="flex gap-3">
                  {apiKey && (
                    <button
                      onClick={handleRemoveApiKey}
                      className="flex-1 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors border border-red-200"
                    >
                      Remove Key
                    </button>
                  )}
                  <button
                    onClick={handleSaveApiKey}
                    disabled={!tempApiKey.trim()}
                    className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Key
                  </button>
                </div>

                <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-900">
                  <p className="font-semibold mb-1">⚠️ Note:</p>
                  <p>
                    Without an API key, FOOMO-AI will use basic rule-based
                    responses. For intelligent, context-aware conversations,
                    please add your Gemini API key.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
