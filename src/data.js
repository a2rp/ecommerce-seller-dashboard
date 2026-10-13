const dateAt = (dayOffset, hour = 12, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

export const initialProducts = [
  { id: "p-101", name: "Weekend Pour-over Kit", sku: "COF-014", category: "Coffee", price: 48, stock: 22, lowAt: 8, status: "Active", sold: 148, icon: "coffee", description: "A compact ceramic brewer, glass carafe, and reusable filter for slow weekend mornings." },
  { id: "p-102", name: "Juniper Linen Tote", sku: "BAG-032", category: "Accessories", price: 34, stock: 6, lowAt: 10, status: "Active", sold: 92, icon: "bag", description: "A sturdy everyday carryall cut from washed European linen." },
  { id: "p-103", name: "Cedar & Sea Candle", sku: "HOM-008", category: "Home", price: 28, stock: 41, lowAt: 12, status: "Active", sold: 117, icon: "candle", description: "A small-batch soy candle with cedarwood, sea salt, and soft amber notes." },
  { id: "p-104", name: "Studio Stoneware Cup", sku: "TAB-021", category: "Tableware", price: 24, stock: 9, lowAt: 10, status: "Active", sold: 77, icon: "cup", description: "A hand-finished stoneware cup with a relaxed, thumb-shaped handle." },
  { id: "p-105", name: "Everyday Field Notebook", sku: "PAP-019", category: "Stationery", price: 18, stock: 58, lowAt: 16, status: "Active", sold: 203, icon: "book", description: "A pocket-sized dotted notebook with recycled paper and a cloth cover." },
  { id: "p-106", name: "Citrus Grove Tea Set", sku: "PAN-004", category: "Pantry", price: 32, stock: 0, lowAt: 8, status: "Paused", sold: 61, icon: "tea", description: "A bright loose-leaf tea trio with orange peel, lemongrass, and ginger." },
  { id: "p-107", name: "Olive Branch Soap Trio", sku: "BTH-015", category: "Bath", price: 26, stock: 14, lowAt: 8, status: "Active", sold: 88, icon: "soap", description: "Three cold-process olive oil soaps with gentle botanical scents." },
  { id: "p-108", name: "Soft Stripe Apron", sku: "KIT-027", category: "Kitchen", price: 42, stock: 31, lowAt: 8, status: "Active", sold: 56, icon: "apron", description: "A cross-back cotton apron with deep front pockets and relaxed stripes." },
  { id: "p-109", name: "Woven Coaster Pair", sku: "HOM-044", category: "Home", price: 16, stock: 4, lowAt: 12, status: "Active", sold: 39, icon: "woven", description: "Two textured, washable cotton coasters made by a small weaving studio." },
  { id: "p-110", name: "Blue Hour Serving Bowl", sku: "TAB-037", category: "Tableware", price: 56, stock: 17, lowAt: 6, status: "Draft", sold: 0, icon: "bowl", description: "A generous hand-glazed bowl in a deep blue glaze, ready for its first listing." },
];

export const initialOrders = [
  { id: "TD-4096", customer: "Nora Williams", email: "nora.williams@example.com", placedAt: dateAt(0, 8, 42), items: [{ name: "Weekend Pour-over Kit", quantity: 1 }, { name: "Cedar & Sea Candle", quantity: 1 }], total: 76, status: "New", channel: "Online store" },
  { id: "TD-4095", customer: "Caleb Moore", email: "caleb.moore@example.com", placedAt: dateAt(0, 8, 12), items: [{ name: "Everyday Field Notebook", quantity: 2 }], total: 36, status: "Packing", channel: "Online store" },
  { id: "TD-4094", customer: "Ava Thompson", email: "ava.thompson@example.com", placedAt: dateAt(0, 7, 36), items: [{ name: "Soft Stripe Apron", quantity: 1 }], total: 42, status: "Ready to ship", channel: "Market partner" },
  { id: "TD-4093", customer: "Milo Carter", email: "milo.carter@example.com", placedAt: dateAt(-1, 16, 21), items: [{ name: "Studio Stoneware Cup", quantity: 2 }, { name: "Woven Coaster Pair", quantity: 1 }], total: 64, status: "Shipped", channel: "Online store" },
  { id: "TD-4092", customer: "Leah Brooks", email: "leah.brooks@example.com", placedAt: dateAt(-1, 13, 4), items: [{ name: "Juniper Linen Tote", quantity: 1 }], total: 34, status: "Delivered", channel: "Online store" },
  { id: "TD-4091", customer: "Ethan Reed", email: "ethan.reed@example.com", placedAt: dateAt(-1, 10, 48), items: [{ name: "Cedar & Sea Candle", quantity: 2 }], total: 56, status: "Packing", channel: "Market partner" },
  { id: "TD-4090", customer: "Sofia Bennett", email: "sofia.bennett@example.com", placedAt: dateAt(-2, 15, 7), items: [{ name: "Olive Branch Soap Trio", quantity: 1 }, { name: "Everyday Field Notebook", quantity: 1 }], total: 44, status: "Delivered", channel: "Online store" },
  { id: "TD-4089", customer: "Owen Parker", email: "owen.parker@example.com", placedAt: dateAt(-2, 11, 27), items: [{ name: "Weekend Pour-over Kit", quantity: 1 }], total: 48, status: "New", channel: "Online store" },
  { id: "TD-4088", customer: "Ruby James", email: "ruby.james@example.com", placedAt: dateAt(-3, 9, 16), items: [{ name: "Citrus Grove Tea Set", quantity: 1 }], total: 32, status: "Cancelled", channel: "Online store" },
];

export const orderStatuses = ["New", "Packing", "Ready to ship", "Shipped", "Delivered", "Cancelled"];

export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);

export const formatShortDate = (date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(date));

export const getStockLabel = (product) => {
  if (product.stock === 0) return "Out of stock";
  if (product.stock <= product.lowAt) return "Low stock";
  return "In stock";
};