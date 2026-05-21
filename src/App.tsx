import React, { useState, useEffect } from "react";
import {
  Phone,
  Mail,
  Globe,
  FileText,
  ChevronRight,
  Circle,
  X,
  Briefcase,
} from "lucide-react";

// ================= SETUP UTAMA CMS (GOOGLE SHEETS) =================
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQICbPXY_umkEzZLtKw_md7mPQTomVvYBTaC8qnTbVwfBXh8JW12Kz2T2i4PXOiTr5bOD-akUvqK0br/pub?gid=0&single=true&output=csv";

// Foto Project Cadangan jika data di kolom Google Sheets kosong
const DEFAULT_PROJECTS = [
  {
    title: "Jakarta Int. Stadium",
    tag: "Sport",
    desc: "Stadion beratap buka-tutup terbesar di Asia Tenggara dengan standar Green Building Gold.",
    img: "https://images.unsplash.com/photo-1577223625856-4545d45c5313?q=80&w=400",
  },
  {
    title: "Taman Ismail Marzuki",
    tag: "Art Center",
    desc: "Revitalisasi pusat kesenian kebudayaan Jakarta modern berkonsep parametrik.",
    img: "https://images.unsplash.com/photo-1596422846543-75c6fc1f7f43?q=80&w=400",
  },
  {
    title: "Stasiun LRT Jakarta",
    tag: "Transit",
    desc: "Infrastruktur transportasi masal penunjang mobilitas urban ramah lingkungan.",
    img: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=400",
  },
  {
    title: "Masjid Al-Jabbar",
    tag: "Religious",
    desc: "Masjid ikonik terapung di atas embung dengan struktur kubah modular tanpa pilar tengah.",
    img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=400",
  },
  {
    title: "de Braga by ARTOTEL",
    tag: "Hospitality",
    desc: "Hotel butik premium dengan langgam Art Deco modern yang hemat energi.",
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400",
  },
  {
    title: "Modular Keet IKN",
    tag: "Innovation",
    desc: "Pelopor bangunan hunian pekerja modular prefabrikasi super cepat di IKN.",
    img: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?q=80&w=400",
  },
  {
    title: "Bandara Hasanuddin",
    tag: "Airport",
    desc: "Pengembangan perluasan terminal bandara udara dengan estetika kapal Phinisi.",
    img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=400",
  },
  {
    title: "J.I. Velodrome",
    tag: "Olympic Venue",
    desc: "Arena balap sepeda internasional dengan track kayu siberia tersertifikasi UCI.",
    img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=400",
  },
  {
    title: "NasDem Tower",
    tag: "Premium Office",
    desc: "Gedung perkantoran modern tinggi bersertifikat hemat energi dengan sistem otomasi pintar.",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400",
  },
];

interface UserProfile {
  name: string;
  title: string;
  phoneRaw: string;
  phoneDisplay: string;
  email: string;
  companyPdfUrl: string;
  profileImg: string;
}

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeLightbox, setActiveLightbox] = useState<number | null>(null);

  // Deteksi User ID dari parameter URL (?user=nama)
  const urlParams = new URLSearchParams(window.location.search);
  const targetUser = urlParams.get("user") || "Hendika";

  // Fungsi helper untuk membersihkan link Google Drive agar bisa dirender langsung oleh browser
  const cleanDriveUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("drive.google.com")) {
      // Ekstrak ID File
      const regExp = /id=([^&]+)|d\/([^/]+)/;
      const matches = url.match(regExp);
      const id = matches ? matches[1] || matches[2] : null;
      if (id) {
        return `https://lh3.googleusercontent.com/d/${id}=s800`;
      }
    }
    return url;
  };

  useEffect(() => {
    const fetchCSVData = async () => {
      try {
        const response = await fetch(SHEET_CSV_URL);
        if (!response.ok) throw new Error("Gagal mengambil data sheet");
        const text = await response.text();

        // CSV Parser yang aman terhadap tanda koma di dalam tanda kutip
        const rows = text
          .split("\n")
          .map((line) =>
            line
              .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
              .map((val) => val.replace(/^"|"$/g, "").trim())
          );

        let userRow: string[] | null = null;
        for (let i = 1; i < rows.length; i++) {
          if (
            rows[i][0] &&
            rows[i][0].toLowerCase() === targetUser.toLowerCase()
          ) {
            userRow = rows[i];
            break;
          }
        }

        if (!userRow) {
          setErrorMsg("PROFILE NOT FOUND");
          setLoading(false);
          return;
        }

        // Penyesuaian INDEKS sesuai struktur file CSV terlampir Anda
        setProfile({
          name: userRow[1] || "—",
          title: userRow[2] || "—",
          phoneRaw: userRow[3] || "",
          phoneDisplay: userRow[4] || "",
          email: userRow[5] || "",
          companyPdfUrl: userRow[6] || "#", // Kolom pdf_url berada di indeks ke-6
          profileImg:
            cleanDriveUrl(userRow[7]) ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200", // Kolom profile_img di indeks ke-7
        });

        // Update foto-foto project (kolom index 8 sampai 16)
        const updatedProjects = [...DEFAULT_PROJECTS];
        for (let j = 0; j < 9; j++) {
          const sheetImg = userRow[8 + j];
          if (sheetImg && sheetImg.trim() !== "") {
            updatedProjects[j].img = cleanDriveUrl(sheetImg.trim());
          }
        }
        setProjects(updatedProjects);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setErrorMsg("ERROR LOADING DATA");
        setLoading(false);
      }
    };

    fetchCSVData();
  }, [targetUser]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#02040a] z-50 flex items-center justify-center text-sm font-bold tracking-widest text-[#2cb1e1]">
        LOADING EXECUTIVE PROFILE...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="fixed inset-0 bg-[#02040a] z-50 flex items-center justify-center text-sm font-bold tracking-widest text-red-400">
        {errorMsg}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#030712] flex items-center justify-center p-4 md:p-8 font-sans antialiased text-slate-200 overflow-x-hidden">
      {/* EFFECT AURORA BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full mix-blend-screen filter blur-[140px] opacity-45 bg-[radial-gradient(circle,rgba(44,177,225,0.6)_0%,transparent_70%)] animate-[pulse_15s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full mix-blend-screen filter blur-[140px] opacity-45 bg-[radial-gradient(circle,rgba(243,146,0,0.45)_0%,rgba(113,75,35,0.1)_40%,transparent_70%)] animate-[pulse_12s_ease-in-out_infinite]" />
      </div>

      {/* CONTAINER UTAMA */}
      <div className="relative z-10 w-full max-w-6xl bg-white/[0.02] backdrop-blur-[25px] border border-white/10 rounded-[36px] shadow-2xl shadow-black/90 overflow-hidden flex flex-col lg:flex-row transition-all duration-500">
        {/* KOLOM KIRI: LINK IN BIO / PROFIL */}
        <div className="p-8 md:p-12 lg:w-5/12 flex flex-col justify-between border-b border-white/5 lg:border-b-0 lg:border-r border-white/10">
          <div>
            {/* Brand Logo Terintegrasi Gambar Lokal Tanpa Tulisan Teks Ganda */}
            <div className="h-12 mb-10 flex items-center gap-3">
              <img
                src="/2nd-logo-wege-01.png"
                alt="WIKA Gedung Logo"
                className="h-full object-contain"
              />
            </div>

            {/* Profil Singkat */}
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 bg-[#2cb1e1]/10 border border-[#2cb1e1]/30 rounded-full text-xs font-bold uppercase tracking-widest text-[#2cb1e1] mb-3">
                  Executive Leader
                </span>
                <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
                  {profile?.name}
                </h1>
                <p className="text-slate-400 font-medium text-sm tracking-wide flex items-center gap-2">
                  <Briefcase className="text-[#f39200] w-4 h-4 shrink-0" />{" "}
                  <span>{profile?.title}</span>
                </p>
              </div>
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#2cb1e1]/40 p-0.5 bg-slate-900 shadow-lg shrink-0">
                <img
                  src={profile?.profileImg}
                  className="w-full h-full object-cover rounded-full"
                  alt={profile?.name}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200";
                  }}
                />
              </div>
            </div>

            {/* BUTTON LINK STACK */}
            <div className="space-y-3.5">
              <a
                href={`tel:${profile?.phoneRaw}`}
                className="group flex items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#2cb1e1]/40 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#2cb1e1]/10 text-[#2cb1e1] group-hover:bg-[#2cb1e1] group-hover:text-white transition-all mr-4">
                  <Phone size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider">
                    Direct Line
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {profile?.phoneDisplay}
                  </span>
                </div>
                <ChevronRight
                  size={14}
                  className="ml-auto text-slate-600 group-hover:text-[#2cb1e1] transition-colors"
                />
              </a>

              <a
                href={`mailto:${profile?.email}`}
                className="group flex items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#2cb1e1]/40 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#2cb1e1]/10 text-[#2cb1e1] group-hover:bg-[#2cb1e1] group-hover:text-white transition-all mr-4">
                  <Mail size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider">
                    Corporate Email
                  </span>
                  <span className="text-sm font-semibold text-white break-all">
                    {profile?.email}
                  </span>
                </div>
                <ChevronRight
                  size={14}
                  className="ml-auto text-slate-600 group-hover:text-[#2cb1e1] transition-colors"
                />
              </a>

              <a
                href="https://investor.wikagedung.co.id"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#2cb1e1]/40 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#2cb1e1]/10 text-[#2cb1e1] group-hover:bg-[#2cb1e1] group-hover:text-white transition-all mr-4">
                  <Globe size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider">
                    Investor Hub
                  </span>
                  <span className="text-sm font-semibold text-white">
                    investor.wikagedung.co.id
                  </span>
                </div>
                <ChevronRight
                  size={14}
                  className="ml-auto text-slate-600 group-hover:text-[#2cb1e1] transition-colors"
                />
              </a>

              <a
                href={profile?.companyPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center p-4 rounded-2xl bg-gradient-to-r from-[#f39200]/10 via-[#714b23]/20 to-[#02040a] border border-[#f39200]/30 hover:border-[#f39200]/70 transition-all duration-300 shadow-xl shadow-black/40"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#f39200]/20 text-[#f39200] group-hover:bg-[#f39200] group-hover:text-[#02040a] transition-all mr-4">
                  <FileText size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-[#f39200] font-bold uppercase tracking-wider">
                    Corporate Report
                  </span>
                  <span className="text-sm font-bold text-amber-100">
                    COMPANY UPDATE PDF
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-[#f39200] animate-ping" />
                  <ChevronRight
                    size={14}
                    className="text-[#f39200] group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </a>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-white/5 text-[11px] text-slate-600">
            &copy; 2026 PT Wijaya Karya Bangunan Gedung Tbk.
          </div>
        </div>

        {/* KOLOM KANAN: 9 SLOT 3D GRID */}
        <div className="p-8 md:p-12 lg:w-7/12 bg-black/40 flex flex-col justify-center">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Circle className="w-2 h-2 fill-[#2cb1e1] text-[#2cb1e1] drop-shadow-[0_0_4px_#2cb1e1]" />{" "}
              Landmark Portfolio
            </h3>
            <span className="text-[10px] text-slate-500 italic">
              Klik untuk detail
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 md:gap-4 aspect-square max-w-[500px] mx-auto lg:mx-0 w-full [perspective:1400px]">
            {projects.map((project, idx) => (
              <div
                key={idx}
                onClick={() => setActiveLightbox(idx)}
                className="relative group rounded-2xl overflow-hidden border border-white/5 bg-slate-950 cursor-pointer transition-all duration-500 [transform-style:preserve-3d] hover:[transform:translateY(-8px)_rotateX(6deg)_rotateY(-8deg)_translateZ(15px)] hover:shadow-[0_20px_40px_rgba(44,177,225,0.25)] hover:border-[#2cb1e1]/50"
              >
                <img
                  src={project.img}
                  alt={project.title}
                  className="w-full h-full object-cover filter brightness-[0.5] grayscale-[20%] group-hover:brightness-100 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                  onError={(e) => {
                    // Fallback jika asset bermasalah
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?q=80&w=400";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 md:p-3 flex flex-col justify-end">
                  <span className="text-[8px] font-bold text-[#2cb1e1] uppercase tracking-widest">
                    {project.tag}
                  </span>
                  <h4 className="text-[11px] font-bold text-white leading-tight mt-0.5">
                    {project.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LIGHTBOX MODAL SYSTEM */}
      {activeLightbox !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#02040a]/90 backdrop-blur-md transition-all duration-500">
          <div className="relative w-full max-w-2xl bg-white/[0.02] backdrop-blur-[25px] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row transform scale-100 transition-transform duration-500">
            <button
              onClick={() => setActiveLightbox(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white/80 hover:bg-white/10"
            >
              <X size={18} />
            </button>
            <div className="w-full md:w-1/2 aspect-video md:aspect-square bg-slate-900">
              <img
                src={projects[activeLightbox].img}
                className="w-full h-full object-cover"
                alt="Lightbox view"
              />
            </div>
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center bg-gradient-to-br from-slate-900 to-black">
              <span className="text-xs font-bold text-[#2cb1e1] uppercase tracking-widest mb-2 block">
                {projects[activeLightbox].tag}
              </span>
              <h2 className="text-2xl font-extrabold text-white mb-4 tracking-tight">
                {projects[activeLightbox].title}
              </h2>
              <div className="w-8 h-[2px] bg-[#f39200] mb-4" />
              <p className="text-sm text-slate-400 leading-relaxed">
                {projects[activeLightbox].desc}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
