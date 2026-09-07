(function () {
  "use strict";

  if (window.KGDeviceScore) return;

  /**
   * KaçaGider Cihaz Skoru — FAZ 1.1
   *
   * Ağırlıklar:
   * - Ekran: 30/100
   * - Kasa + arka cam: 25/100
   * - Pil: 15/100
   * - Donanım / Face ID: 15/100
   * - Değişen parça / işlem geçmişi: 15/100
   *
   * Her alt fonksiyon önce ilgili alanı 0–100 arasında puanlar.
   * Toplam ağırlıklı cihaz skoru daha sonraki adımlarda eklenecek.
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

  function scoreScreenCondition(rawValue) {
    if (rawValue === null || rawValue === undefined || rawValue === "") {
      return { score: null, label: "Ekran durumu seçilmedi", reason: "missing" };
    }

    var config = {
      original: {
        score: 100,
        label: "Orijinal ve temiz ekran",
        reason: "original_clean"
      },
      scratch: {
        score: 82,
        label: "Orijinal fakat çizikli ekran",
        reason: "original_scratched"
      },
      aftermarket: {
        score: 55,
        label: "Yan sanayi ekran",
        reason: "aftermarket"
      },
      broken: {
        score: 15,
        label: "Kırık ekran",
        reason: "broken"
      }
    };

    var result = config[String(rawValue)];
    if (!result) {
      return { score: null, label: "Geçersiz ekran durumu", reason: "invalid" };
    }

    return {
      score: result.score,
      label: result.label,
      reason: result.reason
    };
  }

  window.KGDeviceScore = {
    version: "1.0.1-phase1",
    weights: {
      screen: 30,
      body: 25,
      battery: 15,
      hardware: 15,
      repairHistory: 15
    },
    scoreBattery: scoreBattery,
    scoreScreenCondition: scoreScreenCondition
  };
})();
