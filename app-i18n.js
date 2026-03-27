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
    stat_capsules: 'Active Capsules',
    how_label: 'The Journey',
    how_title_html: 'Three steps to leave a <em>memory</em>',
    how_step1_title: 'Choose Your Spot',
    how_step1_body: 'Click anywhere on the 3D globe to place your pin. Zoom to street level for precise placement with satellite imagery.',
    how_step2_title: 'Write Your Message',
    how_step2_body: 'Add the text that will be saved with your mark. Photos are optional and stay attached to the saved mark.',
    how_step3_title: 'Choose Visibility',
    how_step3_body: 'Save it as a public mark today, or set a future opening date for a capsule experience.',
    pricing_label: 'Investment in Memory',
    pricing_title_html: 'Simple pricing for what is <em>live now</em>',
    pricing_now_badge: 'Available Now',
    pricing_limited_badge: 'Limited Today',
    pricing_public_name: 'Public Mark',
    pricing_public_desc: 'Save a public mark with your name, coordinates, and written message.',
    pricing_public_feat1: 'Permanent globe placement',
    pricing_public_feat2: 'Optional photo',
    pricing_public_feat3: 'Country attribution',
    pricing_capsule_name: 'Mark + Capsule',
    pricing_capsule_desc: 'Save your mark now and choose a future opening date for the capsule view.',
    pricing_capsule_feat1: 'Everything in Public Mark',
    pricing_capsule_feat2: 'Text message support',
    pricing_capsule_feat3: 'Future opening date',
    pricing_gift_name: 'Gift Capsule',
    pricing_gift_desc: 'Recipient flow is available in the UI while downstream delivery features continue to evolve.',
    pricing_gift_feat1: 'Recipient email field',
    pricing_gift_feat2: 'Capsule timing options',
    pricing_gift_feat3: 'Share card after save',
    pricing_note: 'Write your memory, add a photo if you want, and choose whether the mark stays public now or opens later as a capsule.',
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
    auth_terms_agree_html: 'I agree to the <a href="/terms.html" target="_blank" style="color:#c8a96e;margin:0 3px;">Terms of Service</a> and <a href="/privacy-policy.html" target="_blank" style="color:#c8a96e;margin:0 3px;">Privacy Policy</a>',
    auth_send_reset: 'Send reset link',
    my_marks: 'My Marks',
    profile_title: 'Profile',
    profile_your_world: 'Your World',
    profile_marks: 'Marks',
    profile_countries: 'Countries',
    profile_capsules: 'Capsules',
    profile_view_marks: 'View My Marks',
    profile_place_new: 'Place New Mark',
    profile_recent_activity: 'Recent activity',
    search_placeholder: 'Search country...',
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
    your_message_sub: 'Write the message that will be saved with your mark.',
    message: 'Message',
    message_placeholder: 'I was here in Istanbul, and I want to remember this day...',
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
    done: 'Done',
    share_delete: 'Delete',
    share_copy_link: 'Copy Link',
    share_share: 'Share',
    share_close: 'Close',
    share_public: 'Public mark',
    share_visible_now: 'Visible now',
    country_summary_empty: 'No marks yet. Place the first mark to start your country tally.',
    profile_no_marks: 'No marks yet',
    header_marks_short: 'marks',
    header_countries_short: 'countries',
    header_capsules_short: 'capsules'
  },
  tr: {
    nav_sign_in: 'Giriş yap',
    nav_sign_out: 'Çıkış yap',
    nav_open_globe: 'Küreyi Aç',
    hero_eyebrow: 'İnsanlık için dijital bir anıt',
    hero_title_html: 'Dünyaya <em>izini</em><br>bırak',
    hero_subtitle: 'Adını küre üzerine sabitle, yazılı bir anı kaydet ve istersen kapsülün için gelecekte bir açılma tarihi belirle.',
    hero_how: 'Nasıl Çalışır',
    stat_marks: 'Bırakılan İz',
    stat_countries: 'Ülkeler',
    stat_capsules: 'Aktif Kapsüller',
    how_label: 'Yolculuk',
    how_title_html: 'Bir <em>anı</em> bırakmak için üç adım',
    how_step1_title: 'Yerini Seç',
    how_step1_body: '3B küre üzerinde herhangi bir yere tıklayarak pinini bırak. Sokak seviyesinde hassas seçim için yakınlaştır.',
    how_step2_title: 'Mesajını Yaz',
    how_step2_body: 'İzinle birlikte kaydedilecek metni ekle. Fotoğraf isteğe bağlıdır ve yalnızca kaydedilen ize eklenir.',
    how_step3_title: 'Görünürlüğü Seç',
    how_step3_body: 'Bugün herkese açık bir iz olarak kaydet ya da kapsül deneyimi için gelecekte bir açılma tarihi belirle.',
    pricing_label: 'Anılara Yatırım',
    pricing_title_html: 'Şu an <em>yayında</em> olanlar için sade fiyatlama',
    pricing_now_badge: 'Şimdi Aktif',
    pricing_limited_badge: 'Bugün Sınırlı',
    pricing_public_name: 'Herkese Açık İz',
    pricing_public_desc: 'Adın, koordinatların ve yazılı mesajınla herkese açık bir iz kaydet.',
    pricing_public_feat1: 'Kalıcı küre yerleşimi',
    pricing_public_feat2: 'İsteğe bağlı fotoğraf',
    pricing_public_feat3: 'Ülke ataması',
    pricing_capsule_name: 'İz + Kapsül',
    pricing_capsule_desc: 'İzini şimdi kaydet ve kapsül görünümü için gelecekte bir açılma tarihi seç.',
    pricing_capsule_feat1: 'Herkese Açık İz paketindeki her şey',
    pricing_capsule_feat2: 'Yazılı mesaj desteği',
    pricing_capsule_feat3: 'Gelecekte açılma tarihi',
    pricing_gift_name: 'Hediye Kapsül',
    pricing_gift_desc: 'Alıcı akışı arayüzde hazır; teslimat tarafı ürün altyapısı geliştikçe olgunlaşmaya devam ediyor.',
    pricing_gift_feat1: 'Alıcı e-posta alanı',
    pricing_gift_feat2: 'Kapsül zamanlama seçenekleri',
    pricing_gift_feat3: 'Kaydettikten sonra paylaşım kartı',
    pricing_note: 'Anını yaz, istersen fotoğraf ekle ve izin hemen herkese açık mı kalacak yoksa kapsül olarak sonra mı açılacak buna karar ver.',
    footer_privacy: 'Gizlilik Politikası',
    footer_terms: 'Hizmet Şartları',
    footer_contact: 'İletişim',
    cookie_text: 'Oturumunu korumak ve deneyimi iyileştirmek için zorunlu çerezler kullanıyoruz. Devam ederek Gizlilik Politikası ve Hizmet Şartları metinlerini kabul etmiş olursun.',
    cookie_accept: 'Kabul Et',
    cookie_decline: 'Reddet',
    selected_location: 'Seçili Konum',
    marks_by_country: 'Ülkelere Göre İzler',
    controls_auto_rotate: 'Otomatik Döndür',
    controls_borders: 'Sınırlar',
    controls_labels: 'Etiketler',
    start_here: 'Buradan Başla',
    start_hint: 'İlk izini bırakmak için paneli aç, bir konum seç ve mesajını ekle.',
    create_my_mark: 'İzimi Oluştur',
    later: 'Sonra',
    next_up: 'Sıradaki',
    recent_marks: 'Son İzler',
    quick_my: 'İzlerim',
    quick_nearby: 'Yakınımda',
    quick_trending: 'Öne Çıkanlar',
    quick_friends: 'Arkadaşlar',
    quick_recent: 'Yeni',
    quick_countries: 'Ülkeler',
    auth_welcome_back: 'Tekrar hoş geldin',
    auth_create_account: 'Hesap oluştur',
    auth_reset_password: 'Şifre sıfırla',
    auth_sign_in_sub: 'İzlerini yönetmek için giriş yap.',
    auth_register_sub: 'İz bırakan binlerce kişiye katıl.',
    auth_forgot_sub: 'E-postanı gir, sana bir sıfırlama bağlantısı gönderelim.',
    auth_register_tab: 'Kayıt Ol',
    auth_forgot: 'Şifremi unuttum',
    auth_back_to_sign_in: 'Girişe dön',
    auth_continue_google: 'Google ile devam et',
    auth_or_email: 'veya e-posta ile',
    auth_full_name: 'Ad Soyad',
    auth_email: 'E-posta',
    auth_password: 'Şifre',
    auth_terms_agree_html: '<a href="/terms.html" target="_blank" style="color:#c8a96e;margin:0 3px;">Hizmet Şartları</a> ve <a href="/privacy-policy.html" target="_blank" style="color:#c8a96e;margin:0 3px;">Gizlilik Politikası</a> metinlerini kabul ediyorum',
    auth_send_reset: 'Sıfırlama bağlantısı gönder',
    my_marks: 'İzlerim',
    profile_title: 'Profil',
    profile_your_world: 'Senin Dünyan',
    profile_marks: 'İz',
    profile_countries: 'Ülke',
    profile_capsules: 'Kapsül',
    profile_view_marks: 'İzlerimi Gör',
    profile_place_new: 'Yeni İz Bırak',
    profile_recent_activity: 'Son hareketler',
    search_placeholder: 'Ülke ara...',
    location_click_placeholder: 'Küre üzerinde bir yere tıkla...',
    country_select_placeholder: 'Ülke seç...',
    your_details: 'Bilgilerin',
    your_details_sub: 'Seni temsil edecek görünen bir isim seç.',
    display_name: 'Görünen İsim',
    your_name: 'İsmin',
    photo_optional: 'Fotoğraf (isteğe bağlı)',
    photo_soft_note: 'İstersen bunu atlayabilirsin. Fotoğraflar yalnızca kaydettikten sonra iz kartında kullanılır.',
    add_photo: '+ Fotoğraf ekle',
    continue_location: 'Konuma Geç',
    choose_location: 'Konum Seç',
    choose_location_sub: 'Küre üzerinde bir yere tıkla veya bir yer ara. Sokak düzeyinde hassasiyet için yakınlaştır.',
    or_search: 'Ya da ara',
    exact_coordinates: 'Tam Koordinatlar',
    continue_message: 'Mesaja Geç',
    back: 'Geri',
    your_message: 'Mesajın',
    your_message_sub: 'İzinle birlikte kaydedilecek mesajı yaz.',
    message: 'Mesaj',
    message_placeholder: 'Bugün İstanbul’da buradaydım ve bu günü hatırlamak istiyorum...',
    continue_capsule: 'Kapsüle Geç',
    capsule_options: 'Kapsül Seçenekleri',
    capsule_options_sub: 'Sadece herkese açık bir iz bırakmak istiyorsan bu adımı atlayabilirsin.',
    recipient: 'Alıcı',
    myself: 'Kendim',
    someone_else: 'Başka Biri',
    recipient_email: 'Alıcı E-postası',
    recipient_email_placeholder: 'onun@email.com',
    opens_in: 'Ne zaman açılsın',
    custom: 'Özel',
    select_date: 'Tarih Seç',
    capsule_opens: 'Kapsül Açılır',
    or: 'veya',
    no_capsule: 'Kapsül Yok (yalnızca herkese açık iz)',
    continue_review: 'Özete Geç',
    review_place: 'Gözden Geçir ve Bırak',
    review_place_sub: 'İzini küreye kaydetmeden önce son kez gözden geçir.',
    save_my_mark: 'İzimi Kaydet',
    success_title: 'Artık Küredesin',
    success_visible: 'İzin artık görünür durumda.',
    share_card: 'Paylaşım Kartı',
    done: 'Tamam',
    share_delete: 'Sil',
    share_copy_link: 'Bağlantıyı Kopyala',
    share_share: 'Paylaş',
    share_close: 'Kapat',
    share_public: 'Herkese açık iz',
    share_visible_now: 'Şimdi görünür',
    country_summary_empty: 'Henüz iz yok. Ülke sayacını başlatmak için ilk izini bırak.',
    profile_no_marks: 'Henüz iz yok',
    header_marks_short: 'iz',
    header_countries_short: 'ülke',
    header_capsules_short: 'kapsül'
  }
};

function getCurrentLanguage() {
  var lang = window.IWH_LANG || localStorage.getItem(I18N_LANG_KEY) || I18N_DEFAULT_LANG;
  return I18N_SUPPORTED.indexOf(lang) >= 0 ? lang : I18N_DEFAULT_LANG;
}

function getCurrentLocale() {
  return getCurrentLanguage() === 'tr' ? 'tr-TR' : 'en-US';
}

function t(key, params) {
  var lang = getCurrentLanguage();
  var dict = I18N_MESSAGES[lang] || I18N_MESSAGES[I18N_DEFAULT_LANG];
  var fallback = I18N_MESSAGES[I18N_DEFAULT_LANG];
  var text = dict[key] != null ? dict[key] : (fallback[key] != null ? fallback[key] : key);
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, function(_, name) {
    return params[name] != null ? String(params[name]) : '';
  });
}

function formatDateI18n(date, options) {
  return new Date(date).toLocaleDateString(getCurrentLocale(), options || { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatRelativeDurationDays(days) {
  if (getCurrentLanguage() === 'tr') {
    if (days <= 7) return days + ' gün sonra';
    if (days <= 31) return Math.round(days / 7) + ' hafta sonra';
    if (days <= 365) return Math.round(days / 30) + ' ay sonra';
    return Math.round(days / 365) + ' yıl sonra';
  }
  if (days <= 7) return 'In ' + days + ' day' + (days > 1 ? 's' : '');
  if (days <= 31) return 'In ' + Math.round(days / 7) + ' weeks';
  if (days <= 365) return 'In ' + Math.round(days / 30) + ' months';
  return 'In ' + Math.round(days / 365) + ' years';
}

function getMarkWord(count) {
  return getCurrentLanguage() === 'tr' ? count + ' iz' : count + ' mark' + (count === 1 ? '' : 's');
}

function applyTranslations() {
  var lang = getCurrentLanguage();
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(function(node) {
    var key = node.getAttribute('data-i18n');
    if (key) node.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(function(node) {
    var key = node.getAttribute('data-i18n-html');
    if (key) node.innerHTML = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(node) {
    var key = node.getAttribute('data-i18n-placeholder');
    if (key) node.setAttribute('placeholder', t(key));
  });
  document.querySelectorAll('[data-lang-btn]').forEach(function(button) {
    var isActive = button.getAttribute('data-lang-btn') === lang;
    button.style.display = '';
    button.classList.toggle('on', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function setLanguage(lang) {
  var next = I18N_SUPPORTED.indexOf(lang) >= 0 ? lang : I18N_DEFAULT_LANG;
  window.IWH_LANG = next;
  localStorage.setItem(I18N_LANG_KEY, next);
  applyTranslations();
  if (typeof window.refreshLocalizedUI === 'function') window.refreshLocalizedUI();
}

function initI18n() {
  window.IWH_LANG = getCurrentLanguage();
  localStorage.setItem(I18N_LANG_KEY, window.IWH_LANG);
  applyTranslations();
}

window.IWH_LANG = getCurrentLanguage();
window.I18N_MESSAGES = I18N_MESSAGES;
window.t = t;
window.setLanguage = setLanguage;
window.applyTranslations = applyTranslations;
window.formatDateI18n = formatDateI18n;
window.formatRelativeDurationDays = formatRelativeDurationDays;
window.getMarkWord = getMarkWord;
window.getCurrentLocale = getCurrentLocale;
window.getCurrentLanguage = getCurrentLanguage;

document.addEventListener('DOMContentLoaded', initI18n);

I18N_MESSAGES.en.your_message = 'Message for This Memory';
I18N_MESSAGES.en.your_message_sub = 'Write the note that will be saved with this mark or revealed when the capsule opens.';
I18N_MESSAGES.en.message_for_memory = 'Message for This Memory';
I18N_MESSAGES.en.message_for_memory_sub = 'Now write the note that will be saved with this mark or revealed when the capsule opens.';
I18N_MESSAGES.en.capsule_options_sub = 'Choose whether this should stay public now or open later as a capsule.';
I18N_MESSAGES.en.memory_note = 'Memory Note';
I18N_MESSAGES.en.memory_note_placeholder = 'Leave a short note for this place...';
I18N_MESSAGES.en.nav_back_home = 'Back to Home';

I18N_MESSAGES.tr.your_message = 'Bu Ani Icin Mesaj';
I18N_MESSAGES.tr.your_message_sub = 'Bu izle kaydedilecek ya da kapsul acildiginda gorunecek notu yaz.';
I18N_MESSAGES.tr.message_for_memory = 'Bu Ani Icin Mesaj';
I18N_MESSAGES.tr.message_for_memory_sub = 'Simdi bu izle kaydedilecek ya da kapsul acildiginda gorunecek notu yaz.';
I18N_MESSAGES.tr.capsule_options_sub = 'Bunun simdi herkese acik mi kalacagina yoksa sonra kapsul olarak mi acilacagina karar ver.';
I18N_MESSAGES.tr.memory_note = 'Anı Notu';
I18N_MESSAGES.tr.memory_note_placeholder = 'Bu yer için kısa bir not bırak...';
I18N_MESSAGES.tr.nav_back_home = 'Ana Sayfaya Dön';
