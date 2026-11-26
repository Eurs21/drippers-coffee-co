import React, { useState, useEffect, useMemo } from 'react';
import {
  Coffee, Camera, ShoppingBag, Search, MapPin, Clock, Star, Phone, Globe, ChevronRight, Plus, Minus, Trash2, Edit3, Check, X,
  ArrowRight, ShieldCheck, Lock, LogOut, LayoutDashboard,
  ClipboardList, Settings, Sparkles, AlertCircle,
  CheckCircle2, Utensils, ShoppingBag as TakeoutIcon,
  Smartphone, Banknote, Upload, RefreshCw, Menu as MenuIcon,
  Navigation, Info
} from 'lucide-react';
import { supabase } from './lib/supabase';

// ============================================================================
// 1. INITIAL SEED DATA & CONFIGURATION (WITH CLEAR SAMPLE DATA LABELS)
// ============================================================================

const STORAGE_KEYS = {
  PRODUCTS: 'drippers_coffee_products_v1',
  CATEGORIES: 'drippers_coffee_categories_v1',
  ORDERS: 'drippers_coffee_orders_v1',
  SETTINGS: 'drippers_coffee_settings_v1',
  CART: 'drippers_coffee_cart_v1',
  ADMIN_SESSION: 'drippers_coffee_admin_session_v1',
};

const DEFAULT_CATEGORIES = [
  'Espresso-Based Coffee',
  'Signature Coffee',
  'Iced Coffee',
  'Non-Coffee Beverages',
  'Specialty Drinks',
  'Add-ons & Extras',
];

const CUSTOMIZATION_CATALOG = {
  temperature: {
    id: 'temperature',
    label: 'Temperature',
    type: 'single',
    required: true,
    options: [
      { id: 'hot', name: 'Hot', price: 0 },
      { id: 'iced', name: 'Iced', price: 0 },
    ],
  },
  size: {
    id: 'size',
    label: 'Cup Size',
    type: 'single',
    required: true,
    options: [
      { id: 'regular', name: 'Regular (12oz)', price: 0 },
      { id: 'large', name: 'Large (16oz)', price: 20 },
    ],
  },
  sugar: {
    id: 'sugar',
    label: 'Sweetness Level',
    type: 'single',
    required: true,
    options: [
      { id: '100', name: '100% Standard', price: 0 },
      { id: '75', name: '75% Less Sweet', price: 0 },
      { id: '50', name: '50% Half Sweet', price: 0 },
      { id: '25', name: '25% Hint of Sweet', price: 0 },
      { id: '0', name: '0% Unsweetened', price: 0 },
    ],
  },
  milk: {
    id: 'milk',
    label: 'Milk Alternative',
    type: 'single',
    required: true,
    options: [
      { id: 'fresh', name: 'Full Cream Fresh Milk', price: 0 },
      { id: 'oat', name: 'Barista Oat Milk', price: 35 },
      { id: 'soy', name: 'Unsweetened Soy Milk', price: 25 },
    ],
  },
  addons: {
    id: 'addons',
    label: 'Extra Add-ons',
    type: 'multiple',
    required: false,
    options: [
      { id: 'extra_shot', name: 'Extra Espresso Shot', price: 30 },
      { id: 'caramel_drizzle', name: 'Salted Caramel Drizzle', price: 15 },
      { id: 'vanilla_syrup', name: 'French Vanilla Syrup', price: 20 },
      { id: 'whipped_cream', name: 'Velvet Whipped Cream', price: 20 },
    ],
  },
};

const FALLBACK_COFFEE_IMG =
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80';

const DEFAULT_PRODUCTS = [
  {
    id: 'prod-spanish-latte',
    name: 'Signature Spanish Latte',
    category: 'Signature Coffee',
    description:
      'Customer favorite. Smooth double-shot espresso layered with silky steamed milk and sweetened condensed milk for a balanced, creamy finish.',
    price: 135,
    image:
      'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    featured: true,
    isSample: true,
    enabledCustomizations: ['temperature', 'size', 'sugar', 'milk', 'addons'],
  },
  {
    id: 'prod-caramel-macchiato',
    name: 'Velvet Caramel Macchiato',
    category: 'Signature Coffee',
    description:
      'Freshly pulled espresso poured over velvety milk and vanilla essence, crowned with rich buttery caramel crosshatch drizzle.',
    price: 145,
    image:
      'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    featured: true,
    isSample: true,
    enabledCustomizations: ['temperature', 'size', 'sugar', 'milk', 'addons'],
  },
  {
    id: 'prod-caffe-americano',
    name: 'Classic Caffè Americano',
    category: 'Espresso-Based Coffee',
    description:
      'Rich, aromatic double espresso shots topped with filtered water for a clean, crisp, and full-bodied daily brew.',
    price: 105,
    image:
      'https://images.unsplash.com/photo-1551030173-122aabc4489c?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    featured: false,
    isSample: true,
    enabledCustomizations: ['temperature', 'size', 'sugar', 'addons'],
  },
  {
    id: 'prod-cafe-latte',
    name: 'Silky Caffè Latte',
    category: 'Espresso-Based Coffee',
    description:
      'Well-balanced espresso harmonized with steamed micro-foamed milk. Smooth, comforting, and crafted for slow mornings or afternoon breaks.',
    price: 120,
    image:
      'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    featured: true,
    isSample: true,
    enabledCustomizations: ['temperature', 'size', 'sugar', 'milk', 'addons'],
  },
  {
    id: 'prod-iced-sea-salt-latte',
    name: 'Nasugbu Sea Salt Cream Latte',
    category: 'Iced Coffee',
    description:
      'Chilled espresso latte topped with airy, lightly salted vanilla cream foam—a refreshing coastal pick-me-up for travelers and locals.',
    price: 150,
    image:
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    featured: true,
    isSample: true,
    enabledCustomizations: ['size', 'sugar', 'milk', 'addons'],
  },
  {
    id: 'prod-iced-mocha',
    name: 'Dark Chocolate Iced Mocha',
    category: 'Iced Coffee',
    description:
      'Bold espresso blended with bittersweet dark cacao sauce and cold fresh milk over crystal ice.',
    price: 140,
    image:
      'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    featured: false,
    isSample: true,
    enabledCustomizations: ['size', 'sugar', 'milk', 'addons'],
  },
  {
    id: 'prod-uji-matcha-latte',
    name: 'Ceremonial Matcha Cream Latte',
    category: 'Non-Coffee Beverages',
    description:
      'Whisked culinary-grade green tea layered over chilled milk with gentle sweetness and earthy aroma.',
    price: 145,
    image:
      'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: true,
    featured: false,
    isSample: true,
    enabledCustomizations: ['temperature', 'size', 'sugar', 'milk'],
  },
  {
    id: 'prod-roasted-hazelnut-oat',
    name: 'Toasted Hazelnut Oat Cortado',
    category: 'Specialty Drinks',
    description:
      'Equal parts warm espresso and creamy oat milk infused with roasted hazelnut notes for a nutty, velvety sip.',
    price: 155,
    image:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    featured: false,
    isSample: true,
    enabledCustomizations: ['temperature', 'size', 'sugar', 'addons'],
  },
  {
    id: 'prod-butter-croissant',
    name: 'Warm Flaky Butter Croissant',
    category: 'Add-ons & Extras',
    description:
      'Golden, crisp-layered French-style pastry warmed to order—ideal alongside your morning pour-over or latte.',
    price: 85,
    image:
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80',
    available: true,
    bestseller: false,
    featured: false,
    isSample: true,
    enabledCustomizations: [],
  },
];

const DEFAULT_SETTINGS = {
  storeName: "Dripper's Coffee Co.",
  address: '3JCM+PF9, Nasugbu, Batangas, Philippines',
  googleRating: '4.9',
  reviewCount: 22,
  operatingHours: 'Open daily until 10:00 PM (Confirm actual hours with business owner)',
  contactPhone: '+63 917 000 0000 [Sample Data — Pending Owner Verification]',
  contactEmail: 'hello@dripperscoffeeco.ph [Sample Data — Pending Owner Verification]',
  facebookHandle: '@dripperscoffeeco [Sample]',
  instagramHandle: '@dripperscoffeeco [Sample]',
  dineInEnabled: true,
  takeoutEnabled: true,
  takeoutPackagingFee: 10,
  cashEnabled: true,
  gcashEnabled: true,
  gcashAccountName: "DRIPPER'S COFFEE CO. [Sample — Verify with Owner]",
  gcashNumber: '0917-000-0000 [Sample — Pending Owner Verification]',
  gcashInstructions:
    'Send exact total via GCash and enter your 13-digit GCash Reference No. below. Our barista will verify receipt upon order confirmation.',
  estimatedPrepMinutes: 12,
};

// Utility: Get current Asia/Manila ISO date string & formatted display
function getManilaTimeInfo(dateObj = new Date()) {
  const formatterDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const formatterFull = new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return {
    manilaDate: formatterDate.format(dateObj), // YYYY-MM-DD
    manilaDisplay: formatterFull.format(dateObj),
  };
}

function createInitialSampleOrders() {
  const { manilaDate, manilaDisplay } = getManilaTimeInfo();
  return [
    {
      orderNumber: 'DCC-2026-1042',
      customerName: 'Camille Mendoza',
      mobileNumber: '0917-555-0192',
      orderType: 'takeout',
      tableNumber: '',
      pickupPreference: 'ASAP (~10-15 mins)',
      specialInstructions: 'Less ice please, thank you!',
      paymentMethod: 'GCash',
      gcashRefNumber: '9012847192041',
      paymentStatus: 'Paid (Verified)',
      status: 'Ready for Pickup',
      items: [
        {
          cartItemId: 'seed-1',
          productId: 'prod-spanish-latte',
          name: 'Signature Spanish Latte',
          basePrice: 135,
          unitPrice: 155,
          quantity: 1,
          customizations: {
            temperature: 'Iced',
            size: 'Large (16oz) (+₱20)',
            sugar: '75% Less Sweet',
            milk: 'Full Cream Fresh Milk',
            addons: [],
          },
        },
        {
          cartItemId: 'seed-2',
          productId: 'prod-butter-croissant',
          name: 'Warm Flaky Butter Croissant',
          basePrice: 85,
          unitPrice: 85,
          quantity: 1,
          customizations: {},
        },
      ],
      subtotal: 240,
      fee: 10,
      total: 250,
      createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
      manilaDate,
      manilaDisplay,
    },
    {
      orderNumber: 'DCC-2026-1043',
      customerName: 'Marco Villareal',
      mobileNumber: '0918-442-8831',
      orderType: 'dine-in',
      tableNumber: 'Table 4',
      pickupPreference: 'Dine-In',
      specialInstructions: '',
      paymentMethod: 'Cash',
      gcashRefNumber: '',
      paymentStatus: 'Pay at Counter',
      status: 'Preparing',
      items: [
        {
          cartItemId: 'seed-3',
          productId: 'prod-caramel-macchiato',
          name: 'Velvet Caramel Macchiato',
          basePrice: 145,
          unitPrice: 175,
          quantity: 2,
          customizations: {
            temperature: 'Hot',
            size: 'Regular (12oz)',
            sugar: '100% Standard',
            milk: 'Full Cream Fresh Milk',
            addons: ['Extra Espresso Shot (+₱30)'],
          },
        },
      ],
      subtotal: 350,
      fee: 0,
      total: 350,
      createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
      manilaDate,
      manilaDisplay,
    },
  ];
}

// Map Supabase row -> UI order object
function mapSupabaseOrderRow(row) {
  const { manilaDate, manilaDisplay } = getManilaTimeInfo(
    row.created_at ? new Date(row.created_at) : new Date()
  );
  const rawTableOrPickup = row.table_or_pickup || '';
  const isTakeout = row.order_type === 'Takeout' || row.order_type === 'takeout';
  return {
    orderNumber: row.order_number,
    customerName: row.customer_name,
    mobileNumber: row.mobile_number,
    orderType: isTakeout ? 'takeout' : 'dine-in',
    tableNumber: isTakeout ? '' : rawTableOrPickup,
    pickupPreference: isTakeout ? rawTableOrPickup || 'ASAP' : 'Dine-In',
    specialInstructions: row.special_instructions || '',
    paymentMethod: row.payment_method,
    gcashRefNumber: row.gcash_ref_number || '',
    paymentStatus: row.payment_status,
    status: row.order_status,
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal) || 0,
    fee: Number(row.fees) || 0,
    total: Number(row.total) || 0,
    createdAt: row.created_at || new Date().toISOString(),
    manilaDate,
    manilaDisplay,
  };
}

// Format currency in Philippine Peso
const formatPHP = (amount) =>
  `₱${Number(amount || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Validate Philippine Mobile Number (09XX-XXX-XXXX or +639XXXXXXXXX)
function validatePHMobile(raw) {
  const cleaned = raw.replace(/[\s\-()]/g, '');
  return /^(09\d{9}|\+639\d{9})$/.test(cleaned);
}

function formatPHMobile(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('639') && digits.length === 12) {
    return `+63 ${digits.slice(2, 5)}-${digits.slice(5, 8)}-${digits.slice(8)}`;
  }
  if (digits.startsWith('09') && digits.length === 11) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return raw.trim();
}

// Server-style recalculation of item unit price from catalog
function calculateItemUnitPrice(product, selections) {
  let total = Number(product.price) || 0;
  if (!selections) return total;

  (product.enabledCustomizations || []).forEach((groupId) => {
    const group = CUSTOMIZATION_CATALOG[groupId];
    if (!group) return;
    if (group.type === 'single') {
      const selectedOptId = selections[groupId];
      const opt = group.options.find((o) => o.id === selectedOptId);
      if (opt) total += opt.price;
    } else if (group.type === 'multiple') {
      const selectedIds = Array.isArray(selections[groupId]) ? selections[groupId] : [];
      selectedIds.forEach((optId) => {
        const opt = group.options.find((o) => o.id === optId);
        if (opt) total += opt.price;
      });
    }
  });
  return total;
}

function buildHumanCustomizations(product, selections) {
  const result = {};
  if (!selections) return result;

  (product.enabledCustomizations || []).forEach((groupId) => {
    const group = CUSTOMIZATION_CATALOG[groupId];
    if (!group) return;
    if (group.type === 'single') {
      const opt = group.options.find((o) => o.id === selections[groupId]);
      if (opt) {
        result[groupId] = opt.price > 0 ? `${opt.name} (+₱${opt.price})` : opt.name;
      }
    } else if (group.type === 'multiple') {
      const ids = Array.isArray(selections[groupId]) ? selections[groupId] : [];
      result[groupId] = ids
        .map((id) => group.options.find((o) => o.id === id))
        .filter(Boolean)
        .map((o) => (o.price > 0 ? `${o.name} (+₱${o.price})` : o.name));
    }
  });
  return result;
}

// ============================================================================
// 2. REUSABLE UI COMPONENTS
// ============================================================================

function SafeImage({ src, alt, className }) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_COFFEE_IMG);
  useEffect(() => {
    setImgSrc(src || FALLBACK_COFFEE_IMG);
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading="lazy"
      onError={() => {
        if (imgSrc !== FALLBACK_COFFEE_IMG) setImgSrc(FALLBACK_COFFEE_IMG);
      }}
      className={className}
    />
  );
}

const STATUS_STEPS = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready for Pickup',
  'Completed',
];

function StatusBadge({ status }) {
  const styles = {
    Pending: 'bg-amber-100 text-amber-900 border-amber-300',
    Confirmed: 'bg-blue-100 text-blue-900 border-blue-300',
    Preparing: 'bg-purple-100 text-purple-900 border-purple-300',
    'Ready for Pickup': 'bg-emerald-100 text-emerald-900 border-emerald-300',
    Completed: 'bg-stone-200 text-stone-800 border-stone-300',
    Cancelled: 'bg-red-100 text-red-900 border-red-300',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
        styles[status] || 'bg-stone-100 text-stone-800 border-stone-200'
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

// ============================================================================
// 3. PRODUCT CUSTOMIZATION MODAL
// ============================================================================

function CustomizationModal({ product, existingCartItem, onClose, onSave }) {
  const [selections, setSelections] = useState(() => {
    if (existingCartItem?.rawSelections) {
      return existingCartItem.rawSelections;
    }
    const defaults = {};
    (product.enabledCustomizations || []).forEach((groupId) => {
      const group = CUSTOMIZATION_CATALOG[groupId];
      if (!group) return;
      if (group.type === 'single' && group.options.length > 0) {
        defaults[groupId] = group.options[0].id;
      } else if (group.type === 'multiple') {
        defaults[groupId] = [];
      }
    });
    return defaults;
  });

  const [quantity, setQuantity] = useState(existingCartItem?.quantity || 1);

  const unitPrice = useMemo(
    () => calculateItemUnitPrice(product, selections),
    [product, selections]
  );

  const handleSingleSelect = (groupId, optId) => {
    setSelections((prev) => ({ ...prev, [groupId]: optId }));
  };

  const handleMultiToggle = (groupId, optId) => {
    setSelections((prev) => {
      const current = Array.isArray(prev[groupId]) ? prev[groupId] : [];
      const exists = current.includes(optId);
      return {
        ...prev,
        [groupId]: exists ? current.filter((id) => id !== optId) : [...current, optId],
      };
    });
  };

  const handleConfirm = () => {
    const humanCustomizations = buildHumanCustomizations(product, selections);
    onSave({
      cartItemId:
        existingCartItem?.cartItemId ||
        `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      productId: product.id,
      name: product.name,
      image: product.image,
      basePrice: product.price,
      unitPrice,
      quantity,
      rawSelections: selections,
      customizations: humanCustomizations,
    });
  };

  const enabledGroups = (product.enabledCustomizations || [])
    .map((id) => CUSTOMIZATION_CATALOG[id])
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#3B241C]/60 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div className="bg-[#FFFCF7] w-full max-w-xl max-h-[92vh] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#D8C3A5]/60 flex flex-col overflow-hidden">
        {/* Header Image */}
        <div className="relative h-48 sm:h-56 w-full shrink-0 bg-[#3B241C]">
          <SafeImage
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3B241C] via-[#3B241C]/30 to-transparent" />
          <button
            onClick={onClose}
            aria-label="Close customization modal"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#FFFCF7]/90 text-[#3B241C] flex items-center justify-center shadow-md hover:bg-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-6 right-6 text-[#FFFCF7]">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#6F4E37] text-[#F5EFE6] font-medium">
                {product.category}
              </span>
              {product.isSample && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-300/40 text-amber-100">
                  Sample Menu Item
                </span>
              )}
            </div>
            <h3 className="font-serif text-2xl font-bold leading-tight">{product.name}</h3>
            <p className="text-xs sm:text-sm text-[#F5EFE6]/85 line-clamp-2 mt-1">
              {product.description}
            </p>
          </div>
        </div>

        {/* Scrollable Customizations */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {enabledGroups.length === 0 ? (
            <div className="p-4 rounded-2xl bg-[#F5EFE6] border border-[#D8C3A5]/60 text-sm text-[#3B241C]/80">
              This item is freshly prepared as-is with no extra customization options required.
            </div>
          ) : (
            enabledGroups.map((group) => (
              <div key={group.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#3B241C] text-sm uppercase tracking-wider">
                    {group.label}
                  </h4>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F5EFE6] text-[#6F4E37] font-medium">
                    {group.required ? 'Required' : 'Optional'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {group.options.map((opt) => {
                    const isSelected =
                      group.type === 'single'
                        ? selections[group.id] === opt.id
                        : (selections[group.id] || []).includes(opt.id);

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          group.type === 'single'
                            ? handleSingleSelect(group.id, opt.id)
                            : handleMultiToggle(group.id, opt.id)
                        }
                        className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition ${
                          isSelected
                            ? 'bg-[#3B241C] text-[#FFFCF7] border-[#3B241C] shadow-sm'
                            : 'bg-white text-[#3B241C] border-[#D8C3A5] hover:border-[#6F4E37]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-${
                              group.type === 'single' ? 'full' : 'md'
                            } border flex items-center justify-center ${
                              isSelected
                                ? 'border-[#D8C3A5] bg-[#6F4E37]'
                                : 'border-[#6F4E37]/50'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm font-medium">{opt.name}</span>
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            isSelected ? 'text-[#D8C3A5]' : 'text-[#6F4E37]'
                          }`}
                        >
                          {opt.price > 0 ? `+₱${opt.price}` : 'Free'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sticky Footer */}
        <div className="p-4 sm:p-6 bg-[#F5EFE6] border-t border-[#D8C3A5] flex flex-col sm:flex-row items-center gap-4 shrink-0">
          <div className="flex items-center justify-between w-full sm:w-auto bg-white rounded-2xl border border-[#D8C3A5] px-3 py-2">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#3B241C] hover:bg-[#F5EFE6]"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-[#3B241C]">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#3B241C] hover:bg-[#F5EFE6]"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full flex-1 py-3.5 px-6 rounded-2xl bg-[#3B241C] hover:bg-[#6F4E37] text-[#FFFCF7] font-semibold shadow-lg transition flex items-center justify-between"
          >
            <span>{existingCartItem ? 'Update Order Item' : 'Add to Order'}</span>
            <span className="font-bold text-[#D8C3A5]">
              {formatPHP(unitPrice * quantity)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. MAIN APPLICATION COMPONENT
// ============================================================================

export default function App() {
  // Persistent States
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
    } catch {
      return DEFAULT_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : createInitialSampleOrders();
    } catch {
      return createInitialSampleOrders();
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'authenticated';
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  // Initial Cloud Sync from Supabase (Orders, Menu Items, Store Settings)
  useEffect(() => {
    if (!supabase) return;

    const syncFromSupabase = async () => {
      try {
        const { data: orderRows, error: ordersErr } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!ordersErr && Array.isArray(orderRows) && orderRows.length > 0) {
          setOrders(orderRows.map(mapSupabaseOrderRow));
        }
      } catch (err) {
        console.warn('Supabase orders fetch skipped:', err);
      }

      try {
        const { data: menuRows, error: menuErr } = await supabase
          .from('menu_items')
          .select('*');

        if (!menuErr && Array.isArray(menuRows) && menuRows.length > 0) {
          const mappedMenu = menuRows.map((m) => ({
            id: m.id,
            name: m.name,
            category: m.category || 'Signature Coffee',
            description: m.description || '',
            price: Number(m.price) || 0,
            image: m.image || FALLBACK_COFFEE_IMG,
            available: m.available !== false,
            bestseller: Boolean(m.bestseller),
            featured: Boolean(m.featured),
            isSample: Boolean(m.is_sample),
            enabledCustomizations: Array.isArray(m.enabled_customizations)
              ? m.enabled_customizations
              : ['temperature', 'size', 'sugar', 'milk', 'addons'],
          }));
          setProducts(mappedMenu);
        }
      } catch (err) {
        console.warn('Supabase menu_items fetch skipped:', err);
      }

      try {
        const { data: settingsRows, error: settingsErr } = await supabase
          .from('store_settings')
          .select('*')
          .limit(1);

        if (!settingsErr && Array.isArray(settingsRows) && settingsRows.length > 0) {
          const s = settingsRows[0];
          setSettings((prev) => ({
            ...prev,
            storeName: s.store_name ?? prev.storeName,
            address: s.address ?? prev.address,
            operatingHours: s.operating_hours ?? prev.operatingHours,
            contactPhone: s.contact_phone ?? prev.contactPhone,
            contactEmail: s.contact_email ?? prev.contactEmail,
            takeoutPackagingFee:
              s.takeout_packaging_fee !== undefined && s.takeout_packaging_fee !== null
                ? Number(s.takeout_packaging_fee)
                : prev.takeoutPackagingFee,
            dineInEnabled:
              typeof s.dine_in_enabled === 'boolean' ? s.dine_in_enabled : prev.dineInEnabled,
            takeoutEnabled:
              typeof s.takeout_enabled === 'boolean' ? s.takeout_enabled : prev.takeoutEnabled,
            cashEnabled:
              typeof s.cash_enabled === 'boolean' ? s.cash_enabled : prev.cashEnabled,
            gcashEnabled:
              typeof s.gcash_enabled === 'boolean' ? s.gcash_enabled : prev.gcashEnabled,
            gcashAccountName: s.gcash_account_name ?? prev.gcashAccountName,
            gcashNumber: s.gcash_number ?? prev.gcashNumber,
            gcashInstructions: s.gcash_instructions ?? prev.gcashInstructions,
          }));
        }
      } catch (err) {
        console.warn('Supabase store_settings fetch skipped:', err);
      }
    };

    syncFromSupabase();
  }, []);

  // Navigation & UI State
  const [activePage, setActivePage] = useState('home'); // home | menu | checkout | confirmation | track | about | contact | admin
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  // Menu Filter State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Customization Modal State
  const [customizingProduct, setCustomizingProduct] = useState(null);
  const [editingCartItem, setEditingCartItem] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Checkout State
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: '',
    mobileNumber: '',
    orderType: settings.dineInEnabled ? 'dine-in' : 'takeout',
    tableNumber: '',
    pickupPreference: 'ASAP',
    scheduledTime: '',
    specialInstructions: '',
    paymentMethod: settings.cashEnabled ? 'Cash' : 'GCash',
    gcashRefNumber: '',
  });
  const [checkoutErrors, setCheckoutErrors] = useState({});
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [lastConfirmedOrder, setLastConfirmedOrder] = useState(null);

  // Order Tracking State
  const [trackOrderRef, setTrackOrderRef] = useState('');
  const [trackMobileVerify, setTrackMobileVerify] = useState('');
  const [trackedOrderResult, setTrackedOrderResult] = useState(null);
  const [trackError, setTrackError] = useState('');

  // Admin Dashboard State
  const [adminLoginForm, setAdminLoginForm] = useState({ username: '', password: '' });
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminTab, setAdminTab] = useState('overview'); // overview | orders | products | settings
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderDateFilter, setOrderDateFilter] = useState('');

  // Admin Product Editor State
  const [editingProductModal, setEditingProductModal] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Computed Cart Totals
  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart]
  );

  const applicableFee = useMemo(() => {
    if (cart.length === 0) return 0;
    return checkoutForm.orderType === 'takeout'
      ? Number(settings.takeoutPackagingFee || 0)
      : 0;
  }, [cart.length, checkoutForm.orderType, settings.takeoutPackagingFee]);

  const cartFinalTotal = cartSubtotal + applicableFee;

  // Cart Actions
  const handleSaveCartItem = (newItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.cartItemId === newItem.cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = newItem;
        return updated;
      }
      return [...prev, newItem];
    });
    setCustomizingProduct(null);
    setEditingCartItem(null);
    showToast(`${newItem.name} added to your order!`);
  };

  const handleUpdateQuantity = (cartItemId, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    showToast('Item removed from cart', 'info');
  };

  const handleEditCartItem = (cartItem) => {
    const product = products.find((p) => p.id === cartItem.productId);
    if (!product) {
      showToast('This product is no longer available in the menu.', 'error');
      return;
    }
    setEditingCartItem(cartItem);
    setCustomizingProduct(product);
    setCartDrawerOpen(false);
  };

  // Navigate helper
  const navigateTo = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Order with Server-Style Validation, Price Recalculation & Supabase Persistence
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!checkoutForm.customerName.trim() || checkoutForm.customerName.trim().length < 2) {
      errors.customerName = 'Please enter your full name.';
    }
    if (!validatePHMobile(checkoutForm.mobileNumber)) {
      errors.mobileNumber =
        'Enter a valid Philippine mobile number (e.g., 0917-123-4567 or +639171234567).';
    }
    if (cart.length === 0) {
      errors.cart = 'Your cart is empty.';
    }
    if (
      checkoutForm.orderType === 'takeout' &&
      checkoutForm.pickupPreference === 'Scheduled' &&
      !checkoutForm.scheduledTime
    ) {
      errors.scheduledTime = 'Please choose your preferred pickup time.';
    }

    if (Object.keys(errors).length > 0) {
      setCheckoutErrors(errors);
      showToast('Please check the highlighted fields before submitting.', 'error');
      return;
    }

    setCheckoutErrors({});
    setIsSubmittingOrder(true);

    // Server-side integrity check: recalculate every item price from current product catalog
    let validatedSubtotal = 0;
    const validatedItems = cart.map((item) => {
      const catalogProduct = products.find((p) => p.id === item.productId);
      const verifiedUnitPrice = catalogProduct
        ? calculateItemUnitPrice(catalogProduct, item.rawSelections)
        : item.unitPrice;
      validatedSubtotal += verifiedUnitPrice * item.quantity;
      return {
        ...item,
        unitPrice: verifiedUnitPrice,
      };
    });

    const verifiedFee =
      checkoutForm.orderType === 'takeout'
        ? Number(settings.takeoutPackagingFee || 0)
        : 0;
    const verifiedTotal = validatedSubtotal + verifiedFee;

    const now = new Date();
    const { manilaDate, manilaDisplay } = getManilaTimeInfo(now);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `DCC-${now.getFullYear()}-${randomDigits}`;

    const newOrder = {
      orderNumber,
      customerName: checkoutForm.customerName.trim(),
      mobileNumber: formatPHMobile(checkoutForm.mobileNumber),
      orderType: checkoutForm.orderType,
      tableNumber:
        checkoutForm.orderType === 'dine-in'
          ? checkoutForm.tableNumber.trim() || 'Counter / Unassigned'
          : '',
      pickupPreference:
        checkoutForm.orderType === 'takeout'
          ? checkoutForm.pickupPreference === 'Scheduled'
            ? `Scheduled (${checkoutForm.scheduledTime})`
            : `ASAP (~${settings.estimatedPrepMinutes} mins)`
          : 'Dine-In',
      specialInstructions: checkoutForm.specialInstructions.trim(),
      paymentMethod: checkoutForm.paymentMethod,
      gcashRefNumber:
        checkoutForm.paymentMethod === 'GCash'
          ? checkoutForm.gcashRefNumber.trim()
          : '',
      paymentStatus:
        checkoutForm.paymentMethod === 'GCash'
          ? 'Pending Staff Verification'
          : 'Pay at Counter',
      status: 'Pending',
      items: validatedItems,
      subtotal: validatedSubtotal,
      fee: verifiedFee,
      total: verifiedTotal,
      createdAt: now.toISOString(),
      manilaDate,
      manilaDisplay,
    };

    const dbPayload = {
      order_number: newOrder.orderNumber,
      customer_name: newOrder.customerName,
      mobile_number: newOrder.mobileNumber,
      order_type: newOrder.orderType === 'takeout' ? 'Takeout' : 'Dine-in',
      table_or_pickup:
        newOrder.orderType === 'takeout'
          ? newOrder.pickupPreference
          : newOrder.tableNumber,
      payment_method: newOrder.paymentMethod === 'GCash' ? 'GCash' : 'Cash',
      payment_status:
        newOrder.paymentMethod === 'GCash' ? 'Pending Verification' : 'Unpaid',
      order_status: newOrder.status,
      items: newOrder.items,
      subtotal: newOrder.subtotal,
      fees: newOrder.fee,
      total: newOrder.total,
      special_instructions: newOrder.specialInstructions || null,
    };

    if (!supabase) {
      setIsSubmittingOrder(false);
      showToast(
        'Supabase client not initialized. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
        'error'
      );
      return;
    }

    const { error: dbError } = await supabase.from('orders').insert([dbPayload]);

    setIsSubmittingOrder(false);

    if (dbError) {
      console.error('Supabase order insert failed:', dbError);
      showToast(`Order failed to save in Supabase: ${dbError.message}`, 'error');
      return;
    }

    setOrders((prev) => [newOrder, ...prev]);
    setLastConfirmedOrder(newOrder);
    setCart([]);
    setTrackOrderRef(orderNumber);
    setTrackMobileVerify(newOrder.mobileNumber.slice(-4));
    navigateTo('confirmation');
    showToast(`Order ${orderNumber} placed and saved!`);
  };

  // Order Tracking Lookup
  const handleTrackOrder = (e) => {
    e.preventDefault();
    setTrackError('');
    const refCleaned = trackOrderRef.trim().toUpperCase();
    const phoneCleaned = trackMobileVerify.replace(/\D/g, '');

    if (!refCleaned || phoneCleaned.length < 4) {
      setTrackError(
        'Please enter your Order Reference Number and at least the last 4 digits of your mobile number.'
      );
      setTrackedOrderResult(null);
      return;
    }

    const found = orders.find((o) => {
      const orderDigits = o.mobileNumber.replace(/\D/g, '');
      const matchesRef = o.orderNumber.toUpperCase() === refCleaned;
      const matchesPhone =
        orderDigits.endsWith(phoneCleaned) || orderDigits === phoneCleaned;
      return matchesRef && matchesPhone;
    });

    if (!found) {
      setTrackError(
        'No matching order found. Double-check your Order Reference Number (e.g., DCC-2026-1042) and mobile digits.'
      );
      setTrackedOrderResult(null);
    } else {
      setTrackedOrderResult(found);
    }
  };

  // Keep trackedOrderResult live if admin updates status while customer views it
  const liveTrackedOrder = useMemo(() => {
    if (!trackedOrderResult) return null;
    return (
      orders.find((o) => o.orderNumber === trackedOrderResult.orderNumber) ||
      trackedOrderResult
    );
  }, [orders, trackedOrderResult]);

  // ============================================================================
  // 5. ADMIN HANDLERS
  // ============================================================================

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (
      adminLoginForm.username.trim().toLowerCase() === 'owner@drippers.ph' &&
      adminLoginForm.password === 'NasugbuCoffee2026!'
    ) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'authenticated');
      setAdminLoginError('');
      showToast("Welcome back to Dripper's Coffee Co. Admin Portal!");
    } else {
      setAdminLoginError('Invalid staff credentials. Please try again.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    navigateTo('home');
    showToast('Signed out of Admin Portal.', 'info');
  };

  const handleUpdateOrderStatus = async (orderNumber, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderNumber === orderNumber ? { ...o, status: newStatus } : o))
    );
    showToast(`Order ${orderNumber} updated to "${newStatus}"`);

    if (supabase) {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('order_number', orderNumber);
      if (error) {
        console.error('Failed to sync order status to Supabase:', error);
      }
    }
  };

  const handleTogglePaymentVerified = async (orderNumber) => {
    const target = orders.find((o) => o.orderNumber === orderNumber);
    if (!target) return;

    const isCurrentlyPaid = target.paymentStatus.startsWith('Paid');
    const nextPaymentStatus = isCurrentlyPaid
      ? target.paymentMethod === 'GCash'
        ? 'Pending Staff Verification'
        : 'Pay at Counter'
      : 'Paid (Verified)';

    setOrders((prev) =>
      prev.map((o) =>
        o.orderNumber === orderNumber ? { ...o, paymentStatus: nextPaymentStatus } : o
      )
    );
    showToast(`Payment status updated for ${orderNumber}`);

    if (supabase) {
      const dbPaymentStatus = nextPaymentStatus.startsWith('Paid')
        ? 'Paid'
        : target.paymentMethod === 'GCash'
        ? 'Pending Verification'
        : 'Unpaid';
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: dbPaymentStatus })
        .eq('order_number', orderNumber);
      if (error) {
        console.error('Failed to sync payment status to Supabase:', error);
      }
    }
  };

  const handleSaveProduct = async (productData) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === productData.id);
      if (exists) {
        return prev.map((p) => (p.id === productData.id ? productData : p));
      }
      return [productData, ...prev];
    });
    setEditingProductModal(null);
    showToast(`Saved "${productData.name}" to menu.`);

    if (supabase) {
      const { error } = await supabase.from('menu_items').upsert([
        {
          id: productData.id,
          name: productData.name,
          category: productData.category,
          description: productData.description,
          price: Number(productData.price) || 0,
          image: productData.image,
          available: Boolean(productData.available),
          bestseller: Boolean(productData.bestseller),
          featured: Boolean(productData.featured),
          is_sample: Boolean(productData.isSample),
          enabled_customizations: productData.enabledCustomizations || [],
        },
      ]);
      if (error) {
        console.warn('menu_items sync note:', error.message);
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('Product removed from menu.', 'info');

    if (supabase) {
      const { error } = await supabase.from('menu_items').delete().eq('id', productId);
      if (error) {
        console.warn('menu_items delete note:', error.message);
      }
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      showToast('Category already exists.', 'error');
      return;
    }
    setCategories((prev) => [...prev, trimmed]);
    setNewCategoryName('');
    showToast(`Added category "${trimmed}"`);
  };

  const handleSaveStoreSettings = async () => {
    showToast('Store settings saved and published!');
    if (supabase) {
      const { error } = await supabase.from('store_settings').upsert([
        {
          id: 1,
          store_name: settings.storeName,
          address: settings.address,
          operating_hours: settings.operatingHours,
          contact_phone: settings.contactPhone,
          contact_email: settings.contactEmail,
          takeout_packaging_fee: Number(settings.takeoutPackagingFee) || 0,
          dine_in_enabled: Boolean(settings.dineInEnabled),
          takeout_enabled: Boolean(settings.takeoutEnabled),
          cash_enabled: Boolean(settings.cashEnabled),
          gcash_enabled: Boolean(settings.gcashEnabled),
          gcash_account_name: settings.gcashAccountName,
          gcash_number: settings.gcashNumber,
          gcash_instructions: settings.gcashInstructions,
        },
      ]);
      if (error) {
        console.warn('store_settings sync note:', error.message);
      }
    }
  };

  const handleResetDemoData = () => {
    setProducts(DEFAULT_PRODUCTS);
    setCategories(DEFAULT_CATEGORIES);
    setOrders(createInitialSampleOrders());
    setSettings(DEFAULT_SETTINGS);
    showToast('Restored default sample catalog and settings.');
  };

  // Filtered Menu Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const bestsellers = useMemo(
    () => products.filter((p) => p.bestseller),
    [products]
  );

  // ============================================================================
  // 6. RENDER SUB-VIEWS
  // ============================================================================

  const renderNavbar = () => (
    <header className="sticky top-0 z-40 bg-[#FFFCF7]/95 backdrop-blur-md border-b border-[#D8C3A5]/60">
      {/* Top Info Ribbon */}
      <div className="bg-[#3B241C] text-[#F5EFE6] text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#D8C3A5] shrink-0" />
            <span>3JCM+PF9, Nasugbu, Batangas • Open until 10:00 PM</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1 text-[#D8C3A5]">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              4.9/5 Google Rating (22 reviews)
            </span>
            <button
              onClick={() => navigateTo('admin')}
              className="underline hover:text-white transition font-medium flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              {isAdminAuthenticated ? 'Admin Dashboard' : 'Staff / Owner Portal'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#3B241C] text-[#F5EFE6] flex items-center justify-center shadow-md group-hover:bg-[#6F4E37] transition">
            <Coffee className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="font-serif text-lg sm:text-xl font-bold text-[#3B241C] block leading-none">
              {settings.storeName}
            </span>
            <span className="text-[11px] uppercase tracking-widest text-[#6F4E37] font-medium">
              Nasugbu, Batangas
            </span>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7">
          {[
            { id: 'home', label: 'Home' },
            { id: 'menu', label: 'Menu' },
            { id: 'track', label: 'Track Order' },
            { id: 'about', label: 'About' },
            { id: 'contact', label: 'Contact' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`text-sm font-semibold transition relative py-1 ${
                activePage === item.id
                  ? 'text-[#3B241C]'
                  : 'text-[#6F4E37] hover:text-[#3B241C]'
              }`}
            >
              {item.label}
              {activePage === item.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B241C] rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Right Actions: Cart + Mobile Menu */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#3B241C] hover:bg-[#6F4E37] text-[#FFFCF7] text-sm font-semibold shadow-sm transition"
          >
            <ShoppingBag className="w-4 h-4 text-[#D8C3A5]" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#D8C3A5] text-[#3B241C]">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-2.5 rounded-xl border border-[#D8C3A5] text-[#3B241C]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFCF7] border-t border-[#D8C3A5]/60 px-4 py-4 space-y-2 shadow-lg">
          {[
            { id: 'home', label: 'Home' },
            { id: 'menu', label: 'Digital Coffee Menu' },
            { id: 'track', label: 'Track My Order' },
            { id: 'about', label: 'About Us' },
            { id: 'contact', label: 'Location & Contact' },
            { id: 'admin', label: 'Staff / Owner Portal' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-between ${
                activePage === item.id
                  ? 'bg-[#3B241C] text-[#FFFCF7]'
                  : 'text-[#3B241C] hover:bg-[#F5EFE6]'
              }`}
            >
              <span>{item.label}</span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>
          ))}
        </div>
      )}
    </header>
  );

  const renderHomePage = () => (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#3B241C] text-[#FFFCF7]">
        <div className="absolute inset-0">
          <SafeImage
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=80"
            alt="Freshly brewed coffee at Dripper's Coffee Co."
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#3B241C] via-[#3B241C]/85 to-[#3B241C]/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6F4E37]/60 border border-[#D8C3A5]/40 text-[#F5EFE6] text-xs font-medium backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#D8C3A5]" />
              <span>Neighborhood Coffee Stop • Nasugbu, Batangas</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              Your Daily Dose of Good Coffee.
            </h1>

            <p className="text-base sm:text-lg text-[#F5EFE6]/90 leading-relaxed max-w-xl">
              Freshly brewed, carefully crafted, and made to make every sip memorable.
              Order ahead for quick takeout or settle in for a cozy dine-in pause.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigateTo('menu')}
                className="px-7 py-4 rounded-2xl bg-[#D8C3A5] hover:bg-[#e5d4bc] text-[#3B241C] font-bold text-sm sm:text-base shadow-lg transition flex items-center gap-2"
              >
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigateTo('menu')}
                className="px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-[#FFFCF7] border border-[#D8C3A5]/40 font-semibold text-sm sm:text-base backdrop-blur-sm transition"
              >
                Explore Our Menu
              </button>
            </div>

            {/* Social Proof Strip */}
            <div className="pt-6 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-[#F5EFE6]/85 border-t border-[#D8C3A5]/20">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-white">4.9 / 5</span>
                <span>(22 Google Reviews)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#D8C3A5]" />
                <span>Open until 10:00 PM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-[#D8C3A5]" />
                <span>Dine-in & Takeout</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED BESTSELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#6F4E37]">
              Crowd Favorites in Nasugbu
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3B241C] mt-1">
              Featured Bestsellers
            </h2>
          </div>
          <button
            onClick={() => navigateTo('menu')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#6F4E37] hover:text-[#3B241C] transition"
          >
            <span>View Full Menu</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.slice(0, 4).map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-3xl border border-[#D8C3A5]/60 overflow-hidden shadow-sm hover:shadow-xl transition duration-300 flex flex-col"
            >
              <div className="relative h-52 overflow-hidden bg-[#F5EFE6]">
                <SafeImage
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#3B241C] text-[#F5EFE6] shadow">
                    ★ Bestseller
                  </span>
                </div>
                {product.isSample && (
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/65 text-amber-200 backdrop-blur-sm">
                    Sample Menu Item
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6F4E37]">
                    {product.category}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#3B241C] mt-0.5">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#6F4E37]/90 line-clamp-2 mt-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F5EFE6] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#6F4E37] block">Starts at</span>
                    <span className="text-lg font-bold text-[#3B241C]">
                      {formatPHP(product.price)}
                    </span>
                  </div>
                  <button
                    disabled={!product.available}
                    onClick={() => {
                      setEditingCartItem(null);
                      setCustomizingProduct(product);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      product.available
                        ? 'bg-[#3B241C] hover:bg-[#6F4E37] text-[#FFFCF7]'
                        : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{product.available ? 'Customize' : 'Sold Out'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. POPULAR COFFEE CATEGORIES */}
      <section className="bg-[#F5EFE6] py-16 border-y border-[#D8C3A5]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#6F4E37]">
              Crafted for Every Palate
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#3B241C] mt-1">
              Explore by Category
            </h2>
            <p className="text-xs text-[#6F4E37] mt-2">
              Suggested menu categories — fully customizable by the owner in the Admin Dashboard.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const count = products.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    navigateTo('menu');
                  }}
                  className="bg-[#FFFCF7] hover:bg-[#3B241C] text-[#3B241C] hover:text-[#FFFCF7] p-5 rounded-3xl border border-[#D8C3A5] shadow-sm transition group text-left flex flex-col justify-between min-h-[130px]"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#F5EFE6] group-hover:bg-[#6F4E37] text-[#3B241C] group-hover:text-[#FFFCF7] flex items-center justify-center transition">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-bold text-sm leading-snug">{cat}</h3>
                    <span className="text-xs opacity-75 mt-1 block">
                      {count} {count === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. SHORT BRAND INTRODUCTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#D8C3A5]/70 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#3B241C]">
              <SafeImage
                src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1000&q=80"
                alt="Warm neighborhood coffee shop"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="lg:col-span-7 space-y-5">
            <span className="inline-block px-3 py-1 rounded-full bg-[#F5EFE6] text-[#6F4E37] text-xs font-bold uppercase tracking-wider">
              About Dripper's Coffee Co.
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3B241C] leading-tight">
              A Welcoming Neighborhood Stop in Nasugbu, Batangas
            </h2>
            <p className="text-[#3B241C]/85 leading-relaxed text-sm sm:text-base">
              Whether you are a local starting your morning routine or a traveler passing through
              Nasugbu, Dripper's Coffee Co. is built around smooth, aromatic, freshly prepared
              drinks and genuine hospitality.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#F5EFE6]/70 border border-[#D8C3A5]/50">
                <div className="font-serif text-2xl font-bold text-[#3B241C]">4.9 ★</div>
                <div className="text-xs text-[#6F4E37] mt-0.5">
                  Rated across 22 customer reviews
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#F5EFE6]/70 border border-[#D8C3A5]/50">
                <div className="font-serif text-2xl font-bold text-[#3B241C]">Freshly Brewed</div>
                <div className="text-xs text-[#6F4E37] mt-0.5">
                  Smooth, balanced espresso & lattes
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#F5EFE6]/70 border border-[#D8C3A5]/50">
                <div className="font-serif text-2xl font-bold text-[#3B241C]">Dine & Go</div>
                <div className="text-xs text-[#6F4E37] mt-0.5">
                  Easy online ordering for locals & travelers
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CUSTOMER TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#6F4E37]">
            What Guests Love Most
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#3B241C] mt-1">
            Rated 4.9/5 by Coffee Lovers
          </h2>
          <p className="text-xs text-[#6F4E37] mt-1">
            Representative highlights based on verified guest feedback themes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote:
                'Super smooth and well-balanced Spanish Latte! Definitely one of our favorite coffee stops whenever we pass through Nasugbu.',
              author: 'Local & Weekend Traveler Feedback',
              highlight: 'Spanish Latte & Smoothness',
            },
            {
              quote:
                'Freshly prepared Caramel Macchiato with just the right sweetness and very reasonable pricing for the quality.',
              author: 'Regular Dine-In Guest',
              highlight: 'Caramel Macchiato & Value',
            },
            {
              quote:
                'Cozy atmosphere, accommodating staff, and consistently aromatic coffee every single visit.',
              author: 'Nasugbu Neighborhood Regular',
              highlight: 'Freshness & Hospitality',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-7 rounded-3xl border border-[#D8C3A5]/70 shadow-sm flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F5EFE6] text-[#6F4E37]">
                    {item.highlight}
                  </span>
                </div>
                <p className="text-sm text-[#3B241C]/90 italic leading-relaxed">
                  “{item.quote}”
                </p>
              </div>
              <div className="text-xs font-bold text-[#6F4E37] pt-3 border-t border-[#F5EFE6]">
                — {item.author}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. LOCATION & OPERATING HOURS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#3B241C] text-[#FFFCF7] rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D8C3A5]">
              Visit Us in Batangas
            </span>
            <h2 className="font-serif text-3xl font-bold">Location & Operating Hours</h2>
            <div className="space-y-3 text-sm text-[#F5EFE6]/90 pt-2">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#D8C3A5] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Address</div>
                  <div>{settings.address}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#D8C3A5] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Operating Hours</div>
                  <div>{settings.operatingHours}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Utensils className="w-5 h-5 text-[#D8C3A5] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Services</div>
                  <div>Dine-in • Takeout • Online Pre-Order</div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <a
                href="https://www.google.com/maps/search/?api=1&query=3JCM%2BPF9%2C+Nasugbu%2C+Batangas%2C+Philippines"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-2xl bg-[#D8C3A5] text-[#3B241C] font-bold text-xs sm:text-sm inline-flex items-center gap-2 hover:bg-[#e5d4bc] transition"
              >
                <Navigation className="w-4 h-4" />
                <span>Open in Google Maps</span>
              </a>
              <button
                onClick={() => navigateTo('menu')}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition"
              >
                Start Online Order
              </button>
            </div>
          </div>

          <div className="bg-[#6F4E37]/30 border border-[#D8C3A5]/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-serif text-lg font-bold">Nasugbu Plus Code Pin</span>
              <span className="px-3 py-1 rounded-full bg-[#D8C3A5]/20 text-[#D8C3A5] text-xs font-mono">
                3JCM+PF9
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#F5EFE6]/85 leading-relaxed">
              Conveniently located in Nasugbu, Batangas—an easy stop before heading to the beach
              or heading home. Order online before you arrive so your drinks are freshly pulled
              right on time.
            </p>
            <div className="p-3.5 rounded-xl bg-[#3B241C]/80 border border-[#D8C3A5]/20 text-xs text-[#D8C3A5] flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Note: Closing time is listed as 10:00 PM. Opening hours & official contact details
                are marked for owner verification in the Admin Portal.
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderMenuPage = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Sample Disclaimer */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#6F4E37]">
            Freshly Prepared to Order
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3B241C] mt-1">
            Digital Coffee Menu
          </h1>
          <p className="text-xs sm:text-sm text-[#6F4E37] mt-1">
            Customize your sweetness, milk, cup size, and add-ons before adding to your cart.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#6F4E37] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Spanish Latte, Matcha..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-[#D8C3A5] text-sm text-[#3B241C] placeholder-[#6F4E37]/60 focus:outline-none focus:border-[#3B241C]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F4E37] hover:text-[#3B241C]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sample Menu Notice */}
      <div className="p-3.5 rounded-2xl bg-[#F5EFE6] border border-[#D8C3A5] flex flex-wrap items-center justify-between gap-2 text-xs text-[#3B241C]">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#6F4E37] shrink-0" />
          <span>
            <strong>Sample Menu Data:</strong> Suggested categories, items, and ₱ prices are
            preloaded until verified/edited by the owner in the Admin Dashboard.
          </span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['All', ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-[#3B241C] text-[#FFFCF7] shadow-sm'
                : 'bg-white text-[#6F4E37] border border-[#D8C3A5] hover:border-[#3B241C]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#D8C3A5] p-12 text-center space-y-3">
          <Coffee className="w-10 h-10 text-[#6F4E37] mx-auto opacity-60" />
          <h3 className="font-serif text-xl font-bold text-[#3B241C]">No matching drinks found</h3>
          <p className="text-sm text-[#6F4E37]">
            Try clearing your search or switching back to all categories.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-5 py-2.5 rounded-xl bg-[#3B241C] text-white text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-3xl border border-[#D8C3A5]/70 overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col ${
                !product.available ? 'opacity-75' : ''
              }`}
            >
              <div className="relative h-56 bg-[#F5EFE6] overflow-hidden">
                <SafeImage
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {product.bestseller && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#3B241C] text-[#F5EFE6] shadow">
                      ★ Bestseller
                    </span>
                  )}
                  {product.featured && !product.bestseller && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#6F4E37] text-[#FFFCF7] shadow">
                      Featured
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold shadow ${
                      product.available
                        ? 'bg-emerald-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {product.available ? 'Available' : 'Sold Out'}
                  </span>
                </div>

                {product.isSample && (
                  <span className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded-md text-[10px] bg-black/65 text-amber-200 backdrop-blur-sm">
                    [Sample Data]
                  </span>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F4E37]">
                      {product.category}
                    </span>
                    {product.enabledCustomizations?.includes('size') && (
                      <span className="text-[11px] text-[#6F4E37] bg-[#F5EFE6] px-2 py-0.5 rounded-md">
                        12oz / 16oz
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#3B241C] mt-1">
                    {product.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6F4E37]/90 mt-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F5EFE6] flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-[#6F4E37] block">Price</span>
                    <span className="text-xl font-bold text-[#3B241C]">
                      {formatPHP(product.price)}
                    </span>
                  </div>

                  <button
                    disabled={!product.available}
                    onClick={() => {
                      setEditingCartItem(null);
                      setCustomizingProduct(product);
                    }}
                    className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                      product.available
                        ? 'bg-[#3B241C] hover:bg-[#6F4E37] text-[#FFFCF7] shadow-sm'
                        : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>
                      {product.available
                        ? product.enabledCustomizations?.length > 0
                          ? 'Customize & Add'
                          : 'Add to Cart'
                        : 'Unavailable'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCheckoutPage = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <button
          onClick={() => navigateTo('menu')}
          className="text-xs font-bold text-[#6F4E37] hover:text-[#3B241C] mb-2 inline-flex items-center gap-1"
        >
          ← Back to Menu
        </button>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3B241C]">
          Complete Your Order
        </h1>
        <p className="text-sm text-[#6F4E37] mt-1">
          Fast, mobile-friendly checkout for Dine-In or Takeout at Nasugbu, Batangas.
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#D8C3A5] p-12 text-center space-y-4">
          <ShoppingBag className="w-12 h-12 text-[#6F4E37] mx-auto opacity-60" />
          <h2 className="font-serif text-2xl font-bold text-[#3B241C]">Your cart is empty</h2>
          <p className="text-sm text-[#6F4E37]">
            Add your favorite coffee or pastry from our digital menu to proceed.
          </p>
          <button
            onClick={() => navigateTo('menu')}
            className="px-6 py-3 rounded-2xl bg-[#3B241C] text-white text-sm font-bold"
          >
            Browse Coffee Menu
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmitOrder}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left Form Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer Details */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D8C3A5]/70 shadow-sm space-y-5">
              <h2 className="font-serif text-xl font-bold text-[#3B241C] flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#3B241C] text-[#FFFCF7] text-xs font-sans flex items-center justify-center">
                  1
                </span>
                Customer Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6F4E37] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={checkoutForm.customerName}
                    onChange={(e) =>
                      setCheckoutForm({ ...checkoutForm, customerName: e.target.value })
                    }
                    placeholder="e.g., Juan Dela Cruz"
                    className="w-full px-4 py-3 rounded-2xl border border-[#D8C3A5] bg-[#FFFCF7] text-sm text-[#3B241C] focus:outline-none focus:border-[#3B241C]"
                  />
                  {checkoutErrors.customerName && (
                    <p className="text-xs text-red-600 mt-1">{checkoutErrors.customerName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6F4E37] mb-1.5">
                    Philippine Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={checkoutForm.mobileNumber}
                    onChange={(e) =>
                      setCheckoutForm({ ...checkoutForm, mobileNumber: e.target.value })
                    }
                    placeholder="0917-123-4567"
                    className="w-full px-4 py-3 rounded-2xl border border-[#D8C3A5] bg-[#FFFCF7] text-sm text-[#3B241C] focus:outline-none focus:border-[#3B241C]"
                  />
                  {checkoutErrors.mobileNumber && (
                    <p className="text-xs text-red-600 mt-1">{checkoutErrors.mobileNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Order Type (Dine-in vs Takeout) */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D8C3A5]/70 shadow-sm space-y-5">
              <h2 className="font-serif text-xl font-bold text-[#3B241C] flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#3B241C] text-[#FFFCF7] text-xs font-sans flex items-center justify-center">
                  2
                </span>
                Order Type
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {settings.dineInEnabled && (
                  <button
                    type="button"
                    onClick={() =>
                      setCheckoutForm({ ...checkoutForm, orderType: 'dine-in' })
                    }
                    className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                      checkoutForm.orderType === 'dine-in'
                        ? 'bg-[#3B241C] text-[#FFFCF7] border-[#3B241C] shadow'
                        : 'bg-[#FFFCF7] text-[#3B241C] border-[#D8C3A5]'
                    }`}
                  >
                    <Utensils className="w-5 h-5 shrink-0 mt-0.5 text-[#D8C3A5]" />
                    <div>
                      <div className="font-bold text-sm">Dine-In</div>
                      <div className="text-xs opacity-80 mt-0.5">
                        Enjoy your coffee fresh in our Nasugbu café (No packaging fee)
                      </div>
                    </div>
                  </button>
                )}

                {settings.takeoutEnabled && (
                  <button
                    type="button"
                    onClick={() =>
                      setCheckoutForm({ ...checkoutForm, orderType: 'takeout' })
                    }
                    className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                      checkoutForm.orderType === 'takeout'
                        ? 'bg-[#3B241C] text-[#FFFCF7] border-[#3B241C] shadow'
                        : 'bg-[#FFFCF7] text-[#3B241C] border-[#D8C3A5]'
                    }`}
                  >
                    <TakeoutIcon className="w-5 h-5 shrink-0 mt-0.5 text-[#D8C3A5]" />
                    <div>
                      <div className="font-bold text-sm">Takeout / Pickup</div>
                      <div className="text-xs opacity-80 mt-0.5">
                        Sealed to-go cups & carrier (+{formatPHP(settings.takeoutPackagingFee)}{' '}
                        packaging)
                      </div>
                    </div>
                  </button>
                )}
              </div>

              {checkoutForm.orderType === 'dine-in' ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6F4E37] mb-1.5">
                    Table Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={checkoutForm.tableNumber}
                    onChange={(e) =>
                      setCheckoutForm({ ...checkoutForm, tableNumber: e.target.value })
                    }
                    placeholder="e.g., Table 3 (Leave blank if ordering ahead)"
                    className="w-full px-4 py-3 rounded-2xl border border-[#D8C3A5] bg-[#FFFCF7] text-sm text-[#3B241C]"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6F4E37]">
                    Preferred Pickup Time
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['ASAP', 'Scheduled'].map((pref) => (
                      <button
                        key={pref}
                        type="button"
                        onClick={() =>
                          setCheckoutForm({ ...checkoutForm, pickupPreference: pref })
                        }
                        className={`py-3 px-4 rounded-2xl border text-xs sm:text-sm font-semibold transition ${
                          checkoutForm.pickupPreference === pref
                            ? 'bg-[#6F4E37] text-white border-[#6F4E37]'
                            : 'bg-[#FFFCF7] text-[#3B241C] border-[#D8C3A5]'
                        }`}
                      >
                        {pref === 'ASAP'
                          ? `ASAP (~${settings.estimatedPrepMinutes} mins)`
                          : 'Schedule Pickup Time'}
                      </button>
                    ))}
                  </div>
                  {checkoutForm.pickupPreference === 'Scheduled' && (
                    <div>
                      <input
                        type="time"
                        value={checkoutForm.scheduledTime}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            scheduledTime: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-2xl border border-[#D8C3A5] bg-[#FFFCF7] text-sm text-[#3B241C]"
                      />
                      {checkoutErrors.scheduledTime && (
                        <p className="text-xs text-red-600 mt-1">
                          {checkoutErrors.scheduledTime}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6F4E37] mb-1.5">
                  Special Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={checkoutForm.specialInstructions}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      specialInstructions: e.target.value,
                    })
                  }
                  placeholder="Any prep notes for our barista (e.g., extra napkins, separate carrier)..."
                  className="w-full px-4 py-3 rounded-2xl border border-[#D8C3A5] bg-[#FFFCF7] text-sm text-[#3B241C]"
                />
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D8C3A5]/70 shadow-sm space-y-5">
              <h2 className="font-serif text-xl font-bold text-[#3B241C] flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#3B241C] text-[#FFFCF7] text-xs font-sans flex items-center justify-center">
                  3
                </span>
                Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {settings.cashEnabled && (
                  <button
                    type="button"
                    onClick={() =>
                      setCheckoutForm({ ...checkoutForm, paymentMethod: 'Cash' })
                    }
                    className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
                      checkoutForm.paymentMethod === 'Cash'
                        ? 'bg-[#3B241C] text-[#FFFCF7] border-[#3B241C]'
                        : 'bg-[#FFFCF7] text-[#3B241C] border-[#D8C3A5]'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-[#D8C3A5] shrink-0" />
                    <div>
                      <div className="font-bold text-sm">Cash</div>
                      <div className="text-xs opacity-80">Pay upon pickup / counter</div>
                    </div>
                  </button>
                )}

                {settings.gcashEnabled && (
                  <button
                    type="button"
                    onClick={() =>
                      setCheckoutForm({ ...checkoutForm, paymentMethod: 'GCash' })
                    }
                    className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
                      checkoutForm.paymentMethod === 'GCash'
                        ? 'bg-[#007DFE] text-white border-[#007DFE]'
                        : 'bg-[#FFFCF7] text-[#3B241C] border-[#D8C3A5]'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="font-bold text-sm">GCash Transfer</div>
                      <div className="text-xs opacity-85">Manual verification by staff</div>
                    </div>
                  </button>
                )}
              </div>

              {checkoutForm.paymentMethod === 'GCash' && (
                <div className="p-5 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-3 text-sm text-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900">GCash Payment Details</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Staff Verified
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white p-3.5 rounded-xl border border-blue-100">
                    <div>
                      <span className="text-slate-500 block">Account Name</span>
                      <span className="font-bold text-slate-900">
                        {settings.gcashAccountName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">GCash Number</span>
                      <span className="font-bold text-slate-900">{settings.gcashNumber}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {settings.gcashInstructions}
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-blue-950 mb-1">
                      GCash Reference Number (Optional — helps faster verification)
                    </label>
                    <input
                      type="text"
                      value={checkoutForm.gcashRefNumber}
                      onChange={(e) =>
                        setCheckoutForm({
                          ...checkoutForm,
                          gcashRefNumber: e.target.value,
                        })
                      }
                      placeholder="e.g., 9012 3456 78901"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 bg-white text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                    Note: Your order payment status will show as{' '}
                    <strong>“Pending Staff Verification”</strong> until our barista confirms the
                    GCash transfer.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Order Summary Column */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#D8C3A5]/80 shadow-md space-y-6 lg:sticky lg:top-24">
            <h2 className="font-serif text-xl font-bold text-[#3B241C] border-b border-[#F5EFE6] pb-4">
              Order Summary ({cartCount} {cartCount === 1 ? 'item' : 'items'})
            </h2>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex items-start justify-between gap-3 pb-3 border-b border-[#F5EFE6] last:border-none"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-[#3B241C]">
                      {item.quantity}× {item.name}
                    </div>
                    <div className="text-xs text-[#6F4E37] space-y-0.5">
                      {Object.entries(item.customizations || {}).map(([key, val]) => {
                        if (!val || (Array.isArray(val) && val.length === 0)) return null;
                        return (
                          <div key={key}>
                            - {Array.isArray(val) ? val.join(', ') : val}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="font-bold text-sm text-[#3B241C] shrink-0">
                    {formatPHP(item.unitPrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 pt-3 border-t border-[#D8C3A5]/60 text-sm">
              <div className="flex justify-between text-[#6F4E37]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#3B241C]">
                  {formatPHP(cartSubtotal)}
                </span>
              </div>
              <div className="flex justify-between text-[#6F4E37]">
                <span>
                  {checkoutForm.orderType === 'takeout'
                    ? 'Takeout Packaging Fee'
                    : 'Dine-In Service Fee'}
                </span>
                <span className="font-semibold text-[#3B241C]">
                  {formatPHP(applicableFee)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-[#3B241C] pt-3 border-t border-[#D8C3A5]">
                <span>Total Amount</span>
                <span>{formatPHP(cartFinalTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingOrder}
              className="w-full py-4 px-6 rounded-2xl bg-[#3B241C] hover:bg-[#6F4E37] text-[#FFFCF7] font-bold text-base shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmittingOrder ? (
                <span>Placing Your Order...</span>
              ) : (
                <>
                  <span>Place Order • {formatPHP(cartFinalTotal)}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );

  const renderConfirmationPage = () => {
    const order = lastConfirmedOrder || orders[0];
    if (!order) return null;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl border border-[#D8C3A5] shadow-xl overflow-hidden">
          <div className="bg-[#3B241C] text-[#FFFCF7] p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-xs uppercase tracking-widest text-[#D8C3A5] font-bold">
              Order Received
            </span>
            <h1 className="font-serif text-3xl font-bold">Thank You, {order.customerName}!</h1>
            <p className="text-sm text-[#F5EFE6]/85 max-w-md mx-auto">
              Your order has been sent to Dripper's Coffee Co. in Nasugbu, Batangas. Save your
              reference number below to track live updates.
            </p>
            <div className="inline-block mt-2 px-5 py-2.5 rounded-2xl bg-[#6F4E37] border border-[#D8C3A5]/40">
              <span className="text-xs text-[#D8C3A5] block">Order Reference Number</span>
              <span className="font-mono text-xl font-bold tracking-wider text-white">
                {order.orderNumber}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Status & Payment Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#F5EFE6] border border-[#D8C3A5]/60 text-sm">
              <div>
                <span className="text-xs text-[#6F4E37] block">Order Status</span>
                <div className="mt-1">
                  <StatusBadge status={order.status} />
                </div>
              </div>
              <div>
                <span className="text-xs text-[#6F4E37] block">Payment Method</span>
                <span className="font-bold text-[#3B241C] block mt-1">
                  {order.paymentMethod}
                </span>
                <span className="text-xs text-amber-800 font-medium">
                  {order.paymentStatus}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#6F4E37] block">Order Type & Time</span>
                <span className="font-bold text-[#3B241C] capitalize block mt-1">
                  {order.orderType}{' '}
                  {order.tableNumber ? `(${order.tableNumber})` : `• ${order.pickupPreference}`}
                </span>
                <span className="text-[11px] text-[#6F4E37]">{order.manilaDisplay} PHT</span>
              </div>
            </div>

            {/* Next Step Instructions */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-950 space-y-1">
              <div className="font-bold">Next Steps:</div>
              {order.paymentMethod === 'GCash' ? (
                <p>
                  Our staff is verifying your GCash payment ({order.gcashRefNumber || 'No ref entered'}).
                  Please present your GCash receipt screenshot upon claiming your order at the
                  counter.
                </p>
              ) : (
                <p>
                  Please proceed to the counter at Dripper's Coffee Co. (3JCM+PF9, Nasugbu) to
                  settle your cash payment of <strong>{formatPHP(order.total)}</strong> while our
                  baristas prepare your drinks.
                </p>
              )}
            </div>

            {/* Receipt Items */}
            <div className="space-y-3">
              <h3 className="font-serif text-lg font-bold text-[#3B241C]">Ordered Items</h3>
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start py-2.5 border-b border-[#F5EFE6] text-sm"
                >
                  <div>
                    <div className="font-bold text-[#3B241C]">
                      {item.quantity}× {item.name}
                    </div>
                    <div className="text-xs text-[#6F4E37]">
                      {Object.values(item.customizations || {})
                        .flat()
                        .filter(Boolean)
                        .join(' • ')}
                    </div>
                  </div>
                  <span className="font-bold text-[#3B241C]">
                    {formatPHP(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="pt-2 space-y-1 text-sm">
                <div className="flex justify-between text-[#6F4E37]">
                  <span>Subtotal</span>
                  <span>{formatPHP(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#6F4E37]">
                  <span>Fee</span>
                  <span>{formatPHP(order.fee)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-[#3B241C] pt-2 border-t border-[#D8C3A5]">
                  <span>Total</span>
                  <span>{formatPHP(order.total)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => {
                  setTrackOrderRef(order.orderNumber);
                  setTrackMobileVerify(order.mobileNumber.slice(-4));
                  setTrackedOrderResult(order);
                  navigateTo('track');
                }}
                className="flex-1 py-3.5 px-5 rounded-2xl bg-[#3B241C] hover:bg-[#6F4E37] text-white font-bold text-sm transition"
              >
                Track Live Order Status
              </button>
              <button
                onClick={() => navigateTo('menu')}
                className="py-3.5 px-5 rounded-2xl border border-[#D8C3A5] text-[#3B241C] font-bold text-sm hover:bg-[#F5EFE6] transition"
              >
                Order More
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTrackOrderPage = () => {
    const activeOrder = liveTrackedOrder;
    const currentStepIdx = activeOrder ? STATUS_STEPS.indexOf(activeOrder.status) : -1;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#6F4E37]">
            Real-Time Barista Updates
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3B241C]">
            Track Your Coffee Order
          </h1>
          <p className="text-sm text-[#6F4E37]">
            Enter your Order Reference Number and mobile number verification to check progress.
          </p>
        </div>

        {/* Lookup Form */}
        <form
          onSubmit={handleTrackOrder}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D8C3A5] shadow-sm space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6F4E37] mb-1.5">
                Order Reference Number
              </label>
              <input
                type="text"
                value={trackOrderRef}
                onChange={(e) => setTrackOrderRef(e.target.value)}
                placeholder="e.g., DCC-2026-1042"
                className="w-full px-4 py-3 rounded-2xl border border-[#D8C3A5] bg-[#FFFCF7] text-sm font-mono uppercase text-[#3B241C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6F4E37] mb-1.5">
                Mobile Number (Full or Last 4 Digits)
              </label>
              <input
                type="text"
                value={trackMobileVerify}
                onChange={(e) => setTrackMobileVerify(e.target.value)}
                placeholder="e.g., 0192 or 0917-555-0192"
                className="w-full px-4 py-3 rounded-2xl border border-[#D8C3A5] bg-[#FFFCF7] text-sm text-[#3B241C]"
              />
            </div>
          </div>

          {trackError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {trackError}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="submit"
              className="px-7 py-3.5 rounded-2xl bg-[#3B241C] hover:bg-[#6F4E37] text-white font-bold text-sm transition"
            >
              Check Status
            </button>
          </div>
        </form>

        {/* Live Status Card */}
        {activeOrder && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D8C3A5] shadow-md space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F5EFE6]">
              <div>
                <span className="text-xs text-[#6F4E37]">Order Reference</span>
                <h2 className="font-mono text-2xl font-bold text-[#3B241C]">
                  {activeOrder.orderNumber}
                </h2>
                <span className="text-xs text-[#6F4E37]">
                  Placed on {activeOrder.manilaDisplay} (Asia/Manila)
                </span>
              </div>
              <StatusBadge status={activeOrder.status} />
            </div>

            {activeOrder.status === 'Cancelled' ? (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-900">
                This order has been cancelled. Please contact the counter if you need assistance.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div
                        key={step}
                        className={`p-3 rounded-2xl border text-center transition ${
                          isCurrent
                            ? 'bg-[#3B241C] text-white border-[#3B241C] shadow'
                            : isCompleted
                            ? 'bg-[#F5EFE6] text-[#3B241C] border-[#D8C3A5]'
                            : 'bg-white text-stone-400 border-stone-200'
                        }`}
                      >
                        <div className="text-[11px] font-bold">Step {idx + 1}</div>
                        <div className="text-xs font-semibold mt-0.5">{step}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-[#FFFCF7] p-4 rounded-2xl border border-[#D8C3A5]/60">
              <div>
                <span className="text-xs text-[#6F4E37] block">Customer & Mode</span>
                <span className="font-bold text-[#3B241C]">
                  {activeOrder.customerName} •{' '}
                  <span className="capitalize">{activeOrder.orderType}</span>
                </span>
              </div>
              <div>
                <span className="text-xs text-[#6F4E37] block">Payment & Total</span>
                <span className="font-bold text-[#3B241C]">
                  {activeOrder.paymentMethod} ({activeOrder.paymentStatus}) •{' '}
                  {formatPHP(activeOrder.total)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAboutPage = () => (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="bg-white rounded-3xl border border-[#D8C3A5] p-8 sm:p-12 shadow-sm space-y-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#6F4E37]">
          Our Story & Craft
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#3B241C]">
          Dripper's Coffee Co.
        </h1>
        <p className="text-base text-[#3B241C]/85 leading-relaxed">
          Located at <strong>3JCM+PF9, Nasugbu, Batangas, Philippines</strong>, Dripper's Coffee Co.
          was created to serve smooth, aromatic, freshly prepared coffee in a warm, welcoming
          space where both neighborhood regulars and weekend travelers feel right at home.
        </p>
        <p className="text-base text-[#3B241C]/85 leading-relaxed">
          With a <strong>4.9/5 Google rating across 22 reviews</strong>, guests consistently
          highlight the freshness of our brews, our balanced Spanish Latte and Caramel Macchiato,
          and fair everyday pricing.
        </p>
        <div className="pt-4">
          <button
            onClick={() => navigateTo('menu')}
            className="px-6 py-3.5 rounded-2xl bg-[#3B241C] text-white font-bold text-sm hover:bg-[#6F4E37] transition"
          >
            Explore Our Menu
          </button>
        </div>
      </div>
    </div>
  );

  const renderContactPage = () => (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-3xl border border-[#D8C3A5] p-8 sm:p-12 shadow-sm space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#6F4E37]">
            Get in Touch
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3B241C] mt-1">
            Visit or Contact Dripper's Coffee Co.
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="p-5 rounded-2xl bg-[#F5EFE6] border border-[#D8C3A5]/60 space-y-2">
            <div className="font-bold text-[#3B241C] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#6F4E37]" />
              <span>Store Location</span>
            </div>
            <p className="text-[#3B241C]/90">{settings.address}</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F5EFE6] border border-[#D8C3A5]/60 space-y-2">
            <div className="font-bold text-[#3B241C] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#6F4E37]" />
              <span>Operating Hours</span>
            </div>
            <p className="text-[#3B241C]/90">{settings.operatingHours}</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F5EFE6] border border-[#D8C3A5]/60 space-y-2">
            <div className="font-bold text-[#3B241C] flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#6F4E37]" />
              <span>Phone / Viber</span>
            </div>
            <p className="text-[#3B241C]/90">{settings.contactPhone}</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F5EFE6] border border-[#D8C3A5]/60 space-y-2">
            <div className="font-bold text-[#3B241C] flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#6F4E37]" />
              <span>Social Media</span>
            </div>
            <p className="text-[#3B241C]/90">
              Facebook: {settings.facebookHandle} • Instagram: {settings.instagramHandle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // 7. ADMIN DASHBOARD & AUTHENTICATION GATE
  // ============================================================================

  const renderAdminPortal = () => {
    if (!isAdminAuthenticated) {
      return (
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl border border-[#D8C3A5] shadow-xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#3B241C] text-[#D8C3A5] flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-[#3B241C]">
                Staff & Owner Portal
              </h1>
              <p className="text-xs text-[#6F4E37]">
                Sign in to manage orders, update the digital menu, and configure store settings.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6F4E37] mb-1">
                  Staff Email
                </label>
                <input
                  type="email"
                  required
                  value={adminLoginForm.username}
                  onChange={(e) =>
                    setAdminLoginForm({ ...adminLoginForm, username: e.target.value })
                  }
                  placeholder="Enter staff email"
                  className="w-full px-4 py-3 rounded-2xl border border-[#D8C3A5] bg-[#FFFCF7] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6F4E37] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={adminLoginForm.password}
                  onChange={(e) =>
                    setAdminLoginForm({ ...adminLoginForm, password: e.target.value })
                  }
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-2xl border border-[#D8C3A5] bg-[#FFFCF7] text-sm"
                />
              </div>

              {adminLoginError && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                  {adminLoginError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#3B241C] hover:bg-[#6F4E37] text-white font-bold text-sm transition"
              >
                Sign In to Dashboard
              </button>
            </form>

            
          </div>
        </div>
      );
    }

    // Admin Metrics Calculations (Asia/Manila)
    const { manilaDate: todayManila } = getManilaTimeInfo();
    const todaysOrders = orders.filter((o) => o.manilaDate === todayManila);
    const validSalesOrders = todaysOrders.filter((o) => o.status !== 'Cancelled');
    const todaysSales = validSalesOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
    const completedOrdersCount = orders.filter((o) => o.status === 'Completed').length;

    // Bestselling product tally from orders
    const productSalesMap = {};
    orders
      .filter((o) => o.status !== 'Cancelled')
      .forEach((o) => {
        o.items.forEach((item) => {
          productSalesMap[item.name] = (productSalesMap[item.name] || 0) + item.quantity;
        });
      });
    const topSellingList = Object.entries(productSalesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Filtered Orders for Admin Table
    const filteredAdminOrders = orders.filter((o) => {
      const matchStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
      const matchDate = !orderDateFilter || o.manilaDate === orderDateFilter;
      return matchStatus && matchDate;
    });

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Admin Top Header */}
        <div className="bg-[#3B241C] text-[#FFFCF7] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D8C3A5] font-bold">
              Admin Control Center • Asia/Manila ({todayManila})
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold mt-1">
              {settings.storeName} Operations
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('menu')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition"
            >
              View Customer Storefront
            </button>
            <button
              onClick={handleAdminLogout}
              className="px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-100 border border-red-400/30 text-xs font-semibold inline-flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Admin Sub-Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#D8C3A5] pb-3">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
            {
              id: 'orders',
              label: `Order Management (${orders.length})`,
              icon: ClipboardList,
            },
            { id: 'products', label: `Menu & Categories (${products.length})`, icon: Coffee },
            { id: 'settings', label: 'Store Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition ${
                  adminTab === tab.id
                    ? 'bg-[#3B241C] text-white shadow-sm'
                    : 'bg-white text-[#6F4E37] border border-[#D8C3A5] hover:border-[#3B241C]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {adminTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Total Orders', value: orders.length, sub: 'All recorded' },
                {
                  label: "Today's Orders",
                  value: todaysOrders.length,
                  sub: `Date: ${todayManila}`,
                },
                {
                  label: "Today's Sales",
                  value: formatPHP(todaysSales),
                  sub: 'Excludes cancelled',
                },
                {
                  label: 'Pending Orders',
                  value: pendingOrdersCount,
                  sub: 'Awaiting confirmation',
                },
                {
                  label: 'Completed Orders',
                  value: completedOrdersCount,
                  sub: 'Fulfilled orders',
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-3xl border border-[#D8C3A5]/80 shadow-sm space-y-1"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6F4E37]">
                    {stat.label}
                  </span>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#3B241C]">
                    {stat.value}
                  </div>
                  <span className="text-[11px] text-[#6F4E37]/80 block">{stat.sub}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bestselling Products Breakdown */}
              <div className="bg-white p-6 rounded-3xl border border-[#D8C3A5]/80 shadow-sm space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#3B241C]">
                  Top Selling Beverages & Items
                </h3>
                {topSellingList.length === 0 ? (
                  <p className="text-sm text-[#6F4E37]">No sales recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {topSellingList.map(([name, qty], idx) => (
                      <div
                        key={name}
                        className="flex items-center justify-between p-3 rounded-2xl bg-[#F5EFE6]/70"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#3B241C] text-white text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-sm text-[#3B241C]">{name}</span>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#3B241C] border border-[#D8C3A5]">
                          {qty} sold
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Incoming Orders Quick Queue */}
              <div className="bg-white p-6 rounded-3xl border border-[#D8C3A5]/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-bold text-[#3B241C]">
                    Recent Orders Queue
                  </h3>
                  <button
                    onClick={() => setAdminTab('orders')}
                    className="text-xs font-bold text-[#6F4E37] hover:text-[#3B241C]"
                  >
                    Manage All →
                  </button>
                </div>
                <div className="space-y-3">
                  {orders.slice(0, 4).map((ord) => (
                    <div
                      key={ord.orderNumber}
                      className="p-3.5 rounded-2xl border border-[#D8C3A5]/60 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-mono text-xs font-bold text-[#3B241C]">
                          {ord.orderNumber} • {ord.customerName}
                        </div>
                        <div className="text-xs text-[#6F4E37]">
                          {ord.items.length} item(s) • {formatPHP(ord.total)} •{' '}
                          <span className="capitalize">{ord.orderType}</span>
                        </div>
                      </div>
                      <StatusBadge status={ord.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDER MANAGEMENT */}
        {adminTab === 'orders' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#D8C3A5] flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {['All', ...STATUS_STEPS, 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      orderStatusFilter === st
                        ? 'bg-[#3B241C] text-white'
                        : 'bg-[#F5EFE6] text-[#3B241C] hover:bg-[#D8C3A5]/50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#6F4E37]">Filter Date:</span>
                <input
                  type="date"
                  value={orderDateFilter}
                  onChange={(e) => setOrderDateFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#D8C3A5] text-xs bg-[#FFFCF7]"
                />
                {orderDateFilter && (
                  <button
                    onClick={() => setOrderDateFilter('')}
                    className="text-xs text-[#6F4E37] underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredAdminOrders.length === 0 ? (
                <div className="bg-white p-10 rounded-3xl border border-[#D8C3A5] text-center text-sm text-[#6F4E37]">
                  No orders match the selected filters.
                </div>
              ) : (
                filteredAdminOrders.map((ord) => (
                  <div
                    key={ord.orderNumber}
                    className="bg-white p-6 rounded-3xl border border-[#D8C3A5]/80 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#F5EFE6]">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono text-base font-bold text-[#3B241C]">
                            {ord.orderNumber}
                          </span>
                          <StatusBadge status={ord.status} />
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F5EFE6] text-[#3B241C] capitalize">
                            {ord.orderType}{' '}
                            {ord.tableNumber
                              ? `(${ord.tableNumber})`
                              : `• ${ord.pickupPreference}`}
                          </span>
                        </div>
                        <div className="text-xs text-[#6F4E37]">
                          <strong>{ord.customerName}</strong> ({ord.mobileNumber}) •{' '}
                          {ord.manilaDisplay} PHT
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-[#3B241C]">
                          {formatPHP(ord.total)}
                        </div>
                        <div className="text-xs font-semibold text-[#6F4E37]">
                          {ord.paymentMethod} •{' '}
                          <span
                            className={
                              ord.paymentStatus.startsWith('Paid')
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }
                          >
                            {ord.paymentStatus}
                          </span>
                        </div>
                        {ord.gcashRefNumber && (
                          <div className="text-[11px] font-mono text-blue-700">
                            GCash Ref: {ord.gcashRefNumber}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Items Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {ord.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-[#FFFCF7] border border-[#D8C3A5]/60 text-xs"
                        >
                          <div className="font-bold text-[#3B241C]">
                            {item.quantity}× {item.name} ({formatPHP(item.unitPrice * item.quantity)})
                          </div>
                          <div className="text-[#6F4E37] mt-0.5">
                            {Object.values(item.customizations || {})
                              .flat()
                              .filter(Boolean)
                              .join(' • ') || 'Standard preparation'}
                          </div>
                        </div>
                      ))}
                    </div>

                    {ord.specialInstructions && (
                      <div className="text-xs bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-2 rounded-xl">
                        <strong>Note:</strong> {ord.specialInstructions}
                      </div>
                    )}

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-[#6F4E37]">Update Status:</span>
                        {STATUS_STEPS.map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateOrderStatus(ord.orderNumber, st)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                              ord.status === st
                                ? 'bg-[#3B241C] text-white border-[#3B241C]'
                                : 'bg-white text-[#3B241C] border-[#D8C3A5] hover:bg-[#F5EFE6]'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus(ord.orderNumber, 'Cancelled')
                          }
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-red-200 text-red-700 hover:bg-red-50 transition"
                        >
                          Cancel
                        </button>
                      </div>

                      <button
                        onClick={() => handleTogglePaymentVerified(ord.orderNumber)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                          ord.paymentStatus.startsWith('Paid')
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {ord.paymentStatus.startsWith('Paid')
                          ? '✓ Payment Verified'
                          : 'Mark Payment Verified / Paid'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCT & CATEGORY MANAGEMENT */}
        {adminTab === 'products' && (
          <div className="space-y-8">
            {/* Category Manager */}
            <div className="bg-white p-6 rounded-3xl border border-[#D8C3A5] space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#3B241C]">Menu Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5EFE6] border border-[#D8C3A5] text-xs font-semibold text-[#3B241C]"
                  >
                    {cat}
                    {categories.length > 1 && (
                      <button
                        onClick={() =>
                          setCategories((prev) => prev.filter((c) => c !== cat))
                        }
                        className="text-[#6F4E37] hover:text-red-600"
                        title="Remove category"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddCategory} className="flex gap-2 max-w-md">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name (e.g., Cold Brew)"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#D8C3A5] text-xs bg-[#FFFCF7]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#3B241C] text-white text-xs font-bold"
                >
                  Add Category
                </button>
              </form>
            </div>

            {/* Product List Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl font-bold text-[#3B241C]">
                Menu Items ({products.length})
              </h3>
              <button
                onClick={() =>
                  setEditingProductModal({
                    id: `prod-${Date.now()}`,
                    name: '',
                    category: categories[0] || 'Espresso-Based Coffee',
                    description: '',
                    price: 120,
                    image: FALLBACK_COFFEE_IMG,
                    available: true,
                    bestseller: false,
                    featured: false,
                    isSample: false,
                    enabledCustomizations: ['temperature', 'size', 'sugar', 'milk', 'addons'],
                  })
                }
                className="px-5 py-3 rounded-2xl bg-[#3B241C] hover:bg-[#6F4E37] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Products Table/Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-3xl border border-[#D8C3A5] p-5 flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="flex gap-4">
                    <SafeImage
                      src={prod.image}
                      alt={prod.name}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0 bg-[#F5EFE6]"
                    />
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-[#6F4E37] uppercase">
                        {prod.category}
                      </span>
                      <h4 className="font-serif font-bold text-base text-[#3B241C] leading-snug">
                        {prod.name}
                      </h4>
                      <div className="font-bold text-sm text-[#3B241C]">
                        {formatPHP(prod.price)}
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            prod.available
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {prod.available ? 'Available' : 'Sold Out'}
                        </span>
                        {prod.bestseller && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900">
                            Bestseller
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#F5EFE6] gap-2">
                    <button
                      onClick={() => {
                        const nextAvailable = !prod.available;
                        setProducts((prev) =>
                          prev.map((p) =>
                            p.id === prod.id ? { ...p, available: nextAvailable } : p
                          )
                        );
                        if (supabase) {
                          supabase
                            .from('menu_items')
                            .update({ available: nextAvailable })
                            .eq('id', prod.id);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-[#F5EFE6] hover:bg-[#D8C3A5]/60 text-xs font-semibold text-[#3B241C]"
                    >
                      {prod.available ? 'Mark Sold Out' : 'Mark Available'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingProductModal(prod)}
                        className="p-2 rounded-xl border border-[#D8C3A5] text-[#3B241C] hover:bg-[#F5EFE6]"
                        title="Edit product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: STORE SETTINGS */}
        {adminTab === 'settings' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D8C3A5] shadow-sm space-y-6 max-w-4xl">
            <div className="flex items-center justify-between border-b border-[#F5EFE6] pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#3B241C]">
                  Store & Payment Configuration
                </h3>
                <p className="text-xs text-[#6F4E37]">
                  Replace sample placeholders with verified owner details. Changes update the
                  customer website immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetDemoData}
                className="px-3.5 py-2 rounded-xl border border-[#D8C3A5] text-xs font-semibold text-[#6F4E37] hover:text-[#3B241C] inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-[#6F4E37] mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8C3A5] bg-[#FFFCF7]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#6F4E37] mb-1">
                  Operating Hours
                </label>
                <input
                  type="text"
                  value={settings.operatingHours}
                  onChange={(e) =>
                    setSettings({ ...settings, operatingHours: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8C3A5] bg-[#FFFCF7]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-[#6F4E37] mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8C3A5] bg-[#FFFCF7]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#6F4E37] mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) =>
                    setSettings({ ...settings, contactPhone: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8C3A5] bg-[#FFFCF7]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#6F4E37] mb-1">
                  Takeout Packaging Fee (₱)
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.takeoutPackagingFee}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      takeoutPackagingFee: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8C3A5] bg-[#FFFCF7]"
                />
              </div>
            </div>

            {/* Order Types & Payment Toggles */}
            <div className="pt-4 border-t border-[#F5EFE6] space-y-4">
              <h4 className="font-serif text-lg font-bold text-[#3B241C]">
                Order Modes & Payment Methods
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { key: 'dineInEnabled', label: 'Dine-In Orders' },
                  { key: 'takeoutEnabled', label: 'Takeout Orders' },
                  { key: 'cashEnabled', label: 'Cash Payment' },
                  { key: 'gcashEnabled', label: 'GCash Payment' },
                ].map((toggle) => (
                  <button
                    key={toggle.key}
                    type="button"
                    onClick={() =>
                      setSettings({ ...settings, [toggle.key]: !settings[toggle.key] })
                    }
                    className={`p-3 rounded-2xl border font-bold text-left transition ${
                      settings[toggle.key]
                        ? 'bg-[#3B241C] text-white border-[#3B241C]'
                        : 'bg-stone-100 text-stone-500 border-stone-200'
                    }`}
                  >
                    <div>{toggle.label}</div>
                    <div className="text-[11px] font-normal opacity-80 mt-0.5">
                      {settings[toggle.key] ? 'Enabled' : 'Disabled'}
                    </div>
                  </button>
                ))}
              </div>

              {settings.gcashEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F5EFE6] border border-[#D8C3A5] text-sm">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#6F4E37] mb-1">
                      GCash Account Name
                    </label>
                    <input
                      type="text"
                      value={settings.gcashAccountName}
                      onChange={(e) =>
                        setSettings({ ...settings, gcashAccountName: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#D8C3A5] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#6F4E37] mb-1">
                      GCash Mobile Number
                    </label>
                    <input
                      type="text"
                      value={settings.gcashNumber}
                      onChange={(e) =>
                        setSettings({ ...settings, gcashNumber: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#D8C3A5] bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-[#6F4E37] mb-1">
                      GCash Payment Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={settings.gcashInstructions}
                      onChange={(e) =>
                        setSettings({ ...settings, gcashInstructions: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#D8C3A5] bg-white text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveStoreSettings}
                className="px-6 py-3.5 rounded-2xl bg-[#3B241C] hover:bg-[#6F4E37] text-white font-bold text-sm transition"
              >
                Save Store Configuration
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // 8. ADMIN PRODUCT EDITOR MODAL
  // ============================================================================

  const renderProductEditorModal = () => {
    if (!editingProductModal) return null;
    const prod = editingProductModal;

    const handleImageFileUpload = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        setEditingProductModal((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    };

    const toggleCustGroup = (groupId) => {
      const current = prod.enabledCustomizations || [];
      const updated = current.includes(groupId)
        ? current.filter((id) => id !== groupId)
        : [...current, groupId];
      setEditingProductModal({ ...prod, enabledCustomizations: updated });
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3B241C]/60 backdrop-blur-sm p-4">
        <div className="bg-[#FFFCF7] w-full max-w-2xl max-h-[90vh] rounded-3xl border border-[#D8C3A5] shadow-2xl flex flex-col overflow-hidden">
          <div className="p-6 bg-[#3B241C] text-white flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold">
              {prod.name ? `Edit: ${prod.name}` : 'Add New Menu Item'}
            </h3>
            <button
              onClick={() => setEditingProductModal(null)}
              className="p-1.5 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#6F4E37] mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={prod.name}
                  onChange={(e) =>
                    setEditingProductModal({ ...prod, name: e.target.value })
                  }
                  placeholder="e.g., Iced Hazelnut Latte"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#6F4E37] mb-1">
                  Category
                </label>
                <select
                  value={prod.category}
                  onChange={(e) =>
                    setEditingProductModal({ ...prod, category: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#6F4E37] mb-1">
                  Base Price (₱) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={prod.price}
                  onChange={(e) =>
                    setEditingProductModal({
                      ...prod,
                      price: Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#6F4E37] mb-1">
                  Upload Image or Paste URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prod.image}
                    onChange={(e) =>
                      setEditingProductModal({ ...prod, image: e.target.value })
                    }
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 rounded-xl border border-[#D8C3A5] bg-white text-xs"
                  />
                  <label className="px-3 py-2 rounded-xl bg-[#F5EFE6] border border-[#D8C3A5] text-xs font-bold text-[#3B241C] cursor-pointer hover:bg-[#D8C3A5]/50 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#6F4E37] mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={prod.description}
                onChange={(e) =>
                  setEditingProductModal({ ...prod, description: e.target.value })
                }
                placeholder="Describe flavor notes, milk, and preparation..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] bg-white"
              />
            </div>

            {/* Flags */}
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'available', label: 'Available in Stock' },
                { key: 'bestseller', label: 'Bestseller Badge' },
                { key: 'featured', label: 'Featured Item' },
                { key: 'isSample', label: 'Label as Sample Data' },
              ].map((flag) => (
                <button
                  key={flag.key}
                  type="button"
                  onClick={() =>
                    setEditingProductModal({ ...prod, [flag.key]: !prod[flag.key] })
                  }
                  className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition ${
                    prod[flag.key]
                      ? 'bg-[#3B241C] text-white border-[#3B241C]'
                      : 'bg-white text-[#6F4E37] border-[#D8C3A5]'
                  }`}
                >
                  {prod[flag.key] ? '✓ ' : ''}
                  {flag.label}
                </button>
              ))}
            </div>

            {/* Enabled Customization Groups */}
            <div className="space-y-2 pt-2 border-t border-[#F5EFE6]">
              <label className="block text-xs font-bold uppercase text-[#6F4E37]">
                Enabled Drink Customizations for this Product
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.values(CUSTOMIZATION_CATALOG).map((group) => {
                  const active = (prod.enabledCustomizations || []).includes(group.id);
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => toggleCustGroup(group.id)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition ${
                        active
                          ? 'bg-[#6F4E37] text-white border-[#6F4E37]'
                          : 'bg-[#F5EFE6] text-[#3B241C] border-[#D8C3A5]'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {group.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-5 bg-[#F5EFE6] border-t border-[#D8C3A5] flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditingProductModal(null)}
              className="px-5 py-2.5 rounded-xl border border-[#D8C3A5] text-xs font-bold text-[#3B241C]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!prod.name.trim()) {
                  showToast('Product name is required.', 'error');
                  return;
                }
                handleSaveProduct(prod);
              }}
              className="px-6 py-2.5 rounded-xl bg-[#3B241C] text-white text-xs font-bold"
            >
              Save Product
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // 9. SLIDE-OVER SHOPPING CART DRAWER
  // ============================================================================

  const renderCartDrawer = () => {
    if (!cartDrawerOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex justify-end bg-[#3B241C]/50 backdrop-blur-xs">
        <div className="bg-[#FFFCF7] w-full max-w-md h-full shadow-2xl border-l border-[#D8C3A5] flex flex-col">
          <div className="p-6 bg-[#3B241C] text-[#FFFCF7] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#D8C3A5]" />
              <h2 className="font-serif text-xl font-bold">Your Coffee Order</h2>
            </div>
            <button
              onClick={() => setCartDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Coffee className="w-12 h-12 text-[#6F4E37] mx-auto opacity-50" />
                <h3 className="font-serif text-xl font-bold text-[#3B241C]">
                  Your cup is empty
                </h3>
                <p className="text-xs text-[#6F4E37]">
                  Explore our freshly brewed espresso drinks, lattes, and pastries.
                </p>
                <button
                  onClick={() => {
                    setCartDrawerOpen(false);
                    navigateTo('menu');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#3B241C] text-white text-xs font-bold"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="bg-white p-4 rounded-2xl border border-[#D8C3A5]/80 shadow-xs space-y-3"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#3B241C]">
                        {item.name}
                      </h4>
                      <div className="text-xs text-[#6F4E37] space-y-0.5 mt-1">
                        {Object.entries(item.customizations || {}).map(([key, val]) => {
                          if (!val || (Array.isArray(val) && val.length === 0)) return null;
                          return (
                            <div key={key}>
                              - {Array.isArray(val) ? val.join(', ') : val}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <span className="font-bold text-sm text-[#3B241C] shrink-0">
                      {formatPHP(item.unitPrice * item.quantity)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#F5EFE6]">
                    <div className="flex items-center gap-2 bg-[#F5EFE6] rounded-xl px-2 py-1">
                      <button
                        onClick={() => handleUpdateQuantity(item.cartItemId, -1)}
                        className="w-6 h-6 flex items-center justify-center text-[#3B241C]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.cartItemId, 1)}
                        className="w-6 h-6 flex items-center justify-center text-[#3B241C]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditCartItem(item)}
                        className="text-xs font-semibold text-[#6F4E37] hover:text-[#3B241C] inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#F5EFE6]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleRemoveCartItem(item.cartItemId)}
                        className="text-xs font-semibold text-red-600 hover:bg-red-50 p-1.5 rounded-lg"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-6 bg-[#F5EFE6] border-t border-[#D8C3A5] space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-[#6F4E37]">
                  <span>Order Subtotal</span>
                  <span className="font-bold text-[#3B241C]">
                    {formatPHP(cartSubtotal)}
                  </span>
                </div>
                <p className="text-[11px] text-[#6F4E37]">
                  Packaging fee (if Takeout) is calculated at checkout.
                </p>
              </div>

              <button
                onClick={() => {
                  setCartDrawerOpen(false);
                  navigateTo('checkout');
                }}
                className="w-full py-4 px-6 rounded-2xl bg-[#3B241C] hover:bg-[#6F4E37] text-white font-bold text-sm shadow-lg transition flex items-center justify-between"
              >
                <span>Proceed to Checkout</span>
                <span>{formatPHP(cartSubtotal)} →</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // 10. FOOTER & GLOBAL LAYOUT
  // ============================================================================

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFCF7] text-[#3B241C] font-sans selection:bg-[#D8C3A5] selection:text-[#3B241C]">
      {/* Google Fonts Injection for Playfair Display & Plus Jakarta Sans */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', Georgia, serif; }
        .font-sans { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-[#3B241C] text-[#FFFCF7] px-5 py-3.5 rounded-2xl shadow-2xl border border-[#D8C3A5]/40 flex items-center gap-3 text-xs sm:text-sm font-medium animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#D8C3A5] shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {renderNavbar()}

      <main className="flex-1">
        {activePage === 'home' && renderHomePage()}
        {activePage === 'menu' && renderMenuPage()}
        {activePage === 'checkout' && renderCheckoutPage()}
        {activePage === 'confirmation' && renderConfirmationPage()}
        {activePage === 'track' && renderTrackOrderPage()}
        {activePage === 'about' && renderAboutPage()}
        {activePage === 'contact' && renderContactPage()}
        {activePage === 'admin' && renderAdminPortal()}
      </main>

      {/* Footer */}
      <footer className="bg-[#3B241C] text-[#F5EFE6] border-t border-[#6F4E37]/40 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#6F4E37] text-[#F5EFE6] flex items-center justify-center">
                <Coffee className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold text-white">
                {settings.storeName}
              </span>
            </div>
            <p className="text-sm text-[#F5EFE6]/80 max-w-md leading-relaxed">
              Your daily dose of good coffee in Nasugbu, Batangas. Freshly brewed, carefully
              crafted, and made to make every sip memorable.
            </p>
            <div className="text-xs text-[#D8C3A5]">
              ★ 4.9/5 Google Rating (22 reviews) • Dine-in & Takeout
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif text-lg font-bold text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm text-[#F5EFE6]/80">
              <li>
                <button onClick={() => navigateTo('home')} className="hover:text-white">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('menu')} className="hover:text-white">
                  Digital Coffee Menu
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('track')} className="hover:text-white">
                  Track Order
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('admin')} className="hover:text-white">
                  Staff / Owner Dashboard
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif text-lg font-bold text-white">Visit Us</h4>
            <p className="text-xs text-[#F5EFE6]/80 leading-relaxed">{settings.address}</p>
            <p className="text-xs text-[#D8C3A5]">{settings.operatingHours}</p>
            <div className="flex items-center gap-3 pt-2">
              <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#D8C3A5]">
                <Globe className="w-4 h-4" />
              </span>
              <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#D8C3A5]">
                <Camera className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 px-4 text-center text-xs text-[#F5EFE6]/60">
          © {new Date().getFullYear()} {settings.storeName} • Nasugbu, Batangas, Philippines.
          Sample menu items & contact placeholders pending owner verification.
        </div>
      </footer>

      {/* Modals & Drawers */}
      {customizingProduct && (
        <CustomizationModal
          product={customizingProduct}
          existingCartItem={editingCartItem}
          onClose={() => {
            setCustomizingProduct(null);
            setEditingCartItem(null);
          }}
          onSave={handleSaveCartItem}
        />
      )}

      {renderCartDrawer()}
      {renderProductEditorModal()}
    </div>
  );
}