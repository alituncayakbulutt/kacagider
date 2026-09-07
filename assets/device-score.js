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
   * Bu dosya mevcut değerleme formundaki verileri okuyan bağımsız skor katmanıdır.
   * Fiyat motorunun mevcut kondisyon / fiyat hesaplarını değiştirmez.
   */

  function clampScore(value) {
    return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  }

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

  /**
   * Mevcut formdaki ekranla ilgili bütün seçimleri tek Ekran Skoru'nda birleştirir.
   *
   * input:
   * {
   *   screen: "original|scratch|aftermarket|broken",
   *   scratchCount: "none|1-5|6-15|16+",
   *   scratchDepth: "none|hairline|medium|deep",
   *   pixelIssue: "no|yes",
   *   changedParts: [{part:"screen", quality:"original|aftermarket"}, ...]
   * }
   *
   * Not: changedParts içindeki ekran bilgisi burada sadece ekranın kalite tavanını
   * belirler. Aynı onarım geçmişi FAZ 1'de ayrıca Repair History skorunda da
   * değerlendirileceği için burada ikinci kez sabit puan düşülmez.
   */
  function scoreScreen(input) {
    input = input || {};

    var condition = scoreScreenCondition(input.screen);
    if (condition.score === null) {
      return {
        score: null,
        label: condition.label,
        reason: condition.reason,
        breakdown: []
      };
    }

    var score = condition.score;
    var breakdown = [
      {
        key: "screenCondition",
        label: condition.label,
        impact: 0,
        value: input.screen
      }
    ];

    var countPenalty = {
      none: 0,
      "1-5": 4,
      "6-15": 10,
      "16+": 18
    }[String(input.scratchCount || "none")] || 0;

    if (countPenalty) {
      score -= countPenalty;
      breakdown.push({
        key: "scratchCount",
        label: "Ekran çizik sayısı: " + String(input.scratchCount),
        impact: -countPenalty,
        value: input.scratchCount
      });
    }

    var depthPenalty = {
      none: 0,
      hairline: 3,
      medium: 9,
      deep: 18
    }[String(input.scratchDepth || "none")] || 0;

    if (depthPenalty) {
      score -= depthPenalty;
      breakdown.push({
        key: "scratchDepth",
        label: "Çizik derinliği: " + ({hairline:"kılcal",medium:"orta",deep:"derin"}[input.scratchDepth] || input.scratchDepth),
        impact: -depthPenalty,
        value: input.scratchDepth
      });
    }

    if (String(input.pixelIssue || "no") === "yes") {
      score -= 25;
      breakdown.push({
        key: "pixelIssue",
        label: "Piksel atması var",
        impact: -25,
        value: "yes"
      });
    }

    var changedParts = Array.isArray(input.changedParts) ? input.changedParts : [];
    var changedScreen = changedParts.find(function (item) {
      return item && item.part === "screen";
    });

    if (changedScreen) {
      var quality = String(changedScreen.quality || "");
      var qualityCap = quality === "aftermarket" ? 55 : quality === "original" ? 88 : null;

      if (qualityCap !== null && score > qualityCap) {
        var capImpact = qualityCap - score;
        score = qualityCap;
        breakdown.push({
          key: "changedScreen",
          label: quality === "aftermarket" ? "Değişmiş ekran: yan sanayi" : "Değişmiş ekran: orijinal",
          impact: capImpact,
          value: quality
        });
      } else if (qualityCap !== null) {
        breakdown.push({
          key: "changedScreen",
          label: quality === "aftermarket" ? "Değişmiş ekran: yan sanayi" : "Değişmiş ekran: orijinal",
          impact: 0,
          value: quality
        });
      }
    }

    score = clampScore(score);

    var label;
    if (score >= 90) label = "Mükemmel ekran";
    else if (score >= 80) label = "Çok iyi ekran";
    else if (score >= 70) label = "İyi ekran";
    else if (score >= 55) label = "Orta ekran";
    else if (score >= 35) label = "Yıpranmış ekran";
    else label = "Ağır kusurlu ekran";

    return {
      score: score,
      label: label,
      reason: "calculated",
      breakdown: breakdown
    };
  }

  window.KGDeviceScore = {
    version: "1.1.0-phase1",
    weights: {
      screen: 30,
      body: 25,
      battery: 15,
      hardware: 15,
      repairHistory: 15
    },
    scoreBattery: scoreBattery,
    scoreScreenCondition: scoreScreenCondition,
    scoreScreen: scoreScreen
  };
})();
