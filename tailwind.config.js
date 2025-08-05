/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
    "./agent/**/*.{ts,tsx,js,jsx}",
  ],
  safelist: [
    // Ensure workflow icon colors are never purged
    'bg-slate-100', 'text-slate-600',
    'bg-gray-100', 'text-gray-600',
    'bg-zinc-100', 'text-zinc-600',
    'bg-neutral-100', 'text-neutral-600',
    'bg-stone-100', 'text-stone-600',
    'bg-red-100', 'text-red-600',
    'bg-orange-100', 'text-orange-600',
    'bg-amber-100', 'text-amber-600',
    'bg-yellow-100', 'text-yellow-600',
    'bg-lime-100', 'text-lime-600',
    'bg-green-100', 'text-green-600',
    'bg-emerald-100', 'text-emerald-600',
    'bg-teal-100', 'text-teal-600',
    'bg-cyan-100', 'text-cyan-600',
    'bg-sky-100', 'text-sky-600',
    'bg-blue-100', 'text-blue-600',
    'bg-indigo-100', 'text-indigo-600',
    'bg-violet-100', 'text-violet-600',
    'bg-purple-100', 'text-purple-600',
    'bg-fuchsia-100', 'text-fuchsia-600',
    'bg-pink-100', 'text-pink-600',
    'bg-rose-100', 'text-rose-600',
  ],
  theme: {
    extend: {
      fontFamily: {
        "comic-mono": ['"Comic Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      components: {
        ".scrollbar-pretty":
          "overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar")],
};
