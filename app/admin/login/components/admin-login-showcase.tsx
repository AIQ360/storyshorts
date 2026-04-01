"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BarChart3, Users, Settings } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Analytics & Overview",
    desc: "Monitor your platform's performance at a glance",
  },
  {
    icon: Users,
    title: "User Management",
    desc: "View and manage all registered users",
  },
  {
    icon: Settings,
    title: "Platform Settings",
    desc: "Configure your SaaS settings and credentials",
  },
];

export default function AdminLoginShowcase() {
  const headshotImages = [
    "/headshots/human1.png",
    "/headshots/human2.png",
    "/headshots/human3.png",
    "/headshots/human4.png",
    "/headshots/human5.png",
    "/headshots/human6.png",
    "/headshots/human7.png",
    "/headshots/human8.png",
  ];

  return (
    <div className="hidden lg:flex flex-col justify-between h-full bg-primary/5 p-8 overflow-hidden">
      {/* Top section */}
      <div className="space-y-1">
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-4xl xl:text-5xl font-bold text-black leading-tight">
            Manage Your
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0025cc] to-[#2b5fff]">
              Platform
            </span>{" "}
            With Ease
          </h1>
        </motion.div>

        {/* Headshot Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-4 gap-1.5 mt-6"
        >
          {headshotImages.map((src, index) => (
            <motion.div
              key={src}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              className="relative rounded-xl overflow-hidden border border-gray-200"
              style={{ width: 172, height: 172 }}
            >
              <Image
                src={src}
                alt={`AI Headshot ${index + 1}`}
                fill
                className="object-cover object-top"
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Features list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-3 pt-2"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <feature.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-black">
                  {feature.title}
                </p>
                <p className="text-xs text-gray-500">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom */}
      <div className="mt-4">
        <p className="text-xs text-gray-500 text-center">
          Framecast AI — Admin Panel
        </p>
      </div>
    </div>
  );
}
