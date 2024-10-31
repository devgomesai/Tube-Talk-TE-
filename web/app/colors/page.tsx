"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { toast } from "sonner"

const colors = [
  { name: "--background", className: "bg-[hsl(var(--background))]" },
  { name: "--foreground", className: "bg-[hsl(var(--foreground))]" },
  { name: "--card", className: "bg-[hsl(var(--card))]" },
  { name: "--card-foreground", className: "bg-[hsl(var(--card-foreground))]" },
  { name: "--popover", className: "bg-[hsl(var(--popover))]" },
  { name: "--popover-foreground", className: "bg-[hsl(var(--popover-foreground))]" },
  { name: "--primary", className: "bg-[hsl(var(--primary))]" },
  { name: "--primary-foreground", className: "bg-[hsl(var(--primary-foreground))]" },
  { name: "--secondary", className: "bg-[hsl(var(--secondary))]" },
  { name: "--secondary-foreground", className: "bg-[hsl(var(--secondary-foreground))]" },
  { name: "--muted", className: "bg-[hsl(var(--muted))]" },
  { name: "--muted-foreground", className: "bg-[hsl(var(--muted-foreground))]" },
  { name: "--accent", className: "bg-[hsl(var(--accent))]" },
  { name: "--accent-foreground", className: "bg-[hsl(var(--accent-foreground))]" },
  { name: "--destructive", className: "bg-[hsl(var(--destructive))]" },
  { name: "--destructive-foreground", className: "bg-[hsl(var(--destructive-foreground))]" },
  { name: "--border", className: "bg-[hsl(var(--border))]" },
  { name: "--input", className: "bg-[hsl(var(--input))]" },
  { name: "--ring", className: "bg-[hsl(var(--ring))]" },
  { name: "--chart-1", className: "bg-[hsl(var(--chart-1))]" },
  { name: "--chart-2", className: "bg-[hsl(var(--chart-2))]" },
  { name: "--chart-3", className: "bg-[hsl(var(--chart-3))]" },
  { name: "--chart-4", className: "bg-[hsl(var(--chart-4))]" },
  { name: "--chart-5", className: "bg-[hsl(var(--chart-5))]" },
  { name: "--sidebar-background", className: "bg-[hsl(var(--sidebar-background))]" },
  { name: "--sidebar-foreground", className: "bg-[hsl(var(--sidebar-foreground))]" },
  { name: "--sidebar-primary", className: "bg-[hsl(var(--sidebar-primary))]" },
  { name: "--sidebar-primary-foreground", className: "bg-[hsl(var(--sidebar-primary-foreground))]" },
  { name: "--sidebar-accent", className: "bg-[hsl(var(--sidebar-accent))]" },
  { name: "--sidebar-accent-foreground", className: "bg-[hsl(var(--sidebar-accent-foreground))]" },
  { name: "--sidebar-border", className: "bg-[hsl(var(--sidebar-border))]" },
  { name: "--sidebar-ring", className: "bg-[hsl(var(--sidebar-ring))]" }
];
const ColorGrid = ({ colors, searchQuery }) => {

  const handleCopy = (colorName) => {
    navigator.clipboard.writeText(`${colorName.replace('--', '')}`);
    toast("Copied!", {
      description: `*${colorName.replace('--', '')}* copied to clipboard`,
      duration: 2000,
    });
  };
  const groupedColors = {
    base: colors.filter(c => ['background', 'foreground', 'border', 'input', 'ring'].some(term => c.name.includes(term) && !c.name.includes('sidebar'))),
    card: colors.filter(c => c.name.includes('card')),
    popover: colors.filter(c => c.name.includes('popover')),
    primary: colors.filter(c => c.name.includes('primary') && !c.name.includes('sidebar')),
    secondary: colors.filter(c => c.name.includes('secondary')),
    accent: colors.filter(c => c.name.includes('accent') && !c.name.includes('sidebar')),
    muted: colors.filter(c => c.name.includes('muted')),
    destructive: colors.filter(c => c.name.includes('destructive')),
    chart: colors.filter(c => c.name.includes('chart')),
    sidebar: colors.filter(c => c.name.includes('sidebar')),
  };

  const ColorCard = ({ color }) => (
    <div
      className="w-full flex flex-col space-y-2 p-2 rounded-lg border hover:border-primary transition-colors cursor-pointer"
      onClick={() => handleCopy(color.name)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCopy(color.name);
        }
      }}
    >
      <div className={`w-full h-16 rounded-md ${color.className}`} />
      <div className="space-y-1">
        <p className="font-mono text-sm truncate" title={color.name.replace('--', '')}>
          {color.name.replace('--', '')}
        </p>
        <p className="text-xs text-muted-foreground truncate" title={`var(${color.name})`}>
          var({color.name})
        </p>
      </div>
    </div>
  );

  const ColorSection = ({ title, colors }) => {
    const filteredColors = colors.filter(color =>
      color.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredColors.length === 0) return null;

    return (
      <div className="space-y-3 mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredColors.map((color) => (
            <ColorCard key={color.name} color={color} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedColors).map(([category, colors]) => (
        <ColorSection
          key={category}
          title={category.charAt(0).toUpperCase() + category.slice(1)}
          colors={colors}
        />
      ))}
    </div>
  );
};

const SearchBar = ({ value, onChange, inputRef }) => {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        placeholder="Search colors... (Press '/' to focus)"
        className="pl-8"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
};

const ShadcnColors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Theme Colors</CardTitle>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            inputRef={searchInputRef}
          />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold mb-4">Light Theme</h2>
              <div className="light">
                <ColorGrid colors={colors} searchQuery={searchQuery} />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-4">Dark Theme</h2>
              <div className="dark">
                <ColorGrid colors={colors} searchQuery={searchQuery} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShadcnColors;
