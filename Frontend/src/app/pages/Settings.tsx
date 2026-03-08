import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Bell,
  CreditCard,
  Shield,
  LogOut,
  Camera,
  Save,
  Trash2,
} from "lucide-react";

type TabType = "profile" | "account";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  return (
    <div className="p-8 bg-gray-100 dark:bg-[#0D1117] min-h-screen text-gray-900 dark:text-white">
      
      {/* PAGE HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">

        {/* SETTINGS SIDEBAR */}
        <div className="space-y-4">

          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3 space-y-2">

            <TabButton
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
              icon={<User size={18} />}
              label="Profile"
            />

            <TabButton
              active={activeTab === "account"}
              onClick={() => setActiveTab("account")}
              icon={<Shield size={18} />}
              label="Account"
            />

          </div>

          <button className="w-full flex items-center gap-2 text-red-500 hover:text-red-400 bg-red-500/10 px-4 py-3 rounded-xl">
            <LogOut size={18} />
            Log Out
          </button>

        </div>

        {/* CONTENT */}
        <div className="lg:col-span-3">

          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "account" && <AccountSettings />}

        </div>

      </div>

    </div>
  );
}

/* TAB BUTTON */

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition ${
        active
          ? "bg-blue-500 text-white"
          : "hover:bg-gray-100 dark:hover:bg-white/10"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* PROFILE SETTINGS */

function ProfileSettings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* PROFILE IMAGE */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6">

        <h3 className="font-semibold mb-6 text-lg">Profile Picture</h3>

        <div className="flex items-center gap-6">

          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl">
              JD
            </div>

            <button className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full">
              <Camera size={14} />
            </button>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              JPG, PNG or GIF. Max size 2MB.
            </p>

            <div className="flex gap-3 mt-3">

              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                Upload
              </button>

              <button className="px-4 py-2 bg-gray-200 dark:bg-white/10 rounded-lg">
                Remove
              </button>

            </div>
          </div>

        </div>

      </div>

      {/* PERSONAL INFO */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6">

        <h3 className="font-semibold mb-6 text-lg">Personal Information</h3>

        <div className="grid md:grid-cols-2 gap-6">

          <Input label="First Name" defaultValue="John" />
          <Input label="Last Name" defaultValue="Doe" />

          <div className="md:col-span-2">
            <Input label="Email" icon={<Mail size={16} />} defaultValue="john@example.com" />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-500">Bio</label>
            <textarea
              className="w-full mt-2 p-3 rounded-lg border dark:border-white/10 bg-gray-50 dark:bg-white/5"
              rows={3}
              defaultValue="Startup founder passionate about solving problems."
            />
          </div>

        </div>

        <div className="flex justify-end mt-6 gap-3">

          <button className="px-4 py-2 bg-gray-200 dark:bg-white/10 rounded-lg">
            Cancel
          </button>

          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2">
            <Save size={16} />
            Save Changes
          </button>

        </div>

      </div>
    </motion.div>
  );
}

/* ACCOUNT SETTINGS */

function AccountSettings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >

      {/* SECURITY */}
      <Card title="Security">

        <ActionRow
          icon={<Lock size={18} />}
          title="Password"
          desc="Last changed 3 months ago"
          action="Change"
        />

        <ActionRow
          icon={<Shield size={18} />}
          title="Two Factor Authentication"
          desc="Not enabled"
          action="Enable"
        />

      </Card>

      {/* NOTIFICATIONS */}
      <Card title="Notifications">

        <Toggle label="Session Reminders" />
        <Toggle label="AI Recommendations" />
        <Toggle label="Weekly Reports" />

      </Card>

      {/* BILLING */}
      <Card title="Subscription">

        <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">

          <div className="flex justify-between items-center">

            <div>
              <div className="font-semibold">Pro Plan</div>
              <div className="text-sm text-gray-500">$29/month</div>
            </div>

            <span className="text-green-500 text-sm">Active</span>

          </div>

        </div>

        <div className="flex gap-3 mt-4">

          <button className="flex-1 bg-gray-200 dark:bg-white/10 py-2 rounded-lg">
            Update Payment
          </button>

          <button className="flex-1 bg-gray-200 dark:bg-white/10 py-2 rounded-lg">
            Change Plan
          </button>

        </div>

      </Card>

      {/* DELETE ACCOUNT */}
      <Card title="Danger Zone">

        <button className="flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-lg">
          <Trash2 size={16} />
          Delete Account
        </button>

      </Card>

    </motion.div>
  );
}

/* REUSABLE COMPONENTS */

function Card({ title, children }: any) {
  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6">
      <h3 className="font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Input({ label, icon, ...props }: any) {
  return (
    <div>
      <label className="text-sm text-gray-500">{label}</label>

      <div className="relative mt-2">

        {icon && (
          <div className="absolute left-3 top-3 text-gray-400">
            {icon}
          </div>
        )}

        <input
          {...props}
          className={`w-full p-3 rounded-lg border dark:border-white/10 bg-gray-50 dark:bg-white/5 ${
            icon ? "pl-9" : ""
          }`}
        />

      </div>
    </div>
  );
}

function ActionRow({ icon, title, desc, action }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-lg mb-3">

      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-gray-500">{desc}</div>
        </div>
      </div>

      <button className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm">
        {action}
      </button>

    </div>
  );
}

function Toggle({ label }: any) {
  const [on, setOn] = useState(true);

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-lg mb-3">

      <span>{label}</span>

      <button
        onClick={() => setOn(!on)}
        className={`w-12 h-6 rounded-full relative ${
          on ? "bg-blue-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${
            on ? "translate-x-6" : ""
          }`}
        />
      </button>

    </div>
  );
}