function getStepCopy() {
  if (getCurrentLanguage() === 'tr') {
    return {
      1: 'İzine kimlik kazandırmak için görünen bir isimle başla.',
      2: 'Küre üzerinde tam bir nokta seç ya da bir yer ara.',
      3: 'İzinle birlikte görünecek mesajı yaz.',
      4: 'Ne zaman açılacağını ve kime ait olacağını seç.',
      5: 'Özeti gözden geçir ve izini küreye bırak.'
    };
  }
  return {
    1: 'Start with a display name so your mark has an identity.',
    2: 'Pick an exact location on the globe or search for a place.',
    3: 'Write the message that will appear with your mark.',
    4: 'Choose when the mark opens and who it belongs to.',
    5: 'Review the summary and place your mark on the globe.'
  };
}

function getOnboardingSteps() {
  return getCurrentLanguage() === 'tr'
    ? ['Görünen ismini ekle', 'Tam yeri seç', 'Mesajını yaz', 'Kapsül zamanını seç', 'İzini kaydet ve paylaş']
    : ['Add your display name', 'Choose the exact place', 'Write the message', 'Pick capsule timing', 'Save and share your mark'];
}

function renderOnboardingChecklist(step) {
  var list = document.getElementById('onboard-list');
  if (!list) return;
  clearChildren(list);

  getOnboardingSteps().forEach(function(text, index) {
    var itemStep = index + 1;
    var item = document.createElement('div');
    item.className = 'onboard-item';
    if (step > itemStep) item.classList.add('done');
    if (step === itemStep) item.classList.add('current');

    var dot = document.createElement('div');
    dot.className = 'onboard-dot';
    dot.textContent = step > itemStep ? '✓' : String(itemStep);
    item.appendChild(dot);

    var copy = document.createElement('div');
    copy.textContent = text;
    item.appendChild(copy);

    list.appendChild(item);
  });
}

function shouldShowStartHint() {
  return !localStorage.getItem('iwh_started_flow');
}

function revealStartHint() {
  var hint = document.getElementById('start-hint');
  if (hint) hint.classList.toggle('hidden', !shouldShowStartHint());
}

function dismissStartHint() {
  localStorage.setItem('iwh_started_flow', 'dismissed');
  var hint = document.getElementById('start-hint');
  if (hint) hint.classList.add('hidden');
}

function openSb() {
  if (typeof startCreateFlow === 'function') {
    startCreateFlow();
    return;
  }
  document.getElementById('sb').classList.remove('hidden');
}

function closeSb() {
  document.getElementById('sb').classList.add('hidden');
}

function resetForm() {
  ST.name = '';
  ST.photo = null;
  ST.selCode = '';
  ST.selName = '';
  ST.selLat = null;
  ST.selLon = null;
  ST.yr = 1;
  ST.capsuleDays = 365;
  ST.capsuleDate = null;
  ST.rc = 's';
  ST.vis = 'pub';
  document.getElementById('iname').value = '';
  var prev = document.getElementById('prev');
  if (prev) prev.style.display = 'none';
  document.getElementById('loc-display').value = '';
  document.getElementById('csel').value = '';
  var quickMessageInput = document.getElementById('quick-imsg');
  if (quickMessageInput) quickMessageInput.value = '';
  document.getElementById('imsg').value = '';
  var submitBtn = document.getElementById('btn-submit-mark');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = t('save_my_mark');
  }
  document.getElementById('btn1').disabled = true;
  document.getElementById('btn2').disabled = true;
  var preciseCoords = document.getElementById('precise-coords');
  if (preciseCoords) preciseCoords.style.display = 'none';
  var clickCoords = document.getElementById('click-coords');
  if (clickCoords) clickCoords.style.display = 'none';
  if (tempMarker) {
    viewer.entities.remove(tempMarker);
    tempMarker = null;
  }
  ST.locationConfirmed = false;
  ST.createMode = false;
  ST.createStep = 0;
  if (typeof updateCreateFlowUI === 'function') updateCreateFlowUI();
  updateCapsuleUI();
  goS(1);
  revealStartHint();
}

function updateStepMeta(step) {
  var meta = document.getElementById('step-meta');
  var tip = document.getElementById('step-tip');
  if (!meta || !tip) return;

  if (step >= 1 && step <= 5) {
    meta.textContent = getCurrentLanguage() === 'tr' ? step + ' / 5. Adım' : 'Step ' + step + ' of 5';
    tip.textContent = getStepCopy()[step] || '';
  } else {
    meta.textContent = getCurrentLanguage() === 'tr' ? 'Tamamlandı' : 'Finished';
    tip.textContent = getCurrentLanguage() === 'tr'
      ? 'İzin kaydedildi. Paylaşabilir ya da yeni bir tane bırakabilirsin.'
      : 'Your mark has been saved. Share it or place another one.';
  }
  renderOnboardingChecklist(step >= 1 && step <= 5 ? step : 5);
}

function goS(n) {
  for (var i = 1; i <= 6; i++) {
    var s = document.getElementById('step' + i);
    if (s) s.classList.remove('active');
  }
  var active = document.getElementById('step' + n);
  if (active) active.classList.add('active');
  ST.createMode = n === 2;

  var dots = document.querySelectorAll('.dot');
  dots.forEach(function(d, i) {
    d.classList.remove('on', 'dn');
    if (i < n - 1) d.classList.add('dn');
    if (i === n - 1) d.classList.add('on');
  });
  updateStepMeta(n);
}

function proceedFromMessageStep() {
  var messageInput = document.getElementById('imsg');
  var message = clampText(messageInput.value, MAX_MESSAGE_LENGTH);
  messageInput.value = message;

  if (!message) {
    showToast(getCurrentLanguage() === 'tr' ? 'Devam etmeden önce bir mesaj ekle.' : 'Please add a message before continuing.');
    return;
  }

  goS(4);
}

function sRC(r) {
  ST.rc = r;
  document.getElementById('os').classList.toggle('on', r === 's');
  document.getElementById('oo').classList.toggle('on', r === 'o');
  document.getElementById('os').setAttribute('aria-pressed', r === 's' ? 'true' : 'false');
  document.getElementById('oo').setAttribute('aria-pressed', r === 'o' ? 'true' : 'false');
  document.getElementById('re').style.display = r === 'o' ? 'block' : 'none';
}

function proceedToReview() {
  var recipientInput = document.getElementById('iem');
  var recipientEmail = recipientInput ? normalizeEmail(recipientInput.value) : '';
  if (recipientInput) recipientInput.value = recipientEmail;

  if (ST.capsuleDays > 0 && ST.rc === 'o') {
    if (!recipientEmail) {
      showToast(getCurrentLanguage() === 'tr' ? 'Devam etmeden önce alıcı e-postasını gir.' : 'Please enter a recipient email before continuing.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      showToast(getCurrentLanguage() === 'tr' ? 'Geçerli bir alıcı e-postası gir.' : 'Please enter a valid recipient email.');
      return;
    }
  }

  bSmry();
  goS(5);
}

function updateCapsuleUI() {
  var hasCapsule = ST.capsuleDays > 0;
  var recipientBlock = document.getElementById('recipient-block');
  var note = document.getElementById('capsule-note');
  var preview = document.getElementById('opens-preview');
  if (recipientBlock) recipientBlock.classList.toggle('section-hidden', !hasCapsule);
  if (note) note.textContent = hasCapsule
    ? (getCurrentLanguage() === 'tr'
      ? 'Alıcı e-postası yalnızca gelecekte açılacak kapsülü başka birine gönderdiğinde gerekir.'
      : 'Recipient email is only needed when you send a future capsule to someone else.')
    : (getCurrentLanguage() === 'tr'
      ? 'Kapsül seçilmedi. Bu iz hemen herkese açık olarak kaydedilecek.'
      : 'No capsule selected. This will be saved as a public mark right away.');
  if (preview) preview.classList.toggle('section-hidden', !hasCapsule);
}

function setQuick(days, id) {
  ST.capsuleDays = days;
  ST.capsuleDate = null;
  ST.yr = days > 0 ? Math.max(1, Math.round(days / 365)) : 0;

  ['tq7', 'tq30', 'tq90', 'tq180', 'tq365', 'tq730', 'tq1825', 'tq9125', 'tq0', 'tqcustom'].forEach(function(i) {
    var el = document.getElementById(i);
    if (el) {
      el.classList.remove('on');
      el.setAttribute('aria-pressed', 'false');
    }
  });
  var el = document.getElementById(id);
  if (el) {
    el.classList.add('on');
    el.setAttribute('aria-pressed', 'true');
  }

  var cda = document.getElementById('custom-date-area');
  if (cda) cda.style.display = 'none';

  updateOpensPreview();
  updateCapsuleUI();
}

function toggleCustomDate() {
  ['tq7', 'tq30', 'tq90', 'tq180', 'tq365', 'tq730', 'tq1825', 'tq9125', 'tq0'].forEach(function(i) {
    var el = document.getElementById(i);
    if (el) {
      el.classList.remove('on');
      el.setAttribute('aria-pressed', 'false');
    }
  });
  var btn = document.getElementById('tqcustom');
  if (btn) {
    btn.classList.add('on');
    btn.setAttribute('aria-pressed', 'true');
  }

  var cda = document.getElementById('custom-date-area');
  if (cda) cda.style.display = 'block';
  updateCapsuleUI();

  var cd = document.getElementById('capsule-date');
  if (cd) {
    var now = new Date();
    now.setSeconds(0, 0);
    cd.min = now.toISOString().slice(0, 16);
    if (!cd.value) {
      var def = new Date();
      def.setSeconds(0, 0);
      cd.value = def.toISOString().slice(0, 16);
      setCustomDate(cd.value);
    }
  }
}

function setCustomDate(val) {
  if (!val) return;
  ST.capsuleDate = val;
  ST.capsuleDays = Math.round((new Date(val) - new Date()) / 86400000);
  ST.yr = Math.max(1, Math.round(ST.capsuleDays / 365));
  updateOpensPreview();

  var dp = document.getElementById('date-preview');
  if (dp) {
    var d = new Date(val);
    dp.textContent = (getCurrentLanguage() === 'tr' ? 'Açılır: ' : 'Opens ') + d.toLocaleString(getCurrentLocale(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    dp.style.display = 'block';
  }
}

function updateOpensPreview() {
  var el = document.getElementById('opens-date-text');
  var preview = document.getElementById('opens-preview');
  if (!el) return;

  if (!ST.capsuleDays && ST.capsuleDays !== 0) ST.capsuleDays = 365;

  if (ST.capsuleDays === 0) {
    el.textContent = getCurrentLanguage() === 'tr' ? 'Kapsül yok - sadece iz' : 'No capsule - mark only';
    if (preview) preview.style.opacity = '.4';
    return;
  }

  if (preview) preview.style.opacity = '1';

  var opens;
  if (ST.capsuleDate) {
    opens = new Date(ST.capsuleDate);
  } else {
    opens = new Date();
    opens.setDate(opens.getDate() + ST.capsuleDays);
  }

  var days = ST.capsuleDays;
  var timeStr = formatRelativeDurationDays(days);
  el.textContent = timeStr + ' - ' + opens.toLocaleString(getCurrentLocale(), { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function updateUserUI() {
  var chip = document.getElementById('signin-btn');
  var chip2 = document.getElementById('signin-btn2');
  var signoutBtn = document.getElementById('signout-btn');
  if (AUTH.user) {
    if (chip) chip.textContent = AUTH.user.name.split(' ')[0];
    if (chip2) chip2.textContent = AUTH.user.name.split(' ')[0];
    if (signoutBtn) signoutBtn.style.display = 'inline-block';
  } else {
    if (chip) chip.textContent = t('nav_sign_in');
    if (chip2) chip2.textContent = t('nav_sign_in');
    if (signoutBtn) signoutBtn.style.display = 'none';
  }
  if (typeof syncPinLOD === 'function') syncPinLOD(true);
}

function openAuth(tab) {
  document.getElementById('auth-modal').classList.add('show');
  syncOverlayState();
  switchTab(tab || 'login');
  setTimeout(function() {
    var e = document.getElementById('aemail');
    if (e) e.focus();
  }, 300);
}

function signInWithGoogle() {
  if (!_supabase) {
    showToast(getCurrentLanguage() === 'tr' ? 'Servis kullanılamıyor.' : 'Service unavailable.');
    return;
  }
  _supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });
}

function closeAuth() {
  document.getElementById('auth-modal').classList.remove('show');
  syncOverlayState();
}

function switchTab(tab) {
  var isLogin = tab === 'login';
  var isRegister = tab === 'register';
  var isForgot = tab === 'forgot';
  document.getElementById('tab-l').classList.toggle('on', isLogin);
  document.getElementById('tab-r').classList.toggle('on', isRegister);
  document.getElementById('atitle').textContent = isLogin ? t('auth_welcome_back') : (isRegister ? t('auth_create_account') : t('auth_reset_password'));
  document.getElementById('asub').textContent = isLogin
    ? t('auth_sign_in_sub')
    : (isRegister ? t('auth_register_sub') : t('auth_forgot_sub'));
  document.getElementById('auth-btn').textContent = isLogin ? t('nav_sign_in') : (isRegister ? t('auth_create_account') : (getCurrentLanguage() === 'tr' ? 'Sıfırlama bağlantısı gönder' : 'Send reset link'));
  document.getElementById('name-f').style.display = isRegister ? 'block' : 'none';
  document.getElementById('terms-check').style.display = isRegister ? 'block' : 'none';
  document.getElementById('password-field').style.display = isForgot ? 'none' : 'block';
  document.getElementById('forgot-link-row').style.display = isLogin ? 'flex' : 'none';
  document.getElementById('back-to-login-row').style.display = isForgot ? 'flex' : 'none';
  document.getElementById('tab-l').style.display = isForgot ? 'none' : 'block';
  document.getElementById('tab-r').style.display = isForgot ? 'none' : 'block';
  document.getElementById('auth-modal').dataset.tab = tab;
}

function submitAuth() {
  var modal = document.getElementById('auth-modal');
  var tab = (modal && modal.dataset.tab) || 'login';
  var email = document.getElementById('aemail').value.trim();
  var pw = document.getElementById('apw').value;
  var nameEl = document.getElementById('aname');
  var name = nameEl ? nameEl.value.trim() : '';
  var btn = document.getElementById('auth-btn');
  if (tab === 'register' && !document.getElementById('terms-agree').checked) {
    showToast(getCurrentLanguage() === 'tr' ? 'Lütfen Hizmet Şartları ve Gizlilik Politikasını kabul et.' : 'Please accept the Terms of Service and Privacy Policy.');
    return;
  }
  if (!email || (tab !== 'forgot' && !pw)) {
    btn.style.animation = 'shake .4s';
    setTimeout(function() { btn.style.animation = ''; }, 400);
    return;
  }
  btn.textContent = '...';
  btn.disabled = true;
  var promise;
  if (tab === 'register') {
    promise = _supabase.auth.signUp({ email: email, password: pw, options: { data: { name: name } } });
  } else if (tab === 'forgot') {
    promise = _supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
  } else {
    promise = _supabase.auth.signInWithPassword({ email: email, password: pw });
  }
  promise.then(function(result) {
    btn.textContent = tab === 'login' ? t('nav_sign_in') : (tab === 'register' ? t('auth_create_account') : (getCurrentLanguage() === 'tr' ? 'Sıfırlama bağlantısı gönder' : 'Send reset link'));
    btn.disabled = false;
    if (result.error) {
      showToast(result.error.message || (getCurrentLanguage() === 'tr' ? 'Bir hata oluştu. Tekrar dene.' : 'Error. Please try again.'), 'error');
      var pwEl = document.getElementById('apw');
      if (pwEl && tab !== 'forgot') {
        pwEl.style.borderColor = 'rgba(220,60,60,.6)';
        setTimeout(function() { pwEl.style.borderColor = ''; }, 1500);
      }
      return;
    }
    if (tab === 'forgot') {
      showToast(getCurrentLanguage() === 'tr' ? 'Şifre sıfırlama bağlantısı gönderildi. E-postanı kontrol et.' : 'Password reset link sent. Check your email.', 'success');
      switchTab('login');
      return;
    }
    showToast(tab === 'register'
      ? (getCurrentLanguage() === 'tr' ? 'Hesap oluşturuldu. Artık giriş yapabilirsin.' : 'Account created! You can now sign in.')
      : (getCurrentLanguage() === 'tr' ? 'Tekrar hoş geldin!' : 'Welcome back!'), 'success');
    closeAuth();
  }).catch(function(err) {
    btn.textContent = tab === 'login' ? t('nav_sign_in') : (tab === 'register' ? t('auth_create_account') : (getCurrentLanguage() === 'tr' ? 'Sıfırlama bağlantısı gönder' : 'Send reset link'));
    btn.disabled = false;
    showToast(err.message || (getCurrentLanguage() === 'tr' ? 'Bir hata oluştu. Tekrar dene.' : 'Error. Please try again.'), 'error');
  });
}

function signOut() {
  _supabase.auth.signOut().then(function() {
    AUTH.user = null;
    updateUserUI();
    showToast(getCurrentLanguage() === 'tr' ? 'Çıkış yapıldı.' : 'Signed out.', 'success');
  });
}

function closeMarks() {
  document.getElementById('mmarks').classList.remove('show');
  syncOverlayState();
}

function closeProfile() {
  document.getElementById('profile-modal').classList.remove('show');
  syncOverlayState();
}

function openMarksFromProfile() {
  closeProfile();
  showMarks();
}

function openShareModal() {
  document.getElementById('share-modal').classList.add('show');
  syncOverlayState();
}

function closeShareModal() {
  document.getElementById('share-modal').classList.remove('show');
  syncOverlayState();
}

function syncOverlayState() {
  var hasOpenOverlay =
    document.getElementById('auth-modal').classList.contains('show') ||
    document.getElementById('mmarks').classList.contains('show') ||
    document.getElementById('profile-modal').classList.contains('show') ||
    document.getElementById('share-modal').classList.contains('show');
  document.body.style.overflow = hasOpenOverlay ? 'hidden' : '';
}

function showToast(msg, tone) {
  var old = document.getElementById('iwh-toast');
  if (old) old.remove();
  var t = document.createElement('div');
  t.id = 'iwh-toast';
  t.textContent = msg;
  t.setAttribute('role', tone === 'error' ? 'alert' : 'status');
  t.setAttribute('aria-live', tone === 'error' ? 'assertive' : 'polite');
  t.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:rgba(8,14,24,.97);border:1px solid rgba(200,169,110,.35);border-radius:24px;padding:11px 24px;font-size:.82rem;color:#f0ede8;z-index:1000;white-space:normal;text-align:center;max-width:min(92vw,420px);backdrop-filter:blur(16px);font-family:sans-serif;transition:opacity .3s';
  if (tone === 'success') t.style.borderColor = 'rgba(70,190,120,.45)';
  if (tone === 'error') t.style.borderColor = 'rgba(220,90,90,.45)';
  document.body.appendChild(t);
  setTimeout(function() {
    t.style.opacity = '0';
    setTimeout(function() { t.remove(); }, 300);
  }, 2500);
}

function syncMemoryMessage(value, source) {
  var next = clampText(value || '', MAX_MESSAGE_LENGTH);
  var quickInput = document.getElementById('quick-imsg');
  var mainInput = document.getElementById('imsg');

  if (source !== 'quick' && quickInput && quickInput.value !== next) {
    quickInput.value = next;
  }
  if (source !== 'main' && mainInput && mainInput.value !== next) {
    mainInput.value = next;
  }
}

function getStepCopy() {
  if (getCurrentLanguage() === 'tr') {
    return {
      1: 'Gorunen bir isimle basla ve izine kimlik kazandir.',
      2: 'Kure uzerinde tam bir nokta sec ya da bir yer ara.',
      3: 'Izin hemen mi gorunecek yoksa kapsul olarak mi acilacak buna karar ver.',
      4: 'Sectigin iz ya da kapsul icin kaydedilecek mesaji yaz.',
      5: 'Ozeti gozden gecir ve izini kureye birak.'
    };
  }
  return {
    1: 'Start with a display name so your mark has an identity.',
    2: 'Pick an exact location on the globe or search for a place.',
    3: 'Decide whether this should stay public now or open later as a capsule.',
    4: 'Write the message that will be saved with this mark or future capsule.',
    5: 'Review the summary and place your mark on the globe.'
  };
}

function getOnboardingSteps() {
  return getCurrentLanguage() === 'tr'
    ? ['Gorunen ismini ekle', 'Tam yeri sec', 'Kapsul zamanini sec', 'Mesajini yaz', 'Izini kaydet ve paylas']
    : ['Add your display name', 'Choose the exact place', 'Pick capsule timing', 'Write your message', 'Save and share your mark'];
}

function proceedFromCapsuleStep() {
  var recipientInput = document.getElementById('iem');
  var recipientEmail = recipientInput ? normalizeEmail(recipientInput.value) : '';
  if (recipientInput) recipientInput.value = recipientEmail;

  if (ST.capsuleDays > 0 && ST.rc === 'o') {
    if (!recipientEmail) {
      showToast(getCurrentLanguage() === 'tr' ? 'Devam etmeden once alici e-postasini gir.' : 'Please enter a recipient email before continuing.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      showToast(getCurrentLanguage() === 'tr' ? 'Gecerli bir alici e-postasi gir.' : 'Please enter a valid recipient email.');
      return;
    }
  }

  goS(4);
}

function proceedFromMessageStep() {
  var messageInput = document.getElementById('imsg');
  var message = clampText(messageInput.value, MAX_MESSAGE_LENGTH);
  messageInput.value = message;

  if (!message) {
    showToast(getCurrentLanguage() === 'tr' ? 'Devam etmeden once bir mesaj ekle.' : 'Please add a message before continuing.');
    return;
  }

  bSmry();
  goS(5);
}

function proceedToReview() {
  proceedFromMessageStep();
}
