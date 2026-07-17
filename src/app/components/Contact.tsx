import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, Clock, MapPin, Send, CheckCircle } from "lucide-react";

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: "", email: "", phone: "", message: "" });
  }

  return (
    <section className="py-20 px-4" style={{ background: "linear-gradient(160deg, #eff6ff 0%, #f0fdf4 100%)" }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-3"
            style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a" }}>
            Contact Us
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Get in Touch with MedCare
          </h2>
          <p className="text-slate-500 mt-3">Our support team is available 24/7 to assist you</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: form */}
          <motion.div
            className="bg-white rounded-3xl p-8 shadow-sm"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-bold text-slate-800 mb-6" style={{ fontFamily: "var(--font-display)" }}>Send us a Message</h3>

            {sent ? (
              <motion.div className="flex flex-col items-center py-12"
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <CheckCircle size={56} className="text-green-500 mb-3" />
                <p className="font-semibold text-slate-800">Message Sent!</p>
                <p className="text-slate-500 text-sm mt-1">We'll get back to you within 30 minutes.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { key: "name", label: "Your Name", type: "text", placeholder: "Full name" },
                  { key: "email", label: "Email Address", type: "email", placeholder: "your@email.com" },
                  { key: "phone", label: "Phone Number", type: "tel", placeholder: "+91 XXXXX XXXXX" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder}
                      value={form[f.key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-blue-400 bg-slate-50"
                      style={{ borderColor: "rgba(26,111,212,0.2)" }} required />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                  <textarea rows={4} placeholder="How can we help you?"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-blue-400 bg-slate-50 resize-none"
                    style={{ borderColor: "rgba(26,111,212,0.2)" }} required />
                </div>
                <button type="submit"
                  className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg, #1a6fd4, #16a34a)" }}>
                  <Send size={16} /> Contact MedCare Support
                </button>
              </form>
            )}
          </motion.div>

          {/* Right: info + map */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {/* Contact info */}
            {[
              { icon: Mail, label: "Email Support", value: "support@medcare.health", color: "#1a6fd4", href: "mailto:support@medcare.health" },
              { icon: Phone, label: "24/7 Helpline", value: "+91 1800 123 4567 (Toll Free)", color: "#16a34a", href: "tel:18001234567" },
              { icon: Clock, label: "Working Hours", value: "Mon–Sun: 24 hours / 7 days", color: "#d97706", href: null },
              { icon: MapPin, label: "Head Office", value: "MedCare Technologies, HSR Layout, Bengaluru 560102", color: "#7c3aed", href: null },
            ].map(({ icon: Icon, label, value, color, href }) => (
              <div key={label} className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}18` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">{label}</p>
                  {href ? (
                    <a href={href} className="text-sm font-semibold text-slate-800 hover:underline" style={{ color }}>{value}</a>
                  ) : (
                    <p className="text-sm font-semibold text-slate-800">{value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Map placeholder */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ height: "200px" }}>
              <div className="w-full h-full relative" style={{ background: "linear-gradient(135deg, #e8f2ff, #f0fff8)" }}>
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=77.6,12.9,77.7,13.0&layer=mapnik"
                  className="w-full h-full border-0"
                  title="MedCare Location"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="px-3 py-1.5 rounded-xl text-white text-xs font-medium"
                    style={{ background: "rgba(26,111,212,0.85)" }}>
                    📍 MedCare Head Office, Bengaluru
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
