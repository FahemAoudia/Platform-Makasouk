export type Locale = "fr" | "ar";

export const messages = {
  fr: {
    nav: {
      maison: "Maison",
      collections: "Collections",
      panier: "Panier",
      commandes: "Commandes",
      atelier: "Atelier",
      admin: "Admin",
      connexion: "Connexion",
      profil: "Profil",
      parametres: "Paramètres",
      deconnexion: "Déconnexion",
      ariaMenu: "Menu",
    },
    toolbar: {
      toArabic: "العربية",
      toFrench: "Français",
      dark: "Mode sombre",
      light: "Mode clair",
    },
    footer: {
      tagline:
        "Silhouettes sur-mesure, mesures guidées et artisans assignés à votre ligne — transparence d’atelier en temps réel.",
      explorer: "Explorer",
      service: "Service",
      linkCollections: "Collections",
      linkRecommendations: "Pour vous",
      linkOrders: "Commandes",
      linkTailor: "Espace tailleur",
      copyright:
        "Tous droits réservés — Aoudia Fahem · Makasouk (démonstration)",
    },
    hero: {
      kicker: "Maison algérienne — savoir-faire & sur-mesure",
      titleBefore: "L’élégance du tissu,",
      titleAccent: "l’âme du métier",
      arabicLine:
        "أزياء جزائرية فاخرة، مصممة بدقة، وخياطة يدوية تليق بمناسباتكم",
      body: "Caftans, costumes et tenues sur-mesure — guidés par des artisans, mesurés avec précision, et réalisés selon votre style.",
      ctaBrowse: "Découvrir les lignes",
      ctaRegister: "Ouvrir un compte",
    },
    home: {
      lignesEyebrow: "Lignes traditionnelles",
      lignesTitle: "Cinq univers de couture",
      lignesArabic: "تشكيلة تمثل أناقة الجزائر العريقة",
      lignesDesc:
        "Chaque ligne mène à un établi dédié : votre commande est confiée aux spécialistes du style choisi — le premier artisan disponible verrouille la commission.",
      selectionEyebrow: "Sélection",
      selectionTitle: "Pièces d’exception",
      selectionLink: "Rail personnalisé →",
      lookbookEyebrow: "Lookbook",
      lookbookTitle: "Nouvelles silhouettes",
    },
    categoryGrid: {
      cta: "Voir la ligne →",
    },
    tailors: {
      eyebrow: "Artisans",
      title: "Un atelier, plusieurs mains d’or",
      arabicLine: "حِرف يدوية فاخرة — خياطة تقليدية بروح معاصرة",
      cards: [
        {
          line: "Broderie & tradition",
          name: "Maître atelier",
          note: "Pièces cérémonielles et finitions à la main.",
        },
        {
          line: "Silhouettes sculptées",
          name: "Coupe sur-mesure",
          note: "Patrons ajustés millimètre par millimètre.",
        },
        {
          line: "Tissus choisis avec soin",
          name: "Finitions d’exception",
          note: "Lin, soie et lainages sélectionnés comme en boutique.",
        },
      ],
    },
    testimonials: {
      eyebrow: "Témoignages",
      title: "La parole de nos hôtes",
      arabicLine: "ثقة موروثة — جودة تُحكى من جيل إلى جيل",
      quotes: [
        {
          text: "Une coupe digne des grandes maisons — le tissu tombe comme une seconde peau.",
          name: "Soraya M.",
          place: "Alger",
        },
        {
          text: "L’attention aux détails rappelle le travail des maîtres brodeurs d’autrefois.",
          name: "Karim B.",
          place: "Oran",
        },
        {
          text: "Service discret, délais respectés, et une robe d’exception pour notre cérémonie.",
          name: "Leïla & Samir",
          place: "Constantine",
        },
      ],
    },
    browse: {
      eyebrow: "Les Collections",
      title: "Chapitres d’une même histoire",
      intro:
        "Choisissez une ligne pour parcourir les livres de silhouettes. Chaque catégorie oriente votre commande vers des tailleurs spécialisés lors de la validation.",
      salle: "Salle",
      entrer: "Entrer →",
      fallbackDescription:
        "Une ligne curatoriale à parcourir — silhouettes et matières sélectionnées pour cette salle.",
    },
    browseSlug: {
      eyebrow: "Catégorie",
    },
    modelCard: {
      from: "À partir de",
      view: "Voir",
    },
    common: {
      loading: "Chargement…",
      loadError: "Impossible de charger.",
    },
    measure: {
      eyebrow: "Prise de mesures guidée",
      titlePrefix: "Mesures pour",
      intro:
        "Avancez point par point avec des repères visuels. Les valeurs partent d’un bloc neutre — affinez-les pour votre silhouette.",
      visualGuide: "Repère visuel",
      watchMotionGuide: "Voir le guide en mouvement",
      step: "Étape {current} / {total}",
      active: "Actif",
      edit: "Modifier",
      adjustPrefix: "Ajuster",
      loadModelError: "Impossible de charger le modèle.",
      addToCartError: "Échec de l’ajout au panier",
      addToCart: "Ajouter au panier avec mesures",
    },
    measurementKeys: {
      chest: "Poitrine",
      waist: "Taille",
      shoulders: "Épaules",
      sleeve: "Longueur de manche",
      inseam: "Entrejambe",
      neck: "Tour de cou",
    },
    orders: {
      title: "Commandes",
      signIn: "Connectez-vous pour suivre vos commandes.",
      noOrders: "Aucune commande pour le moment.",
      statusPending: "En attente",
      statusAccepted: "Acceptée par le tailleur",
      statusInProgress: "En cours",
      statusShipped: "Expédiée",
      statusCancelled: "Annulée",
      cancelDialogTitle: "Annuler la commande",
      cancelDialogBody:
        "Souhaitez-vous vraiment annuler cette commande ?",
      back: "Retour",
      confirm: "Confirmer",
      cancelError: "Impossible d’annuler",
    },
    orderDetail: {
      loading: "Chargement…",
      eyebrow: "Commande",
      liveUpdates:
        "Les mises à jour en direct s’affichent ici lorsque le tailleur avance sur la pièce.",
      pieces: "Pièces",
    },
    cart: {
      loadError: "Impossible de charger le panier.",
      updateQtyError: "Impossible de mettre à jour la quantité.",
      removeError: "Impossible de retirer l’article.",
      checkoutError: "Échec de la validation de commande.",
      decreaseAria: "Diminuer la quantité",
      increaseAria: "Augmenter la quantité",
    },
    favorite: {
      signIn: "Connectez-vous pour enregistrer vos favoris.",
      saveError: "Impossible d’enregistrer.",
      add: "Ajouter aux favoris",
      saved: "Enregistré dans les favoris",
    },
    auth: {
      loginEyebrow: "Bon retour",
      loginTitle: "Connexion",
      loginFailed: "Connexion impossible",
      email: "E-mail",
      password: "Mot de passe",
      continue: "Continuer",
      newGuest: "Nouveau ?",
      createAccountLink: "Créer un compte",
      registerEyebrow: "Rejoindre la maison",
      registerTitle: "Créer un compte",
      accountType: "Type de compte",
      client: "Client",
      tailor: "Tailleur",
      tailorCategories: "Vos catégories (au moins une)",
      fullName: "Nom complet",
      loadCategoriesError: "Impossible de charger les catégories",
      tailorCategoryRequired:
        "Sélectionnez au moins une catégorie pour un compte tailleur.",
      registerFailed: "L’inscription a échoué",
      submitTailor: "Créer un compte tailleur",
      submitClient: "Commencer votre parcours sur-mesure",
      alreadyMember: "Déjà membre ?",
      signInLink: "Se connecter",
    },
    recommendations: {
      signIn:
        "Connectez-vous pour des recommandations selon vos goûts.",
      eyebrow: "Signal",
      title: "Sélection pour vous",
      intro:
        "Nous combinons l’affinité de catégorie issue de vos favoris avec le recoupement des étiquettes — prêt à évoluer vers des embeddings lorsque vous connecterez un service de modèle.",
    },
    tailor: {
      loadError: "Impossible de charger les données tailleur.",
      profileMissing: "Profil tailleur introuvable.",
      acceptError: "Impossible d’accepter",
      releaseError: "Impossible de libérer la commande",
    },
    admin: {
      title: "Administration",
      subtitle: "Utilisateurs, modèles et indicateurs.",
      unauthorized:
        "Administration — connectez-vous avec un compte administrateur.",
      tabOverview: "Vue",
      tabUsers: "Utilisateurs",
      tabModels: "Modèles",
      tabOrders: "Commandes",
      tabAdmins: "Créer admin",
      newAdminTitle: "Nouvel administrateur",
      newAdminHint: "Rôle fixe : ADMIN. E-mail unique.",
      fullName: "Nom complet",
      email: "E-mail",
      passwordMin8: "Mot de passe (min. 8 caractères)",
      createAdmin: "Créer l’administrateur",
      creating: "Création…",
      adminCreated: "Administrateur créé.",
      membersActive: "Membres actifs",
      tailorsMetric: "Tailleurs",
      revenue: "Chiffre",
      orderStatuses: "Statuts commandes",
      searchLabel: "Rechercher (nom ou e-mail)",
      filterPlaceholder: "Filtrer en temps réel…",
      tailorsSection: "Tailleurs",
      clientsSection: "Clients",
      linesPrefix: "Lignes :",
      reactivate: "Réactiver",
      deactivate: "Désactiver",
      delete: "Supprimer",
      noTailors: "Aucun tailleur à afficher.",
      noClients: "Aucun client à afficher.",
      ordersHint:
        "Suppression réservée aux commandes en attente (Disponibles).",
      noOrders: "Aucune commande.",
      editImages: "Modifier les images",
      deleteOrderTitle: "Confirmer la suppression",
      deleteOrderBody: "Supprimer définitivement cette commande ?",
      cancel: "Annuler",
      disabledSuffix: " · désactivé",
      roleTailor: "Tailleur",
      roleClient: "Client",
      roleAdmin: "Administrateur",
      loadError: "Impossible de charger les données d’administration.",
      toggleFailed: "Échec de la mise à jour.",
      deleteUserFailed: "Échec de la suppression — essayez désactiver.",
      deleteModelFailed: "Échec de la suppression du modèle.",
      deleteOrderFailed: "Échec de la suppression de la commande.",
      failed: "Échec",
      confirmDeleteUser: "Supprimer {email} ?",
      confirmDeleteModel: "Supprimer ce modèle ?",
      modelAddSection: "Nouveau modèle",
      modelCategory: "Ligne (catégorie)",
      modelNameLabel: "Nom du modèle",
      modelNameHint: "Ex. Décontracté — Signature III",
      modelSignatureLabel: "Signature / sous-titre",
      modelDescriptionLabel: "Description",
      modelBasePriceLabel: "Prix de base (USD)",
      modelPhotosLabel: "Photos (appareil ou galerie)",
      modelPhotosHint:
        "Glisser-déposer ou choisir — une ou plusieurs images, comme pour l’édition",
      modelPhotosRequired: "Sélectionnez au moins une image.",
      modelCreate: "Créer le modèle",
      modelCreating: "Création…",
      modelSaving: "Enregistrement…",
      modelSaveMeta: "Enregistrer nom & signature",
      modelUpdateFailed: "Échec de la mise à jour du modèle.",
      modelCreateFailed: "Échec de la création du modèle.",
    },
  },
  ar: {
    nav: {
      maison: "الرئيسية",
      collections: "المجموعات",
      panier: "السلة",
      commandes: "الطلبات",
      atelier: "الورشة",
      admin: "الإدارة",
      connexion: "تسجيل الدخول",
      profil: "الملف الشخصي",
      parametres: "الإعدادات",
      deconnexion: "تسجيل الخروج",
      ariaMenu: "القائمة",
    },
    toolbar: {
      toArabic: "العربية",
      toFrench: "Français",
      dark: "الوضع الداكن",
      light: "الوضع الفاتح",
    },
    footer: {
      tagline:
        "قصّات وفق مقاسك، قياس موجّه وحرفيون مخصّصون لخطّك — شفافية الورشة لحظة بلحظة.",
      explorer: "استكشاف",
      service: "الخدمات",
      linkCollections: "المجموعات",
      linkRecommendations: "موصى بك",
      linkOrders: "الطلبات",
      linkTailor: "فضاء الخيّاط",
      copyright:
        "جميع الحقوق محفوظة — Aoudia Fahem · منصة مقاسك (تجريبي)",
    },
    hero: {
      kicker: "دار جزائرية — إتقان وتفصيل حسب المقاس",
      titleBefore: "أناقة القماش،",
      titleAccent: "روح الحرفة",
      arabicLine:
        "أزياء جزائرية فاخرة، تصميم دقيق، وخياطة يدوية تليق بمناسباتكم",
      body: "قفطان وبدلات وأزياء حسب المقاس — برفقة الحرفيين، بقياس دقيق، وبحسب ذوقكم.",
      ctaBrowse: "اكتشف الخطوط",
      ctaRegister: "إنشاء حساب",
    },
    home: {
      lignesEyebrow: "خطوط تقليدية",
      lignesTitle: "خمسة عوالم للخياطة",
      lignesArabic: "تشكيلة تمثل أناقة الجزائر العريقة",
      lignesDesc:
        "كل خط يقود إلى ورشة مخصّصة: يُسلّم طلبكم لمتخصصي الأسلوب الذي اخترتموه — أول حرفي متاح يتولى الطلبية.",
      selectionEyebrow: "انتقاء",
      selectionTitle: "قطع استثنائية",
      selectionLink: "مسار شخصي ←",
      lookbookEyebrow: "لوكبوك",
      lookbookTitle: "قصّات جديدة",
    },
    categoryGrid: {
      cta: "عرض الخط ←",
    },
    tailors: {
      eyebrow: "الحرفيون",
      title: "ورشة واحدة، وأيادٍ ذهبية",
      arabicLine: "حِرف يدوية فاخرة — خياطة تقليدية بروح معاصرة",
      cards: [
        {
          line: "تطريز وتقليد",
          name: "سيد الورشة",
          note: "قطع للمناسبات ولمسات يدوية.",
        },
        {
          line: "قصّات منحوتة",
          name: "تفصيل حسب المقاس",
          note: "بُترونات مضبوطة مليمتراً بمليمتر.",
        },
        {
          line: "أقمشة منتقاة بعناية",
          name: "لمسات استثنائية",
          note: "كتان وحرير وصوف كما في أرقى المتاجر.",
        },
      ],
    },
    testimonials: {
      eyebrow: "آراء",
      title: "كلمة ضيوفنا",
      arabicLine: "ثقة موروثة — جودة تُحكى من جيل إلى جيل",
      quotes: [
        {
          text: "قصّة تليق بأكبر الدور — القماش كالثانية.",
          name: "سرايا م.",
          place: "الجزائر",
        },
        {
          text: "الاهتمام بالتفاصيل يذكّر بأعمال أساتذة التطريز.",
          name: "كريم ب.",
          place: "وهران",
        },
        {
          text: "خدمة راقية، مواعيد محترمة، وفستان استثنائي لحفلنا.",
          name: "ليلى وسمير",
          place: "قسنطينة",
        },
      ],
    },
    browse: {
      eyebrow: "المجموعات",
      title: "فصول قصة واحدة",
      intro:
        "اختروا خطاً لاستكشاف دفاتر القصّات. كل فئة توجّه طلبكم نحو خيّاطين متخصّصين عند التأكيد.",
      salle: "قاعة",
      entrer: "دخول ←",
      fallbackDescription:
        "خطٌّ يُعرض كمعرض — قصّات وأقمشة منتقاة لهذه القاعة.",
    },
    browseSlug: {
      eyebrow: "الفئة",
    },
    modelCard: {
      from: "ابتداءً من",
      view: "عرض",
    },
    common: {
      loading: "جاري التحميل…",
      loadError: "تعذّر التحميل.",
    },
    measure: {
      eyebrow: "قياس موجّه",
      titlePrefix: "قياسات",
      intro:
        "تقدّم خطوة بخطوة مع مراجع بصرية. القيم الافتراضية من قالب محايد — اضبطها بدقة لجسمك.",
      visualGuide: "دليل بصري",
      watchMotionGuide: "مشاهدة الدليل الحركي",
      step: "الخطوة {current} / {total}",
      active: "نشط",
      edit: "تعديل",
      adjustPrefix: "ضبط",
      loadModelError: "تعذّر تحميل القطعة.",
      addToCartError: "فشل الإضافة إلى السلة",
      addToCart: "إضافة إلى السلة مع القياسات",
    },
    measurementKeys: {
      chest: "الصدر",
      waist: "الخصر",
      shoulders: "الأكتاف",
      sleeve: "طول الكم",
      inseam: "طول الساق",
      neck: "العنق",
    },
    orders: {
      title: "الطلبات",
      signIn: "سجّل الدخول لمتابعة طلباتك.",
      noOrders: "لا طلبات بعد.",
      statusPending: "قيد الانتظار",
      statusAccepted: "مقبولة من الخيّاط",
      statusInProgress: "قيد التنفيذ",
      statusShipped: "تم الشحن",
      statusCancelled: "ملغاة",
      cancelDialogTitle: "إلغاء الطلب",
      cancelDialogBody: "هل تريد بالتأكيد إلغاء هذا الطلب؟",
      back: "رجوع",
      confirm: "تأكيد",
      cancelError: "تعذّر الإلغاء",
    },
    orderDetail: {
      loading: "جاري التحميل…",
      eyebrow: "طلب",
      liveUpdates:
        "تظهر التحديثات المباشرة هنا عندما يتقدّم الخيّاط في العمل.",
      pieces: "القطع",
    },
    cart: {
      loadError: "تعذّر تحميل السلة.",
      updateQtyError: "تعذّر تحديث الكمية.",
      removeError: "تعذّر إزالة السطر.",
      checkoutError: "فشل إتمام الطلب.",
      decreaseAria: "تقليل الكمية",
      increaseAria: "زيادة الكمية",
    },
    favorite: {
      signIn: "سجّل الدخول لحفظ المفضّلة.",
      saveError: "تعذّر الحفظ.",
      add: "إضافة إلى المفضّلة",
      saved: "محفوظ في المفضّلة",
    },
    auth: {
      loginEyebrow: "مرحباً بعودتك",
      loginTitle: "تسجيل الدخول",
      loginFailed: "تعذّر تسجيل الدخول",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      continue: "متابعة",
      newGuest: "جديد؟",
      createAccountLink: "إنشاء حساب",
      registerEyebrow: "انضم إلى الدار",
      registerTitle: "إنشاء حساب",
      accountType: "نوع الحساب",
      client: "عميل",
      tailor: "خيّاط",
      tailorCategories: "فئاتك (واحدة على الأقل)",
      fullName: "الاسم الكامل",
      loadCategoriesError: "تعذّر تحميل الفئات",
      tailorCategoryRequired: "اختر فئة واحدة على الأقل لحساب الخيّاط.",
      registerFailed: "فشل التسجيل",
      submitTailor: "إنشاء حساب خيّاط",
      submitClient: "ابدأ رحلة التفصيل",
      alreadyMember: "لديك حساب؟",
      signInLink: "تسجيل الدخول",
    },
    recommendations: {
      signIn: "سجّل الدخول لتوصيات حسب ذوقك.",
      eyebrow: "إشارة",
      title: "مختار لك",
      intro:
        "نمزج انتماء الفئة من مفضّلاتك مع تطابق الوسوم — جاهز للانتقال إلى تضمينات عند ربط خدمة نموذج.",
    },
    tailor: {
      loadError: "تعذّر تحميل بيانات الخيّاط.",
      profileMissing: "ملف الخيّاط غير موجود.",
      acceptError: "تعذّر القبول",
      releaseError: "تعذّر تحرير الطلب",
    },
    admin: {
      title: "الإدارة",
      subtitle: "المستخدمون، النماذج والمؤشرات.",
      unauthorized: "الإدارة — سجّل الدخول بحساب مشرف.",
      tabOverview: "نظرة عامة",
      tabUsers: "المستخدمون",
      tabModels: "النماذج",
      tabOrders: "الطلبات",
      tabAdmins: "إنشاء مشرف",
      newAdminTitle: "مشرف جديد",
      newAdminHint: "دور ثابت : ADMIN. بريد فريد.",
      fullName: "الاسم الكامل",
      email: "البريد الإلكتروني",
      passwordMin8: "كلمة المرور (8 أحرف على الأقل)",
      createAdmin: "إنشاء المشرف",
      creating: "جاري الإنشاء…",
      adminCreated: "تم إنشاء المشرف.",
      membersActive: "أعضاء نشطون",
      tailorsMetric: "الخيّاطون",
      revenue: "المبيعات",
      orderStatuses: "حالات الطلبات",
      searchLabel: "بحث (اسم أو بريد)",
      filterPlaceholder: "تصفية فورية…",
      tailorsSection: "الخيّاطون",
      clientsSection: "العملاء",
      linesPrefix: "الخطوط :",
      reactivate: "إعادة تفعيل",
      deactivate: "تعطيل",
      delete: "حذف",
      noTailors: "لا خيّاطين للعرض.",
      noClients: "لا عملاء للعرض.",
      ordersHint: "الحذف للطلبات المعلّقة فقط (المتاحة).",
      noOrders: "لا طلبات.",
      editImages: "تعديل الصور",
      deleteOrderTitle: "تأكيد الحذف",
      deleteOrderBody: "حذف هذا الطلب نهائياً؟",
      cancel: "إلغاء",
      disabledSuffix: " · معطّل",
      roleTailor: "خيّاط",
      roleClient: "عميل",
      roleAdmin: "مشرف",
      loadError: "تعذّر تحميل بيانات الإدارة.",
      toggleFailed: "فشل التحديث.",
      deleteUserFailed: "فشل الحذف — جرّب التعطيل.",
      deleteModelFailed: "فشل حذف النموذج.",
      deleteOrderFailed: "فشل حذف الطلب.",
      failed: "فشل",
      confirmDeleteUser: "حذف {email} ؟",
      confirmDeleteModel: "حذف هذا النموذج؟",
      modelAddSection: "نموذج جديد",
      modelCategory: "الخط (الفئة)",
      modelNameLabel: "اسم النموذج",
      modelNameHint: "مثال: كاجوال — توقيع III",
      modelSignatureLabel: "التوقيع / السطر الفرعي",
      modelDescriptionLabel: "الوصف",
      modelBasePriceLabel: "السعر الأساسي (USD)",
      modelPhotosLabel: "الصور (الكاميرا أو المعرض)",
      modelPhotosHint:
        "اسحب وأفلت أو اختر — صورة أو أكثر، كما في تعديل الصور",
      modelPhotosRequired: "اختر صورة واحدة على الأقل.",
      modelCreate: "إنشاء النموذج",
      modelCreating: "جاري الإنشاء…",
      modelSaving: "جاري الحفظ…",
      modelSaveMeta: "حفظ الاسم والتوقيع",
      modelUpdateFailed: "فشل تحديث النموذج.",
      modelCreateFailed: "فشل إنشاء النموذج.",
    },
  },
} as const;

/** Clé pointée, ex. `nav.maison` ou `tailors.cards.0.name` */
export function translate(locale: Locale, key: string): string {
  const path = key.split(".").map((segment) => {
    const n = Number(segment);
    return Number.isInteger(n) && String(n) === segment ? n : segment;
  });
  const tree = messages[locale] as unknown;
  let cur: unknown = tree;
  for (const segment of path) {
    if (cur === null || cur === undefined) return key;
    cur = (cur as Record<string | number, unknown>)[segment];
  }
  if (typeof cur === "string") return cur;
  return key;
}

export function orderStatusLabel(locale: Locale, status: string): string {
  const map: Record<string, string> = {
    PENDING: "orders.statusPending",
    ACCEPTED: "orders.statusAccepted",
    IN_PROGRESS: "orders.statusInProgress",
    SHIPPED: "orders.statusShipped",
    CANCELLED: "orders.statusCancelled",
  };
  const path = map[status];
  return path ? translate(locale, path) : status;
}

export function measurementKeyLabel(locale: Locale, key: string): string {
  const path = `measurementKeys.${key}`;
  const r = translate(locale, path);
  return r === path ? key : r;
}

export function formatMeasureStep(
  locale: Locale,
  current: number,
  total: number
): string {
  return translate(locale, "measure.step")
    .replace("{current}", String(current))
    .replace("{total}", String(total));
}

export function adminRoleLabel(locale: Locale, role: string): string {
  const map: Record<string, string> = {
    TAILOR: "admin.roleTailor",
    CLIENT: "admin.roleClient",
    ADMIN: "admin.roleAdmin",
  };
  const path = map[role];
  return path ? translate(locale, path) : role;
}
