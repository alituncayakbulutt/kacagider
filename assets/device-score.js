(function () {
  "use strict";

  if (window.KGDeviceScore) return;

  /**
   * KaçaGider Cihaz Skoru — FAZ 1.1
   * İlk adım: Pil Sağlığı puanı.
   *
   * Pil bölümünün toplam cihaz skorundaki ağırlığı: 15/100.
   * Bu fonksiyon önce pili kendi içinde 0–100 arası puanlar.
   * Ağırlıklı cihaz skoru hesabı sonraki adımlarda eklenecek.
   */
  function scoreBattery(rawValue) {
    if (rawValue === null || rawValue === undefined || rawValue === "") {
      return { score: null, label: "Pil bilgisi seçilmedi", reason: "missing" };
    }

    if (String(rawValue) === "service") {
      return {
        score: 35,
        label: "%79 ve altı / servis önerilir",
        reason: "service"
      };
    }

    var health = Number(rawValue);
    if (!Number.isFinite(health)) {
      return { score: null, label: "Geçersiz pil bilgisi", reason: "invalid" };
    }

    health = Math.max(0, Math.min(100, Math.round(health)));

    var score;
    var label;
    var reason;

    if (health >= 95) {
      score = 100;
      label = "Mükemmel pil sağlığı";
      reason = "excellent";
    } else if (health >= 90) {
      score = 92;
      label = "Çok iyi pil sağlığı";
      reason = "very_good";
    } else if (health >= 85) {
      score = 82;
      label = "İyi pil sağlığı";
      reason = "good";
    } else if (health >= 80) {
      score = 68;
      label = "Orta pil sağlığı";
      reason = "average";
    } else {
      score = 35;
      label = "Pil servisi önerilir";
      reason = "service";
    }

    return {
      score: score,
      health: health,
      label: label,
      reason: reason
    };
  }

  window.KGDeviceScore = {
    version: "1.0.0-phase1",
    weights: {
      screen: 30,
      body: 25,
      battery: 15,
      hardware: 15,
      repairHistory: 15
    },
    scoreBattery: scoreBattery
  };
})();
