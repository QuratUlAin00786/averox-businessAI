// Translations library for AVEROX CRM

export type Language = 'english' | 'arabic' | 'spanish' | 'french' | 'german' | 'chinese';

// Translation keys by section
interface TooltipTranslations {
  previous: string;
  next: string;
  step: string;
  of: string;
  helpTip: string;
  skip: string;
  finish: string;
  startTour: string;
  watchVideo: string;
  learnMore: string;
  // Specific section tooltips
  dashboard: {
    overview: string;
    salesPipeline: string;
    tasks: string;
    activities: string;
  };
  settings: {
    language: string;
    timezone: string;
    dateFormat: string;
    rtlLayout: string;
    notifications: string;
    security: string;
  };
  training: {
    main: string;
    modules: string;
    videos: string;
    faq: string;
    resources: string;
  };
  communications: {
    overview: string;
    channels: string;
    integration: string;
  };
  leads: {
    creation: string;
    management: string;
    conversion: string;
  };
  opportunities: {
    stages: string;
    proposals: string;
    closing: string;
  };
  contacts: {
    management: string;
    details: string;
    communications: string;
  };
  accounts: {
    management: string;
    details: string;
    communications: string;
  };
}

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
  training: string;
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
  tomorrow: string;
  week: string;
  month: string;
  noActivities: string;
  welcomeBack: string;
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  last30days: string;
  noPipelineData: string;
  totalPipelineValue: string;
  myTasks: string;
  noTasks: string;
  createNewTask: string;
  viewAllTasks: string;
  viewAll: string;
  due: string;
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
  close: string;
  playVideo: string;
  downloadPdf: string;
  fullTutorial: string;
  learnMore: string;
  watchNow: string;
  readDocs: string;
  contactSupport: string;
  viewAllFaqs: string;
  download: string;
  register: string;
  watch: string;
  viewAllWebinars: string;
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
  select: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  actions: string;
  description: string;
  noResults: string;
}

interface TrainingTranslations {
  tutorials: string;
  videos: string;
  faq: string;
  resources: string;
  gettingStarted: string;
  gettingStartedDesc: string;
  quickSetup: string;
  quickSetupDesc: string;
  videoTutorials: string;
  videoTutorialsDesc: string;
  documentation: string;
  documentationDesc: string;
  trainingModules: string;
  videoPlaceholder: string;
  frequentlyAskedQuestions: string;
  faqDescription: string;
  needMoreHelp: string;
  needMoreHelpDesc: string;
  downloadableResources: string;
  resourcesDescription: string;
  userGuide: string;
  apiDocumentation: string;
  accountingSetupGuide: string;
  migrationChecklist: string;
  webinarsAndEvents: string;
  webinarsDescription: string;
  upcomingWebinarTitle: string;
  upcomingWebinarDesc: string;
  upcomingWebinarDate: string;
  upcomingLabel: string;
  recordedWebinarTitle: string;
  recordedWebinarDesc: string;
  recordedWebinarDate: string;
  recordedLabel: string;
}

// Main translations interface
export interface Translations {
  navigation: NavigationTranslations;
  dashboard: DashboardTranslations;
  buttons: ButtonsTranslations;
  settings: SettingsTranslations;
  general: GeneralTranslations;
  tooltips: TooltipTranslations;
  training: TrainingTranslations;
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
    training: 'Training & Help',
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
    tomorrow: 'Tomorrow',
    week: 'This Week',
    month: 'This Month',
    noActivities: 'No recent activities',
    welcomeBack: 'Welcome back',
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    last30days: 'Last 30 days',
    noPipelineData: 'No pipeline data available',
    totalPipelineValue: 'total pipeline value',
    myTasks: 'My Tasks',
    noTasks: 'No pending tasks',
    createNewTask: 'Create New Task',
    viewAllTasks: 'View All Tasks',
    viewAll: 'View All',
    due: 'Due',
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
    close: 'Close',
    playVideo: 'Play Video',
    downloadPdf: 'Download PDF',
    fullTutorial: 'Full Tutorial',
    learnMore: 'Learn More',
    watchNow: 'Watch Now',
    readDocs: 'Read Docs',
    contactSupport: 'Contact Support',
    viewAllFaqs: 'View All FAQs',
    download: 'Download',
    register: 'Register',
    watch: 'Watch',
    viewAllWebinars: 'View All Webinars',
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
    select: 'Select',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    status: 'Status',
    actions: 'Actions',
    description: 'Description',
    noResults: 'No results found',
  },
  tooltips: {
    previous: 'Previous',
    next: 'Next',
    step: 'Step',
    of: 'of',
    helpTip: 'Help',
    skip: 'Skip',
    finish: 'Finish',
    startTour: 'Start Tour',
    watchVideo: 'Watch Video',
    learnMore: 'Learn More',
    dashboard: {
      overview: 'View key performance metrics at a glance',
      salesPipeline: 'Track deals through various stages of your sales process',
      tasks: 'Manage your upcoming tasks and deadlines',
      activities: 'See recent updates and activities across your CRM'
    },
    settings: {
      language: 'Change the language of the interface',
      timezone: 'Set your local time zone for accurate scheduling',
      dateFormat: 'Choose how dates are displayed throughout the system',
      rtlLayout: 'Enable right-to-left text direction for Arabic language',
      notifications: 'Configure how and when you receive notifications',
      security: 'Manage security settings and privacy preferences'
    },
    communications: {
      overview: 'View all your communication channels in one place',
      channels: 'Configure different communication methods',
      integration: 'Connect with external messaging services'
    },
    leads: {
      creation: 'Add new potential customers to your pipeline',
      management: 'Organize and track your leads',
      conversion: 'Convert qualified leads into opportunities'
    },
    opportunities: {
      stages: 'Track deal progress through customizable sales stages',
      proposals: 'Create and manage sales proposals',
      closing: 'Tools and reminders to help close deals'
    },
    contacts: {
      management: 'Organize your contacts database',
      details: 'View and edit contact information',
      communications: 'See all interactions with this contact'
    },
    accounts: {
      management: 'Manage your business accounts and companies',
      details: 'View and edit company information',
      communications: 'See all interactions with this account'
    },
    training: {
      main: 'Access step-by-step guides, video tutorials, and resources to master AVEROX CRM',
      modules: 'Explore detailed training modules for different aspects of the CRM',
      videos: 'Watch video demonstrations of key features and workflows',
      faq: 'Find answers to frequently asked questions about using the platform',
      resources: 'Download helpful resources like user guides and checklists'
    }
  },
  training: {
    tutorials: 'Tutorials',
    videos: 'Videos',
    faq: 'FAQ',
    resources: 'Resources',
    gettingStarted: 'Getting Started with AVEROX CRM',
    gettingStartedDesc: 'Learn the basics to quickly set up and start using your CRM effectively',
    quickSetup: 'Quick Setup',
    quickSetupDesc: 'Configure your account and basic settings in minutes',
    videoTutorials: 'Video Tutorials',
    videoTutorialsDesc: 'Watch step-by-step video guides for key features',
    documentation: 'Documentation',
    documentationDesc: 'Detailed guides and reference materials',
    trainingModules: 'Training Modules',
    videoPlaceholder: 'Click play to watch the video tutorial',
    frequentlyAskedQuestions: 'Frequently Asked Questions',
    faqDescription: 'Find answers to common questions about using AVEROX CRM',
    needMoreHelp: 'Need more help?',
    needMoreHelpDesc: 'Our support team is ready to assist you with any questions or issues',
    downloadableResources: 'Downloadable Resources',
    resourcesDescription: 'Access user guides, checklists, and implementation resources',
    userGuide: 'AVEROX CRM User Guide (PDF)',
    apiDocumentation: 'API Documentation (PDF)',
    accountingSetupGuide: 'Accounting Module Setup Guide (PDF)',
    migrationChecklist: 'Data Migration Checklist (PDF)',
    webinarsAndEvents: 'Webinars & Events',
    webinarsDescription: 'Join live training sessions and watch recorded webinars',
    upcomingWebinarTitle: 'Mastering Customer Communication Workflows',
    upcomingWebinarDesc: 'Learn how to streamline your customer communications across all channels',
    upcomingWebinarDate: 'April 15, 2025 • 2:00 PM EST',
    upcomingLabel: 'Upcoming',
    recordedWebinarTitle: 'Advanced Reporting Techniques',
    recordedWebinarDesc: 'How to create custom reports and dashboards for better insights',
    recordedWebinarDate: 'March 20, 2025',
    recordedLabel: 'Recorded'
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
    training: 'التدريب والمساعدة',
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
    tomorrow: 'غدا',
    week: 'هذا الأسبوع',
    month: 'هذا الشهر',
    noActivities: 'لا توجد أنشطة حديثة',
    welcomeBack: 'مرحبًا بعودتك',
    goodMorning: 'صباح الخير',
    goodAfternoon: 'مساء الخير',
    goodEvening: 'طاب مساؤك',
    last30days: 'آخر 30 يوم',
    noPipelineData: 'لا توجد بيانات خط أنابيب متاحة',
    totalPipelineValue: 'إجمالي قيمة خط الأنابيب',
    myTasks: 'مهامي',
    noTasks: 'لا توجد مهام معلقة',
    createNewTask: 'إنشاء مهمة جديدة',
    viewAllTasks: 'عرض جميع المهام',
    viewAll: 'عرض الكل',
    due: 'موعد',
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
    close: 'إغلاق',
    playVideo: 'تشغيل الفيديو',
    downloadPdf: 'تنزيل PDF',
    fullTutorial: 'البرنامج التعليمي الكامل',
    learnMore: 'معرفة المزيد',
    watchNow: 'شاهد الآن',
    readDocs: 'قراءة الوثائق',
    contactSupport: 'الاتصال بالدعم',
    viewAllFaqs: 'عرض جميع الأسئلة الشائعة',
    download: 'تنزيل',
    register: 'تسجيل',
    watch: 'مشاهدة',
    viewAllWebinars: 'عرض جميع الندوات',
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
    select: 'اختر',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    address: 'العنوان',
    status: 'الحالة',
    actions: 'الإجراءات',
    description: 'الوصف',
    noResults: 'لم يتم العثور على نتائج',
  },
  tooltips: {
    previous: 'السابق',
    next: 'التالي',
    step: 'خطوة',
    of: 'من',
    helpTip: 'مساعدة',
    skip: 'تخطي',
    finish: 'إنهاء',
    startTour: 'بدء الجولة',
    watchVideo: 'مشاهدة الفيديو',
    learnMore: 'معرفة المزيد',
    dashboard: {
      overview: 'عرض مقاييس الأداء الرئيسية في لمحة',
      salesPipeline: 'تتبع الصفقات عبر مراحل مختلفة من عملية البيع',
      tasks: 'إدارة المهام القادمة والمواعيد النهائية',
      activities: 'مشاهدة التحديثات والأنشطة الأخيرة في نظام إدارة علاقات العملاء'
    },
    settings: {
      language: 'تغيير لغة الواجهة',
      timezone: 'ضبط المنطقة الزمنية المحلية للجدولة الدقيقة',
      dateFormat: 'اختيار كيفية عرض التواريخ في جميع أنحاء النظام',
      rtlLayout: 'تمكين اتجاه النص من اليمين إلى اليسار للغة العربية',
      notifications: 'تكوين كيفية ووقت تلقي الإشعارات',
      security: 'إدارة إعدادات الأمان وتفضيلات الخصوصية'
    },
    communications: {
      overview: 'عرض جميع قنوات الاتصال في مكان واحد',
      channels: 'تكوين طرق اتصال مختلفة',
      integration: 'الاتصال بخدمات المراسلة الخارجية'
    },
    leads: {
      creation: 'إضافة عملاء محتملين جدد إلى خط الأنابيب',
      management: 'تنظيم وتتبع العملاء المحتملين',
      conversion: 'تحويل العملاء المحتملين المؤهلين إلى فرص'
    },
    opportunities: {
      stages: 'تتبع تقدم الصفقة من خلال مراحل البيع القابلة للتخصيص',
      proposals: 'إنشاء وإدارة عروض المبيعات',
      closing: 'أدوات وتذكيرات للمساعدة في إغلاق الصفقات'
    },
    contacts: {
      management: 'تنظيم قاعدة بيانات جهات الاتصال',
      details: 'عرض وتحرير معلومات الاتصال',
      communications: 'مشاهدة جميع التفاعلات مع جهة الاتصال هذه'
    },
    accounts: {
      management: 'إدارة حسابات الأعمال والشركات',
      details: 'عرض وتحرير معلومات الشركة',
      communications: 'مشاهدة جميع التفاعلات مع هذا الحساب'
    },
    training: {
      main: 'الوصول إلى أدلة خطوة بخطوة وبرامج تعليمية بالفيديو وموارد لإتقان AVEROX CRM',
      modules: 'استكشاف وحدات التدريب التفصيلية لجوانب مختلفة من نظام إدارة علاقات العملاء',
      videos: 'مشاهدة عروض توضيحية بالفيديو للميزات وسير العمل الرئيسية',
      faq: 'ابحث عن إجابات للأسئلة المتداولة حول استخدام المنصة',
      resources: 'تنزيل موارد مفيدة مثل أدلة المستخدم وقوائم المراجعة'
    }
  },
  training: {
    tutorials: 'الدروس التعليمية',
    videos: 'الفيديوهات',
    faq: 'الأسئلة الشائعة',
    resources: 'الموارد',
    gettingStarted: 'البدء مع AVEROX CRM',
    gettingStartedDesc: 'تعلم الأساسيات لإعداد واستخدام نظام إدارة علاقات العملاء الخاص بك بفعالية',
    quickSetup: 'الإعداد السريع',
    quickSetupDesc: 'قم بتكوين حسابك والإعدادات الأساسية في دقائق',
    videoTutorials: 'دروس الفيديو',
    videoTutorialsDesc: 'شاهد أدلة الفيديو خطوة بخطوة للميزات الرئيسية',
    documentation: 'الوثائق',
    documentationDesc: 'أدلة مفصلة ومواد مرجعية',
    trainingModules: 'وحدات التدريب',
    videoPlaceholder: 'انقر للتشغيل لمشاهدة البرنامج التعليمي بالفيديو',
    frequentlyAskedQuestions: 'الأسئلة المتداولة',
    faqDescription: 'ابحث عن إجابات للأسئلة الشائعة حول استخدام AVEROX CRM',
    needMoreHelp: 'هل تحتاج إلى مزيد من المساعدة؟',
    needMoreHelpDesc: 'فريق الدعم لدينا جاهز لمساعدتك في أي أسئلة أو مشكلات',
    downloadableResources: 'الموارد القابلة للتنزيل',
    resourcesDescription: 'الوصول إلى أدلة المستخدم وقوائم المراجعة وموارد التنفيذ',
    userGuide: 'دليل مستخدم AVEROX CRM (PDF)',
    apiDocumentation: 'وثائق API (PDF)',
    accountingSetupGuide: 'دليل إعداد وحدة المحاسبة (PDF)',
    migrationChecklist: 'قائمة مراجعة ترحيل البيانات (PDF)',
    webinarsAndEvents: 'الندوات والفعاليات',
    webinarsDescription: 'انضم إلى جلسات التدريب المباشرة وشاهد الندوات المسجلة',
    upcomingWebinarTitle: 'إتقان سير عمل اتصالات العملاء',
    upcomingWebinarDesc: 'تعرف على كيفية تبسيط اتصالاتك مع العملاء عبر جميع القنوات',
    upcomingWebinarDate: '15 أبريل 2025 • 2:00 مساءً بتوقيت شرق الولايات المتحدة',
    upcomingLabel: 'قادم',
    recordedWebinarTitle: 'تقنيات إعداد التقارير المتقدمة',
    recordedWebinarDesc: 'كيفية إنشاء تقارير ولوحات معلومات مخصصة للحصول على رؤى أفضل',
    recordedWebinarDate: '20 مارس 2025',
    recordedLabel: 'مسجل'
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