/* FinCerdas ID — Single Page App (Vanilla JS) */
(() => {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const APP = $("#app");
  const toastEl = $("#toast");
  const navEl = $("#nav");
  const menuBtn = $("#btnMenu");

  const nowYear = new Date().getFullYear();
  $("#year").textContent = nowYear;

  // ---------- State ----------
  const STORAGE_KEY = "fincerdas_v1_state";
  const defaultState = {
    points: 0,
    xp: 0,
    level: 1,
    badges: [],
    completedModules: [],
    bestQuizScore: {},  // key: moduleId or 'global'
    streak: { lastVisit: null, count: 0 },
    planner: {
      income: 0,
      needs: 0,
      wants: 0,
      savings: 0,
      goals: []
    },
    securityChecklist: {
      otpNeverShare: false,
      mfaOn: false,
      passwordManager: false,
      updateDevice: false,
      checkUrl: false,
      reportScam: false
    },
    fraudSimBest: 0
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(defaultState);
      const parsed = JSON.parse(raw);
      return { ...structuredClone(defaultState), ...parsed };
    } catch (e) {
      return structuredClone(defaultState);
    }
  }
  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderHUD();
  }
  let state = loadState();

  // ---------- Utilities ----------
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

  function addPoints(n, why="") {
    state.points += n;
    state.xp += Math.max(0, Math.floor(n * 0.8));
    levelUpIfNeeded();
    saveState();
    toast((why ? `${why} — ` : "") + `+${n} poin`);
  }

  function levelUpIfNeeded() {
    // Simple: need 200xp per level
    const need = (lvl) => 200 + (lvl - 1) * 80;
    while (state.xp >= need(state.level)) {
      state.xp -= need(state.level);
      state.level += 1;
      toast(`Naik level! Sekarang Lv ${state.level}`);
    }
  }

  function hasBadge(id) { return state.badges.includes(id); }
  function grantBadge(id, label) {
    if (!hasBadge(id)) {
      state.badges.push(id);
      addPoints(50, `Badge: ${label}`);
    }
  }

  function fmt(n) {
    const x = Number(n || 0);
    return x.toLocaleString("id-ID");
  }
  function fmtRp(n) {
    const x = Number(n || 0);
    return "Rp " + x.toLocaleString("id-ID");
  }

  function todayKey(d = new Date()){
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,"0");
    const day = String(d.getDate()).padStart(2,"0");
    return `${y}-${m}-${day}`;
  }

  function updateStreak() {
    const t = todayKey();
    const last = state.streak.lastVisit;
    if (!last) {
      state.streak.lastVisit = t;
      state.streak.count = 1;
      return;
    }
    if (last === t) return;

    const d1 = new Date(last + "T00:00:00");
    const d2 = new Date(t + "T00:00:00");
    const diff = Math.round((d2 - d1) / (1000*60*60*24));
    if (diff === 1) state.streak.count += 1;
    else state.streak.count = 1;

    state.streak.lastVisit = t;
  }
  updateStreak();
  saveState();

  function renderHUD() {
    $("#hudLevel").textContent = `Lv ${state.level}`;
    $("#hudPoints").textContent = fmt(state.points);
  }
  renderHUD();

  // ---------- Content Data ----------

  // Predeclare infographic generators (defined later)
  function infographicFintechBasics(){ return ""; }
  function infographicFintechTypes(){ return ""; }
  function infographicSecurity(){ return ""; }
  function infographicRegulation(){ return ""; }

  const modules = [
    {
      id: "m1",
      title: "Apa itu Fintech",
      desc: "Definisi fintech, manfaat, risiko, dan contoh penggunaan sehari-hari.",
      article: [
        "Fintech (financial technology) adalah pemanfaatan teknologi untuk membuat layanan keuangan menjadi lebih cepat, mudah, dan terjangkau.",
        "Contoh sederhana: dompet digital untuk bayar QR, mobile banking, aplikasi pencatat anggaran, hingga proses e-KYC (verifikasi identitas) secara online.",
        "Manfaat utama: efisiensi transaksi, akses layanan, pengalaman pengguna yang lebih baik. Namun, risikonya juga ada: penipuan (scam), kebocoran data, dan keputusan finansial impulsif.",
        "Kunci literasi fintech: pahami produk, biaya/risiko, keamanan digital, serta hak sebagai konsumen."
      ],
      videos: [
        { title: "Digital Financial Literacy (OJK)", youtubeId: "Is3BfJN3bp0" },
        { title: "Literasi Keuangan Digital (BI)", youtubeId: "BweNpSHPW_g" }
      ],
      infographicSvg: infographicFintechBasics(),
      quiz: [
        q("Fintech adalah…", [
          a("Pemanfaatan teknologi untuk layanan keuangan yang lebih efektif", true),
          a("Hanya aplikasi investasi saham", false),
          a("Hanya layanan pinjaman online", false),
          a("Semua aplikasi yang memakai internet", false),
        ], "Fintech mencakup beragam layanan keuangan berbasis teknologi."),
        q("Contoh fintech yang paling dekat di keseharian adalah…", [
          a("Dompet digital / pembayaran QR", true),
          a("Game online", false),
          a("Aplikasi edit foto", false),
          a("Pemutar musik", false),
        ], "Pembayaran digital termasuk kategori fintech pembayaran."),
        q("Pernyataan yang paling tepat:", [
          a("Fintech selalu aman tanpa risiko", false),
          a("Fintech bisa bermanfaat, tetapi tetap ada risiko yang perlu dipahami", true),
          a("Jika banyak promosi berarti pasti tepercaya", false),
          a("Semua fintech ilegal", false),
        ], "Selalu cek legalitas, biaya, risiko, dan keamanan.")
      ]
    },
    {
      id: "m2",
      title: "Jenis-jenis Fintech & Contohnya",
      desc: "Peta jenis fintech: pembayaran, lending, investasi, insurtech, regtech, dll.",
      article: [
        "Fintech hadir dalam berbagai jenis sesuai kebutuhan pengguna.",
        "1) Pembayaran: dompet digital, QR, payment gateway.",
        "2) Lending/pembiayaan: P2P lending (pertemukan pendana & peminjam), paylater (kredit konsumtif).",
        "3) Wealth/investment: aplikasi perencanaan dan investasi (tetap pahami risiko).",
        "4) Insurtech: teknologi untuk asuransi (pembelian polis, klaim, dsb.).",
        "5) Regtech: teknologi untuk membantu kepatuhan regulasi dan pelaporan.",
        "Saat memilih layanan, fokus pada: kebutuhan, biaya, risiko, reputasi, dan izin/terdaftar pada otoritas."
      ],
      videos: [
        { title: "Bank Indonesia 101: Uang Elektronik (BI)", youtubeId: "aLVZEmvxfk8" }
      ],
      infographicSvg: infographicFintechTypes(),
      quiz: [
        q("Kategori fintech yang fokus pada transaksi/QR adalah…", [
          a("Pembayaran", true),
          a("Insurtech", false),
          a("Regtech", false),
          a("Wealth", false),
        ], "Pembayaran mencakup QR, e-wallet, payment gateway."),
        q("P2P lending umumnya adalah…", [
          a("Platform yang mempertemukan pendana dan peminjam", true),
          a("Aplikasi edit dokumen", false),
          a("Aplikasi belanja online", false),
          a("Aplikasi peta", false),
        ], "P2P lending menghubungkan pendana dan peminjam sesuai aturan yang berlaku."),
        q("Yang termasuk prinsip memilih layanan fintech dengan bijak:", [
          a("Cek biaya/risiko dan reputasi", true),
          a("Ambil yang memberikan bonus terbesar tanpa membaca syarat", false),
          a("Bagikan OTP agar cepat diproses", false),
          a("Percaya pesan DM tanpa verifikasi", false),
        ], "Selalu baca syarat, cek biaya, dan jaga keamanan.")
      ]
    },
    {
      id: "m3",
      title: "Keamanan Digital & Privasi",
      desc: "OTP, phishing, social engineering, perlindungan data, dan kebiasaan aman.",
      article: [
        "Keamanan digital adalah fondasi literasi fintech. Serangan sering terjadi bukan karena teknologi, tetapi karena manipulasi manusia (social engineering).",
        "Aturan emas: Jangan pernah membagikan OTP, PIN, password, atau kode verifikasi ke siapa pun (termasuk yang mengaku CS).",
        "Waspada phishing: tautan palsu, domain mirip, aplikasi/APK tidak resmi, dan permintaan data mendesak.",
        "Aktifkan MFA/2FA jika tersedia, gunakan password unik, dan perbarui sistem operasi serta aplikasi secara berkala.",
        "Jika merasa akun dibajak: segera ubah sandi, logout semua perangkat, hubungi kanal resmi, dan simpan bukti."
      ],
      videos: [
        { title: "OJK: Lawan Modus Penipuan Digital", youtubeId: "ngKlL1_zB6Y" }
      ],
      infographicSvg: infographicSecurity(),
      quiz: [
        q("OTP sebaiknya…", [
          a("Tidak dibagikan kepada siapa pun", true),
          a("Dibagikan ke CS lewat chat agar cepat", false),
          a("Disimpan di notes publik", false),
          a("Dikirim ke teman untuk cadangan", false),
        ], "OTP adalah kode rahasia. Siapa pun yang punya OTP bisa mengambil alih akun."),
        q("Ciri phishing yang umum adalah…", [
          a("Tautan/domain mirip resmi dan meminta data mendesak", true),
          a("Aplikasi resmi dari store", false),
          a("Pesan verifikasi yang kamu minta sendiri", false),
          a("Email internal yang sudah diverifikasi", false),
        ], "Phishing sering memakai rasa panik/urgensi."),
        q("Langkah aman yang tepat:", [
          a("Aktifkan MFA dan gunakan password unik", true),
          a("Pakai password sama untuk semua akun", false),
          a("Klik tautan dari DM tanpa cek URL", false),
          a("Install APK dari grup chat", false),
        ], "Kebiasaan kecil bisa mencegah risiko besar.")
      ]
    },
    {
      id: "m4",
      title: "Regulasi & Perlindungan Konsumen",
      desc: "Hak konsumen, pentingnya izin/terdaftar, dan jalur pengaduan resmi.",
      article: [
        "Regulasi membantu menjaga ekosistem keuangan tetap sehat dan melindungi konsumen.",
        "Sebagai pengguna, kamu berhak mendapat informasi yang jelas (biaya, risiko, syarat) dan perlakuan yang adil.",
        "Biasakan memeriksa legalitas/izin/terdaftar pada regulator (sesuai jenis layanannya) dan gunakan kanal resmi saat butuh bantuan.",
        "Jika jadi korban penipuan transaksi keuangan, laporkan melalui kanal resmi agar dapat ditindaklanjuti dan datamu terdokumentasi."
      ],
      videos: [
        { title: "OJK: Sistem Terintegrasi Hadang Scam & Fraud", youtubeId: "1Onldsucf4U" }
      ],
      infographicSvg: infographicRegulation(),
      quiz: [
        q("Tujuan utama regulasi dalam layanan keuangan adalah…", [
          a("Melindungi konsumen dan menjaga stabilitas ekosistem", true),
          a("Agar semua layanan menjadi gratis", false),
          a("Agar semua orang bisa pinjam tanpa syarat", false),
          a("Agar penipuan tidak perlu dilaporkan", false),
        ], "Regulasi menekankan transparansi, keamanan, dan perlindungan."),
        q("Saat ada kendala/aduan, yang paling aman adalah…", [
          a("Menghubungi kanal resmi dan menyimpan bukti", true),
          a("DM akun yang mirip-mirip", false),
          a("Kirim OTP agar dibantu", false),
          a("Sebar data pribadi di komentar", false),
        ], "Gunakan kanal resmi dan jangan bagikan data rahasia."),
        q("Pernyataan benar:", [
          a("Laporan penipuan sebaiknya lewat kanal resmi agar ditindaklanjuti", true),
          a("Kalau malu, lebih baik diam saja", false),
          a("Semua yang memberi bonus besar pasti resmi", false),
          a("Website mirip resmi pasti aman", false),
        ], "Melapor itu langkah protektif, bukan memalukan.")
      ]
    }
  ];

  function q(text, answers, explain){ return { text, answers, explain }; }
  function a(text, correct){ return { text, correct }; }

  // ---------- Router ----------
  function route() {
    const hash = location.hash || "#/beranda";
    const path = hash.replace(/^#\//,"");
    const [page, param] = path.split("/");

    // nav active
    $$("#nav a").forEach(a => {
      const href = a.getAttribute("href") || "";
      a.classList.toggle("active", href === "#/" + page || (page==="modul" && href==="#/belajar"));
    });

    if (page === "beranda") return renderHome();
    if (page === "belajar") return renderLearn();
    if (page === "modul") return renderModule(param);
    if (page === "kuis") return renderQuizHub();
    if (page === "simulasi") return renderSimulations();
    if (page === "planner") return renderPlanner();
    if (page === "keamanan") return renderSecurity();
    if (page === "tentang") return renderAbout();

    renderNotFound();
  }
  window.addEventListener("hashchange", route);

  // ---------- Mobile menu ----------
  menuBtn.addEventListener("click", () => {
    const open = navEl.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  navEl.addEventListener("click", (e) => {
    if (e.target?.tagName === "A") {
      navEl.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });

  // ---------- UI Components ----------
  function card(title, bodyHtml, rightHtml="") {
    return `
      <section class="card">
        <div class="row" style="justify-content:space-between; align-items:flex-start">
          <div>
            <h2>${title}</h2>
          </div>
          ${rightHtml ? `<div class="row">${rightHtml}</div>` : ""}
        </div>
        ${bodyHtml}
      </section>`;
  }

  function badgesView() {
    const badgeList = [
      { id:"b_rookie", label:"Fintech Rookie", when:"Selesai Modul 1" },
      { id:"b_types", label:"Fintech Explorer", when:"Selesai Modul 2" },
      { id:"b_guardian", label:"Guardian Privasi", when:"Selesai Modul 3" },
      { id:"b_reg", label:"Paham Regulasi", when:"Selesai Modul 4" },
      { id:"b_anti_scam", label:"Anti-Scam Hero", when:"Skor simulator ≥ 80" }
    ];
    return `
      <div class="row">
        ${badgeList.map(b => {
          const owned = hasBadge(b.id);
          const klass = owned ? "badge badge--ok" : "badge";
          return `<span class="${klass}" title="${b.when}">${owned ? "🏅" : "🔒"} ${b.label}</span>`;
        }).join("")}
      </div>
    `;
  }

  function progressView() {
    const total = modules.length;
    const done = state.completedModules.length;
    const pct = Math.round((done/total)*100);
    return `
      <div class="kpi">
        <b>${pct}%</b>
        <span>Progress modul (${done}/${total}) • streak ${state.streak.count} hari</span>
        <div class="progress" aria-label="Progress modul"><div style="width:${pct}%"></div></div>
      </div>
    `;
  }

  // ---------- Pages ----------
  function renderHome() {
    const hero = `
      <div class="grid">
        <div class="card">
          <h1 style="margin:0 0 10px">Belajar fintech & literasi keuangan, dengan cara yang seru 🎮</h1>
          <p class="muted">
            Artikel, video, infografis, kuis gamifikasi, simulasi interaktif, dan alat perencanaan keuangan personal.
            Dirancang untuk pelajar, mahasiswa, profesional muda, UMKM, wirausaha, dan individu.
          </p>
          <div class="row" style="margin-top:12px">
            <a class="btn" href="#/belajar">Mulai belajar</a>
            <a class="btn btn--ghost" href="#/simulasi">Coba simulasi</a>
            <a class="btn btn--ghost" href="#/keamanan">Keamanan & Lapor</a>
          </div>
          <div class="hr"></div>
          <div class="infobox">
            <b>Catatan anti-misleading:</b> contoh simulasi hanya untuk edukasi. Hasil bukan rekomendasi produk/keputusan finansial.
          </div>
        </div>

        <div class="card">
          <h2>Dashboard kamu</h2>
          <div class="row">
            <div class="kpi"><b>Lv ${state.level}</b><span>Level</span></div>
            <div class="kpi"><b>${fmt(state.points)}</b><span>Poin</span></div>
          </div>
          <div class="hr"></div>
          ${progressView()}
          <div class="hr"></div>
          <h3 style="margin-top:0">Badge</h3>
          ${badgesView()}
        </div>
      </div>
    `;

    const quick = card("Misi cepat (5–7 menit)", `
      <div class="row">
        <button class="btn btn--ghost" id="mission1">✅ Checklist keamanan</button>
        <button class="btn btn--ghost" id="mission2">🧪 Fraud simulator</button>
        <button class="btn btn--ghost" id="mission3">🧠 Kuis acak</button>
      </div>
      <p class="muted small">Misi membantu kamu mengumpulkan poin dan membangun kebiasaan aman.</p>
    `);

    APP.innerHTML = hero + quick;

    $("#mission1").onclick = () => location.hash = "#/keamanan";
    $("#mission2").onclick = () => location.hash = "#/keamanan#sim";
    $("#mission3").onclick = () => {
      // pick random module quiz
      const m = modules[Math.floor(Math.random()*modules.length)];
      location.hash = `#/modul/${m.id}?tab=kuis`;
    };
  }

  function renderLearn() {
    const list = modules.map(m => {
      const done = state.completedModules.includes(m.id);
      return `
        <div class="card">
          <div class="row" style="justify-content:space-between">
            <div>
              <h2 style="margin:0">${m.title}</h2>
              <p class="muted" style="margin:6px 0 0">${m.desc}</p>
            </div>
            <div class="row">
              ${done ? `<span class="badge badge--ok">✅ Selesai</span>` : `<span class="badge">⏳ Belum</span>`}
              <a class="btn btn--ghost" href="#/modul/${m.id}">Buka</a>
            </div>
          </div>
        </div>
      `;
    }).join("");

    APP.innerHTML = `
      ${card("Belajar (4 modul wajib)", `
        <p class="muted">Setiap modul punya: <b>Artikel</b>, <b>Video edukasi</b>, <b>Infografis</b>, dan <b>Kuis interaktif</b> (gamifikasi).</p>
        <div class="row">${progressView()}</div>
      `)}
      ${list}
    `;
  }

  function getQueryParams() {
    const h = location.hash;
    const idx = h.indexOf("?");
    if (idx === -1) return {};
    const qs = h.slice(idx + 1);
    const p = {};
    qs.split("&").forEach(kv => {
      const [k,v] = kv.split("=");
      if (k) p[decodeURIComponent(k)] = decodeURIComponent(v||"");
    });
    return p;
  }

  function renderModule(moduleId) {
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return renderNotFound();

    const params = getQueryParams();
    const tab = params.tab || "artikel";

    const tabBtn = (id, label) => `<span class="tab ${tab===id ? "active":""}" data-tab="${id}" role="button" tabindex="0">${label}</span>`;

    const done = state.completedModules.includes(mod.id);
    const right = `
      ${done ? `<span class="badge badge--ok">✅ Selesai</span>` : `<span class="badge">⏳ Belum</span>`}
      <button class="btn btn--ok" id="btnComplete">${done ? "Selesai ✅" : "Tandai selesai"}</button>
      <a class="btn btn--ghost" href="#/belajar">← Kembali</a>
    `;

    let content = "";
    if (tab === "artikel") content = renderArticle(mod);
    if (tab === "video") content = renderVideos(mod);
    if (tab === "infografis") content = renderInfographic(mod);
    if (tab === "kuis") content = renderQuiz(mod);

    APP.innerHTML = card(mod.title, `
      <div class="tabs" aria-label="Tab modul">
        ${tabBtn("artikel","Artikel")}
        ${tabBtn("video","Video")}
        ${tabBtn("infografis","Infografis")}
        ${tabBtn("kuis","Kuis")}
      </div>
      <div style="margin-top:12px">${content}</div>
    `, right);

    // Tab interactions
    $$(".tab").forEach(el => {
      const go = () => {
        const t = el.getAttribute("data-tab");
        location.hash = `#/modul/${mod.id}?tab=${encodeURIComponent(t)}`;
      };
      el.addEventListener("click", go);
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") go(); });
    });

    // Complete module
    $("#btnComplete").onclick = () => {
      if (state.completedModules.includes(mod.id)) {
        toast("Modul ini sudah ditandai selesai.");
        return;
      }
      state.completedModules.push(mod.id);
      // Points + badge
      addPoints(120, `Selesai: ${mod.title}`);
      if (mod.id==="m1") grantBadge("b_rookie","Fintech Rookie");
      if (mod.id==="m2") grantBadge("b_types","Fintech Explorer");
      if (mod.id==="m3") grantBadge("b_guardian","Guardian Privasi");
      if (mod.id==="m4") grantBadge("b_reg","Paham Regulasi");
      saveState();
      route();
    };

    // Hook quiz submit if present
    const submit = $("#btnQuizSubmit");
    if (submit) submit.onclick = () => gradeQuiz(mod);
  }

  function renderArticle(mod) {
    const items = mod.article.map(p => `<li>${escapeHtml(p)}</li>`).join("");
    return `
      <p class="muted">Ringkasan materi (bahasa Indonesia, fokus edukasi).</p>
      <ol>${items}</ol>
      <div class="infobox">
        <b>Tips belajar:</b> setelah membaca, buka tab <b>Kuis</b> untuk menguji pemahaman dan dapatkan poin.
      </div>
    `;
  }

  function renderVideos(mod) {
    const vids = mod.videos?.length ? mod.videos : [{title:"(Tambahkan video)", youtubeId:null}];
    return `
      <p class="muted">Video edukasi (contoh embed). Kamu boleh mengganti video sesuai kebutuhan tim.</p>
      ${vids.map(v => v.youtubeId ? `
        <div style="margin:12px 0">
          <div class="row" style="justify-content:space-between">
            <b>${escapeHtml(v.title)}</b>
            <span class="badge">▶️ YouTube</span>
          </div>
          <div class="videoWrap" style="margin-top:8px">
            <iframe src="https://www.youtube-nocookie.com/embed/${v.youtubeId}" title="${escapeHtml(v.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        </div>
      ` : `
        <div class="infobox">Belum ada video. Tambahkan link video di data modul (app.js).</div>
      `).join("")}
      <div class="infobox">
        <b>Catatan:</b> gunakan sumber tepercaya (regulator/edukasi resmi). Hindari video yang mengarahkan “beli/ambil produk” tertentu.
      </div>
    `;
  }

  function renderInfographic(mod) {
    return `
      <p class="muted">Infografis ringkas untuk membantu pemahaman cepat.</p>
      <div class="infobox">${mod.infographicSvg}</div>
    `;
  }

  function renderQuiz(mod) {
    const key = mod.id;
    const best = state.bestQuizScore[key] ?? null;
    return `
      <div class="row" style="justify-content:space-between">
        <p class="muted" style="margin:0">Jawab kuis ini untuk dapat poin dan membuka badge.</p>
        ${best !== null ? `<span class="badge badge--ok">Best: ${best}%</span>` : `<span class="badge">Belum ada skor</span>`}
      </div>
      <div class="hr"></div>
      <div id="quizWrap">
        ${mod.quiz.map((qq, i) => renderQuestion(qq, i)).join("")}
      </div>
      <div class="row" style="margin-top:12px">
        <button class="btn" id="btnQuizSubmit">Kumpulkan Jawaban</button>
        <button class="btn btn--ghost" id="btnQuizReset">Reset</button>
      </div>
      <div id="quizResult" style="margin-top:12px"></div>
    `;
  }

  function renderQuestion(qq, idx) {
    const name = `q_${idx}`;
    return `
      <div class="quizQ" data-q="${idx}">
        <h4>${idx+1}. ${escapeHtml(qq.text)}</h4>
        ${qq.answers.map((ans, j) => `
          <label class="choice">
            <input type="radio" name="${name}" value="${j}" />
            <span>${escapeHtml(ans.text)}</span>
          </label>
        `).join("")}
        <div class="muted small" style="margin-top:6px" data-explain></div>
      </div>
    `;
  }

  function gradeQuiz(mod) {
    const qs = mod.quiz;
    let correct = 0;
    const wrap = $("#quizWrap");
    const qEls = $$(".quizQ", wrap);

    qEls.forEach((qEl, idx) => {
      const chosen = $("input[type=radio]:checked", qEl);
      const explainEl = $("[data-explain]", qEl);
      // reset classes
      $$(".choice", qEl).forEach(ch => ch.classList.remove("correct","wrong"));

      if (!chosen) {
        explainEl.textContent = "Belum dijawab.";
        return;
      }
      const answerIndex = Number(chosen.value);
      const ans = qs[idx].answers[answerIndex];
      const isCorrect = !!ans?.correct;
      if (isCorrect) correct += 1;

      // highlight
      const labels = $$(".choice", qEl);
      labels.forEach((lab, j) => {
        const a = qs[idx].answers[j];
        if (a.correct) lab.classList.add("correct");
      });
      if (!isCorrect) labels[answerIndex].classList.add("wrong");

      explainEl.textContent = qs[idx].explain;
    });

    const total = qs.length;
    const pct = Math.round((correct/total) * 100);

    // Award points
    const prevBest = state.bestQuizScore[mod.id] ?? 0;
    const base = 40 + correct * 20;
    const bonus = pct > prevBest ? 30 : 0;
    addPoints(base + bonus, `Skor kuis ${pct}%`);
    state.bestQuizScore[mod.id] = Math.max(prevBest, pct);

    $("#quizResult").innerHTML = `
      <div class="infobox">
        <b>Hasil:</b> ${correct}/${total} benar (${pct}%).<br/>
        <span class="muted small">Poin: ${base}${bonus?` + bonus improvement ${bonus}`:""}.</span>
      </div>
    `;
    saveState();
    route(); // refresh HUD + badges view if needed
  }

  function renderQuizHub() {
    const items = modules.map(m => {
      const best = state.bestQuizScore[m.id];
      const badge = best != null ? `<span class="badge badge--ok">Best ${best}%</span>` : `<span class="badge">Belum</span>`;
      return `
        <tr>
          <td><b>${escapeHtml(m.title)}</b></td>
          <td>${badge}</td>
          <td><a class="btn btn--ghost" href="#/modul/${m.id}?tab=kuis">Kerjakan</a></td>
        </tr>
      `;
    }).join("");

    APP.innerHTML = card("Kuis Hub", `
      <p class="muted">Kumpulkan poin dari kuis tiap modul. Skor terbaik akan tersimpan.</p>
      <table class="table" aria-label="Daftar kuis">
        <thead><tr><th>Modul</th><th>Skor</th><th>Aksi</th></tr></thead>
        <tbody>${items}</tbody>
      </table>
    `);
  }

  function renderSimulations() {
    APP.innerHTML = `
      ${card("Simulasi Interaktif (edukasi, bukan rekomendasi)", `
        <p class="muted">Coba simulasi berikut untuk memahami konsep dasar perencanaan keuangan.</p>
        <div class="row">
          <button class="btn btn--ghost" id="tabBudget">📊 Budget 50/30/20</button>
          <button class="btn btn--ghost" id="tabLoan">🧾 Simulasi Pinjaman</button>
          <button class="btn btn--ghost" id="tabEmergency">🧯 Dana Darurat</button>
        </div>
        <div class="hr"></div>
        <div id="simArea"></div>
      `)}
    `;

    const simArea = $("#simArea");
    const showBudget = () => simArea.innerHTML = renderSimBudget();
    const showLoan = () => simArea.innerHTML = renderSimLoan();
    const showEmergency = () => simArea.innerHTML = renderSimEmergency();

    $("#tabBudget").onclick = showBudget;
    $("#tabLoan").onclick = showLoan;
    $("#tabEmergency").onclick = showEmergency;

    showBudget();

    // Hook handlers after render
    simArea.addEventListener("click", (e) => {
      if (e.target?.id === "btnCalcBudget") {
        const income = Number($("#income").value || 0);
        const needs = income * 0.5;
        const wants = income * 0.3;
        const savings = income * 0.2;
        $("#outBudget").innerHTML = `
          <div class="row">
            <div class="kpi"><b>${fmtRp(needs)}</b><span>Kebutuhan (50%)</span></div>
            <div class="kpi"><b>${fmtRp(wants)}</b><span>Keinginan (30%)</span></div>
            <div class="kpi"><b>${fmtRp(savings)}</b><span>Tabungan/Investasi (20%)</span></div>
          </div>
        `;
        addPoints(10, "Simulasi budgeting");
      }

      if (e.target?.id === "btnCalcLoan") {
        const principal = Number($("#loanPrincipal").value || 0);
        const rate = Number($("#loanRate").value || 0) / 100;
        const months = Math.max(1, Number($("#loanMonths").value || 1));
        // simple annuity
        const i = rate/12;
        const pay = i === 0 ? (principal/months) : (principal * (i*Math.pow(1+i,months)) / (Math.pow(1+i,months)-1));
        const total = pay * months;
        $("#outLoan").innerHTML = `
          <div class="row">
            <div class="kpi"><b>${fmtRp(Math.round(pay))}</b><span>Perkiraan cicilan/bulan</span></div>
            <div class="kpi"><b>${fmtRp(Math.round(total))}</b><span>Total bayar</span></div>
            <div class="kpi"><b>${fmtRp(Math.round(total - principal))}</b><span>Total bunga</span></div>
          </div>
          <div class="infobox" style="margin-top:10px">
            <b>Catatan edukasi:</b> di dunia nyata bisa ada biaya admin, denda, dan syarat lain. Baca ringkasan informasi produk sebelum setuju.
          </div>
        `;
        addPoints(10, "Simulasi pinjaman");
      }

      if (e.target?.id === "btnCalcEmergency") {
        const expense = Number($("#monthlyExpense").value || 0);
        const months = clamp(Number($("#emMonths").value || 3), 1, 12);
        const target = expense * months;
        $("#outEmergency").innerHTML = `
          <div class="row">
            <div class="kpi"><b>${fmtRp(target)}</b><span>Target dana darurat</span></div>
            <div class="kpi"><b>${fmtRp(Math.round(target/12))}</b><span>Jika dicicil 12 bulan</span></div>
          </div>
        `;
        addPoints(10, "Simulasi dana darurat");
      }
    });
  }

  function renderSimBudget() {
    return `
      <h3>Budgeting 50/30/20</h3>
      <p class="muted small">Aturan sederhana: 50% kebutuhan, 30% keinginan, 20% tabungan/investasi. Sesuaikan dengan kondisi.</p>
      <div class="form">
        <div>
          <label>Pendapatan bulanan (Rp)</label>
          <input id="income" class="input" type="number" min="0" placeholder="contoh: 5000000" />
        </div>
        <div style="align-self:end">
          <button id="btnCalcBudget" class="btn">Hitung</button>
        </div>
      </div>
      <div id="outBudget" style="margin-top:12px"></div>
    `;
  }

  function renderSimLoan() {
    return `
      <h3>Simulasi Pinjaman (Anuitas)</h3>
      <p class="muted small">Memahami konsep: pokok, bunga, tenor. Ini simulasi edukasi, bukan ajakan mengambil pinjaman.</p>
      <div class="form">
        <div>
          <label>Pokok pinjaman (Rp)</label>
          <input id="loanPrincipal" class="input" type="number" min="0" placeholder="contoh: 3000000" />
        </div>
        <div>
          <label>Bunga per tahun (%)</label>
          <input id="loanRate" class="input" type="number" min="0" step="0.1" placeholder="contoh: 18" />
        </div>
        <div>
          <label>Tenor (bulan)</label>
          <input id="loanMonths" class="input" type="number" min="1" placeholder="contoh: 12" />
        </div>
        <div style="align-self:end">
          <button id="btnCalcLoan" class="btn">Hitung</button>
        </div>
      </div>
      <div id="outLoan" style="margin-top:12px"></div>
    `;
  }

  function renderSimEmergency() {
    return `
      <h3>Dana Darurat</h3>
      <p class="muted small">Dana darurat umumnya 3–6 bulan pengeluaran (tergantung kondisi). Simulasi ini membantu membuat target.</p>
      <div class="form">
        <div>
          <label>Pengeluaran bulanan (Rp)</label>
          <input id="monthlyExpense" class="input" type="number" min="0" placeholder="contoh: 2500000" />
        </div>
        <div>
          <label>Berapa bulan target?</label>
          <select id="emMonths">
            <option value="3">3 bulan</option>
            <option value="4">4 bulan</option>
            <option value="6">6 bulan</option>
            <option value="9">9 bulan</option>
            <option value="12">12 bulan</option>
          </select>
        </div>
        <div style="grid-column:1/-1">
          <button id="btnCalcEmergency" class="btn">Hitung</button>
        </div>
      </div>
      <div id="outEmergency" style="margin-top:12px"></div>
    `;
  }

  function renderPlanner() {
    const p = state.planner;
    const goals = p.goals || [];
    APP.innerHTML = `
      ${card("Planner Keuangan Personal", `
        <p class="muted">Atur budget sederhana dan target tujuan. Data tersimpan di perangkatmu.</p>
        <div class="form">
          <div>
            <label>Pendapatan bulanan (Rp)</label>
            <input id="pIncome" class="input" type="number" min="0" value="${p.income||0}" />
          </div>
          <div>
            <label>Kebutuhan (Rp)</label>
            <input id="pNeeds" class="input" type="number" min="0" value="${p.needs||0}" />
          </div>
          <div>
            <label>Keinginan (Rp)</label>
            <input id="pWants" class="input" type="number" min="0" value="${p.wants||0}" />
          </div>
          <div>
            <label>Tabungan/Investasi (Rp)</label>
            <input id="pSavings" class="input" type="number" min="0" value="${p.savings||0}" />
          </div>
          <div style="grid-column:1/-1" class="row">
            <button class="btn" id="btnSavePlanner">Simpan</button>
            <button class="btn btn--ghost" id="btnAuto503020">Auto 50/30/20</button>
          </div>
        </div>
        <div class="hr"></div>
        <div id="plannerSummary"></div>
      `)}
      ${card("Target (Goals)", `
        <div class="form">
          <div>
            <label>Nama tujuan</label>
            <input id="gName" class="input" placeholder="contoh: Dana darurat" />
          </div>
          <div>
            <label>Target (Rp)</label>
            <input id="gTarget" class="input" type="number" min="0" placeholder="contoh: 15000000" />
          </div>
          <div>
            <label>Sudah terkumpul (Rp)</label>
            <input id="gSaved" class="input" type="number" min="0" placeholder="contoh: 2000000" />
          </div>
          <div style="align-self:end">
            <button class="btn" id="btnAddGoal">Tambah</button>
          </div>
        </div>

        <div class="hr"></div>
        <div id="goalsList">${renderGoals(goals)}</div>
      `)}
    `;

    function updateSummary() {
      const income = Number($("#pIncome").value||0);
      const needs = Number($("#pNeeds").value||0);
      const wants = Number($("#pWants").value||0);
      const savings = Number($("#pSavings").value||0);
      const out = income - (needs + wants + savings);
      $("#plannerSummary").innerHTML = `
        <div class="row">
          <div class="kpi"><b>${fmtRp(income)}</b><span>Pendapatan</span></div>
          <div class="kpi"><b>${fmtRp(needs+wants+savings)}</b><span>Total alokasi</span></div>
          <div class="kpi"><b>${fmtRp(out)}</b><span>Sisa (bisa untuk buffer)</span></div>
        </div>
        <div class="infobox" style="margin-top:10px">
          <b>Tips:</b> kalau sisa negatif, kurangi pos keinginan/cek ulang kebutuhan. Usahakan ada buffer.
        </div>
      `;
    }
    updateSummary();

    $("#btnSavePlanner").onclick = () => {
      state.planner.income = Number($("#pIncome").value||0);
      state.planner.needs = Number($("#pNeeds").value||0);
      state.planner.wants = Number($("#pWants").value||0);
      state.planner.savings = Number($("#pSavings").value||0);
      saveState();
      addPoints(15, "Simpan planner");
      updateSummary();
    };

    $("#btnAuto503020").onclick = () => {
      const income = Number($("#pIncome").value||0);
      $("#pNeeds").value = Math.round(income*0.5);
      $("#pWants").value = Math.round(income*0.3);
      $("#pSavings").value = Math.round(income*0.2);
      updateSummary();
      toast("Auto 50/30/20 diterapkan.");
    };

    $("#btnAddGoal").onclick = () => {
      const name = ($("#gName").value||"").trim();
      const target = Number($("#gTarget").value||0);
      const saved = Number($("#gSaved").value||0);
      if (!name || target<=0) return toast("Isi nama tujuan dan target > 0.");
      state.planner.goals.push({ id: "g_"+Date.now(), name, target, saved: clamp(saved,0,target) });
      saveState();
      addPoints(20, "Tambah goal");
      $("#goalsList").innerHTML = renderGoals(state.planner.goals);
      $("#gName").value = ""; $("#gTarget").value=""; $("#gSaved").value="";
    };

    APP.addEventListener("click", (e) => {
      const btn = e.target;
      if (!(btn instanceof HTMLElement)) return;
      if (btn.dataset?.act === "delGoal") {
        const id = btn.dataset.id;
        state.planner.goals = state.planner.goals.filter(g => g.id !== id);
        saveState();
        toast("Goal dihapus.");
        $("#goalsList").innerHTML = renderGoals(state.planner.goals);
      }
      if (btn.dataset?.act === "updGoal") {
        const id = btn.dataset.id;
        const input = $(`#saved_${id}`);
        const g = state.planner.goals.find(x => x.id === id);
        if (!g || !input) return;
        g.saved = clamp(Number(input.value||0), 0, g.target);
        saveState();
        addPoints(10, "Update progress goal");
        $("#goalsList").innerHTML = renderGoals(state.planner.goals);
      }
    }, { once:false });
  }

  function renderGoals(goals) {
    if (!goals?.length) return `<p class="muted">Belum ada goal. Tambahkan di form atas.</p>`;
    return goals.map(g => {
      const pct = g.target ? Math.round((g.saved/g.target)*100) : 0;
      return `
        <div class="quizQ" style="margin:10px 0">
          <div class="row" style="justify-content:space-between">
            <b>${escapeHtml(g.name)}</b>
            <span class="badge">${pct}%</span>
          </div>
          <div class="row" style="margin-top:8px">
            <div class="kpi"><b>${fmtRp(g.target)}</b><span>Target</span></div>
            <div class="kpi"><b>${fmtRp(g.saved)}</b><span>Terkumpul</span></div>
          </div>
          <div class="progress" style="margin-top:10px"><div style="width:${pct}%"></div></div>

          <div class="row" style="margin-top:10px">
            <div style="flex:1; min-width:180px">
              <label>Update terkumpul (Rp)</label>
              <input id="saved_${g.id}" class="input" type="number" min="0" value="${g.saved}" />
            </div>
            <button class="btn btn--ok" data-act="updGoal" data-id="${g.id}">Update</button>
            <button class="btn btn--danger" data-act="delGoal" data-id="${g.id}">Hapus</button>
          </div>
        </div>
      `;
    }).join("");
  }

  function renderSecurity() {
    const c = state.securityChecklist;
    APP.innerHTML = `
      ${card("Keamanan Digital (preventif)", `
        <p class="muted">Checklist kebiasaan aman. Centang untuk membangun habit. (Data tersimpan lokal)</p>
        <div class="quizQ">
          ${checkItem("otpNeverShare", "Saya tidak pernah membagikan OTP/PIN/password ke siapa pun (termasuk yang mengaku CS).")}
          ${checkItem("mfaOn", "Saya mengaktifkan MFA/2FA pada akun penting.")}
          ${checkItem("passwordManager", "Saya memakai password unik & mempertimbangkan password manager.")}
          ${checkItem("updateDevice", "Saya rutin update OS & aplikasi (patch keamanan).")}
          ${checkItem("checkUrl", "Saya selalu cek URL/domain sebelum login/klik link.")}
        </div>
        <div class="row" style="margin-top:12px">
          <button class="btn" id="btnSaveChecklist">Simpan checklist</button>
          <button class="btn btn--ghost" id="btnResetChecklist">Reset</button>
        </div>
        <div class="hr"></div>
        <div class="infobox">
          <b>Ingat:</b> penipuan sering pakai rasa panik/urgensi. Berhenti sejenak, verifikasi ke kanal resmi.
        </div>
      `)}
      ${card("Jika sudah jadi korban penipuan transaksi keuangan", `
        <p class="muted">
          Ini panduan awal (edukasi). Simpan bukti dan laporkan melalui kanal resmi.
        </p>
        <ol>
          <li><b>Amankan akun</b>: ubah password, logout semua perangkat, blokir kartu/akun terkait bila perlu.</li>
          <li><b>Kumpulkan bukti</b>: kronologi, rekening/nomor tujuan, screenshot chat, tautan, bukti transfer.</li>
          <li><b>Laporkan</b> melalui website resmi Indonesia Anti-Scam Centre (IASC OJK):</li>
        </ol>
        <div class="row">
          <a class="btn" href="https://iasc.ojk.go.id/" target="_blank" rel="noopener">Buka IASC OJK</a>
          <span class="badge badge--warn">⚠️ Waspada website palsu</span>
        </div>
        <div class="infobox" style="margin-top:10px">
          <b>Tips anti-scam:</b> pelaporan hanya lewat website resmi iasc.ojk.go.id. Jangan percaya pihak yang mengaku “admin IASC” dan meminta OTP/uang.
        </div>
      `)}
      ${card("Fraud Simulator (gamifikasi)", `
        <p class="muted">Latihan mengenali modus penipuan. Pilih respons paling aman.</p>
        <div id="simFraud"></div>
      `)}
    `;

    $("#btnSaveChecklist").onclick = () => {
      // count checked
      const keys = Object.keys(state.securityChecklist);
      const count = keys.reduce((acc,k) => acc + (state.securityChecklist[k]?1:0), 0);
      addPoints(10 + count*3, "Checklist keamanan");
      saveState();
    };

    $("#btnResetChecklist").onclick = () => {
      Object.keys(state.securityChecklist).forEach(k => state.securityChecklist[k] = false);
      saveState();
      toast("Checklist di-reset.");
      route();
    };

    // Hook checklist changes
    APP.addEventListener("change", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLInputElement)) return;
      if (t.dataset?.checkKey) {
        state.securityChecklist[t.dataset.checkKey] = t.checked;
        saveState();
      }
    });

    renderFraudSimulator();
  }

  function checkItem(key, label) {
    const checked = !!state.securityChecklist[key];
    return `
      <label class="choice" style="cursor:default">
        <input type="checkbox" data-check-key="${key}" ${checked ? "checked":""} />
        <span>${escapeHtml(label)}</span>
      </label>
    `;
  }

  function renderFraudSimulator() {
    const container = $("#simFraud");
    const scenario = [
      {
        msg: "⚠️ 'Halo Kak, akun kamu kena blokir. Kirim OTP sekarang biar bisa dibuka.' (mengaku CS)",
        choices: [
          { t: "Kirim OTP supaya cepat", ok:false, tip:"OTP tidak boleh dibagikan." },
          { t: "Tolak, cek nomor/akun resmi, hubungi kanal resmi sendiri", ok:true, tip:"Benar. Kamu yang inisiatif menghubungi kanal resmi." },
          { t: "Klik link di pesan tanpa cek URL", ok:false, tip:"Link bisa phishing." }
        ]
      },
      {
        msg: "Kamu menerima link: 'login-aman-ojk.id-verif.com'. Tampak meyakinkan.",
        choices: [
          { t: "Cek domain dengan teliti, jangan login jika mencurigakan", ok:true, tip:"Benar. Domain mirip-mirip sering dipakai phishing." },
          { t: "Login saja karena tampilannya sama", ok:false, tip:"Tampilan bisa ditiru." },
          { t: "Minta teman cekkan OTP-nya", ok:false, tip:"Tetap tidak aman." }
        ]
      },
      {
        msg: "Ada iming-iming 'bonus besar' jika install APK dari chat grup.",
        choices: [
          { t: "Install APK karena bonusnya besar", ok:false, tip:"APK luar store berisiko malware." },
          { t: "Tolak, instal hanya dari store resmi dan verifikasi sumber", ok:true, tip:"Benar. Batasi izin aplikasi dan cek reputasi." },
          { t: "Install, tapi kasih izin akses SMS", ok:false, tip:"Akses SMS bisa dicuri untuk OTP." }
        ]
      }
    ];

    let step = 0;
    let score = 0;

    function renderStep() {
      const s = scenario[step];
      const best = state.fraudSimBest || 0;
      container.innerHTML = `
        <div class="quizQ">
          <div class="row" style="justify-content:space-between">
            <b>Skenario ${step+1}/${scenario.length}</b>
            <span class="badge">Best: ${best}</span>
          </div>
          <p style="margin:10px 0">${escapeHtml(s.msg)}</p>
          <div class="hr"></div>
          ${s.choices.map((c, i) => `
            <button class="btn btn--ghost" style="width:100%; justify-content:flex-start; margin:6px 0" data-choice="${i}">
              ${i+1}. ${escapeHtml(c.t)}
            </button>
          `).join("")}
          <div id="fraudTip" class="muted small" style="margin-top:10px"></div>
        </div>
      `;
    }

    function finish() {
      const pct = Math.round((score / scenario.length) * 100);
      state.fraudSimBest = Math.max(state.fraudSimBest || 0, pct);
      saveState();

      if (pct >= 80) grantBadge("b_anti_scam", "Anti-Scam Hero");

      addPoints(30 + pct, `Fraud simulator ${pct}%`);
      container.innerHTML = `
        <div class="infobox">
          <b>Selesai!</b> Skor kamu: ${pct}% (${score}/${scenario.length} benar).<br/>
          <span class="muted small">Kamu dapat poin dan (jika memenuhi) badge Anti-Scam Hero.</span>
        </div>
        <div class="row" style="margin-top:10px">
          <button class="btn" id="btnRepeatSim">Ulangi</button>
          <a class="btn btn--ghost" href="#/belajar">Lanjut belajar</a>
        </div>
      `;
      $("#btnRepeatSim").onclick = () => { step = 0; score = 0; renderStep(); };
    }

    container.addEventListener("click", (e) => {
      const btn = e.target;
      if (!(btn instanceof HTMLElement)) return;
      if (!btn.dataset?.choice) return;
      const s = scenario[step];
      const c = s.choices[Number(btn.dataset.choice)];
      const tipEl = $("#fraudTip");
      if (c.ok) {
        score += 1;
        tipEl.textContent = "✅ " + c.tip;
      } else {
        tipEl.textContent = "❌ " + c.tip;
      }
      // next after short delay
      setTimeout(() => {
        step += 1;
        if (step >= scenario.length) finish();
        else renderStep();
      }, 700);
    });

    renderStep();
  }

  function renderAbout() {
    const stack = [
      "Web app (SPA) berbasis HTML/CSS/JS (vanilla) — mudah di-deploy.",
      "Penyimpanan progres: localStorage (tanpa akun/login).",
      "Konten: 4 modul wajib (artikel, video, infografis, kuis) + simulasi + planner + pusat keamanan & pelaporan.",
      "Gamifikasi: poin, level, badge, streak, simulator anti-scam."
    ];

    APP.innerHTML = `
      ${card("Tentang FinCerdas ID", `
        <p class="muted">
          FinCerdas ID adalah prototipe web app untuk UAS Fintech: meningkatkan literasi keuangan melalui konten edukatif, simulasi interaktif,
          dan alat perencanaan keuangan personal dengan unsur gamifikasi.
        </p>
        <div class="hr"></div>
        <h3>Fitur utama</h3>
        <ul>${stack.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>

        <div class="hr"></div>
        <h3>Template pembagian peran tim (isi sendiri)</h3>
        <table class="table">
          <thead><tr><th>Peran</th><th>Kontribusi</th><th>Bukti</th></tr></thead>
          <tbody>
            <tr><td>PM</td><td>Timeline 16 minggu, backlog, notulen</td><td>Teams/Zoom notes</td></tr>
            <tr><td>UI/UX</td><td>Sitemap, wireframe, prototype</td><td>Figma history</td></tr>
            <tr><td>Frontend</td><td>Implementasi UI & fitur</td><td>Git commits</td></tr>
            <tr><td>Content</td><td>Artikel, storyboard, infografis, soal kuis</td><td>Doc versioning</td></tr>
            <tr><td>QA</td><td>Testing & perbaikan usability</td><td>Bug list</td></tr>
          </tbody>
        </table>

        <div class="hr"></div>
        <div class="infobox">
          <b>Catatan etika:</b> hindari konten yang menyesatkan atau mengarahkan user “beli produk X / ambil pinjaman Y”.
          Fokus edukasi konsep, risiko, dan kebiasaan aman.
        </div>
      `)}
    `;
  }

  function renderNotFound() {
    APP.innerHTML = card("Halaman tidak ditemukan", `
      <p class="muted">Link tidak valid. Kembali ke beranda.</p>
      <a class="btn" href="#/beranda">Ke Beranda</a>
    `);
  }

  // ---------- Helpers ----------
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  // ---------- Infographics (inline SVG) ----------
  function infographicFintechBasics(){
    return `
      <svg viewBox="0 0 900 320" width="100%" height="auto" role="img" aria-label="Infografis dasar fintech">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0" stop-color="rgba(77,227,166,0.9)"/>
            <stop offset="1" stop-color="rgba(122,162,255,0.9)"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="900" height="320" rx="22" fill="rgba(15,19,32,0.55)" stroke="rgba(233,238,252,0.18)"/>
        <text x="28" y="52" fill="rgba(233,238,252,0.92)" font-size="22" font-weight="800">Fintech = Teknologi + Layanan Keuangan</text>
        <text x="28" y="82" fill="rgba(179,189,219,0.95)" font-size="14">Membuat transaksi, akses, dan pengelolaan keuangan lebih cepat & mudah (dengan risiko yang perlu dipahami).</text>

        <g transform="translate(30,110)">
          <rect x="0" y="0" width="260" height="170" rx="18" fill="rgba(18,22,34,0.55)" stroke="rgba(233,238,252,0.15)"/>
          <text x="18" y="34" fill="rgba(233,238,252,0.9)" font-size="16" font-weight="700">Manfaat</text>
          <text x="18" y="64" fill="rgba(179,189,219,0.95)" font-size="14">• Transaksi lebih efisien</text>
          <text x="18" y="88" fill="rgba(179,189,219,0.95)" font-size="14">• Akses layanan lebih luas</text>
          <text x="18" y="112" fill="rgba(179,189,219,0.95)" font-size="14">• Pengalaman pengguna lebih baik</text>
          <text x="18" y="136" fill="rgba(179,189,219,0.95)" font-size="14">• Monitoring keuangan lebih mudah</text>
        </g>

        <g transform="translate(320,110)">
          <rect x="0" y="0" width="260" height="170" rx="18" fill="rgba(18,22,34,0.55)" stroke="rgba(233,238,252,0.15)"/>
          <text x="18" y="34" fill="rgba(233,238,252,0.9)" font-size="16" font-weight="700">Risiko</text>
          <text x="18" y="64" fill="rgba(179,189,219,0.95)" font-size="14">• Penipuan (scam/phishing)</text>
          <text x="18" y="88" fill="rgba(179,189,219,0.95)" font-size="14">• Kebocoran data</text>
          <text x="18" y="112" fill="rgba(179,189,219,0.95)" font-size="14">• Biaya/ketentuan tidak dibaca</text>
          <text x="18" y="136" fill="rgba(179,189,219,0.95)" font-size="14">• Keputusan impulsif</text>
        </g>

        <g transform="translate(610,110)">
          <rect x="0" y="0" width="260" height="170" rx="18" fill="rgba(18,22,34,0.55)" stroke="rgba(233,238,252,0.15)"/>
          <text x="18" y="34" fill="rgba(233,238,252,0.9)" font-size="16" font-weight="700">Kunci Aman</text>
          <text x="18" y="64" fill="rgba(179,189,219,0.95)" font-size="14">• Jangan bagikan OTP/PIN</text>
          <text x="18" y="88" fill="rgba(179,189,219,0.95)" font-size="14">• Cek URL & kanal resmi</text>
          <text x="18" y="112" fill="rgba(179,189,219,0.95)" font-size="14">• Pahami biaya & risiko</text>
          <text x="18" y="136" fill="rgba(179,189,219,0.95)" font-size="14">• Laporkan jika tertipu</text>
        </g>

        <rect x="28" y="292" width="844" height="8" rx="99" fill="url(#g1)" opacity="0.9"/>
      </svg>
    `;
  }

  function infographicFintechTypes(){
    const items = [
      ["Pembayaran", "QR, e-wallet, payment gateway"],
      ["Lending", "P2P lending, paylater (kredit)"],
      ["Wealth", "Perencanaan & investasi (pahami risiko)"],
      ["Insurtech", "Asuransi digital"],
      ["Regtech", "Kepatuhan & pelaporan"],
      ["Remittance", "Transfer lintas wilayah/negara"]
    ];
    return `
      <svg viewBox="0 0 900 360" width="100%" height="auto" role="img" aria-label="Infografis jenis fintech">
        <rect x="0" y="0" width="900" height="360" rx="22" fill="rgba(15,19,32,0.55)" stroke="rgba(233,238,252,0.18)"/>
        <text x="28" y="52" fill="rgba(233,238,252,0.92)" font-size="22" font-weight="800">Jenis-jenis Fintech (peta cepat)</text>
        <text x="28" y="82" fill="rgba(179,189,219,0.95)" font-size="14">Pilih berdasarkan kebutuhan. Cek biaya, risiko, reputasi, dan legalitas.</text>

        ${items.map((it, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const x = 28 + col * 282;
          const y = 110 + row * 112;
          return `
            <g>
              <rect x="${x}" y="${y}" width="260" height="92" rx="18" fill="rgba(18,22,34,0.55)" stroke="rgba(233,238,252,0.15)"/>
              <text x="${x+18}" y="${y+36}" fill="rgba(233,238,252,0.9)" font-size="16" font-weight="700">${it[0]}</text>
              <text x="${x+18}" y="${y+62}" fill="rgba(179,189,219,0.95)" font-size="13">${it[1]}</text>
            </g>
          `;
        }).join("")}

        <text x="28" y="332" fill="rgba(179,189,219,0.95)" font-size="13">Ingat: hindari “promo mendesak”, tautan mencurigakan, dan permintaan OTP.</text>
      </svg>
    `;
  }

  function infographicSecurity(){
    return `
      <svg viewBox="0 0 900 340" width="100%" height="auto" role="img" aria-label="Infografis keamanan digital">
        <rect x="0" y="0" width="900" height="340" rx="22" fill="rgba(15,19,32,0.55)" stroke="rgba(233,238,252,0.18)"/>
        <text x="28" y="52" fill="rgba(233,238,252,0.92)" font-size="22" font-weight="800">Keamanan Digital: 5 Kebiasaan Aman</text>
        <text x="28" y="82" fill="rgba(179,189,219,0.95)" font-size="14">Banyak kasus terjadi karena social engineering. Bukan kamu yang “bodoh” — modusnya memang dibuat meyakinkan.</text>

        <g transform="translate(28,110)">
          ${[
            ["1", "Jangan bagikan OTP/PIN/password", "Termasuk ke pihak yang mengaku CS."],
            ["2", "Cek URL/domain & kanal resmi", "Waspada domain mirip-mirip."],
            ["3", "Aktifkan MFA/2FA", "Lapisan keamanan tambahan."],
            ["4", "Update perangkat & aplikasi", "Patch menutup celah keamanan."],
            ["5", "Batasi izin aplikasi", "Jangan asal beri akses SMS/kontak."]
          ].map((x, i) => `
            <g transform="translate(${(i%2)*436}, ${Math.floor(i/2)*70})">
              <rect x="0" y="0" width="420" height="58" rx="18" fill="rgba(18,22,34,0.55)" stroke="rgba(233,238,252,0.15)"/>
              <circle cx="28" cy="29" r="18" fill="rgba(122,162,255,0.25)" stroke="rgba(122,162,255,0.6)"/>
              <text x="24" y="35" fill="rgba(233,238,252,0.92)" font-size="14" font-weight="800">${x[0]}</text>
              <text x="58" y="26" fill="rgba(233,238,252,0.9)" font-size="14" font-weight="700">${x[1]}</text>
              <text x="58" y="44" fill="rgba(179,189,219,0.95)" font-size="12">${x[2]}</text>
            </g>
          `).join("")}
        </g>

        <text x="28" y="318" fill="rgba(255,211,107,0.95)" font-size="13">Jika panik karena pesan mendesak: berhenti sejenak → verifikasi → baru bertindak.</text>
      </svg>
    `;
  }

  function infographicRegulation(){
    return `
      <svg viewBox="0 0 900 340" width="100%" height="auto" role="img" aria-label="Infografis regulasi & perlindungan">
        <rect x="0" y="0" width="900" height="340" rx="22" fill="rgba(15,19,32,0.55)" stroke="rgba(233,238,252,0.18)"/>
        <text x="28" y="52" fill="rgba(233,238,252,0.92)" font-size="22" font-weight="800">Perlindungan Konsumen: 4 Langkah Praktis</text>
        <text x="28" y="82" fill="rgba(179,189,219,0.95)" font-size="14">Tujuan: informasi jelas, keamanan, dan jalur pengaduan resmi.</text>

        <g transform="translate(28,110)">
          ${[
            ["1", "Pahami informasi produk", "Biaya, risiko, syarat, denda, dan privasi."],
            ["2", "Gunakan kanal resmi", "Website resmi, nomor resmi, email resmi."],
            ["3", "Simpan bukti", "Screenshot, bukti transfer, kronologi."],
            ["4", "Laporkan penipuan", "Gunakan kanal resmi IASC: iasc.ojk.go.id"]
          ].map((x, i) => `
            <g transform="translate(${(i%2)*436}, ${Math.floor(i/2)*92})">
              <rect x="0" y="0" width="420" height="78" rx="18" fill="rgba(18,22,34,0.55)" stroke="rgba(233,238,252,0.15)"/>
              <circle cx="28" cy="39" r="18" fill="rgba(77,227,166,0.18)" stroke="rgba(77,227,166,0.55)"/>
              <text x="24" y="45" fill="rgba(233,238,252,0.92)" font-size="14" font-weight="800">${x[0]}</text>
              <text x="58" y="34" fill="rgba(233,238,252,0.9)" font-size="14" font-weight="700">${x[1]}</text>
              <text x="58" y="56" fill="rgba(179,189,219,0.95)" font-size="12">${x[2]}</text>
            </g>
          `).join("")}
        </g>

        <text x="28" y="318" fill="rgba(179,189,219,0.95)" font-size="13">Waspada website palsu yang mengatasnamakan kanal pengaduan.</text>
      </svg>
    `;
  }

  // ---------- Start ----------
  route();
})();