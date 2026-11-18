
const video = document.querySelector("#webcam");
const canvas = document.querySelector("#overlay");
const ctx = canvas.getContext("2d");
const startButton = document.querySelector("#startButton");
const resetButton = document.querySelector("#resetButton");
const placeholder = document.querySelector("#placeholder");
const statusEl = document.querySelector("#status");
const errorEl = document.querySelector("#error");
const polaroidControls = document.querySelector("#polaroidControls");
const snapshotButton = document.querySelector("#snapshotButton");
const polaroidResult = document.querySelector("#polaroidResult");
const polaroidPhoto = document.querySelector("#polaroidPhoto");
const cameraFlash = document.querySelector("#cameraFlash");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
let activeFilter = "birthday";

const cake = new Image();
cake.src = "./assets/pink-birthday-cake.png";
const capybaraEars = new Image(); capybaraEars.src = "./assets/capybara-ears.png";
const capybaraFlower = new Image(); capybaraFlower.src = "./assets/capybara-flower.png";
const capybaraWink = new Image(); capybaraWink.src = "./assets/capybara-wink.png";

let landmarker;
let stream;
let running = false;
let candleOut = false;
let puckerStartedAt = null;
let lastVideoTime = -1;
let lastStatus = "Wajah belum terdeteksi";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function setStatus(message) {
  if (message !== lastStatus) {
    statusEl.textContent = message;
    lastStatus = message;
  }
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
}

function getBlendshapeScore(result, names) {
  const categories = result.faceBlendshapes?.[0]?.categories || [];
  for (const name of names) {
    const item = categories.find(category => category.categoryName === name);
    if (item) return item.score;
  }
  return 0;
}

function drawCurvedBirthdayText(ctx, centerX, centerY, radius, roll, fontSize) {
  const text = "HAPPY BIRTHDAY";
  const chars = [...text].reverse();

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(roll);

  ctx.font = `700 ${fontSize}px Georgia, "Times New Roman", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";

  const spacing = fontSize * 0.12;
  const widths = chars.map(char => ctx.measureText(char).width);
  const totalWidth = widths.reduce((sum, width) => sum + width, 0)
    + spacing * (chars.length - 1);

  let position = -totalWidth / 2;

  for (let i = 0; i < chars.length; i++) {
    const middle = position + widths[i] / 2;
    const angle = middle / Math.max(radius, 1);

    ctx.save();
    ctx.rotate(angle);
    ctx.translate(0, -radius);
    ctx.scale(-1, 1);
    ctx.rotate(-angle * 0.18);

    ctx.lineWidth = Math.max(2, fontSize * 0.065);
    ctx.strokeStyle = "rgba(112, 61, 79, .30)";
    ctx.fillStyle = "#fff5f7";

    ctx.strokeText(chars[i], 0, 0);
    ctx.fillText(chars[i], 0, 0);

    ctx.restore();
    position += widths[i] + spacing;
  }

  ctx.restore();
}

function drawCapybaraFilter(face, px, faceWidth, faceHeight, headTop, mouthMid, roll) {
  const leftSide = px(face[234]);
  const rightSide = px(face[454]);

  // Ambil posisi kedua mata sebagai acuan kepala.
  const eyeL = px(face[33]);
  const eyeR = px(face[263]);

  // Titik tengah kedua mata.
  const eyeCenter = {
    x: (eyeL.x + eyeR.x) / 2,
    y: (eyeL.y + eyeR.y) / 2
  };

  // Arah garis mata.
  const dx = eyeR.x - eyeL.x;
  const dy = eyeR.y - eyeL.y;
  const eyeDistance = Math.hypot(dx, dy) || 1;

  // Vektor yang mengarah ke atas kepala.
  const upX = dy / eyeDistance;
  const upY = -dx / eyeDistance;

  // Posisi telinga mengikuti kemiringan kepala.
  const earDistance = faceHeight * 1;

  const earX = eyeCenter.x + upX * earDistance;
  const earY = eyeCenter.y + upY * earDistance;

  const earWidth = faceWidth * 2;
  const earHeight = earWidth *
    (capybaraEars.naturalHeight /
    Math.max(capybaraEars.naturalWidth, 1));

  ctx.save();
  ctx.translate(earX, earY);
  ctx.rotate(roll);

  if (capybaraEars.complete && capybaraEars.naturalWidth) {
    ctx.drawImage(
      capybaraEars,
      -earWidth / 2,
      -earHeight * 0.45,
      earWidth,
      earHeight
    );
  }

  ctx.restore();

  

 // Posisi stiker di ujung wajah.
 // Titik sisi luar wajah, bukan titik mata.
const stickerLeft = px(face[234]);
const stickerRight = px(face[454]);

const stickerWidth = faceWidth * 0.40;

// Stiker kiri: sedikit masuk ke area wajah.
if (capybaraFlower.complete && capybaraFlower.naturalWidth) {
  const sw = stickerWidth;
  const sh = sw * capybaraFlower.naturalHeight /
    capybaraFlower.naturalWidth;

  ctx.save();
  ctx.translate(
    stickerLeft.x + faceWidth * -0.35,
    stickerLeft.y + faceHeight * 0.50
    );
  ctx.rotate(roll);
  ctx.drawImage(capybaraFlower, -sw/2, -sh/2, sw, sh);
  ctx.restore();
  }

// Stiker kanan: sedikit masuk ke area wajah.
if (capybaraWink.complete && capybaraWink.naturalWidth) {
  const sw = stickerWidth;
  const sh = sw * capybaraWink.naturalHeight /
    capybaraWink.naturalWidth;

    ctx.save();
    ctx.translate(
      stickerRight.x - faceWidth * -0.32,
      stickerRight.y + faceHeight * 0.50
    );
  ctx.rotate(roll);
  ctx.drawImage(capybaraWink, -sw/2, -sh/2, sw, sh);
  ctx.restore();
  }
}


function render(result) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (activeFilter === "polaroid") {
    puckerStartedAt = null;
    setStatus("Polaroid mode 📸");
    return;
  }

  const face = result.faceLandmarks?.[0];
  if (!face) {
    puckerStartedAt = null;
    setStatus("Arahkan wajah ke kamera");
    return;
  }

  // Landmark Face Mesh: 10 = dahi atas, 61/291 = sudut bibir,
  // 13/14 = bagian tengah bibir, 33/263 = sudut mata.
  const top = face[10];
  const leftMouth = face[61];
  const rightMouth = face[291];
  const upperLip = face[13];
  const lowerLip = face[14];
  const leftEye = face[33];
  const rightEye = face[263];

  const px = p => ({ x: p.x * w, y: p.y * h });
  const mouthL = px(leftMouth);
  const mouthR = px(rightMouth);
  const mouthMid = { x: (mouthL.x + mouthR.x) / 2, y: (mouthL.y + mouthR.y) / 2 };
  const headTop = px(top);
  const eyeL = px(leftEye);
  const eyeR = px(rightEye);

  const faceWidth = distance(leftEye, rightEye) * w * 1.75;
  const faceHeight = faceWidth * 1.25;
  const roll = Math.atan2(eyeR.y - eyeL.y, eyeR.x - eyeL.x);
  const mouthWidth = distance(leftMouth, rightMouth) * w;
  const mouthHeight = distance(upperLip, lowerLip) * h;

  if (activeFilter === "capybara") {
    puckerStartedAt = null;
    drawCapybaraFilter(face, px, faceWidth, faceHeight, headTop, mouthMid, roll);
    setStatus("Capybara mode 🦫");
    return;
  }

  // MediaPipe blendshapes mengenali ekspresi bibir mengerucut/funnel.
  const pucker = getBlendshapeScore(result, ["mouthPucker", "mouthFunnel"]);
  const roundMouthRatio = mouthHeight / Math.max(mouthWidth, 1);
  const fallbackPucker = (mouthWidth / Math.max(faceWidth, 1) < 0.23) &&
                         (roundMouthRatio > 0.10 && roundMouthRatio < 0.85);
  const blowingPose = pucker > 0.42 || (pucker > 0.25 && fallbackPucker);

  if (!candleOut && blowingPose) {
    if (puckerStartedAt === null) puckerStartedAt = performance.now();
    if (performance.now() - puckerStartedAt > 650) {
      candleOut = true;
      setStatus("Lilin berhasil ditiup!");
    } else {
      setStatus("Gerakan meniup terdeteksi…");
    }
  } else if (!candleOut) {
    puckerStartedAt = null;
    setStatus("Lilin menyala — coba tiup");
  }

  // Kue ditempatkan di bawah bibir dan diskalakan terhadap lebar wajah.
  if (cake.complete && cake.naturalWidth) {
    const cakeWidth = faceWidth * 0.82;
    const cakeHeight = cakeWidth * (cake.naturalHeight / cake.naturalWidth);
    const cakeX = mouthMid.x - cakeWidth / 2;
    const cakeY = mouthMid.y + faceHeight * 0.12;
    ctx.save();
    ctx.translate(mouthMid.x, mouthMid.y + faceHeight * 0.12);
    ctx.rotate(roll);
    ctx.drawImage(cake, -cakeWidth / 2, 0, cakeWidth, cakeHeight);
    ctx.restore();

    // Gambar sumbu dan api secara terpisah agar state menyala/padam benar-benar berubah.
    const candleOriginX = mouthMid.x;
    const candleOriginY = mouthMid.y + faceHeight * 0.12;
    const candleTopY = candleOriginY + cakeHeight * 0.198;
    ctx.save();
    ctx.translate(candleOriginX, candleOriginY);
    ctx.rotate(roll);
    ctx.lineCap = "round";
    ctx.strokeStyle = "#6d493d";
    ctx.lineWidth = Math.max(2, cakeWidth * 0.018);
    ctx.beginPath();
    ctx.moveTo(0, cakeHeight * 0.151);
    ctx.lineTo(0, cakeHeight * 0.198);
    ctx.stroke();

    if (!candleOut) {
      const flicker = Math.sin(performance.now() / 105) * cakeWidth * 0.006;
      const flameY = cakeHeight * 0.105;
      const flameH = cakeHeight * 0.105 + flicker;
      ctx.shadowColor = "rgba(255, 174, 54, .72)";
      ctx.shadowBlur = cakeWidth * 0.055;
      ctx.fillStyle = "#ffad32";
      ctx.beginPath();
      ctx.moveTo(0, flameY - flameH);
      ctx.bezierCurveTo(cakeWidth * 0.075, flameY - flameH * 0.22,
                        cakeWidth * 0.045, flameY + flameH * 0.55,
                        0, flameY + flameH * 0.62);
      ctx.bezierCurveTo(-cakeWidth * 0.05, flameY + flameH * 0.48,
                        -cakeWidth * 0.075, flameY - flameH * 0.20,
                        0, flameY - flameH);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff3b2";
      ctx.beginPath();
      ctx.ellipse(0, flameY + flameH * 0.22, cakeWidth * 0.018, flameH * 0.30, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Tulisan hanya muncul setelah api padam, melengkung di atas kepala.
  if (candleOut) {
    const titleY = headTop.y - faceHeight * -0.70;
    drawCurvedBirthdayText(
      ctx,
      headTop.x,
      titleY,
      faceWidth * 1.8,
      roll,
      clamp(faceWidth * 0.16, 28, 58)
    );
  }
}

function takeSnapshot() {
  if (!running || video.readyState < 2) return;

  const photoCanvas = document.createElement("canvas");
  const photoCtx = photoCanvas.getContext("2d");

  const width = canvas.width;
  const height = canvas.height;

  photoCanvas.width = width;
  photoCanvas.height = height;

  // Menyesuaikan potongan video dengan ukuran pratinjau.
  const videoAspect = video.videoWidth / video.videoHeight;
  const targetAspect = width / height;

  let sx = 0;
  let sy = 0;
  let sw = video.videoWidth;
  let sh = video.videoHeight;

  if (videoAspect > targetAspect) {
    sw = video.videoHeight * targetAspect;
    sx = (video.videoWidth - sw) / 2;
  } else {
    sh = video.videoWidth / targetAspect;
    sy = (video.videoHeight - sh) / 2;
  }

  // Membuat foto sesuai tampilan kamera yang dicerminkan.
  photoCtx.save();
  photoCtx.translate(width, 0);
  photoCtx.scale(-1, 1);

  photoCtx.drawImage(
    video,
    sx, sy, sw, sh,
    0, 0, width, height
  );

  // Menggabungkan overlay AR jika ada.
  photoCtx.drawImage(canvas, 0, 0, width, height);

  photoCtx.restore();

  // Menampilkan hasil foto.
  polaroidPhoto.src = photoCanvas.toDataURL("image/png");
  polaroidResult.hidden = false;

  // Efek flash kamera.
  cameraFlash.classList.remove("active");
  requestAnimationFrame(() => {
    cameraFlash.classList.add("active");
  });

  setStatus("Foto berhasil diambil! 📸");
}

async function setupLandmarker() {
  const { FaceLandmarker, FilesetResolver } = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14");
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
  );
  return FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numFaces: 1,
    outputFaceBlendshapes: true
  });
}

function frame() {
  if (!running) return;
  if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    const result = landmarker.detectForVideo(video, performance.now());
    render(result);
  }
  requestAnimationFrame(frame);
}

filterButtons.forEach(button => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;

  filterButtons.forEach(item => {
    const selected = item === button;
    item.classList.toggle("selected", selected);
    item.setAttribute("aria-pressed", String(selected));
  });

  const filterInfo = {
    birthday: {
      title: "Pink Birthday",
      subtitle: "Senyum, lalu tiup lilinnya!",
      status: "Lilin menyala — coba tiup"
    },
    capybara: {
      title: "Capybara World",
      subtitle: "Pakai telinga capybara dan stiker lucu!",
      status: "Capybara mode 🦫"
    },
    polaroid: {
      title: "Cute Polaroid",
      subtitle: "Abadikan momen lucu kamu!",
      status: "Polaroid mode 📸"
    }
  };

  const info = filterInfo[activeFilter];

  document.querySelector("#filterTitle").textContent = info.title;
  document.querySelector("#filterSubtitle").textContent = info.subtitle;

  resetButton.disabled = !running || activeFilter !== "birthday";

  polaroidControls.hidden = !running || activeFilter !== "polaroid";
  polaroidResult.hidden = true;

  if (running) setStatus(info.status);
}));

startButton.addEventListener("click", async () => {
  errorEl.textContent = "";
  startButton.disabled = true;
  startButton.textContent = "Memuat filter…";
  try {
    if (!landmarker) landmarker = await setupLandmarker();
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1600 } },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
    resizeCanvas();
    placeholder.hidden = true;
    running = true;
    candleOut = false;
    puckerStartedAt = null;

    frame(); // Mulai proses deteksi wajah dan menggambar filter
    resetButton.disabled = activeFilter !== "birthday";
    polaroidControls.hidden = activeFilter !== "polaroid";
    polaroidResult.hidden = true;
    startButton.textContent = "Kamera aktif";
    if (activeFilter === "birthday") {
    setStatus("Lilin menyala — coba tiup");
    } else if (activeFilter === "capybara") {
    setStatus("Capybara mode 🦫");
    } else {
    setStatus("Polaroid mode 📸");
    }
  } catch (error) {
    console.error(error);
    errorEl.textContent = "Tidak bisa mengaktifkan kamera. Pastikan memakai localhost/HTTPS dan izinkan akses kamera.";
    startButton.disabled = false;
    startButton.textContent = "Coba lagi";
  }
});

resetButton.addEventListener("click", () => {
  candleOut = false;
  puckerStartedAt = null;
  if (activeFilter === "birthday") setStatus("Lilin menyala — coba tiup");
});

snapshotButton.addEventListener("click", takeSnapshot);

window.addEventListener("resize", resizeCanvas);
window.addEventListener("beforeunload", () => {
  running = false;
  stream?.getTracks().forEach(track => track.stop());
});


window.stopFilterCamera = () => {
  if (!running) return;
  running = false;
  stream?.getTracks().forEach(t => t.stop());
  stream = null;
  video.srcObject = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  placeholder.hidden = false;
  startButton.disabled = false;
  startButton.textContent = "Aktifkan kamera";
  resetButton.disabled = true;
  polaroidControls.hidden = true;
  polaroidResult.hidden = true;
  setStatus("Kamera belum aktif");
};
