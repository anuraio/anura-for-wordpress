// src/components/ui/EnhancedTabPanel.tsx
import React from "react";
import { TabPanel } from "@wordpress/components";
import { Icon, pencil } from "@wordpress/icons";

interface DynamicTab {
  name: string;
  title: string;
  className?: string;
  hasChanges?: boolean;
}

interface DynamicTabPanelProps {
  tabs: DynamicTab[];
  children: (tab: { name: string; title: string }) => React.ReactNode;
  className?: string;
  activeClass?: string;
  onSelect?: (tabName: string) => void;
}

interface TabPanelTab {
  name: string;
  title: string | React.ReactNode;
  className?: string;
}

export const DynamicTabPanel: React.FC<DynamicTabPanelProps> = ({
  tabs,
  children,
  className = "anura-tabs",
  activeClass = "is-active",
  onSelect,
}) => {
  // Transform tabs to include change indicators in titles
  const dynamicTabs: TabPanelTab[] = tabs.map((tab) => ({
    name: tab.name,
    title: (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          position: "relative",
        }}
      >
        <span>{tab.title}</span>
        {tab.hasChanges && (
          <Icon icon={pencil} size={20} style={{ color: "#d97706" }} />
        )}
      </div>
    ),
    className: tab.className,
  }));

  return (
    <TabPanel
      className={className}
      activeClass={activeClass}
      tabs={dynamicTabs}
      onSelect={onSelect}
    >
      {children}
    </TabPanel>
  );
};
