// Animated SVG wave inspired by react-wavify

const amplitude = 20; // wave height
const speed = 0.002; // animation speed
const points = 20; // number of control points
const height = 480; // SVG height for foreground
const bgHeight = 560; // SVG height for background
const bgAmplitude = 16; // background wave height
const bgSpeed = 0.001; // animation speed for background wave

function getWaveWidth() {
  const svg = document.getElementById('animated-wave-svg');
  if (svg && svg.parentElement) {
    return svg.parentElement.offsetWidth;
  }
  return window.innerWidth;
}
let width = getWaveWidth();
const waveColor = '#39a0ed';


function generateWavePath(t, amp = amplitude, h = height, phaseOffset = 0, customSpeed = speed) {
  const segmentWidth = width / (points - 1);
  let d = '';
  let pointsArray = [];
  const phaseStep = (2 * Math.PI) / (points - 1);
  for (let i = 0; i < points; i++) {
    const x = i * segmentWidth;
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
  }
  const bgsvg = document.getElementById('background-wave-svg');
  if (bgsvg) {
    bgsvg.setAttribute('viewBox', `0 0 ${width} ${bgHeight}`);
  }
}

function animateWave() {
  const path = document.getElementById('animated-wave-path');
  if (!path) return;
  const now = performance.now();
  path.setAttribute('d', generateWavePath(now));
  requestAnimationFrame(animateWave);
}


function animateBothWaves() {
  const path = document.getElementById('animated-wave-path');
  const bgPath = document.getElementById('background-wave-path');
  const now = performance.now();
  if (path) path.setAttribute('d', generateWavePath(now));
  if (bgPath) bgPath.setAttribute('d', generateWavePath(now, bgAmplitude, bgHeight, Math.PI/2, bgSpeed));
  requestAnimationFrame(animateBothWaves);
}

document.addEventListener('DOMContentLoaded', function() {
  resizeWave();
  animateBothWaves();
  window.addEventListener('resize', resizeWave);
});
