// Translations library for AVEROX CRM

export type Language = 'english' | 'arabic' | 'spanish' | 'french' | 'german' | 'chinese';

// Translation keys by section
interface NavigationTranslations {
  dashboard: string;
  contacts: string;
  accounts: string;
  leads: string;
  opportunities: string;
  calendar: string;
  tasks: string;
  reports: string;
  settings: string;
  intelligence: string;
  workflows: string;
  subscriptions: string;
  admin: string;
  communicationCenter: string;
  accounting: string;
  inventory: string;
}

interface DashboardTranslations {
  greeting: string;
  newLeads: string;
  conversionRate: string;
  revenueGenerated: string;
  openDeals: string;
  upcomingTasks: string;
  recentActivities: string;
  salesPipeline: string;
  overview: string;
  view: string;
  today: string;
  week: string;
  month: string;
  noActivities: string;
  welcomeBack: string;
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
}

interface ButtonsTranslations {
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  create: string;
  view: string;
  add: string;
  search: string;
  filter: string;
  export: string;
  import: string;
  send: string;
  more: string;
}

interface SettingsTranslations {
  regional: string;
  language: string;
  timezone: string;
  dateFormat: string;
  rtlLayout: string;
  rtlLayoutDescription: string;
  notifications: string;
  emailNotifications: string;
  emailNotificationsDescription: string;
  smsNotifications: string;
  smsNotificationsDescription: string;
  desktopNotifications: string;
  desktopNotificationsDescription: string;
  security: string;
  twoFactorAuth: string;
  twoFactorAuthDescription: string;
  dataExport: string;
  dataExportDescription: string;
  activityLogging: string;
  activityLoggingDescription: string;
  profile: string;
  system: string;
  apiKeys: string;
  teams: string;
  dataMigration: string;
}

interface GeneralTranslations {
  loading: string;
  error: string;
  success: string;
  noData: string;
  welcome: string;
  logout: string;
  login: string;
  register: string;
  search: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  actions: string;
  description: string;
  noResults: string;
}

// Main translations interface
export interface Translations {
  navigation: NavigationTranslations;
  dashboard: DashboardTranslations;
  buttons: ButtonsTranslations;
  settings: SettingsTranslations;
  general: GeneralTranslations;
}

// English translations (default)
const englishTranslations: Translations = {
  navigation: {
    dashboard: 'Dashboard',
    contacts: 'Contacts',
    accounts: 'Accounts',
    leads: 'Leads',
    opportunities: 'Opportunities',
    calendar: 'Calendar',
    tasks: 'Tasks',
    reports: 'Reports',
    settings: 'Settings',
    intelligence: 'Intelligence',
    workflows: 'Workflows',
    subscriptions: 'Subscriptions',
    admin: 'Admin',
    communicationCenter: 'Communication Center',
    accounting: 'Accounting',
    inventory: 'Inventory',
  },
  dashboard: {
    greeting: 'Hello',
    newLeads: 'New Leads',
    conversionRate: 'Conversion Rate',
    revenueGenerated: 'Revenue Generated',
    openDeals: 'Open Deals',
    upcomingTasks: 'Upcoming Tasks',
    recentActivities: 'Recent Activities',
    salesPipeline: 'Sales Pipeline',
    overview: 'Overview',
    view: 'View',
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
    noActivities: 'No recent activities',
    welcomeBack: 'Welcome back',
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
  },
  buttons: {
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    create: 'Create',
    view: 'View',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    send: 'Send',
    more: 'More',
  },
  settings: {
    regional: 'Regional Settings',
    language: 'Language',
    timezone: 'Time Zone',
    dateFormat: 'Date Format',
    rtlLayout: 'Right-to-Left Layout',
    rtlLayoutDescription: 'Enable right-to-left text direction for Arabic language support',
    notifications: 'Notification Preferences',
    emailNotifications: 'Email Notifications',
    emailNotificationsDescription: 'Receive email updates about your account activity',
    smsNotifications: 'SMS Notifications',
    smsNotificationsDescription: 'Receive text messages for important alerts',
    desktopNotifications: 'Desktop Notifications',
    desktopNotificationsDescription: 'Receive notifications in your browser',
    security: 'Security & Privacy',
    twoFactorAuth: 'Two-Factor Authentication',
    twoFactorAuthDescription: 'Add an extra layer of security to your account',
    dataExport: 'Data Export',
    dataExportDescription: 'Allow exporting your data in various formats',
    activityLogging: 'Activity Logging',
    activityLoggingDescription: 'Keep a record of your actions for security purposes',
    profile: 'Profile Settings',
    system: 'System Settings',
    apiKeys: 'API Keys',
    teams: 'Teams',
    dataMigration: 'Data Migration',
  },
  general: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    noData: 'No data available',
    welcome: 'Welcome',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    search: 'Search',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    status: 'Status',
    actions: 'Actions',
    description: 'Description',
    noResults: 'No results found',
  }
};

// Arabic translations
const arabicTranslations: Translations = {
  navigation: {
    dashboard: 'لوحة المعلومات',
    contacts: 'جهات الاتصال',
    accounts: 'الحسابات',
    leads: 'العملاء المحتملون',
    opportunities: 'الفرص',
    calendar: 'التقويم',
    tasks: 'المهام',
    reports: 'التقارير',
    settings: 'الإعدادات',
    intelligence: 'الذكاء الاصطناعي',
    workflows: 'مسارات العمل',
    subscriptions: 'الاشتراكات',
    admin: 'المشرف',
    communicationCenter: 'مركز الاتصالات',
    accounting: 'المحاسبة',
    inventory: 'المخزون',
  },
  dashboard: {
    greeting: 'مرحبا',
    newLeads: 'العملاء المحتملين الجدد',
    conversionRate: 'معدل التحويل',
    revenueGenerated: 'الإيرادات المحققة',
    openDeals: 'الصفقات المفتوحة',
    upcomingTasks: 'المهام القادمة',
    recentActivities: 'الأنشطة الأخيرة',
    salesPipeline: 'خط أنابيب المبيعات',
    overview: 'نظرة عامة',
    view: 'عرض',
    today: 'اليوم',
    week: 'هذا الأسبوع',
    month: 'هذا الشهر',
    noActivities: 'لا توجد أنشطة حديثة',
    welcomeBack: 'مرحبًا بعودتك',
    goodMorning: 'صباح الخير',
    goodAfternoon: 'مساء الخير',
    goodEvening: 'طاب مساؤك',
  },
  buttons: {
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    delete: 'حذف',
    create: 'إنشاء',
    view: 'عرض',
    add: 'إضافة',
    search: 'بحث',
    filter: 'تصفية',
    export: 'تصدير',
    import: 'استيراد',
    send: 'إرسال',
    more: 'المزيد',
  },
  settings: {
    regional: 'الإعدادات الإقليمية',
    language: 'اللغة',
    timezone: 'المنطقة الزمنية',
    dateFormat: 'تنسيق التاريخ',
    rtlLayout: 'تخطيط من اليمين إلى اليسار',
    rtlLayoutDescription: 'تمكين اتجاه النص من اليمين إلى اليسار لدعم اللغة العربية',
    notifications: 'تفضيلات الإشعارات',
    emailNotifications: 'إشعارات البريد الإلكتروني',
    emailNotificationsDescription: 'تلقي تحديثات البريد الإلكتروني حول نشاط حسابك',
    smsNotifications: 'إشعارات الرسائل القصيرة',
    smsNotificationsDescription: 'تلقي رسائل نصية للتنبيهات المهمة',
    desktopNotifications: 'إشعارات سطح المكتب',
    desktopNotificationsDescription: 'تلقي إشعارات في متصفحك',
    security: 'الأمان والخصوصية',
    twoFactorAuth: 'المصادقة الثنائية',
    twoFactorAuthDescription: 'إضافة طبقة إضافية من الأمان إلى حسابك',
    dataExport: 'تصدير البيانات',
    dataExportDescription: 'السماح بتصدير بياناتك بتنسيقات مختلفة',
    activityLogging: 'تسجيل النشاط',
    activityLoggingDescription: 'الاحتفاظ بسجل لإجراءاتك لأغراض الأمان',
    profile: 'إعدادات الملف الشخصي',
    system: 'إعدادات النظام',
    apiKeys: 'مفاتيح API',
    teams: 'الفرق',
    dataMigration: 'ترحيل البيانات',
  },
  general: {
    loading: 'جار التحميل...',
    error: 'خطأ',
    success: 'نجاح',
    noData: 'لا توجد بيانات متاحة',
    welcome: 'مرحباً',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',
    register: 'التسجيل',
    search: 'بحث',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    address: 'العنوان',
    status: 'الحالة',
    actions: 'الإجراءات',
    description: 'الوصف',
    noResults: 'لم يتم العثور على نتائج',
  }
};

// Translation collections by language
const translations: Record<Language, Translations> = {
  english: englishTranslations,
  arabic: arabicTranslations,
  spanish: englishTranslations, // Fallback to English for now
  french: englishTranslations,  // Fallback to English for now
  german: englishTranslations,  // Fallback to English for now
  chinese: englishTranslations, // Fallback to English for now
};

// Helper function to get translations
export function getTranslations(language: Language): Translations {
  return translations[language] || translations.english;
}