// All user-facing strings, keyed per locale. `en` is the source of truth:
// every other locale must provide the same keys (enforced by the Messages type).

export const LOCALES = [
  "en",
  "fa",
  "ar",
  "tr",
  "id",
  "fr",
  "ur",
  "hi",
  "de",
  "bs",
  "vi",
  "bn",
  "sw",
] as const;

export type Locale = (typeof LOCALES)[number];

// Right-to-left locales. Used to set the document `dir`.
export const RTL_LOCALES: ReadonlySet<Locale> = new Set<Locale>([
  "fa",
  "ar",
  "ur",
]);

const en = {
  appName: "Qibla Map",
  appDescription:
    "A simple Qibla finder that shows the Qibla direction on a map.",
  locationAccessGranted: "Location access granted.",
  latitude: "Latitude",
  longitude: "Longitude",
  refresh: "Refresh",
  geolocationDenied:
    "Your browser cannot access Geolocation or permission was denied.",
  enterManually: "You can enter coordinates manually to open the map.",
  openMap: "Open Map",
  tryAgain: "Try Again",
  permissionNeededLocation:
    "This device may require permission to access location.",
  getLocation: "Get Location",
  manualCoordsLabel: "Manual coordinates (lat, lon)",
  paste: "Paste",
  pasteTitle: "Paste coordinates from clipboard",
  pastePrompt: "Paste coordinates here:",
  noClipboard: "No clipboard text available.",
  parseError: "Could not parse coordinates from clipboard.",
  checkingCapabilities: "Checking your device capabilities",
  pleaseWait: "Please wait",
  noOrientation: "Your browser cannot access Device Orientation events.",
  compassUnavailable: "Compass functionality will be unavailable",
  openingMap: "Opening map...",
  permissionNeededMotion:
    "This device may require permission to access motion sensors for compass functionality.",
  allowMotion: "Allow Motion Access",
  compassLock: "Compass Lock",
  facingKaaba: "You are facing Kaaba",
  notFacingKaaba: "You are not facing Kaaba",
  locationDenied:
    "Location permission was denied. Allow location for this site in your browser settings, or enter coordinates manually.",
  locationUnavailable:
    "Your device could not determine a position. Check that location is switched on and that your browser is allowed to use it.",
  locationTimeout:
    "Getting a GPS fix took too long. Try again outdoors, or enter coordinates manually.",
  locationInsecure: "Location access requires a secure (https) connection.",
  searchingGps:
    "Searching for a GPS signal. Outdoors this can take up to a minute.",
  invalidCoords:
    "Latitude must be between -90 and 90, longitude between -180 and 180.",
  continueWithoutCompass: "Continue without compass",
  compassBlockedHint:
    "Some browsers block motion sensors by default. Check your browser's site settings and give the browser the sensors permission on your phone.",
  findMyLocation: "Find my location",
  setLocationManually: "Set location manually",
  save: "Save",
  pwaUpdateAvailable: "New content available, click on reload button to update",
  reload: "Reload",
  close: "Close",
  installPwa: "Install PWA",
  install: "Install",
  cancel: "Cancel",
};

export type MessageKey = keyof typeof en;
type Messages = Record<MessageKey, string>;

const fa: Messages = {
  appName: "نقشه قبله",
  appDescription: "قبله‌یاب ساده که جهت قبله را روی نقشه نشان می‌دهد.",
  locationAccessGranted: "دسترسی به موقعیت مکانی داده شد.",
  latitude: "عرض جغرافیایی",
  longitude: "طول جغرافیایی",
  refresh: "به‌روزرسانی",
  geolocationDenied:
    "مرورگر شما به موقعیت مکانی دسترسی ندارد یا اجازه داده نشد.",
  enterManually: "می‌توانید مختصات را به‌صورت دستی وارد کنید تا نقشه باز شود.",
  openMap: "باز کردن نقشه",
  tryAgain: "تلاش دوباره",
  permissionNeededLocation:
    "این دستگاه ممکن است برای دسترسی به موقعیت مکانی به اجازه نیاز داشته باشد.",
  getLocation: "دریافت موقعیت",
  manualCoordsLabel: "مختصات دستی (عرض، طول)",
  paste: "چسباندن",
  pasteTitle: "چسباندن مختصات از کلیپ‌بورد",
  pastePrompt: "مختصات را اینجا بچسبانید:",
  noClipboard: "متنی در کلیپ‌بورد موجود نیست.",
  parseError: "مختصات از کلیپ‌بورد قابل خواندن نبود.",
  checkingCapabilities: "در حال بررسی قابلیت‌های دستگاه شما",
  pleaseWait: "لطفاً صبر کنید",
  noOrientation: "مرورگر شما به رویدادهای جهت‌گیری دستگاه دسترسی ندارد.",
  compassUnavailable: "قابلیت قطب‌نما در دسترس نخواهد بود",
  openingMap: "در حال باز کردن نقشه...",
  permissionNeededMotion:
    "این دستگاه ممکن است برای دسترسی به حسگرهای حرکتی جهت قطب‌نما به اجازه نیاز داشته باشد.",
  allowMotion: "اجازه دسترسی به حرکت",
  compassLock: "قفل قطب‌نما",
  facingKaaba: "رو به کعبه هستید",
  notFacingKaaba: "رو به کعبه نیستید",
  locationDenied:
    "اجازه دسترسی به موقعیت مکانی داده نشد. در تنظیمات مرورگر برای این سایت اجازه دهید، یا مختصات را دستی وارد کنید.",
  locationUnavailable:
    "دستگاه شما نتوانست موقعیت را تعیین کند. مطمئن شوید موقعیت مکانی روشن است و مرورگر اجازه استفاده از آن را دارد.",
  locationTimeout:
    "دریافت موقعیت GPS بیش از حد طول کشید. در فضای باز دوباره تلاش کنید یا مختصات را دستی وارد کنید.",
  locationInsecure: "دسترسی به موقعیت مکانی نیازمند اتصال امن (https) است.",
  searchingGps:
    "در حال جست‌وجوی سیگنال GPS. در فضای باز ممکن است تا یک دقیقه طول بکشد.",
  invalidCoords:
    "عرض جغرافیایی باید بین ۹۰- و ۹۰ و طول جغرافیایی بین ۱۸۰- و ۱۸۰ باشد.",
  continueWithoutCompass: "ادامه بدون قطب‌نما",
  compassBlockedHint:
    "برخی مرورگرها به‌صورت پیش‌فرض حسگرهای حرکتی را مسدود می‌کنند. تنظیمات سایت در مرورگر را بررسی کنید و اجازه دسترسی به حسگرها را به مرورگر بدهید.",
  findMyLocation: "یافتن موقعیت من",
  setLocationManually: "تنظیم دستی موقعیت",
  save: "ذخیره",
  pwaUpdateAvailable:
    "محتوای جدید موجود است، برای به‌روزرسانی روی دکمه بارگذاری مجدد کلیک کنید",
  reload: "بارگذاری مجدد",
  close: "بستن",
  installPwa: "نصب برنامه",
  install: "نصب",
  cancel: "لغو",
};

const ar: Messages = {
  appName: "خريطة القبلة",
  appDescription: "أداة بسيطة لتحديد القبلة تعرض اتجاه القبلة على الخريطة.",
  locationAccessGranted: "تم منح إذن الوصول إلى الموقع.",
  latitude: "خط العرض",
  longitude: "خط الطول",
  refresh: "تحديث",
  geolocationDenied: "لا يمكن لمتصفحك الوصول إلى تحديد الموقع أو تم رفض الإذن.",
  enterManually: "يمكنك إدخال الإحداثيات يدويًا لفتح الخريطة.",
  openMap: "فتح الخريطة",
  tryAgain: "حاول مرة أخرى",
  permissionNeededLocation: "قد يتطلب هذا الجهاز إذنًا للوصول إلى الموقع.",
  getLocation: "الحصول على الموقع",
  manualCoordsLabel: "إحداثيات يدوية (خط العرض، خط الطول)",
  paste: "لصق",
  pasteTitle: "لصق الإحداثيات من الحافظة",
  pastePrompt: "الصق الإحداثيات هنا:",
  noClipboard: "لا يوجد نص في الحافظة.",
  parseError: "تعذر قراءة الإحداثيات من الحافظة.",
  checkingCapabilities: "جارٍ التحقق من قدرات جهازك",
  pleaseWait: "يرجى الانتظار",
  noOrientation: "لا يمكن لمتصفحك الوصول إلى أحداث اتجاه الجهاز.",
  compassUnavailable: "ميزة البوصلة غير متاحة",
  openingMap: "جارٍ فتح الخريطة...",
  permissionNeededMotion:
    "قد يتطلب هذا الجهاز إذنًا للوصول إلى مستشعرات الحركة لتشغيل البوصلة.",
  allowMotion: "السماح بالوصول إلى الحركة",
  compassLock: "قفل البوصلة",
  facingKaaba: "أنت تواجه الكعبة",
  notFacingKaaba: "أنت لا تواجه الكعبة",
  locationDenied:
    "تم رفض إذن الوصول إلى الموقع. اسمح بالوصول إلى الموقع لهذا الموقع في إعدادات المتصفح، أو أدخل الإحداثيات يدويًا.",
  locationUnavailable:
    "تعذّر على جهازك تحديد الموقع. تأكد من تشغيل خدمة الموقع ومن السماح للمتصفح باستخدامها.",
  locationTimeout:
    "استغرق تحديد الموقع عبر GPS وقتًا طويلًا. حاول مرة أخرى في الخارج، أو أدخل الإحداثيات يدويًا.",
  locationInsecure: "يتطلب الوصول إلى الموقع اتصالًا آمنًا (https).",
  searchingGps: "جارٍ البحث عن إشارة GPS. قد يستغرق ذلك دقيقة في الهواء الطلق.",
  invalidCoords: "يجب أن يكون خط العرض بين -90 و90، وخط الطول بين -180 و180.",
  continueWithoutCompass: "المتابعة بدون بوصلة",
  compassBlockedHint:
    "تحجب بعض المتصفحات مستشعرات الحركة افتراضيًا. راجع إعدادات الموقع في متصفحك وامنح المتصفح إذن الوصول إلى المستشعرات على هاتفك.",
  findMyLocation: "تحديد موقعي",
  setLocationManually: "تحديد الموقع يدويًا",
  save: "حفظ",
  pwaUpdateAvailable: "يتوفر محتوى جديد، انقر على زر إعادة التحميل للتحديث",
  reload: "إعادة التحميل",
  close: "إغلاق",
  installPwa: "تثبيت التطبيق",
  install: "تثبيت",
  cancel: "إلغاء",
};

const tr: Messages = {
  appName: "Kıble Haritası",
  appDescription:
    "Kıble yönünü harita üzerinde gösteren basit bir kıble bulucu.",
  locationAccessGranted: "Konum erişimi verildi.",
  latitude: "Enlem",
  longitude: "Boylam",
  refresh: "Yenile",
  geolocationDenied: "Tarayıcınız konuma erişemiyor veya izin reddedildi.",
  enterManually: "Haritayı açmak için koordinatları elle girebilirsiniz.",
  openMap: "Haritayı Aç",
  tryAgain: "Tekrar Dene",
  permissionNeededLocation: "Bu cihaz konuma erişmek için izin gerektirebilir.",
  getLocation: "Konumu Al",
  manualCoordsLabel: "Elle koordinat (enlem, boylam)",
  paste: "Yapıştır",
  pasteTitle: "Koordinatları panodan yapıştır",
  pastePrompt: "Koordinatları buraya yapıştırın:",
  noClipboard: "Panoda metin yok.",
  parseError: "Koordinatlar panodan okunamadı.",
  checkingCapabilities: "Cihazınızın özellikleri kontrol ediliyor",
  pleaseWait: "Lütfen bekleyin",
  noOrientation: "Tarayıcınız cihaz yönelim olaylarına erişemiyor.",
  compassUnavailable: "Pusula işlevi kullanılamayacak",
  openingMap: "Harita açılıyor...",
  permissionNeededMotion:
    "Bu cihaz, pusula işlevi için hareket sensörlerine erişim izni gerektirebilir.",
  allowMotion: "Harekete Erişime İzin Ver",
  compassLock: "Pusula Kilidi",
  facingKaaba: "Kâbe'ye dönüksünüz",
  notFacingKaaba: "Kâbe'ye dönük değilsiniz",
  locationDenied:
    "Konum izni reddedildi. Tarayıcı ayarlarından bu siteye konum izni verin veya koordinatları elle girin.",
  locationUnavailable:
    "Cihazınız konumu belirleyemedi. Konum servisinin açık olduğundan ve tarayıcının kullanmasına izin verildiğinden emin olun.",
  locationTimeout:
    "GPS konumu almak çok uzun sürdü. Açık alanda tekrar deneyin veya koordinatları elle girin.",
  locationInsecure: "Konum erişimi güvenli (https) bir bağlantı gerektirir.",
  searchingGps:
    "GPS sinyali aranıyor. Açık alanda bu bir dakikaya kadar sürebilir.",
  invalidCoords: "Enlem -90 ile 90, boylam -180 ile 180 arasında olmalıdır.",
  continueWithoutCompass: "Pusulasız devam et",
  compassBlockedHint:
    "Bazı tarayıcılar hareket sensörlerini varsayılan olarak engeller. Tarayıcınızın site ayarlarını kontrol edin ve telefonunuzda tarayıcıya sensör izni verin.",
  findMyLocation: "Konumumu bul",
  setLocationManually: "Konumu elle ayarla",
  save: "Kaydet",
  pwaUpdateAvailable:
    "Yeni içerik mevcut, güncellemek için yeniden yükle düğmesine tıklayın",
  reload: "Yeniden Yükle",
  close: "Kapat",
  installPwa: "Uygulamayı Yükle",
  install: "Yükle",
  cancel: "İptal",
};

const id: Messages = {
  appName: "Peta Kiblat",
  appDescription:
    "Pencari kiblat sederhana yang menunjukkan arah kiblat di peta.",
  locationAccessGranted: "Akses lokasi diberikan.",
  latitude: "Lintang",
  longitude: "Bujur",
  refresh: "Segarkan",
  geolocationDenied:
    "Browser Anda tidak dapat mengakses Geolokasi atau izin ditolak.",
  enterManually:
    "Anda dapat memasukkan koordinat secara manual untuk membuka peta.",
  openMap: "Buka Peta",
  tryAgain: "Coba Lagi",
  permissionNeededLocation:
    "Perangkat ini mungkin memerlukan izin untuk mengakses lokasi.",
  getLocation: "Dapatkan Lokasi",
  manualCoordsLabel: "Koordinat manual (lintang, bujur)",
  paste: "Tempel",
  pasteTitle: "Tempel koordinat dari papan klip",
  pastePrompt: "Tempel koordinat di sini:",
  noClipboard: "Tidak ada teks di papan klip.",
  parseError: "Tidak dapat membaca koordinat dari papan klip.",
  checkingCapabilities: "Memeriksa kemampuan perangkat Anda",
  pleaseWait: "Mohon tunggu",
  noOrientation:
    "Browser Anda tidak dapat mengakses peristiwa Orientasi Perangkat.",
  compassUnavailable: "Fungsi kompas tidak akan tersedia",
  openingMap: "Membuka peta...",
  permissionNeededMotion:
    "Perangkat ini mungkin memerlukan izin untuk mengakses sensor gerak untuk fungsi kompas.",
  allowMotion: "Izinkan Akses Gerak",
  compassLock: "Kunci Kompas",
  facingKaaba: "Anda menghadap Kakbah",
  notFacingKaaba: "Anda tidak menghadap Kakbah",
  locationDenied:
    "Izin lokasi ditolak. Izinkan lokasi untuk situs ini di pengaturan peramban, atau masukkan koordinat secara manual.",
  locationUnavailable:
    "Perangkat Anda tidak dapat menentukan posisi. Pastikan layanan lokasi aktif dan peramban diizinkan menggunakannya.",
  locationTimeout:
    "Mendapatkan sinyal GPS terlalu lama. Coba lagi di luar ruangan, atau masukkan koordinat secara manual.",
  locationInsecure: "Akses lokasi memerlukan koneksi aman (https).",
  searchingGps:
    "Mencari sinyal GPS. Di luar ruangan ini bisa memakan waktu hingga satu menit.",
  invalidCoords: "Lintang harus antara -90 dan 90, bujur antara -180 dan 180.",
  continueWithoutCompass: "Lanjutkan tanpa kompas",
  compassBlockedHint:
    "Beberapa peramban memblokir sensor gerak secara bawaan. Periksa pengaturan situs peramban Anda dan berikan izin sensor kepada peramban di ponsel Anda.",
  findMyLocation: "Temukan lokasi saya",
  setLocationManually: "Atur lokasi secara manual",
  save: "Simpan",
  pwaUpdateAvailable:
    "Konten baru tersedia, klik tombol muat ulang untuk memperbarui",
  reload: "Muat Ulang",
  close: "Tutup",
  installPwa: "Pasang Aplikasi",
  install: "Pasang",
  cancel: "Batal",
};

const fr: Messages = {
  appName: "Carte de la Qibla",
  appDescription:
    "Un outil simple qui indique la direction de la Qibla sur une carte.",
  locationAccessGranted: "Accès à la localisation accordé.",
  latitude: "Latitude",
  longitude: "Longitude",
  refresh: "Actualiser",
  geolocationDenied:
    "Votre navigateur ne peut pas accéder à la géolocalisation ou l'autorisation a été refusée.",
  enterManually:
    "Vous pouvez saisir les coordonnées manuellement pour ouvrir la carte.",
  openMap: "Ouvrir la carte",
  tryAgain: "Réessayer",
  permissionNeededLocation:
    "Cet appareil peut nécessiter une autorisation pour accéder à la localisation.",
  getLocation: "Obtenir la position",
  manualCoordsLabel: "Coordonnées manuelles (lat, lon)",
  paste: "Coller",
  pasteTitle: "Coller les coordonnées depuis le presse-papiers",
  pastePrompt: "Collez les coordonnées ici :",
  noClipboard: "Aucun texte dans le presse-papiers.",
  parseError: "Impossible de lire les coordonnées du presse-papiers.",
  checkingCapabilities: "Vérification des capacités de votre appareil",
  pleaseWait: "Veuillez patienter",
  noOrientation:
    "Votre navigateur ne peut pas accéder aux événements d'orientation de l'appareil.",
  compassUnavailable: "La fonction boussole ne sera pas disponible",
  openingMap: "Ouverture de la carte...",
  permissionNeededMotion:
    "Cet appareil peut nécessiter une autorisation pour accéder aux capteurs de mouvement pour la boussole.",
  allowMotion: "Autoriser l'accès au mouvement",
  compassLock: "Verrou de boussole",
  facingKaaba: "Vous faites face à la Kaaba",
  notFacingKaaba: "Vous ne faites pas face à la Kaaba",
  locationDenied:
    "L'autorisation de localisation a été refusée. Autorisez la localisation pour ce site dans les paramètres du navigateur, ou saisissez les coordonnées manuellement.",
  locationUnavailable:
    "Votre appareil n'a pas pu déterminer sa position. Vérifiez que la localisation est activée et que le navigateur est autorisé à l'utiliser.",
  locationTimeout:
    "L'obtention d'un point GPS a pris trop de temps. Réessayez en extérieur, ou saisissez les coordonnées manuellement.",
  locationInsecure:
    "L'accès à la localisation nécessite une connexion sécurisée (https).",
  searchingGps:
    "Recherche d'un signal GPS. En extérieur, cela peut prendre jusqu'à une minute.",
  invalidCoords:
    "La latitude doit être comprise entre -90 et 90, la longitude entre -180 et 180.",
  continueWithoutCompass: "Continuer sans boussole",
  compassBlockedHint:
    "Certains navigateurs bloquent les capteurs de mouvement par défaut. Vérifiez les paramètres du site dans votre navigateur et accordez-lui l'autorisation d'accès aux capteurs sur votre téléphone.",
  findMyLocation: "Trouver ma position",
  setLocationManually: "Définir la position manuellement",
  save: "Enregistrer",
  pwaUpdateAvailable:
    "Nouveau contenu disponible, cliquez sur le bouton recharger pour mettre à jour",
  reload: "Recharger",
  close: "Fermer",
  installPwa: "Installer l'application",
  install: "Installer",
  cancel: "Annuler",
};

const ur: Messages = {
  appName: "قبلہ نقشہ",
  appDescription: "ایک سادہ قبلہ نما جو نقشے پر قبلہ کی سمت دکھاتا ہے۔",
  locationAccessGranted: "مقام تک رسائی دے دی گئی۔",
  latitude: "عرض البلد",
  longitude: "طول البلد",
  refresh: "تازہ کریں",
  geolocationDenied:
    "آپ کا براؤزر مقام تک رسائی نہیں کر سکتا یا اجازت مسترد کر دی گئی۔",
  enterManually: "نقشہ کھولنے کے لیے آپ نقاط دستی طور پر درج کر سکتے ہیں۔",
  openMap: "نقشہ کھولیں",
  tryAgain: "دوبارہ کوشش کریں",
  permissionNeededLocation:
    "اس آلے کو مقام تک رسائی کے لیے اجازت درکار ہو سکتی ہے۔",
  getLocation: "مقام حاصل کریں",
  manualCoordsLabel: "دستی نقاط (عرض، طول)",
  paste: "چسپاں کریں",
  pasteTitle: "کلپ بورڈ سے نقاط چسپاں کریں",
  pastePrompt: "نقاط یہاں چسپاں کریں:",
  noClipboard: "کلپ بورڈ میں کوئی متن موجود نہیں۔",
  parseError: "کلپ بورڈ سے نقاط پڑھے نہیں جا سکے۔",
  checkingCapabilities: "آپ کے آلے کی صلاحیتوں کی جانچ ہو رہی ہے",
  pleaseWait: "براہ کرم انتظار کریں",
  noOrientation: "آپ کا براؤزر ڈیوائس اورینٹیشن ایونٹس تک رسائی نہیں کر سکتا۔",
  compassUnavailable: "قطب نما کی سہولت دستیاب نہیں ہوگی",
  openingMap: "نقشہ کھل رہا ہے...",
  permissionNeededMotion:
    "اس آلے کو قطب نما کے لیے موشن سینسرز تک رسائی کی اجازت درکار ہو سکتی ہے۔",
  allowMotion: "موشن تک رسائی کی اجازت دیں",
  compassLock: "قطب نما لاک",
  facingKaaba: "آپ کعبہ کی طرف رخ کیے ہوئے ہیں",
  notFacingKaaba: "آپ کعبہ کی طرف رخ نہیں کیے ہوئے",
  locationDenied:
    "مقام تک رسائی کی اجازت نہیں دی گئی۔ براؤزر کی ترتیبات میں اس سائٹ کے لیے اجازت دیں، یا نقاط دستی طور پر درج کریں۔",
  locationUnavailable:
    "آپ کا آلہ مقام کا تعین نہیں کر سکا۔ یقینی بنائیں کہ لوکیشن آن ہے اور براؤزر کو اس کے استعمال کی اجازت ہے۔",
  locationTimeout:
    "جی پی ایس سے مقام حاصل کرنے میں بہت زیادہ وقت لگا۔ کھلی جگہ پر دوبارہ کوشش کریں، یا نقاط دستی طور پر درج کریں۔",
  locationInsecure: "مقام تک رسائی کے لیے محفوظ (https) کنکشن ضروری ہے۔",
  searchingGps:
    "جی پی ایس سگنل تلاش کیا جا رہا ہے۔ کھلی جگہ پر اس میں ایک منٹ تک لگ سکتا ہے۔",
  invalidCoords:
    "عرض بلد 90- اور 90 کے درمیان اور طول بلد 180- اور 180 کے درمیان ہونا چاہیے۔",
  continueWithoutCompass: "قطب نما کے بغیر جاری رکھیں",
  compassBlockedHint:
    "کچھ براؤزر بطور ڈیفالٹ موشن سینسرز کو بلاک کر دیتے ہیں۔ اپنے براؤزر کی سائٹ ترتیبات دیکھیں اور فون پر براؤزر کو سینسرز کی اجازت دیں۔",
  findMyLocation: "میرا مقام تلاش کریں",
  setLocationManually: "مقام دستی طور پر مقرر کریں",
  save: "محفوظ کریں",
  pwaUpdateAvailable:
    "نیا مواد دستیاب ہے، اپ ڈیٹ کے لیے ری لوڈ بٹن پر کلک کریں",
  reload: "دوبارہ لوڈ کریں",
  close: "بند کریں",
  installPwa: "ایپ انسٹال کریں",
  install: "انسٹال کریں",
  cancel: "منسوخ کریں",
};

const hi: Messages = {
  appName: "क़िबला मानचित्र",
  appDescription: "एक सरल क़िबला खोजक जो मानचित्र पर क़िबला की दिशा दिखाता है।",
  locationAccessGranted: "स्थान तक पहुँच प्रदान की गई।",
  latitude: "अक्षांश",
  longitude: "देशांतर",
  refresh: "ताज़ा करें",
  geolocationDenied:
    "आपका ब्राउज़र स्थान तक नहीं पहुँच सकता या अनुमति अस्वीकृत कर दी गई।",
  enterManually:
    "मानचित्र खोलने के लिए आप निर्देशांक मैन्युअल रूप से दर्ज कर सकते हैं।",
  openMap: "मानचित्र खोलें",
  tryAgain: "पुनः प्रयास करें",
  permissionNeededLocation:
    "इस डिवाइस को स्थान तक पहुँचने के लिए अनुमति की आवश्यकता हो सकती है।",
  getLocation: "स्थान प्राप्त करें",
  manualCoordsLabel: "मैन्युअल निर्देशांक (अक्षांश, देशांतर)",
  paste: "चिपकाएँ",
  pasteTitle: "क्लिपबोर्ड से निर्देशांक चिपकाएँ",
  pastePrompt: "निर्देशांक यहाँ चिपकाएँ:",
  noClipboard: "क्लिपबोर्ड में कोई पाठ नहीं है।",
  parseError: "क्लिपबोर्ड से निर्देशांक पढ़े नहीं जा सके।",
  checkingCapabilities: "आपके डिवाइस की क्षमताओं की जाँच हो रही है",
  pleaseWait: "कृपया प्रतीक्षा करें",
  noOrientation: "आपका ब्राउज़र डिवाइस ओरिएंटेशन इवेंट्स तक नहीं पहुँच सकता।",
  compassUnavailable: "कम्पास कार्यक्षमता उपलब्ध नहीं होगी",
  openingMap: "मानचित्र खुल रहा है...",
  permissionNeededMotion:
    "इस डिवाइस को कम्पास कार्यक्षमता के लिए मोशन सेंसर तक पहुँचने की अनुमति की आवश्यकता हो सकती है।",
  allowMotion: "मोशन एक्सेस की अनुमति दें",
  compassLock: "कम्पास लॉक",
  facingKaaba: "आप काबा की ओर मुख किए हुए हैं",
  notFacingKaaba: "आप काबा की ओर मुख नहीं किए हुए हैं",
  locationDenied:
    "स्थान की अनुमति अस्वीकार कर दी गई। ब्राउज़र सेटिंग्स में इस साइट के लिए स्थान की अनुमति दें, या निर्देशांक मैन्युअल रूप से दर्ज करें।",
  locationUnavailable:
    "आपका डिवाइस स्थान निर्धारित नहीं कर सका। जाँचें कि स्थान चालू है और ब्राउज़र को इसका उपयोग करने की अनुमति है।",
  locationTimeout:
    "GPS से स्थान प्राप्त करने में बहुत समय लगा। खुली जगह में फिर से प्रयास करें, या निर्देशांक मैन्युअल रूप से दर्ज करें।",
  locationInsecure: "स्थान तक पहुँच के लिए सुरक्षित (https) कनेक्शन आवश्यक है।",
  searchingGps:
    "GPS सिग्नल खोजा जा रहा है। खुली जगह में इसमें एक मिनट तक लग सकता है।",
  invalidCoords:
    "अक्षांश -90 और 90 के बीच तथा देशांतर -180 और 180 के बीच होना चाहिए।",
  continueWithoutCompass: "कम्पास के बिना जारी रखें",
  compassBlockedHint:
    "कुछ ब्राउज़र डिफ़ॉल्ट रूप से मोशन सेंसर ब्लॉक करते हैं। अपने ब्राउज़र की साइट सेटिंग्स देखें और फ़ोन पर ब्राउज़र को सेंसर की अनुमति दें।",
  findMyLocation: "मेरा स्थान खोजें",
  setLocationManually: "स्थान मैन्युअल रूप से सेट करें",
  save: "सहेजें",
  pwaUpdateAvailable:
    "नई सामग्री उपलब्ध है, अपडेट करने के लिए रीलोड बटन पर क्लिक करें",
  reload: "पुनः लोड करें",
  close: "बंद करें",
  installPwa: "ऐप इंस्टॉल करें",
  install: "इंस्टॉल करें",
  cancel: "रद्द करें",
};

const de: Messages = {
  appName: "Qibla-Karte",
  appDescription:
    "Ein einfacher Qibla-Finder, der die Gebetsrichtung auf einer Karte zeigt.",
  locationAccessGranted: "Standortzugriff gewährt.",
  latitude: "Breitengrad",
  longitude: "Längengrad",
  refresh: "Aktualisieren",
  geolocationDenied:
    "Ihr Browser kann nicht auf die Standortbestimmung zugreifen oder die Berechtigung wurde verweigert.",
  enterManually:
    "Sie können die Koordinaten manuell eingeben, um die Karte zu öffnen.",
  openMap: "Karte öffnen",
  tryAgain: "Erneut versuchen",
  permissionNeededLocation:
    "Dieses Gerät benötigt möglicherweise eine Berechtigung für den Standortzugriff.",
  getLocation: "Standort abrufen",
  manualCoordsLabel: "Manuelle Koordinaten (Breite, Länge)",
  paste: "Einfügen",
  pasteTitle: "Koordinaten aus der Zwischenablage einfügen",
  pastePrompt: "Koordinaten hier einfügen:",
  noClipboard: "Kein Text in der Zwischenablage.",
  parseError:
    "Koordinaten konnten nicht aus der Zwischenablage gelesen werden.",
  checkingCapabilities: "Gerätefunktionen werden überprüft",
  pleaseWait: "Bitte warten",
  noOrientation:
    "Ihr Browser kann nicht auf Geräteausrichtungsereignisse zugreifen.",
  compassUnavailable: "Kompassfunktion ist nicht verfügbar",
  openingMap: "Karte wird geöffnet...",
  permissionNeededMotion:
    "Dieses Gerät benötigt möglicherweise eine Berechtigung für den Zugriff auf Bewegungssensoren für die Kompassfunktion.",
  allowMotion: "Bewegungszugriff erlauben",
  compassLock: "Kompasssperre",
  facingKaaba: "Sie sind zur Kaaba ausgerichtet",
  notFacingKaaba: "Sie sind nicht zur Kaaba ausgerichtet",
  locationDenied:
    "Die Standortberechtigung wurde verweigert. Erlauben Sie den Standort für diese Seite in den Browsereinstellungen, oder geben Sie die Koordinaten manuell ein.",
  locationUnavailable:
    "Ihr Gerät konnte keine Position bestimmen. Prüfen Sie, ob die Ortung eingeschaltet ist und der Browser sie verwenden darf.",
  locationTimeout:
    "Die GPS-Ortung hat zu lange gedauert. Versuchen Sie es im Freien erneut, oder geben Sie die Koordinaten manuell ein.",
  locationInsecure:
    "Der Standortzugriff erfordert eine sichere (https) Verbindung.",
  searchingGps:
    "GPS-Signal wird gesucht. Im Freien kann das bis zu einer Minute dauern.",
  invalidCoords:
    "Der Breitengrad muss zwischen -90 und 90 liegen, der Längengrad zwischen -180 und 180.",
  continueWithoutCompass: "Ohne Kompass fortfahren",
  compassBlockedHint:
    "Manche Browser blockieren Bewegungssensoren standardmäßig. Prüfen Sie die Seiteneinstellungen Ihres Browsers und erteilen Sie dem Browser auf dem Telefon die Sensorberechtigung.",
  findMyLocation: "Meinen Standort finden",
  setLocationManually: "Standort manuell festlegen",
  save: "Speichern",
  pwaUpdateAvailable:
    "Neuer Inhalt verfügbar, klicken Sie zum Aktualisieren auf die Schaltfläche Neu laden",
  reload: "Neu laden",
  close: "Schließen",
  installPwa: "App installieren",
  install: "Installieren",
  cancel: "Abbrechen",
};

const bs: Messages = {
  appName: "Karta kible",
  appDescription:
    "Jednostavan pronalazač kible koji prikazuje smjer kible na karti.",
  locationAccessGranted: "Pristup lokaciji odobren.",
  latitude: "Geografska širina",
  longitude: "Geografska dužina",
  refresh: "Osvježi",
  geolocationDenied:
    "Vaš preglednik ne može pristupiti lokaciji ili je dozvola odbijena.",
  enterManually: "Možete ručno unijeti koordinate da otvorite mapu.",
  openMap: "Otvori mapu",
  tryAgain: "Pokušaj ponovo",
  permissionNeededLocation:
    "Ovaj uređaj možda zahtijeva dozvolu za pristup lokaciji.",
  getLocation: "Dohvati lokaciju",
  manualCoordsLabel: "Ručne koordinate (širina, dužina)",
  paste: "Zalijepi",
  pasteTitle: "Zalijepi koordinate iz međuspremnika",
  pastePrompt: "Zalijepite koordinate ovdje:",
  noClipboard: "Nema teksta u međuspremniku.",
  parseError: "Nije moguće pročitati koordinate iz međuspremnika.",
  checkingCapabilities: "Provjeravanje mogućnosti vašeg uređaja",
  pleaseWait: "Molimo pričekajte",
  noOrientation:
    "Vaš preglednik ne može pristupiti događajima orijentacije uređaja.",
  compassUnavailable: "Funkcija kompasa neće biti dostupna",
  openingMap: "Otvaranje mape...",
  permissionNeededMotion:
    "Ovaj uređaj možda zahtijeva dozvolu za pristup senzorima pokreta za funkciju kompasa.",
  allowMotion: "Dozvoli pristup pokretu",
  compassLock: "Zaključavanje kompasa",
  facingKaaba: "Okrenuti ste prema Kabi",
  notFacingKaaba: "Niste okrenuti prema Kabi",
  locationDenied:
    "Pristup lokaciji je odbijen. Dozvolite lokaciju za ovu stranicu u postavkama preglednika, ili unesite koordinate ručno.",
  locationUnavailable:
    "Vaš uređaj nije mogao odrediti poziciju. Provjerite je li lokacija uključena i ima li preglednik dozvolu da je koristi.",
  locationTimeout:
    "Dobivanje GPS pozicije trajalo je predugo. Pokušajte ponovo na otvorenom, ili unesite koordinate ručno.",
  locationInsecure: "Pristup lokaciji zahtijeva sigurnu (https) vezu.",
  searchingGps:
    "Traženje GPS signala. Na otvorenom to može potrajati do jedne minute.",
  invalidCoords:
    "Geografska širina mora biti između -90 i 90, a dužina između -180 i 180.",
  continueWithoutCompass: "Nastavi bez kompasa",
  compassBlockedHint:
    "Neki preglednici podrazumijevano blokiraju senzore pokreta. Provjerite postavke stranice u pregledniku i dajte pregledniku dozvolu za senzore na telefonu.",
  findMyLocation: "Pronađi moju lokaciju",
  setLocationManually: "Ručno postavi lokaciju",
  save: "Sačuvaj",
  pwaUpdateAvailable:
    "Novi sadržaj je dostupan, kliknite na dugme za ponovno učitavanje da ažurirate",
  reload: "Ponovo učitaj",
  close: "Zatvori",
  installPwa: "Instaliraj aplikaciju",
  install: "Instaliraj",
  cancel: "Otkaži",
};

const vi: Messages = {
  appName: "Bản đồ Qibla",
  appDescription: "Công cụ đơn giản hiển thị hướng Qibla trên bản đồ.",
  locationAccessGranted: "Đã cấp quyền truy cập vị trí.",
  latitude: "Vĩ độ",
  longitude: "Kinh độ",
  refresh: "Làm mới",
  geolocationDenied:
    "Trình duyệt của bạn không thể truy cập Định vị hoặc quyền đã bị từ chối.",
  enterManually: "Bạn có thể nhập tọa độ thủ công để mở bản đồ.",
  openMap: "Mở bản đồ",
  tryAgain: "Thử lại",
  permissionNeededLocation:
    "Thiết bị này có thể yêu cầu quyền để truy cập vị trí.",
  getLocation: "Lấy vị trí",
  manualCoordsLabel: "Tọa độ thủ công (vĩ độ, kinh độ)",
  paste: "Dán",
  pasteTitle: "Dán tọa độ từ bảng tạm",
  pastePrompt: "Dán tọa độ vào đây:",
  noClipboard: "Không có văn bản trong bảng tạm.",
  parseError: "Không thể đọc tọa độ từ bảng tạm.",
  checkingCapabilities: "Đang kiểm tra khả năng của thiết bị",
  pleaseWait: "Vui lòng đợi",
  noOrientation:
    "Trình duyệt của bạn không thể truy cập các sự kiện Định hướng thiết bị.",
  compassUnavailable: "Chức năng la bàn sẽ không khả dụng",
  openingMap: "Đang mở bản đồ...",
  permissionNeededMotion:
    "Thiết bị này có thể yêu cầu quyền truy cập cảm biến chuyển động cho chức năng la bàn.",
  allowMotion: "Cho phép truy cập chuyển động",
  compassLock: "Khóa la bàn",
  facingKaaba: "Bạn đang hướng về Kaaba",
  notFacingKaaba: "Bạn không hướng về Kaaba",
  locationDenied:
    "Quyền truy cập vị trí đã bị từ chối. Hãy cho phép vị trí cho trang này trong cài đặt trình duyệt, hoặc nhập tọa độ thủ công.",
  locationUnavailable:
    "Thiết bị của bạn không xác định được vị trí. Hãy kiểm tra dịch vụ vị trí đã bật và trình duyệt được phép sử dụng.",
  locationTimeout:
    "Việc lấy tín hiệu GPS mất quá nhiều thời gian. Hãy thử lại ngoài trời, hoặc nhập tọa độ thủ công.",
  locationInsecure: "Truy cập vị trí yêu cầu kết nối an toàn (https).",
  searchingGps:
    "Đang tìm tín hiệu GPS. Ở ngoài trời việc này có thể mất tới một phút.",
  invalidCoords:
    "Vĩ độ phải nằm trong khoảng -90 đến 90, kinh độ từ -180 đến 180.",
  continueWithoutCompass: "Tiếp tục mà không dùng la bàn",
  compassBlockedHint:
    "Một số trình duyệt chặn cảm biến chuyển động theo mặc định. Hãy kiểm tra cài đặt trang trong trình duyệt và cấp quyền cảm biến cho trình duyệt trên điện thoại.",
  findMyLocation: "Tìm vị trí của tôi",
  setLocationManually: "Đặt vị trí thủ công",
  save: "Lưu",
  pwaUpdateAvailable: "Đã có nội dung mới, nhấp vào nút tải lại để cập nhật",
  reload: "Tải lại",
  close: "Đóng",
  installPwa: "Cài đặt ứng dụng",
  install: "Cài đặt",
  cancel: "Hủy",
};

const bn: Messages = {
  appName: "কিবলা মানচিত্র",
  appDescription: "একটি সহজ কিবলা নির্ণায়ক যা মানচিত্রে কিবলার দিক দেখায়।",
  locationAccessGranted: "অবস্থানে প্রবেশাধিকার দেওয়া হয়েছে।",
  latitude: "অক্ষাংশ",
  longitude: "দ্রাঘিমাংশ",
  refresh: "রিফ্রেশ",
  geolocationDenied:
    "আপনার ব্রাউজার অবস্থান অ্যাক্সেস করতে পারছে না বা অনুমতি প্রত্যাখ্যান করা হয়েছে।",
  enterManually: "মানচিত্র খুলতে আপনি স্বহস্তে স্থানাঙ্ক প্রবেশ করাতে পারেন।",
  openMap: "মানচিত্র খুলুন",
  tryAgain: "আবার চেষ্টা করুন",
  permissionNeededLocation:
    "এই ডিভাইসটির অবস্থান অ্যাক্সেস করতে অনুমতির প্রয়োজন হতে পারে।",
  getLocation: "অবস্থান নিন",
  manualCoordsLabel: "স্বহস্ত স্থানাঙ্ক (অক্ষাংশ, দ্রাঘিমাংশ)",
  paste: "পেস্ট করুন",
  pasteTitle: "ক্লিপবোর্ড থেকে স্থানাঙ্ক পেস্ট করুন",
  pastePrompt: "এখানে স্থানাঙ্ক পেস্ট করুন:",
  noClipboard: "ক্লিপবোর্ডে কোনো লেখা নেই।",
  parseError: "ক্লিপবোর্ড থেকে স্থানাঙ্ক পড়া যায়নি।",
  checkingCapabilities: "আপনার ডিভাইসের সক্ষমতা যাচাই করা হচ্ছে",
  pleaseWait: "অনুগ্রহ করে অপেক্ষা করুন",
  noOrientation:
    "আপনার ব্রাউজার ডিভাইস ওরিয়েন্টেশন ইভেন্ট অ্যাক্সেস করতে পারছে না।",
  compassUnavailable: "কম্পাস সুবিধা উপলব্ধ থাকবে না",
  openingMap: "মানচিত্র খোলা হচ্ছে...",
  permissionNeededMotion:
    "এই ডিভাইসটির কম্পাসের জন্য মোশন সেন্সর অ্যাক্সেস করতে অনুমতির প্রয়োজন হতে পারে।",
  allowMotion: "মোশন অ্যাক্সেসের অনুমতি দিন",
  compassLock: "কম্পাস লক",
  facingKaaba: "আপনি কাবার দিকে মুখ করে আছেন",
  notFacingKaaba: "আপনি কাবার দিকে মুখ করে নেই",
  locationDenied:
    "অবস্থানের অনুমতি প্রত্যাখ্যান করা হয়েছে। ব্রাউজার সেটিংসে এই সাইটের জন্য অবস্থানের অনুমতি দিন, অথবা স্থানাঙ্ক নিজে লিখুন।",
  locationUnavailable:
    "আপনার ডিভাইস অবস্থান নির্ণয় করতে পারেনি। দেখুন অবস্থান চালু আছে কি না এবং ব্রাউজারের অনুমতি আছে কি না।",
  locationTimeout:
    "জিপিএস থেকে অবস্থান পেতে অনেক সময় লেগেছে। খোলা জায়গায় আবার চেষ্টা করুন, অথবা স্থানাঙ্ক নিজে লিখুন।",
  locationInsecure: "অবস্থান ব্যবহারের জন্য নিরাপদ (https) সংযোগ প্রয়োজন।",
  searchingGps:
    "জিপিএস সংকেত খোঁজা হচ্ছে। খোলা জায়গায় এতে এক মিনিট পর্যন্ত লাগতে পারে।",
  invalidCoords:
    "অক্ষাংশ -90 থেকে 90 এবং দ্রাঘিমাংশ -180 থেকে 180 এর মধ্যে হতে হবে।",
  continueWithoutCompass: "কম্পাস ছাড়াই চালিয়ে যান",
  compassBlockedHint:
    "কিছু ব্রাউজার ডিফল্টভাবে মোশন সেন্সর বন্ধ রাখে। ব্রাউজারের সাইট সেটিংস দেখুন এবং ফোনে ব্রাউজারকে সেন্সরের অনুমতি দিন।",
  findMyLocation: "আমার অবস্থান খুঁজুন",
  setLocationManually: "অবস্থান নিজে নির্ধারণ করুন",
  save: "সংরক্ষণ করুন",
  pwaUpdateAvailable:
    "নতুন কন্টেন্ট উপলব্ধ, আপডেট করতে রিলোড বোতামে ক্লিক করুন",
  reload: "রিলোড",
  close: "বন্ধ করুন",
  installPwa: "অ্যাপ ইনস্টল করুন",
  install: "ইনস্টল করুন",
  cancel: "বাতিল",
};

const sw: Messages = {
  appName: "Ramani ya Kibla",
  appDescription:
    "Kitafuta kibla rahisi kinachoonyesha mwelekeo wa kibla kwenye ramani.",
  locationAccessGranted: "Ufikiaji wa eneo umeruhusiwa.",
  latitude: "Latitudo",
  longitude: "Longitudo",
  refresh: "Onyesha upya",
  geolocationDenied:
    "Kivinjari chako hakiwezi kufikia eneo au ruhusa ilikataliwa.",
  enterManually: "Unaweza kuingiza viwianishi kwa mkono ili kufungua ramani.",
  openMap: "Fungua Ramani",
  tryAgain: "Jaribu Tena",
  permissionNeededLocation:
    "Kifaa hiki kinaweza kuhitaji ruhusa ya kufikia eneo.",
  getLocation: "Pata Eneo",
  manualCoordsLabel: "Viwianishi vya mkono (latitudo, longitudo)",
  paste: "Bandika",
  pasteTitle: "Bandika viwianishi kutoka kwa ubao wa kunakili",
  pastePrompt: "Bandika viwianishi hapa:",
  noClipboard: "Hakuna maandishi kwenye ubao wa kunakili.",
  parseError: "Imeshindwa kusoma viwianishi kutoka kwa ubao wa kunakili.",
  checkingCapabilities: "Inakagua uwezo wa kifaa chako",
  pleaseWait: "Tafadhali subiri",
  noOrientation:
    "Kivinjari chako hakiwezi kufikia matukio ya Mwelekeo wa Kifaa.",
  compassUnavailable: "Kipengele cha dira hakitapatikana",
  openingMap: "Inafungua ramani...",
  permissionNeededMotion:
    "Kifaa hiki kinaweza kuhitaji ruhusa ya kufikia vitambuzi vya mwendo kwa kipengele cha dira.",
  allowMotion: "Ruhusu Ufikiaji wa Mwendo",
  compassLock: "Kufuli ya Dira",
  facingKaaba: "Unaelekea Kaaba",
  notFacingKaaba: "Huelekei Kaaba",
  locationDenied:
    "Ruhusa ya mahali imekataliwa. Ruhusu mahali kwa tovuti hii katika mipangilio ya kivinjari, au weka viwianishi mwenyewe.",
  locationUnavailable:
    "Kifaa chako hakikuweza kubaini mahali. Hakikisha huduma ya mahali imewashwa na kivinjari kimeruhusiwa kuitumia.",
  locationTimeout:
    "Kupata mahali kwa GPS kumechukua muda mrefu mno. Jaribu tena ukiwa nje, au weka viwianishi mwenyewe.",
  locationInsecure: "Kufikia mahali kunahitaji muunganisho salama (https).",
  searchingGps:
    "Inatafuta ishara ya GPS. Ukiwa nje hii inaweza kuchukua hadi dakika moja.",
  invalidCoords:
    "Latitudo lazima iwe kati ya -90 na 90, longitudo kati ya -180 na 180.",
  continueWithoutCompass: "Endelea bila dira",
  compassBlockedHint:
    "Baadhi ya vivinjari huzuia vitambuzi vya mwendo kwa chaguo-msingi. Angalia mipangilio ya tovuti katika kivinjari chako na kipe kivinjari ruhusa ya vitambuzi kwenye simu yako.",
  findMyLocation: "Tafuta mahali nilipo",
  setLocationManually: "Weka mahali mwenyewe",
  save: "Hifadhi",
  pwaUpdateAvailable:
    "Maudhui mapya yanapatikana, bofya kitufe cha kupakia upya ili kusasisha",
  reload: "Pakia upya",
  close: "Funga",
  installPwa: "Sakinisha Programu",
  install: "Sakinisha",
  cancel: "Ghairi",
};

export const messages: Record<Locale, Messages> = {
  en,
  fa,
  ar,
  tr,
  id,
  fr,
  ur,
  hi,
  de,
  bs,
  vi,
  bn,
  sw,
};
