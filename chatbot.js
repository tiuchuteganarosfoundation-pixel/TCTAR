/* ============================================================
   SCHOOL CHATBOT — chatbot.js
   Rule-based chat widget for Tiu Cho Teg - Ana Ros Foundation
   Integrated Farm School website.

   HOW IT WORKS:
   1. Loads FAQs from data.json automatically (same source as
      the FAQs page — add a FAQ in admin, chatbot knows it too)
   2. Matches user input against keywords in FAQ questions
   3. Falls back to built-in school info (address, phone, email)
   4. Final fallback: suggest contacting the school directly

   TO ADD TO A PAGE: just include this script at the bottom:
   <script src="chatbot.js"></script>
============================================================ */

(function () {

  /* ----------------------------------------------------------
     BUILT-IN KNOWLEDGE (always available, regardless of FAQs)
  ---------------------------------------------------------- */
  const BUILT_IN = [
    {
      keywords: ['address', 'location', 'saan', 'lugar', 'nasaan', 'mapa', 'directions', 'byp', 'lanit', 'jaro'],
      answer: '📍 Matatagpuan kami sa <strong>Iloilo Radial By-Pass Rd 4, Lanit, Jaro, Iloilo City</strong>.'
    },
    {
      keywords: ['phone', 'number', 'call', 'tawag', 'telepono', 'contact', 'makipag-ugnayan', '337'],
      answer: '📞 Maaari kayong tumawag sa amin sa <strong>+63 33 337 8522</strong>.'
    },
    {
      keywords: ['email', 'mail', 'sulat', 'deped', '500191'],
      answer: '✉️ Ang aming email address ay <strong>500191@deped.gov.ph</strong>.'
    },
    {
      keywords: ['enroll', 'mag-enroll', 'enrollment', 'paano mag', 'how to enroll', 'pano mag'],
      answer: '✏️ Maaari kayong mag-enroll online sa aming <a href="enrollment.html" style="color:var(--green-dark);font-weight:600;">Enrollment page</a>. Libre at madali lamang!'
    },
    {
      keywords: ['libre', 'free', 'bayad', 'tuition', 'payment', 'pera', 'gastos'],
      answer: '✅ Oo, <strong>libre ang pag-aaral</strong> dito. Kami ay isang pampublikong paaralan sa ilalim ng DepEd — walang bayad na tuition.'
    },
    {
      keywords: ['grade', 'level', 'anong grade', 'kinder', 'elementary', 'junior', 'senior', 'high school', 'shs', 'jhs', 'k-12'],
      answer: '📚 Tumatanggap kami mula <strong>Grade 1 hanggang Senior High School (K-12)</strong>. Available ang lahat ng tracks at strands para sa SHS.'
    },
    {
      keywords: ['document', 'requirement', 'papel', 'form 138', 'birth certificate', 'psa', 'good moral', 'report card'],
      answer: '📄 Ang mga kailangang dokumento ay: <strong>Form 138 (Report Card), PSA Birth Certificate, Good Moral Certificate</strong>, at 2x2 na larawan. Makikita ang kumpletong listahan sa enrollment form.'
    },
    {
      keywords: ['schedule', 'pasok', 'oras', 'time', 'klase', 'school hours', 'bukas'],
      answer: '🕐 Para sa eksaktong oras ng pasok at iskedyul ng klase, makipag-ugnayan sa amin sa <strong>+63 33 337 8522</strong> o bisitahin ang paaralan.'
    },
    {
      keywords: ['hello', 'hi', 'kumusta', 'magandang', 'good morning', 'good afternoon', 'good evening', 'hey'],
      answer: '👋 Kumusta! Ako si <strong>TJ</strong>, ang chatbot ng Tiu Cho Teg - Ana Ros Foundation Integrated Farm School. Paano kita matutulungan ngayon?'
    },
    {
      keywords: ['salamat', 'thank', 'thanks', 'maraming salamat', 'okay na', 'ayos na', 'nakuha ko na'],
      answer: '😊 Walang anuman! Kung mayroon pa kayong katanungan, nandito lang ako. Para sa mas detalyadong impormasyon, makipag-ugnayan sa amin sa <strong>+63 33 337 8522</strong>.'
    },
    {
      keywords: ['farm', 'agri', 'agriculture', 'pagsasaka', 'integrated', 'bukid'],
      answer: '🌱 Bilang isang <strong>Integrated Farm School</strong>, pinagsasama namin ang akademikong edukasyon at praktikal na kaalaman sa pagsasaka at agrikultura — naghahanda sa mga mag-aaral para sa kolehiyo at sa tunay na buhay.'
    },
  ];

  /* ----------------------------------------------------------
     FALLBACK — when nothing matches
  ---------------------------------------------------------- */
  const FALLBACK = `Hindi ko masagot ang tanong na iyan nang direkta. 😅<br><br>
    Para sa tulong, maaari kayong:<br>
    📞 Tumawag sa <strong>+63 33 337 8522</strong><br>
    ✉️ Mag-email sa <strong>500191@deped.gov.ph</strong><br>
    📍 O personal na bisitahin ang paaralan sa <strong>Iloilo Radial By-Pass Rd 4, Lanit, Jaro, Iloilo City</strong>.`;

  /* ----------------------------------------------------------
     GREETING shown when chat first opens
  ---------------------------------------------------------- */
  const GREETING = `Kumusta! Ako si <strong>TJ</strong> 🌱, ang inyong virtual na gabay ng <strong>Tiu Cho Teg - Ana Ros Foundation Integrated Farm School</strong>.<br><br>
    Maaari akong sagutin ang mga tanong tungkol sa enrollment, requirements, at iba pa. Subukan mo!`;

  /* ----------------------------------------------------------
     STYLES
  ---------------------------------------------------------- */
  const style = document.createElement('style');
  style.textContent = `
   #tj-bubble {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 68px;
  height: 68px;
  animation: tj-pulse 2s ease-in-out infinite;
      border-radius: 50%;
      background: #1B4332;
      border: 3px solid #40916C;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      box-shadow: 0 4px 20px rgba(27,67,50,0.35);
      z-index: 9998;
      transition: transform 0.2s, box-shadow 0.2s;
      user-select: none;
    }
    #tj-bubble:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(27,67,50,0.45); }

    #tj-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 18px;
      height: 18px;
      background: #D4A017;
      border-radius: 50%;
      font-size: 0.6rem;
      font-weight: 700;
      color: #1B4332;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #tj-window {
      position: fixed;
      bottom: 96px;
      right: 28px;
      width: 340px;
      max-height: 520px;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      display: flex;
      flex-direction: column;
      z-index: 9999;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
      transform: scale(0.92) translateY(12px);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.22s ease, opacity 0.22s ease;
    }

    #tj-window.open {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: all;
    }

    #tj-header {
      background: #1B4332;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    #tj-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #40916C;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    #tj-header-text { flex: 1; }
    #tj-header-name { color: #fff; font-size: 0.9rem; font-weight: 600; line-height: 1.2; }
    #tj-header-status { color: rgba(255,255,255,0.6); font-size: 0.72rem; }

    #tj-close {
      background: none;
      border: none;
      color: rgba(255,255,255,0.7);
      cursor: pointer;
      font-size: 1.2rem;
      padding: 4px;
      line-height: 1;
    }
    #tj-close:hover { color: #fff; }

    #tj-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #F2F7F2;
    }

    .tj-msg {
      max-width: 88%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 0.84rem;
      line-height: 1.55;
    }

    .tj-msg-bot {
      background: #fff;
      color: #1C1C1C;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.07);
    }

    .tj-msg-user {
      background: #1B4332;
      color: #fff;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }

    .tj-typing {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 10px 14px;
      background: #fff;
      border-radius: 12px;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
      box-shadow: 0 1px 4px rgba(0,0,0,0.07);
    }

    .tj-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #40916C;
      animation: tj-bounce 1.2s infinite;
    }
    .tj-dot:nth-child(2) { animation-delay: 0.2s; }
    .tj-dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes tj-bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40%           { transform: translateY(-6px); }
    }
	
	@keyframes tj-pulse {
  0%, 100% { transform: translateY(0) scale(1); box-shadow: 0 4px 20px rgba(27,67,50,0.35); }
  50%       { transform: translateY(-6px) scale(1.05); box-shadow: 0 10px 28px rgba(27,67,50,0.45); }
}

    #tj-suggestions {
      padding: 8px 12px 0;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      background: #F2F7F2;
    }

    .tj-chip {
      background: #D8F3DC;
      color: #1B4332;
      border: none;
      border-radius: 20px;
      padding: 5px 12px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: background 0.15s;
    }
    .tj-chip:hover { background: #40916C; color: #fff; }

    #tj-input-area {
      padding: 12px;
      border-top: 1px solid #E0EDE4;
      display: flex;
      gap: 8px;
      background: #fff;
    }

    #tj-input {
      flex: 1;
      padding: 9px 14px;
      border: 1.5px solid #D0E4D8;
      border-radius: 20px;
      font-family: 'Inter', sans-serif;
      font-size: 0.84rem;
      outline: none;
      color: #1C1C1C;
    }
    #tj-input:focus { border-color: #40916C; }

    #tj-send {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #1B4332;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.15s;
    }
    #tj-send:hover { background: #40916C; }
    #tj-send svg { width: 16px; height: 16px; fill: #fff; }

    @media (max-width: 480px) {
      #tj-window { width: calc(100vw - 32px); right: 16px; bottom: 88px; }
      #tj-bubble { right: 16px; bottom: 20px; }
    }
  `;
  document.head.appendChild(style);

  /* ----------------------------------------------------------
     HTML
  ---------------------------------------------------------- */
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div id="tj-bubble" onclick="TJ.toggle()" title="Magtanong kay TJ">
      🌱
      <div id="tj-badge">1</div>
    </div>

    <div id="tj-window">
      <div id="tj-header">
        <div id="tj-avatar">🌱</div>
        <div id="tj-header-text">
          <div id="tj-header-name">TJ — School Assistant</div>
          <div id="tj-header-status">Online ngayon</div>
        </div>
        <button id="tj-close" onclick="TJ.toggle()">✕</button>
      </div>

      <div id="tj-messages"></div>

      <div id="tj-suggestions">
        <button class="tj-chip" onclick="TJ.send('Paano mag-enroll?')">Paano mag-enroll?</button>
        <button class="tj-chip" onclick="TJ.send('Libre ba?')">Libre ba?</button>
        <button class="tj-chip" onclick="TJ.send('Anong documents ang kailangan?')">Mga requirements?</button>
        <button class="tj-chip" onclick="TJ.send('Saan kayo naroroon?')">Saan kayo?</button>
      </div>

      <div id="tj-input-area">
        <input id="tj-input" type="text" placeholder="Magtanong dito..." 
          onkeydown="if(event.key==='Enter') TJ.send()" />
        <button id="tj-send" onclick="TJ.send()">
          <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  /* ----------------------------------------------------------
     LOGIC
  ---------------------------------------------------------- */
  let faqData = [];
  let greeted = false;
  let isOpen = false;

  // Load FAQs from data.json to augment built-in knowledge
  fetch('https://tctar-api.onrender.com/website/faqs')
  .then(r => r.json())
  .then(d => { faqData = Array.isArray(d) ? d : []; })
  .catch(() => { faqData = []; });

  function match(input) {
    const lower = input.toLowerCase().trim();

    // 1. Check built-in rules first
    for (const rule of BUILT_IN) {
      if (rule.keywords.some(k => lower.includes(k))) {
        return rule.answer;
      }
    }

    // 2. Search FAQ data from data.json
    for (const faq of faqData) {
      const qWords = faq.question.toLowerCase().split(/\s+/);
      const inputWords = lower.split(/\s+/);
      const hits = inputWords.filter(w => w.length > 3 && qWords.some(q => q.includes(w) || w.includes(q)));
      if (hits.length >= 2 || (hits.length === 1 && lower.length < 20)) {
        return faq.answer;
      }
    }

    // 3. Fallback
    return FALLBACK;
  }

  function addMessage(text, isUser) {
    const msgs = document.getElementById('tj-messages');
    const div = document.createElement('div');
    div.className = `tj-msg ${isUser ? 'tj-msg-user' : 'tj-msg-bot'}`;
    div.innerHTML = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const msgs = document.getElementById('tj-messages');
    const div = document.createElement('div');
    div.className = 'tj-typing';
    div.id = 'tj-typing';
    div.innerHTML = '<div class="tj-dot"></div><div class="tj-dot"></div><div class="tj-dot"></div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById('tj-typing');
    if (t) t.remove();
  }

  window.TJ = {
    toggle() {
      isOpen = !isOpen;
      document.getElementById('tj-window').classList.toggle('open', isOpen);
      document.getElementById('tj-badge').style.display = 'none';

      if (isOpen && !greeted) {
        greeted = true;
        setTimeout(() => {
          showTyping();
          setTimeout(() => {
            hideTyping();
            addMessage(GREETING, false);
          }, 900);
        }, 200);
      }

      if (isOpen) {
        setTimeout(() => document.getElementById('tj-input').focus(), 300);
      }
    },

    send(text) {
      const input = document.getElementById('tj-input');
      const msg = text || input.value.trim();
      if (!msg) return;

      addMessage(msg, true);
      input.value = '';

      showTyping();
      setTimeout(() => {
        hideTyping();
        addMessage(match(msg), false);
      }, 600 + Math.random() * 400);
    }
  };

})();
