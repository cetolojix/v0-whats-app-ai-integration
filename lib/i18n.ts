export interface Language {
  code: string
  name: string
  flag: string
}

export const languages: Language[] = [
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
]

export interface Translations {
  // Header
  appTitle: string
  appSubtitle: string
  aiReady: string
  instances: string

  // Main sections
  connectedBots: string
  addBot: string
  connected: string
  setupBot: string
  scanQrCode: string
  botActivated: string

  // Features
  whatsappIntegration: string
  whatsappIntegrationDesc: string
  aiResponses: string
  aiResponsesDesc: string
  automatedWorkflows: string
  automatedWorkflowsDesc: string

  // Tabs
  dashboard: string
  automations: string
  aiSettings: string
  testChat: string
  health: string
  settings: string

  // Instance management
  instanceSettings: string
  instanceSettingsDesc: string
  instanceName: string
  status: string
  addNewBot: string
  deleteBot: string
  reconnectBot: string

  // API Configuration
  apiConfiguration: string
  apiConfigurationDesc: string
  messagingService: string
  automationPlatform: string
  webhookUrl: string

  // Common
  loading: string
  error: string
  success: string
  cancel: string
  save: string
  delete: string
  edit: string
  create: string
  back: string
  next: string

  // QR Code
  qrCodeTitle: string
  qrCodeDesc: string
  scanWithPhone: string
  waitingConnection: string

  // Errors
  connectionError: string
  setupError: string
  generalError: string

  // Admin Dashboard
  adminDashboard: string
  adminDashboardDesc: string
  totalUsers: string
  totalInstances: string
  activeConnections: string
  newUsers: string
  userManagement: string
  instanceManagement: string
  activityHistory: string
  userManagementDesc: string
  instanceManagementDesc: string
  createNewUser: string
  editUser: string
  suspendUser: string
  forceLogout: string
  forceDisconnect: string
  adminActions: string
  lastWeek: string
  connectedInstances: string
  adminUser: string
  regularUser: string
  suspendedUser: string
  instanceOwner: string
  instanceCount: string
  registrationDate: string
  actions: string
  workflowName: string
  createdAt: string
  confirmDelete: string
  confirmSuspend: string
  confirmForceLogout: string
  confirmForceDisconnect: string
  userSuspended: string
  userLoggedOut: string
  instanceDisconnected: string
  searchPlaceholder: string
  email: string
  fullName: string
  password: string
  role: string
  optional: string
  strongPassword: string
  userCreated: string
  userUpdated: string
  welcome: string
  logout: string
}

export const translations: Record<string, Translations> = {
  tr: {
    // Header
    appTitle: "WhatsApp Bot Yöneticisi",
    appSubtitle: "Akıllı Mesajlaşma Platformu",
    aiReady: "AI Hazır",
    instances: "Bot",

    // Main sections
    connectedBots: "Bağlı Botlar",
    addBot: "Bot Ekle",
    connected: "bağlı",
    setupBot: "Bot Kurulumu",
    scanQrCode: "QR Kod Tarama",
    botActivated: "Bot Aktif",

    // Features
    whatsappIntegration: "WhatsApp Entegrasyonu",
    whatsappIntegrationDesc: "WhatsApp Business hesabınızı sorunsuz mesajlaşma otomasyonu için bağlayın.",
    aiResponses: "AI Destekli Yanıtlar",
    aiResponsesDesc: "Müşteri sorularını otomatik olarak yanıtlamak için gelişmiş AI teknolojisi.",
    automatedWorkflows: "Akıllı Otomasyonlar",
    automatedWorkflowsDesc: "Karmaşık iş mantığı ve entegrasyonlar için akıllı otomasyon sistemi.",

    // Tabs
    dashboard: "Kontrol Paneli",
    automations: "Otomasyonlar",
    aiSettings: "AI Ayarları",
    testChat: "Test Sohbeti",
    health: "Sistem Durumu",
    settings: "Ayarlar",

    // Instance management
    instanceSettings: "Bot Ayarları",
    instanceSettingsDesc: "WhatsApp bot yapılandırmanızı yönetin",
    instanceName: "Bot Adı",
    status: "Durum",
    addNewBot: "Yeni Bot Ekle",
    deleteBot: "Bot Sil",
    reconnectBot: "Yeniden Bağlan",

    // API Configuration
    apiConfiguration: "Sistem Yapılandırması",
    apiConfigurationDesc: "Mesajlaşma servisi ve otomasyon platformu bağlantı detayları",
    messagingService: "Mesajlaşma Servisi",
    automationPlatform: "Otomasyon Platformu",
    webhookUrl: "Mesaj Alıcı URL",

    // Common
    loading: "Yükleniyor...",
    error: "Hata",
    success: "Başarılı",
    cancel: "İptal",
    save: "Kaydet",
    delete: "Sil",
    edit: "Düzenle",
    create: "Oluştur",
    back: "Geri",
    next: "İleri",

    // QR Code
    qrCodeTitle: "WhatsApp'ı Bağlayın",
    qrCodeDesc: "Telefonunuzla QR kodu tarayarak WhatsApp hesabınızı bağlayın",
    scanWithPhone: "Telefonunuzla tarayın",
    waitingConnection: "Bağlantı bekleniyor...",

    // Errors
    connectionError: "Bağlantı hatası oluştu",
    setupError: "Kurulum sırasında hata oluştu",
    generalError: "Bir hata oluştu",

    // Admin Dashboard
    adminDashboard: "Admin Paneli",
    adminDashboardDesc: "Kullanıcıları ve WhatsApp instance'larını yönetin",
    totalUsers: "Toplam Kullanıcı",
    totalInstances: "Toplam Instance",
    activeConnections: "Aktif Bağlantılar",
    newUsers: "Yeni Kullanıcılar",
    userManagement: "Kullanıcı Yönetimi",
    instanceManagement: "Instance Yönetimi",
    activityHistory: "İşlem Geçmişi",
    userManagementDesc: "Kullanıcı hesaplarını ve izinlerini yönetin",
    instanceManagementDesc: "Tüm WhatsApp bot instance'larını izleyin ve yönetin",
    createNewUser: "Yeni Kullanıcı",
    editUser: "Kullanıcı Düzenle",
    suspendUser: "Kullanıcıyı Askıya Al",
    forceLogout: "Oturumları Sonlandır",
    forceDisconnect: "Bağlantıyı Kes",
    adminActions: "Admin İşlemleri",
    lastWeek: "Son 7 günde",
    connectedInstances: "Bağlı WhatsApp instance'ları",
    adminUser: "Admin",
    regularUser: "Kullanıcı",
    suspendedUser: "Askıya Alınmış",
    instanceOwner: "Sahip",
    instanceCount: "Instance Sayısı",
    registrationDate: "Kayıt Tarihi",
    actions: "İşlemler",
    workflowName: "Workflow",
    createdAt: "Oluşturulma",
    confirmDelete: "Bu işlem geri alınamaz. Silmek istediğinizden emin misiniz?",
    confirmSuspend: "kullanıcısını askıya almak istediğinizden emin misiniz?",
    confirmForceLogout: "kullanıcısının tüm oturumlarını sonlandırmak istediğinizden emin misiniz?",
    confirmForceDisconnect: "instance'ını zorla bağlantısını kesmek istediğinizden emin misiniz?",
    userSuspended: "Kullanıcı başarıyla askıya alındı!",
    userLoggedOut: "Kullanıcının tüm oturumları başarıyla sonlandırıldı!",
    instanceDisconnected: "Instance bağlantısı başarıyla kesildi!",
    searchPlaceholder: "Kullanıcı veya instance ara...",
    email: "Email",
    fullName: "Ad Soyad",
    password: "Şifre",
    role: "Rol",
    optional: "İsteğe bağlı",
    strongPassword: "Güçlü bir şifre",
    userCreated: "Yeni kullanıcı başarıyla oluşturuldu!",
    userUpdated: "Kullanıcı başarıyla güncellendi!",
    welcome: "Hoşgeldiniz",
    logout: "Çıkış Yap",
  },

  en: {
    // Header
    appTitle: "WhatsApp Bot Manager",
    appSubtitle: "Smart Messaging Platform",
    aiReady: "AI Ready",
    instances: "Bot",

    // Main sections
    connectedBots: "Connected Bots",
    addBot: "Add Bot",
    connected: "connected",
    setupBot: "Bot Setup",
    scanQrCode: "QR Code Scan",
    botActivated: "Bot Activated",

    // Features
    whatsappIntegration: "WhatsApp Integration",
    whatsappIntegrationDesc: "Connect your WhatsApp Business account for seamless messaging automation.",
    aiResponses: "AI-Powered Responses",
    aiResponsesDesc: "Intelligent chatbot responses powered by advanced AI to handle customer inquiries automatically.",
    automatedWorkflows: "Smart Automations",
    automatedWorkflowsDesc: "Intelligent automation system for complex business logic and integrations.",

    // Tabs
    dashboard: "Dashboard",
    automations: "Automations",
    aiSettings: "AI Settings",
    testChat: "Test Chat",
    health: "Health",
    settings: "Settings",

    // Instance management
    instanceSettings: "Bot Settings",
    instanceSettingsDesc: "Manage your WhatsApp bot configuration",
    instanceName: "Bot Name",
    status: "Status",
    addNewBot: "Add New Bot",
    deleteBot: "Delete Bot",
    reconnectBot: "Reconnect",

    // API Configuration
    apiConfiguration: "System Configuration",
    apiConfigurationDesc: "Messaging service and automation platform connection details",
    messagingService: "Messaging Service",
    automationPlatform: "Automation Platform",
    webhookUrl: "Message Receiver URL",

    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    back: "Back",
    next: "Next",

    // QR Code
    qrCodeTitle: "Connect WhatsApp",
    qrCodeDesc: "Scan the QR code with your phone to connect your WhatsApp account",
    scanWithPhone: "Scan with your phone",
    waitingConnection: "Waiting for connection...",

    // Errors
    connectionError: "Connection error occurred",
    setupError: "Error occurred during setup",
    generalError: "An error occurred",

    // Admin Dashboard
    adminDashboard: "Admin Dashboard",
    adminDashboardDesc: "Manage users and WhatsApp instances",
    totalUsers: "Total Users",
    totalInstances: "Total Instances",
    activeConnections: "Active Connections",
    newUsers: "New Users",
    userManagement: "User Management",
    instanceManagement: "Instance Management",
    activityHistory: "Activity History",
    userManagementDesc: "Manage user accounts and permissions",
    instanceManagementDesc: "Monitor and manage all WhatsApp bot instances",
    createNewUser: "New User",
    editUser: "Edit User",
    suspendUser: "Suspend User",
    forceLogout: "Force Logout",
    forceDisconnect: "Force Disconnect",
    adminActions: "Admin Actions",
    lastWeek: "Last 7 days",
    connectedInstances: "Connected WhatsApp instances",
    adminUser: "Admin",
    regularUser: "User",
    suspendedUser: "Suspended",
    instanceOwner: "Owner",
    instanceCount: "Instance Count",
    registrationDate: "Registration Date",
    actions: "Actions",
    workflowName: "Workflow",
    createdAt: "Created",
    confirmDelete: "This action cannot be undone. Are you sure you want to delete?",
    confirmSuspend: "Are you sure you want to suspend this user?",
    confirmForceLogout: "Are you sure you want to force logout all sessions for this user?",
    confirmForceDisconnect: "Are you sure you want to force disconnect this instance?",
    userSuspended: "User successfully suspended!",
    userLoggedOut: "All user sessions successfully terminated!",
    instanceDisconnected: "Instance connection successfully terminated!",
    searchPlaceholder: "Search users or instances...",
    email: "Email",
    fullName: "Full Name",
    password: "Password",
    role: "Role",
    optional: "Optional",
    strongPassword: "Strong password",
    userCreated: "New user successfully created!",
    userUpdated: "User successfully updated!",
    welcome: "Welcome",
    logout: "Logout",
  },
}

export function getTranslation(lang = "tr"): Translations {
  return translations[lang] || translations.tr
}
