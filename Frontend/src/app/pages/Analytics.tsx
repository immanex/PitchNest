import {
  Sparkles,
  Users,
  Calendar,
  TrendingUp,
} from "lucide-react";

export default function PostPitchAnalytics() {
  return (
    <div className="p-8 bg-gray-100 dark:bg-[#0D1117] min-h-screen">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Deep Dive
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Comprehensive review of your pitching performance and investor readiness.
          </p>
        </div>

        <div className="flex gap-2 bg-white dark:bg-white/5 p-1 rounded-lg border border-gray-200 dark:border-white/10">
          <button className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white">
            Last 30 Days
          </button>
          <button className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">
            Last 90 Days
          </button>
        </div>

      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">

        <StatCard
          title="Avg. Investment Readiness"
          value="78/100"
          subtitle="+5%"
        />

        <StatCard
          title="Total Speaking Time"
          value="4.2 hrs"
          subtitle="Across 12 sessions"
        />

        <StatCard
          title="Most Improved Metric"
          value="Clarity"
        />

        <StatCard
          title="Avg. Investor Engagement"
          value="92%"
          subtitle="Peak engagement during Q&A"
        />

      </div>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* CHART */}
        <div className="lg:col-span-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-xl">

          <div className="flex items-center justify-between mb-6">

            <h2 className="font-semibold text-gray-900 dark:text-white">
              Pitch Score Trends
            </h2>

            <div className="flex gap-4 text-sm">

              <span className="flex items-center gap-1 text-blue-500">
                ● Readiness Score
              </span>

              <span className="flex items-center gap-1 text-purple-500">
                ● Confidence
              </span>

            </div>

          </div>

          {/* Fake Chart */}
          <div className="h-64 flex items-end gap-4">

            {[40, 55, 60, 70, 75, 80].map((v, i) => (
              <div
                key={i}
                style={{ height: `${v}%` }}
                className="flex-1 bg-blue-400/70 rounded-t-lg"
              />
            ))}

          </div>

        </div>

        {/* AI INSIGHTS */}
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-xl">

          <div className="flex items-center gap-2 mb-6">

            <Sparkles className="text-purple-500" size={18} />

            <h2 className="font-semibold text-gray-900 dark:text-white">
              AI Insights & Trends
            </h2>

          </div>

          <Insight
            tag="VOCAL CLARITY"
            text="Your confidence scores are 15% higher in the first 5 minutes than the Q&A section."
          />

          <Insight
            tag="VISUAL IMPACT"
            text="Technical experts respond most positively to your Slide 12 data visualization."
          />

          <Insight
            tag="ENGAGEMENT"
            text="Investor engagement peaks when you mention competitor differentiation."
          />

        </div>

      </div>

      {/* EXTRA METRICS */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">

        <MetricCard
          title="Market Understanding"
        />

        <MetricCard
          title="Technical Depth"
        />

      </div>

    </div>
  );
}

/* COMPONENTS */

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-xl">

      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {title}
      </div>

      <div className="text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </div>

      {subtitle && (
        <div className="text-sm text-green-500 mt-2">
          {subtitle}
        </div>
      )}

    </div>
  );
}

function Insight({
  tag,
  text,
}: {
  tag: string;
  text: string;
}) {
  return (
    <div className="mb-6">

      <div className="text-xs font-semibold text-purple-500 mb-2">
        {tag}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300">
        {text}
      </p>

    </div>
  );
}

function MetricCard({ title }: { title: string }) {
  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-xl">

      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>

      <div className="flex gap-3 items-end h-32">

        {[20, 30, 60, 40, 50].map((h, i) => (
          <div
            key={i}
            style={{ height: `${h}%` }}
            className="flex-1 bg-purple-500/70 rounded-t"
          />
        ))}

      </div>

    </div>
  );
}