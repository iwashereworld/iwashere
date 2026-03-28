var MARK_SELECT_FIELDS = 'id,name,country_code,country_name,lat,lon,message,photo,capsule_days,capsule_date,capsule_for,is_public,created_at,user_id';
var LEGACY_MARK_SELECT_FIELDS = 'id,name,country_code,country_name,lat,lon,message,photo,capsule_days,capsule_date,capsule_for,is_public,created_at,user_id';
var CAPSULE_MARK_SELECT_FIELDS = 'id,name,country_code,country_name,lat,lon,message,photo,capsule_days,capsule_date,capsule_for,is_public,capsule_status,capsule_release_at,capsule_opened_at,created_at,user_id';
var CAPSULE_SELECT_FIELDS = 'id,name,owner_email,message,occasion,recipient_type,recipient_email,visibility,open_at,has_location,country_code,country_name,lat,lon,status,delivery_status,opened_at,recipient_notified_at,owner_notified_at,published_mark_id,created_at,user_id';
var MARK_SELECT_FIELDS = LEGACY_MARK_SELECT_FIELDS;
var MAX_NAME_LENGTH = 80;
var MAX_MESSAGE_LENGTH = 500;
var MAX_RECIPIENT_EMAIL_LENGTH = 254;
var MAX_PHOTO_BYTES = 3 * 1024 * 1024;

function clampText(value, maxLength) {
  return String(value == null ? '' : value).trim().slice(0, maxLength);
}

function normalizeEmail(value) {
  return String(value == null ? '' : value).trim().toLowerCase().slice(0, MAX_RECIPIENT_EMAIL_LENGTH);
}

function getAppBaseUrl() {
  var configured = window.IWH_CONFIG && window.IWH_CONFIG.PUBLIC_APP_URL;
  if (configured) return String(configured).replace(/\/+$/, '');
  if (window.location && window.location.origin) {
    return String(window.location.origin + (window.location.pathname || '/')).replace(/\/+$/, '');
  }
  return 'https://iwashere-seven.vercel.app';
}

function getSupabaseProjectRef() {
  try {
    var url = String((window.IWH_CONFIG && IWH_CONFIG.SUPABASE_URL) || '');
    var match = url.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/i);
    return match && match[1] ? match[1] : '';
  } catch (err) {
    return '';
  }
}

function getCapsuleBackendMode() {
  var configured = String((window.IWH_CONFIG && IWH_CONFIG.CAPSULE_BACKEND_MODE) || '').trim().toLowerCase();
  if (configured === 'split' || configured === 'legacy') return configured;
  var ref = getSupabaseProjectRef();
  return ref === 'qejlooembmhiidlumrma' ? 'split' : 'legacy';
}

function supportsSplitCapsuleBackend() {
  return getCapsuleBackendMode() === 'split';
}

function countLegacyCapsules(items) {
  return (items || []).filter(function(item) {
    return !!item && (
      (item.capsule_days || 0) > 0 ||
      !!item.capsule_date ||
      !!item.capsule_release_at
    );
  }).length;
}

function buildMarkPermalink(mark) {
  var markId = mark && typeof mark === 'object' ? mark.id : mark;
  if (!markId) return getAppBaseUrl();
  return getAppBaseUrl() + '#/m/' + encodeURIComponent(String(markId));
}

function parseRequestedMarkIdFromLocation() {
  try {
    var hash = String(window.location.hash || '');
    var hashMatch = hash.match(/^#\/m\/([^/?#]+)/);
    if (hashMatch && hashMatch[1]) return decodeURIComponent(hashMatch[1]);
    var searchValue = new URLSearchParams(window.location.search).get('mark') || '';
    return searchValue ? decodeURIComponent(searchValue) : '';
  } catch (err) {
    return '';
  }
}

function buildSharePayload(pin) {
  if (!pin || !pin.id) return null;
  var title = (pin.cname || 'A saved place') + ' on I Was Here';
  var text = (pin.name || 'Someone') + ' saved a memory in ' + (pin.cname || 'this place') + ' on I Was Here.';
  if (pin.msg) text += ' "' + pin.msg + '"';
  return {
    title: title,
    text: text,
    url: buildMarkPermalink(pin)
  };
}

function normalizeMarkRecord(m) {
  if (!m) return null;

  var lat = parseFloat(m.lat);
  var lon = parseFloat(m.lon);
  if (!isFinite(lat) || !isFinite(lon)) return null;

  return {
    id: m.id,
    name: clampText(m.name || 'Unknown', MAX_NAME_LENGTH) || 'Unknown',
    code: m.country_code || '',
    cname: m.country_name || 'Unknown',
    lat: lat,
    lon: lon,
    msg: clampText(m.message || '', MAX_MESSAGE_LENGTH),
    years: Math.round((m.capsule_days || 0) / 365),
    capsule_days: m.capsule_days || 0,
    photo: safeImageUrl(m.photo),
    added: m.created_at || new Date().toISOString(),
    owner: m.user_id || null
  };
}

function countdown(added, years) {
  if (!years || years <= 0) return '';
  var open = new Date(added);
  open.setFullYear(open.getFullYear() + years);
  var diff = open - new Date();
  if (diff <= 0) return 'Opened';
  var days = Math.floor(diff / 86400000);
  if (days > 365) return Math.round(days / 365) + 'y';
  if (days > 30) return Math.round(days / 30) + 'mo';
  return days + 'd';
}

MARK_SELECT_FIELDS = LEGACY_MARK_SELECT_FIELDS;

function isLegacySchemaError(error) {
  if (!error) return false;
  return String(error.code || '') === '42703' ||
    /column\s+marks\./i.test(String(error.message || '')) ||
    /schema cache/i.test(String(error.message || ''));
}

function isCapsuleSchemaUnavailableError(error) {
  if (!error) return false;
  var code = String(error.code || '');
  var message = String(error.message || '');
  return code === '42P01' ||
    /relation .*capsules/i.test(message) ||
    /table .*capsules/i.test(message) ||
    /schema cache/i.test(message);
}

function getCapsuleUnavailableMessage() {
  return getCurrentLanguage() === 'tr'
    ? 'Kapsüller şu anda kullanılamıyor. Rollout tamamlanana kadar iz bırakmaya devam edebilirsin.'
    : 'Capsules are temporarily unavailable right now. You can keep adding marks while the rollout finishes.';
}

function getMarkSelectFieldCandidates() {
  return supportsSplitCapsuleBackend()
    ? [CAPSULE_MARK_SELECT_FIELDS, LEGACY_MARK_SELECT_FIELDS]
    : [LEGACY_MARK_SELECT_FIELDS];
}

function getValidDate(value) {
  if (!value) return null;
  var date = new Date(value);
  return isFinite(date.getTime()) ? date : null;
}

function getMarkReleaseDate(pin) {
  if (!pin) return null;
  var direct = getValidDate(pin.capsule_release_at) || getValidDate(pin.capsule_date);
  if (direct) return direct;
  if ((pin.capsule_days || 0) > 0) {
    var added = getValidDate(pin.added) || new Date();
    return new Date(added.getTime() + ((pin.capsule_days || 0) * 86400000));
  }
  return null;
}

function getCapsuleState(pin) {
  if (!pin || !(pin.capsule_days > 0 || pin.capsule_date || pin.capsule_release_at)) return 'public';
  if (pin.capsule_status === 'locked' || pin.capsule_status === 'opened') return pin.capsule_status;
  var releaseDate = getMarkReleaseDate(pin);
  if (!releaseDate) return 'public';
  return releaseDate.getTime() > Date.now() ? 'locked' : 'opened';
}

function formatCapsuleDateTime(value) {
  var date = getValidDate(value);
  if (!date) return '';
  return date.toLocaleString(getCurrentLocale(), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getCapsuleStateLabel(pin) {
  var state = getCapsuleState(pin);
  if (state === 'locked') {
    return getCurrentLanguage() === 'tr'
      ? 'Henüz açılmadı · ' + formatCapsuleDateTime(getMarkReleaseDate(pin))
      : 'Locked until ' + formatCapsuleDateTime(getMarkReleaseDate(pin));
  }
  if (state === 'opened') {
    return getCurrentLanguage() === 'tr'
      ? 'Açıldı · ' + formatCapsuleDateTime(pin.capsule_opened_at || getMarkReleaseDate(pin))
      : 'Opened ' + formatCapsuleDateTime(pin.capsule_opened_at || getMarkReleaseDate(pin));
  }
  return getCurrentLanguage() === 'tr' ? 'Şimdi görünür' : 'Visible now';
}

function getVisibleMarkMessage(pin) {
  if (!pin) return '';
  if (getCapsuleState(pin) === 'locked') {
    return getCurrentLanguage() === 'tr'
      ? 'Bu kapsül henüz açılmadı.'
      : 'This capsule has not opened yet.';
  }
  return pin.msg || '';
}

normalizeMarkRecord = function(m) {
  if (!m) return null;

  var lat = parseFloat(m.lat);
  var lon = parseFloat(m.lon);
  if (!isFinite(lat) || !isFinite(lon)) return null;

  return {
    id: m.id,
    name: clampText(m.name || 'Unknown', MAX_NAME_LENGTH) || 'Unknown',
    code: m.country_code || '',
    cname: m.country_name || 'Unknown',
    lat: lat,
    lon: lon,
    msg: clampText(m.message || '', MAX_MESSAGE_LENGTH),
    years: Math.round((m.capsule_days || 0) / 365),
    capsule_days: m.capsule_days || 0,
    capsule_date: m.capsule_date || null,
    capsule_for: m.capsule_for || 'myself',
    is_public: m.is_public !== false,
    capsule_status: m.capsule_status || '',
    capsule_release_at: m.capsule_release_at || m.capsule_date || null,
    capsule_opened_at: m.capsule_opened_at || null,
    photo: safeImageUrl(m.photo),
    added: m.created_at || new Date().toISOString(),
    owner: m.user_id || null
  };
};

function normalizeCapsuleRecord(c) {
  if (!c) return null;

  var hasLocation = c.has_location === true;
  var lat = hasLocation ? parseFloat(c.lat) : null;
  var lon = hasLocation ? parseFloat(c.lon) : null;
  if (hasLocation && (!isFinite(lat) || !isFinite(lon))) return null;

  return {
    id: c.id,
    type: 'capsule',
    name: clampText(c.name || 'Unknown', MAX_NAME_LENGTH) || 'Unknown',
    ownerEmail: normalizeEmail(c.owner_email || ''),
    msg: clampText(c.message || '', MAX_MESSAGE_LENGTH),
    occasion: c.occasion || 'future_self',
    recipientType: c.recipient_type || 'self',
    recipientEmail: normalizeEmail(c.recipient_email || ''),
    visibility: c.visibility || 'private',
    openAt: c.open_at || null,
    hasLocation: hasLocation,
    code: hasLocation ? (c.country_code || '') : '',
    cname: hasLocation ? (c.country_name || '') : '',
    lat: hasLocation ? lat : null,
    lon: hasLocation ? lon : null,
    status: c.status || 'scheduled',
    deliveryStatus: c.delivery_status || 'pending',
    openedAt: c.opened_at || null,
    recipientNotifiedAt: c.recipient_notified_at || null,
    ownerNotifiedAt: c.owner_notified_at || null,
    publishedMarkId: c.published_mark_id || null,
    photo: safeImageUrl(c.photo),
    added: c.created_at || new Date().toISOString(),
    owner: c.user_id || null
  };
}

countdown = function(input, years) {
  var pin = typeof input === 'object'
    ? input
    : { added: input, years: years, capsule_days: years ? years * 365 : 0 };
  var releaseDate = getMarkReleaseDate(pin);
  if (!releaseDate) return '';
  var diff = releaseDate.getTime() - Date.now();
  if (diff <= 0) return getCurrentLanguage() === 'tr' ? 'Açıldı' : 'Opened';
  var minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return minutes + (getCurrentLanguage() === 'tr' ? ' dk' : 'm');
  var hours = Math.floor(minutes / 60);
  if (hours < 48) return hours + (getCurrentLanguage() === 'tr' ? ' sa' : 'h');
  var days = Math.floor(hours / 24);
  if (days > 365) return Math.round(days / 365) + 'y';
  if (days > 30) return Math.round(days / 30) + 'mo';
  return days + 'd';
};

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeImageUrl(value) {
  if (!value) return '';
  var url = String(value).trim();
  if (/^data:image\/[a-z0-9.+-]+;base64,/i.test(url)) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return '';
}

function safeInitial(value) {
  var text = String(value || '').trim();
  return escapeHtml(text ? text.charAt(0).toUpperCase() : '?');
}

function clearChildren(el) {
  while (el && el.firstChild) el.removeChild(el.firstChild);
}

function createAvatarNode(photo, name, className) {
  var wrap = document.createElement('div');
  if (className) wrap.className = className;

  var photoUrl = safeImageUrl(photo);
  if (photoUrl) {
    var img = document.createElement('img');
    img.src = photoUrl;
    img.alt = '';
    wrap.appendChild(img);
  } else {
    wrap.textContent = String(name || '').trim().charAt(0).toUpperCase() || '?';
  }

  return wrap;
}

function getPinById(pinId) {
  return ST.pins.find(function(pin) { return pin && pin.id === pinId; }) || null;
}

function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function parseCoordinateQuery(query) {
  var match = String(query || '').trim().match(/^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (!match) return null;
  var lat = parseFloat(match[1]);
  var lon = parseFloat(match[2]);
  if (!isFinite(lat) || !isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return {
    type: 'coords',
    key: 'coords:' + lat.toFixed(4) + ',' + lon.toFixed(4),
    name: getCurrentLanguage() === 'tr' ? 'Koordinatlar' : 'Coordinates',
    sub: lat.toFixed(4) + ', ' + lon.toFixed(4),
    lat: lat,
    lon: lon,
    score: 1000
  };
}

function scoreSearchTarget(query, primary, secondary) {
  var q = normalizeSearchText(query);
  var p = normalizeSearchText(primary);
  var s = normalizeSearchText(secondary);
  if (!q || !p) return -1;
  if (p === q) return 120;
  if (p.indexOf(q) === 0) return 90;
  if (p.indexOf(q) > 0) return 70;
  if (s && s.indexOf(q) === 0) return 56;
  if (s && s.indexOf(q) > 0) return 42;
  return -1;
}

function buildSearchResults(query) {
  var q = String(query || '').trim();
  if (q.length < 2) return [];

  var results = [];
  var seen = {};
  var coordMatch = parseCoordinateQuery(q);
  if (coordMatch) {
    seen[coordMatch.key] = true;
    results.push(coordMatch);
  }

  CITIES.forEach(function(city) {
    var score = scoreSearchTarget(q, city.name, city.country);
    if (score < 0) return;
    var key = 'city:' + city.name + ':' + city.country;
    if (seen[key]) return;
    seen[key] = true;
    results.push({
      type: 'city',
      key: key,
      name: city.name,
      sub: city.country,
      lat: city.lat,
      lon: city.lon,
      score: score
    });
  });

  COUNTRIES.forEach(function(country) {
    var score = scoreSearchTarget(q, country.name, country.code);
    if (score < 0) return;
    var key = 'country:' + country.code;
    if (seen[key]) return;
    seen[key] = true;
    results.push({
      type: 'country',
      key: key,
      name: country.name,
      sub: getCurrentLanguage() === 'tr' ? 'Ülke' : 'Country',
      lat: country.lat,
      lon: country.lon,
      code: country.code,
      score: score
    });
  });

  ST.pins.forEach(function(pin) {
    var score = Math.max(
      scoreSearchTarget(q, pin.cname, pin.name),
      scoreSearchTarget(q, pin.name, pin.cname)
    );
    if (score < 0) return;
    var key = 'pin:' + pin.id;
    if (seen[key]) return;
    seen[key] = true;
    results.push({
      type: 'pin',
      key: key,
      name: pin.cname,
      sub: (getCurrentLanguage() === 'tr' ? 'İz bırakan: ' : 'Mark by ') + pin.name,
      lat: pin.lat,
      lon: pin.lon,
      pinId: pin.id,
      score: score + 4
    });
  });

  return results.sort(function(a, b) {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  }).slice(0, 8);
}

function buildDiscoverySuggestions() {
  var results = [];
  var seen = {};

  getCountryMarkGroups().slice(0, 4).forEach(function(group) {
    var country = COUNTRIES.find(function(entry) { return entry.code === group.key || entry.name === group.name; });
    if (!country) return;
    var key = 'country:' + (country.code || group.name);
    if (seen[key]) return;
    seen[key] = true;
    results.push({
      type: 'country',
      key: key,
      name: country.name,
      sub: t('search_suggestion_country') + ' • ' + getMarkWord(group.count),
      lat: country.lat,
      lon: country.lon,
      code: country.code || '',
      score: 100
    });
  });

  ST.pins.slice().sort(function(a, b) {
    return new Date(b.added || 0) - new Date(a.added || 0);
  }).slice(0, 4).forEach(function(pin) {
    if (!pin || !pin.id) return;
    var key = 'pin:' + pin.id;
    if (seen[key]) return;
    seen[key] = true;
    results.push({
      type: 'pin',
      key: key,
      name: pin.cname,
      sub: t('search_suggestion_recent') + ' • ' + pin.name,
      lat: pin.lat,
      lon: pin.lon,
      pinId: pin.id,
      score: 90
    });
  });

  return results.slice(0, 8);
}

function positionTooltip(el, x, y) {
  if (!el) return;
  var width = el.offsetWidth || 240;
  var height = el.offsetHeight || 120;
  var left = Math.min(window.innerWidth - width - 16, x + 16);
  var top = Math.min(window.innerHeight - height - 16, y + 16);
  el.style.left = Math.max(16, left) + 'px';
  el.style.top = Math.max(16, top) + 'px';
}

function hidePinTooltip() {
  var tt = document.getElementById('tt');
  if (!tt) return;
  tt.classList.remove('show');
}

function createRow(label, value, totalClass) {
  var row = document.createElement('div');
  row.className = totalClass ? 'pr tot' : 'pr';

  var left = document.createElement('span');
  left.textContent = label;
  row.appendChild(left);

  var right = document.createElement('span');
  right.textContent = value;
  row.appendChild(right);

  return row;
}

function getCountryMarkGroups() {
  var groups = {};
  ST.pins.forEach(function(pin) {
    var key = pin.code || pin.cname || 'Unknown';
    if (!groups[key]) {
      groups[key] = {
        key: key,
        name: pin.cname || pin.code || 'Unknown',
        count: 0
      };
    }
    groups[key].count += 1;
  });

  return Object.keys(groups).map(function(key) {
    return groups[key];
  }).sort(function(a, b) {
    if (b.count !== a.count) return b.count - a.count;
    return a.name.localeCompare(b.name);
  });
}

var _openCountrySummaryKey = '';

function getCountryPins(group) {
  if (!group) return [];
  return ST.pins.filter(function(pin) {
    return (pin.code || pin.cname || 'Unknown') === group.key;
  }).sort(function(a, b) {
    return new Date(b.added || 0) - new Date(a.added || 0);
  });
}

function flyToPinFromSummary(pin) {
  if (!pin) return;
  flyTo(pin.lat, pin.lon, getHeightForZoom(29));
  if (typeof showPinTooltip === 'function' && viewer && viewer.scene) {
    var position = Cesium.Cartesian3.fromDegrees(pin.lon, pin.lat, 0);
    var windowPos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, position);
    if (windowPos) showPinTooltip(pin, windowPos.x, windowPos.y);
  }
}

function createCountrySummaryDetail(pin) {
  var item = document.createElement('div');
  item.className = 'cs-detail-item';
  item.title = getCurrentLanguage() === 'tr' ? 'Bu izne git' : 'Go to this mark';
  item.onclick = function() {
    flyToPinFromSummary(pin);
  };

  var avatar = createAvatarNode(pin.photo, pin.name, 'cs-detail-avatar');
  item.appendChild(avatar);

  var copy = document.createElement('div');
  copy.className = 'cs-detail-copy';
  var name = document.createElement('div');
  name.className = 'cs-detail-name';
  name.textContent = pin.name;
  var meta = document.createElement('div');
  meta.className = 'cs-detail-meta';
  meta.textContent = getCapsuleState(pin) === 'locked'
    ? getCapsuleStateLabel(pin)
    : (pin.msg ? pin.msg : (pin.lat.toFixed(3) + ', ' + pin.lon.toFixed(3)));
  copy.appendChild(name);
  copy.appendChild(meta);
  item.appendChild(copy);
  return item;
}

var CURRENT_QUICK_JUMP = 'recent';

function setQuickJump(mode) {
  CURRENT_QUICK_JUMP = mode;
  var buttons = document.querySelectorAll('#quick-jump .qjbtn');
  buttons.forEach(function(button) {
    button.classList.toggle('on', button.getAttribute('data-jump') === mode);
  });
  renderLists();
}

function getCameraTarget() {
  if (!viewer || !viewer.camera || !viewer.camera.positionCartographic) return null;
  return {
    lat: Cesium.Math.toDegrees(viewer.camera.positionCartographic.latitude),
    lon: Cesium.Math.toDegrees(viewer.camera.positionCartographic.longitude)
  };
}

function getDistanceScore(aLat, aLon, bLat, bLon) {
  var dLat = aLat - bLat;
  var dLon = aLon - bLon;
  return Math.sqrt((dLat * dLat) + (dLon * dLon));
}

function getQuickJumpPins() {
  if (CURRENT_QUICK_JUMP === 'my') {
    if (!AUTH.user) return [];
    return ST.pins.filter(function(pin) { return pin.owner === AUTH.user.id; });
  }

  if (CURRENT_QUICK_JUMP === 'nearby') {
    var target = (ST.selLat != null && ST.selLon != null) ? { lat: ST.selLat, lon: ST.selLon } : getCameraTarget();
    if (!target) return ST.pins.slice();
    return ST.pins.slice().sort(function(a, b) {
      return getDistanceScore(a.lat, a.lon, target.lat, target.lon) - getDistanceScore(b.lat, b.lon, target.lat, target.lon);
    });
  }

  if (CURRENT_QUICK_JUMP === 'trending') {
    return ST.pins.slice().sort(function(a, b) {
      var scoreA = (a.years ? 5 : 0) + (a.msg ? 2 : 0) + (a.photo ? 1 : 0);
      var scoreB = (b.years ? 5 : 0) + (b.msg ? 2 : 0) + (b.photo ? 1 : 0);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return new Date(b.added || 0) - new Date(a.added || 0);
    });
  }

  if (CURRENT_QUICK_JUMP === 'friends') {
    return [];
  }

  return ST.pins.slice().sort(function(a, b) {
    return new Date(b.added || 0) - new Date(a.added || 0);
  });
}

function removePinEntity(pinId) {
  if (!pinId) return;
  pinEntities = pinEntities.filter(function(entity) {
    var matchesDirect = entity && entity.iwhPinId === pinId;
    var matchesProperty = entity && entity.properties && entity.properties.id && typeof entity.properties.id.getValue === 'function' && entity.properties.id.getValue() === pinId;
    if (matchesDirect || matchesProperty) {
      if (pinDataSource) {
        pinDataSource.entities.remove(entity);
      } else if (viewer) {
        viewer.entities.remove(entity);
      }
      return false;
    }
    return true;
  });
  if (typeof syncPinLOD === 'function') syncPinLOD(true);
}

async function deleteMark(pinId, buttonEl) {
  if (!AUTH.user || !AUTH.user.id) {
    openAuth('login');
    return;
  }

  var pin = ST.pins.find(function(item) { return item.id === pinId; });
  if (!pin || pin.owner !== AUTH.user.id) {
    showToast('You can only delete marks you created.', 'error');
    return;
  }

  if (!window.confirm('Delete this mark? This action cannot be undone.')) return;

  if (buttonEl) {
    buttonEl.disabled = true;
    buttonEl.textContent = 'Deleting...';
  }

  var result = await _supabase.from('marks').delete().eq('id', pinId);
  if (result.error) {
    console.error('Delete error:', result.error);
    if (buttonEl) {
      buttonEl.disabled = false;
      buttonEl.textContent = 'Delete';
    }
    showToast(result.error.message || 'This mark could not be deleted.', 'error');
    return;
  }

  ST.pins = ST.pins.filter(function(item) { return item.id !== pinId; });
  if (window._lastPin && window._lastPin.id === pinId) window._lastPin = null;
  removePinEntity(pinId);
  updateStats();
  renderLists();
  showMarks();
  showToast('Mark deleted successfully.', 'success');
}

function showMarks() {
  if (!AUTH.user) {
    openAuth('login');
    return;
  }
  var body = document.getElementById('mbody');
  var marks = ST.pins.filter(function(p) { return p.owner === AUTH.user.id; });

  clearChildren(body);
  if (!marks.length) {
    var empty = document.createElement('div');
    empty.style.cssText = 'text-align:center;padding:3rem 1rem;font-size:.85rem;color:rgba(240,237,232,.35)';
    empty.appendChild(document.createTextNode(getCurrentLanguage() === 'tr' ? 'Henüz iz yok.' : 'No marks yet.'));
    empty.appendChild(document.createElement('br'));
    empty.appendChild(document.createElement('br'));

    var cta = document.createElement('button');
    cta.textContent = getCurrentLanguage() === 'tr' ? 'İlk izimi bırak' : 'Place my first mark';
    cta.onclick = function() { closeMarks(); showGlobe(); };
    cta.style.cssText = 'background:#c8a96e;color:#020408;border:none;border-radius:20px;padding:9px 22px;cursor:pointer;font-size:.82rem;font-family:sans-serif';
    empty.appendChild(cta);
    body.appendChild(empty);
  } else {
    marks.forEach(function(p) {
      var cd = countdown(p);

      var item = document.createElement('div');
      item.className = 'mitem';
      item.onclick = function() { closeMarks(); flyTo(p.lat, p.lon, 500000); };

      item.appendChild(createAvatarNode(p.photo, p.name, 'mdot'));

      var info = document.createElement('div');
      info.className = 'minfo';

      var country = document.createElement('div');
      country.className = 'mcn';
      country.textContent = '- ' + p.cname;
      info.appendChild(country);

      var date = document.createElement('div');
      date.className = 'mdt';
      date.textContent = new Date(p.added || Date.now()).toLocaleDateString(getCurrentLocale(), { year: 'numeric', month: 'long', day: 'numeric' });
      info.appendChild(date);

      if (getVisibleMarkMessage(p)) {
        var msg = document.createElement('div');
        msg.className = 'mmsg';
        msg.textContent = '"' + getVisibleMarkMessage(p) + '"';
        info.appendChild(msg);
      }

      if (p.years) {
        var cap = document.createElement('div');
        cap.className = 'mcap';
        cap.textContent = getCapsuleStateLabel(p);
        info.appendChild(cap);
      }

      item.appendChild(info);

      var actions = document.createElement('div');
      actions.className = 'mact';

      var del = document.createElement('button');
      del.type = 'button';
      del.className = 'mdel';
      del.textContent = getCurrentLanguage() === 'tr' ? 'Sil' : 'Delete';
      del.setAttribute('aria-label', getCurrentLanguage() === 'tr' ? (p.cname + ' içindeki izi sil') : ('Delete mark in ' + p.cname));
      del.onclick = function(event) {
        event.stopPropagation();
        deleteMark(p.id, del);
      };
      actions.appendChild(del);

      item.appendChild(actions);
      body.appendChild(item);
    });
  }
  document.getElementById('mmarks').classList.add('show');
  if (typeof syncOverlayState === 'function') syncOverlayState();
}

function showShareCard(pin) {
  if (!pin) return;
  window._sharePin = pin;
  var avatar = document.getElementById('share-avatar');
  clearChildren(avatar);
  if (safeImageUrl(pin.photo)) {
    var img = document.createElement('img');
    img.src = safeImageUrl(pin.photo);
    img.alt = '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%';
    avatar.appendChild(img);
  } else {
    var initial = document.createElement('span');
    initial.style.cssText = 'font-size:24px;color:#c8a96e';
    initial.textContent = String(pin.name || '').trim().charAt(0).toUpperCase() || '?';
    avatar.appendChild(initial);
  }
  document.getElementById('share-headline').textContent = pin.years > 0 ? t('share_headline_capsule') : t('share_headline_mark');
  document.getElementById('share-name').textContent = pin.name;
  document.getElementById('share-country').textContent = t('share_country_prefix') + ' ' + pin.cname;
  document.getElementById('share-coords').textContent = pin.lat.toFixed(2) + ', ' + pin.lon.toFixed(2);
  document.getElementById('share-msg').textContent = getVisibleMarkMessage(pin)
    ? '"' + getVisibleMarkMessage(pin) + '"'
    : t('share_fallback_message');
  document.getElementById('share-date').textContent = t('share_saved_prefix') + ' ' + new Date(pin.added || Date.now()).toLocaleDateString(getCurrentLocale(), { year: 'numeric', month: 'long', day: 'numeric' });
  var typeChip = document.getElementById('share-chip-type');
  var dateChip = document.getElementById('share-chip-date');
  if (typeChip) typeChip.textContent = pin.years > 0 ? t('share_capsule_memory') : t('share_public_memory');
  if (dateChip) dateChip.textContent = pin.years > 0 ? getCapsuleStateLabel(pin) : (getCurrentLanguage() === 'tr' ? 'Şimdi görünür' : 'Visible now');
  var deleteBtn = document.getElementById('share-delete-btn');
  if (deleteBtn) {
    var canDelete = !!(AUTH.user && pin.owner && AUTH.user.id === pin.owner);
    deleteBtn.style.display = canDelete ? 'block' : 'none';
    deleteBtn.disabled = false;
    deleteBtn.textContent = getCurrentLanguage() === 'tr' ? 'Sil' : 'Delete';
  }
  if (typeof openShareModal === 'function') {
    openShareModal();
  } else {
    document.getElementById('share-modal').classList.add('show');
  }
}

function renderProfileRecent(container, marks) {
  clearChildren(container);

  if (!marks.length) {
    var empty = document.createElement('div');
    empty.className = 'pempty';
    empty.textContent = t('empty_profile_activity');
    var cta = document.createElement('button');
    cta.type = 'button';
    cta.textContent = t('profile_recent_cta');
    cta.style.cssText = 'margin-top:12px;background:#c8a96e;color:#020408;border:none;border-radius:999px;padding:8px 14px;font-size:.72rem;cursor:pointer;font-family:inherit;';
    cta.onclick = function() {
      closeProfile();
      showGlobe();
      openSb('mark');
    };
    container.appendChild(empty);
    container.appendChild(cta);
    return;
  }

  marks.slice(0, 4).forEach(function(p) {
    var item = document.createElement('button');
    item.type = 'button';
    item.className = 'pritem';
    item.style.background = 'transparent';
    item.style.border = 'none';
    item.style.width = '100%';
    item.style.textAlign = 'left';
    item.style.cursor = 'pointer';
    item.onclick = function() {
      closeProfile();
      showGlobe();
      if (p.type === 'capsule') {
        return;
      }
      flyTo(p.lat, p.lon, 500000);
    };

    item.appendChild(createAvatarNode(p.photo, p.name, 'pravatar'));

    var info = document.createElement('div');
    info.className = 'prinfo';

    var name = document.createElement('div');
    name.className = 'prname';
    name.textContent = p.type === 'capsule'
      ? (p.hasLocation ? (p.cname || (getCurrentLanguage() === 'tr' ? 'Konumlu kapsul' : 'Capsule with place')) : (getCurrentLanguage() === 'tr' ? 'Konumsuz kapsul' : 'Location-free capsule'))
      : p.cname;
    info.appendChild(name);

    var meta = document.createElement('div');
    meta.className = 'prmeta';
    meta.textContent = new Date(p.added || Date.now()).toLocaleDateString(getCurrentLocale(), { year: 'numeric', month: 'long', day: 'numeric' }) + (
      p.type === 'capsule'
        ? (' - ' + (p.status === 'opened'
          ? (getCurrentLanguage() === 'tr' ? 'Acildi' : 'Opened')
          : (getCurrentLanguage() === 'tr' ? 'Planlandi' : 'Scheduled')))
        : (p.years ? (' - ' + getCapsuleStateLabel(p)) : '')
    );
    info.appendChild(meta);

    if (p.type === 'capsule' ? p.msg : getVisibleMarkMessage(p)) {
      var msg = document.createElement('div');
      msg.className = 'prmsg';
      msg.textContent = '"' + (p.type === 'capsule' ? p.msg : getVisibleMarkMessage(p)) + '"';
      info.appendChild(msg);
    }

    item.appendChild(info);
    container.appendChild(item);
  });
}

function openProfile() {
  if (!AUTH.user) {
    openAuth('login');
    return;
  }

  var marks = ST.pins.filter(function(p) { return p.owner === AUTH.user.id; });
  var capsulesList = (ST.capsules || []).filter(function(c) { return c.owner === AUTH.user.id; });
  var countries = marks.map(function(p) { return p.code || p.cname; }).filter(function(value, index, arr) {
    return value && arr.indexOf(value) === index;
  });
  var capsules = capsulesList.length;
  var avatarSource = marks.find(function(p) { return safeImageUrl(p.photo); });
  var recentItems = marks.concat(capsulesList).sort(function(a, b) {
    return new Date(b.added || 0) - new Date(a.added || 0);
  });

  var avatar = document.getElementById('profile-avatar');
  clearChildren(avatar);
  avatar.appendChild(createAvatarNode(avatarSource ? avatarSource.photo : '', AUTH.user.name, ''));

  document.getElementById('profile-name').textContent = AUTH.user.name;
  document.getElementById('profile-meta').textContent = AUTH.user.email;
  document.getElementById('profile-badge-level').textContent = buildProfileBadgeLevel(marks.length);
  document.getElementById('profile-badge-latest').textContent = marks.length
    ? (t('profile_latest_prefix') + ' ' + marks[0].cname)
    : t('profile_no_marks');
  document.getElementById('profile-bio').textContent = buildProfileBio(marks);
  document.getElementById('profile-summary').textContent = buildProfileSummary(marks, countries, capsules);
  document.getElementById('profile-stat-marks').textContent = marks.length;
  document.getElementById('profile-stat-countries').textContent = countries.length;
  document.getElementById('profile-stat-capsules').textContent = capsules;
  renderProfileRecent(document.getElementById('profile-recent'), recentItems);

  document.getElementById('profile-modal').classList.add('show');
  if (typeof syncOverlayState === 'function') syncOverlayState();
}

function showMarks() {
  if (!AUTH.user) {
    openAuth('login');
    return;
  }
  var body = document.getElementById('mbody');
  var marks = ST.pins.filter(function(p) { return p.owner === AUTH.user.id; });
  var capsules = (ST.capsules || []).filter(function(c) { return c.owner === AUTH.user.id; });

  clearChildren(body);
  if (!marks.length && !capsules.length) {
    var empty = document.createElement('div');
    empty.style.cssText = 'text-align:center;padding:3rem 1rem;font-size:.85rem;color:rgba(240,237,232,.35)';
    empty.appendChild(document.createTextNode(t('empty_my_marks')));
    empty.appendChild(document.createElement('br'));
    empty.appendChild(document.createElement('br'));

    var cta = document.createElement('button');
    cta.textContent = t('empty_my_marks_cta');
    cta.onclick = function() { closeMarks(); showGlobe(); };
    cta.style.cssText = 'background:#c8a96e;color:#020408;border:none;border-radius:20px;padding:9px 22px;cursor:pointer;font-size:.82rem;font-family:sans-serif';
    empty.appendChild(cta);
    body.appendChild(empty);
  } else {
    if (marks.length) {
      var marksHeading = document.createElement('div');
      marksHeading.style.cssText = 'font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;color:#c8a96e;margin-bottom:10px;';
      marksHeading.textContent = getCurrentLanguage() === 'tr' ? 'Izlerim' : 'My Marks';
      body.appendChild(marksHeading);
    }
    marks.forEach(function(p) {
      var cd = countdown(p);

      var item = document.createElement('div');
      item.className = 'mitem';
      item.onclick = function() { closeMarks(); flyTo(p.lat, p.lon, 500000); };

      item.appendChild(createAvatarNode(p.photo, p.name, 'mdot'));

      var info = document.createElement('div');
      info.className = 'minfo';

      var country = document.createElement('div');
      country.className = 'mcn';
      country.textContent = '- ' + p.cname;
      info.appendChild(country);

      var date = document.createElement('div');
      date.className = 'mdt';
      date.textContent = new Date(p.added || Date.now()).toLocaleDateString(getCurrentLocale(), { year: 'numeric', month: 'long', day: 'numeric' });
      info.appendChild(date);

      if (getVisibleMarkMessage(p)) {
        var msg = document.createElement('div');
        msg.className = 'mmsg';
        msg.textContent = '"' + getVisibleMarkMessage(p) + '"';
        info.appendChild(msg);
      }

      if (p.years) {
        var cap = document.createElement('div');
        cap.className = 'mcap';
        cap.textContent = getCapsuleStateLabel(p);
        info.appendChild(cap);
      }

      item.appendChild(info);

      var actions = document.createElement('div');
      actions.className = 'mact';

      var del = document.createElement('button');
      del.type = 'button';
      del.className = 'mdel';
      del.textContent = getCurrentLanguage() === 'tr' ? 'Sil' : 'Delete';
      del.setAttribute('aria-label', getCurrentLanguage() === 'tr' ? (p.cname + ' içindeki izi sil') : ('Delete mark in ' + p.cname));
      del.onclick = function(event) {
        event.stopPropagation();
        deleteMark(p.id, del);
      };
      actions.appendChild(del);

      item.appendChild(actions);
      body.appendChild(item);
    });

    if (capsules.length) {
      var capsuleHeading = document.createElement('div');
      capsuleHeading.style.cssText = 'font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;color:#c8a96e;margin:18px 0 10px;';
      capsuleHeading.textContent = getCurrentLanguage() === 'tr' ? 'Kapsullerim' : 'My Capsules';
      body.appendChild(capsuleHeading);

      capsules.forEach(function(c) {
        var capsuleItem = document.createElement('div');
        capsuleItem.className = 'mitem';

        capsuleItem.appendChild(createAvatarNode(c.photo, c.name, 'mdot'));

        var capsuleInfo = document.createElement('div');
        capsuleInfo.className = 'minfo';

        var capsuleName = document.createElement('div');
        capsuleName.className = 'mcn';
        capsuleName.textContent = '- ' + (c.hasLocation ? (c.cname || (getCurrentLanguage() === 'tr' ? 'Konumlu kapsul' : 'Capsule with place')) : (getCurrentLanguage() === 'tr' ? 'Konumsuz kapsul' : 'Location-free capsule'));
        capsuleInfo.appendChild(capsuleName);

        var capsuleDate = document.createElement('div');
        capsuleDate.className = 'mdt';
        capsuleDate.textContent = new Date(c.openAt || c.added || Date.now()).toLocaleDateString(getCurrentLocale(), { year: 'numeric', month: 'long', day: 'numeric' });
        capsuleInfo.appendChild(capsuleDate);

        var capsuleMsg = document.createElement('div');
        capsuleMsg.className = 'mmsg';
        capsuleMsg.textContent = '"' + c.msg + '"';
        capsuleInfo.appendChild(capsuleMsg);

        var capsuleMeta = document.createElement('div');
        capsuleMeta.className = 'mcap';
        capsuleMeta.textContent = c.status === 'opened'
          ? (getCurrentLanguage() === 'tr' ? 'Acilmis kapsul' : 'Opened capsule')
          : (getCurrentLanguage() === 'tr' ? 'Planli kapsul' : 'Scheduled capsule');
        capsuleInfo.appendChild(capsuleMeta);

        capsuleItem.appendChild(capsuleInfo);
        body.appendChild(capsuleItem);
      });
    }
  }
  document.getElementById('mmarks').classList.add('show');
  if (typeof syncOverlayState === 'function') syncOverlayState();
}

async function deleteSharedMark(event) {
  if (event) event.stopPropagation();
  var pin = window._sharePin || window._lastPin;
  var button = document.getElementById('share-delete-btn');
  if (!pin || !button) return;
  await deleteMark(pin.id, button);
  if (!getPinById(pin.id) && typeof closeShareModal === 'function') {
    closeShareModal();
  }
}

function showPinTooltip(pin, x, y) {
  if (!pin) {
    hidePinTooltip();
    return;
  }
  var tt = document.getElementById('tt');
  var tav = document.getElementById('tav');
  var tn = document.getElementById('tn');
  var tc = document.getElementById('tc');
  var tm = document.getElementById('tm');
  if (!tt || !tav || !tn || !tc || !tm) return;
  clearChildren(tav);
  tav.appendChild(createAvatarNode(pin.photo, pin.name, ''));
  var isOwner = AUTH.user && pin.owner && AUTH.user.id === pin.owner;
  tn.textContent = pin.name + (isOwner ? (getCurrentLanguage() === 'tr' ? ' • Senin izin' : ' • Your mark') : '');
  tc.textContent = pin.cname + ' • ' + pin.lat.toFixed(3) + ', ' + pin.lon.toFixed(3);
  tm.textContent = getVisibleMarkMessage(pin) || getCapsuleStateLabel(pin) || ((getCurrentLanguage() === 'tr' ? 'Kaydedildi ' : 'Saved ') + new Date(pin.added || Date.now()).toLocaleDateString(getCurrentLocale(), { year: 'numeric', month: 'short', day: 'numeric' }));
  tt.classList.add('show');
  positionTooltip(tt, x, y);
}

function renderCountrySummary() {
  var body = document.getElementById('country-summary-body');
  if (!body) return;
  clearChildren(body);
  if (window._marksLoading && !ST.pins.length) {
    body.className = 'cs-empty';
    var loading = document.createElement('div');
    loading.textContent = t('loading_country_summary');
    body.appendChild(loading);
    for (var i = 0; i < 3; i++) {
      var ghost = document.createElement('div');
      ghost.className = 'cs-item';
      ghost.style.opacity = '.65';
      ghost.innerHTML = '<div class="cs-name" style="width:52%;height:12px;background:rgba(255,255,255,.08);border-radius:999px"></div><div class="cs-count" style="width:48px;height:12px;background:rgba(200,169,110,.12);border-radius:999px"></div>';
      body.appendChild(ghost);
    }
    return;
  }
  var groups = getCountryMarkGroups();
  if (!groups.length) {
    body.className = 'cs-empty';
    var text = document.createElement('div');
    text.textContent = t('country_summary_empty');
    body.appendChild(text);
    var cta = document.createElement('button');
    cta.type = 'button';
    cta.textContent = AUTH.user ? t('empty_country_summary_cta_signed_in') : t('empty_country_summary_cta_signed_out');
    cta.style.cssText = 'margin-top:10px;background:#c8a96e;color:#020408;border:none;border-radius:999px;padding:8px 14px;font-size:.72rem;cursor:pointer;font-family:inherit;';
    cta.onclick = function() { AUTH.user ? (showGlobe(), openSb('mark')) : openAuth('login'); };
    body.appendChild(cta);
    return;
  }
  body.className = 'cs-list';
  groups.slice(0, 8).forEach(function(group) {
    var item = document.createElement('div');
    item.className = 'cs-item clickable';
    item.onclick = function() {
      _openCountrySummaryKey = _openCountrySummaryKey === group.key ? '' : group.key;
      renderCountrySummary();
    };
    var name = document.createElement('div');
    name.className = 'cs-name';
    name.textContent = group.name;
    var count = document.createElement('div');
    count.className = 'cs-count';
    count.textContent = getMarkWord(group.count);
    item.appendChild(name);
    item.appendChild(count);
    body.appendChild(item);

    if (_openCountrySummaryKey === group.key) {
      var detailWrap = document.createElement('div');
      detailWrap.className = 'cs-detail-list';
      getCountryPins(group).slice(0, 8).forEach(function(pin) {
        detailWrap.appendChild(createCountrySummaryDetail(pin));
      });
      body.appendChild(detailWrap);
    }
  });
}

function bSmry() {
  var cap = ST.composerType === 'capsule' && !!(ST.capsuleDate || ST.capsuleDays > 0);
  var tot = 1 + (cap ? 2 : 0);
  var opens = typeof getCapsuleScheduleDateFromState === 'function' ? getCapsuleScheduleDateFromState() : null;
  var oy = opens ? formatCapsuleDateTime(opens) : '';
  var summary = document.getElementById('smry');
  clearChildren(summary);
  summary.appendChild(createRow((cap ? (getCurrentLanguage() === 'tr' ? 'Kapsul tipi' : 'Capsule type') : (getCurrentLanguage() === 'tr' ? 'Tur' : 'Type')), cap ? (getCurrentLanguage() === 'tr' ? 'Zamana ayarli mesaj' : 'Scheduled message') : (getCurrentLanguage() === 'tr' ? 'Anlik iz' : 'Live mark')));
  summary.appendChild(createRow((getCurrentLanguage() === 'tr' ? 'İsim: ' : 'Name: ') + ST.name, '-'));
  if (cap) {
    summary.appendChild(createRow((getCurrentLanguage() === 'tr' ? 'Kime' : 'For'), ST.rc === 'o' ? (getCurrentLanguage() === 'tr' ? 'Baska biri' : 'Someone else') : (getCurrentLanguage() === 'tr' ? 'Kendim' : 'Myself')));
    summary.appendChild(createRow((getCurrentLanguage() === 'tr' ? 'Gorunurluk' : 'Visibility'), ST.capsuleVisibility === 'public'
      ? (getCurrentLanguage() === 'tr' ? 'Acildiginda haritada yayinlanir' : 'Publishes on the map when it opens')
      : (ST.capsuleVisibility === 'email'
        ? (getCurrentLanguage() === 'tr' ? 'Sadece email ile gider' : 'Delivered by email only')
        : (getCurrentLanguage() === 'tr' ? 'Ozel kalir' : 'Stays private'))));
    summary.appendChild(createRow((getCurrentLanguage() === 'tr' ? 'Acilis' : 'Opens'), oy || '-', '$2.00'));
    summary.appendChild(createRow((getCurrentLanguage() === 'tr' ? 'Hedef' : 'Recipient'), ST.rc === 'o' ? (getCurrentLanguage() === 'tr' ? 'Birine gonder' : 'Someone else') : (getCurrentLanguage() === 'tr' ? 'Kendim' : 'Myself')));
    summary.appendChild(createRow((getCurrentLanguage() === 'tr' ? 'Konum' : 'Location'), ST.locationConfirmed && ST.selName ? ST.selName : (getCurrentLanguage() === 'tr' ? 'Konum eklenmedi' : 'No location added')));
  } else {
    summary.appendChild(createRow((getCurrentLanguage() === 'tr' ? 'Tur' : 'Type'), getCurrentLanguage() === 'tr' ? 'Anlik iz' : 'Live mark'));
    summary.appendChild(createRow((getCurrentLanguage() === 'tr' ? 'Gorunurluk' : 'Visibility'), getCurrentLanguage() === 'tr' ? 'Simdi gorunur' : 'Visible now'));
    summary.appendChild(createRow(getCurrentLanguage() === 'tr' ? 'Koordinatlar' : 'Coordinates', ST.selLat ? ST.selLat.toFixed(4) + ', ' + ST.selLon.toFixed(4) : '-'));
  }
  summary.appendChild(createRow(getCurrentLanguage() === 'tr' ? 'Toplam' : 'Total', '$' + tot.toFixed(2), true));
}

function renderCountriesJump(container) {
  var groups = getCountryMarkGroups();
  if (!groups.length) {
    var empty = document.createElement('div');
    empty.style.cssText = 'padding:.25rem 0;font-size:.76rem;line-height:1.6;color:rgba(240,237,232,.45)';
    empty.textContent = t('empty_countries_jump');
    container.appendChild(empty);
    return;
  }
  groups.slice(0, 8).forEach(function(group) {
    var item = document.createElement('div');
    item.className = 'pitem';
    item.onclick = function() {
      var country = COUNTRIES.find(function(entry) { return entry.code === group.key || entry.name === group.name; });
      if (country) flyTo(country.lat, country.lon, getHeightForZoom(6));
    };
    var info = document.createElement('div');
    info.style.cssText = 'flex:1;min-width:0';
    var name = document.createElement('div');
    name.className = 'pnm2';
    name.textContent = group.name;
    var meta = document.createElement('div');
    meta.className = 'pct2';
    meta.textContent = getMarkWord(group.count) + ' • ' + t('discovery_jump_country');
    info.appendChild(name);
    info.appendChild(meta);
    item.appendChild(info);
    container.appendChild(item);
  });
}

function renderLists() {
  var pl = document.getElementById('plist');
  if (!pl) return;
  clearChildren(pl);
  if (window._marksLoading && !ST.pins.length) {
    var loading = document.createElement('div');
    loading.style.cssText = 'padding:.25rem 0 .6rem;font-size:.76rem;line-height:1.6;color:rgba(240,237,232,.5)';
    loading.textContent = t('loading_marks');
    pl.appendChild(loading);
    for (var i = 0; i < 3; i++) {
      var row = document.createElement('div');
      row.className = 'pitem';
      row.style.opacity = '.65';
      row.innerHTML = '<div class="piav"></div><div style="flex:1;min-width:0"><div class="pnm2" style="width:58%;height:12px;background:rgba(255,255,255,.08);border-radius:999px"></div><div class="pct2" style="width:42%;height:10px;background:rgba(255,255,255,.05);border-radius:999px;margin-top:8px"></div></div>';
      pl.appendChild(row);
    }
    return;
  }
  if (!ST.pins.length) {
    var empty = document.createElement('div');
    empty.style.cssText = 'padding:.25rem 0;font-size:.76rem;line-height:1.6;color:rgba(240,237,232,.45)';
    empty.textContent = t('empty_public_list');
    pl.appendChild(empty);
    var cta = document.createElement('button');
    cta.type = 'button';
    cta.textContent = AUTH.user ? t('empty_public_list_cta_signed_in') : t('empty_public_list_cta_signed_out');
    cta.style.cssText = 'margin-top:10px;background:rgba(200,169,110,.14);border:1px solid rgba(200,169,110,.28);color:#c8a96e;border-radius:999px;padding:8px 12px;font-size:.72rem;cursor:pointer;font-family:inherit;';
    cta.onclick = function() { AUTH.user ? (showGlobe(), openSb('mark')) : openAuth('login'); };
    pl.appendChild(cta);
    return;
  }
  if (CURRENT_QUICK_JUMP === 'countries') {
    renderCountriesJump(pl);
    return;
  }
  if (CURRENT_QUICK_JUMP === 'friends') {
    var friendsEmpty = document.createElement('div');
    friendsEmpty.style.cssText = 'padding:.25rem 0;font-size:.76rem;line-height:1.6;color:rgba(240,237,232,.45)';
    friendsEmpty.textContent = t('discovery_friends_placeholder');
    pl.appendChild(friendsEmpty);
    return;
  }
  var pins = getQuickJumpPins();
  if (!pins.length) {
    var modeEmpty = document.createElement('div');
    modeEmpty.style.cssText = 'padding:.25rem 0;font-size:.76rem;line-height:1.6;color:rgba(240,237,232,.45)';
    modeEmpty.textContent = CURRENT_QUICK_JUMP === 'my'
      ? t('empty_view_my')
      : t('empty_view_other');
    pl.appendChild(modeEmpty);
    return;
  }
  pins.slice(0, 5).forEach(function(p) {
    var cd = countdown(p);
    var item = document.createElement('div');
    item.className = 'pitem';
    item.onclick = function() { flyTo(p.lat, p.lon, getHeightForZoom(29)); };
    item.appendChild(createAvatarNode(p.photo, p.name, 'piav'));
    var info = document.createElement('div');
    info.style.cssText = 'flex:1;min-width:0';
    var name = document.createElement('div');
    name.className = 'pnm2';
    name.textContent = p.name;
    var meta = document.createElement('div');
    meta.className = 'pct2';
    meta.textContent = p.cname + (cd ? ' - ' + cd : '') + ' • ' + t('discovery_open_mark');
    info.appendChild(name);
    info.appendChild(meta);
    item.appendChild(info);
    var link = document.createElement('div');
    link.className = 'plk';
    link.textContent = '>';
    link.onclick = function(event) {
      event.stopPropagation();
      showShareCard(ST.pins.find(function(x) { return x.id === p.id; }));
    };
    item.appendChild(link);
    pl.appendChild(item);
  });
}

async function deleteMark(pinId, buttonEl) {
  if (!AUTH.user || !AUTH.user.id) {
    openAuth('login');
    return;
  }
  var pin = ST.pins.find(function(item) { return item.id === pinId; });
  if (!pin || pin.owner !== AUTH.user.id) {
    showToast(getCurrentLanguage() === 'tr' ? 'Yalnızca kendi izlerini silebilirsin.' : 'You can only delete your own marks.', 'error');
    return;
  }
  if (!window.confirm(getCurrentLanguage() === 'tr' ? 'Bu iz silinsin mi? Bu işlem geri alınamaz.' : 'Delete this mark? This cannot be undone.')) return;
  if (buttonEl) {
    buttonEl.disabled = true;
    buttonEl.textContent = getCurrentLanguage() === 'tr' ? 'Siliniyor...' : 'Deleting...';
  }
  var result = await _supabase.from('marks').delete().eq('id', pinId);
  if (result.error) {
    console.error('Delete error:', result.error);
    if (buttonEl) {
      buttonEl.disabled = false;
      buttonEl.textContent = getCurrentLanguage() === 'tr' ? 'Sil' : 'Delete';
    }
    showToast(result.error.message || (getCurrentLanguage() === 'tr' ? 'İz silinemedi.' : 'Could not delete your mark.'), 'error');
    return;
  }
  ST.pins = ST.pins.filter(function(item) { return item.id !== pinId; });
  if (window._lastPin && window._lastPin.id === pinId) window._lastPin = null;
  removePinEntity(pinId);
  updateStats();
  renderLists();
  showMarks();
  showToast(t('toast_mark_deleted'), 'success');
}

function buildProfileBio(marks) {
  if (AUTH.user && AUTH.user.meta && AUTH.user.meta.bio) return clampText(AUTH.user.meta.bio, 220);
  if (!marks.length) return getCurrentLanguage() === 'tr'
    ? 'Hikayen tek bir anlamli yerle baslar. Ilk izini birak ve kisisel haritani olusturmaya basla.'
    : 'Your story starts with one meaningful place. Drop your first mark and start building your personal map.';
  var countries = marks.map(function(mark) { return mark.cname; }).filter(function(value, index, arr) { return value && arr.indexOf(value) === index; });
  if (countries.length > 1) {
    return getCurrentLanguage() === 'tr'
      ? countries.length + ' ulkeye yayilan anlamli anilarin buyuyen bir haritasini tutuyorsun.'
      : 'Keeping a growing map of meaningful memories across ' + countries.length + ' countries.';
  }
  return getCurrentLanguage() === 'tr' ? 'Geri donmeye deger yerlerden kisisel bir ani haritasi kuruyorsun.' : 'Building a personal map of places worth remembering.';
}

function buildProfileSummary(marks, countries, capsules) {
  if (!marks.length) {
    return getCurrentLanguage() === 'tr'
      ? 'Henuz bir izin yok. Tek bir anlamli yerle basla, gerisi onun ustune kurulur.'
      : 'No marks yet. Start with one meaningful place and build the rest from there.';
  }
  var latest = marks.slice().sort(function(a, b) { return new Date(b.added || 0) - new Date(a.added || 0); })[0];
  var parts = [getMarkWord(marks.length)];
  parts.push(getCurrentLanguage() === 'tr' ? countries.length + ' ülke' : countries.length + ' countr' + (countries.length === 1 ? 'y' : 'ies'));
  if (capsules) parts.push(getCurrentLanguage() === 'tr' ? capsules + ' kapsül' : capsules + ' capsule' + (capsules === 1 ? '' : 's'));
  if (latest && latest.cname) parts.push(getCurrentLanguage() === 'tr' ? 'son durak ' + latest.cname : 'latest in ' + latest.cname);
  return parts.join(' • ');
}

function buildProfileBadgeLevel(markCount) {
  if (getCurrentLanguage() === 'tr') {
    if (markCount >= 25) return 'Dünya Kurucusu';
    if (markCount >= 10) return 'Ani Koruyucusu';
    if (markCount >= 3) return 'Harita Anlaticisi';
    if (markCount >= 1) return 'Ilk Iz';
    return 'Yeni Kâşif';
  }
  if (markCount >= 25) return 'Worldbuilder';
  if (markCount >= 10) return 'Memory Keeper';
  if (markCount >= 3) return 'Map Storyteller';
  if (markCount >= 1) return 'First Mark';
  return 'New Explorer';
}



