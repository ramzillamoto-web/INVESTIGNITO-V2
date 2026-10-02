const PImage = require('pureimage');
const { GIFEncoder, quantize, applyPalette } = require('gifenc');
const fs = require('fs');
const path = require('path');

// Load font
const font = PImage.registerFont('/usr/share/fonts/truetype/freefont/FreeSansBold.ttf', 'FreeSansBold');
font.loadSync();

const WIDTH = 520;
const HEIGHT = 292;

function drawRoundedRect(ctx, x, y, w, h, r, fill, stroke, strokeWidth = 1) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }
}

function drawCursor(ctx, x, y) {
  ctx.fillStyle = '#facc15'; // yellow cursor matching user video
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 12, y + 12);
  ctx.lineTo(x + 6, y + 13);
  ctx.lineTo(x + 9, y + 20);
  ctx.lineTo(x + 6, y + 21);
  ctx.lineTo(x + 3, y + 14);
  ctx.lineTo(x, y + 17);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function createGifFromFrames(frames, outputPath, delay = 600) {
  const gif = GIFEncoder();
  for (const img of frames) {
    const data = new Uint8Array(WIDTH * HEIGHT * 4);
    // Copy pixels from pureimage buffer
    for (let i = 0; i < WIDTH * HEIGHT; i++) {
      data[i * 4 + 0] = img.data[i * 4 + 0];
      data[i * 4 + 1] = img.data[i * 4 + 1];
      data[i * 4 + 2] = img.data[i * 4 + 2];
      data[i * 4 + 3] = img.data[i * 4 + 3];
    }
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);
    gif.writeFrame(index, WIDTH, HEIGHT, { palette, delay });
  }
  gif.finish();
  fs.writeFileSync(outputPath, Buffer.from(gif.bytes()));
  console.log(`Generated GIF: ${outputPath} (${fs.statSync(outputPath).size} bytes)`);
}

// -------------------------------------------------------------
// STEP 1: SEQUENTIAL CLUE ENGINE
// -------------------------------------------------------------
function generateStep1() {
  const clues = [
    '#1  NAME LENGTH >= 6 (CROSS IF <= 5)',
    '#2  NAME CONTAINS NO "E" / "E" (CROSS IF HAS E)',
    '#3  NAME STARTS WITH M, G, OR R',
    '#4  NAME ENDS WITH CONSONANT (CROSS IF ENDS IN VOWEL/Y)',
    '#5  NAME LENGTH === 6 LETTERS',
    '#6  REGISTRY PAGE IS EVEN (2, 4, 6, 8, 10)',
    '#7  NAME CONTAINS LETTER U',
  ];

  const cursorPositions = [
    { x: 340, y: 55, activeIdx: 0 },
    { x: 360, y: 92, activeIdx: 1 },
    { x: 380, y: 130, activeIdx: 2 },
    { x: 390, y: 168, activeIdx: 3 },
    { x: 340, y: 206, activeIdx: 4 },
    { x: 370, y: 244, activeIdx: 5 },
  ];

  const frames = cursorPositions.map((pos) => {
    const img = PImage.make(WIDTH, HEIGHT);
    const ctx = img.getContext('2d');

    // Background
    ctx.fillStyle = '#07070a';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Header container
    drawRoundedRect(ctx, 15, 10, WIDTH - 30, 272, 8, '#0d0d12', '#b91c1c', 1.5);

    // Title bar
    ctx.fillStyle = '#ef4444';
    ctx.font = '10pt FreeSansBold';
    ctx.fillText('SEQUENTIAL CLUE ENGINE', 30, 30);

    ctx.fillStyle = '#737373';
    ctx.font = '7pt FreeSansBold';
    ctx.fillText('9 SEQUENTIAL DEDUCTIONS • ALL CLUES', 230, 29);

    // Draw Clue Cards
    clues.forEach((text, i) => {
      const cy = 40 + i * 32;
      const isHover = i === pos.activeIdx;
      drawRoundedRect(
        ctx,
        25,
        cy,
        WIDTH - 50,
        28,
        4,
        isHover ? '#181216' : '#0a0a0e',
        isHover ? '#ef4444' : '#262626',
        isHover ? 1.5 : 1
      );

      // Red tag number box
      drawRoundedRect(ctx, 30, cy + 4, 26, 20, 3, isHover ? '#ef4444' : '#262626', null);
      ctx.fillStyle = isHover ? '#ffffff' : '#ef4444';
      ctx.font = '8pt FreeSansBold';
      ctx.fillText(`#${i + 1}`, 35, cy + 18);

      // Clue text
      ctx.fillStyle = isHover ? '#ffffff' : '#d4d4d4';
      ctx.font = '7.5pt FreeSansBold';
      ctx.fillText(text.substring(4), 65, cy + 18);
    });

    // Draw Cursor
    drawCursor(ctx, pos.x, pos.y);

    return img;
  });

  createGifFromFrames(frames, 'public/assets/step1.gif', 650);
}

// -------------------------------------------------------------
// STEP 2: REGISTRY LEDGER TOOLS (CROSS, CIRCLE, ERASER)
// -------------------------------------------------------------
function generateStep2() {
  const suspects = [
    { name: 'DESMOND', status: 'normal' },
    { name: 'HERCULE', status: 'xout' },
    { name: 'LYNDON', status: 'normal' },
    { name: 'FITZGERALD', status: 'normal' },
    { name: 'HOWARD', status: 'normal' },
    { name: 'RAYMOND', status: 'normal' },
    { name: 'CALLUM', status: 'normal' },
    { name: 'CLARK', status: 'normal' },
    { name: 'ISIDORE', status: 'normal' },
    { name: 'HUME', status: 'normal' },
    { name: 'HECTOR', status: 'circle' },
    { name: 'GARRIEN', status: 'normal' },
    { name: 'CASPER', status: 'normal' },
    { name: 'ELDON', status: 'circle' },
    { name: 'ABEL', status: 'xout' },
    { name: 'LLOYD', status: 'circle' },
  ];

  const states = [
    {
      activeTool: 'red',
      remaining: 600,
      cursor: { x: 185, y: 105 },
      statuses: { HERCULE: 'xout', HECTOR: 'normal', ELDON: 'normal', ABEL: 'normal' },
      actionText: '1. Click RED X TOOL to eliminate HERCULE',
    },
    {
      activeTool: 'orange',
      remaining: 599,
      cursor: { x: 350, y: 175 },
      statuses: { HERCULE: 'xout', HECTOR: 'circle', ELDON: 'normal', ABEL: 'normal' },
      actionText: '2. Switch to CIRCLE TOOL to target HECTOR',
    },
    {
      activeTool: 'orange',
      remaining: 599,
      cursor: { x: 220, y: 245 },
      statuses: { HERCULE: 'xout', HECTOR: 'circle', ELDON: 'circle', ABEL: 'normal' },
      actionText: '3. Mark ELDON as key candidate',
    },
    {
      activeTool: 'red',
      remaining: 598,
      cursor: { x: 350, y: 245 },
      statuses: { HERCULE: 'xout', HECTOR: 'circle', ELDON: 'circle', ABEL: 'xout' },
      actionText: '4. Switch to X TOOL to eliminate ABEL (597 LEFT)',
    },
  ];

  const frames = states.map((st) => {
    const img = PImage.make(WIDTH, HEIGHT);
    const ctx = img.getContext('2d');

    // Background
    ctx.fillStyle = '#07070a';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Ledger Outer Box
    drawRoundedRect(ctx, 12, 8, WIDTH - 24, 276, 8, '#0b0b0f', '#26262e', 1);

    // Top Tool Bar
    drawRoundedRect(ctx, 22, 16, WIDTH - 44, 38, 6, '#121218', '#383842', 1);

    // Red X Button
    const isRed = st.activeTool === 'red';
    drawRoundedRect(ctx, 30, 21, 100, 28, 4, isRed ? '#dc2626' : '#1f1f26', isRed ? '#ef4444' : '#33333d');
    ctx.fillStyle = '#ffffff';
    ctx.font = '8pt FreeSansBold';
    ctx.fillText('✕ X TOOL', 45, 39);

    // Orange Circle Button
    const isOrange = st.activeTool === 'orange';
    drawRoundedRect(ctx, 138, 21, 100, 28, 4, isOrange ? '#d97706' : '#1f1f26', isOrange ? '#f59e0b' : '#33333d');
    ctx.fillStyle = '#ffffff';
    ctx.font = '8pt FreeSansBold';
    ctx.fillText('○ CIRCLE', 152, 39);

    // Eraser Button
    drawRoundedRect(ctx, 246, 21, 95, 28, 4, '#1f1f26', '#33333d');
    ctx.fillStyle = '#9ca3af';
    ctx.font = '8pt FreeSansBold';
    ctx.fillText('⌫ ERASER', 258, 39);

    // Remaining Counter Pill
    drawRoundedRect(ctx, 360, 23, 125, 24, 4, '#1c1917', '#7f1d1d');
    ctx.fillStyle = '#ef4444';
    ctx.font = '8pt FreeSansBold';
    ctx.fillText(`✕ 3  •  ${st.remaining} LEFT`, 370, 39);

    // Suspect Grid (4 columns x 4 rows visible)
    suspects.forEach((sus, idx) => {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const x = 22 + col * 118;
      const y = 62 + row * 46;
      const status = st.statuses[sus.name] || sus.status;

      let cardBg = '#111116';
      let cardBorder = '#26262e';
      if (status === 'xout') {
        cardBg = '#181012';
        cardBorder = '#ef4444';
      } else if (status === 'circle') {
        cardBg = '#1b140c';
        cardBorder = '#f59e0b';
      }

      drawRoundedRect(ctx, x, y, 112, 40, 4, cardBg, cardBorder, status !== 'normal' ? 1.5 : 1);

      // Coordinate
      ctx.fillStyle = '#6b7280';
      ctx.font = '6pt FreeSansBold';
      ctx.fillText(`R${row + 1}:C${col + 1}`, x + 6, y + 14);

      // Status indicator tag
      if (status === 'circle') {
        drawRoundedRect(ctx, x + 50, y + 4, 56, 12, 2, '#f59e0b', null);
        ctx.fillStyle = '#000000';
        ctx.font = '5.5pt FreeSansBold';
        ctx.fillText('★ TARGET', x + 54, y + 13);
      } else if (status === 'xout') {
        drawRoundedRect(ctx, x + 60, y + 4, 46, 12, 2, '#dc2626', null);
        ctx.fillStyle = '#ffffff';
        ctx.font = '5.5pt FreeSansBold';
        ctx.fillText('✕ OUT', x + 66, y + 13);
      }

      // Suspect Name
      ctx.fillStyle = status === 'xout' ? '#ef4444' : status === 'circle' ? '#fbbf24' : '#e5e7eb';
      ctx.font = '7pt FreeSansBold';
      ctx.fillText(sus.name, x + 6, y + 30);
    });

    // Action banner at bottom
    drawRoundedRect(ctx, 22, 252, WIDTH - 44, 24, 4, '#0f0f15', '#ef4444', 1);
    ctx.fillStyle = '#ffffff';
    ctx.font = '7.5pt FreeSansBold';
    ctx.fillText(st.actionText, 32, 268);

    // Cursor
    drawCursor(ctx, st.cursor.x, st.cursor.y);

    return img;
  });

  createGifFromFrames(frames, 'public/assets/step2.gif', 800);
}

// -------------------------------------------------------------
// STEP 3: NAVIGATING 10 DOSSIER PAGES
// -------------------------------------------------------------
function generateStep3() {
  const pages = [
    {
      page: 1,
      names: ['DESMOND', 'HERCULE', 'LYNDON', 'FITZGERALD', 'HOWARD', 'RAYMOND', 'CALLUM', 'CLARK'],
      cursor: { x: 195, y: 228 },
    },
    {
      page: 2,
      names: ['THOMAS', 'ROGER', 'LEANDER', 'FISKE', 'ARTHUR', 'BRAM', 'GODFREY', 'DEREK'],
      cursor: { x: 225, y: 228 },
    },
    {
      page: 3,
      names: ['BLAINE', 'LINFORD', 'ELLIOTT', 'WARREN', 'LEOPOLD', 'DUSTIN', 'HAWTHORNE', 'BEAUFORT'],
      cursor: { x: 255, y: 228 },
    },
    {
      page: 4,
      names: ['ALPHONSE', 'HARMON', 'IAN', 'MARTIN', 'RODERICK', 'BRUNO', 'LOTHAR', 'SIMON'],
      cursor: { x: 285, y: 228 },
    },
    {
      page: 8,
      names: ['FOWLER', 'LOWELL', 'EBENEZER', 'TRAVIS', 'FREEMAN', 'HARDY', 'EPHRAIM', 'TOM'],
      cursor: { x: 405, y: 228 },
    },
  ];

  const frames = pages.map((p) => {
    const img = PImage.make(WIDTH, HEIGHT);
    const ctx = img.getContext('2d');

    // Background
    ctx.fillStyle = '#07070a';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Box
    drawRoundedRect(ctx, 12, 8, WIDTH - 24, 276, 8, '#0c0c11', '#26262e', 1);

    // Header badge
    drawRoundedRect(ctx, 22, 16, 200, 24, 4, '#171720', '#3b82f6', 1);
    ctx.fillStyle = '#60a5fa';
    ctx.font = '8pt FreeSansBold';
    ctx.fillText(`PAGE ${p.page} SELECTION: 60 SUSPECTS`, 30, 32);

    // Cards Grid (2 rows x 4 cols)
    p.names.forEach((name, idx) => {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const x = 22 + col * 118;
      const y = 48 + row * 62;

      drawRoundedRect(ctx, x, y, 112, 54, 4, '#121218', '#2d2d38', 1);

      ctx.fillStyle = '#6b7280';
      ctx.font = '6pt FreeSansBold';
      ctx.fillText(`PAGE ${p.page} • R${row + 1}:C${col + 1}`, x + 6, y + 16);

      ctx.fillStyle = '#f3f4f6';
      ctx.font = '8pt FreeSansBold';
      ctx.fillText(name, x + 6, y + 36);

      // Mini circle & cross buttons
      drawRoundedRect(ctx, x + 68, y + 26, 16, 16, 2, '#1e1b1b', '#ef4444');
      ctx.fillStyle = '#ef4444';
      ctx.font = '6pt FreeSansBold';
      ctx.fillText('✕', x + 72, y + 38);

      drawRoundedRect(ctx, x + 88, y + 26, 16, 16, 2, '#1e1b14', '#f59e0b');
      ctx.fillStyle = '#f59e0b';
      ctx.font = '6pt FreeSansBold';
      ctx.fillText('○', x + 92, y + 38);
    });

    // Pagination Section at bottom
    drawRoundedRect(ctx, 22, 180, WIDTH - 44, 90, 6, '#08080c', '#1e1e24', 1);

    // Current page pill
    drawRoundedRect(ctx, 30, 192, 175, 26, 4, '#ef4444', null);
    ctx.fillStyle = '#ffffff';
    ctx.font = '7pt FreeSansBold';
    ctx.fillText(`PAGE ${p.page} OF 10 (60 NAMES)`, 38, 209);

    // Page Buttons: 1 2 3 4 5 6 7 8 9 10
    const pageNums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    pageNums.forEach((num, i) => {
      const bx = 220 + i * 27;
      const by = 192;
      const isCur = num === p.page;
      drawRoundedRect(ctx, bx, by, 24, 26, 4, isCur ? '#ffffff' : '#171720', isCur ? '#ffffff' : '#33333f');
      ctx.fillStyle = isCur ? '#000000' : '#9ca3af';
      ctx.font = '7.5pt FreeSansBold';
      ctx.fillText(`${num}`, bx + (num === 10 ? 4 : 8), by + 17);
    });

    // Prompt indicator
    ctx.fillStyle = '#9ca3af';
    ctx.font = '7pt FreeSansBold';
    ctx.fillText('Click any page button (1-10) to cross-reference suspect coordinates', 30, 248);

    // Cursor
    drawCursor(ctx, p.cursor.x, p.cursor.y);

    return img;
  });

  createGifFromFrames(frames, 'public/assets/step3.gif', 750);
}

// -------------------------------------------------------------
// STEP 4: WARRANT & 5-MIN LOCKDOWN PENALTY
// -------------------------------------------------------------
function generateStep4() {
  const steps = [
    {
      stage: 'form',
      cursor: { x: 440, y: 155 },
      text: '1. Entering suspect RAMAZAN and Page 1',
    },
    {
      stage: 'verifying_3',
      cursor: { x: 260, y: 170 },
      text: '2. Verifying Accusation Warrant (3s)...',
    },
    {
      stage: 'verifying_1',
      cursor: { x: 260, y: 170 },
      text: '3. Rapid heartbeat check (1s)...',
    },
    {
      stage: 'rejected',
      cursor: { x: 260, y: 220 },
      text: '4. False Accusation Penalty: 5-Minute Lockout!',
    },
    {
      stage: 'cooldown',
      cursor: { x: 300, y: 250 },
      text: '5. Submission Locked for 04:59',
    },
  ];

  const frames = steps.map((st) => {
    const img = PImage.make(WIDTH, HEIGHT);
    const ctx = img.getContext('2d');

    // Background
    ctx.fillStyle = '#07070a';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Outer container
    drawRoundedRect(ctx, 12, 8, WIDTH - 24, 276, 8, '#0a0a0f', '#26262e', 1);

    if (st.stage === 'form') {
      // Form view
      drawRoundedRect(ctx, 24, 18, WIDTH - 48, 210, 6, '#101017', '#dc2626', 1);

      ctx.fillStyle = '#ef4444';
      ctx.font = '9pt FreeSansBold';
      ctx.fillText('OFFICIAL WARRANT & KILLER ACCUSATION', 35, 40);

      // Suspect input
      ctx.fillStyle = '#9ca3af';
      ctx.font = '7pt FreeSansBold';
      ctx.fillText('CULPRIT / SUSPECT NAME:', 35, 75);
      drawRoundedRect(ctx, 35, 84, 250, 36, 4, '#050508', '#ef4444', 1.5);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10pt FreeSansBold';
      ctx.fillText('RAMAZAN', 45, 107);

      // Page dropdown
      ctx.fillStyle = '#9ca3af';
      ctx.font = '7pt FreeSansBold';
      ctx.fillText('LEDGER PAGE NUMBER:', 305, 75);
      drawRoundedRect(ctx, 305, 84, 175, 36, 4, '#050508', '#383842', 1);
      ctx.fillStyle = '#ffffff';
      ctx.font = '9pt FreeSansBold';
      ctx.fillText('PAGE 1', 318, 107);

      // Submit Button
      drawRoundedRect(ctx, 375, 138, 105, 36, 4, '#dc2626', '#ef4444');
      ctx.fillStyle = '#ffffff';
      ctx.font = '8.5pt FreeSansBold';
      ctx.fillText('SUBMIT', 402, 160);

      drawCursor(ctx, st.cursor.x, st.cursor.y);
    } else if (st.stage === 'verifying_3' || st.stage === 'verifying_1') {
      // Verifying Modal
      drawRoundedRect(ctx, 60, 25, WIDTH - 120, 225, 8, '#0e0e14', '#ef4444', 2);

      // Pulsing heart
      const isLarge = st.stage === 'verifying_1';
      const heartRadius = isLarge ? 28 : 22;
      drawRoundedRect(ctx, 230, 48, 60, 60, 30, '#381014', '#ef4444', 2);
      ctx.fillStyle = '#ef4444';
      ctx.font = `${isLarge ? 22 : 18}pt FreeSansBold`;
      ctx.fillText('♥', 246, 88);

      ctx.fillStyle = '#ef4444';
      ctx.font = '8pt FreeSansBold';
      ctx.fillText(st.stage === 'verifying_3' ? '3s VERIFYING - FAST HEARTBEAT' : '1s VERIFYING - FINAL CHECK', 155, 128);

      ctx.fillStyle = '#ffffff';
      ctx.font = '11pt FreeSansBold';
      ctx.fillText('RAMAZAN', 225, 155);

      ctx.fillStyle = '#9ca3af';
      ctx.font = '7pt FreeSansBold';
      ctx.fillText('REGISTRY LEDGER PAGE #1', 195, 175);

      // Progress bar
      drawRoundedRect(ctx, 90, 195, 340, 10, 5, '#171720', null);
      drawRoundedRect(ctx, 90, 195, st.stage === 'verifying_3' ? 120 : 310, 10, 5, '#ef4444', null);
    } else if (st.stage === 'rejected') {
      // Rejection Popup
      drawRoundedRect(ctx, 60, 25, WIDTH - 120, 225, 8, '#120b0d', '#dc2626', 2);

      // Warning icon
      drawRoundedRect(ctx, 236, 40, 48, 48, 8, '#3b1216', '#ef4444', 1.5);
      ctx.fillStyle = '#ef4444';
      ctx.font = '18pt FreeSansBold';
      ctx.fillText('!', 254, 73);

      ctx.fillStyle = '#ef4444';
      ctx.font = '10pt FreeSansBold';
      ctx.fillText('ACCUSATION REJECTED', 170, 108);

      ctx.fillStyle = '#f87171';
      ctx.font = '7.5pt FreeSansBold';
      ctx.fillText('"THE NAME DID NOT MATCH, TRY AGAIN IN 5 MINUTES"', 95, 130);

      // Cooldown timer box
      drawRoundedRect(ctx, 150, 145, 220, 32, 6, '#1f1315', '#dc2626', 1);
      ctx.fillStyle = '#ef4444';
      ctx.font = '9pt FreeSansBold';
      ctx.fillText('COOLDOWN: 04:59', 195, 166);

      // Return button
      drawRoundedRect(ctx, 160, 190, 200, 28, 4, '#262630', '#404050');
      ctx.fillStyle = '#ffffff';
      ctx.font = '7pt FreeSansBold';
      ctx.fillText('RETURN TO EVIDENCE & CLUES', 178, 208);

      drawCursor(ctx, st.cursor.x, st.cursor.y);
    } else if (st.stage === 'cooldown') {
      // Cooldown banner view
      drawRoundedRect(ctx, 24, 40, WIDTH - 48, 170, 6, '#101017', '#dc2626', 1);

      drawRoundedRect(ctx, 35, 60, WIDTH - 70, 44, 4, '#2a0c0e', '#ef4444', 1.5);
      ctx.fillStyle = '#ef4444';
      ctx.font = '8pt FreeSansBold';
      ctx.fillText('SUBMISSION LOCKED: False accusation penalty active', 50, 86);

      ctx.fillStyle = '#ffffff';
      ctx.font = '14pt FreeSansBold';
      ctx.fillText('04:59', 410, 88);

      ctx.fillStyle = '#9ca3af';
      ctx.font = '7.5pt FreeSansBold';
      ctx.fillText('Inspect the registry clues again to eliminate innocent suspects.', 50, 135);
      ctx.fillText('Re-verify letter lengths, vowels, and seating coordinates.', 50, 155);

      drawCursor(ctx, st.cursor.x, st.cursor.y);
    }

    // Bottom caption
    drawRoundedRect(ctx, 12, 256, WIDTH - 24, 24, 4, '#0c0c11', '#dc2626', 1);
    ctx.fillStyle = '#ef4444';
    ctx.font = '7pt FreeSansBold';
    ctx.fillText(st.text, 25, 272);

    return img;
  });

  createGifFromFrames(frames, 'public/assets/step4.gif', 850);
}

// Run all generations
console.log('Generating GIF step assets from videos...');
generateStep1();
generateStep2();
generateStep3();
generateStep4();
console.log('All 4 animated GIFs generated successfully!');
