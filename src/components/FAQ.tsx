import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How do I book an appointment?",
    a: "Click the 'Appointment' card on the home screen, search for nearby hospitals, choose a doctor and available time slot, fill in your details, and confirm your booking. You'll receive a confirmation notification instantly.",
  },
  {
    q: "How does video consultation work?",
    a: "Select 'Video Consultation' from the home screen, choose your doctor's specialization, pick an available doctor and time slot, complete the payment, and join the video call at the scheduled time. Our platform supports HD video with chat and document sharing.",
  },
  {
    q: "How can I set medicine reminders?",
    a: "Go to 'Tablet Reminder' on the home screen, tap the '+' button, enter your tablet name, dosage, reminder time, and frequency. You'll receive notifications at the set times and can mark medicines as taken directly from the alert.",
  },
  {
    q: "How do emergency ambulance requests work?",
    a: "Click the 'Emergency' card and allow location access. Our system instantly detects nearby ambulances with live tracking, shows estimated arrival times, and provides a direct call button to reach the driver. Help is dispatched within minutes.",
  },
  {
    q: "Is my medical information secure?",
    a: "Yes. MedCare uses end-to-end encryption for all medical data, complies with healthcare privacy standards, and never shares your information with third parties without your explicit consent. All consultations and records are stored securely.",
  },
  {
    q: "How can I contact customer support?",
    a: "You can reach our 24/7 support team via the Contact section at the bottom of this page, by calling our helpline at +91 1800 123 4567, or by emailing support@medcare.health. We typically respond within 30 minutes.",
  },
  {
    q: "Can I get prescription medicines delivered?",
    a: "Yes! Upload your prescription in the Medicine Shop section. Our licensed pharmacists review prescriptions and dispatch medicines within 2-4 hours in metros and 24-48 hours in other cities. Temperature-sensitive medicines are shipped with proper care.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept UPI (all apps), Credit Cards, Debit Cards, Net Banking, and popular wallets. All transactions are secured with 256-bit SSL encryption. EMI options are available for consultation packages above ₹2,000.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 px-4" style={{ background: "linear-gradient(160deg, #f8faff 0%, #f0fff8 100%)" }}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-3"
            style={{ background: "rgba(26,111,212,0.1)", color: "#1a6fd4" }}>
            FAQ
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 mt-3">Everything you need to know about MedCare</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{
                background: open === i ? "white" : "rgba(255,255,255,0.7)",
                border: open === i ? "1px solid rgba(26,111,212,0.2)" : "1px solid rgba(255,255,255,0.8)",
                boxShadow: open === i ? "0 8px 24px rgba(26,111,212,0.08)" : "0 2px 8px rgba(0,0,0,0.04)",
              }}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-semibold text-slate-800 text-sm pr-4" style={{ fontFamily: "var(--font-display)" }}>
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown size={18} className={open === i ? "text-blue-500" : "text-slate-400"} />
                </motion.div>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
