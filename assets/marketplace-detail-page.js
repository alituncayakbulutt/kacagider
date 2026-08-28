(function () {
  "use strict";
  var app = document.getElementById("app");
  if (!app || !window.KGMarketplaceStore) return;
  var params = new URLSearchParams(location.search);
  var requestedId = params.get("id");
  var legacyIndex = params.get("i");
  if (!requestedId && legacyIndex !== null && /^\d+$/.test(legacyIndex)) return;
  var id = requestedId || legacyIndex;
  if (!id) return;
  var icon = { Telefon: "📱", Tablet: "▣", Bilgisayar: "💻", "Akıllı Saat": "⌚", "Oyun Konsolu": "🎮" };
  function esc(value) { return String(value || "").replace(/[&<>\"']/g, function (char) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char]; }); }
  function money(value) { return Number(value || 0).toLocaleString("tr-TR") + " TL"; }
  function categoryFallback(listing) { return typeof window.getKgCategoryImage === "function" ? window.getKgCategoryImage(listing.category || "Telefon") : ""; }
  function productTitle(brand, model, storage) { var b = String(brand || "").trim(), m = String(model || "").trim(); var prefixed = b && m.toLocaleLowerCase("tr-TR").indexOf(b.toLocaleLowerCase("tr-TR") + " ") === 0; return [prefixed ? "" : b, m, storage].filter(Boolean).join(" "); }
  function detailItems(items) {
    if (!Array.isArray(items) || !items.length) return '<div class="detail-empty">Bu ilanda seçilmiş kondisyon detayı bulunmuyor.</div>';
    return '<div class="details">' + items.map(function (item) { return '<div class="detail-item"><span>' + esc(item.label || "Detay") + '</span><strong>' + esc(item.value || "—") + '</strong></div>'; }).join("") + "</div>";
  }
  function factHtml(listing) {
    var facts = [
      { label: "KATEGORİ", value: listing.category },
      { label: listing.category === "Oyun Konsolu" ? "DEPOLAMA" : (listing.category === "Akıllı Saat" ? "KASA / KAPASİTE" : "HAFIZA / KAPASİTE"), value: listing.storage },
      { label: "RENK", value: listing.color },
      { label: "İLAN DURUMU", value: listing.status === "pending" ? "İncelemede" : "Aktif", always: true }
    ];
    return '<div class="facts">' + facts.filter(function (fact) { return fact.always || String(fact.value || "").trim(); }).map(function (fact) {
      return '<div class="fact"><span>' + esc(fact.label) + '</span><strong>' + esc(fact.value) + '</strong></div>';
    }).join("") + '</div>';
  }
  function render(listing) {
    if (!listing) {
      app.innerHTML = '<div class="panel notfound"><h1>İlan bulunamadı</h1><p>İlan kaldırılmış olabilir veya bağlantı geçersiz.</p><a href="/ilanlar/">İlanlara dön</a></div>';
      return;
    }
    var asking = Number(listing.salePrice || 0), market = Number(listing.estimatedPrice || 0), delta = asking - market;
    var diff = market ? (delta === 0 ? "İlan fiyatı piyasa değeriyle aynı." : (delta > 0 ? money(Math.abs(delta)) + " piyasa değerinin üzerinde." : money(Math.abs(delta)) + " piyasa değerinin altında.")) : "";
    var photos = Array.isArray(listing.photos) ? listing.photos.filter(Boolean) : [];
    var modelImage = !photos.length && typeof window.getKgModelImage === "function" ? window.getKgModelImage(listing.brand, listing.model, listing.color, listing.category) : "";
    var fallbackImage = categoryFallback(listing);
    var alt = esc(productTitle(listing.brand, listing.model, listing.color));
    var fallback = '<div class="kg-detail-photo-fallback" style="display:none">' + (fallbackImage ? '<img src="' + esc(fallbackImage) + '" alt="' + esc(listing.category || "Ürün") + ' kategori görseli">' : (icon[listing.category] || "📦")) + '</div>';
    var main = photos.length ? '<img id="mainPhoto" src="' + esc(photos[0]) + '" alt="' + alt + '">' : (modelImage ? '<img id="mainPhoto" src="' + esc(modelImage) + '" alt="' + alt + '">' : (icon[listing.category] || "📦"));
    var thumbs = photos.length > 1 ? '<div class="thumbs">' + photos.map(function (photo, index) { return '<button class="thumb ' + (index === 0 ? "active" : "") + '" data-photo="' + index + '"><img src="' + esc(photo) + '" alt="Fotoğraf ' + (index + 1) + '"></button>'; }).join("") + "</div>" : "";
    app.innerHTML = '<a class="back" href="/ilanlar/">← İlanlara dön</a><div class="layout"><section class="panel"><div class="gallery"><div class="gallery-main">' + main + (photos.length || modelImage ? fallback : "") + "</div>" + thumbs + '</div><div class="content"><div class="eyebrow">' + esc([listing.category, listing.storage, listing.color].filter(Boolean).join(" · ")) + '</div><h1 class="title">' + esc(productTitle(listing.brand, listing.model, listing.storage)) + '</h1><div class="location">📍 ' + esc([listing.city, listing.district].filter(Boolean).join(", ")) + '</div>' + factHtml(listing) + '<h3 class="details-title">Ürün Detayları</h3>' + detailItems(listing.details) + '<h3>Açıklama</h3><div class="desc">' + esc(listing.description || "Satıcı açıklama eklememiş.") + '</div></div></section><aside class="panel side"><div class="asking">' + money(asking) + '</div><div class="estimate"><span>KAÇAGİDER PİYASA DEĞERİ</span><strong>' + money(market) + '</strong><div class="diff">' + esc(diff) + '</div></div><div class="seller"><strong>Satıcı</strong><span>Bireysel satıcı</span></div><button class="contact" id="contact">Satıcıyla İletişime Geç</button><div class="safe">Güvenli iletişim özelliği hazırlanmaktadır. İlanı görüntülerken ödeme veya kişisel bilgi paylaşımı yapma.</div></aside></div>';
    var mainPhoto = document.getElementById("mainPhoto");
    if (mainPhoto) mainPhoto.onerror = function () { this.style.display = "none"; if (this.nextElementSibling) this.nextElementSibling.style.display = "flex"; };
    qa("[data-photo]").forEach(function (button) { button.addEventListener("click", function () { var mainPhoto = document.getElementById("mainPhoto"); if (mainPhoto) { mainPhoto.style.display = ""; if (mainPhoto.nextElementSibling) mainPhoto.nextElementSibling.style.display = "none"; mainPhoto.src = photos[Number(button.dataset.photo)]; } qa(".thumb").forEach(function (thumb) { thumb.classList.remove("active"); }); button.classList.add("active"); }); });
    document.getElementById("contact").addEventListener("click", function () { alert("Güvenli mesajlaşma özelliği yakında kullanılabilir olacak."); });
  }
  function qa(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  window.KGMarketplaceStore.getListing(id).then(render).catch(function () { render(null); });
})();
