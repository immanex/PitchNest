import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  User, 
  Mail, 
  Lock, 
  Bell, 
  CreditCard,
  Shield,
  LogOut,
  ChevronLeft,
  Camera,
  Save,
  Trash2
} from 'lucide-react';

type TabType = 'profile' | 'account';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#3B82F6] opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold">Settings</h1>
          </div>
          <p className="text-gray-400 text-lg">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 space-y-2">
              <TabButton
                active={activeTab === 'profile'}
                onClick={() => setActiveTab('profile')}
                icon={<User className="w-5 h-5" />}
                label="Profile"
              />
              <TabButton
                active={activeTab === 'account'}
                onClick={() => setActiveTab('account')}
                icon={<Shield className="w-5 h-5" />}
                label="Account"
              />
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
              <button className="w-full flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'account' && <AccountSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active
          ? 'bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] shadow-[0_0_20px_rgba(59,130,246,0.3)]'
          : 'bg-white/5 hover:bg-white/10'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ProfileSettings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Profile Picture */}
      <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
        <h3 className="text-xl font-semibold mb-6">Profile Picture</h3>
        
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] flex items-center justify-center text-3xl">
              JD
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#3B82F6] flex items-center justify-center hover:bg-[#7C3AED] transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-3">
              Upload a new profile picture. JPG, PNG or GIF. Max 2MB.
            </p>
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-lg bg-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6]/30 transition-all">
                Upload New
              </button>
              <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
        <h3 className="text-xl font-semibold mb-6">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm mb-2">First Name</label>
            <input
              type="text"
              defaultValue="John"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#3B82F6]/50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Last Name</label>
            <input
              type="text"
              defaultValue="Doe"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#3B82F6]/50 focus:outline-none transition-colors"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                defaultValue="john.doe@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#3B82F6]/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-2">Bio</label>
            <textarea
              rows={4}
              defaultValue="Startup founder passionate about solving real-world problems with technology."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#3B82F6]/50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Industry</label>
            <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#3B82F6]/50 focus:outline-none transition-colors">
              <option>SaaS</option>
              <option>FinTech</option>
              <option>Healthcare</option>
              <option>E-Commerce</option>
              <option>EdTech</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2">Experience Level</label>
            <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#3B82F6]/50 focus:outline-none transition-colors">
              <option>Intermediate</option>
              <option>Beginner</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
            Cancel
          </button>
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all flex items-center gap-2">
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AccountSettings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Security */}
      <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
        <h3 className="text-xl font-semibold mb-6">Security</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <div className="font-semibold">Password</div>
                <div className="text-sm text-gray-400">Last changed 3 months ago</div>
              </div>
            </div>
            <button className="px-4 py-2 rounded-lg bg-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6]/30 transition-all">
              Change
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <div className="font-semibold">Two-Factor Authentication</div>
                <div className="text-sm text-gray-400">Not enabled</div>
              </div>
            </div>
            <button className="px-4 py-2 rounded-lg bg-[#10B981]/20 text-[#10B981] hover:bg-[#10B981]/30 transition-all">
              Enable
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
        <h3 className="text-xl font-semibold mb-6">Notifications</h3>
        
        <div className="space-y-4">
          <NotificationToggle
            label="Session Reminders"
            description="Get notified when it's time to practice"
            defaultChecked={true}
          />
          <NotificationToggle
            label="AI Recommendations"
            description="Receive personalized improvement suggestions"
            defaultChecked={true}
          />
          <NotificationToggle
            label="Weekly Reports"
            description="Get a summary of your weekly progress"
            defaultChecked={true}
          />
          <NotificationToggle
            label="Product Updates"
            description="Be the first to know about new features"
            defaultChecked={false}
          />
        </div>
      </div>

      {/* Subscription */}
      <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
        <h3 className="text-xl font-semibold mb-6">Subscription</h3>
        
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#7C3AED]/20 border border-[#3B82F6]/30 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold">Pro Plan</div>
              <div className="text-sm text-gray-400">$29/month</div>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] text-sm">
              Active
            </div>
          </div>
          <div className="text-sm text-gray-300">
            Next billing date: April 3, 2026
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />
            Update Payment
          </button>
          <button className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
            Change Plan
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30">
        <h3 className="text-xl font-semibold mb-6 text-red-400">Danger Zone</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5">
            <div>
              <div className="font-semibold text-red-400">Delete Account</div>
              <div className="text-sm text-gray-400">Permanently delete your account and all data</div>
            </div>
            <button className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function NotificationToggle({ 
  label, 
  description, 
  defaultChecked 
}: { 
  label: string; 
  description: string; 
  defaultChecked: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/20 flex items-center justify-center">
          <Bell className="w-5 h-5 text-[#7C3AED]" />
        </div>
        <div>
          <div className="font-semibold">{label}</div>
          <div className="text-sm text-gray-400">{description}</div>
        </div>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-[#3B82F6]' : 'bg-white/20'
        }`}
      >
        <motion.div
          className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white"
          animate={{ x: checked ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}
