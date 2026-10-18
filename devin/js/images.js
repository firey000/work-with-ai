// Генерация SVG-иллюстраций товаров (без внешних картинок)
function fan(cx, cy, r, c) {
  let blades = '';
  for (let i = 0; i < 7; i++) {
    blades += `<path d="M${cx} ${cy} q ${r * 0.55} ${-r * 0.2} ${r * 0.8} ${r * 0.25} q ${-r * 0.4} ${-r * 0.05} ${-r * 0.8} ${-r * 0.25}z" fill="${c}" opacity=".85" transform="rotate(${i * 51.4} ${cx} ${cy})"/>`;
  }
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#0d0f12" stroke="#4a4f57" stroke-width="3"/>${blades}<circle cx="${cx}" cy="${cy}" r="${r * 0.22}" fill="#2a2e35" stroke="#5a6069" stroke-width="2"/>`;
}

function productSVG(cat, color = '#2b2f36', variant = 0, accent = '#FF6A00') {
  const bg = ['#f4f6f8', '#eef1f5', '#f6f3ef', '#eef3f1'][variant % 4];
  let s = '';
  const t = variant === 1 ? 'rotate(-8 200 150)' : variant === 2 ? 'scale(.92) translate(17 12)' : '';
  switch (cat) {
    case 'gpu': {
      if (variant === 3) {
        s = `<rect x="40" y="90" width="320" height="120" rx="14" fill="#4b5058"/><rect x="52" y="102" width="296" height="96" rx="8" fill="${color}"/>
        <text x="200" y="158" text-anchor="middle" font-family="Arial" font-weight="700" font-size="22" fill="#cfd4da" letter-spacing="4">BACKPLATE</text>
        <rect x="40" y="210" width="210" height="12" fill="#c9a227"/>`;
      } else {
        s = `<rect x="30" y="85" width="340" height="130" rx="16" fill="${color}" stroke="#555b63" stroke-width="3"/>
        <path d="M30 120 L60 85 M370 180 L340 215" stroke="${accent}" stroke-width="4"/>
        ${fan(95, 150, 48, '#8a9099')}${fan(200, 150, 48, '#8a9099')}${fan(305, 150, 48, '#8a9099')}
        <rect x="60" y="215" width="200" height="12" fill="#c9a227"/><rect x="370" y="100" width="10" height="100" fill="#9aa0a8"/>`;
      }
      break;
    }
    case 'cpu': {
      let pins = '';
      for (let i = 0; i < 11; i++) pins += `<rect x="${118 + i * 15}" y="58" width="6" height="12" fill="#c9a227"/><rect x="${118 + i * 15}" y="230" width="6" height="12" fill="#c9a227"/>`;
      s = `<rect x="100" y="68" width="200" height="164" rx="10" fill="#2e7d32"/><rect x="115" y="80" width="170" height="140" rx="8" fill="#c7ccd2" stroke="#9aa0a8" stroke-width="3"/>
      ${pins}<text x="200" y="140" text-anchor="middle" font-family="Arial" font-weight="800" font-size="26" fill="${color}">${color === '#0071c5' ? 'intel' : 'RYZEN'}</text>
      <text x="200" y="170" text-anchor="middle" font-family="Arial" font-size="13" fill="#555">${color === '#0071c5' ? 'CORE i5' : 'AMD'}</text>`;
      break;
    }
    case 'ram': {
      let chips = '';
      for (let i = 0; i < 8; i++) chips += `<rect x="${62 + i * 36}" y="140" width="26" height="30" rx="3" fill="#15171a"/>`;
      s = `<rect x="40" y="110" width="320" height="90" rx="6" fill="#1b5e20"/>${chips}
      <path d="M40 110 h320 v50 h-320z" fill="${color}"/><path d="M40 110 l20 -18 h280 l20 18z" fill="${color}" opacity=".7"/>
      <rect x="40" y="92" width="320" height="8" fill="url(#rgb)" opacity="${color === '#bfc4ca' ? 1 : 0}"/>
      <text x="200" y="142" text-anchor="middle" font-family="Arial" font-weight="700" font-size="18" fill="${accent}" letter-spacing="3">DDR5</text>
      ${Array.from({ length: 30 }, (_, i) => `<rect x="${50 + i * 10}" y="200" width="6" height="12" fill="#c9a227"/>`).join('')}`;
      break;
    }
    case 'ssd':
      s = `<rect x="40" y="115" width="320" height="70" rx="6" fill="#0f3d2e"/><rect x="60" y="122" width="230" height="56" rx="4" fill="${color}"/>
      <text x="175" y="157" text-anchor="middle" font-family="Arial" font-weight="700" font-size="17" fill="#fff">NVMe M.2</text>
      <rect x="300" y="128" width="40" height="44" rx="3" fill="#22262b"/><circle cx="352" cy="150" r="7" fill="#f4f6f8" stroke="#888"/>
      ${Array.from({ length: 10 }, (_, i) => `<rect x="44" y="${120 + i * 6}" width="10" height="3" fill="#c9a227"/>`).join('')}`;
      break;
    case 'motherboard':
      s = `<rect x="80" y="40" width="240" height="230" rx="6" fill="${color}"/><rect x="170" y="70" width="70" height="70" rx="4" fill="#9aa0a8"/><rect x="180" y="80" width="50" height="50" fill="#c7ccd2"/>
      ${[0, 1, 2, 3].map(i => `<rect x="${256 + i * 12}" y="60" width="7" height="110" fill="#111"/>`).join('')}
      <rect x="100" y="180" width="200" height="12" fill="#111"/><rect x="100" y="215" width="200" height="12" fill="#111"/>
      <rect x="95" y="60" width="60" height="90" rx="4" fill="#3d434b"/><path d="M95 60 h60 v20 h-60z" fill="${accent}" opacity=".8"/>`;
      break;
    case 'psu':
      s = `<rect x="70" y="60" width="260" height="180" rx="10" fill="${color}" stroke="#555" stroke-width="3"/>
      <circle cx="200" cy="150" r="70" fill="#0d0f12" stroke="#444" stroke-width="3"/>
      ${[20, 35, 50, 65].map(r => `<circle cx="200" cy="150" r="${r}" fill="none" stroke="#3a3f47" stroke-width="3"/>`).join('')}
      <path d="M130 150 h140 M200 80 v140" stroke="#3a3f47" stroke-width="3"/><text x="300" y="232" text-anchor="end" font-family="Arial" font-weight="700" font-size="14" fill="${accent}">80+</text>`;
      break;
    case 'case':
      s = `<rect x="110" y="30" width="180" height="250" rx="10" fill="${color}" stroke="#555" stroke-width="3"/>
      <rect x="125" y="45" width="150" height="220" rx="6" fill="#1f2a38" opacity=".9"/>
      ${fan(200, 95, 32, '#7c4dff')}${fan(200, 170, 32, '#7c4dff')}<rect x="140" y="215" width="120" height="30" rx="4" fill="#2b2f36"/>
      <text x="200" y="236" text-anchor="middle" font-family="monospace" font-size="18" fill="${accent}">42°C</text>`;
      break;
    case 'monitor':
      s = `<rect x="40" y="40" width="320" height="190" rx="10" fill="${color}"/>
      <rect x="50" y="50" width="300" height="168" rx="4" fill="url(#scr)"/>
      <path d="M180 230 h40 l10 35 h-60z" fill="#3a3d42"/><rect x="130" y="262" width="140" height="10" rx="5" fill="#3a3d42"/>`;
      break;
    case 'keyboard': {
      let keys = '';
      for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) keys += `<rect x="${42 + c * 23}" y="${108 + r * 20}" width="19" height="16" rx="3" fill="#3a3d42" stroke="${r === 0 && c < 4 ? accent : '#4a4e55'}"/>`;
      s = `<rect x="30" y="96" width="340" height="120" rx="10" fill="${color}"/>${keys}<rect x="30" y="214" width="340" height="4" fill="url(#rgb)"/>`;
      break;
    }
    case 'mouse':
      s = `<path d="M200 50 C 270 50 285 120 285 170 C 285 240 245 270 200 270 C 155 270 115 240 115 170 C 115 120 130 50 200 50 Z" fill="${color}" stroke="#999" stroke-width="3"/>
      <path d="M200 50 V140" stroke="#999" stroke-width="3"/><rect x="192" y="80" width="16" height="34" rx="8" fill="#555"/>
      <path d="M150 230 Q200 250 250 230" stroke="${accent}" stroke-width="4" fill="none"/>`;
      break;
    case 'headset':
      s = `<path d="M110 180 C 110 60 290 60 290 180" stroke="${color}" stroke-width="18" fill="none"/>
      <rect x="85" y="160" width="60" height="90" rx="26" fill="${color}" stroke="#555" stroke-width="3"/><rect x="255" y="160" width="60" height="90" rx="26" fill="${color}" stroke="#555" stroke-width="3"/>
      <path d="M115 230 Q 130 280 190 275" stroke="#555" stroke-width="5" fill="none"/><circle cx="192" cy="275" r="7" fill="${accent}"/>`;
      break;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img">
  <defs><linearGradient id="rgb" x1="0" x2="1"><stop offset="0" stop-color="#ff004c"/><stop offset=".33" stop-color="#ffb300"/><stop offset=".66" stop-color="#00e5ff"/><stop offset="1" stop-color="#7c4dff"/></linearGradient>
  <linearGradient id="scr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a237e"/><stop offset=".5" stop-color="#7b1fa2"/><stop offset="1" stop-color="#FF6A00"/></linearGradient></defs>
  <rect width="400" height="300" fill="${bg}"/><g transform="${t}">${s}</g></svg>`;
}

function categoryIcon(cat) {
  return productSVG(cat, cat === 'cpu' ? '#e8492f' : '#2b2f36').replace(/<rect width="400" height="300" fill="[^"]+"\/>/, '');
}

function imgTag(cat, color, variant = 0, alt = '', transparent = false) {
  let svg = productSVG(cat, color, variant);
  if (transparent) svg = svg.replace(/<rect width="400" height="300" fill="[^"]+"\/>/, '');
  return `<img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}" alt="${alt.replace(/"/g, '')}">`;
}
