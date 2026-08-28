(function (global) {
  "use strict";

  var CONFIG = {
    url: "https://mjtruagocsmdtnjajxlb.supabase.co",
    key: "sb_publishable_TFx135cYy6EmGb4WBAc7vA_1EaDXBSo",
    bucket: "marketplace-listing-photos",
    sessionKey: "kg_marketplace_session_v1"
  };
  var localKey = "kg_marketplace_listings_v1";
  var cache = null;

  function isLocalTest() {
    return location.hostname === "localhost" || location.hostname === "127.0.0.1";
  }

  function json(value, fallback) {
    try { return JSON.parse(value); } catch (error) { return fallback; }
  }
  function readSession() { return json(localStorage.getItem(CONFIG.sessionKey) || "null", null); }
  function writeSession(value) {
    if (value) localStorage.setItem(CONFIG.sessionKey, JSON.stringify(value));
    else localStorage.removeItem(CONFIG.sessionKey);
  }
  function readLocal() { return json(localStorage.getItem(localKey) || "[]", []); }
  function errorMessage(payload, fallback) {
    return (payload && (payload.msg || payload.message || payload.error_description || payload.error)) || fallback;
  }
  async function request(path, options) {
    options = options || {};
    var session = readSession();
    var headers = Object.assign({ apikey: CONFIG.key }, options.headers || {});
    if (session && session.access_token && !session.local_test) headers.Authorization = "Bearer " + session.access_token;
    var response = await fetch(CONFIG.url + path, Object.assign({}, options, { headers: headers }));
    var body = null;
    try { body = await response.json(); } catch (error) {}
    if (!response.ok) throw new Error(errorMessage(body, "İşlem tamamlanamadı."));
    return body;
  }
  function publicUrl(path) {
    return CONFIG.url + "/storage/v1/object/public/" + CONFIG.bucket + "/" + path.split("/").map(encodeURIComponent).join("/");
  }
  function toListing(row) {
    var photos = (row.marketplace_listing_photos || []).slice().sort(function (a, b) { return a.position - b.position; })
      .map(function (photo) { return publicUrl(photo.storage_path); });
    return {
      id: row.id,
      status: row.status,
      category: row.category,
      brand: row.brand,
      model: row.model,
      storage: row.storage_value,
      color: row.color,
      city: row.city,
      district: row.district,
      salePrice: Number(row.listing_price || 0),
      estimatedPrice: Number(row.market_value || 0),
      description: row.description || "",
      details: Array.isArray(row.device_details) ? row.device_details : [],
      photos: photos,
      createdAt: row.created_at,
      remote: true
    };
  }
  async function loadPublic(force) {
    if (cache && !force) return cache;
    if (isLocalTest()) {
      cache = readLocal();
      global.dispatchEvent(new CustomEvent("kg:marketplace:listings", { detail: cache }));
      return cache;
    }
    try {
      var rows = await request("/rest/v1/marketplace_listings?select=*,marketplace_listing_photos(storage_path,position)&status=eq.published&order=created_at.desc", {
        headers: { Accept: "application/json" }
      });
      cache = Array.isArray(rows) ? rows.map(toListing) : [];
      global.dispatchEvent(new CustomEvent("kg:marketplace:listings", { detail: cache }));
      return cache;
    } catch (error) {
      // Şema henüz kurulmadıysa mevcut localhost/test ilan panosu çalışmaya devam eder.
      cache = null;
      return readLocal();
    }
  }
  async function getListing(id) {
    if (!id) return null;
    var localListing = readLocal().find(function (listing) { return listing.id === id; });
    if (localListing) return localListing;
    try {
      var rows = await request("/rest/v1/marketplace_listings?select=*,marketplace_listing_photos(storage_path,position)&id=eq." + encodeURIComponent(id) + "&limit=1", {
        headers: { Accept: "application/json" }
      });
      return rows && rows[0] ? toListing(rows[0]) : null;
    } catch (error) {
      return readLocal().find(function (listing) { return listing.id === id; }) || null;
    }
  }
  async function signUp(email, password, fullName) {
    if (isLocalTest()) {
      var localSession = {
        access_token: "local-test-session",
        local_test: true,
        user: {
          id: "local-test-user",
          email: email,
          user_metadata: { full_name: fullName || "" }
        }
      };
      writeSession(localSession);
      return localSession;
    }
    var result = await request("/auth/v1/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password, data: { full_name: fullName || "" } })
    });
    if (result && result.access_token) writeSession(result);
    return result;
  }
  async function resendSignUp(email) {
    return request("/auth/v1/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "signup", email: email })
    });
  }
  async function signIn(email, password) {
    if (isLocalTest()) {
      var localSession = {
        access_token: "local-test-session",
        local_test: true,
        user: {
          id: "local-test-user",
          email: email,
          user_metadata: { full_name: "" }
        }
      };
      writeSession(localSession);
      return localSession;
    }
    var result = await request("/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password })
    });
    writeSession(result);
    return result;
  }
  function getUser() {
    var session = readSession();
    return session && session.user ? session.user : null;
  }
  async function uploadPhoto(file, listingId, position, userId) {
    var extension = (file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg");
    var path = [userId, listingId, Date.now() + "-" + position + "." + extension].join("/");
    await request("/storage/v1/object/" + CONFIG.bucket + "/" + path.split("/").map(encodeURIComponent).join("/"), {
      method: "POST",
      headers: { "Content-Type": file.type || "image/jpeg", "x-upsert": "false" },
      body: file
    });
    return { listing_id: listingId, storage_path: path, position: position };
  }
  function compressLocalPhoto(file) {
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type || "")) return reject(new Error("Geçersiz fotoğraf."));
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error("Fotoğraf okunamadı.")); };
      reader.onload = function () {
        var image = new Image();
        image.onerror = function () { reject(new Error("Fotoğraf işlenemedi.")); };
        image.onload = function () {
          var max = 1280;
          var scale = Math.min(1, max / Math.max(image.width, image.height));
          var canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.78));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  async function publish(data, files) {
    var session = readSession();
    var user = getUser();
    if (!session || !session.access_token || !user || !user.id) throw new Error("İlan yayınlamak için giriş yapmalısın.");
    if (session.local_test && isLocalTest()) {
      files = Array.isArray(files) ? files.slice(0, 5) : [];
      var localPhotos = [];
      for (var localIndex = 0; localIndex < files.length; localIndex += 1) {
        localPhotos.push(await compressLocalPhoto(files[localIndex]));
      }
      var localListing = {
        id: "local-" + Date.now(),
        status: "pending",
        category: data.category,
        brand: data.brand,
        model: data.model,
        storage: data.storage || null,
        color: data.color || null,
        city: data.city || null,
        district: data.district || null,
        salePrice: Number(data.salePrice),
        estimatedPrice: Number(data.estimatedPrice) || 0,
        description: data.description || "",
        details: Array.isArray(data.details) ? data.details : [],
        photos: localPhotos,
        createdAt: new Date().toISOString(),
        localTest: true
      };
      var localListings = readLocal();
      localListings.unshift(localListing);
      localStorage.setItem(localKey, JSON.stringify(localListings));
      cache = null;
      return localListing;
    }
    var payload = {
      owner_id: user.id,
      status: "pending",
      category: data.category,
      brand: data.brand,
      model: data.model,
      storage_value: data.storage || null,
      color: data.color || null,
      city: data.city || null,
      district: data.district || null,
      listing_price: Number(data.salePrice),
      market_value: Number(data.estimatedPrice) || null,
      description: data.description || "",
      device_details: Array.isArray(data.details) ? data.details : []
    };
    var rows = await request("/rest/v1/marketplace_listings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(payload)
    });
    var listing = rows && rows[0];
    if (!listing) throw new Error("İlan oluşturuldu ancak kayıt doğrulanamadı.");
    files = Array.isArray(files) ? files.slice(0, 5) : [];
    if (files.length) {
      var photoRows = [];
      for (var index = 0; index < files.length; index += 1) {
        photoRows.push(await uploadPhoto(files[index], listing.id, index, user.id));
      }
      await request("/rest/v1/marketplace_listing_photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(photoRows)
      });
    }
    cache = null;
    return listing;
  }

  global.KGMarketplaceStore = {
    loadPublic: loadPublic,
    getListing: getListing,
    getCachedListings: function () { return cache; },
    signUp: signUp,
    resendSignUp: resendSignUp,
    signIn: signIn,
    getUser: getUser,
    signOut: function () { writeSession(null); },
    publish: publish,
    publicUrl: publicUrl
  };
})(window);
