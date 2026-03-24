var MARK_SELECT_FIELDS = 'id,name,country_code,country_name,lat,lon,message,photo,capsule_days,created_at,user_id';

function normalizeMarkRecord(m) {
  if (!m) return null;

  var lat = parseFloat(m.lat);
  var lon = parseFloat(m.lon);
  if (!isFinite(lat) || !isFinite(lon)) return null;

  return {
    id: m.id,
    name: m.name || 'Unknown',
    code: m.country_code || '',
    cname: m.country_name || 'Unknown',
    lat: lat,
    lon: lon,
    msg: m.message || '',
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
      body.appendChild(item);
    });
  }
  document.getElementById('mmarks').classList.add('show');
  if (typeof syncOverlayState === 'function') syncOverlayState();
}

function showShareCard(pin) {
  if (!pin) return;
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
  document.getElementById('share-name').textContent = pin.name;
  document.getElementById('share-country').textContent = pin.cname;
  document.getElementById('share-msg').textContent = pin.msg ? '"' + pin.msg + '"' : '';
  document.getElementById('share-date').textContent = new Date(pin.added || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  if (typeof openShareModal === 'function') {
    openShareModal();
  } else {
    document.getElementById('share-modal').classList.add('show');
  }
}
