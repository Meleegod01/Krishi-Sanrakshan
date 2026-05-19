import React, { useState, useEffect, useRef } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function CropicPreview() {
  const [page, setPage] = useState("home");
  const [lang, setLang] = useState("en");
  const [uploads, setUploads] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroInterval = useRef(null);
  const fileInputRef = useRef(null);

  // Auth State
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [status, setStatus] = useState(null);

  // Fake satellite & weather data
  const [weather] = useState({
    location: "Pune, IN",
    tempC: 29,
    condition: "Sunny",
    humidity: 45,
    windKph: 10,
  });

  const [satelliteData] = useState([
    {
      id: "tile-2025-10-01",
      date: "2025-10-01",
      lat: 18.5204,
      lon: 73.8567,
      ndvi: 0.62,
      cloud: 5,
      thumbnail: "https://api.maptiler.com/maps/satellite/512/0/0/0.jpg?key=demo",
      notes: "Good vegetation; low stress",
    }
  ]);

  const heroImages = [
    "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1600&q=60&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=60&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&q=60&auto=format&fit=crop",
  ];

  const schemeCards = [
    {
      id: 2,
      title: { en: "Pradhan Mantri Fasal Bima Yojana", hi: "प्रधान मंत्री फसल बीमा योजना" },
      img: "https://images.unsplash.com/photo-1509460913899-2f8b0b8a8a8a?w=800&q=60&auto=format&fit=crop",
      desc: { en: "Crop insurance covering drought, flood & pests.", hi: "सूखा, बाढ़ और कीट से सुरक्षा प्रदान करने वाला फसल बीमा।" },
    }
  ];

  useEffect(() => {
    heroInterval.current = setInterval(() => setHeroIndex((i) => (i + 1) % heroImages.length), 3500);
    return () => clearInterval(heroInterval.current);
  }, []);

  // Auth Logic
  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
      } else if (authMode === "register") {
        setAuthMode("login");
        alert("Registration successful! Please login.");
      } else {
        alert(data.error || "Auth failed");
      }
    } catch (err) {
      alert("API Error");
    }
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
  };

  // Upload Logic
  async function handleUploadToModel() {
    if (!token) return alert("Please login first");
    if (uploads.length === 0) return alert("Select an image first");

    setIsUploading(true);
    const formData = new FormData();
    formData.append("cropImage", uploads[0].file);
    formData.append("latitude", "18.5204");
    formData.append("longitude", "73.8567");
    formData.append("growth_stage", "vegetative");

    try {
      const res = await fetch(`${API_BASE_URL}/ingest`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.submissionId) {
        setSubmissionId(data.submissionId);
        pollStatus(data.submissionId);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      alert("Upload error");
    } finally {
      setIsUploading(false);
    }
  }

  async function pollStatus(id) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/status/${id}`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const data = await res.json();
        setStatus(data);
        if (data.status === "COMPLETED" || data.status === "FAILED" || data.status === "FUSED") {
          clearInterval(interval);
        }
      } catch (err) {
        clearInterval(interval);
      }
    }, 2000);
  }

  function handleFiles(files) {
    const arr = Array.from(files).map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
      file: f,
    }));
    setUploads(arr); // Single file for simplicity now
  }

  function clearUploads() {
    uploads.forEach((u) => URL.revokeObjectURL(u.url));
    setUploads([]);
    setStatus(null);
    setSubmissionId(null);
  }

  function t(obj) {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return lang === "hi" ? obj.hi || obj.en : obj.en;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white text-gray-800 flex flex-col">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-600 text-white w-10 h-10 flex items-center justify-center font-bold">C</div>
            <div className="font-semibold">CROPIC</div>
          </div>

          <nav className="flex items-center gap-3">
            <button onClick={() => setPage("home")} className={`px-3 py-2 rounded ${page === "home" ? "bg-green-50" : "hover:bg-gray-100"}`}>Home</button>
            <div className="flex items-center gap-2 border-l pl-3">
              {token ? (
                <button onClick={logout} className="px-3 py-1 rounded bg-red-50 text-red-600 text-sm">Logout</button>
              ) : (
                <button onClick={() => setPage("auth")} className="px-3 py-1 rounded bg-green-600 text-white text-sm">Login</button>
              )}
              <button onClick={() => setLang((l) => (l === "en" ? "hi" : "en"))} className="px-2 py-1 rounded bg-gray-100">
                {lang === "en" ? "HI" : "EN"}
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 flex-1 w-full">
        {page === "auth" && !token && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
            <h2 className="text-2xl font-bold mb-6">{authMode === "login" ? "Login" : "Register"}</h2>
            <form onSubmit={handleAuth} className="space-y-4">
              <input type="text" placeholder="Username" className="w-full p-3 border rounded" value={username} onChange={e => setUsername(e.target.value)} required />
              <input type="password" placeholder="Password" className="w-full p-3 border rounded" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="submit" className="w-full p-3 bg-green-600 text-white rounded-lg font-semibold">
                {authMode === "login" ? "Login" : "Register"}
              </button>
            </form>
            <p className="mt-4 text-center text-sm">
              {authMode === "login" ? "New here?" : "Already have an account?"}{" "}
              <button onClick={() => setAuthMode(authMode === "login" ? "register" : "login")} className="text-green-600 font-semibold underline">
                {authMode === "login" ? "Register" : "Login"}
              </button>
            </p>
          </div>
        )}

        {(page === "home" || token) && (
          <section>
            <div className="relative rounded-2xl overflow-hidden shadow-lg h-48 md:h-64 mb-8">
              <img src={heroImages[heroIndex]} alt="hero" className="w-full h-full object-cover brightness-90" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="text-white text-center">
                  <h1 className="text-3xl font-bold">{lang === "hi" ? "कृषि मॉड्यूल" : "CROPIC — Farm Dashboard"}</h1>
                  <p className="mt-2">{lang === "hi" ? "अपनी फसल की स्थिति जानें" : "Know your crop status instantly"}</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-xl font-bold mb-4">{lang === "hi" ? "छवि अपलोड करें" : "Upload Crop Image"}</h3>
                <div className="border-2 border-dashed border-green-200 rounded-xl p-8 text-center bg-green-50/30">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleFiles(e.target.files)} className="hidden" />
                  {uploads.length > 0 ? (
                    <div className="space-y-4">
                      <img src={uploads[0].url} alt="preview" className="w-full h-48 object-cover rounded-lg mx-auto border" />
                      <div className="flex justify-center gap-3">
                        <button onClick={clearUploads} className="px-4 py-2 bg-gray-200 rounded-lg">Clear</button>
                        <button onClick={handleUploadToModel} disabled={isUploading} className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:bg-green-300">
                          {isUploading ? "Uploading..." : "Analyze Image"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => fileInputRef.current.click()} className="flex flex-col items-center gap-2 mx-auto">
                      <div className="p-4 bg-white rounded-full shadow-sm text-green-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <span className="font-semibold">Tap to select photo</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-xl font-bold mb-4">AI Analysis Status</h3>
                {!status && !isUploading && (
                  <div className="text-center py-12 text-gray-500">
                    Submit an image to see the AI brain in action.
                  </div>
                )}
                {isUploading && (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-green-600 font-medium">Sending to server...</p>
                  </div>
                )}
                {status && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="font-semibold">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        status.status === 'COMPLETED' || status.status === 'FUSED' ? 'bg-green-100 text-green-700' :
                        status.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {status.status}
                      </span>
                    </div>
                    
                    {status.analysis && (
                      <div className="p-4 border rounded-lg bg-green-50/50">
                        <h4 className="font-bold text-green-800 mb-2">Results:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-gray-500">Crop:</span> {status.analysis.crop}</div>
                          <div><span className="text-gray-500">Confidence:</span> {(status.analysis.confidence * 100).toFixed(1)}%</div>
                          <div className="col-span-2"><span className="text-gray-500">Issue:</span> {status.analysis.disease}</div>
                        </div>
                      </div>
                    )}
                    
                    {status.status === 'RECEIVED' && (
                      <div className="text-center py-6 text-sm text-blue-600 animate-pulse">
                        Analyzing frames... please wait.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-green-800 text-white p-6 mt-10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm">© 2025 Krishi Sanrakshan - Digital India Initiative</p>
        </div>
      </footer>
    </div>
  );
}

