"use client";

import {
  Users,
  Box,
  ImageIcon,
  Activity,
  DollarSign,
  Wand2,
  Coins,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

type Props = {
  stats: {
    totalUsers: number;
    totalModels: number;
    totalImages: number;
    totalEdits: number;
    totalRevenue: number;
    totalCreditsInCirculation: number;
  };
  recentModels: {
    id: number;
    name: string | null;
    status: string;
    type: string | null;
    pack: string | null;
    created_at: string;
    user_id: string | null;
  }[];
  recentPayments: {
    id: number;
    amount: number;
    currency: string;
    created_at: string;
    user_id: string;
  }[];
};

const statCards = [
  {
    key: "totalUsers" as const,
    label: "Total Users",
    icon: Users,
    color: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    key: "totalModels" as const,
    label: "Models Trained",
    icon: Box,
    color: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    key: "totalImages" as const,
    label: "Headshots Generated",
    icon: ImageIcon,
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    key: "totalEdits" as const,
    label: "Magic Edits",
    icon: Wand2,
    color: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "finished":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    case "processing":
      return "bg-blue-50 text-blue-700 border-blue-200/60";
    case "failed":
      return "bg-red-50 text-red-700 border-red-200/60";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200/60";
  }
}

export default function AdminOverview({
  stats,
  recentModels,
  recentPayments,
}: Props) {
  return (
    <div className="w-full max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-black">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Platform overview and recent activity
        </p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="rounded-2xl bg-white border border-gray-200/60 shadow-sm p-5"
          >
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-xl ${card.color} flex items-center justify-center shrink-0`}
              >
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-semibold text-black">
                  {stats[card.key].toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue + Credits row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-semibold text-black">
                $
                {stats.totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <Coins className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Credits in Circulation
              </p>
              <p className="text-2xl font-semibold text-black">
                {stats.totalCreditsInCirculation.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity — 2 column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Models */}
        <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-black">
                Recent Models
              </h3>
            </div>
            <Link
              href="/admin/users"
              className="text-xs text-muted-foreground hover:text-black transition-colors flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentModels.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No models yet
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentModels.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <Box className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-black truncate">
                        {model.name || "Untitled Model"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {model.pack ? "Style Pack" : model.type || "—"} &middot;{" "}
                        {new Date(model.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium shrink-0 ${getStatusColor(model.status)}`}
                  >
                    {model.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-black">
                Recent Payments
              </h3>
            </div>
          </div>
          {recentPayments.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No payments yet
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                      <DollarSign className="h-3.5 w-3.5 text-green-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-black">
                        ${payment.amount.toFixed(2)}{" "}
                        <span className="text-muted-foreground font-normal uppercase">
                          {payment.currency}
                        </span>
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {payment.user_id.slice(0, 8)}… &middot;{" "}
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 shrink-0">
                    paid
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            href: "/admin/users",
            label: "Manage Users",
            desc: "View & edit users",
            icon: Users,
          },
          {
            href: "/admin/billing-config",
            label: "Billing Packages",
            desc: "Configure pricing",
            icon: DollarSign,
          },
          {
            href: "/admin/emails",
            label: "Email Templates",
            desc: "Customise emails",
            icon: Wand2,
          },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-2xl bg-white border border-gray-200/60 shadow-sm p-5 flex items-center gap-3 hover:border-gray-300/80 transition-colors"
          >
            <div className="h-9 w-9 rounded-lg bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center shrink-0 transition-colors">
              <link.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-black">{link.label}</p>
              <p className="text-xs text-muted-foreground">{link.desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground ml-auto shrink-0 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
