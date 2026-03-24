var MARK_SELECT_FIELDS = 'id,name,country_code,country_name,lat,lon,message,photo,capsule_days,created_at,user_id';
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
  tn.textContent = pin.name + (isOwner ? ' • Your mark' : '');
  tc.textContent = pin.cname + ' • ' + pin.lat.toFixed(3) + ', ' + pin.lon.toFixed(3);
  tm.textContent = pin.msg || ('Saved ' + new Date(pin.added || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));

  tt.classList.add('show');
  positionTooltip(tt, x, y);
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

function bSmry() {
  var cap = ST.capsuleDays > 0;
  var tot = 1 + (cap ? 2 : 0);
  var opens;
  if (ST.capsuleDate) {
    opens = new Date(ST.capsuleDate);
  } else {
    opens = new Date();
    opens.setDate(opens.getDate() + (ST.capsuleDays || 365));
  }
  var oy = opens.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  var summary = document.getElementById('smry');
  clearChildren(summary);
  summary.appendChild(createRow('Globe mark - ' + (ST.selName || '-'), '$1.00'));
  summary.appendChild(createRow('Name: ' + ST.name, '-'));
  summary.appendChild(createRow('Coordinates', ST.selLat ? ST.selLat.toFixed(4) + ', ' + ST.selLon.toFixed(4) : '-'));
  summary.appendChild(createRow('Photo', ST.photo ? 'Yes' : 'None'));
  if (cap) summary.appendChild(createRow('Capsule - opens ' + oy, '$2.00'));
  summary.appendChild(createRow('Total', '$' + tot.toFixed(2), true));
}

function renderLists() {
  var pl = document.getElementById('plist');
  if (!pl) return;

  clearChildren(pl);
  if (!ST.pins.length) {
    var empty = document.createElement('div');
    empty.style.cssText = 'padding:.25rem 0;font-size:.76rem;line-height:1.6;color:rgba(240,237,232,.45)';
    empty.textContent = 'No public marks yet. Your first saved mark will appear here.';
    pl.appendChild(empty);
    return;
  }

  ST.pins.slice(0, 5).forEach(function(p) {
    var cd = countdown(p.added, p.years);

    var item = document.createElement('div');
    item.className = 'pitem';
    item.onclick = function() { flyTo(p.lat, p.lon, 800000); };

    item.appendChild(createAvatarNode(p.photo, p.name, 'piav'));

    var info = document.createElement('div');
    info.style.cssText = 'flex:1;min-width:0';

    var name = document.createElement('div');
    name.className = 'pnm2';
    name.textContent = p.name;
    info.appendChild(name);

    var meta = document.createElement('div');
    meta.className = 'pct2';
    meta.textContent = p.cname + (cd ? ' - ' + cd : '');
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

function removePinEntity(pinId) {
  if (!viewer || !pinId) return;
  pinEntities = pinEntities.filter(function(entity) {
    var matchesDirect = entity && entity.iwhPinId === pinId;
    var matchesProperty = entity && entity.properties && entity.properties.id && typeof entity.properties.id.getValue === 'function' && entity.properties.id.getValue() === pinId;
    if (matchesDirect || matchesProperty) {
      viewer.entities.remove(entity);
      return false;
    }
    return true;
  });
}

async function deleteMark(pinId, buttonEl) {
  if (!AUTH.user || !AUTH.user.id) {
    openAuth('login');
    return;
  }

  var pin = ST.pins.find(function(item) { return item.id === pinId; });
  if (!pin || pin.owner !== AUTH.user.id) {
    showToast('You can only delete your own marks.', 'error');
    return;
  }

  if (!window.confirm('Delete this mark? This cannot be undone.')) return;

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
    showToast(result.error.message || 'Could not delete your mark.', 'error');
    return;
  }

  ST.pins = ST.pins.filter(function(item) { return item.id !== pinId; });
  if (window._lastPin && window._lastPin.id === pinId) window._lastPin = null;
  removePinEntity(pinId);
  updateStats();
  renderLists();
  showMarks();
  showToast('Mark deleted.', 'success');
}

function buildProfileBio(marks) {
  if (AUTH.user && AUTH.user.meta && AUTH.user.meta.bio) {
    return clampText(AUTH.user.meta.bio, 220);
  }
  if (!marks.length) {
    return 'You have not placed a mark yet. Start with your first location and build your story on the globe.';
  }
  var countries = marks.map(function(mark) { return mark.cname; }).filter(function(value, index, arr) { return value && arr.indexOf(value) === index; });
  if (countries.length > 1) {
    return 'Tracking meaningful places across ' + countries.length + ' countries on I Was Here.';
  }
  return 'Building a personal map of memories on I Was Here.';
}

function renderProfileRecent(container, marks) {
  clearChildren(container);

  if (!marks.length) {
    var empty = document.createElement('div');
    empty.className = 'pempty';
    empty.textContent = 'No personal activity yet. Your saved marks will appear here.';
    container.appendChild(empty);
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
      flyTo(p.lat, p.lon, 500000);
    };

    item.appendChild(createAvatarNode(p.photo, p.name, 'pravatar'));

    var info = document.createElement('div');
    info.className = 'prinfo';

    var name = document.createElement('div');
    name.className = 'prname';
    name.textContent = p.cname;
    info.appendChild(name);

    var meta = document.createElement('div');
    meta.className = 'prmeta';
    meta.textContent = new Date(p.added || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + (p.years ? ' - capsule active' : '');
    info.appendChild(meta);

    if (p.msg) {
      var msg = document.createElement('div');
      msg.className = 'prmsg';
      msg.textContent = '"' + p.msg + '"';
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
  var countries = marks.map(function(p) { return p.code || p.cname; }).filter(function(value, index, arr) {
    return value && arr.indexOf(value) === index;
  });
  var capsules = marks.filter(function(p) { return p.years > 0; }).length;
  var avatarSource = marks.find(function(p) { return safeImageUrl(p.photo); });

  var avatar = document.getElementById('profile-avatar');
  clearChildren(avatar);
  avatar.appendChild(createAvatarNode(avatarSource ? avatarSource.photo : '', AUTH.user.name, ''));

  document.getElementById('profile-name').textContent = AUTH.user.name;
  document.getElementById('profile-meta').textContent = AUTH.user.email;
  document.getElementById('profile-bio').textContent = buildProfileBio(marks);
  document.getElementById('profile-stat-marks').textContent = marks.length;
  document.getElementById('profile-stat-countries').textContent = countries.length;
  document.getElementById('profile-stat-capsules').textContent = capsules;
  renderProfileRecent(document.getElementById('profile-recent'), marks);

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

  clearChildren(body);
  if (!marks.length) {
    var empty = document.createElement('div');
    empty.style.cssText = 'text-align:center;padding:3rem 1rem;font-size:.85rem;color:rgba(240,237,232,.35)';
    empty.appendChild(document.createTextNode('No marks yet.'));
    empty.appendChild(document.createElement('br'));
    empty.appendChild(document.createElement('br'));

    var cta = document.createElement('button');
    cta.textContent = 'Place my first mark';
    cta.onclick = function() { closeMarks(); showGlobe(); };
    cta.style.cssText = 'background:#c8a96e;color:#020408;border:none;border-radius:20px;padding:9px 22px;cursor:pointer;font-size:.82rem;font-family:sans-serif';
    empty.appendChild(cta);
    body.appendChild(empty);
  } else {
    marks.forEach(function(p) {
      var cd = countdown(p.added, p.years);

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
      date.textContent = new Date(p.added || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      info.appendChild(date);

      if (p.msg) {
        var msg = document.createElement('div');
        msg.className = 'mmsg';
        msg.textContent = '"' + p.msg + '"';
        info.appendChild(msg);
      }

        if (p.years) {
          var cap = document.createElement('div');
          cap.className = 'mcap';
          cap.textContent = 'Opens in ' + cd;
          info.appendChild(cap);
        }

        item.appendChild(info);

        var actions = document.createElement('div');
        actions.className = 'mact';

        var del = document.createElement('button');
        del.type = 'button';
        del.className = 'mdel';
        del.textContent = 'Delete';
        del.setAttribute('aria-label', 'Delete mark in ' + p.cname);
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
  document.getElementById('share-headline').textContent = 'Share this mark';
  document.getElementById('share-name').textContent = pin.name;
  document.getElementById('share-country').textContent = 'I Was Here in ' + pin.cname;
  document.getElementById('share-coords').textContent = pin.lat.toFixed(2) + ', ' + pin.lon.toFixed(2);
  document.getElementById('share-msg').textContent = pin.msg ? '"' + pin.msg + '"' : 'A new mark on the globe.';
  document.getElementById('share-date').textContent = new Date(pin.added || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  if (typeof openShareModal === 'function') {
    openShareModal();
  } else {
    document.getElementById('share-modal').classList.add('show');
  }
}
