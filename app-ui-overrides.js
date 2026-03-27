function getStepCopy() {
  if (getCurrentLanguage() === 'tr') {
    return {
      1: 'Gorunen bir isimle basla ve izine kimlik kazandir.',
      2: 'Kure uzerinde tam bir nokta sec ya da bir yer ara.',
      3: 'Bu aninin simdi mi gorunecegine yoksa kapsul olarak sonra mi acilacagina karar ver.',
      4: 'Bu yerle birlikte kaydedilecek mesaji yaz.',
      5: 'Ozeti gozden gecir ve izini kureye birak.'
    };
  }
  return {
    1: 'Start with a display name so your mark has an identity.',
    2: 'Pick an exact location on the globe or search for a place.',
    3: 'Choose whether this memory stays visible now or opens later as a capsule.',
    4: 'Write the message that will be saved with this place.',
    5: 'Review the summary and place your mark on the globe.'
  };
}

function getOnboardingSteps() {
  return getCurrentLanguage() === 'tr'
    ? ['Gorunen ismini ekle', 'Tam yeri sec', 'Kapsul zamanini sec', 'Mesajini yaz', 'Izini kaydet ve paylas']
    : ['Add your display name', 'Choose the place', 'Choose capsule timing', 'Write your message', 'Save and share your mark'];
}

function updateStepMeta(step) {
  var meta = document.getElementById('step-meta');
  var tip = document.getElementById('step-tip');
  if (!meta || !tip) return;

  if (step >= 1 && step <= 5) {
    meta.textContent = getCurrentLanguage() === 'tr' ? step + ' / 5. Adim' : 'Step ' + step + ' of 5';
    tip.textContent = getStepCopy()[step] || '';
  } else {
    meta.textContent = getCurrentLanguage() === 'tr' ? 'Tamamlandi' : 'Finished';
    tip.textContent = getCurrentLanguage() === 'tr'
      ? 'Izin kaydedildi. Paylasabilir ya da yeni bir tane birakabilirsin.'
      : 'Your mark has been saved. Share it or place another one.';
  }
  renderOnboardingChecklist(step >= 1 && step <= 5 ? step : 5);
}

function updateCapsuleUI() {
  var hasCapsule = ST.capsuleDays > 0;
  var recipientBlock = document.getElementById('recipient-block');
  var note = document.getElementById('capsule-note');
  var preview = document.getElementById('opens-preview');
  if (recipientBlock) recipientBlock.classList.toggle('section-hidden', !hasCapsule);
  if (note) {
    note.textContent = hasCapsule
      ? (getCurrentLanguage() === 'tr'
        ? 'Alici e-postasi yalnizca gelecekte acilacak kapsulu baska birine gonderdiginde gerekir.'
        : 'Recipient email is only needed when you send a future capsule to someone else.')
      : (getCurrentLanguage() === 'tr'
        ? 'Kapsul secilmedi. Bu iz hemen herkese acik olarak kaydedilecek.'
        : 'No capsule selected. This will be saved as a public mark right away.');
  }
  if (preview) preview.classList.toggle('section-hidden', !hasCapsule);
}

proceedFromCapsuleStep = function() {
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

  goS(4);
};

proceedFromMessageStep = function() {
  var messageInput = document.getElementById('imsg');
  var message = clampText(messageInput.value, MAX_MESSAGE_LENGTH);
  messageInput.value = message;

  if (!message) {
    showToast(getCurrentLanguage() === 'tr' ? 'Devam etmeden once bir mesaj ekle.' : 'Add a message before continuing.');
    return;
  }

  bSmry();
  goS(5);
};
