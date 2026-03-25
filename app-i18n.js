var I18N_LANG_KEY = 'iwh_lang';
var I18N_DEFAULT_LANG = 'en';
var I18N_SUPPORTED = ['en'];

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
    auth_terms_agree_html: 'I agree to the <a href="/terms.html" target="_blank" style="color:#c8a96e;margin:0 3px;">Terms of Service</a> and <a href="/privacy-policy.html" target="_blank" style="color:#c8a96e;margin:0 3px;">Privacy Policy</a>',
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
  }
};

function getCurrentLanguage() {
  return I18N_DEFAULT_LANG;
}

function getCurrentLocale() {
  return 'en-US';
}

function t(key, params) {
  var dict = I18N_MESSAGES.en;
  var text = dict[key] || key;
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, function(_, name) {
    return params[name] != null ? String(params[name]) : '';
  });
}

function formatDateI18n(date, options) {
  return new Date(date).toLocaleDateString(getCurrentLocale(), options || { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatRelativeDurationDays(days) {
  if (days <= 7) return 'In ' + days + ' day' + (days > 1 ? 's' : '');
  if (days <= 31) {
    var weeks = Math.round(days / 7);
    return 'In ' + weeks + ' week' + (weeks > 1 ? 's' : '');
  }
  if (days <= 365) {
    var months = Math.round(days / 30);
    return 'In ' + months + ' month' + (months > 1 ? 's' : '');
  }
  var years = Math.round(days / 365);
  return 'In ' + years + ' year' + (years > 1 ? 's' : '');
}

function getMarkWord(count) {
  return count + ' mark' + (count === 1 ? '' : 's');
}

function applyTranslations() {
  document.documentElement.lang = 'en';
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
    button.style.display = 'none';
  });
}

function setLanguage() {
  window.IWH_LANG = 'en';
  localStorage.setItem(I18N_LANG_KEY, 'en');
  applyTranslations();
  if (typeof window.refreshLocalizedUI === 'function') window.refreshLocalizedUI();
}

function initI18n() {
  window.IWH_LANG = 'en';
  localStorage.setItem(I18N_LANG_KEY, 'en');
  applyTranslations();
}

window.IWH_LANG = 'en';
window.I18N_MESSAGES = I18N_MESSAGES;
window.t = t;
window.setLanguage = setLanguage;
window.applyTranslations = applyTranslations;
window.formatDateI18n = formatDateI18n;
window.formatRelativeDurationDays = formatRelativeDurationDays;
window.getMarkWord = getMarkWord;
window.getCurrentLocale = getCurrentLocale;

document.addEventListener('DOMContentLoaded', initI18n);
