function getComposerType() {
  return ST && ST.composerType === 'capsule' ? 'capsule' : 'mark';
}

function isCapsuleComposer() {
  return getComposerType() === 'capsule';
}

function getComposerStepSequence() {
  return isCapsuleComposer() ? [1, 4, 3, 2, 5] : [1, 2, 4, 5];
}

function getComposerStepIndex(step) {
  return getComposerStepSequence().indexOf(step);
}

function getComposerStepNumber(step) {
  var index = getComposerStepIndex(step);
  return index >= 0 ? index + 1 : getComposerStepSequence().length;
}

function getPreviousComposerStep(step) {
  var sequence = getComposerStepSequence();
  var index = sequence.indexOf(step);
  return index > 0 ? sequence[index - 1] : sequence[0];
}

function getStepCopy() {
  if (getCurrentLanguage() === 'tr') {
    return isCapsuleComposer()
      ? {
          1: 'Bu kapsulu birakacak ismi sec.',
          4: 'Gelecekte okunacak mesaji yaz.',
          3: 'Ne zaman acilacagini ve kime ait oldugunu belirle.',
          2: 'Mesajin baglanacagi yeri son adim olarak sec.',
          5: 'Ozeti kontrol et ve kapsulu planla.'
        }
      : {
          1: 'Gorunen bir isimle basla ve izine kimlik kazandir.',
          2: 'Kure uzerinde tam bir nokta sec ya da bir yer ara.',
          4: 'Bu yerle birlikte haritada gorunecek mesaji yaz.',
          5: 'Ozeti gozden gecir ve izini birak.'
        };
  }
  return isCapsuleComposer()
    ? {
        1: 'Choose the name that will sign this capsule.',
        4: 'Write the message that will be opened later.',
        3: 'Choose when it opens and who it is for.',
        2: 'Choose the place that will anchor it at the end.',
        5: 'Review the details and schedule the capsule.'
      }
    : {
        1: 'Start with a display name so your mark has an identity.',
        2: 'Pick an exact location on the globe or search for a place.',
        4: 'Write the message that will be shown with this place.',
        5: 'Review the summary and leave your mark.'
      };
}

function getOnboardingSteps() {
  if (getCurrentLanguage() === 'tr') {
    return isCapsuleComposer()
      ? ['Gorunen ismini ekle', 'Mesajini yaz', 'Acilis zamanini belirle', 'Kapsul yeri sec', 'Kapsulu planla']
      : ['Gorunen ismini ekle', 'Tam yeri sec', 'Mesajini yaz', 'Izini birak'];
  }
  return isCapsuleComposer()
    ? ['Add your display name', 'Write the message', 'Pick when it opens', 'Choose the capsule place', 'Schedule the capsule']
    : ['Add your display name', 'Choose the place', 'Write your message', 'Leave your mark'];
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
    dot.textContent = step > itemStep ? 'OK' : String(itemStep);
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

function openSb(type) {
  if ((type || 'mark') === 'capsule' && ST && ST.capsuleFeatureAvailable === false) {
    showToast(typeof getCapsuleUnavailableMessage === 'function'
      ? getCapsuleUnavailableMessage()
      : 'Capsules are temporarily unavailable right now.', 'error');
    return;
  }
  if (typeof startCreateFlow === 'function') {
    startCreateFlow(type || 'mark');
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
  ST.yr = 0;
  ST.capsuleDays = 0;
  ST.capsuleDate = null;
  ST.rc = 's';
  ST.vis = 'pub';
  ST.capsuleVisibility = 'private';
  ST.capsuleOccasion = 'future_self';
  ST.capsuleHasLocation = false;
  ST.composerType = 'mark';
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
  var recipientEmail = document.getElementById('iem');
  if (recipientEmail) recipientEmail.value = '';
  var recipientSelf = document.getElementById('os');
  var recipientOther = document.getElementById('oo');
  if (recipientSelf) {
    recipientSelf.classList.add('on');
    recipientSelf.setAttribute('aria-pressed', 'true');
  }
  if (recipientOther) {
    recipientOther.classList.remove('on');
    recipientOther.setAttribute('aria-pressed', 'false');
  }
  var recipientWrap = document.getElementById('re');
  if (recipientWrap) recipientWrap.style.display = 'none';
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
  setQuick(0, 'tq0');
  goS(1);
  revealStartHint();
}

function updateStepMeta(step) {
  var meta = document.getElementById('step-meta');
  var tip = document.getElementById('step-tip');
  if (!meta || !tip) return;
  var totalSteps = getComposerStepSequence().length;
  var currentStep = getComposerStepNumber(step);

  if (getComposerStepIndex(step) >= 0) {
    meta.textContent = getCurrentLanguage() === 'tr'
      ? currentStep + ' / ' + totalSteps + '. Adim'
      : 'Step ' + currentStep + ' of ' + totalSteps;
    tip.textContent = getStepCopy()[step] || '';
  } else {
    meta.textContent = getCurrentLanguage() === 'tr' ? 'Tamamlandi' : 'Finished';
    tip.textContent = getCurrentLanguage() === 'tr'
      ? (isCapsuleComposer()
        ? 'Kapsulun kaydedildi. Paylasabilir ya da yeni bir tane planlayabilirsin.'
        : 'Izin kaydedildi. Paylasabilir ya da yeni bir tane birakabilirsin.')
      : (isCapsuleComposer()
        ? 'Your capsule has been saved. Share it or schedule another one.'
        : 'Your mark has been saved. Share it or place another one.');
  }
  renderOnboardingChecklist(getComposerStepIndex(step) >= 0 ? step : getComposerStepSequence()[totalSteps - 1]);
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
  var sequence = getComposerStepSequence();
  var currentIndex = getComposerStepIndex(n);
  dots.forEach(function(d, i) {
    d.classList.remove('on', 'dn');
    d.style.display = i < sequence.length ? 'inline-flex' : 'none';
    if (i >= sequence.length) return;
    if (i < currentIndex) d.classList.add('dn');
    if (i === currentIndex) d.classList.add('on');
  });
  updateStepMeta(n);
}

function getCapsuleScheduleDateFromState() {
  if (!(ST.capsuleDays > 0 || ST.capsuleDate)) return null;
  if (ST.capsuleDate) {
    var customDate = new Date(ST.capsuleDate);
    return isFinite(customDate.getTime()) ? customDate : null;
  }
  var quickDate = new Date();
  quickDate.setSeconds(0, 0);
  return new Date(quickDate.getTime() + ((ST.capsuleDays || 0) * 86400000));
}

function proceedFromCapsuleStep() {
  if (!isCapsuleComposer()) {
    goS(4);
    return;
  }
  var recipientInput = document.getElementById('iem');
  var recipientEmail = recipientInput ? normalizeEmail(recipientInput.value) : '';
  if (recipientInput) recipientInput.value = recipientEmail;

  if (ST.capsuleDays > 0) {
    var releaseDate = getCapsuleScheduleDateFromState();
    if (!releaseDate) {
      showToast(getCurrentLanguage() === 'tr' ? 'Lutfen gecerli bir kapsul zamani sec.' : 'Please choose a valid capsule time.', 'error');
      return;
    }
    if (releaseDate.getTime() <= Date.now()) {
      showToast(getCurrentLanguage() === 'tr' ? 'Kapsul zamani gelecekte olmali.' : 'Capsule time must be in the future.', 'error');
      return;
    }
  }

  if (ST.capsuleDays > 0 && ST.rc === 'o') {
    if (!recipientEmail) {
      showToast(getCurrentLanguage() === 'tr' ? 'Devam etmeden once alici e-postasini gir.' : 'Add a recipient email before continuing.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      showToast(getCurrentLanguage() === 'tr' ? 'Gecerli bir alici e-postasi gir.' : 'Enter a valid recipient email.');
      return;
    }
  }

  goS(2);
}

function proceedFromMessageStep() {
  var messageInput = document.getElementById('imsg');
  var message = clampText(messageInput.value, MAX_MESSAGE_LENGTH);
  messageInput.value = message;

  if (!message) {
    showToast(getCurrentLanguage() === 'tr' ? 'Devam etmeden once bir mesaj ekle.' : 'Add a message before continuing.');
    return;
  }

  bSmry();
  goS(isCapsuleComposer() ? 3 : 5);
}

function proceedToReview() {
  proceedFromMessageStep();
}

function proceedFromIdentityStep() {
  goS(isCapsuleComposer() ? 4 : 2);
}

function goBackFromMessageStep() {
  goS(getPreviousComposerStep(4));
}

function goBackFromReviewStep() {
  goS(getPreviousComposerStep(5));
}

function goBackFromLocationStep() {
  goS(getPreviousComposerStep(2));
}

function goBackFromCapsuleStep() {
  goS(getPreviousComposerStep(3));
}

function sRC(r) {
  if (r === 'o' && typeof isCapsuleEmailEnabled === 'function' && !isCapsuleEmailEnabled()) {
    showToast(getCurrentLanguage() === 'tr' ? 'Aliciya teslim ozelligi henuz acik degil.' : 'Recipient delivery is not enabled yet.', 'error');
    return;
  }
  ST.rc = r;
  document.getElementById('os').classList.toggle('on', r === 's');
  document.getElementById('oo').classList.toggle('on', r === 'o');
  document.getElementById('os').setAttribute('aria-pressed', r === 's' ? 'true' : 'false');
  document.getElementById('oo').setAttribute('aria-pressed', r === 'o' ? 'true' : 'false');
  document.getElementById('re').style.display = r === 'o' ? 'block' : 'none';
  if (r === 'o' && ST.capsuleOccasion === 'future_self') {
    setCapsuleOccasion('gift');
  }
}

function setCapsuleOccasion(occasion) {
  ST.capsuleOccasion = occasion || 'future_self';
  ['future', 'birthday', 'anniversary', 'gift', 'custom'].forEach(function(key) {
    var id = 'capsule-occ-' + key;
    var el = document.getElementById(id);
    if (!el) return;
    var current = (
      (key === 'future' && ST.capsuleOccasion === 'future_self') ||
      (key !== 'future' && ST.capsuleOccasion === key)
    );
    el.classList.toggle('on', current);
    el.setAttribute('aria-pressed', current ? 'true' : 'false');
  });
}

function setCapsuleVisibility(visibility) {
  if (visibility === 'email' && typeof isCapsuleEmailEnabled === 'function' && !isCapsuleEmailEnabled()) {
    showToast(getCurrentLanguage() === 'tr' ? 'Sadece email secenegi henuz aktif degil.' : 'Email-only capsules are not enabled yet.', 'error');
    return;
  }
  ST.capsuleVisibility = visibility || 'private';
  ['private', 'public', 'email'].forEach(function(key) {
    var el = document.getElementById('capsule-vis-' + key);
    if (!el) return;
    var current = ST.capsuleVisibility === key;
    el.classList.toggle('on', current);
    el.setAttribute('aria-pressed', current ? 'true' : 'false');
  });
  if (ST.capsuleVisibility === 'public') {
    ST.capsuleHasLocation = true;
  } else if (!ST.locationConfirmed) {
    ST.capsuleHasLocation = false;
  }
  updateCapsuleUI();
  if (typeof updateCreateFlowUI === 'function') updateCreateFlowUI();
}

function updateCapsuleUI() {
  var hasCapsule = ST.composerType === 'capsule';
  var emailEnabled = typeof isCapsuleEmailEnabled === 'function' ? isCapsuleEmailEnabled() : false;
  var recipientBlock = document.getElementById('recipient-block');
  var recipientOther = document.getElementById('oo');
  var recipientEmailWrap = document.getElementById('re');
  var note = document.getElementById('capsule-note');
  var preview = document.getElementById('opens-preview');
  var locationNote = document.getElementById('capsule-location-note');
  var skipLocation = document.getElementById('btn-skip-location');
  var emailVisibility = document.getElementById('capsule-vis-email');
  var giftOccasion = document.getElementById('capsule-occ-gift');
  if (!emailEnabled) {
    if (ST.rc === 'o') ST.rc = 's';
    if (ST.capsuleVisibility === 'email') ST.capsuleVisibility = 'private';
  }
  if (recipientBlock) recipientBlock.classList.toggle('section-hidden', !hasCapsule);
  if (recipientOther) {
    recipientOther.classList.toggle('section-hidden', !emailEnabled);
    recipientOther.setAttribute('aria-disabled', emailEnabled ? 'false' : 'true');
  }
  if (recipientEmailWrap && !emailEnabled) recipientEmailWrap.style.display = 'none';
  if (emailVisibility) {
    emailVisibility.classList.toggle('section-hidden', !emailEnabled);
    emailVisibility.setAttribute('aria-disabled', emailEnabled ? 'false' : 'true');
  }
  if (giftOccasion) {
    giftOccasion.classList.toggle('section-hidden', !emailEnabled);
    giftOccasion.setAttribute('aria-disabled', emailEnabled ? 'false' : 'true');
  }
  if (note) {
    if (!hasCapsule) {
      note.textContent = t('visibility_note_public');
    } else if (!emailEnabled && ST.capsuleVisibility !== 'public') {
      note.textContent = getCurrentLanguage() === 'tr'
        ? 'Kapsul acilana kadar gizli kalir. Aliciya email teslimati bu ortamda henuz aktif degil.'
        : 'The capsule stays hidden until it opens. Recipient email delivery is not enabled in this environment yet.';
    } else if (ST.capsuleVisibility === 'public') {
      note.textContent = getCurrentLanguage() === 'tr'
        ? 'Acildiginda haritada yayinlanir. Bu secimde konum zorunludur.'
        : 'When it opens, it will publish on the map. A location is required for this option.';
    } else if (ST.capsuleVisibility === 'email') {
      note.textContent = getCurrentLanguage() === 'tr'
        ? 'Harita ile baglantisi olmaz. Mesaj email ile teslim edilir.'
        : 'This stays off the map. The message is delivered by email only.';
    } else {
      note.textContent = getCurrentLanguage() === 'tr'
        ? 'Acilana kadar gizli kalir. Acildiginda sadece sahibi ya da alicisi gorur.'
        : 'It stays hidden until it opens. After that, only the owner or recipient can see it.';
    }
  }
  if (preview) preview.classList.toggle('section-hidden', !hasCapsule);
  if (locationNote) {
    locationNote.style.display = hasCapsule ? 'block' : 'none';
    locationNote.textContent = ST.capsuleVisibility === 'public'
      ? (getCurrentLanguage() === 'tr'
        ? 'Bu kapsul haritada yayinlanacak, bu yuzden bir konum eklemen gerekiyor.'
        : 'This capsule will publish on the map, so a location is required.')
      : (getCurrentLanguage() === 'tr'
        ? 'Konum istege bagli. Istersen bir yer ekle, istersen kapsulu yersiz tut.'
        : 'Location is optional. Add a place if it gives the capsule meaning, or keep it location-free.');
  }
  if (skipLocation) {
    skipLocation.style.display = hasCapsule ? 'inline-flex' : 'none';
    skipLocation.disabled = ST.capsuleVisibility === 'public';
    skipLocation.textContent = ST.capsuleVisibility === 'public'
      ? (getCurrentLanguage() === 'tr' ? 'Public kapsulde konum zorunlu' : 'Public capsules require a location')
      : (getCurrentLanguage() === 'tr' ? 'Konum olmadan devam et' : 'Continue without location');
  }
}

function skipCapsuleLocation() {
  if (!isCapsuleComposer() || ST.capsuleVisibility === 'public') return;
  ST.selCode = '';
  ST.selName = '';
  ST.selLat = null;
  ST.selLon = null;
  ST.locationConfirmed = false;
  ST.capsuleHasLocation = false;
  var locDisplay = document.getElementById('loc-display');
  if (locDisplay) locDisplay.value = '';
  var preciseCoords = document.getElementById('precise-coords');
  if (preciseCoords) preciseCoords.style.display = 'none';
  if (tempMarker && viewer) {
    viewer.entities.remove(tempMarker);
    tempMarker = null;
  }
  if (typeof updateCreateFlowUI === 'function') updateCreateFlowUI();
  goS(5);
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
  var active = document.getElementById(id);
  if (active) {
    active.classList.add('on');
    active.setAttribute('aria-pressed', 'true');
  }

  var customArea = document.getElementById('custom-date-area');
  if (customArea) customArea.style.display = 'none';
  var datePreview = document.getElementById('date-preview');
  if (datePreview) datePreview.style.display = 'none';

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

  var customArea = document.getElementById('custom-date-area');
  if (customArea) customArea.style.display = 'block';
  updateCapsuleUI();

  var input = document.getElementById('capsule-date');
  if (!input) return;
  var now = new Date();
  now.setSeconds(0, 0);
  var localMin = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  input.min = localMin;
  if (!input.value) {
    input.value = localMin;
  }
  setCustomDate(input.value);
}

function setCustomDate(val) {
  if (!val) return;
  var selected = new Date(val);
  if (!isFinite(selected.getTime())) return;
  if (selected.getTime() <= Date.now()) {
    showToast(getCurrentLanguage() === 'tr' ? 'Kapsul zamani gelecekte olmali.' : 'Capsule time must be in the future.', 'error');
    return;
  }
  ST.capsuleDate = selected.toISOString();
  ST.capsuleDays = Math.max(1, Math.ceil((selected.getTime() - Date.now()) / 86400000));
  ST.yr = Math.max(1, Math.round(ST.capsuleDays / 365));
  updateOpensPreview();

  var dp = document.getElementById('date-preview');
  if (dp) {
    dp.textContent = (getCurrentLanguage() === 'tr' ? 'Acilir: ' : 'Opens ') + selected.toLocaleString(getCurrentLocale(), {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    dp.style.display = 'block';
  }
}

function updateOpensPreview() {
  var el = document.getElementById('opens-date-text');
  var preview = document.getElementById('opens-preview');
  if (!el) return;

  if (!ST.capsuleDays && ST.capsuleDays !== 0) ST.capsuleDays = 365;

  if (ST.capsuleDays === 0) {
    el.textContent = getCurrentLanguage() === 'tr' ? 'Kapsul yok - sadece iz' : 'No capsule - mark only';
    if (preview) preview.style.opacity = '.4';
    return;
  }

  if (preview) preview.style.opacity = '1';
  var opens = getCapsuleScheduleDateFromState();
  if (!opens) return;
  var days = Math.max(1, Math.ceil((opens.getTime() - Date.now()) / 86400000));
  el.textContent = formatRelativeDurationDays(days) + ' - ' + opens.toLocaleString(getCurrentLocale(), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
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
    showToast(getCurrentLanguage() === 'tr' ? 'Servis kullanilamiyor.' : 'Service unavailable.');
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
  document.getElementById('auth-btn').textContent = isLogin ? t('nav_sign_in') : (isRegister ? t('auth_create_account') : t('auth_send_reset'));
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
    showToast(getCurrentLanguage() === 'tr' ? 'Lutfen Hizmet Sartlari ve Gizlilik Politikasini kabul et.' : 'Please accept the Terms of Service and Privacy Policy.');
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
    btn.textContent = tab === 'login' ? t('nav_sign_in') : (tab === 'register' ? t('auth_create_account') : t('auth_send_reset'));
    btn.disabled = false;
    if (result.error) {
      showToast(result.error.message || (getCurrentLanguage() === 'tr' ? 'Bir hata olustu. Tekrar dene.' : 'Error. Please try again.'), 'error');
      var pwEl = document.getElementById('apw');
      if (pwEl && tab !== 'forgot') {
        pwEl.style.borderColor = 'rgba(220,60,60,.6)';
        setTimeout(function() { pwEl.style.borderColor = ''; }, 1500);
      }
      return;
    }
    if (tab === 'forgot') {
      showToast(getCurrentLanguage() === 'tr' ? 'Sifre sifirlama baglantisi gonderildi. E-postani kontrol et.' : 'Password reset link sent. Check your email.', 'success');
      switchTab('login');
      return;
    }
    showToast(tab === 'register'
      ? (getCurrentLanguage() === 'tr' ? 'Hesap olusturuldu. Artik giris yapabilirsin.' : 'Account created! You can now sign in.')
      : (getCurrentLanguage() === 'tr' ? 'Tekrar hos geldin!' : 'Welcome back!'), 'success');
    closeAuth();
  }).catch(function(err) {
    btn.textContent = tab === 'login' ? t('nav_sign_in') : (tab === 'register' ? t('auth_create_account') : t('auth_send_reset'));
    btn.disabled = false;
    showToast(err.message || (getCurrentLanguage() === 'tr' ? 'Bir hata olustu. Tekrar dene.' : 'Error. Please try again.'), 'error');
  });
}

function signOut() {
  _supabase.auth.signOut().then(function() {
    AUTH.user = null;
    updateUserUI();
    showToast(getCurrentLanguage() === 'tr' ? 'Cikis yapildi.' : 'Signed out.', 'success');
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
  var toast = document.createElement('div');
  toast.id = 'iwh-toast';
  toast.textContent = msg;
  toast.setAttribute('role', tone === 'error' ? 'alert' : 'status');
  toast.setAttribute('aria-live', tone === 'error' ? 'assertive' : 'polite');
  toast.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:rgba(8,14,24,.97);border:1px solid rgba(200,169,110,.35);border-radius:24px;padding:11px 24px;font-size:.82rem;color:#f0ede8;z-index:1000;white-space:normal;text-align:center;max-width:min(92vw,420px);backdrop-filter:blur(16px);font-family:sans-serif;transition:opacity .3s';
  if (tone === 'success') toast.style.borderColor = 'rgba(70,190,120,.45)';
  if (tone === 'error') toast.style.borderColor = 'rgba(220,90,90,.45)';
  document.body.appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = '0';
    setTimeout(function() { toast.remove(); }, 300);
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
