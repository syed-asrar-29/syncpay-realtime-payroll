import { Link } from "wouter";
import { Users, Briefcase, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-16 space-y-4 animate-in">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 tracking-tight">
            SyncPay
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-xl mx-auto font-light">
            Modern Leave & Salary Coordination System for forward-thinking teams.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Employee Card */}
          <Link href="/employee">
            <div className="group relative bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:bg-white/20 transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Employee Portal</h2>
              <p className="text-blue-100 mb-6">View your salary records, apply for leave, and track request status.</p>
              <div className="flex items-center text-blue-300 font-semibold group-hover:text-white transition-colors">
                Enter Portal <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Manager Card */}
          <Link href="/manager">
            <div className="group relative bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:bg-white/20 transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Manager Dashboard</h2>
              <p className="text-blue-100 mb-6">Review leave requests, manage employees, and audit salary records.</p>
              <div className="flex items-center text-indigo-300 font-semibold group-hover:text-white transition-colors">
                Access Dashboard <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-12 text-blue-200/40 text-sm font-mono">
          System v1.0 • Secure Connection • Real-time Updates
        </div>
      </div>
    </div>
  );
}
