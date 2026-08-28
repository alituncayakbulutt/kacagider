(function () {
  "use strict";

  function q(selector, root) { return (root || document).querySelector(selector); }
  function qa(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function esc(value) { return String(value || "").replace(/[&<>\"']/g, function (char) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char]; }); }
  function price(value) { return Number(String(value || "").replace(/[^0-9]/g, "")) || 0; }
  function money(value) { return price(value).toLocaleString("tr-TR") + " TL"; }
  function productTitle(brand, model, storage) { var b = String(brand || "").trim(), m = String(model || "").trim(); var prefixed = b && m.toLocaleLowerCase("tr-TR").indexOf(b.toLocaleLowerCase("tr-TR") + " ") === 0; return [prefixed ? "" : b, m, storage].filter(Boolean).join(" "); }
  function value(id) {
    var element = q("#" + id);
    if (!element) return "";
    if (element.tagName === "SELECT") return element.options[element.selectedIndex] ? element.options[element.selectedIndex].textContent.trim() : "";
    return String(element.value || "").trim();
  }
  function activeText(group) {
    var element = q('[data-group="' + group + '"] .option.active');
    return element ? String(element.textContent || "").trim() : "";
  }
  function category() {
    var active = q('.category-card.active[data-category],.kg-approved-card.active[data-category],[data-category].active');
    var map = { phone: "Telefon", tablet: "Tablet", computer: "Bilgisayar", watch: "Akıllı Saat", console: "Oyun Konsolu" };
    return active && map[active.dataset.category] || (q("#selectedCategoryName") || {}).textContent || "Telefon";
  }
  function changedPartsText() {
    try {
      if (typeof window.getChangedPartsSummary === "function") return window.getChangedPartsSummary() || "";
    } catch (error) {}
    return "";
  }
  function details(categoryName) {
    var result = [];
    function add(label, selected) { if (selected && selected !== "Seçiniz") result.push({ label: label, value: selected }); }
    if (categoryName !== "Telefon") {
      add("Genel Kozmetik Durum", value("genericCondition"));
      add("Çalışma Durumu", value("genericWorking"));
      add("Kutu / Aksesuar", value("genericAccessories"));
      return result;
    }
    add("Pil Sağlığı", value("battery"));
    add("Ekran Durumu", value("screen"));
    add("Face ID", value("faceid"));
    add("Cihaz Kaydı", activeText("deviceRegistration"));
    add("Değişen Parça / İşlem Geçmişi", changedPartsText());
    add("Çizik Sayısı", activeText("scratchCount"));
    add("Çizik Derinliği", activeText("scratchDepth"));
    add("Piksel Atması", activeText("protector"));
    add("Kasa Ezik / Darbe", activeText("dent"));
    add("Kasa Yüzeyi", activeText("surface"));
    add("Köşeler", activeText("corners"));
    add("Arka Cam Durumu", activeText("backGlass"));
    return result;
  }
  function context() {
    var generic = q("#genericPanel") && getComputedStyle(q("#genericPanel")).display !== "none";
    var categoryName = String(category()).trim();
    return {
      category: categoryName,
      brand: value(generic ? "genericBrand" : "phoneBrand"),
      model: value(generic ? "genericModel" : "model"),
      storage: value(generic ? "genericStorage" : "storage"),
      estimatedPrice: price((q("#mainPrice") || {}).textContent),
      details: details(categoryName)
    };
  }
  var previewUrls = [];
  function revokePreviewUrls() {
    previewUrls.forEach(function (url) {
      try { URL.revokeObjectURL(url); } catch (error) {}
    });
    previewUrls = [];
  }
  function overlay() {
    var element = q("#kgMpOverlay");
    if (!element) {
      element = document.createElement("div");
      element.id = "kgMpOverlay";
      element.className = "kg-mp-overlay";
      element.innerHTML = '<section class="kg-mp-modal"><div class="kg-mp-head"><div><h2 id="kgMpTitle"></h2><p id="kgMpSub"></p></div><button class="kg-mp-close" type="button">×</button></div><div class="kg-mp-body" id="kgMpBody"></div></section>';
      document.body.appendChild(element);
      element.addEventListener("click", function (event) { if (event.target === element) close(); });
    }
    element.classList.add("is-open");
    document.body.style.overflow = "hidden";
    return element;
  }
  function close() {
    revokePreviewUrls();
    var element = q("#kgMpOverlay");
    if (element) element.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  function setModal(title, subtitle, body) {
    if (!overlay()) return false;
    q("#kgMpTitle").textContent = title;
    q("#kgMpSub").textContent = subtitle;
    q("#kgMpBody").innerHTML = body;
    var closeButton = q(".kg-mp-close");
    if (closeButton) closeButton.onclick = close;
    return true;
  }
  function showNotice(message, isError) {
    var notice = q("#kgMpNotice");
    if (!notice) return;
    notice.textContent = message;
    notice.style.color = isError ? "#b42318" : "#166534";
    notice.style.background = isError ? "#fff1f0" : "#f0fdf4";
    notice.style.borderColor = isError ? "#fecdca" : "#bbf7d0";
  }
  function showResendVerification(email) {
    var notice = q("#kgMpNotice");
    if (!notice || q("#kgMpResendVerification")) return;
    var button = document.createElement("button");
    button.id = "kgMpResendVerification";
    button.type = "button";
    button.className = "kg-mp-btn";
    button.textContent = "Doğrulama e-postasını yeniden gönder";
    button.style.marginTop = "10px";
    notice.insertAdjacentElement("afterend", button);
    button.onclick = async function () {
      button.disabled = true;
      try {
        await window.KGMarketplaceStore.resendSignUp(email);
        showNotice("Doğrulama e-postası yeniden gönderildi. Gelen kutusu ile spam/gereksiz klasörünü kontrol et.", false);
        button.textContent = "E-posta yeniden gönderildi";
      } catch (error) {
        showNotice(error.message || "Doğrulama e-postası yeniden gönderilemedi.", true);
        button.disabled = false;
      }
    };
  }
  function showAuth(c, mode) {
    mode = mode || "login";
    if (!setModal(mode === "login" ? "Giriş Yap" : "Ücretsiz Üye Ol", "İlan yayınlamak için doğrulanabilir bir hesabın olmalı.",
      '<div class="kg-mp-tabs"><button class="kg-mp-tab ' + (mode === "register" ? "active" : "") + '" data-auth="register">Üye Ol</button><button class="kg-mp-tab ' + (mode === "login" ? "active" : "") + '" data-auth="login">Giriş Yap</button></div>' +
      '<div id="kgMpNotice" class="kg-mp-note">İlanlar yayın öncesinde incelenir. E-posta ve şifre yalnızca üyelik işlemi için kullanılır.</div>' +
      '<form id="kgMpAuthForm">' + (mode === "register" ? '<div class="kg-mp-field"><label>Ad Soyad</label><input id="kgMpName" autocomplete="name" required></div>' : '') +
      '<div class="kg-mp-field"><label>E-posta</label><input id="kgMpEmail" type="email" autocomplete="email" required></div><div class="kg-mp-field"><label>Şifre</label><input id="kgMpPassword" type="password" autocomplete="' + (mode === "login" ? "current-password" : "new-password") + '" minlength="8" required></div><div class="kg-mp-actions"><button class="kg-mp-btn primary" type="submit">Devam Et</button></div></form>')) return;
    qa("[data-auth]").forEach(function (button) { button.onclick = function () { showAuth(c, button.dataset.auth); }; });
    q("#kgMpAuthForm").onsubmit = async function (event) {
      event.preventDefault();
      var submit = q('button[type="submit"]', event.currentTarget);
      submit.disabled = true;
      try {
        var email = value("kgMpEmail");
        var password = value("kgMpPassword");
        var response = mode === "register" ? await window.KGMarketplaceStore.signUp(email, password, value("kgMpName")) : await window.KGMarketplaceStore.signIn(email, password);
        if (!response.access_token) {
          showNotice("Doğrulama e-postası gönderildi. Gelen kutusu ile spam/gereksiz klasörünü kontrol et. Daha önce kayıt olduysan aşağıdan yeniden gönderebilirsin.", false);
          if (mode === "register") showResendVerification(email);
          submit.disabled = false;
          return;
        }
        showListing(c);
      } catch (error) {
        showNotice(error.message || "Giriş yapılamadı.", true);
        submit.disabled = false;
      }
    };
  }
  function showListing(c, state) {
    state = state || { files: [] };
    if (!setModal("İlanını Oluştur", "Değerleme bilgilerin ilan alanına güvenli şekilde taşındı.",
      '<div class="kg-mp-note">KaçaGider piyasa değeri ile ilan fiyatın ayrı gösterilir. İlanın, yayın öncesi incelemeye alınır.</div>' +
      '<div class="kg-mp-device"><h3>' + esc(productTitle(c.brand, c.model, c.storage)) + '</h3><p>KaçaGider piyasa değeri: <strong>' + money(c.estimatedPrice) + '</strong></p></div>' +
      '<form id="kgMpProductionListing"><div class="kg-mp-grid"><div class="kg-mp-field"><label>Şehir</label><select id="kgMpCity"><option>İstanbul</option><option>Ankara</option><option>İzmir</option><option>Bursa</option><option>Antalya</option></select></div><div class="kg-mp-field"><label>İlçe</label><input id="kgMpDistrict" required></div><div class="kg-mp-field"><label>Renk</label><input id="kgMpColor" required></div><div class="kg-mp-field"><label>İlan Fiyatın (TL)</label><input id="kgMpSale" type="number" min="1" required value="' + esc(c.estimatedPrice || "") + '"></div></div><div class="kg-mp-field"><label>Fotoğraflar</label><div class="kg-mp-upload"><input id="kgMpFiles" type="file" accept="image/jpeg,image/png,image/webp" multiple><small>En fazla 5 fotoğraf; JPEG, PNG veya WebP ve fotoğraf başına en fazla 5 MB.</small><div class="kg-mp-photo-grid" id="kgMpPhotoPreview"></div></div></div><div class="kg-mp-field"><label>Açıklama</label><textarea id="kgMpDescription" maxlength="2000" required placeholder="Cihazın durumu, aksesuarları ve teslim seçeneği hakkında kısa bilgi ver."></textarea></div><div id="kgMpNotice" class="kg-mp-note">Göndermeden önce ilan bilgilerini kontrol et.</div><div class="kg-mp-actions"><button class="kg-mp-btn primary" type="submit">İncelemeye Gönder</button></div></form>')) return;
    function renderFiles() {
      var host = q("#kgMpPhotoPreview");
      revokePreviewUrls();
      host.innerHTML = state.files.map(function (file, index) {
        var url = URL.createObjectURL(file);
        previewUrls.push(url);
        return '<div class="kg-mp-photo"><img src="' + url + '" alt="İlan fotoğrafı"><button type="button" aria-label="Fotoğrafı kaldır" data-remove-file="' + index + '">×</button></div>';
      }).join("");
      qa("[data-remove-file]", host).forEach(function (button) { button.onclick = function () { state.files.splice(Number(button.dataset.removeFile), 1); renderFiles(); }; });
    }
    q("#kgMpFiles").onchange = function (event) {
      var files = Array.prototype.slice.call(event.target.files || []).filter(function (file) { return /image\/(jpeg|png|webp)/.test(file.type) && file.size <= 5242880; });
      state.files = state.files.concat(files).slice(0, 5);
      event.target.value = "";
      renderFiles();
    };
    q("#kgMpProductionListing").onsubmit = async function (event) {
      event.preventDefault();
      var submit = q('button[type="submit"]', event.currentTarget);
      submit.disabled = true;
      try {
        var listing = await window.KGMarketplaceStore.publish({
          category: c.category, brand: c.brand, model: c.model, storage: c.storage,
          estimatedPrice: c.estimatedPrice, details: c.details,
          city: value("kgMpCity"), district: value("kgMpDistrict"), color: value("kgMpColor"),
          salePrice: price(value("kgMpSale")), description: value("kgMpDescription")
        }, state.files);
        location.href = "/ilan/?id=" + encodeURIComponent(listing.id);
      } catch (error) {
        showNotice(error.message || "İlan incelemeye gönderilemedi.", true);
        submit.disabled = false;
      }
    };
  }
  function start() {
    var c = context();
    if (!c.brand || !c.model || !c.estimatedPrice) {
      alert("İlan oluşturmak için önce cihazının piyasa değerini hesapla.");
      return;
    }
    if (!window.KGMarketplaceStore) {
      alert("İlan altyapısı yükleniyor. Lütfen bir an sonra tekrar dene.");
      return;
    }
    if (!window.KGMarketplaceStore.getUser()) showAuth(c, "register");
    else showListing(c);
  }
  document.addEventListener("click", function (event) {
    var trigger = event.target.closest("#kgMpResultAction");
    if (!trigger) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    start();
  }, true);
})();
