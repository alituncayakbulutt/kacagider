(function () {
  "use strict";

  if (window.KGDeviceScore) return;

  var WEIGHTS = {
    screen: 30,
    body: 25,
    battery: 15,
    hardware: 15,
    repairHistory: 15
  };

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
    if (health >= 95) return { score: 100, health: health, label: "Mükemmel pil sağlığı", reason: "excellent" };
    if (health >= 90) return { score: 92, health: health, label: "Çok iyi pil sağlığı", reason: "very_good" };
    if (health >= 85) return { score: 82, health: health, label: "İyi pil sağlığı", reason: "good" };
    if (health >= 80) return { score: 68, health: health, label: "Orta pil sağlığı", reason: "average" };
    return { score: 35, health: health, label: "Pil servisi önerilir", reason: "service" };
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
    return config[String(rawValue)] || { score: null, label: "Geçersiz ekran durumu", reason: "invalid" };
  }

  function scoreScreen(input) {
    input = input || {};
    var condition = scoreScreenCondition(input.screen);
    if (condition.score === null) return { score: null, label: condition.label, reason: condition.reason, breakdown: [] };

    var score = condition.score;
    var breakdown = [{ key: "screenCondition", label: condition.label, impact: 0, value: input.screen }];
    var countPenalty = { none: 0, "1-5": 4, "6-15": 10, "16+": 18 }[String(input.scratchCount || "none")] || 0;
    if (countPenalty) {
      score -= countPenalty;
      breakdown.push({ key: "scratchCount", label: "Ekran çizik sayısı: " + String(input.scratchCount), impact: -countPenalty, value: input.scratchCount });
    }
    var depthPenalty = { none: 0, hairline: 3, medium: 9, deep: 18 }[String(input.scratchDepth || "none")] || 0;
    if (depthPenalty) {
      score -= depthPenalty;
      breakdown.push({ key: "scratchDepth", label: "Çizik derinliği: " + ({hairline:"kılcal",medium:"orta",deep:"derin"}[input.scratchDepth] || input.scratchDepth), impact: -depthPenalty, value: input.scratchDepth });
    }
    if (String(input.pixelIssue || "no") === "yes") {
      score -= 25;
      breakdown.push({ key: "pixelIssue", label: "Piksel atması var", impact: -25, value: "yes" });
    }
    var changedParts = Array.isArray(input.changedParts) ? input.changedParts : [];
    var changedScreen = changedParts.find(function (item) { return item && item.part === "screen"; });
    if (changedScreen) {
      var quality = String(changedScreen.quality || "");
      var cap = quality === "aftermarket" ? 55 : quality === "original" ? 88 : null;
      if (cap !== null && score > cap) {
        breakdown.push({ key: "changedScreen", label: quality === "aftermarket" ? "Değişmiş ekran: yan sanayi" : "Değişmiş ekran: orijinal", impact: cap - score, value: quality });
        score = cap;
      }
    }
    score = clampScore(score);
    var label = score >= 90 ? "Mükemmel ekran" : score >= 80 ? "Çok iyi ekran" : score >= 70 ? "İyi ekran" : score >= 55 ? "Orta ekran" : score >= 35 ? "Yıpranmış ekran" : "Ağır kusurlu ekran";
    return { score: score, label: label, reason: "calculated", breakdown: breakdown };
  }

  function scoreBody(input) {
    input = input || {};
    var score = 100;
    var breakdown = [];
    var dentPenalty = { none: 0, light: 8, medium: 20, serious: 38 }[String(input.dent || "none")] || 0;
    if (dentPenalty) { score -= dentPenalty; breakdown.push({ key: "dent", label: "Kasa ezik / darbe", impact: -dentPenalty, value: input.dent }); }
    var surfacePenalty = { clean: 0, caseMark: 3, lightScratch: 8, manyScratch: 18 }[String(input.surface || "clean")] || 0;
    if (surfacePenalty) { score -= surfacePenalty; breakdown.push({ key: "surface", label: "Kasa yüzeyi", impact: -surfacePenalty, value: input.surface }); }
    var cornerPenalty = { clean: 0, light: 7, clear: 18 }[String(input.corners || "clean")] || 0;
    if (cornerPenalty) { score -= cornerPenalty; breakdown.push({ key: "corners", label: "Köşeler", impact: -cornerPenalty, value: input.corners }); }
    var backGlassPenalty = { clean: 0, hairline: 5, crack: 28, broken: 45 }[String(input.backGlass || "clean")] || 0;
    if (backGlassPenalty) { score -= backGlassPenalty; breakdown.push({ key: "backGlass", label: "Arka cam", impact: -backGlassPenalty, value: input.backGlass }); }
    var changedParts = Array.isArray(input.changedParts) ? input.changedParts : [];
    var changedBody = changedParts.find(function (item) { return item && item.part === "body"; });
    var changedBackGlass = changedParts.find(function (item) { return item && item.part === "backglass"; });
    if (changedBody) {
      var bodyCap = changedBody.quality === "aftermarket" ? 62 : changedBody.quality === "original" ? 85 : null;
      if (bodyCap !== null && score > bodyCap) { breakdown.push({ key: "changedBody", label: "Değişmiş kasa", impact: bodyCap - score, value: changedBody.quality }); score = bodyCap; }
    }
    if (changedBackGlass) {
      var backCap = changedBackGlass.quality === "aftermarket" ? 72 : changedBackGlass.quality === "original" ? 90 : null;
      if (backCap !== null && score > backCap) { breakdown.push({ key: "changedBackGlass", label: "Değişmiş arka cam", impact: backCap - score, value: changedBackGlass.quality }); score = backCap; }
    }
    score = clampScore(score);
    var label = score >= 90 ? "Mükemmel kasa" : score >= 80 ? "Çok iyi kasa" : score >= 70 ? "İyi kasa" : score >= 55 ? "Orta kasa" : score >= 35 ? "Yıpranmış kasa" : "Ağır kusurlu kasa";
    return { score: score, label: label, reason: "calculated", breakdown: breakdown };
  }

  function scoreHardware(input) {
    input = input || {};
    var faceId = String(input.faceId || "");
    if (!faceId) return { score: null, label: "Donanım bilgisi seçilmedi", reason: "missing", breakdown: [] };
    if (faceId !== "working" && faceId !== "notworking") return { score: null, label: "Geçersiz Face ID bilgisi", reason: "invalid", breakdown: [] };
    var score = faceId === "working" ? 100 : 25;
    return {
      score: score,
      label: faceId === "working" ? "Donanım sorunsuz" : "Donanım sorunu var",
      reason: "calculated",
      breakdown: [{ key: "faceId", label: faceId === "working" ? "Face ID çalışıyor" : "Face ID çalışmıyor", impact: faceId === "working" ? 0 : -75, value: faceId }],
      provisional: true
    };
  }

  function scoreRepairHistory(input) {
    input = input || {};
    var changedParts = Array.isArray(input.changedParts) ? input.changedParts.filter(function (item) { return item && item.part && item.part !== "none"; }) : [];
    if (!changedParts.length) return { score: 100, label: "Değişen parça yok", reason: "original", breakdown: [] };

    var score = 100;
    var breakdown = [];
    var penalties = {
      battery: { original: 6, aftermarket: 14 },
      screen: { original: 10, aftermarket: 24 },
      camera: { original: 12, aftermarket: 22 },
      backglass: { original: 7, aftermarket: 15 },
      body: { original: 9, aftermarket: 18 },
      motherboard: { quality_service: 28, private_service: 42 },
      faceid: { quality_service: 16, private_service: 28 }
    };
    changedParts.forEach(function (item) {
      var cfg = penalties[item.part];
      var penalty = cfg && cfg[item.quality] ? cfg[item.quality] : 0;
      if (!penalty) return;
      score -= penalty;
      breakdown.push({ key: "repair_" + item.part, label: item.part + " işlem geçmişi", impact: -penalty, value: item.quality });
    });
    if (changedParts.length >= 2) {
      var multiPenalty = Math.min(12, (changedParts.length - 1) * 4);
      score -= multiPenalty;
      breakdown.push({ key: "multipleRepairs", label: changedParts.length + " farklı parça / işlem kaydı", impact: -multiPenalty, value: changedParts.length });
    }
    score = clampScore(score);
    var label = score >= 90 ? "Çok temiz işlem geçmişi" : score >= 80 ? "İyi işlem geçmişi" : score >= 65 ? "Orta işlem geçmişi" : score >= 45 ? "Yoğun işlem geçmişi" : "Ağır işlem geçmişi";
    return { score: score, label: label, reason: "calculated", breakdown: breakdown, repairCount: changedParts.length };
  }

  function getDeviceScoreLabel(score) {
    if (score >= 90) return "Mükemmel";
    if (score >= 80) return "Çok İyi";
    if (score >= 70) return "İyi";
    if (score >= 60) return "Orta";
    if (score >= 40) return "Yıpranmış";
    return "Ağır Kusurlu";
  }

  function calculateDeviceScore(input) {
    input = input || {};
    var components = {
      screen: scoreScreen(input),
      body: scoreBody(input),
      battery: scoreBattery(input.battery),
      hardware: scoreHardware({ faceId: input.faceId }),
      repairHistory: scoreRepairHistory(input)
    };

    var missing = Object.keys(components).filter(function (key) {
      return components[key].score === null || components[key].score === undefined;
    });

    if (missing.length) {
      return {
        score: null,
        label: "Skor için eksik bilgi var",
        reason: "missing_inputs",
        missing: missing,
        components: components
      };
    }

    var weighted = Object.keys(WEIGHTS).reduce(function (total, key) {
      return total + (components[key].score * WEIGHTS[key] / 100);
    }, 0);
    var score = clampScore(weighted);

    return {
      score: score,
      label: getDeviceScoreLabel(score),
      reason: "calculated",
      components: components,
      weights: WEIGHTS,
      weightedScore: Number(weighted.toFixed(2))
    };
  }

  window.KGDeviceScore = {
    version: "1.5.0-phase1",
    weights: WEIGHTS,
    scoreBattery: scoreBattery,
    scoreScreenCondition: scoreScreenCondition,
    scoreScreen: scoreScreen,
    scoreBody: scoreBody,
    scoreHardware: scoreHardware,
    scoreRepairHistory: scoreRepairHistory,
    getDeviceScoreLabel: getDeviceScoreLabel,
    calculateDeviceScore: calculateDeviceScore
  };
})();
