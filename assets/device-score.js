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
      return { score: 35, label: "%79 ve altı / servis önerilir", reason: "service" };
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
      score = 100; label = "Mükemmel pil sağlığı"; reason = "excellent";
    } else if (health >= 90) {
      score = 92; label = "Çok iyi pil sağlığı"; reason = "very_good";
    } else if (health >= 85) {
      score = 82; label = "İyi pil sağlığı"; reason = "good";
    } else if (health >= 80) {
      score = 68; label = "Orta pil sağlığı"; reason = "average";
    } else {
      score = 35; label = "Pil servisi önerilir"; reason = "service";
    }

    return { score: score, health: health, label: label, reason: reason };
  }

  function scoreScreenCondition(rawValue) {
    if (rawValue === null || rawValue === undefined || rawValue === "") {
      return { score: null, label: "Ekran durumu seçilmedi", reason: "missing" };
    }

    var config = {
      original: { score: 100, label: "Orijinal ve temiz ekran", reason: "original_clean" },
      scratch: { score: 82, label: "Orijinal fakat çizikli ekran", reason: "original_scratched" },
      aftermarket: { score: 55, label: "Yan sanayi ekran", reason: "aftermarket" },
      broken: { score: 15, label: "Kırık ekran", reason: "broken" }
    };

    var result = config[String(rawValue)];
    if (!result) {
      return { score: null, label: "Geçersiz ekran durumu", reason: "invalid" };
    }

    return { score: result.score, label: result.label, reason: result.reason };
  }

  function scoreScreen(input) {
    input = input || {};

    var condition = scoreScreenCondition(input.screen);
    if (condition.score === null) {
      return { score: null, label: condition.label, reason: condition.reason, breakdown: [] };
    }

    var score = condition.score;
    var breakdown = [{
      key: "screenCondition",
      label: condition.label,
      impact: 0,
      value: input.screen
    }];

    var countPenalty = {
      none: 0,
      "1-5": 4,
      "6-15": 10,
      "16+": 18
    }[String(input.scratchCount || "none")] || 0;

    if (countPenalty) {
      score -= countPenalty;
      breakdown.push({ key: "scratchCount", label: "Ekran çizik sayısı: " + String(input.scratchCount), impact: -countPenalty, value: input.scratchCount });
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
      breakdown.push({ key: "pixelIssue", label: "Piksel atması var", impact: -25, value: "yes" });
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

    return { score: score, label: label, reason: "calculated", breakdown: breakdown };
  }

  /**
   * Mevcut kasa alanlarını tek Kasa + Arka Cam skorunda birleştirir.
   * input:
   * {
   *   dent: "none|light|medium|serious",
   *   surface: "clean|caseMark|lightScratch|manyScratch",
   *   corners: "clean|light|clear",
   *   backGlass: "clean|hairline|crack|broken",
   *   changedParts: [{part:"body|backglass", quality:"original|aftermarket"}, ...]
   * }
   */
  function scoreBody(input) {
    input = input || {};

    var score = 100;
    var breakdown = [];

    var dentPenalty = {
      none: 0,
      light: 8,
      medium: 20,
      serious: 38
    }[String(input.dent || "none")] || 0;

    if (dentPenalty) {
      score -= dentPenalty;
      breakdown.push({
        key: "dent",
        label: "Kasa ezik / darbe: " + ({light:"hafif",medium:"orta",serious:"ciddi"}[input.dent] || input.dent),
        impact: -dentPenalty,
        value: input.dent
      });
    }

    var surfacePenalty = {
      clean: 0,
      caseMark: 3,
      lightScratch: 8,
      manyScratch: 18
    }[String(input.surface || "clean")] || 0;

    if (surfacePenalty) {
      score -= surfacePenalty;
      breakdown.push({
        key: "surface",
        label: "Kasa yüzeyi: " + ({caseMark:"kılıf izi",lightScratch:"hafif çizik",manyScratch:"çok çizik"}[input.surface] || input.surface),
        impact: -surfacePenalty,
        value: input.surface
      });
    }

    var cornerPenalty = {
      clean: 0,
      light: 7,
      clear: 18
    }[String(input.corners || "clean")] || 0;

    if (cornerPenalty) {
      score -= cornerPenalty;
      breakdown.push({
        key: "corners",
        label: "Köşeler: " + ({light:"hafif ezik",clear:"belirgin ezik"}[input.corners] || input.corners),
        impact: -cornerPenalty,
        value: input.corners
      });
    }

    var backGlassPenalty = {
      clean: 0,
      hairline: 5,
      crack: 28,
      broken: 45
    }[String(input.backGlass || "clean")] || 0;

    if (backGlassPenalty) {
      score -= backGlassPenalty;
      breakdown.push({
        key: "backGlass",
        label: "Arka cam: " + ({hairline:"kılcal çizik",crack:"çatlak",broken:"kırık"}[input.backGlass] || input.backGlass),
        impact: -backGlassPenalty,
        value: input.backGlass
      });
    }

    var changedParts = Array.isArray(input.changedParts) ? input.changedParts : [];
    var changedBody = changedParts.find(function (item) {
      return item && item.part === "body";
    });
    var changedBackGlass = changedParts.find(function (item) {
      return item && item.part === "backglass";
    });

    if (changedBody) {
      var bodyQuality = String(changedBody.quality || "");
      var bodyCap = bodyQuality === "aftermarket" ? 62 : bodyQuality === "original" ? 85 : null;
      if (bodyCap !== null && score > bodyCap) {
        var bodyImpact = bodyCap - score;
        score = bodyCap;
        breakdown.push({
          key: "changedBody",
          label: bodyQuality === "aftermarket" ? "Değişmiş kasa: yan sanayi" : "Değişmiş kasa: orijinal",
          impact: bodyImpact,
          value: bodyQuality
        });
      }
    }

    if (changedBackGlass) {
      var backQuality = String(changedBackGlass.quality || "");
      var backCap = backQuality === "aftermarket" ? 72 : backQuality === "original" ? 90 : null;
      if (backCap !== null && score > backCap) {
        var backImpact = backCap - score;
        score = backCap;
        breakdown.push({
          key: "changedBackGlass",
          label: backQuality === "aftermarket" ? "Değişmiş arka cam: yan sanayi" : "Değişmiş arka cam: orijinal",
          impact: backImpact,
          value: backQuality
        });
      }
    }

    score = clampScore(score);

    var label;
    if (score >= 90) label = "Mükemmel kasa";
    else if (score >= 80) label = "Çok iyi kasa";
    else if (score >= 70) label = "İyi kasa";
    else if (score >= 55) label = "Orta kasa";
    else if (score >= 35) label = "Yıpranmış kasa";
    else label = "Ağır kusurlu kasa";

    return { score: score, label: label, reason: "calculated", breakdown: breakdown };
  }

  window.KGDeviceScore = {
    version: "1.2.0-phase1",
    weights: {
      screen: 30,
      body: 25,
      battery: 15,
      hardware: 15,
      repairHistory: 15
    },
    scoreBattery: scoreBattery,
    scoreScreenCondition: scoreScreenCondition,
    scoreScreen: scoreScreen,
    scoreBody: scoreBody
  };
})();
