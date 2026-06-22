import type { CaseStudy } from '@/types';

export const CASE_STUDIES: CaseStudy[] = [
    {
        id: 'matger-tutia',
        slug: 'matger-tutia',
        client: 'TUTIA internal / Matger-TUTIA',
        clientAr: 'توتيا / متجر توتيا',
        industry: 'E-Commerce',
        industryAr: 'التجارة الإلكترونية',
        summary:
            'Building Sudan\'s first multi-vendor e-commerce marketplace, connecting merchants with buyers through a mobile-first platform.',
        summaryAr:
            'بناء أول سوق إلكتروني متعدد البائعين في السودان، يربط التجار بالمشترين عبر منصة متنقلة أولاً.',
        resultMetric: '500+',
        resultMetricAr: '500+',
        resultLabel: 'App Downloads',
        resultLabelAr: 'تحميل التطبيق',
        sections: [
            {
                title: 'Overview',
                titleAr: 'نظرة عامة',
                content:
                    'Matger-TUTIA is Sudan\'s own e-commerce marketplace, developed and operated by TUTIA as a flagship product. The platform enables Sudanese merchants to list products across categories including electronics, fashion, cosmetics, furniture, and more, while providing buyers with a seamless mobile shopping experience. Available on both Android and iOS, the marketplace represents TUTIA\'s commitment to building real technology products that serve the Sudanese market.',
                contentAr:
                    'متجر توتيا هو سوق إلكتروني سوداني، تم تطويره وتشغيله بواسطة توتيا كمنتج رئيسي. تمكن المنصة التجار السودانيين من عرض منتجاتهم في فئات تشمل الإلكترونيات، الموضة، مستحضرات التجميل، الأثاث، وغيرها، مع توفير تجربة تسوق متنقلة سلسة للمشترين. المتجر متاح على كل من أندرويد و iOS، ويمثل التزام توتيا ببناء منتجات تقنية حقيقية تخدم السوق السوداني.',
            },
            {
                title: 'Challenge',
                titleAr: 'التحدي',
                content:
                    'The Sudanese retail sector was largely fragmented, with merchants operating through traditional channels and social media. Buyers had no centralized platform to discover and compare products from multiple vendors. Existing e-commerce solutions were either not tailored to the Sudanese market or lacked localized payment and delivery options. The challenge was to build a platform that addressed these gaps while being accessible to users with varying levels of technical literacy.',
                contentAr:
                    'كان قطاع التجزئة السوداني مجزأً إلى حد كبير، حيث يعمل التجار عبر القنوات التقليدية ووسائل التواصل الاجتماعي. لم يكن لدى المشترين منصة مركزية لاكتشاف ومقارنة المنتجات من عدة بائعين. حلول التجارة الإلكترونية الحالية إما لم تكن مصممة للسوق السوداني أو تفتقر إلى خيارات الدفع والتوصيل المحلية. كان التحدي يتمثل في بناء منصة تعالج هذه الفجوات مع سهولة الوصول للمستخدمين بمستويات متفاوتة من المعرفة التقنية.',
            },
            {
                title: 'Objectives',
                titleAr: 'الأهداف',
                content:
                    'Create a multi-vendor marketplace platform with mobile apps for Android and iOS. Enable merchants to register, list products, and manage orders through a seller dashboard. Provide buyers with a intuitive shopping experience with search, categories, and secure checkout. Integrate multiple payment methods suitable for the Sudanese market. Achieve a minimum viable product launch within a defined timeline, followed by iterative improvements based on user feedback.',
                contentAr:
                    'إنشاء منصة سوق متعدد البائعين مع تطبيقات جوالة لأندرويد و iOS. تمكين التجار من التسجيل وعرض المنتجات وإدارة الطلبات من خلال لوحة تحكم البائع. توفير تجربة تسوق سهلة للمشترين مع البحث والتصنيفات والدفع الآمن. دمج طرق دفع متعددة مناسبة للسوق السوداني. تحقيق إطلاق منتج قابل للتطبيق ضمن إطار زمني محدد، متبوعاً بتحسينات مستمرة بناءً على ملاحظات المستخدمين.',
            },
            {
                title: 'Solution',
                titleAr: 'الحل',
                content:
                    'TUTIA designed and developed a full-stack marketplace platform with a React Native mobile application serving both Android and iOS from a single codebase. The seller dashboard provides inventory management, order tracking, and sales analytics. The buyer app features product browsing by category, search functionality, a shopping cart, and secure checkout. The platform supports multiple payment gateways and includes a rating and review system to build trust within the marketplace community.',
                contentAr:
                    'صممت وطورت توتيا منصة سوق متكاملة مع تطبيق جوال باستخدام React Native يخدم أندرويد و iOS من قاعدة شفرات واحدة. توفر لوحة تحكم البائع إدارة المخزون وتتبع الطلبات وتحليلات المبيعات. يتميز تطبيق المشتري بتصفح المنتجات حسب الفئة، وظيفة البحث، سلة التسوق، والدفع الآمن. تدعم المنصة بوابات دفع متعددة وتتضمن نظام تقييم ومراجعة لبناء الثقة داخل مجتمع السوق.',
            },
            {
                title: 'Technologies',
                titleAr: 'التقنيات',
                content:
                    'The platform was built using React Native for cross-platform mobile development, with a robust backend API. Payment integration was implemented to support multiple local and international payment methods. The seller dashboard was developed as a web application, and the entire platform was deployed with scalable cloud infrastructure.',
                contentAr:
                    'تم بناء المنصة باستخدام React Native للتطوير عبر المنصات الجوالة، مع واجهة برمجة تطبيقات خلفية قوية. تم تنفيذ دمج الدعم لطرق دفع محلية ودولية متعددة. تم تطوير لوحة تحكم البائع كتطبيق ويب، وتم نشر المنصة بأكملها على بنية تحتية سحابية قابلة للتوسع.',
            },
            {
                title: 'Implementation',
                titleAr: 'التنفيذ',
                content:
                    'The project followed an agile methodology with iterative sprints. Phase 1 focused on core marketplace functionality: merchant registration, product listing, and buyer browsing. Phase 2 introduced the shopping cart, checkout flow, and payment integration. Phase 3 added the seller dashboard with order management and analytics. The mobile apps were published to Google Play and Apple App Store, and the platform was launched with an initial cohort of merchants across key product categories.',
                contentAr:
                    'اتبع المشروع منهجية رشيقة مع سباقات متكررة. ركزت المرحلة الأولى على وظائف السوق الأساسية: تسجيل التاجر، عرض المنتجات، وتصفح المشتري. قدمت المرحلة الثانية سلة التسوق، عملية الدفع، ودمج طرق الدفع. أضافت المرحلة الثالثة لوحة تحكم البائع مع إدارة الطلبات والتحليلات. تم نشر التطبيقات الجوالة على Google Play و Apple App Store، وتم إطلاق المنصة مع مجموعة أولية من التجار عبر فئات المنتجات الرئيسية.',
            },
            {
                title: 'Outcomes',
                titleAr: 'النتائج',
                content:
                    'Matger-TUTIA successfully launched and achieved over 500 app downloads across Android and iOS. The platform onboarded merchants across multiple product categories, creating Sudan\'s first multi-vendor digital marketplace. The project demonstrated TUTIA\'s capability to design, develop, and deploy a production-grade mobile platform end-to-end. Ongoing development continues to add features based on merchant and buyer feedback, including enhanced search, promotional tools, and expanded payment options.',
                contentAr:
                    'تم إطلاق متجر توتيا بنجاح وحقق أكثر من 500 تحميل للتطبيق عبر أندرويد و iOS. استقطبت المنصة تجاراً عبر فئات منتجات متعددة، مما خلق أول سوق إلكتروني متعدد البائعين في السودان. أثبت المشروع قدرة توتيا على تصميم وتطوير ونشر منصة جوالة بجودة إنتاجية من البداية إلى النهاية. يستمر التطوير بإضافة ميزات بناءً على ملاحظات التجار والمشترين، بما في ذلك البحث المحسن، أدوات الترويج، وخيارات الدفع الموسعة.',
            },
        ],
        technologies: [
            { name: 'React Native', nameAr: 'React Native' },
            { name: 'Android & iOS', nameAr: 'Android و iOS' },
            { name: 'Payment Gateway Integration', nameAr: 'دمج بوابات الدفع' },
            { name: 'RESTful API', nameAr: 'API' },
            { name: 'Cloud Infrastructure', nameAr: 'بنية تحتية سحابية' },
        ],
        clientQuote:
            'TUTIA has been a reliable technology partner, delivering quality solutions with professionalism and on-time delivery. Their team demonstrates deep technical expertise and genuine commitment to client success.',
        clientQuoteAr:
            'كانت توتيا شريكاً تقنياً موثوقاً، تقدم حلولاً عالية الجودة باحترافية وفي الوقت المحدد. فريقهم يظهر خبرة تقنية عميقة والتزاماً حقيقياً بنجاح العملاء.',
        clientLogo: '/images/customers/bdr.png',
        featured: true,
    },
    {
        id: 'erp-implementation',
        slug: 'erp-implementation',
        client: 'Sudanese Enterprise (Financial Sector)',
        clientAr: 'مؤسسة سودانية (قطاع مالي)',
        industry: 'Enterprise Technology',
        industryAr: 'التقنية المؤسسية',
        summary:
            'Streamlining financial and operational processes for a Sudanese enterprise through a comprehensive ERP implementation.',
        summaryAr:
            'تبسيط العمليات المالية والتشغيلية لمؤسسة سودانية من خلال تطبيق نظام تخطيط موارد مؤسسية شامل.',
        resultMetric: 'Real-Time',
        resultMetricAr: 'فوري',
        resultLabel: 'Operational Visibility',
        resultLabelAr: 'رؤية تشغيلية',
        sections: [
            {
                title: 'Overview',
                titleAr: 'نظرة عامة',
                content:
                    'TUTIA partnered with a leading Sudanese enterprise to implement a comprehensive ERP system that would unify their financial, operational, and customer management processes. The organization was managing growth across multiple departments using disconnected systems and manual workflows, creating inefficiencies and data inconsistencies. TUTIA\'s team conducted a thorough assessment and delivered a tailored ERP solution that transformed their daily operations.',
                contentAr:
                    'تعاونت توتيا مع مؤسسة سودانية رائدة لتطبيق نظام تخطيط موارد مؤسسية شامل يوحد عملياتها المالية والتشغيلية وإدارة العملاء. كانت المؤسسة تدير النمو عبر أقسام متعددة باستخدام أنظمة غير متصلة وسير عمل يدوي، مما خلق عدم كفاءة وتناقضات في البيانات. أجرى فريق توتيا تقييماً شاملاً وقدم حلاً مخصصاً لتخطيط الموارد حوّل عملياتهم اليومية.',
            },
            {
                title: 'Challenge',
                titleAr: 'التحدي',
                content:
                    'The client operated with separate systems for accounting, inventory management, human resources, and customer relationship management. Data had to be manually reconciled between departments, leading to errors and delays in reporting. Management lacked real-time visibility into key business metrics, making strategic decision-making difficult. The existing infrastructure could not scale with the organization\'s growth trajectory.',
                contentAr:
                    'كان العميل يعمل بأنظمة منفصلة للمحاسبة وإدارة المخزون والموارد البشرية وإدارة علاقات العملاء. كانت البيانات تحتاج إلى تسوية يدوية بين الإدارات، مما أدى إلى أخطاء وتأخير في التقارير. كانت الإدارة تفتقر إلى الرؤية الفورية لمؤشرات الأداء الرئيسية، مما جعل اتخاذ القرارات الاستراتيجية صعباً. لم تكن البنية التحتية الحالية قادرة على التوسع مع مسار نمو المؤسسة.',
            },
            {
                title: 'Objectives',
                titleAr: 'الأهداف',
                content:
                    'Implement a unified ERP system integrating accounting, inventory, HR, and CRM modules. Eliminate manual data reconciliation between departments. Provide management with real-time dashboards and reporting. Automate key business processes to reduce operational overhead. Establish a scalable technology foundation that supports future growth.',
                contentAr:
                    'تطبيق نظام تخطيط موارد مؤسسية موحد يدمج وحدات المحاسبة والمخزون والموارد البشرية وإدارة العملاء. القضاء على التسوية اليدوية للبيانات بين الإدارات. توفير لوحات معلومات وتقارير فورية للإدارة. أتمتة العمليات التجارية الرئيسية لتقليل الأعباء التشغيلية. إنشاء أساس تقني قابل للتوسع يدعم النمو المستقبلي.',
            },
            {
                title: 'Solution',
                titleAr: 'الحل',
                content:
                    'TUTIA deployed a modular ERP system tailored to the client\'s specific workflows. The financial management module automated accounting, budgeting, and reporting. The inventory module provided real-time stock tracking across multiple locations. The HR module streamlined payroll, attendance, and employee records. The CRM module unified customer data and sales pipeline management. Custom dashboards were created for executive leadership with key performance indicators.',
                contentAr:
                    'قامت توتيا بنشر نظام تخطيط موارد مؤسسية معياري مصمم خصيصاً لسير عمل العميل. قامت وحدة الإدارة المالية بأتمتة المحاسبة والميزانية والتقارير. وفرت وحدة المخزون تتبعاً فورياً للمخزون عبر مواقع متعددة. قامت وحدة الموارد البشرية بتبسيط كشوف الرواتب والحضور وسجلات الموظفين. وحدت وحدة إدارة العملاء بيانات العملاء وإدارة مسار المبيعات. تم إنشاء لوحات معلومات مخصصة للإدارة التنفيذية مع مؤشرات الأداء الرئيسية.',
            },
            {
                title: 'Technologies',
                titleAr: 'التقنيات',
                content:
                    'The solution was built on a robust ERP platform with modules for financial management, inventory control, HR management, and CRM. Custom reporting dashboards were developed to meet the client\'s specific requirements. The system was deployed on reliable server infrastructure with regular backup and disaster recovery procedures.',
                contentAr:
                    'تم بناء الحل على منصة تخطيط موارد مؤسسية قوية مع وحدات للإدارة المالية والتحكم في المخزون وإدارة الموارد البشرية وإدارة العملاء. تم تطوير لوحات تقارير مخصصة لتلبية متطلبات العميل الخاصة. تم نشر النظام على بنية تحتية خادمة موثوقة مع إجراءات نسخ احتياطي واستعادة منتظمة.',
            },
            {
                title: 'Implementation',
                titleAr: 'التنفيذ',
                content:
                    'The implementation followed a phased approach. Phase 1 deployed the financial management and accounting modules, the highest priority for the client. Phase 2 added inventory management integrated with financial data. Phase 3 introduced HR and payroll automation. Phase 4 deployed the CRM module and integrated it with the existing sales processes. Each phase included data migration, user training, and a go-live support period to ensure smooth adoption.',
                contentAr:
                    'اتبع التنفيذ نهجاً مرحلياً. المرحلة الأولى نشرت وحدات الإدارة المالية والمحاسبة، وهي الأولوية القصوى للعميل. المرحلة الثانية أضافت إدارة المخزون المتكاملة مع البيانات المالية. المرحلة الثالثة قدمت أتمتة الموارد البشرية وكشوف الرواتب. المرحلة الرابعة نشرت وحدة إدارة العملاء ودمجتها مع عمليات المبيعات الحالية. تضمنت كل مرحلة ترحيل البيانات وتدريب المستخدمين وفترة دعم بعد الإطلاق لضمان التبني السلس.',
            },
            {
                title: 'Outcomes',
                titleAr: 'النتائج',
                content:
                    'The ERP implementation eliminated manual data reconciliation between departments, reducing reporting time significantly. Management gained real-time visibility into financial and operational metrics through customized dashboards. Automated workflows reduced manual effort across accounting, HR, and inventory processes. The unified system provided a single source of truth for the organization, improving data accuracy and decision-making confidence. The client now has a scalable technology foundation to support continued growth.',
                contentAr:
                    'ألغى تطبيق نظام تخطيط الموارد التسوية اليدوية للبيانات بين الإدارات، مما قلل وقت التقارير بشكل كبير. حصلت الإدارة على رؤية فورية للمقاييس المالية والتشغيلية من خلال لوحات المعلومات المخصصة. قللت سير العمل الآلي الجهد اليدوي عبر عمليات المحاسبة والموارد البشرية والمخزون. وفر النظام الموحد مصدراً واحداً للحقيقة للمؤسسة، مما حسن دقة البيانات وثقة اتخاذ القرار. لدى العميل الآن أساس تقني قابل للتوسع لدعم النمو المستمر.',
            },
        ],
        technologies: [
            { name: 'ERP System', nameAr: 'نظام تخطيط موارد' },
            { name: 'Financial Management', nameAr: 'الإدارة المالية' },
            { name: 'Inventory Control', nameAr: 'التحكم في المخزون' },
            { name: 'HR & Payroll', nameAr: 'الموارد البشرية والرواتب' },
            { name: 'CRM Integration', nameAr: 'دمج إدارة العملاء' },
        ],
        clientQuote:
            'The professional relationship with our TUTIA team has proven to be beneficial beyond our expectations. The lines of communication with our TUTIA project manager are always open and very effective, and the quality of work completed by the team is consistently of a high quality that meets our standards.',
        clientQuoteAr:
            'العلاقة المهنية مع فريق توتيا أثبتت فائدتها بما يتجاوز توقعاتنا. خطوط التواصل مع مدير مشروع توتيا مفتوحة دائماً وفعالة جداً، وجودة العمل المنجز من قبل الفريق عالية باستمرار وتلبي معاييرنا.',
        clientLogo: '/images/customers/icrc.jpg',
        featured: true,
    },
    {
        id: 'connectivity-project',
        slug: 'connectivity-project',
        client: 'Sudanese Organization (Telecom Sector)',
        clientAr: 'منظمة سودانية (قطاع الاتصالات)',
        industry: 'Telecommunications',
        industryAr: 'الاتصالات',
        summary:
            'Extending reliable mobile and Wi-Fi coverage across underserved areas in Khartoum to improve connectivity for businesses and residents.',
        summaryAr:
            'توسيع التغطية الجوالة واللاسلكية الموثوقة في المناطق المحرومة في الخرطوم لتحسين الاتصال للشركات والسكان.',
        resultMetric: 'Expanded',
        resultMetricAr: 'موسع',
        resultLabel: 'Coverage Area',
        resultLabelAr: 'منطقة التغطية',
        sections: [
            {
                title: 'Overview',
                titleAr: 'نظرة عامة',
                content:
                    'TUTIA was engaged to design and deploy a connectivity solution for an organization needing reliable mobile and Wi-Fi coverage across multiple facilities in Khartoum. The project involved comprehensive site assessment, infrastructure deployment, and ongoing maintenance to ensure consistent, high-quality connectivity for daily operations.',
                contentAr:
                    'تم التعاقد مع توتيا لتصميم ونشر حل اتصال لمنظمة تحتاج إلى تغطية جوالة ولاسلكية موثوقة عبر عدة مرافق في الخرطوم. شمل المشروع تقييماً شاملاً للمواقع ونشر البنية التحتية وصيانة مستمرة لضمان اتصال ثابت وعالي الجودة للعمليات اليومية.',
            },
            {
                title: 'Challenge',
                titleAr: 'التحدي',
                content:
                    'The client experienced inconsistent mobile signal strength and limited Wi-Fi coverage across their facilities, impacting productivity and communication. Existing infrastructure was outdated and unable to support the growing number of connected devices. The urban environment presented challenges including signal interference and building material attenuation. A solution was needed that would provide reliable coverage without requiring extensive civil works.',
                contentAr:
                    'عانى العميل من ضعف إشارة الجوال وتغطية لاسلكية محدودة عبر مرافقه، مما أثر على الإنتاجية والاتصالات. كانت البنية التحتية الحالية قديمة وغير قادرة على دعم العدد المتزايد من الأجهزة المتصلة. قدمت البيئة الحضرية تحديات بما في ذلك تداخل الإشارات وتوهين مواد البناء. كانت هناك حاجة لحل يوفر تغطية موثوقة دون الحاجة إلى أعمال مدنية واسعة.',
            },
            {
                title: 'Objectives',
                titleAr: 'الأهداف',
                content:
                    'Conduct thorough site surveys to identify coverage gaps and signal issues. Design and deploy a network infrastructure that provides consistent coverage across all facilities. Implement both mobile signal enhancement and Wi-Fi solutions. Ensure the solution is scalable for future expansion. Provide ongoing maintenance and support to maintain optimal performance.',
                contentAr:
                    'إجراء مسوحات شاملة للمواقع لتحديد فجوات التغطية ومشاكل الإشارة. تصميم ونشر بنية تحتية للشبكة توفر تغطية متسقة عبر جميع المرافق. تنفيذ حلول تعزيز إشارة الجوال والشبكات اللاسلكية. ضمان قابلية الحل للتوسع في المستقبل. توفير صيانة ودعم مستمرين للحفاظ على الأداء الأمثل.',
            },
            {
                title: 'Solution',
                titleAr: 'الحل',
                content:
                    'TUTIA\'s team conducted detailed site surveys using professional RF assessment tools to map coverage gaps and identify optimal equipment placement. The solution combined mobile signal repeaters for cellular coverage with enterprise-grade Wi-Fi access points for data connectivity. Equipment was strategically positioned to maximize coverage while minimizing interference. The network was configured with centralized management for monitoring and maintenance.',
                contentAr:
                    'أجرى فريق توتيا مسوحات مواقع مفصلة باستخدام أدوات تقييم ترددات لاسلكية احترافية لرسم خرائط فجوات التغطية وتحديد المواقع المثلى للمعدات. جمع الحل بين معززات إشارة الجوال للتغطية الخلوية ونقاط وصول واي فاي من الدرجة المؤسسية لاتصال البيانات. تم وضع المعدات بشكل استراتيجي لتعظيم التغطية مع تقليل التداخل. تم تكوين الشبكة بإدارة مركزية للمراقبة والصيانة.',
            },
            {
                title: 'Technologies',
                titleAr: 'التقنيات',
                content:
                    'The solution deployed professional RF assessment tools, mobile signal repeaters, enterprise-grade Wi-Fi access points, centralized network management software, and structured cabling infrastructure.',
                contentAr:
                    'استخدم الحل أدوات تقييم ترددات لاسلكية احترافية ومعززات إشارة جوالة ونقاط وصول واي فاي مؤسسية وبرامج إدارة شبكة مركزية وبنية تحتية للكابلات المهيكلة.',
            },
            {
                title: 'Implementation',
                titleAr: 'التنفيذ',
                content:
                    'The project began with comprehensive site surveys across all facilities to document existing conditions and identify requirements. Equipment was procured and deployed based on survey findings, with careful attention to minimizing disruption to ongoing operations. Each installation was tested thoroughly before sign-off. The client\'s team received training on basic monitoring and troubleshooting. A maintenance schedule was established for regular system checks and updates.',
                contentAr:
                    'بدأ المشروع بمسوحات مواقع شاملة عبر جميع المرافق لتوثيق الظروف الحالية وتحديد المتطلبات. تم شراء المعدات ونشرها بناءً على نتائج المسح، مع اهتمام دقيق بتقليل التعطيل للعمليات الجارية. تم اختبار كل تركيب بدقة قبل الاعتماد. تلقى فريق العميل تدريباً على المراقبة الأساسية واستكشاف الأخطاء. تم إنشاء جدول صيانة للفحوصات والتحديثات الدورية للنظام.',
            },
            {
                title: 'Outcomes',
                titleAr: 'النتائج',
                content:
                    'The connectivity project successfully delivered consistent mobile and Wi-Fi coverage across all client facilities. Signal strength and reliability improved significantly, enabling uninterrupted communication and productivity. The centralized management system allowed the client\'s IT team to monitor network performance and address issues proactively. The scalable design allows for easy expansion as the organization grows.',
                contentAr:
                    'قدم مشروع الاتصال بنجاح تغطية جوالة ولاسلكية متسقة عبر جميع مرافق العميل. تحسنت قوة الإشارة والموثوقية بشكل كبير، مما مكن الاتصال والإنتاجية دون انقطاع. سمح نظام الإدارة المركزية لفريق تقنية المعلومات لدى العميل بمراقبة أداء الشبكة ومعالجة المشاكل بشكل استباقي. التصميم القابل للتوسع يتيح التوسع بسهولة مع نمو المنظمة.',
            },
        ],
        technologies: [
            { name: 'RF Site Survey Tools', nameAr: 'أدوات مسح الترددات' },
            { name: 'Mobile Signal Repeaters', nameAr: 'معززات الإشارة الجوالة' },
            { name: 'Enterprise Wi-Fi Access Points', nameAr: 'نقاط وصول واي فاي مؤسسية' },
            { name: 'Network Management Software', nameAr: 'برامج إدارة الشبكة' },
            { name: 'Structured Cabling', nameAr: 'الكابلات المهيكلة' },
        ],
        clientQuote:
            'TUTIA upheld their promise of hard work, dedication, discipline and quality. This company leaves no stone unturned when it comes to their services. Their team understands the client\'s needs and puts every possible effort in successfully performing the given task.',
        clientQuoteAr:
            'وفت توتيا بوعدها بالعمل الجاد والتفاني والانضباط والجودة. هذه الشركة لا تترك حجراً دون قلب عندما يتعلق الأمر بخدماتها. فريقهم يفهم احتياجات العميل ويبذل كل جهد ممكن في أداء المهمة بنجاح.',
        clientLogo: '/images/customers/adeela.png',
        featured: true,
    },
];
