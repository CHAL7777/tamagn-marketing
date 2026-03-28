export const SUPPORTED_LOCALES = ["en", "am", "om"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type ThemeMode = "dark" | "light";

export const LOCALE_COOKIE_NAME = "liger-locale";
export const THEME_COOKIE_NAME = "liger-theme";

export function isLocale(value: string | null | undefined): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return value === "dark" || value === "light";
}

export function numberLocale(locale: Locale) {
  switch (locale) {
    case "am":
      return "am-ET";
    case "om":
      return "om-ET";
    case "en":
    default:
      return "en-US";
  }
}

export function localeHtmlLang(locale: Locale) {
  switch (locale) {
    case "am":
      return "am";
    case "om":
      return "om";
    case "en":
    default:
      return "en";
  }
}

const categoryLabels = {
  electronics: {
    en: "Electronics & accessories",
    am: "ኤሌክትሮኒክስ እና መለዋወጫዎች",
    om: "Elektirooniksii fi mi'aawwanii",
  },
  "phones-tablets": {
    en: "Phones & tablets",
    am: "ስልኮች እና ታብሌቶች",
    om: "Bilbilootaa fi taableetota",
  },
  "computers-office": {
    en: "Computers & office",
    am: "ኮምፒዩተሮች እና ቢሮ",
    om: "Kompitaraa fi waajjira",
  },
  "fashion-apparel": {
    en: "Fashion & apparel",
    am: "ፋሽን እና አልባሳት",
    om: "Faashinii fi uffata",
  },
  "shoes-bags": {
    en: "Shoes & bags",
    am: "ጫማዎች እና ቦርሳዎች",
    om: "Kophee fi boorsaa",
  },
  "beauty-personal-care": {
    en: "Beauty & personal care",
    am: "ውበት እና የግል እንክብካቤ",
    om: "Bareedinaa fi kunuunsa dhuunfaa",
  },
  "health-wellness": {
    en: "Health & wellness",
    am: "ጤና እና ደህንነት",
    om: "Fayyaa fi nagaa",
  },
  "baby-kids-toys": {
    en: "Baby, kids & toys",
    am: "ሕፃናት፣ ልጆች እና አሻንጉሊቶች",
    om: "Daa'imman, ijoollee fi taphoota",
  },
  "home-kitchen": {
    en: "Home, kitchen & dining",
    am: "ቤት፣ ማብሰያ ቤት እና ምግብ ቦታ",
    om: "Mana, mana nyaataa fi nyaata",
  },
  "furniture-decor": {
    en: "Furniture & decor",
    am: "ዕቃ ቤት እና ማስዋቢያ",
    om: "Meeshaa mana keessaa fi faaya",
  },
  "groceries-food": {
    en: "Groceries & packaged food",
    am: "ግሮሰሪ እና የታሸጉ ምግቦች",
    om: "Midhanii fi nyaata qophaa'e",
  },
  "sports-outdoors": {
    en: "Sports & outdoors",
    am: "ስፖርት እና ውጭ እንቅስቃሴ",
    om: "Ispoortii fi alaa",
  },
  "automotive-motorbike": {
    en: "Automotive & motorbike",
    am: "መኪና እና ሞተርሳይክል",
    om: "Konkolaataa fi mootor-saayikilii",
  },
  "tools-home-improvement": {
    en: "Tools & home improvement",
    am: "መሳሪያዎች እና የቤት ማሻሻያ",
    om: "Meeshaalee hojii fi fooyya'iinsa mana",
  },
  "garden-outdoor": {
    en: "Garden & outdoor living",
    am: "አትክልት እና ውጭ መኖር",
    om: "Iddoo biqiltuu fi jireenya alaa",
  },
  "books-media-stationery": {
    en: "Books, media & stationery",
    am: "መጻሕፍት፣ ሚዲያ እና የጽሕፈት ቁሳቁስ",
    om: "Kitaabota, miidiyaa fi meeshaa barreessuu",
  },
  "pet-supplies": {
    en: "Pet supplies",
    am: "የእንስሳት እቃዎች",
    om: "Meeshaa bineensota manaa",
  },
  "jewelry-watches": {
    en: "Jewelry & watches",
    am: "ጌጣጌጥ እና ሰዓቶች",
    om: "Faaya fi sa'aatii",
  },
  "arts-crafts-gifts": {
    en: "Arts, crafts & gifts",
    am: "ስነጥበብ፣ እጅ ስራ እና ስጦታዎች",
    om: "Aartii, hojii harkaa fi kennaa",
  },
  "industrial-business-supplies": {
    en: "Industrial & business supplies",
    am: "የኢንዱስትሪ እና የንግድ እቃዎች",
    om: "Meeshaa industirii fi daldalaa",
  },
  "professional-services": {
    en: "Professional & business services",
    am: "ሙያዊ እና የንግድ አገልግሎቶች",
    om: "Tajaajila ogummaa fi daldalaa",
  },
  "home-repair-handyman": {
    en: "Home repair & handyman",
    am: "የቤት ጥገና እና ሀንዲማን",
    om: "Suphaa manaatii fi hojii harkaa",
  },
  "cleaning-laundry": {
    en: "Cleaning & laundry",
    am: "ጽዳት እና ልብስ ማጠቢያ",
    om: "Qulqulleessuu fi miiccaa uffataa",
  },
  "beauty-grooming-services": {
    en: "Beauty & grooming services",
    am: "የውበት እና የእንክብካቤ አገልግሎቶች",
    om: "Tajaajila bareedinaa fi sirreeffamaa",
  },
  "education-tutoring": {
    en: "Education & tutoring",
    am: "ትምህርት እና አስተማሪነት",
    om: "Barnootaa fi barsiisuu dhuunfaa",
  },
  "it-web-digital": {
    en: "IT, web & digital",
    am: "አይቲ፣ ድር እና ዲጂታል",
    om: "IT, weebii fi dijitaalaa",
  },
  "events-photo-video": {
    en: "Events, photo & video",
    am: "ዝግጅቶች፣ ፎቶ እና ቪዲዮ",
    om: "Sagantaalee, suuraa fi viidiyoo",
  },
  "moving-delivery-logistics": {
    en: "Moving, delivery & logistics",
    am: "መጓጓዣ፣ ዴሊቨሪ እና ሎጂስቲክስ",
    om: "Geejjibaa, geessuu fi loojistikii",
  },
  "legal-tax-accounting": {
    en: "Legal, tax & accounting",
    am: "ሕግ፣ ታክስ እና ሂሳብ",
    om: "Seeraa, gibiraa fi herrega",
  },
  "construction-renovation": {
    en: "Construction & renovation",
    am: "ግንባታ እና ማደስ",
    om: "Ijaarsa fi haaromsa",
  },
  "coaching-consulting": {
    en: "Coaching & consulting",
    am: "ማሰልጠን እና ምክር",
    om: "Leenjii fi gorsaa",
  },
  "healthcare-wellness-services": {
    en: "Healthcare & wellness services",
    am: "የጤና እንክብካቤ እና ደህንነት አገልግሎቶች",
    om: "Tajaajila fayyaa fi nagaa",
  },
  "automotive-bike-services": {
    en: "Automotive & bike services",
    am: "የመኪና እና ብስክሌት አገልግሎቶች",
    om: "Tajaajila konkolaataa fi baaykelaa",
  },
  "catering-food-services": {
    en: "Catering & food services",
    am: "ካተሪንግ እና የምግብ አገልግሎቶች",
    om: "Tajaajila nyaataa fi qopheessaa nyaataa",
  },
} satisfies Record<string, Record<Locale, string>>;

export function translateCategoryLabel(
  slug: string,
  fallback: string,
  locale: Locale
) {
  const row = categoryLabels[slug as keyof typeof categoryLabels];
  return row?.[locale] ?? fallback;
}

export type Dictionary = {
  common: {
    localeNames: Record<Locale, string>;
    themeNames: Record<ThemeMode, string>;
    switchLanguage: string;
    switchTheme: string;
    themeButtonLabel: Record<ThemeMode, string>;
    appName: string;
    appTagline: string;
    aiBadge: string;
  };
  header: {
    nav: {
      home: string;
      marketplace: string;
      services: string;
      categories: string;
    };
    escrowProtected: string;
    trustedInEthiopia: string;
    signedIn: string;
    signIn: string;
    getStarted: string;
    signOut: string;
    dashboardLabels: {
      buyer: string;
      merchant: string;
      serviceProvider: string;
      courier: string;
      admin: string;
    };
    openMenu: string;
    closeMenu: string;
    navigate: string;
  };
  home: {
    heroChip: string;
    title: string;
    description: string;
    shopProducts: string;
    bookServices: string;
    metrics: {
      trustModel: string;
      payments: string;
      operations: string;
      trustModelValue: string;
      paymentsValue: string;
      operationsValue: string;
    };
    platformPromiseKicker: string;
    platformPromiseTitle: string;
    platformPromiseBody: string;
    hyperlocalDiscovery: string;
    buyerProtection: string;
    trustPillars: Array<{
      title: string;
      body: string;
    }>;
    howItWorksKicker: string;
    howItWorksTitle: string;
    howItWorksBody: string;
    steps: Array<{
      label: string;
      body: string;
    }>;
    roles: Array<{
      title: string;
      body: string;
      cta: string;
    }>;
  };
  ai: {
    kicker: string;
    title: string;
    body: string;
    placeholder: string;
    submit: string;
    loading: string;
    empty: string;
    poweredBy: string;
    missingConfig: string;
    genericError: string;
    suggestions: string[];
  };
  authLayout: {
    backHome: string;
    badge: string;
    title: string;
    body: string;
    features: Array<{
      title: string;
      body: string;
    }>;
  };
  login: {
    badge: string;
    title: string;
    body: string;
    email: string;
    password: string;
    signIn: string;
    signingIn: string;
    noAccount: string;
    createOne: string;
    resendHint: string;
    resendEmail: string;
    sending: string;
    resendConfirmation: string;
  };
  signup: {
    badge: string;
    title: string;
    body: string;
    fullName: string;
    optional: string;
    email: string;
    password: string;
    passwordHint: string;
    createAccount: string;
    creating: string;
    alreadyHaveAccount: string;
    signIn: string;
  };
  demoHint: {
    summary: string;
    intro: string;
    stepSeed: string;
    stepLogin: string;
    roles: string;
  };
  products: {
    filterChip: string;
    title: string;
    description: string;
    catalogStatus: string;
    activeResults: string;
    preferService: string;
    searchPlaceholder: string;
    minPlaceholder: string;
    maxPlaceholder: string;
    sortPopular: string;
    sortRating: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    apply: string;
    all: string;
    noResultsTitle: string;
    noResultsBody: string;
    verified: string;
    kmAway: string;
    sold: string;
    price: string;
    view: string;
  };
  services: {
    badge: string;
    title: string;
    description: string;
    listingsAvailable: string;
    publishService: string;
    allServices: string;
    requestQuote: string;
    prepaidEscrow: string;
    viewService: string;
    noCategoryTitle: string;
    noServicesTitle: string;
    noCategoryBody: string;
    noServicesBody: string;
    viewAllServices: string;
    trust: string;
  };
  categories: {
    badge: string;
    title: string;
    description: string;
    shopProducts: string;
    findServices: string;
    atAGlance: string;
    productCategories: string;
    serviceCategories: string;
    productsKicker: string;
    productsTitle: string;
    viewAllProducts: string;
    noProductCategories: string;
    servicesKicker: string;
    servicesTitle: string;
    viewAllServices: string;
    noServiceCategories: string;
  };
};

const dictionary: Record<Locale, Dictionary> = {
  en: {
    common: {
      localeNames: {
        en: "English",
        am: "አማርኛ",
        om: "Afaan Oromoo",
      },
      themeNames: {
        dark: "Dark",
        light: "Light",
      },
      switchLanguage: "Switch language",
      switchTheme: "Switch theme",
      themeButtonLabel: {
        dark: "Switch to light theme",
        light: "Switch to dark theme",
      },
      appName: "ታማኝ",
      appTagline: "Verified local commerce",
      aiBadge: "AI assistant",
    },
    header: {
      nav: {
        home: "Home",
        marketplace: "Marketplace",
        services: "Services",
        categories: "Categories",
      },
      escrowProtected: "Escrow protected",
      trustedInEthiopia: "Trusted in Ethiopia",
      signedIn: "Signed in",
      signIn: "Sign in",
      getStarted: "Get started",
      signOut: "Sign out",
      dashboardLabels: {
        buyer: "Buyer hub",
        merchant: "Merchant hub",
        serviceProvider: "Service hub",
        courier: "Courier hub",
        admin: "Admin hub",
      },
      openMenu: "Open menu",
      closeMenu: "Close menu",
      navigate: "Navigate",
    },
    home: {
      heroChip: "Ethiopia's digital guardian for local trade",
      title:
        "Trusted local commerce with verified sellers, M-Pesa escrow, and delivery built in.",
      description:
        "ታማኝ connects Ethiopian buyers, merchants, and service providers through one hyperlocal platform designed around trust, protected payments, and reliable logistics.",
      shopProducts: "Shop products",
      bookServices: "Book services",
      metrics: {
        trustModel: "Trust model",
        payments: "Payments",
        operations: "Operations",
        trustModelValue: "Admin-approved onboarding",
        paymentsValue: "Escrow-first M-Pesa flow",
        operationsValue: "Marketplace + delivery + disputes",
      },
      platformPromiseKicker: "Platform promise",
      platformPromiseTitle: "Tamagn turns local trust into product logic.",
      platformPromiseBody:
        "The platform brief centers on marketplace infrastructure, secure transactions, and platform-managed delivery in one connected flow.",
      hyperlocalDiscovery: "Nearby merchants and service areas",
      buyerProtection: "Buyer protection from checkout to delivery",
      trustPillars: [
        {
          title: "Verified merchants only",
          body: "Tamagn is built around admin-approved merchants and service providers so the marketplace stays accountable.",
        },
        {
          title: "M-Pesa escrow",
          body: "Buyers pay into escrow first. Funds are released only after delivery or successful completion of service.",
        },
        {
          title: "Platform-managed delivery",
          body: "Logistics stays inside the platform so buyers can track order progress from confirmation through handoff.",
        },
      ],
      howItWorksKicker: "How it works",
      howItWorksTitle: "Trusted commerce should feel simple.",
      howItWorksBody:
        "The project focuses on reducing fraud, improving digital visibility for local businesses, and giving buyers a clear path from discovery through confirmation.",
      steps: [
        {
          label: "Discover",
          body: "Browse nearby products and services with merchant verification, trust scores, and delivery context.",
        },
        {
          label: "Pay securely",
          body: "Use M-Pesa checkout with escrow protection so the seller is paid only when fulfillment is successful.",
        },
        {
          label: "Track and confirm",
          body: "Follow order progress, see courier updates, and confirm delivery before escrow is released.",
        },
      ],
      roles: [
        {
          title: "For buyers",
          body: "Search trusted local sellers, request services, manage addresses, and review order history in one place.",
          cta: "Explore the marketplace",
        },
        {
          title: "For merchants",
          body: "Manage inventory, orders, promotions, and performance while building trust through verified onboarding.",
          cta: "Apply as a merchant",
        },
        {
          title: "For service providers",
          body: "Publish service listings, receive quote requests, and take prepaid bookings where escrow protection is required.",
          cta: "Browse services",
        },
      ],
    },
    ai: {
      kicker: "AI commerce assistant",
      title: "Ask for product, service, or workflow guidance in your language.",
      body: "This assistant can help shoppers navigate escrow, delivery, and marketplace flows using a Hugging Face model configured by your environment.",
      placeholder:
        "Ask about products, trusted merchants, escrow, delivery, or how to use Tamagn...",
      submit: "Ask AI",
      loading: "Thinking…",
      empty: "Your answer will appear here.",
      poweredBy: "Powered by Hugging Face",
      missingConfig:
        "Hugging Face is not configured yet. Add HUGGINGFACE_API_TOKEN to enable AI responses.",
      genericError: "The AI assistant could not answer right now. Try again shortly.",
      suggestions: [
        "How does escrow release work after delivery?",
        "What should I check before buying from a merchant?",
        "How do prepaid service bookings work?",
      ],
    },
    authLayout: {
      backHome: "Back to home",
      badge: "The digital guardian",
      title: "Sign in to trusted local commerce.",
      body:
        "Tamagn combines verified merchant onboarding, escrow-protected M-Pesa payments, and delivery coordination in one platform for Ethiopia.",
      features: [
        {
          title: "Verified onboarding",
          body: "Merchants and service providers are approved before they become visible.",
        },
        {
          title: "Escrow-first payments",
          body: "Funds stay protected until the transaction has been fulfilled successfully.",
        },
        {
          title: "Platform accountability",
          body: "Order tracking, disputes, and logistics stay inside the same system.",
        },
      ],
    },
    login: {
      badge: "Secure account access",
      title: "Welcome back",
      body:
        "Sign in with the email tied to your buyer, merchant, service-provider, courier, or admin profile.",
      email: "Email",
      password: "Password",
      signIn: "Sign in",
      signingIn: "Signing in…",
      noAccount: "No account?",
      createOne: "Create one",
      resendHint:
        "Didn't get the email? Send another confirmation link if the address was correct.",
      resendEmail: "Email for confirmation",
      sending: "Sending…",
      resendConfirmation: "Resend confirmation email",
    },
    signup: {
      badge: "Buyer onboarding",
      title: "Create your Tamagn account",
      body:
        "Buyer accounts start here. Merchant and service-provider access is granted after approval inside the platform.",
      fullName: "Full name",
      optional: "optional",
      email: "Email",
      password: "Password",
      passwordHint: "At least 6 characters (max 128).",
      createAccount: "Create account",
      creating: "Creating…",
      alreadyHaveAccount: "Already have an account?",
      signIn: "Sign in",
    },
    demoHint: {
      summary: "Local demo (skip signup emails)",
      intro:
        "If signup hits the email rate limit or you do not want confirmation mail, seed demo users once, then sign in:",
      stepSeed:
        "From the project root, run npm run seed:demo (requires SUPABASE_SERVICE_ROLE_KEY in .env.local).",
      stepLogin:
        "Then sign in with the buyer demo account shown below.",
      roles:
        "Other role accounts are listed in supabase/README.md.",
    },
    products: {
      filterChip: "Filter by category, price, trust, and distance",
      title: "Discover trusted local products from verified Ethiopian merchants.",
      description:
        "Browse active listings, narrow by budget, and optionally pass ?lat=&lng=&km= to prioritize nearby sellers and shorter delivery routes.",
      catalogStatus: "Catalog status",
      activeResults: "active results for the current filter set",
      preferService: "Prefer booking a service?",
      searchPlaceholder: "Search for products or sellers",
      minPlaceholder: "Min ETB",
      maxPlaceholder: "Max ETB",
      sortPopular: "Most popular",
      sortRating: "Top trust score",
      sortPriceAsc: "Price low to high",
      sortPriceDesc: "Price high to low",
      apply: "Apply",
      all: "All",
      noResultsTitle: "No products match these filters.",
      noResultsBody:
        "Adjust the price range, pick another category, or try a broader search.",
      verified: "Verified",
      kmAway: "km away",
      sold: "sold",
      price: "Price",
      view: "View",
    },
    services: {
      badge: "Verified service marketplace",
      title: "Find service providers with visible trust and quote workflows.",
      description:
        "Service discovery follows the same trusted commerce model: verified providers, quote requests, and prepaid bookings when escrow is required.",
      listingsAvailable: "Listings available",
      publishService: "Publish a service",
      allServices: "All services",
      requestQuote: "Request quote",
      prepaidEscrow: "Prepaid escrow available",
      viewService: "View service",
      noCategoryTitle: "No services in this category yet.",
      noServicesTitle: "No services listed yet.",
      noCategoryBody: "Try another category or browse all services.",
      noServicesBody: "Providers can publish listings from their service dashboard.",
      viewAllServices: "View all services",
      trust: "Trust",
    },
    categories: {
      badge: "Browse by category",
      title: "Every aisle of local commerce, organized for discovery.",
      description:
        "Jump into product categories for physical goods, or service categories for providers you can book with the same escrow-backed trust model.",
      shopProducts: "Shop products",
      findServices: "Find services",
      atAGlance: "At a glance",
      productCategories: "Product categories",
      serviceCategories: "Service categories",
      productsKicker: "Products",
      productsTitle: "Goods from verified merchants",
      viewAllProducts: "View all products",
      noProductCategories:
        "No product categories yet. Run supabase/seed.sql or add categories in the dashboard.",
      servicesKicker: "Services",
      servicesTitle: "Book trusted local providers",
      viewAllServices: "View all services",
      noServiceCategories:
        "No service categories yet. Seed the database or add categories for providers.",
    },
  },
  am: {
    common: {
      localeNames: {
        en: "English",
        am: "አማርኛ",
        om: "Afaan Oromoo",
      },
      themeNames: {
        dark: "ጨለማ",
        light: "ብርሃን",
      },
      switchLanguage: "ቋንቋ ይቀይሩ",
      switchTheme: "ገጽታ ይቀይሩ",
      themeButtonLabel: {
        dark: "ወደ ብርሃን ገጽታ ቀይር",
        light: "ወደ ጨለማ ገጽታ ቀይር",
      },
      appName: "ታማኝ",
      appTagline: "የተረጋገጠ አካባቢያዊ ንግድ",
      aiBadge: "AI አጋዥ",
    },
    header: {
      nav: {
        home: "መነሻ",
        marketplace: "ገበያ",
        services: "አገልግሎቶች",
        categories: "ምድቦች",
      },
      escrowProtected: "በኤስክሮ የተጠበቀ",
      trustedInEthiopia: "በኢትዮጵያ የታመነ",
      signedIn: "ገብተዋል",
      signIn: "ግባ",
      getStarted: "ጀምር",
      signOut: "ውጣ",
      dashboardLabels: {
        buyer: "የገዢ ማዕከል",
        merchant: "የነጋዴ ማዕከል",
        serviceProvider: "የአገልግሎት ማዕከል",
        courier: "የኩሪየር ማዕከል",
        admin: "የአስተዳዳሪ ማዕከል",
      },
      openMenu: "ሜኑ ክፈት",
      closeMenu: "ሜኑ ዝጋ",
      navigate: "አሰሳ",
    },
    home: {
      heroChip: "ለአካባቢ ንግድ የኢትዮጵያ ዲጂታል ጠባቂ",
      title:
        "ከተረጋገጡ ሻጮች፣ ከኤም-ፔሳ ኤስክሮ እና ከተዋሃደ ዴሊቨሪ ጋር የታመነ አካባቢያዊ ንግድ።",
      description:
        "ታማኝ የኢትዮጵያ ገዢዎችን፣ ነጋዴዎችን እና አገልግሎት ሰጪዎችን በእምነት፣ በተጠበቁ ክፍያዎች እና በታማኝ ሎጂስቲክስ ዙሪያ በአንድ አካባቢያዊ መድረክ ያገናኛል።",
      shopProducts: "ምርቶችን ግዛ",
      bookServices: "አገልግሎቶችን ያዝ",
      metrics: {
        trustModel: "የእምነት ስርዓት",
        payments: "ክፍያዎች",
        operations: "ኦፕሬሽን",
        trustModelValue: "በአስተዳዳሪ የተፈቀደ መግቢያ",
        paymentsValue: "ኤስክሮ-መጀመሪያ የኤም-ፔሳ ፍሰት",
        operationsValue: "ገበያ + ዴሊቨሪ + ክርክር",
      },
      platformPromiseKicker: "የመድረኩ ተስፋ",
      platformPromiseTitle: "ታማኝ የአካባቢ እምነትን ወደ የምርት ሎጂክ ይቀይራል።",
      platformPromiseBody:
        "መድረኩ የገበያ መሠረተ ልማትን፣ የተጠበቁ ግብይቶችን እና በመድረኩ የሚተዳደር ዴሊቨሪን በአንድ የተገናኘ ፍሰት ያቀርባል።",
      hyperlocalDiscovery: "ቅርብ ነጋዴዎች እና የአገልግሎት አካባቢዎች",
      buyerProtection: "ከክፍያ እስከ ዴሊቨሪ ድረስ የገዢ ጥበቃ",
      trustPillars: [
        {
          title: "ተረጋገጡ ነጋዴዎች ብቻ",
          body: "ታማኝ በአስተዳዳሪ የተፈቀዱ ነጋዴዎችና አገልግሎት ሰጪዎች ላይ የተመሰረተ ነው።",
        },
        {
          title: "የኤም-ፔሳ ኤስክሮ",
          body: "ገዢዎች በመጀመሪያ ወደ ኤስክሮ ይከፍላሉ። ገንዘቡ የሚለቀቀው ከማድረስ ወይም ከተሳካ አገልግሎት በኋላ ብቻ ነው።",
        },
        {
          title: "በመድረኩ የሚተዳደር ዴሊቨሪ",
          body: "ሎጂስቲክስ በመድረኩ ውስጥ ይቆያል እንዲሁም ገዢዎች የትእዛዝ ሂደታቸውን እስከ ማድረስ ድረስ ይከታተላሉ።",
        },
      ],
      howItWorksKicker: "እንዴት ይሰራል",
      howItWorksTitle: "የታመነ ንግድ ቀላል መሆን አለበት።",
      howItWorksBody:
        "ፕሮጀክቱ ማጭበርበርን ለመቀነስ፣ የአካባቢ ንግዶችን ዲጂታል ለማሳየት እና ለገዢዎች ከፍለጋ እስከ ማረጋገጫ ድረስ ግልጽ መንገድ ለመስጠት ይሰራል።",
      steps: [
        {
          label: "ፈልግ",
          body: "በነጋዴ ማረጋገጫ፣ በእምነት ነጥብ እና በዴሊቨሪ አውድ የተደገፉ ምርቶችንና አገልግሎቶችን ያስሱ።",
        },
        {
          label: "በደህና ክፈል",
          body: "ሻጩ የሚከፈለው ከተሳካ አፈጻጸም በኋላ ብቻ እንዲሆን ከኤስክሮ ጋር የኤም-ፔሳ ክፍያ ይጠቀሙ።",
        },
        {
          label: "ክትትል እና አረጋግጥ",
          body: "የትእዛዝ ሂደትን ይከታተሉ፣ የኩሪየር ማሻሻያዎችን ይመልከቱ እና ኤስክሮ ከሚለቀቅ በፊት ዴሊቨሪን ያረጋግጡ።",
        },
      ],
      roles: [
        {
          title: "ለገዢዎች",
          body: "የታመኑ ሻጮችን ፈልጉ፣ አገልግሎቶችን ይጠይቁ፣ አድራሻዎችን ያስተዳድሩ እና የትእዛዝ ታሪክን በአንድ ቦታ ይመልከቱ።",
          cta: "ገበያውን ያስሱ",
        },
        {
          title: "ለነጋዴዎች",
          body: "በተረጋገጠ መግቢያ ላይ እምነት ሲገነቡ ዕቃ ክምችትን፣ ትእዛዞችን፣ ማስታወቂያዎችን እና አፈጻጸምን ያስተዳድሩ።",
          cta: "እንደ ነጋዴ ያመልክቱ",
        },
        {
          title: "ለአገልግሎት ሰጪዎች",
          body: "የአገልግሎት ዝርዝሮችን ያትሙ፣ የዋጋ ጥያቄዎችን ይቀበሉ እና ኤስክሮ ሲያስፈልግ ቅድሚያ የሚከፈልባቸውን ቦታዎች ያስተዳድሩ።",
          cta: "አገልግሎቶችን ይመልከቱ",
        },
      ],
    },
    ai: {
      kicker: "የAI የንግድ አጋዥ",
      title: "ስለ ምርቶች፣ አገልግሎቶች ወይም የሂደት መመሪያ በቋንቋዎ ይጠይቁ።",
      body: "ይህ አጋዥ እርስዎን ስለ ኤስክሮ፣ ዴሊቨሪ እና የገበያ አጠቃቀም በ Hugging Face ሞዴል ሊመራዎት ይችላል።",
      placeholder: "ስለ ኤስክሮ፣ የታመኑ ነጋዴዎች፣ ዴሊቨሪ ወይም ታማኝን መጠቀም ይጠይቁ...",
      submit: "AI ጠይቅ",
      loading: "እያሰበ ነው…",
      empty: "መልሱ እዚህ ይታያል።",
      poweredBy: "በ Hugging Face የተጎለበተ",
      missingConfig:
        "Hugging Face አልተዋቀረም። AI ምላሾችን ለማንቃት HUGGINGFACE_API_TOKEN ያክሉ።",
      genericError: "የAI አጋዡ አሁን መልስ ሊሰጥ አልቻለም። በኋላ ይሞክሩ።",
      suggestions: [
        "ኤስክሮ ከዴሊቨሪ በኋላ እንዴት ይለቀቃል?",
        "ከነጋዴ ልገዛ በፊት ምን ማረጋገጥ አለብኝ?",
        "ቅድሚያ የሚከፈሉ የአገልግሎት ቦታዎች እንዴት ይሰራሉ?",
      ],
    },
    authLayout: {
      backHome: "ወደ መነሻ ተመለስ",
      badge: "ዲጂታል ጠባቂ",
      title: "ወደ የታመነ አካባቢያዊ ንግድ ይግቡ።",
      body:
        "ታማኝ የተረጋገጠ የነጋዴ መግቢያን፣ በኤስክሮ የተጠበቁ የኤም-ፔሳ ክፍያዎችን እና የዴሊቨሪ ቅንጅትን በአንድ የኢትዮጵያ መድረክ ያቀርባል።",
      features: [
        {
          title: "የተረጋገጠ መግቢያ",
          body: "ነጋዴዎችና አገልግሎት ሰጪዎች በማሳየት በፊት ይፈቀዳሉ።",
        },
        {
          title: "ኤስክሮ-መጀመሪያ ክፍያ",
          body: "ግብይቱ በተሳካ ሁኔታ እስኪፈጸም ድረስ ገንዘቡ ይጠበቃል።",
        },
        {
          title: "የመድረኩ ተጠያቂነት",
          body: "የትእዛዝ ክትትል፣ ክርክር እና ሎጂስቲክስ በአንድ ስርዓት ውስጥ ይቀመጣሉ።",
        },
      ],
    },
    login: {
      badge: "የተጠበቀ የመለያ መግቢያ",
      title: "እንኳን ደህና መጡ",
      body: "ከገዢ፣ ነጋዴ፣ አገልግሎት ሰጪ፣ ኩሪየር ወይም አስተዳዳሪ መገለጫዎ ጋር የተያያዘውን ኢሜይል በመጠቀም ይግቡ።",
      email: "ኢሜይል",
      password: "የይለፍ ቃል",
      signIn: "ግባ",
      signingIn: "በመግባት ላይ…",
      noAccount: "መለያ የለዎትም?",
      createOne: "አንዱን ይፍጠሩ",
      resendHint: "ኢሜይሉ አልደረሰም? አድራሻው ትክክል ከሆነ ሌላ የማረጋገጫ አገናኝ ይላኩ።",
      resendEmail: "ለማረጋገጫ ኢሜይል",
      sending: "በመላክ ላይ…",
      resendConfirmation: "የማረጋገጫ ኢሜይል እንደገና ላክ",
    },
    signup: {
      badge: "የገዢ መግቢያ",
      title: "የታማኝ መለያዎን ይፍጠሩ",
      body: "የገዢ መለያዎች እዚህ ይጀምራሉ። የነጋዴ እና የአገልግሎት ሰጪ መግቢያ ከመድረኩ ውስጥ ከተፈቀደ በኋላ ይሰጣል።",
      fullName: "ሙሉ ስም",
      optional: "አማራጭ",
      email: "ኢሜይል",
      password: "የይለፍ ቃል",
      passwordHint: "ቢያንስ 6 ፊደላት (ከፍተኛው 128)።",
      createAccount: "መለያ ፍጠር",
      creating: "በመፍጠር ላይ…",
      alreadyHaveAccount: "መለያ አለዎት?",
      signIn: "ግባ",
    },
    demoHint: {
      summary: "የአካባቢ ዴሞ (የመመዝገቢያ ኢሜይል ይዝለል)",
      intro:
        "መመዝገብ በኢሜይል ገደብ ከተገጠመ ወይም የማረጋገጫ መልእክት ካልፈለጉ ዴሞ ተጠቃሚዎችን አንድ ጊዜ ያብቁ እና ከዚያ ይግቡ።",
      stepSeed:
        "ከፕሮጀክቱ ስር ሆነው npm run seed:demo ያሂዱ (በ .env.local ውስጥ SUPABASE_SERVICE_ROLE_KEY ያስፈልጋል).",
      stepLogin:
        "ከዚያ ከታች የተጠቀሰውን የገዢ ዴሞ መለያ በመጠቀም ይግቡ።",
      roles:
        "ሌሎች የሚና መለያዎች በ supabase/README.md ውስጥ ተዘርዝረዋል።",
    },
    products: {
      filterChip: "በምድብ፣ በዋጋ፣ በእምነት እና በርቀት ያጣሩ",
      title: "ከተረጋገጡ ኢትዮጵያዊ ነጋዴዎች የታመኑ አካባቢያዊ ምርቶችን ያግኙ።",
      description:
        "ንቁ ዝርዝሮችን ያስሱ፣ በበጀት ያጣሩ እና ከፈለጉ ?lat=&lng=&km= በመጨመር ቅርብ ሻጮችን ይቀድሙ።",
      catalogStatus: "የካታሎግ ሁኔታ",
      activeResults: "ለአሁኑ ማጣሪያ የተገኙ ውጤቶች",
      preferService: "አገልግሎት መያዝ ትመርጣለህ?",
      searchPlaceholder: "ምርቶችን ወይም ሻጮችን ፈልግ",
      minPlaceholder: "ዝቅተኛ ETB",
      maxPlaceholder: "ከፍተኛ ETB",
      sortPopular: "በጣም ታዋቂ",
      sortRating: "ከፍተኛ የእምነት ነጥብ",
      sortPriceAsc: "ዋጋ ከዝቅ ወደ ከፍ",
      sortPriceDesc: "ዋጋ ከከፍ ወደ ዝቅ",
      apply: "ተግብር",
      all: "ሁሉም",
      noResultsTitle: "ምንም ምርት ከእነዚህ ማጣሪያዎች ጋር አልተገኘም።",
      noResultsBody: "የዋጋ ክልሉን ያስተካክሉ፣ ሌላ ምድብ ይምረጡ ወይም በሰፊ ፍለጋ ይሞክሩ።",
      verified: "የተረጋገጠ",
      kmAway: "ኪሜ ርቀት",
      sold: "ተሽጧል",
      price: "ዋጋ",
      view: "ይመልከቱ",
    },
    services: {
      badge: "የተረጋገጠ የአገልግሎት ገበያ",
      title: "እምነት ግልጽ የሆነላቸውን የአገልግሎት ሰጪዎች ያግኙ።",
      description:
        "የአገልግሎት ፍለጋ ከተረጋገጡ ሰጪዎች፣ የዋጋ ጥያቄዎች እና ኤስክሮ ሲያስፈልግ ቅድሚያ የሚከፈል እንደ አንድ የታመነ ስርዓት ይሰራል።",
      listingsAvailable: "ያሉ ዝርዝሮች",
      publishService: "አገልግሎት አትም",
      allServices: "ሁሉም አገልግሎቶች",
      requestQuote: "ዋጋ ጠይቅ",
      prepaidEscrow: "ቅድሚያ ኤስክሮ አለ",
      viewService: "አገልግሎቱን ይመልከቱ",
      noCategoryTitle: "በዚህ ምድብ ውስጥ እስካሁን አገልግሎቶች የሉም።",
      noServicesTitle: "እስካሁን የተዘረዘሩ አገልግሎቶች የሉም።",
      noCategoryBody: "ሌላ ምድብ ይሞክሩ ወይም ሁሉንም አገልግሎቶች ያስሱ።",
      noServicesBody: "አቅራቢዎች ከአገልግሎት ዳሽቦርዳቸው ዝርዝሮችን ማተም ይችላሉ።",
      viewAllServices: "ሁሉንም አገልግሎቶች ይመልከቱ",
      trust: "እምነት",
    },
    categories: {
      badge: "በምድብ ያስሱ",
      title: "የአካባቢ ንግድ ሁሉም ክፍሎች ለፍለጋ ተደራጅተዋል።",
      description:
        "ለምርቶች የሚሆኑ ምድቦች ወይም በተመሳሳይ ኤስክሮ የተደገፈ እምነት ሞዴል የሚያገለግሉ ምድቦችን ይዝለሉ።",
      shopProducts: "ምርቶችን ግዛ",
      findServices: "አገልግሎቶችን ፈልግ",
      atAGlance: "በአጠቃላይ",
      productCategories: "የምርት ምድቦች",
      serviceCategories: "የአገልግሎት ምድቦች",
      productsKicker: "ምርቶች",
      productsTitle: "ከተረጋገጡ ነጋዴዎች የሚመጡ ዕቃዎች",
      viewAllProducts: "ሁሉንም ምርቶች ይመልከቱ",
      noProductCategories:
        "እስካሁን የምርት ምድቦች የሉም። supabase/seed.sql ያሂዱ ወይም በዳሽቦርድ ላይ ያክሉ።",
      servicesKicker: "አገልግሎቶች",
      servicesTitle: "የታመኑ የአካባቢ አቅራቢዎችን ያዙ",
      viewAllServices: "ሁሉንም አገልግሎቶች ይመልከቱ",
      noServiceCategories:
        "እስካሁን የአገልግሎት ምድቦች የሉም። ዳታን ያብቁ ወይም ለአቅራቢዎች ምድቦችን ያክሉ።",
    },
  },
  om: {
    common: {
      localeNames: {
        en: "English",
        am: "አማርኛ",
        om: "Afaan Oromoo",
      },
      themeNames: {
        dark: "Dukkanaa",
        light: "Ifaa",
      },
      switchLanguage: "Afaan jijjiiri",
      switchTheme: "Bifa jijjiiri",
      themeButtonLabel: {
        dark: "Gara ifaatti jijjiiri",
        light: "Gara dukkanaatti jijjiiri",
      },
      appName: "ታማኝ",
      appTagline: "Daldala naannoo irraa mirkanaa'e",
      aiBadge: "Gargaaraa AI",
    },
    header: {
      nav: {
        home: "Mana",
        marketplace: "Gabaa",
        services: "Tajaajiloota",
        categories: "Ramaddiiwwan",
      },
      escrowProtected: "Escrown eegame",
      trustedInEthiopia: "Itoophiyaa keessatti amanamaa",
      signedIn: "Seenteetta",
      signIn: "Seeni",
      getStarted: "Jalqabi",
      signOut: "Ba'i",
      dashboardLabels: {
        buyer: "Wiirtuu bitootaa",
        merchant: "Wiirtuu daldalaa",
        serviceProvider: "Wiirtuu tajaajilaa",
        courier: "Wiirtuu courier",
        admin: "Wiirtuu bulchaa",
      },
      openMenu: "Menu bani",
      closeMenu: "Menu cufi",
      navigate: "Daawwadhu",
    },
    home: {
      heroChip: "Daldala naannoo Itoophiyaaf eegduu dijitaalaa",
      title:
        "Daldala naannoo amanamaa, gurgurtoota mirkanaa'an, escrow M-Pesa fi geejjiba waliin ijaarame.",
      description:
        "ታማኝ bitoota, daldaltoota fi kennitoota tajaajilaa Itoophiyaa walitti hidha; amanamummaa, kaffaltii eegamaa fi loojistikii irratti xiyyeeffatee.",
      shopProducts: "Meeshaa bita",
      bookServices: "Tajaajila qabsiifadhu",
      metrics: {
        trustModel: "Sirna amanamummaa",
        payments: "Kaffaltii",
        operations: "Hojiiwwan",
        trustModelValue: "Galmee bulchaan mirkaneesse",
        paymentsValue: "M-Pesa escrow dura",
        operationsValue: "Gabaa + geejjiba + wal morkii",
      },
      platformPromiseKicker: "Waadaa platformii",
      platformPromiseTitle: "ታማኝ amanamummaa naannoo gara loojikii oomishaatti geeddara.",
      platformPromiseBody:
        "Kaayyoon platformii kun gabaa, kaffaltii eegamaa fi geejjiba to'atame bifa walqabateen dhiheessuu dha.",
      hyperlocalDiscovery: "Daldaltoota fi naannolee tajaajilaa siif dhihoo",
      buyerProtection: "Eegumsa bitaa irraa kaasee hanga geejjibaa",
      trustPillars: [
        {
          title: "Daldaltoota mirkanaa'an qofa",
          body: "ታማኝ daldaltoota fi kennitoota tajaajilaa bulchaan mirkaneesse irratti ijaarameera.",
        },
        {
          title: "Escrow M-Pesa",
          body: "Bitaan dura gara escrowtti kafala. Qarshiin kan gadi lakkifamu erga geejjibni yookiin hojii tajaajilaa milkaa'ee booda qofa.",
        },
        {
          title: "Geejjiba platformiin bulchu",
          body: "Loojistikii platformii keessatti hafee bitaan adeemsa ajaja isaa hanga geejjibaa hordofuu danda'a.",
        },
      ],
      howItWorksKicker: "Akkaataa hojiirra oolu",
      howItWorksTitle: "Daldalli amanamaan salphaa ta'uu qaba.",
      howItWorksBody:
        "Pirojektiin kun soba hir'isuuf, daldala naannoo dijitaalaan mul'isuuf fi bitootaaf karaa ifaa kennuuf hojjetame.",
      steps: [
        {
          label: "Barbaadi",
          body: "Meeshaalee fi tajaajiloota siif dhihoo mirkaneessa daldalaa, qabxii amanamummaa fi odeeffannoo geejjibaan ilaali.",
        },
        {
          label: "Nageenyaan kaffali",
          body: "M-Pesa escrow fayyadami; gurgurtaan kan kafalamu yeroo hojii guutame qofa.",
        },
        {
          label: "Hordofi fi mirkaneessi",
          body: "Adeemsa ajajaa hordofi, haaromsa courier ilaali, geejjiba erga mirkaneessite booda escrow gadi lakkisa.",
        },
      ],
      roles: [
        {
          title: "Bitootaaf",
          body: "Gurgurtoota amanamoo barbaadi, tajaajila gaafadhu, teessoo geejjibaa bulchi, seenaa ajajaa ilaali.",
          cta: "Gabaa daawwadhu",
        },
        {
          title: "Daldaltootaaf",
          body: "Kuusaa, ajajaa, beeksisa fi bu'aa daldalaa amanamummaa waliin bulchi.",
          cta: "Akka daldalaatti iyyadhu",
        },
        {
          title: "Kennitoota tajaajilaaf",
          body: "Tarree tajaajilaa maxxansi, gaaffii gatii fudhadhu, bakka prepaid escrow barbaachisu keessatti hojii qabsiifadhu.",
          cta: "Tajaajiloota daawwadhu",
        },
      ],
    },
    ai: {
      kicker: "Gargaaraa daldalaa AI",
      title: "Waa'ee meeshaa, tajaajilaa ykn adeemsa hojii afaan keetiin gaafadhu.",
      body: "Gargaaraan kun escrow, geejjiba fi itti fayyadama gabaa irratti modelii Hugging Face fayyadamuun si deeggaruu danda'a.",
      placeholder: "Waa'ee escrow, daldaltoota amanamoo, geejjibaa ykn akkaataa itti ታማኝ itti fayyadamtu gaafadhu...",
      submit: "AI gaafadhu",
      loading: "Yaadaa jira…",
      empty: "Deebiin asitti mul'ata.",
      poweredBy: "Hugging Face'n kan deeggarame",
      missingConfig:
        "Hugging Face hin qindaa'in. AI hojjachiisuuf HUGGINGFACE_API_TOKEN dabali.",
      genericError: "Gargaaraan AI amma deebii kennuu hin dandeenye. Irra deebi'ii yaali.",
      suggestions: [
        "Escrown geejjiba booda akkamitti gadi lakkifama?",
        "Osoo hin bitin dura daldalaa irraa maal mirkaneeffachuu qaba?",
        "Booking tajaajilaa prepaid akkamitti hojjeta?",
      ],
    },
    authLayout: {
      backHome: "Gara manatti deebi'i",
      badge: "Eegduu dijitaalaa",
      title: "Daldala naannoo amanamaatti seeni.",
      body:
        "ታማኝ galmee daldalaa mirkanaa'e, kaffaltii M-Pesa escrow fi qindoomina geejjibaa platformii tokko keessatti walitti qaba.",
      features: [
        {
          title: "Galmee mirkanaa'e",
          body: "Daldaltoonni fi kennitoonni tajaajilaa dura mirkaneeffamu.",
        },
        {
          title: "Kaffaltii escrow dura",
          body: "Qarshiin hanga hojii guutamutti eegama.",
        },
        {
          title: "Itti gaafatamummaa platformii",
          body: "Hordoffiin ajajaa, wal morkii fi loojistikiin sirna tokko keessatti hafan.",
        },
      ],
    },
    login: {
      badge: "Seensa akkaawuntii eegamaa",
      title: "Baga nagaan dhuftan",
      body:
        "Imeelii profile bitaa, daldalaa, kennitoota tajaajilaa, courier yookiin admin waliin walqabate fayyadamiitii seeni.",
      email: "Imeelii",
      password: "Jecha iccitii",
      signIn: "Seeni",
      signingIn: "Seenaa jira…",
      noAccount: "Akkaawuntiin hin jiruu?",
      createOne: "Uumi",
      resendHint:
        "Imeeliin si hin geenye? Teessoon sirrii yoo ta'e liinkii mirkaneessaa irra deebi'ii ergi.",
      resendEmail: "Imeelii mirkaneessaa",
      sending: "Ergaa jira…",
      resendConfirmation: "Imeelii mirkaneessaa irra deebi'ii ergi",
    },
    signup: {
      badge: "Galmee bitootaa",
      title: "Akkaawuntii ታማኝ kee uumi",
      body:
        "Akkaawuntiin bitootaa as irraa jalqaba. Seensi daldalaa fi tajaajilaa erga platformiin eeyyamee booda kennama.",
      fullName: "Maqaa guutuu",
      optional: "filannoo",
      email: "Imeelii",
      password: "Jecha iccitii",
      passwordHint: "Qubee 6 ol (hanga 128).",
      createAccount: "Akkaawuntii uumi",
      creating: "Uumaa jira…",
      alreadyHaveAccount: "Akkaawuntiin siif jiraa?",
      signIn: "Seeni",
    },
    demoHint: {
      summary: "Demo naannoo keessaa",
      intro:
        "Galmeen daangaa imeelii yoo tuqe yookiin ergaa mirkaneessaa yoo hin barbaanne, demo users yeroo tokko qopheessiitii achii seeni.",
      stepSeed:
        "Root project irraa npm run seed:demo jedhu fiigi (SUPABASE_SERVICE_ROLE_KEY .env.local keessatti barbaachisa).",
      stepLogin:
        "Achii akkaawuntii demo buyer armaan gadiitti agarsiifameen seeni.",
      roles:
        "Akaawuntota gahee biroo supabase/README.md keessatti argita.",
    },
    products: {
      filterChip: "Ramaddii, gatii, amanamummaa fi fageenyaan filadhu",
      title: "Meeshaalee naannoo amanamoo daldaltoota Itoophiyaa mirkanaa'an irraa argadhu.",
      description:
        "Tarreewwan hojii irra jiran ilaali, baajata keetiin filadhu, yoo barbaadde ?lat=&lng=&km= dabaluun daldaltoota siif dhihoo filadhu.",
      catalogStatus: "Haala katalogii",
      activeResults: "bu'aa tarree filannoo amma jiraniif",
      preferService: "Tajaajila qabsiifachuu filattaa?",
      searchPlaceholder: "Meeshaa yookiin gurgurtaa barbaadi",
      minPlaceholder: "ETB gadi aanaa",
      maxPlaceholder: "ETB ol aanaa",
      sortPopular: "Baay'ee barbaadame",
      sortRating: "Qabxii amanamummaa olaanaa",
      sortPriceAsc: "Gatii gadi irraa gara olitti",
      sortPriceDesc: "Gatii ol irraa gara gaditti",
      apply: "Hojii irra oolchi",
      all: "Hunda",
      noResultsTitle: "Meeshaan filtarii kanaan wal fakkaatu hin argamne.",
      noResultsBody: "Daangaa gatii sirreessi, ramaddii biraa filadhu ykn barbaacha bal'aa yaali.",
      verified: "Mirkanaa'e",
      kmAway: "km fagoo",
      sold: "gurgurame",
      price: "Gatii",
      view: "Ilaali",
    },
    services: {
      badge: "Gabaa tajaajilaa mirkanaa'e",
      title: "Kennitoota tajaajilaa amanamummaa mul'atan argadhu.",
      description:
        "Barbaachi tajaajilaa modelii amanamaa wal fakkaataa hordofa: kennitoota mirkanaa'an, gaaffii gatii fi booking prepaid yeroo escrow barbaachisu.",
      listingsAvailable: "Tarreewwan jiran",
      publishService: "Tajaajila maxxansi",
      allServices: "Tajaajiloota hunda",
      requestQuote: "Gatii gaafadhu",
      prepaidEscrow: "Prepaid escrow jira",
      viewService: "Tajaajila ilaali",
      noCategoryTitle: "Ramaddii kana keessatti tajaajilli hin jiru.",
      noServicesTitle: "Tajaajilli tarreeffame hin jiru.",
      noCategoryBody: "Ramaddii biraa yaali yookiin tajaajiloota hunda ilaali.",
      noServicesBody: "Kennitoonni dashboard tajaajilaa isaanii irraa tarree maxxansuu danda'u.",
      viewAllServices: "Tajaajiloota hunda ilaali",
      trust: "Amanamummaa",
    },
    categories: {
      badge: "Ramaddiitti daawwadhu",
      title: "Kutaan daldala naannoo hundi barbaachaaf qindaa'eera.",
      description:
        "Meeshaalee qaamaaaf ramaddiiwwan seeni, yookiin tajaajiloota booking fi escrow amanamummaa waliin argadhu.",
      shopProducts: "Meeshaa bita",
      findServices: "Tajaajila barbaadi",
      atAGlance: "Ilaalcha waliigalaa",
      productCategories: "Ramaddiiwwan meeshaa",
      serviceCategories: "Ramaddiiwwan tajaajilaa",
      productsKicker: "Meeshaalee",
      productsTitle: "Meeshaalee daldaltoota mirkanaa'an irraa",
      viewAllProducts: "Meeshaalee hunda ilaali",
      noProductCategories:
        "Ramaddiin meeshaa hin jiru. supabase/seed.sql fiigi yookiin dashboard irratti dabaluu.",
      servicesKicker: "Tajaajiloota",
      servicesTitle: "Kennitoota naannoo amanamoo qabsiifadhu",
      viewAllServices: "Tajaajiloota hunda ilaali",
      noServiceCategories:
        "Ramaddiin tajaajilaa hin jiru. Data seedi godhi yookiin ramaddiiwwan dabaluu.",
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionary[locale];
}
