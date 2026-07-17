import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Search, ShoppingCart, Plus, Minus, X, Package, Truck } from "lucide-react";

interface MedicineShopProps {
  onBack: () => void;
}

const categories = ["All", "Prescription", "OTC", "Vitamins", "Pain Relief", "Diabetes", "Heart"];

const medicines = [
  { id: 1, name: "Paracetamol 500mg", brand: "Crocin", price: 25, mrp: 32, category: "OTC", image: "💊", desc: "For fever and mild pain", available: true, prescription: false },
  { id: 2, name: "Metformin 500mg", brand: "Glycomet", price: 65, mrp: 80, category: "Diabetes", image: "💊", desc: "Blood sugar control", available: true, prescription: true },
  { id: 3, name: "Atorvastatin 10mg", brand: "Atorva", price: 120, mrp: 145, category: "Heart", image: "💊", desc: "Cholesterol management", available: true, prescription: true },
  { id: 4, name: "Vitamin D3 1000IU", brand: "D3 Must", price: 180, mrp: 220, category: "Vitamins", image: "🌞", desc: "Bone health support", available: true, prescription: false },
  { id: 5, name: "Ibuprofen 400mg", brand: "Brufen", price: 35, mrp: 42, category: "Pain Relief", image: "💊", desc: "Anti-inflammatory pain relief", available: true, prescription: false },
  { id: 6, name: "Amoxicillin 500mg", brand: "Moxikind", price: 95, mrp: 115, category: "Prescription", image: "💊", desc: "Antibiotic for infections", available: false, prescription: true },
  { id: 7, name: "Omeprazole 20mg", brand: "Omez", price: 45, mrp: 55, category: "OTC", image: "💊", desc: "Acid reflux relief", available: true, prescription: false },
  { id: 8, name: "Vitamin C 500mg", brand: "Limcee", price: 55, mrp: 65, category: "Vitamins", image: "🍊", desc: "Immunity booster", available: true, prescription: false },
  { id: 9, name: "Aspirin 75mg", brand: "Loprin", price: 28, mrp: 35, category: "Heart", image: "❤️", desc: "Blood thinner, heart health", available: true, prescription: false },
  { id: 10, name: "Pantoprazole 40mg", brand: "Pan D", price: 58, mrp: 72, category: "Prescription", image: "💊", desc: "Stomach acid reducer", available: true, prescription: true },
];

interface CartItem { id: number; name: string; price: number; qty: number; }

export function MedicineShop({ onBack }: MedicineShopProps) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [address, setAddress] = useState({ name: "", phone: "", addr: "", pin: "" });
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "address" | "success">("cart");

  const filtered = medicines.filter((m) =>
    (activeCat === "All" || m.category === activeCat) &&
    (m.name.toLowerCase().includes(query.toLowerCase()) || m.brand.toLowerCase().includes(query.toLowerCase()))
  );

  function addToCart(med: typeof medicines[0]) {
    setCart((c) => {
      const existing = c.find((i) => i.id === med.id);
      if (existing) return c.map((i) => i.id === med.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { id: med.id, name: med.name, price: med.price, qty: 1 }];
    });
  }

  function removeFromCart(id: number) {
    setCart((c) => c.filter((i) => i.id !== id));
  }

  function updateQty(id: number, delta: number) {
    setCart((c) => c.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: "linear-gradient(160deg, #f0fdf4 0%, #eff6ff 100%)" }}>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-5">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-green-600 transition-colors text-sm">
              <ArrowLeft size={16} /> Back
            </button>
            <button onClick={() => setShowCart(true)} className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
              style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
              <ShoppingCart size={16} /> Cart
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Header */}
          <div className="rounded-3xl p-5 mb-5 text-white flex items-center gap-3"
            style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", boxShadow: "0 12px 30px rgba(22,163,74,0.3)" }}>
            <Package size={28} />
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Medicine Shop</h1>
              <p className="text-green-100 text-sm">Fast delivery to your doorstep</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
            <input className="w-full pl-11 pr-4 py-3 rounded-2xl border text-sm outline-none focus:border-green-400 bg-white"
              style={{ borderColor: "rgba(22,163,74,0.2)" }}
              placeholder="Search medicines..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCat(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCat === cat ? "text-white" : "bg-white text-slate-600 border"}`}
                style={activeCat === cat ? { background: "linear-gradient(135deg, #16a34a, #15803d)" } : { borderColor: "rgba(22,163,74,0.2)" }}>
                {cat}
              </button>
            ))}
          </div>

          {/* Medicine grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map((med, i) => {
              const inCart = cart.find((c) => c.id === med.id);
              return (
                <motion.div key={med.id} className="bg-white rounded-2xl p-4 shadow-sm"
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="text-4xl mb-3 text-center">{med.image}</div>
                  <div className="flex items-center gap-1 mb-1">
                    {med.prescription && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600">Rx</span>
                    )}
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{med.category}</span>
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm leading-tight">{med.name}</h3>
                  <p className="text-xs text-slate-500">{med.brand}</p>
                  <p className="text-xs text-slate-400 mt-1">{med.desc}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-slate-800">₹{med.price}</span>
                    <span className="text-xs text-slate-400 line-through">₹{med.mrp}</span>
                  </div>

                  {!med.available ? (
                    <div className="mt-3 py-2 rounded-xl bg-slate-100 text-center text-xs text-slate-400">Out of Stock</div>
                  ) : inCart ? (
                    <div className="mt-3 flex items-center justify-between bg-green-50 rounded-xl px-2 py-1.5">
                      <button onClick={() => inCart.qty === 1 ? removeFromCart(med.id) : updateQty(med.id, -1)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center bg-green-200 text-green-700">
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-bold text-green-700">{inCart.qty}</span>
                      <button onClick={() => updateQty(med.id, 1)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center bg-green-500 text-white">
                        <Plus size={12} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(med)}
                      className="mt-3 w-full py-2 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-1"
                      style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
                      <Plus size={13} /> Add to Cart
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCart(false)} />
            <motion.div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: "white", maxHeight: "85vh" }}
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}>
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800" style={{ fontFamily: "var(--font-display)" }}>
                  {checkoutStep === "cart" ? "Your Cart" : checkoutStep === "address" ? "Delivery Address" : "Order Placed!"}
                </h3>
                <button onClick={() => { setShowCart(false); setCheckoutStep("cart"); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">
                  <X size={16} className="text-slate-500" />
                </button>
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: "60vh" }}>
                {checkoutStep === "cart" && (
                  <div className="p-4">
                    {cart.length === 0 ? (
                      <div className="py-12 text-center text-slate-400">
                        <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
                        <p>Your cart is empty</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-800">{item.name}</p>
                              <p className="text-xs text-slate-500">₹{item.price} × {item.qty}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-lg bg-slate-200 flex items-center justify-center"><Minus size={12} /></button>
                              <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                              <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-lg bg-green-500 text-white flex items-center justify-center"><Plus size={12} /></button>
                            </div>
                            <span className="text-sm font-bold text-slate-800 w-14 text-right">₹{item.price * item.qty}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {checkoutStep === "address" && (
                  <div className="p-4 space-y-3">
                    {[
                      { key: "name", label: "Full Name", type: "text" },
                      { key: "phone", label: "Phone Number", type: "tel" },
                      { key: "addr", label: "Delivery Address", type: "text" },
                      { key: "pin", label: "PIN Code", type: "text" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-xs font-medium text-slate-600 mb-1">{f.label}</label>
                        <input type={f.type}
                          value={address[f.key as keyof typeof address]}
                          onChange={(e) => setAddress({ ...address, [f.key]: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-green-400 bg-slate-50"
                          style={{ borderColor: "rgba(22,163,74,0.2)" }} />
                      </div>
                    ))}
                  </div>
                )}

                {checkoutStep === "success" && (
                  <div className="p-8 text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}>
                      <Truck size={60} className="mx-auto mb-4 text-green-500" />
                    </motion.div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">Order Placed Successfully!</h3>
                    <p className="text-slate-500 text-sm mb-4">Expected delivery in 24-48 hours</p>
                    <div className="flex items-center gap-2 justify-center text-sm text-green-600">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Order being processed
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && checkoutStep !== "success" && (
                <div className="p-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-500">Total ({cartCount} items)</span>
                    <span className="font-bold text-slate-800">₹{total}</span>
                  </div>
                  <button onClick={() => {
                    if (checkoutStep === "cart") setCheckoutStep("address");
                    else if (checkoutStep === "address") setCheckoutStep("success");
                  }}
                    className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm"
                    style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
                    {checkoutStep === "cart" ? "Proceed to Checkout" : "Place Order"}
                  </button>
                </div>
              )}
              {checkoutStep === "success" && (
                <div className="p-4 border-t border-slate-100">
                  <button onClick={() => { setShowCart(false); setCheckoutStep("cart"); setCart([]); }}
                    className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm"
                    style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
                    Continue Shopping
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
