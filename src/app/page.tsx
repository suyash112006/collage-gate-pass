import Link from "next/link";
import { GraduationCap, Shield, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="landing-page">
      {/* Animated background orbs */}
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />

      <main className="landing-card">
        {/* Logo / Icon */}
        <div className="landing-logo-wrapper">
          <div className="landing-logo">
            <Sparkles className="w-7 h-7" />
          </div>
        </div>

        {/* Title */}
        <h1 className="landing-title">
          Smart Gate Pass
        </h1>
        <p className="landing-subtitle">
          College Gate Pass Management System
        </p>

        {/* Buttons */}
        <div className="landing-buttons">
          <Link href="/student/login" className="landing-btn landing-btn-student" id="student-login-link">
            <div className="landing-btn-icon">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="landing-btn-text">
              <span className="landing-btn-label">Student Login</span>
              <span className="landing-btn-desc">Access your gate passes</span>
            </div>
            <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity ml-auto" />
          </Link>

          <Link href="/tg/login" className="landing-btn landing-btn-tg" id="tg-login-link">
            <div className="landing-btn-icon landing-btn-icon-tg">
              <Shield className="w-5 h-5" />
            </div>
            <div className="landing-btn-text">
              <span className="landing-btn-label">Teacher Guardian</span>
              <span className="landing-btn-desc">Manage student requests</span>
            </div>
            <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity ml-auto" />
          </Link>
        </div>

        {/* Footer */}
        <p className="landing-footer">
          Secure • Fast • Paperless
        </p>
      </main>
    </div>
  );
}
