import { createClient } from "@supabase/supabase-js";

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const demoPassword = process.env.DEMO_USER_PASSWORD?.trim() || "TamagnDemo123!";

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DEMO_USERS = {
  admin: {
    email: "admin@tamagn.demo",
    fullName: "Tamagn Admin",
    role: "admin",
    phone: "251911000001",
  },
  buyer: {
    email: "buyer@tamagn.demo",
    fullName: "Tamagn Buyer",
    role: "buyer",
    phone: "251911000002",
  },
  merchant: {
    email: "merchant@tamagn.demo",
    fullName: "Tamagn Merchant",
    role: "merchant",
    phone: "251911000003",
  },
  courier: {
    email: "courier@tamagn.demo",
    fullName: "Tamagn Courier",
    role: "courier",
    phone: "251911000004",
  },
  provider: {
    email: "provider@tamagn.demo",
    fullName: "Tamagn Provider",
    role: "service_provider",
    phone: "251911000005",
  },
};

const IDS = {
  address: "6f5352b8-13ec-4fb1-b1be-c0650d218923",
  merchantProductA: "ed74720a-90e2-45a5-aa9a-83b61e9565bc",
  merchantProductB: "03ce6760-b7f0-4dde-9525-a91f908b9068",
  serviceListing: "1be2f542-e5f1-46c7-a30c-a76c2ae0f7ba",
  serviceArea: "bdbece19-da49-454f-a30d-fd29f40fdca1",
  serviceRequest: "f68a4efd-c975-4461-a8ca-6b687840b02f",
  orders: {
    awaitingPayment: "a7d30fc2-aadb-48a0-b8db-d1cf8fc6278a",
    paidEscrow: "10e068ae-5cce-4b7a-b74e-c5b651bf4607",
    pickupScheduled: "f9426fe9-c808-45e7-8f84-b2f6f82a4e6c",
    delivered: "116f2b53-380f-4bdd-9424-cb50f5e6f053",
    completed: "4b2d17f3-2d3b-4052-87f0-d79b98d4c0bc",
    servicePaidEscrow: "566c7d54-6ea0-4ee9-98e0-e7a368ec9f7e",
  },
  assignments: {
    pickupScheduled: "99353c7a-d087-41f7-a366-fbd1d6d82597",
    delivered: "03c4ed2a-223f-4bb5-ab6d-6f8dd21890f0",
    completed: "f3b04dc6-fbc5-4110-8dd2-c30b8d7d69eb",
  },
  payments: {
    awaitingPayment: "22d59cc8-12c4-440c-b8ee-b22e9ad7ccca",
    paidEscrow: "50c3f3de-3b22-48a5-a85e-1ea0202b154a",
    pickupScheduled: "73162727-99f2-42af-b909-6dd7ce0afd32",
    delivered: "59f4c6d0-ec7d-4c4f-abec-bdd1b3e7ce9f",
    completed: "4930c0f5-8361-472b-9f3f-7b13d3b413ff",
    servicePaidEscrow: "71f7a499-0e53-4636-84c4-fe3304e8c090",
  },
  review: "87db35f6-66d1-405f-92dd-f459057a56f3",
};

const PRODUCT_CATEGORIES = [
  {
    name: "Electronics & accessories",
    slug: "electronics",
    kind: "product",
  },
];

const SERVICE_CATEGORIES = [
  {
    name: "Home repair & handyman",
    slug: "home-repair-handyman",
    kind: "service",
  },
];

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function platformFee(subtotal) {
  return Math.round(subtotal * 0.03 * 100) / 100;
}

function isoHoursAgo(hoursAgo) {
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
}

function expectData(result, context) {
  if (result.error) throw new Error(`${context}: ${result.error.message}`);
  return result.data;
}

async function listAllUsers() {
  const users = [];
  let page = 1;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    users.push(...(data.users ?? []));
    if (!data.nextPage) break;
    page = data.nextPage;
  }

  return users;
}

async function ensureAuthUser(definition, existingUsersByEmail) {
  let user = existingUsersByEmail.get(definition.email);

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: definition.email,
      password: demoPassword,
      email_confirm: true,
      user_metadata: { full_name: definition.fullName },
    });
    if (error) throw error;
    user = data.user;
  } else {
    const { data, error } = await admin.auth.admin.updateUserById(user.id, {
      password: demoPassword,
      email_confirm: true,
      user_metadata: { full_name: definition.fullName },
    });
    if (error) throw error;
    user = data.user;
  }

  if (!user) {
    throw new Error(`Failed to resolve auth user for ${definition.email}`);
  }

  return user;
}

async function ensureMerchant(ownerId) {
  const existing = expectData(
    await admin
      .from("merchants")
      .select("id")
      .eq("owner_id", ownerId)
      .maybeSingle(),
    "find merchant"
  );

  const merchantId =
    existing?.id || "2b09a24c-1dcb-47ae-b40c-a8b20f255706";

  expectData(
    await admin.from("merchants").upsert(
      {
        id: merchantId,
        owner_id: ownerId,
        business_name: "Addis Device Market",
        description: "Fast local electronics delivery with escrow-protected checkout.",
        location_label: "Bole, Addis Ababa",
        latitude: 8.9806,
        longitude: 38.7578,
        trust_score: "4.80",
        verification_badge: true,
        is_active: true,
      },
      { onConflict: "id" }
    ),
    "upsert merchant"
  );

  return merchantId;
}

async function ensureServiceProvider(ownerId) {
  const existing = expectData(
    await admin
      .from("service_providers")
      .select("id")
      .eq("owner_id", ownerId)
      .maybeSingle(),
    "find service provider"
  );

  const serviceProviderId =
    existing?.id || "bc8ce961-df7f-44fd-8bb9-ebf24962e07d";

  expectData(
    await admin.from("service_providers").upsert(
      {
        id: serviceProviderId,
        owner_id: ownerId,
        business_name: "Bole Home Fix",
        bio: "Prepaid handyman and appliance repair for central Addis.",
        latitude: 8.9881,
        longitude: 38.7902,
        trust_score: "4.60",
        is_active: true,
      },
      { onConflict: "id" }
    ),
    "upsert service provider"
  );

  return serviceProviderId;
}

async function ensureCourier(userId) {
  const existing = expectData(
    await admin.from("couriers").select("id").eq("user_id", userId).maybeSingle(),
    "find courier"
  );

  const courierId = existing?.id || "0cf70911-263f-43e5-a656-bb0084f2495f";

  expectData(
    await admin.from("couriers").upsert(
      {
        id: courierId,
        user_id: userId,
        vehicle_info: "Motorbike",
        is_active: true,
      },
      { onConflict: "id" }
    ),
    "upsert courier"
  );

  return courierId;
}

async function ensureCategories() {
  expectData(
    await admin.from("categories").upsert([...PRODUCT_CATEGORIES, ...SERVICE_CATEGORIES], {
      onConflict: "slug",
    }),
    "upsert categories"
  );

  const categories = expectData(
    await admin
      .from("categories")
      .select("id, slug")
      .in("slug", [...PRODUCT_CATEGORIES, ...SERVICE_CATEGORIES].map((entry) => entry.slug)),
    "select categories"
  );

  return new Map((categories ?? []).map((row) => [row.slug, row.id]));
}

async function resetDemoChildren(orderIds) {
  expectData(
    await admin.from("reviews").delete().in("order_id", orderIds),
    "delete demo reviews"
  );
  expectData(
    await admin.from("disputes").delete().in("order_id", orderIds),
    "delete demo disputes"
  );
  expectData(
    await admin.from("escrow_events").delete().in("order_id", orderIds),
    "delete demo escrow events"
  );
  expectData(
    await admin.from("payments").delete().in("order_id", orderIds),
    "delete demo payments"
  );
  expectData(
    await admin
      .from("order_status_history")
      .delete()
      .in("order_id", orderIds),
    "delete demo order status history"
  );
  expectData(
    await admin.from("order_items").delete().in("order_id", orderIds),
    "delete demo order items"
  );
  expectData(
    await admin
      .from("delivery_assignments")
      .delete()
      .in("order_id", [
        IDS.orders.pickupScheduled,
        IDS.orders.delivered,
        IDS.orders.completed,
      ]),
    "delete demo delivery assignments"
  );
  expectData(
    await admin.from("service_requests").delete().eq("id", IDS.serviceRequest),
    "delete demo service requests"
  );
}

async function main() {
  const existingUsers = await listAllUsers();
  const existingUsersByEmail = new Map(
    existingUsers
      .filter((user) => typeof user.email === "string")
      .map((user) => [user.email.toLowerCase(), user])
  );

  const users = {};
  for (const [key, definition] of Object.entries(DEMO_USERS)) {
    users[key] = await ensureAuthUser(
      definition,
      existingUsersByEmail
    );
  }

  const merchantId = await ensureMerchant(users.merchant.id);
  const serviceProviderId = await ensureServiceProvider(users.provider.id);
  const courierId = await ensureCourier(users.courier.id);
  const categoryIds = await ensureCategories();
  const electronicsCategoryId = categoryIds.get("electronics");
  const repairCategoryId = categoryIds.get("home-repair-handyman");

  if (!electronicsCategoryId || !repairCategoryId) {
    throw new Error("Required demo categories are missing");
  }

  expectData(
    await admin.from("profiles").upsert(
      [
        {
          id: users.admin.id,
          role: "admin",
          full_name: DEMO_USERS.admin.fullName,
          phone: DEMO_USERS.admin.phone,
          mpesa_msisdn: DEMO_USERS.admin.phone,
        },
        {
          id: users.buyer.id,
          role: "buyer",
          full_name: DEMO_USERS.buyer.fullName,
          phone: DEMO_USERS.buyer.phone,
          mpesa_msisdn: DEMO_USERS.buyer.phone,
        },
        {
          id: users.merchant.id,
          role: "merchant",
          full_name: DEMO_USERS.merchant.fullName,
          phone: DEMO_USERS.merchant.phone,
          mpesa_msisdn: DEMO_USERS.merchant.phone,
          merchant_id: merchantId,
        },
        {
          id: users.courier.id,
          role: "courier",
          full_name: DEMO_USERS.courier.fullName,
          phone: DEMO_USERS.courier.phone,
          mpesa_msisdn: DEMO_USERS.courier.phone,
        },
        {
          id: users.provider.id,
          role: "service_provider",
          full_name: DEMO_USERS.provider.fullName,
          phone: DEMO_USERS.provider.phone,
          mpesa_msisdn: DEMO_USERS.provider.phone,
          service_provider_id: serviceProviderId,
        },
      ],
      { onConflict: "id" }
    ),
    "upsert profiles"
  );

  expectData(
    await admin.from("addresses").upsert(
      {
        id: IDS.address,
        user_id: users.buyer.id,
        label: "Home",
        line1: "Bole Road",
        city: "Addis Ababa",
        latitude: 8.9853,
        longitude: 38.7578,
        is_default: true,
      },
      { onConflict: "id" }
    ),
    "upsert address"
  );

  expectData(
    await admin.from("products").upsert(
      [
        {
          id: IDS.merchantProductA,
          merchant_id: merchantId,
          category_id: electronicsCategoryId,
          title: "Demo Bluetooth Speaker",
          description: "Demo product used across payment and fulfillment states.",
          price: "4200.00",
          stock: 30,
          status: "active",
          sold_count: 8,
        },
        {
          id: IDS.merchantProductB,
          merchant_id: merchantId,
          category_id: electronicsCategoryId,
          title: "Demo Power Bank",
          description: "Second product for list and order demos.",
          price: "1800.00",
          stock: 45,
          status: "active",
          sold_count: 11,
        },
      ],
      { onConflict: "id" }
    ),
    "upsert products"
  );

  expectData(
    await admin.from("service_listings").upsert(
      {
        id: IDS.serviceListing,
        service_provider_id: serviceProviderId,
        category_id: repairCategoryId,
        title: "Demo Appliance Repair Visit",
        description: "Prepaid repair visit for demo service-order workflow.",
        price_min: "950.00",
        price_max: "1500.00",
        prepaid_escrow: true,
      },
      { onConflict: "id" }
    ),
    "upsert service listing"
  );

  expectData(
    await admin.from("service_areas").upsert(
      {
        id: IDS.serviceArea,
        service_listing_id: IDS.serviceListing,
        area_label: "Bole and Kazanchis",
      },
      { onConflict: "id" }
    ),
    "upsert service area"
  );

  const deliverySnapshot = {
    label: "Home",
    line1: "Bole Road",
    city: "Addis Ababa",
    latitude: 8.9853,
    longitude: 38.7578,
  };

  const orderRows = [
    {
      id: IDS.orders.awaitingPayment,
      buyer_id: users.buyer.id,
      merchant_id: merchantId,
      order_type: "product",
      status: "awaiting_payment",
      subtotal: "4200.00",
      delivery_fee: "120.00",
      platform_fee: String(platformFee(4200)),
      total: "4446.00",
      delivery_snapshot: deliverySnapshot,
      mpesa_checkout_request_id: "demo-awaiting-payment-checkout",
      escrow_released: false,
    },
    {
      id: IDS.orders.paidEscrow,
      buyer_id: users.buyer.id,
      merchant_id: merchantId,
      order_type: "product",
      status: "paid_escrow",
      subtotal: "1800.00",
      delivery_fee: "100.00",
      platform_fee: String(platformFee(1800)),
      total: "1954.00",
      delivery_snapshot: deliverySnapshot,
      mpesa_checkout_request_id: "demo-paid-escrow-checkout",
      escrow_released: false,
    },
    {
      id: IDS.orders.pickupScheduled,
      buyer_id: users.buyer.id,
      merchant_id: merchantId,
      order_type: "product",
      status: "pickup_scheduled",
      subtotal: "4200.00",
      delivery_fee: "120.00",
      platform_fee: String(platformFee(4200)),
      total: "4446.00",
      delivery_snapshot: deliverySnapshot,
      mpesa_checkout_request_id: "demo-pickup-checkout",
      escrow_released: false,
    },
    {
      id: IDS.orders.delivered,
      buyer_id: users.buyer.id,
      merchant_id: merchantId,
      order_type: "product",
      status: "delivered",
      subtotal: "1800.00",
      delivery_fee: "100.00",
      platform_fee: String(platformFee(1800)),
      total: "1954.00",
      delivery_snapshot: deliverySnapshot,
      mpesa_checkout_request_id: "demo-delivered-checkout",
      escrow_released: false,
    },
    {
      id: IDS.orders.completed,
      buyer_id: users.buyer.id,
      merchant_id: merchantId,
      order_type: "product",
      status: "completed",
      subtotal: "4200.00",
      delivery_fee: "120.00",
      platform_fee: String(platformFee(4200)),
      total: "4446.00",
      delivery_snapshot: deliverySnapshot,
      mpesa_checkout_request_id: "demo-completed-checkout",
      escrow_released: true,
      buyer_confirmed_at: isoHoursAgo(12),
    },
    {
      id: IDS.orders.servicePaidEscrow,
      buyer_id: users.buyer.id,
      merchant_id: null,
      service_listing_id: IDS.serviceListing,
      order_type: "service",
      status: "paid_escrow",
      subtotal: "950.00",
      delivery_fee: "0.00",
      platform_fee: String(platformFee(950)),
      total: "978.50",
      delivery_snapshot: { service_title: "Demo Appliance Repair Visit" },
      mpesa_checkout_request_id: "demo-service-checkout",
      escrow_released: false,
    },
  ];

  expectData(
    await admin.from("orders").upsert(orderRows, { onConflict: "id" }),
    "upsert demo orders"
  );

  await resetDemoChildren(Object.values(IDS.orders));

  expectData(
    await admin.from("order_items").insert([
      {
        order_id: IDS.orders.awaitingPayment,
        product_id: IDS.merchantProductA,
        quantity: 1,
        unit_price: "4200.00",
      },
      {
        order_id: IDS.orders.paidEscrow,
        product_id: IDS.merchantProductB,
        quantity: 1,
        unit_price: "1800.00",
      },
      {
        order_id: IDS.orders.pickupScheduled,
        product_id: IDS.merchantProductA,
        quantity: 1,
        unit_price: "4200.00",
      },
      {
        order_id: IDS.orders.delivered,
        product_id: IDS.merchantProductB,
        quantity: 1,
        unit_price: "1800.00",
      },
      {
        order_id: IDS.orders.completed,
        product_id: IDS.merchantProductA,
        quantity: 1,
        unit_price: "4200.00",
      },
    ]),
    "insert demo order items"
  );

  expectData(
    await admin.from("order_status_history").insert([
      {
        order_id: IDS.orders.awaitingPayment,
        status: "awaiting_payment",
        note: "Demo checkout created",
        created_by: users.buyer.id,
        created_at: isoHoursAgo(10),
      },
      {
        order_id: IDS.orders.paidEscrow,
        status: "awaiting_payment",
        note: "Checkout started",
        created_by: users.buyer.id,
        created_at: isoHoursAgo(18),
      },
      {
        order_id: IDS.orders.paidEscrow,
        status: "paid_escrow",
        note: "M-Pesa payment confirmed (escrow)",
        created_at: isoHoursAgo(17),
      },
      {
        order_id: IDS.orders.pickupScheduled,
        status: "awaiting_payment",
        note: "Checkout started",
        created_by: users.buyer.id,
        created_at: isoHoursAgo(30),
      },
      {
        order_id: IDS.orders.pickupScheduled,
        status: "paid_escrow",
        note: "M-Pesa payment confirmed (escrow)",
        created_at: isoHoursAgo(29),
      },
      {
        order_id: IDS.orders.pickupScheduled,
        status: "merchant_confirmed",
        note: "Merchant confirmed order",
        created_by: users.merchant.id,
        created_at: isoHoursAgo(28),
      },
      {
        order_id: IDS.orders.pickupScheduled,
        status: "pickup_scheduled",
        note: "Courier assigned",
        created_at: isoHoursAgo(27),
      },
      {
        order_id: IDS.orders.delivered,
        status: "awaiting_payment",
        note: "Checkout started",
        created_by: users.buyer.id,
        created_at: isoHoursAgo(42),
      },
      {
        order_id: IDS.orders.delivered,
        status: "paid_escrow",
        note: "M-Pesa payment confirmed (escrow)",
        created_at: isoHoursAgo(41),
      },
      {
        order_id: IDS.orders.delivered,
        status: "merchant_confirmed",
        note: "Merchant confirmed order",
        created_by: users.merchant.id,
        created_at: isoHoursAgo(40),
      },
      {
        order_id: IDS.orders.delivered,
        status: "pickup_scheduled",
        note: "Courier assigned",
        created_at: isoHoursAgo(39),
      },
      {
        order_id: IDS.orders.delivered,
        status: "collected",
        note: "Order collected for delivery",
        created_by: users.merchant.id,
        created_at: isoHoursAgo(38),
      },
      {
        order_id: IDS.orders.delivered,
        status: "in_transit",
        note: "Courier: in_transit",
        created_by: users.courier.id,
        created_at: isoHoursAgo(37),
      },
      {
        order_id: IDS.orders.delivered,
        status: "delivered",
        note: "Courier: delivered",
        created_by: users.courier.id,
        created_at: isoHoursAgo(36),
      },
      {
        order_id: IDS.orders.completed,
        status: "awaiting_payment",
        note: "Checkout started",
        created_by: users.buyer.id,
        created_at: isoHoursAgo(58),
      },
      {
        order_id: IDS.orders.completed,
        status: "paid_escrow",
        note: "M-Pesa payment confirmed (escrow)",
        created_at: isoHoursAgo(57),
      },
      {
        order_id: IDS.orders.completed,
        status: "merchant_confirmed",
        note: "Merchant confirmed order",
        created_by: users.merchant.id,
        created_at: isoHoursAgo(56),
      },
      {
        order_id: IDS.orders.completed,
        status: "pickup_scheduled",
        note: "Courier assigned",
        created_at: isoHoursAgo(55),
      },
      {
        order_id: IDS.orders.completed,
        status: "collected",
        note: "Order collected for delivery",
        created_by: users.merchant.id,
        created_at: isoHoursAgo(54),
      },
      {
        order_id: IDS.orders.completed,
        status: "in_transit",
        note: "Courier: in_transit",
        created_by: users.courier.id,
        created_at: isoHoursAgo(53),
      },
      {
        order_id: IDS.orders.completed,
        status: "delivered",
        note: "Courier: delivered",
        created_by: users.courier.id,
        created_at: isoHoursAgo(52),
      },
      {
        order_id: IDS.orders.completed,
        status: "completed",
        note: "Buyer confirmed receipt",
        created_by: users.buyer.id,
        created_at: isoHoursAgo(51),
      },
      {
        order_id: IDS.orders.servicePaidEscrow,
        status: "awaiting_payment",
        note: "Prepaid service checkout",
        created_by: users.buyer.id,
        created_at: isoHoursAgo(16),
      },
      {
        order_id: IDS.orders.servicePaidEscrow,
        status: "paid_escrow",
        note: "M-Pesa payment confirmed (escrow)",
        created_at: isoHoursAgo(15),
      },
    ]),
    "insert demo order history"
  );

  expectData(
    await admin.from("payments").insert([
      {
        id: IDS.payments.awaitingPayment,
        order_id: IDS.orders.awaitingPayment,
        amount: "4446.00",
        provider: "mpesa",
        mpesa_checkout_request_id: "demo-awaiting-payment-checkout",
        status: "pending",
      },
      {
        id: IDS.payments.paidEscrow,
        order_id: IDS.orders.paidEscrow,
        amount: "1954.00",
        provider: "mpesa",
        mpesa_checkout_request_id: "demo-paid-escrow-checkout",
        mpesa_receipt: "DEMOESCROW001",
        status: "completed",
      },
      {
        id: IDS.payments.pickupScheduled,
        order_id: IDS.orders.pickupScheduled,
        amount: "4446.00",
        provider: "mpesa",
        mpesa_checkout_request_id: "demo-pickup-checkout",
        mpesa_receipt: "DEMOPICKUP001",
        status: "completed",
      },
      {
        id: IDS.payments.delivered,
        order_id: IDS.orders.delivered,
        amount: "1954.00",
        provider: "mpesa",
        mpesa_checkout_request_id: "demo-delivered-checkout",
        mpesa_receipt: "DEMODELIVERY001",
        status: "completed",
      },
      {
        id: IDS.payments.completed,
        order_id: IDS.orders.completed,
        amount: "4446.00",
        provider: "mpesa",
        mpesa_checkout_request_id: "demo-completed-checkout",
        mpesa_receipt: "DEMOCOMPLETE001",
        status: "completed",
      },
      {
        id: IDS.payments.servicePaidEscrow,
        order_id: IDS.orders.servicePaidEscrow,
        amount: "978.50",
        provider: "mpesa",
        mpesa_checkout_request_id: "demo-service-checkout",
        mpesa_receipt: "DEMOSERVICE001",
        status: "completed",
      },
    ]),
    "insert demo payments"
  );

  expectData(
    await admin.from("escrow_events").insert([
      {
        order_id: IDS.orders.paidEscrow,
        event_type: "funds_in_escrow",
        meta: { receipt: "DEMOESCROW001" },
      },
      {
        order_id: IDS.orders.pickupScheduled,
        event_type: "funds_in_escrow",
        meta: { receipt: "DEMOPICKUP001" },
      },
      {
        order_id: IDS.orders.delivered,
        event_type: "funds_in_escrow",
        meta: { receipt: "DEMODELIVERY001" },
      },
      {
        order_id: IDS.orders.completed,
        event_type: "funds_in_escrow",
        meta: { receipt: "DEMOCOMPLETE001" },
      },
      {
        order_id: IDS.orders.completed,
        event_type: "released_to_merchant",
        meta: { auto: false, demo: true },
      },
      {
        order_id: IDS.orders.servicePaidEscrow,
        event_type: "funds_in_escrow",
        meta: { receipt: "DEMOSERVICE001" },
      },
    ]),
    "insert demo escrow events"
  );

  expectData(
    await admin.from("delivery_assignments").insert([
      {
        id: IDS.assignments.pickupScheduled,
        order_id: IDS.orders.pickupScheduled,
        courier_id: courierId,
        status: "assigned",
      },
      {
        id: IDS.assignments.delivered,
        order_id: IDS.orders.delivered,
        courier_id: courierId,
        status: "delivered",
      },
      {
        id: IDS.assignments.completed,
        order_id: IDS.orders.completed,
        courier_id: courierId,
        status: "delivered",
      },
    ]),
    "insert demo delivery assignments"
  );

  expectData(
    await admin.from("delivery_events").insert([
      {
        assignment_id: IDS.assignments.pickupScheduled,
        event_type: "assigned",
        created_at: isoHoursAgo(27),
      },
      {
        assignment_id: IDS.assignments.delivered,
        event_type: "assigned",
        created_at: isoHoursAgo(39),
      },
      {
        assignment_id: IDS.assignments.delivered,
        event_type: "collected",
        created_at: isoHoursAgo(38),
      },
      {
        assignment_id: IDS.assignments.delivered,
        event_type: "in_transit",
        created_at: isoHoursAgo(37),
      },
      {
        assignment_id: IDS.assignments.delivered,
        event_type: "delivered",
        created_at: isoHoursAgo(36),
      },
      {
        assignment_id: IDS.assignments.completed,
        event_type: "assigned",
        created_at: isoHoursAgo(55),
      },
      {
        assignment_id: IDS.assignments.completed,
        event_type: "collected",
        created_at: isoHoursAgo(54),
      },
      {
        assignment_id: IDS.assignments.completed,
        event_type: "in_transit",
        created_at: isoHoursAgo(53),
      },
      {
        assignment_id: IDS.assignments.completed,
        event_type: "delivered",
        created_at: isoHoursAgo(52),
      },
    ]),
    "insert demo delivery events"
  );

  expectData(
    await admin.from("reviews").insert({
      id: IDS.review,
      order_id: IDS.orders.completed,
      reviewer_id: users.buyer.id,
      merchant_id: merchantId,
      rating: 5,
      body: "Fast delivery and the escrow flow felt safe.",
    }),
    "insert demo review"
  );

  expectData(
    await admin.from("service_requests").insert({
      id: IDS.serviceRequest,
      service_listing_id: IDS.serviceListing,
      buyer_id: users.buyer.id,
      message: "Need same-day diagnosis for a washing machine issue.",
      status: "pending",
    }),
    "insert demo service request"
  );

  console.log("Demo seed complete.");
  console.log("Demo users:");
  for (const definition of Object.values(DEMO_USERS)) {
    console.log(`- ${definition.email}`);
  }
  console.log(`Password: ${demoPassword}`);
  console.log("Key demo order IDs:");
  for (const [name, id] of Object.entries(IDS.orders)) {
    console.log(`- ${name}: ${id}`);
  }
}

await main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
