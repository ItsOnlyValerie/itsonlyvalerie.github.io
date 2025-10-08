import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// --- Firebase Setup ---
const firebaseConfig = {
  apiKey: "AIzaSyCg-lyuk3TlmWgfud9aFWXSArlY80StIDI",
  authDomain: "website-guestbook-cfbab.firebaseapp.com",
  projectId: "website-guestbook-cfbab",
  storageBucket: "website-guestbook-cfbab.firebasestorage.app",
  messagingSenderId: "172090640385",
  appId: "1:172090640385:web:e164764a65c786144f1800"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// --- Animated SVG Wave ---
const amplitude = 9;
const speed = 0.0007;
const points = 20;
const height = 560;
const bgHeight = 600;
const bgAmplitude = 7;
const bgSpeed = 0.0005;
function getWaveWidth() { return window.innerWidth; }
let width = getWaveWidth();
function generateWavePath(t, amp = amplitude, h = height, phaseOffset = 0, customSpeed = speed) {
  const segmentWidth = width / (points - 1);
  let d = '';
  let pointsArray = [];
  const phaseStep = (2 * Math.PI) / (points - 1);
  for (let i = 0; i < points; i++) {
    let x = i * segmentWidth;
    if (i === 0) x = 0;
    if (i === points - 1) x = width;
    const phase = t * customSpeed + (i * phaseStep) + phaseOffset;
    const y = Math.sin(phase) * amp + h / 2;
    pointsArray.push({ x, y });
  }
  d += `M ${pointsArray[0].x} ${pointsArray[0].y}`;
  for (let i = 1; i < pointsArray.length; i++) {
    const prev = pointsArray[i - 1];
    const curr = pointsArray[i];
    if (i === pointsArray.length - 1) {
      d += ` L ${curr.x} ${curr.y}`;
    } else {
      const cpx = (prev.x + curr.x) / 2;
      const cpy = (prev.y + curr.y) / 2;
      d += ` Q ${prev.x} ${prev.y}, ${cpx} ${cpy}`;
    }
  }
  d += ` L ${pointsArray[pointsArray.length - 1].x} ${h}`;
  d += ` L ${pointsArray[0].x} ${h}`;
  d += ` L ${pointsArray[0].x} ${pointsArray[0].y}`;
  d += ' Z';
  return d;
}
function resizeWave() {
  width = getWaveWidth();
  const svg = document.getElementById('animated-wave-svg');
  if (svg) {
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', `${width}`);
  }
  const bgsvg = document.getElementById('background-wave-svg');
  if (bgsvg) {
    bgsvg.setAttribute('viewBox', `0 0 ${width} ${bgHeight}`);
    bgsvg.setAttribute('width', `${width}`);
  }
}
function animateBothWaves() {
  const path = document.getElementById('animated-wave-path');
  const bgPath = document.getElementById('background-wave-path');
  const now = performance.now();
  if (path) path.setAttribute('d', generateWavePath(now));
  if (bgPath) bgPath.setAttribute('d', generateWavePath(now, bgAmplitude, bgHeight, Math.PI/6, bgSpeed));
  requestAnimationFrame(animateBothWaves);
}
document.addEventListener('DOMContentLoaded', function() {
  resizeWave();
  animateBothWaves();
  window.addEventListener('resize', resizeWave);
});


// --- Desktop icon row logic (browser & gallery windows, icons, drag, etc.)
(function() {
// Browser button and window logic
const browserBtn = document.getElementById('browser-btn');
const browserWindow = document.getElementById('browser-window');
const browserClose = browserWindow?.querySelector('.window-close');
const browserTitlebar = browserWindow?.querySelector('.window-titlebar');

if (browserBtn && browserWindow && browserClose && browserTitlebar) {
  // Globe icon open/close toggle logic
  const globeClosed = browserBtn.querySelector('.globe-icon-closed');
  const globeOpen = browserBtn.querySelector('.globe-icon-open');
  const globeClosedSVG = browserBtn.querySelector('.globe-icon-closed svg');
  const globeOpenSVG = browserBtn.querySelector('.globe-icon-open svg');
  if (globeClosedSVG) globeClosedSVG.style.marginTop = '4px';
  if (globeOpenSVG) globeOpenSVG.style.marginTop = '4px';
  function setGlobeOpenState(isOpen) {
    if (isOpen) {
      globeClosed.style.display = 'none';
      globeOpen.style.display = '';
    } else {
      globeClosed.style.display = '';
      globeOpen.style.display = 'none';
    }
  }
  browserBtn.onclick = () => {
    if (browserWindow.style.display === 'block') {
      browserWindow.style.display = 'none';
      setGlobeOpenState(false);
    } else {
      browserWindow.style.display = 'block';
      browserWindow.style.zIndex = 2001;
      setGlobeOpenState(true);
    }
  };
  browserClose.onclick = () => {
    browserWindow.style.display = 'none';
    setGlobeOpenState(false);
  };
  // Draggable browser window logic
  let isDraggingBrowser = false, dragOffsetXBrowser = 0, dragOffsetYBrowser = 0;
  browserTitlebar.addEventListener('mousedown', function(e) {
    isDraggingBrowser = true;
    const rect = browserWindow.getBoundingClientRect();
    dragOffsetXBrowser = e.clientX - rect.left;
    dragOffsetYBrowser = e.clientY - rect.top;
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', function(e) {
    if (!isDraggingBrowser) return;
    let x = e.clientX - dragOffsetXBrowser;
    let y = e.clientY - dragOffsetYBrowser;
    x = Math.max(0, Math.min(window.innerWidth - browserWindow.offsetWidth, x));
    y = Math.max(0, Math.min(window.innerHeight - browserWindow.offsetHeight, y));
    browserWindow.style.left = x + 'px';
    browserWindow.style.top = y + 'px';
    browserWindow.style.transform = 'none';
  });
  document.addEventListener('mouseup', function() {
    isDraggingBrowser = false;
    document.body.style.userSelect = '';
  });
}
// Gallery folder button and window logic
const galleryBtn = document.getElementById('gallery-folder-btn');
const galleryWindow = document.getElementById('gallery-window');
const galleryClose = galleryWindow?.querySelector('.window-close');
const galleryTitlebar = galleryWindow?.querySelector('.window-titlebar');
const folderClosed = galleryBtn?.querySelector('.folder-icon-closed');
const folderOpen = galleryBtn?.querySelector('.folder-icon-open');
function setFolderOpenState(isOpen) {
  if (!folderClosed || !folderOpen) return;
  if (isOpen) {
    folderClosed.style.display = 'none';
    folderOpen.style.display = '';
  } else {
    folderClosed.style.display = '';
    folderOpen.style.display = 'none';
  }
}
if (galleryBtn && galleryWindow && galleryClose && galleryTitlebar) {
  galleryBtn.onclick = () => {
    if (galleryWindow.style.display === 'block') {
      galleryWindow.style.display = 'none';
      setFolderOpenState(false);
    } else {
      galleryWindow.style.display = 'block';
      galleryWindow.style.zIndex = 2000;
      setFolderOpenState(true);
    }
  };
  galleryClose.onclick = () => {
    galleryWindow.style.display = 'none';
    setFolderOpenState(false);
  };
  // Draggable window logic
  let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
  galleryTitlebar.addEventListener('mousedown', function(e) {
    isDragging = true;
    const rect = galleryWindow.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    let x = e.clientX - dragOffsetX;
    let y = e.clientY - dragOffsetY;
    x = Math.max(0, Math.min(window.innerWidth - galleryWindow.offsetWidth, x));
    y = Math.max(0, Math.min(window.innerHeight - galleryWindow.offsetHeight, y));
    galleryWindow.style.left = x + 'px';
    galleryWindow.style.top = y + 'px';
    galleryWindow.style.transform = 'none';
  });
  document.addEventListener('mouseup', function() {
    isDragging = false;
    document.body.style.userSelect = '';
  });
}
})();

// --- Typewriter effect for cycling experience ---
(function() {
const experiences = ["game developer", "artist", "character designer","cat lover", "web tinkerer", "music enjoyer"];
const typewriterText = document.getElementById('typewriter-text');
const typewriterCursor = document.getElementById('typewriter-cursor');
const typewriterSymbol = document.getElementById('typewriter-symbol');
let expIdx = 0;
let charIdx = 0;
let typing = true;
function typeExperience() {
    const current = experiences[expIdx];
    if (typing) {
        if (charIdx < current.length) {
            typewriterText.textContent = current.slice(0, charIdx + 1);
            charIdx++;
            setTimeout(typeExperience, 70);
        } else {
            typing = false;
            setTimeout(typeExperience, 1200);
        }
    } else {
        if (charIdx > 0) {
            charIdx--;
            typewriterText.textContent = current.slice(0, charIdx);
            setTimeout(typeExperience, 30);
        } else {
            typing = true;
            expIdx = (expIdx + 1) % experiences.length;
            setTimeout(typeExperience, 400);
        }
    }
}
if(typewriterText && typewriterCursor && typewriterSymbol) typeExperience();
// Blinking cursor
setInterval(() => {
    if(typewriterCursor) typewriterCursor.style.opacity = typewriterCursor.style.opacity === '0' ? '1' : '0';
}, 500);
})();

// --- Dark/Light mode toggle ---
(function() {
const btn = document.getElementById('toggle-mode');
const icon = document.getElementById('toggle-icon');
const body = document.body;
let dark = false;
const moonSVG = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M28 25.5C25.5 27.5 22.5 29 19 29C12.3726 29 7 23.6274 7 17C7 12.5 9.5 8.5 13 6.5C12.5 7.5 12 9 12 11C12 18.1797 18.8203 25 26 25C26.75 25 27.5 25.25 28 25.5Z" fill="#111"/></svg>`;
const sunSVG = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="8" fill="#fff"/><g stroke="#fff" stroke-width="2"><line x1="18" y1="2" x2="18" y2="7"/><line x1="18" y1="29" x2="18" y2="34"/><line x1="2" y1="18" x2="7" y2="18"/><line x1="29" y1="18" x2="34" y2="18"/><line x1="6.22" y1="6.22" x2="9.9" y2="9.9"/><line x1="26.1" y1="26.1" x2="29.78" y2="29.78"/><line x1="6.22" y1="29.78" x2="9.9" y2="26.1"/><line x1="26.1" y1="9.9" x2="29.78" y2="6.22"/></g></svg>`;
function updateToggleIcon() {
        if (dark) {
            icon.innerHTML = sunSVG;
            btn.style.background = 'transparent';
            btn.style.color = '#fff';
        } else {
            icon.innerHTML = moonSVG;
            btn.style.background = 'transparent';
            btn.style.color = '#111';
        }
}
if (btn && icon && body) {
  btn.addEventListener('click', () => {
        dark = !dark;
        if (dark) {
                body.classList.add('dark-mode');
        } else {
                body.classList.remove('dark-mode');
        }
        updateToggleIcon();
  });
  // Auto-switch mode based on local time (dark: 7pm-7am, light: 7am-7pm)
  function autoSetModeByTime() {
      const hour = new Date().getHours();
      const shouldBeDark = (hour >= 19 || hour < 7);
      if (shouldBeDark !== dark) {
          dark = shouldBeDark;
          if (dark) {
              body.classList.add('dark-mode');
          } else {
              body.classList.remove('dark-mode');
          }
          updateToggleIcon();
      }
  }
  autoSetModeByTime();
  updateToggleIcon();
}
})();

// --- Emoji Picker ---
(function() {
const emojiBtn = document.getElementById('emoji-picker-btn');
const messageBox = document.getElementById('guestbook-message');
const emojiList = ["😀","😁","😂","🤣","😊","😍","😎","😢","😭","😡","👍","👏","🙏","🎉","❤️","🔥","✨","🌈","🍀","🍕","🐱","🐶","🌸","⭐","🥺"];
let emojiPickerDiv = null;
if (emojiBtn && messageBox) {
  emojiBtn.onclick = function(e) {
    e.preventDefault();
    if (emojiPickerDiv) {
      emojiPickerDiv.remove();
      emojiPickerDiv = null;
      return;
    }
    emojiPickerDiv = document.createElement('div');
    emojiPickerDiv.style.position = 'absolute';
    emojiPickerDiv.style.bottom = '40px';
    emojiPickerDiv.style.right = '0';
    emojiPickerDiv.style.background = '#fff';
    emojiPickerDiv.style.border = '1px solid #bbb';
    emojiPickerDiv.style.borderRadius = '8px';
    emojiPickerDiv.style.boxShadow = '0 2px 12px rgba(0,0,0,0.10)';
    emojiPickerDiv.style.padding = '6px 8px';
    emojiPickerDiv.style.display = 'flex';
    emojiPickerDiv.style.flexWrap = 'wrap';
    emojiPickerDiv.style.gap = '6px';
    emojiPickerDiv.style.zIndex = '2000';
    emojiList.forEach(emoji => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = emoji;
      btn.style.fontSize = '1.2rem';
      btn.style.background = 'transparent';
      btn.style.border = 'none';
      btn.style.cursor = 'pointer';
      btn.onclick = function() {
        // Insert emoji at cursor position
        const start = messageBox.selectionStart;
        const end = messageBox.selectionEnd;
        const text = messageBox.value;
        messageBox.value = text.slice(0, start) + emoji + text.slice(end);
        messageBox.focus();
        messageBox.selectionStart = messageBox.selectionEnd = start + emoji.length;
        emojiPickerDiv.remove();
        emojiPickerDiv = null;
      };
      emojiPickerDiv.appendChild(btn);
    });
    emojiBtn.parentElement.style.position = 'relative';
    emojiBtn.parentElement.appendChild(emojiPickerDiv);
  };
}
window.addEventListener('mousedown', function(e) {
  if (emojiPickerDiv && !emojiPickerDiv.contains(e.target) && e.target !== emojiBtn) {
    emojiPickerDiv.remove();
    emojiPickerDiv = null;
  }
});
})();

// --- Guestbook logic (Firebase, filters, toasts) ---

const guestbookBtn = document.getElementById('guestbook-btn');
const modal = document.getElementById('guestbook-modal');
const form = document.getElementById('guestbook-form');
const cancel = document.getElementById('guestbook-cancel');
const errorDiv = document.getElementById('guestbook-error');
const toastContainer = document.getElementById('guestbook-toast-container');
const captchaLabel = document.getElementById('guestbook-captcha-label');
const captchaInput = document.getElementById('guestbook-captcha');
// Captcha logic
let captchaAnswer = '';
function randomizeCaptcha() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    captchaAnswer = (a + b).toString();
    captchaLabel.textContent = `What is ${a} + ${b}? `;
    captchaInput.value = '';
}
if (guestbookBtn && modal && errorDiv && captchaLabel && captchaInput) {
  guestbookBtn.onclick = () => {
      modal.style.display = 'block';
      errorDiv.style.display = 'none';
      randomizeCaptcha();
  };
}
if (cancel && modal) {
  cancel.onclick = () => { modal.style.display = 'none'; };
}
// --- Bad link and profanity filter ---
const BAD_DOMAINS = [
  'phishing.com', 'malware.com', 'badsite.net', 'scamdomain.org', 'abuse.ch', 'openphish.com', 'phishtank.com'
];
const PROFANITIES = [
  'Africoon', 'Africoon-Americoon', 'Africoonia', 'Americoon', 'Americunt', 'AmeriKKKunt', 'antifaggot', 'antinigger', 'Ashke-Nazi', 'assfuck', 'assjockey', 'asslicker', 'asswhore', 'beaner', 'Chankoro', 'Chink', 'Choc-ice', 'clamdigger', 'coon', 'Coon-ass', 'cumqueen', 'cunnilingus', 'cunteyed', 'cuntfucker', 'cuntlicker', 'datnigga', 'dicklicker','Dothead', 'fag', 'fagot', 'fatfuck', 'Gypsy', 'hobo', 'homobangers', 'Hymie', 'Indognesial', 'Indonesial', 'Jigaboo', 'jigga', 'jiggabo', 'jigger', 'kunt', 'kyk', 'Laowai', 'Leb', 'molester', 'Munt', 'nigger', 'niggerhole', 'niggers', 'niggles', 'niggling', 'nlgger', 'nlggor', 'Porch-monkey', 'porchmonkey', 'prostitute', 'Redskin', 'retard', 'sexslave', 'sextogo', 'Sheboon', 'shitnigger', 'slanteye', 'slavedriver', 'slut', 'sluts', 'slutt', 'sniggers', 'snownigger', 'spaghettinigge', 'Spearchucker', 'Timber-nigger', 'White-trash', 'whitetrash', 'Wigger', 'Wuhan-virus', 'Yuon', 'zigabo'
];
function filterMessage(msg) {
    let filtered = msg.replace(/https?:\/\/\S+/gi, function(link) {
        try {
            const url = new URL(link);
            if (BAD_DOMAINS.some(domain => url.hostname.includes(domain))) {
                return '[blocked malicious link]';
            }
        } catch (e) {}
        return link;
    });
    filtered = filtered.replace(/www\.[^\s]+/gi, function(link) {
        try {
            const hostname = link.split('/')[0].replace('www.', '');
            if (BAD_DOMAINS.some(domain => hostname.includes(domain))) {
                return '[blocked malicious link]';
            }
        } catch (e) {}
        return link;
    });
    PROFANITIES.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        filtered = filtered.replace(regex, '*'.repeat(word.length));
    });
    return filtered;
}
function containsBadLink(msg) {
    const urlRegex = /https?:\/\/[^ -\s]+|www\.[^\s]+/gi;
    const links = msg.match(urlRegex) || [];
    for (const link of links) {
        try {
            let hostname = '';
            if (link.startsWith('http')) {
                hostname = new URL(link).hostname;
            } else if (link.startsWith('www.')) {
                hostname = link.split('/')[0].replace('www.', '');
            }
            if (BAD_DOMAINS.some(domain => hostname.includes(domain))) {
                return true;
            }
        } catch (e) {}
    }
    return false;
}
function containsProfanity(msg) {
    for (const word of PROFANITIES) {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (regex.test(msg)) {
            return true;
        }
    }
    return false;
}
if (form && errorDiv && captchaInput && captchaLabel && toastContainer) {
  form.onsubmit = async (e) => {
      e.preventDefault();
      errorDiv.style.display = 'none';
      if (localStorage.getItem('guestbook_submitted') === 'yes') {
          errorDiv.textContent = 'You have already signed the guestbook from this browser!';
          errorDiv.style.display = 'block';
          return;
      }
      const name = form['guestbook-name'].value.trim();
      let message = form['guestbook-message'].value.trim();
      const captcha = captchaInput.value.trim();
      if (captcha !== captchaAnswer) {
          errorDiv.textContent = 'Captcha incorrect!';
          errorDiv.style.display = 'block';
          randomizeCaptcha();
          return;
      }
      if (!name || !message) {
          errorDiv.textContent = 'Please fill in all fields.';
          errorDiv.style.display = 'block';
          return;
      }
      if (containsBadLink(message) || containsProfanity(message)) {
          errorDiv.textContent = "Please don't post bad stuff in here!";
          errorDiv.style.display = 'block';
          return;
      }
      message = filterMessage(message);
      try {
          await addDoc(collection(db, 'guestbook'), {
              name,
              message,
              created: serverTimestamp()
          });
          localStorage.setItem('guestbook_submitted', 'yes');
          modal.style.display = 'none';
          form.reset();
      } catch (err) {
          errorDiv.textContent = 'Error saving message.';
          errorDiv.style.display = 'block';
      }
  };
}
// --- Guestbook message display logic ---
let guestbookMessages = [];
let shuffledMessages = [];
let currentStart = 0;
let lastMessageIds = [];
const maxVisible = 3;
const cycleInterval = 4000;
let cycleTimer = null;
function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
function getLoopedMessages(start, count, arr) {
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(arr[(start + i) % arr.length]);
    }
    return result;
}
function renderGuestbookToasts() {
    toastContainer.innerHTML = '';
    if (shuffledMessages.length === 0) return;
    const visible = getLoopedMessages(currentStart, Math.min(maxVisible, shuffledMessages.length), shuffledMessages);
    visible.forEach((msg, idx) => {
        const toast = document.createElement('div');
        toast.className = 'guestbook-toast';
        toast.style.background = '#fff';
        toast.style.color = '#1976d2';
        toast.style.borderRadius = '10px';
        toast.style.boxShadow = '0 2px 12px rgba(0,0,0,0.10)';
        toast.style.padding = '12px 18px';
        toast.style.fontSize = '1rem';
        toast.style.maxWidth = '320px';
        toast.style.minWidth = '40px';
        toast.style.display = 'inline-block';
        toast.style.wordBreak = 'break-word';
        toast.style.width = 'fit-content';
        toast.style.margin = '0 0 0 0';
        toast.style.opacity = '0';
        toast.innerHTML = `<b>${msg.name}</b>: ${msg.message}`;
        toast.style.transform = 'translateY(30px)';
        toastContainer.appendChild(toast);
        void toast.offsetHeight;
        setTimeout(() => {
            toast.style.opacity = (idx === 0 && visible.length === maxVisible) ? '0.5' : '0.97';
            toast.style.transform = 'translateY(0)';
        }, 10);
    });
}
function startGuestbookCycle() {
    if (cycleTimer) clearInterval(cycleTimer);
    if (shuffledMessages.length > 1) {
        cycleTimer = setInterval(() => {
            currentStart = (currentStart + 1) % shuffledMessages.length;
            if (currentStart === 0) {
                shuffledMessages = shuffleArray(guestbookMessages);
            }
            renderGuestbookToasts();
        }, cycleInterval);
    }
}
const q = query(collection(db, 'guestbook'), orderBy('created', 'desc'), limit(10));
onSnapshot(q, (snapshot) => {
    const newMessages = [];
    const newIds = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.name && data.message) {
            newMessages.push({ name: data.name, message: data.message, _id: doc.id });
            newIds.push(doc.id);
        }
    });
    newMessages.reverse();
    let newMsgObj = null;
    if (lastMessageIds.length > 0 && newIds.length > lastMessageIds.length) {
        for (let i = 0; i < newIds.length; i++) {
            if (!lastMessageIds.includes(newIds[i])) {
                newMsgObj = newMessages.find(m => m._id === newIds[i]);
                break;
            }
        }
    }
    guestbookMessages = newMessages.map(({_id, ...rest}) => rest);
    if (newMsgObj) {
        shuffledMessages = [ { name: newMsgObj.name, message: newMsgObj.message }, ...shuffleArray(guestbookMessages.filter(m => !(m.name === newMsgObj.name && m.message === newMsgObj.message))) ];
        currentStart = 0;
    } else {
        shuffledMessages = shuffleArray(guestbookMessages);
        currentStart = 0;
    }
    lastMessageIds = newIds;
    renderGuestbookToasts();
    startGuestbookCycle()
  }
);