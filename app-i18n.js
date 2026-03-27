var I18N_LANG_KEY = 'iwh_lang';
var I18N_DEFAULT_LANG = 'en';
var I18N_SUPPORTED = ['en', 'tr'];

var I18N_MESSAGES = {
  en: {
    nav_sign_in: 'Sign in',
    nav_sign_out: 'Sign out',
    nav_open_globe: 'Open Globe',
    nav_back_home: 'Back to Home',
    hero_eyebrow: 'A living globe for meaningful memories',
    hero_title_html: 'Leave your <em>mark</em><br>on the world',
    hero_subtitle: 'Save a meaningful place, write the memory behind it, and decide whether it stays visible now or opens later.',
    hero_how: 'How It Works',
    stat_marks: 'Marks Placed',
    stat_countries: 'Countries',
    stat_capsules: 'Active Capsules',
    how_label: 'How It Works',
    how_title_html: 'Three steps to save a <em>memory</em>',
    how_step1_title: 'Choose Your Spot',
    how_step1_body: 'Pick the exact place on the globe where this memory belongs.',
    how_step2_title: 'Write Your Message',
    how_step2_body: 'Write the message that gives this place its meaning. A photo is optional.',
    how_step3_title: 'Show Now or Open Later',
    how_step3_body: 'Keep it visible now as a public mark, or lock it until a future opening date.',
    pricing_label: 'What You Can Save',
    pricing_title_html: 'Simple ways to <em>save a place</em>',
    pricing_now_badge: 'Available Now',
    pricing_limited_badge: 'Available Now',
    pricing_public_name: 'Public Mark',
    pricing_public_desc: 'Save a public mark with your name, coordinates, and written message.',
    pricing_public_feat1: 'Permanent globe placement',
    pricing_public_feat2: 'Optional photo',
    pricing_public_feat3: 'Country attribution',
    pricing_capsule_name: 'Mark + Capsule',
    pricing_capsule_desc: 'Save your mark now and choose a future opening date so the memory opens later.',
    pricing_capsule_feat1: 'Everything in Public Mark',
    pricing_capsule_feat2: 'Text message support',
    pricing_capsule_feat3: 'Future opening date',
    pricing_gift_name: 'Gift Capsule',
    pricing_gift_desc: 'Send a capsule with a recipient email and a scheduled opening date.',
    pricing_gift_feat1: 'Recipient email field',
    pricing_gift_feat2: 'Capsule timing options',
    pricing_gift_feat3: 'Share card after save',
    pricing_note: 'Every memory starts with a place and a written note. Add a photo if you want, then decide whether it stays public or opens later as a capsule.',
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
    start_hint: 'Open the panel, choose a place, and save your first memory on the globe.',
    create_my_mark: 'Add My First Mark',
    later: 'Later',
    next_up: 'Next Up',
    quick_start: 'Quick Start',
    quick_start_1: 'Choose the name that will appear on your mark.',
    quick_start_2: 'Click the globe once to preview the exact place.',
    quick_start_3: 'Confirm the place, finish the message, and save.',
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
    auth_register_sub: 'Create an account to save places and revisit them later.',
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
    profile_place_new: 'Add New Mark',
    profile_recent_activity: 'Recent activity',
    search_placeholder: 'Search for a country...',
    search_hint_empty: 'Start with a country or pick one of the suggestions below.',
    search_no_results: 'No matching places yet. Try a country name or a different spelling.',
    search_suggestion_country: 'Country',
    search_suggestion_city: 'City',
    search_suggestion_mark: 'Saved mark',
    search_suggestion_coords: 'Coordinates',
    search_suggestion_recent: 'Recent',
    location_click_placeholder: 'Click on the globe to choose a place...',
    country_select_placeholder: 'Select country...',
    your_details: 'Your Details',
    your_details_sub: 'Choose the name people will see on this mark.',
    display_name: 'Display Name',
    your_name: 'Your name',
    photo_optional: 'Photo (optional)',
    photo_soft_note: 'You can skip this. Photos are only used on your mark card after you save.',
    add_photo: '+ Add photo',
    continue_location: 'Continue to Location',
    choose_location: 'Choose Location',
    choose_location_sub: 'Click on the globe or search for a place to lock the exact location.',
    choose_location_help: 'Click once on the globe to preview the pin, then confirm it when the place feels right.',
    or_search: 'Or search',
    exact_coordinates: 'Exact Coordinates',
    memory_note_helper: 'Optional: leave a draft note now, then finish the full message in the next step.',
    continue_message: 'Continue to Message',
    back: 'Back',
    your_message: 'Message for This Memory',
    your_message_sub: 'Write the note that will be saved with this mark or revealed when the capsule opens.',
    message_for_memory: 'Message for This Memory',
    message_for_memory_sub: 'Now write the note that will be saved with this mark or revealed when the capsule opens.',
    message: 'Message',
    message_placeholder: 'I was here in Istanbul, and I want to remember this day...',
    memory_note: 'Memory Note',
    memory_note_placeholder: 'Leave a short note for this place...',
    continue_capsule: 'Continue to Visibility',
    capsule_options: 'Show Now or Open Later',
    capsule_options_sub: 'Pick one clear mode: visible now as a public mark, or locked until a future date.',
    visibility_note_public: 'Show this memory now as a public mark on the globe.',
    visibility_note_capsule: 'Keep this memory locked until the date you choose below.',
    visibility_mode_public: 'Show it now',
    visibility_mode_capsule: 'Open it later as a capsule',
    recipient: 'Recipient',
    myself: 'Myself',
    someone_else: 'Someone Else',
    recipient_email: 'Recipient Email',
    recipient_email_placeholder: 'their@email.com',
    opens_in: 'When should it open?',
    custom: 'Custom',
    select_date: 'Select Date',
    capsule_opens: 'Opening Time',
    or: 'or',
    no_capsule: 'Show it now (public mark)',
    continue_review: 'Continue to Review',
    review_place: 'Review & Place',
    review_place_sub: 'Review the details before saving this memory to the globe.',
    save_my_mark: 'Save My Mark',
    success_title: "You're on the Globe",
    success_visible: 'Your memory is now live on the globe.',
    share_card: 'Share Mark',
    done: 'Done',
    share_delete: 'Delete',
    share_copy_link: 'Copy Link',
    share_share: 'Share',
    share_close: 'Close',
    share_public: 'Public mark',
    share_visible_now: 'Visible now',
    country_summary_empty: 'No marks on the globe yet. Save the first one to start your country list.',
    profile_no_marks: 'No marks yet',
    profile_latest_prefix: 'Latest stop:',
    profile_recent_cta: 'Place your first mark',
    share_headline_mark: 'Ready to share',
    share_headline_capsule: 'Share this capsule',
    share_country_prefix: 'Pinned in',
    share_saved_prefix: 'Saved on',
    share_public_memory: 'Public memory',
    share_capsule_memory: 'Time capsule',
    share_fallback_message: 'Saved on I Was Here as a place worth returning to.',
    empty_country_summary_cta_signed_in: 'Place your first mark',
    empty_country_summary_cta_signed_out: 'Sign in to start',
    empty_my_marks: 'You have not placed a mark yet. Your saved places will appear here first.',
    empty_my_marks_cta: 'Place my first mark',
    empty_profile_activity: 'Nothing here yet. Your latest marks and capsule updates will appear in this section.',
    empty_public_list: 'No public marks are visible yet. The first saved public memory will appear here.',
    empty_public_list_cta_signed_in: 'Add the first public mark',
    empty_public_list_cta_signed_out: 'Sign in to add a mark',
    empty_countries_jump: 'No countries to jump to yet. Save the first mark and we will start the list.',
    empty_view_my: 'You have not saved any marks yet. Start with one place that matters to you.',
    empty_view_other: 'No marks matched this view yet. Try another shortcut or place the next mark.',
    loading_marks: 'Loading marks...',
    loading_country_summary: 'Loading country activity...',
    discovery_jump_country: 'Jump to country',
    discovery_open_mark: 'Open mark',
    discovery_friends_placeholder: 'Friends feed is not connected yet. Use Recent or My Marks for now.',
    toast_jump_country: 'Jumped to',
    toast_open_mark: 'Opened mark in',
    toast_share_copied: 'Share link copied.',
    toast_choose_mark_share: 'Choose a mark before sharing.',
    toast_choose_mark_copy: 'Choose a mark before copying the link.',
    toast_mark_link_missing: 'This mark does not have a shareable link yet.',
    toast_sign_in_before_save: 'Sign in before saving a mark.',
    toast_confirm_location: 'Confirm a location before saving this memory.',
    toast_save_failed: 'This memory could not be saved. Please try again.',
    toast_saved_success: 'Your memory is now visible on the globe.',
    toast_mark_deleted: 'Mark deleted.',
    header_marks_short: 'marks',
    header_countries_short: 'countries',
    header_capsules_short: 'capsules'
  },
  tr: {
    nav_sign_in: 'Giris yap',
    nav_sign_out: 'Cikis yap',
    nav_open_globe: 'Kureyi Ac',
    nav_back_home: 'Ana Sayfaya Don',
    hero_eyebrow: 'Anlamli anilar icin dunya haritasi',
    hero_title_html: 'Dunyaya <em>izini</em><br>birak',
    hero_subtitle: 'Anlamli bir yeri kaydet, ardindaki aniyi yaz ve bunun simdi mi gorunecegine yoksa sonra mi acilacagina karar ver.',
    hero_how: 'Nasil Calisir',
    stat_marks: 'Birakilan Iz',
    stat_countries: 'Ulkeler',
    stat_capsules: 'Aktif Kapsuller',
    how_label: 'Nasil Calisir',
    how_title_html: 'Bir <em>aniyi</em> kaydetmek icin uc adim',
    how_step1_title: 'Yerini Sec',
    how_step1_body: 'Bu aninin ait oldugu noktayi kure uzerinde tam olarak sec.',
    how_step2_title: 'Mesajini Yaz',
    how_step2_body: 'Bu yere anlamini verecek mesaji yaz. Istersen fotograf da ekleyebilirsin.',
    how_step3_title: 'Simdi Goster ya da Sonra Ac',
    how_step3_body: 'Bunu simdi herkese acik bir iz olarak birak ya da gelecekte acilacak bir kapsul olarak kilitle.',
    pricing_label: 'Neler Kaydedebilirsin',
    pricing_title_html: 'Bir yeri <em>kaydetmenin sade yollari</em>',
    pricing_now_badge: 'Simdi Hazir',
    pricing_limited_badge: 'Simdi Hazir',
    pricing_public_name: 'Herkese Acik Iz',
    pricing_public_desc: 'Adin, koordinatlarin ve yazili mesajinla herkese acik bir iz kaydet.',
    pricing_public_feat1: 'Kalici kure yerlesimi',
    pricing_public_feat2: 'Istege bagli fotograf',
    pricing_public_feat3: 'Ulke atamasi',
    pricing_capsule_name: 'Iz + Kapsul',
    pricing_capsule_desc: 'Izini simdi kaydet ve aninin daha sonra acilmasi icin bir tarih sec.',
    pricing_capsule_feat1: 'Herkese Acik Iz paketindeki her sey',
    pricing_capsule_feat2: 'Yazili mesaj destegi',
    pricing_capsule_feat3: 'Gelecekte acilma tarihi',
    pricing_gift_name: 'Hediye Kapsul',
    pricing_gift_desc: 'Bir alici e-postasi ve acilis zamani ile kapsul gonderebilirsin.',
    pricing_gift_feat1: 'Alici e-posta alani',
    pricing_gift_feat2: 'Kapsul zamanlama secenekleri',
    pricing_gift_feat3: 'Kaydettikten sonra paylasim karti',
    pricing_note: 'Her ani bir yer ve yazili bir not ile baslar. Istersen fotograf ekle, sonra bunun herkese acik mi kalacagina yoksa kapsul olarak mi acilacagina karar ver.',
    footer_privacy: 'Gizlilik Politikasi',
    footer_terms: 'Hizmet Sartlari',
    footer_contact: 'Iletisim',
    cookie_text: 'Oturumunu korumak ve deneyimi iyilestirmek icin zorunlu cerezler kullaniyoruz. Devam ederek Gizlilik Politikasi ve Hizmet Sartlarini kabul etmis olursun.',
    cookie_accept: 'Kabul Et',
    cookie_decline: 'Reddet',
    selected_location: 'Secili Konum',
    marks_by_country: 'Ulkelere Gore Izler',
    controls_auto_rotate: 'Otomatik Dondur',
    controls_borders: 'Sinirlar',
    controls_labels: 'Etiketler',
    start_here: 'Buradan Basla',
    start_hint: 'Paneli ac, bir yer sec ve kure uzerindeki ilk anini kaydet.',
    create_my_mark: 'Ilk Izimi Ekle',
    later: 'Sonra',
    next_up: 'Siradaki',
    quick_start: 'Hizli Baslangic',
    quick_start_1: 'Izinde gorunecek ismi sec.',
    quick_start_2: 'Tam yeri gormek icin kureye bir kez tikla.',
    quick_start_3: 'Yeri onayla, mesaji tamamla ve kaydet.',
    recent_marks: 'Son Izler',
    quick_my: 'Izlerim',
    quick_nearby: 'Yakinimda',
    quick_trending: 'One Cikanlar',
    quick_friends: 'Arkadaslar',
    quick_recent: 'Yeni',
    quick_countries: 'Ulkeler',
    auth_welcome_back: 'Tekrar hos geldin',
    auth_create_account: 'Hesap olustur',
    auth_reset_password: 'Sifre sifirla',
    auth_sign_in_sub: 'Izlerini yonetmek icin giris yap.',
    auth_register_sub: 'Yerlerini kaydetmek ve sonra tekrar gormek icin hesap olustur.',
    auth_forgot_sub: 'E-postani gir, sana bir sifirlama baglantisi gonderelim.',
    auth_register_tab: 'Kayit Ol',
    auth_forgot: 'Sifremi unuttum',
    auth_back_to_sign_in: 'Giris sayfasina don',
    auth_continue_google: 'Google ile devam et',
    auth_or_email: 'veya e-posta ile',
    auth_full_name: 'Ad Soyad',
    auth_email: 'E-posta',
    auth_password: 'Sifre',
    auth_terms_agree_html: '<a href="/terms.html" target="_blank" style="color:#c8a96e;margin:0 3px;">Hizmet Sartlari</a> ve <a href="/privacy-policy.html" target="_blank" style="color:#c8a96e;margin:0 3px;">Gizlilik Politikasi</a> metinlerini kabul ediyorum',
    auth_send_reset: 'Sifirlama baglantisi gonder',
    my_marks: 'Izlerim',
    profile_title: 'Profil',
    profile_your_world: 'Senin Dunyan',
    profile_marks: 'Iz',
    profile_countries: 'Ulke',
    profile_capsules: 'Kapsul',
    profile_view_marks: 'Izlerimi Gor',
    profile_place_new: 'Yeni Iz Ekle',
    profile_recent_activity: 'Son hareketler',
    search_placeholder: 'Bir ulke ara...',
    search_hint_empty: 'Bir ulke ile basla ya da asagidaki onerilerden birini sec.',
    search_no_results: 'Eslesen bir yer bulunamadi. Bir ulke adi ya da farkli bir yazim dene.',
    search_suggestion_country: 'Ulke',
    search_suggestion_city: 'Sehir',
    search_suggestion_mark: 'Kayitli iz',
    search_suggestion_coords: 'Koordinatlar',
    search_suggestion_recent: 'Yeni',
    location_click_placeholder: 'Bir yer secmek icin kureye tikla...',
    country_select_placeholder: 'Ulke sec...',
    your_details: 'Bilgilerin',
    your_details_sub: 'Bu izde gorunecek ismi sec.',
    display_name: 'Gorunen Isim',
    your_name: 'Ismin',
    photo_optional: 'Fotograf (istege bagli)',
    photo_soft_note: 'Istersen bunu atlayabilirsin. Fotograf yalnizca kaydettikten sonra iz kartinda kullanilir.',
    add_photo: '+ Fotograf ekle',
    continue_location: 'Konuma Gec',
    choose_location: 'Konum Sec',
    choose_location_sub: 'Konumu kilitlemek icin kure uzerinde bir yere tikla ya da bir yer ara.',
    choose_location_help: 'Pini onizlemek icin kureye bir kez tikla. Yer dogruysa onayla ve devam et.',
    or_search: 'Ya da ara',
    exact_coordinates: 'Tam Koordinatlar',
    memory_note_helper: 'Istege bagli: Kisa bir notu burada birak, tam mesaji bir sonraki adimda tamamla.',
    continue_message: 'Mesaja Gec',
    back: 'Geri',
    your_message: 'Bu Ani Icin Mesaj',
    your_message_sub: 'Bu izle kaydedilecek ya da kapsul acildiginda gorunecek notu yaz.',
    message_for_memory: 'Bu Ani Icin Mesaj',
    message_for_memory_sub: 'Simdi bu yerle birlikte kaydedilecek ya da kapsul acildiginda gorunecek notu yaz.',
    message: 'Mesaj',
    message_placeholder: 'Bugun burada bulundum ve bu ani hatirlamak istiyorum...',
    memory_note: 'Ani Notu',
    memory_note_placeholder: 'Bu yer icin kisa bir not birak...',
    continue_capsule: 'Gorunurluge Gec',
    capsule_options: 'Simdi Goster ya da Sonra Ac',
    capsule_options_sub: 'Tek bir secim yap: herkese acik olarak simdi goster ya da gelecekte acilacak bir kapsule donustur.',
    visibility_note_public: 'Bu aniyi simdi herkese acik bir iz olarak goster.',
    visibility_note_capsule: 'Bu aniyi asagida sececegin tarihe kadar kilitli tut.',
    visibility_mode_public: 'Simdi goster',
    visibility_mode_capsule: 'Kapsul olarak sonra ac',
    recipient: 'Alici',
    myself: 'Kendim',
    someone_else: 'Baska Biri',
    recipient_email: 'Alici E-postasi',
    recipient_email_placeholder: 'onun@email.com',
    opens_in: 'Ne zaman acilsin?',
    custom: 'Ozel',
    select_date: 'Tarih Sec',
    capsule_opens: 'Acilis Zamani',
    or: 'veya',
    no_capsule: 'Simdi goster (herkese acik iz)',
    continue_review: 'Ozete Gec',
    review_place: 'Gozden Gecir ve Birak',
    review_place_sub: 'Bu aniyi kureye kaydetmeden once ayrintilari son kez kontrol et.',
    save_my_mark: 'Izimi Kaydet',
    success_title: 'Artik Kuredesin',
    success_visible: 'Anin artik kure uzerinde gorunur.',
    share_card: 'Izi Paylas',
    done: 'Tamam',
    share_delete: 'Sil',
    share_copy_link: 'Baglantiyi Kopyala',
    share_share: 'Paylas',
    share_close: 'Kapat',
    share_public: 'Herkese acik iz',
    share_visible_now: 'Simdi gorunur',
    country_summary_empty: 'Kure uzerinde henuz iz yok. Ulke listesini baslatmak icin ilk izini kaydet.',
    profile_no_marks: 'Henuz iz yok',
    profile_latest_prefix: 'Son durak:',
    profile_recent_cta: 'Ilk izini birak',
    share_headline_mark: 'Paylasima hazir',
    share_headline_capsule: 'Bu kapsulu paylas',
    share_country_prefix: 'Isaretlenen yer',
    share_saved_prefix: 'Kayit tarihi',
    share_public_memory: 'Herkese acik ani',
    share_capsule_memory: 'Zaman kapsulu',
    share_fallback_message: 'I Was Here uzerinde geri donmeye deger bir yer olarak kaydedildi.',
    empty_country_summary_cta_signed_in: 'Ilk izimi birak',
    empty_country_summary_cta_signed_out: 'Baslamak icin giris yap',
    empty_my_marks: 'Henuz bir iz birakmadin. Kaydettigin yerler once burada gorunecek.',
    empty_my_marks_cta: 'Ilk izimi birak',
    empty_profile_activity: 'Burasi henuz bos. Son izlerin ve kapsul guncellemelerin burada gorunecek.',
    empty_public_list: 'Henuz gorunen herkese acik iz yok. Kaydedilen ilk public ani burada belirecek.',
    empty_public_list_cta_signed_in: 'Ilk public izi ekle',
    empty_public_list_cta_signed_out: 'Iz eklemek icin giris yap',
    empty_countries_jump: 'Henuz gidilecek bir ulke yok. Ilk izini birak, liste burada baslasin.',
    empty_view_my: 'Henuz hic izin yok. Senin icin anlamli bir yerle basla.',
    empty_view_other: 'Bu gorunum icin henuz iz bulunmadi. Baska bir kisayol dene ya da siradaki izi birak.',
    loading_marks: 'Izler yukleniyor...',
    loading_country_summary: 'Ulke hareketi yukleniyor...',
    discovery_jump_country: 'Ulkeye git',
    discovery_open_mark: 'Izi ac',
    discovery_friends_placeholder: 'Arkadas akisi henuz bagli degil. Simdilik Yeni veya Izlerim gorunumunu kullan.',
    toast_jump_country: 'Ulasilan ulke',
    toast_open_mark: 'Acilan iz',
    toast_share_copied: 'Paylasim baglantisi kopyalandi.',
    toast_choose_mark_share: 'Paylasmadan once bir iz sec.',
    toast_choose_mark_copy: 'Baglantiyi kopyalamadan once bir iz sec.',
    toast_mark_link_missing: 'Bu iz icin henuz paylasilabilir bir baglanti yok.',
    toast_sign_in_before_save: 'Bir iz kaydetmeden once giris yap.',
    toast_confirm_location: 'Bu aniyi kaydetmeden once bir konum onayla.',
    toast_save_failed: 'Bu ani kaydedilemedi. Lutfen tekrar dene.',
    toast_saved_success: 'Anin artik kure uzerinde gorunur.',
    toast_mark_deleted: 'Iz silindi.',
    header_marks_short: 'iz',
    header_countries_short: 'ulke',
    header_capsules_short: 'kapsul'
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
    if (days <= 7) return days + ' gun sonra';
    if (days <= 31) return Math.round(days / 7) + ' hafta sonra';
    if (days <= 365) return Math.round(days / 30) + ' ay sonra';
    return Math.round(days / 365) + ' yil sonra';
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
