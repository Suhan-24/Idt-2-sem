import { motion } from "motion/react";
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Heart } from "lucide-react";

interface FooterProps {
  onNavigate: (section: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer style={{ background: "linear-gradient(160deg, #0d1b3e 0%, #0d2d6e 100%)" }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #1a6fd4, #16a34a)" }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="8" y="1" width="6" height="20" rx="2.5" fill="white" />
                  <rect x="1" y="8" width="20" height="6" rx="2.5" fill="white" />
                </svg>
              </div>
              <span className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>MedCare</span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed mb-4">
              Your complete healthcare platform. Emergency care, appointments, consultations, and medicine delivery — all in one place.
            </p>
            <div className="flex items-center gap-3">
              {[Facebook, Instagram, Twitter, Linkedin, Youtube].map((Icon, i) => (
                <motion.a key={i} href="#" className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                  whileHover={{ scale: 1.15 }}>
                  <Icon size={15} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-white" style={{ fontFamily: "var(--font-display)" }}>Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Home", section: "home" },
                { label: "Appointments", section: "appointment" },
                { label: "Video Consultation", section: "video" },
                { label: "Emergency Services", section: "emergency" },
                { label: "Medicine Shop", section: "medicine" },
              ].map(({ label, section }) => (
                <li key={label}>
                  <button onClick={() => onNavigate(section)}
                    className="text-blue-200 hover:text-white text-sm transition-colors">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold mb-4 text-white" style={{ fontFamily: "var(--font-display)" }}>Services</h4>
            <ul className="space-y-2.5">
              {["Healthcare", "Telemedicine", "Ambulance Support", "Medicine Delivery", "Tablet Reminder", "Health Records"].map((s) => (
                <li key={s}>
                  <span className="text-blue-200 text-sm">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4 text-white" style={{ fontFamily: "var(--font-display)" }}>Legal</h4>
            <ul className="space-y-2.5">
              {["Privacy Policy", "Terms & Conditions", "Cookie Policy", "HIPAA Compliance", "Grievance Redressal"].map((s) => (
                <li key={s}>
                  <a href="#" className="text-blue-200 hover:text-white text-sm transition-colors">{s}</a>
                </li>
              ))}
            </ul>

            <div className="mt-6 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.07)" }}>
              <p className="text-xs text-blue-200 font-medium">Emergency Helpline</p>
              <p className="text-white font-bold mt-1">1800 123 4567</p>
              <p className="text-blue-300 text-xs">Available 24/7</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-blue-300 text-sm flex items-center gap-1.5">
            © 2026 MedCare. All Rights Reserved. Made with <Heart size={14} className="text-red-400 fill-red-400" /> for better healthcare.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-blue-400 text-xs">🔒 HIPAA Compliant</span>
            <span className="text-blue-400 text-xs">✓ ISO Certified</span>
            <span className="text-blue-400 text-xs">🛡️ Secure Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
