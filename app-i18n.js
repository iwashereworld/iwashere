var I18N_LANG_KEY = 'iwh_lang';
var I18N_DEFAULT_LANG = 'en';
var I18N_SUPPORTED = ['en', 'tr'];

var I18N_MESSAGES = {
  en: {
    nav_sign_in: 'Sign in',
    nav_sign_out: 'Sign out',
    nav_open_globe: 'Open Globe',
    hero_eyebrow: 'A digital monument for humanity',
    hero_title_html: 'Leave your <em>mark</em><br>on the world',
    hero_subtitle: 'Pin your name to the globe, save a written memory, and optionally set a future opening date for your capsule.',
    hero_how: 'How It Works',
    stat_marks: 'Marks Placed',
    stat_countries: 'Countries',
    stat_capsules: 'Capsules Sealed',
    how_label: 'The Journey',
    how_title_html: 'Three steps to leave a <em>memory</em>',
    how_step1_title: 'Choose Your Spot',
    how_step1_body: 'Click anywhere on the 3D globe to place your pin. Zoom to street level for precise placement with satellite imagery.',
    how_step2_title: 'Write Your Message',
    how_step2_body: 'Add the text that will be saved with your mark. Photos are optional, and voice is currently on-device preview only.',
    how_step3_title: 'Choose Visibility',
    how_step3_body: 'Save it as a public mark today, or set a future opening date for a capsule experience.',
    pricing_label: 'Investment in Memory',
    pricing_title_html: 'Simple pricing for what is <em>live now</em>',
    footer_privacy: 'Privacy Policy',
    footer_terms: 'Terms of Service',
    footer_contact: 'Contact',
    cookie_text: 'We use essential cookies to keep you logged in and improve your experience. By continuing, you agree to our Privacy Policy and Terms of Service.',
    cookie_accept: 'Accept',
    cookie_decline: 'Decline',
    selected_location: 'Selected Location',
    marks_by_country: 'Marks by Country',
    controls_auto_rotate: 'Auto-rotate',
    controls_borders: 'Borders',
    controls_labels: 'Labels',
    start_here: 'Start Here',
    start_hint: 'Open the panel to place your first mark, choose a location and leave a message.',
    create_my_mark: 'Create My Mark',
    later: 'Later',
    next_up: 'Next Up',
    recent_marks: 'Recent Marks',
    quick_my: 'My Marks',
    quick_nearby: 'Nearby',
    quick_trending: 'Trending',
    quick_friends: 'Friends',
    quick_recent: 'Recent',
    quick_countries: 'Countries',
    auth_welcome_back: 'Welcome back',
    auth_create_account: 'Create account',
    auth_reset_password: 'Reset password',
    auth_sign_in_sub: 'Sign in to manage your marks.',
    auth_register_sub: 'Join thousands leaving their mark.',
    auth_forgot_sub: 'Enter your email and we will send a reset link.',
    auth_register_tab: 'Register',
    auth_forgot: 'Forgot password?',
    auth_back_to_sign_in: 'Back to sign in',
    auth_continue_google: 'Continue with Google',
    auth_or_email: 'or email',
    auth_full_name: 'Full Name',
    auth_email: 'Email',
    auth_password: 'Password',
    auth_terms_agree: 'I agree to the Terms of Service and Privacy Policy',
    my_marks: 'My Marks',
    profile_title: 'Profile',
    profile_your_world: 'Your World',
    profile_marks: 'Marks',
    profile_countries: 'Countries',
    profile_capsules: 'Capsules',
    profile_view_marks: 'View My Marks',
    profile_place_new: 'Place New Mark',
    profile_recent_activity: 'Recent activity',
    search_placeholder: 'Search city, country, mark, or coordinates...',
    location_click_placeholder: 'Click on the globe...',
    country_select_placeholder: 'Select country...',
    your_details: 'Your Details',
    your_details_sub: 'Choose a name that will stand for eternity.',
    display_name: 'Display Name',
    your_name: 'Your name',
    photo_optional: 'Photo (optional)',
    photo_soft_note: 'You can skip this. Photos are only used on your mark card after you save.',
    add_photo: '+ Add photo',
    continue_location: 'Continue to Location',
    choose_location: 'Choose Location',
    choose_location_sub: 'Click anywhere on the globe or search for a place. Zoom in for street-level precision.',
    or_search: 'Or search',
    exact_coordinates: 'Exact Coordinates',
    continue_message: 'Continue to Message',
    back: 'Back',
    your_message: 'Your Message',
    your_message_sub: 'Write the message that will be saved with your mark. Voice stays preview-only for now.',
    write: 'Write',
    voice: 'Voice',
    message: 'Message',
    message_placeholder: 'I was here in Istanbul, and I want to remember this day...',
    voice_note: 'Voice recordings are kept for local preview on this device only. Add a written message if you want to save this mark today.',
    voice_ready: 'Ready to record locally',
    voice_tap_start: 'Tap to start',
    voice_upload_pending: 'Upload-ready metadata will appear here when backend upload is connected.',
    clear_rerecord: 'Clear & re-record',
    upload_audio_preview: 'upload audio file for preview',
    continue_capsule: 'Continue to Capsule',
    capsule_options: 'Capsule Options',
    capsule_options_sub: 'Skip this if you only want a public mark right now.',
    recipient: 'Recipient',
    myself: 'Myself',
    someone_else: 'Someone Else',
    recipient_email: 'Recipient Email',
    recipient_email_placeholder: 'their@email.com',
    opens_in: 'Opens in',
    custom: 'Custom',
    select_date: 'Select Date',
    capsule_opens: 'Capsule Opens',
    or: 'or',
    no_capsule: 'No Capsule (public mark only)',
    continue_review: 'Continue to Review',
    review_place: 'Review & Place',
    review_place_sub: 'Review your mark before saving it to the globe.',
    save_my_mark: 'Save My Mark',
    success_title: "You're on the Globe",
    success_visible: 'Your mark is now visible.',
    share_card: 'Share Card',
    done: 'Done'
  },
  tr: {
    nav_sign_in: 'Giriş yap',
    nav_sign_out: 'Çıkış yap',
    nav_open_globe: 'Küreyi Aç',
    hero_eyebrow: 'İnsanlık için dijital bir anıt',
    hero_title_html: 'Dünyaya <em>izini</em><br>bırak',
    hero_subtitle: 'Adını küreye işle, yazılı bir anı kaydet ve istersen kapsülün için gelecekte açılacak bir tarih belirle.',
    hero_how: 'Nasıl Çalışır',
    stat_marks: 'Bırakılan İz',
    stat_countries: 'Ülkeler',
    stat_capsules: 'Mühürlenen Kapsüller',
    how_label: 'Yolculuk',
    how_title_html: 'Bir <em>anı</em> bırakmak için üç adım',
    how_step1_title: 'Noktayı Seç',
    how_step1_body: 'Pimini yerleştirmek için 3D kürede herhangi bir yere tıkla. Uydu görüntüsüyle hassas seçim için sokak seviyesine kadar yakınlaş.',
    how_step2_title: 'Mesajını Yaz',
    how_step2_body: 'İzinle birlikte kaydolacak metni ekle. Fotoğraf isteğe bağlıdır, ses ise şimdilik sadece cihaz içi önizlemedir.',
    how_step3_title: 'Görünürlüğü Seç',
    how_step3_body: 'Bugün herkese açık bir iz olarak kaydet ya da kapsül deneyimi için gelecekte açılacak bir tarih belirle.',
    pricing_label: 'Anıya Yatırım',
    pricing_title_html: 'Şu an <em>canlıda</em> olanlar için sade fiyatlama',
    footer_privacy: 'Gizlilik Politikası',
    footer_terms: 'Hizmet Şartları',
    footer_contact: 'İletişim',
    cookie_text: 'Oturumu açık tutmak ve deneyimi iyileştirmek için zorunlu çerezler kullanıyoruz. Devam ederek Gizlilik Politikası ve Hizmet Şartlarını kabul etmiş olursun.',
    cookie_accept: 'Kabul et',
    cookie_decline: 'Reddet',
    selected_location: 'Seçilen Konum',
    marks_by_country: 'Ülkeye Göre İzler',
    controls_auto_rotate: 'Otomatik döndür',
    controls_borders: 'Sınırlar',
    controls_labels: 'Etiketler',
    start_here: 'Buradan Başla',
    start_hint: 'İlk izini bırakmak, konum seçmek ve mesaj eklemek için paneli aç.',
    create_my_mark: 'İzimi Oluştur',
    later: 'Sonra',
    next_up: 'Sıradaki',
    recent_marks: 'Son İzler',
    quick_my: 'İzlerim',
    quick_nearby: 'Yakınım',
    quick_trending: 'Öne Çıkanlar',
    quick_friends: 'Arkadaşlar',
    quick_recent: 'Yeni',
    quick_countries: 'Ülkeler',
    auth_welcome_back: 'Tekrar hoş geldin',
    auth_create_account: 'Hesap oluştur',
    auth_reset_password: 'Şifreyi sıfırla',
    auth_sign_in_sub: 'İzlerini yönetmek için giriş yap.',
    auth_register_sub: 'İz bırakan binlerce kişiye katıl.',
    auth_forgot_sub: 'E-postanı gir, sana sıfırlama bağlantısı gönderelim.',
    auth_register_tab: 'Kayıt ol',
    auth_forgot: 'Şifremi unuttum?',
    auth_back_to_sign_in: 'Girişe dön',
    auth_continue_google: 'Google ile devam et',
    auth_or_email: 'veya e-posta ile',
    auth_full_name: 'Ad Soyad',
    auth_email: 'E-posta',
    auth_password: 'Şifre',
    auth_terms_agree: 'Hizmet Şartları ve Gizlilik Politikasını kabul ediyorum',
    my_marks: 'İzlerim',
    profile_title: 'Profil',
    profile_your_world: 'Senin Dünyan',
    profile_marks: 'İz',
    profile_countries: 'Ülke',
    profile_capsules: 'Kapsül',
    profile_view_marks: 'İzlerimi Gör',
    profile_place_new: 'Yeni İz Bırak',
    profile_recent_activity: 'Son hareketler',
    search_placeholder: 'Şehir, ülke, iz veya koordinat ara...',
    location_click_placeholder: 'Küre üzerinde tıkla...',
    country_select_placeholder: 'Ülke seç...',
    your_details: 'Bilgilerin',
    your_details_sub: 'İzine kimlik verecek bir isim seç.',
    display_name: 'Görünen İsim',
    your_name: 'Adın',
    photo_optional: 'Fotoğraf (isteğe bağlı)',
    photo_soft_note: 'Bunu atlayabilirsin. Fotoğraflar yalnızca iz kartında kullanılır.',
    add_photo: '+ Fotoğraf ekle',
    continue_location: 'Konuma Devam Et',
    choose_location: 'Konum Seç',
    choose_location_sub: 'Küre üzerinde bir yere tıkla ya da bir yer ara. Sokak seviyesinde hassasiyet için yakınlaş.',
    or_search: 'Ya da ara',
    exact_coordinates: 'Tam Koordinatlar',
    continue_message: 'Mesaja Devam Et',
    back: 'Geri',
    your_message: 'Mesajın',
    your_message_sub: 'İzinle birlikte kaydedilecek mesajı yaz. Ses şimdilik sadece önizleme olarak kalır.',
    write: 'Yazı',
    voice: 'Ses',
    message: 'Mesaj',
    message_placeholder: 'Bugün İstanbul\'daydım ve bu günü hatırlamak istiyorum...',
    voice_note: 'Ses kayıtları bu cihazda sadece yerel önizleme için tutulur. Bu izi bugün kaydetmek istiyorsan yazılı bir mesaj ekle.',
    voice_ready: 'Yerel kayıt için hazır',
    voice_tap_start: 'Başlamak için dokun',
    voice_upload_pending: 'Backend yükleme bağlandığında yükleme metadatası burada görünecek.',
    clear_rerecord: 'Temizle ve tekrar kaydet',
    upload_audio_preview: 'önizleme için ses dosyası yükle',
    continue_capsule: 'Kapsüle Devam Et',
    capsule_options: 'Kapsül Seçenekleri',
    capsule_options_sub: 'Sadece herkese açık bir iz istiyorsan bu adımı atla.',
    recipient: 'Alıcı',
    myself: 'Kendim',
    someone_else: 'Başka Biri',
    recipient_email: 'Alıcı E-postası',
    recipient_email_placeholder: 'onun@email.com',
    opens_in: 'Açılma Süresi',
    custom: 'Özel',
    select_date: 'Tarih Seç',
    capsule_opens: 'Kapsül Açılır',
    or: 'veya',
    no_capsule: 'Kapsül Yok (sadece herkese açık iz)',
    continue_review: 'İncelemeye Devam Et',
    review_place: 'İncele ve Bırak',
    review_place_sub: 'Kaydetmeden önce izini gözden geçir.',
    save_my_mark: 'İzimi Kaydet',
    success_title: 'Artık Küredesin',
    success_visible: 'İzin artık görünür.',
    share_card: 'Paylaşım Kartı',
    done: 'Bitti'
  }
};

function getCurrentLanguage() {
  return window.IWH_LANG || I18N_DEFAULT_LANG;
}

function getCurrentLocale() {
  return getCurrentLanguage() === 'tr' ? 'tr-TR' : 'en-US';
}

function t(key, params) {
  var lang = getCurrentLanguage();
  var dict = I18N_MESSAGES[lang] || I18N_MESSAGES[I18N_DEFAULT_LANG];
  var fallback = I18N_MESSAGES[I18N_DEFAULT_LANG];
  var text = (dict && dict[key]) || fallback[key] || key;
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, function(_, name) {
    return params[name] != null ? String(params[name]) : '';
  });
}

function formatDateI18n(date, options) {
  return new Date(date).toLocaleDateString(getCurrentLocale(), options || { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatRelativeDurationDays(days) {
  var lang = getCurrentLanguage();
  if (days <= 7) {
    return lang === 'tr'
      ? days + ' gün sonra'
      : 'In ' + days + ' day' + (days > 1 ? 's' : '');
  }
  if (days <= 31) {
    var weeks = Math.round(days / 7);
    return lang === 'tr'
      ? weeks + ' hafta sonra'
      : 'In ' + weeks + ' week' + (weeks > 1 ? 's' : '');
  }
  if (days <= 365) {
    var months = Math.round(days / 30);
    return lang === 'tr'
      ? months + ' ay sonra'
      : 'In ' + months + ' month' + (months > 1 ? 's' : '');
  }
  var years = Math.round(days / 365);
  return lang === 'tr'
    ? years + ' yıl sonra'
    : 'In ' + years + ' year' + (years > 1 ? 's' : '');
}

function getMarkWord(count) {
  return getCurrentLanguage() === 'tr'
    ? count + ' iz'
    : count + ' mark' + (count === 1 ? '' : 's');
}

function applyTranslations() {
  document.documentElement.lang = getCurrentLanguage();
  document.querySelectorAll('[data-i18n]').forEach(function(node) {
    var key = node.getAttribute('data-i18n');
    if (!key) return;
    node.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(function(node) {
    var key = node.getAttribute('data-i18n-html');
    if (!key) return;
    node.innerHTML = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(node) {
    var key = node.getAttribute('data-i18n-placeholder');
    if (!key) return;
    node.setAttribute('placeholder', t(key));
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(function(node) {
    var key = node.getAttribute('data-i18n-aria-label');
    if (!key) return;
    node.setAttribute('aria-label', t(key));
  });
  document.querySelectorAll('[data-lang-btn]').forEach(function(button) {
    button.classList.toggle('on', button.getAttribute('data-lang-btn') === getCurrentLanguage());
  });
}

function setLanguage(lang) {
  if (I18N_SUPPORTED.indexOf(lang) === -1) lang = I18N_DEFAULT_LANG;
  window.IWH_LANG = lang;
  localStorage.setItem(I18N_LANG_KEY, lang);
  applyTranslations();
  if (typeof window.refreshLocalizedUI === 'function') window.refreshLocalizedUI();
}

function initI18n() {
  var lang = localStorage.getItem(I18N_LANG_KEY) || I18N_DEFAULT_LANG;
  if (I18N_SUPPORTED.indexOf(lang) === -1) lang = I18N_DEFAULT_LANG;
  window.IWH_LANG = lang;
  applyTranslations();
}

window.IWH_LANG = I18N_DEFAULT_LANG;
window.I18N_MESSAGES = I18N_MESSAGES;
window.t = t;
window.setLanguage = setLanguage;
window.applyTranslations = applyTranslations;
window.formatDateI18n = formatDateI18n;
window.formatRelativeDurationDays = formatRelativeDurationDays;
window.getMarkWord = getMarkWord;
window.getCurrentLocale = getCurrentLocale;

document.addEventListener('DOMContentLoaded', initI18n);
