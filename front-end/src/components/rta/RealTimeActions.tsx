import { UseFormReturn } from "react-hook-form";
import { UISettings } from "~/schemas/settings.schema";
import { AnuraCard } from "../ui/AnuraCard";
import {
  FileText,
  Link,
  MessageSquare,
  Send,
  Shield,
  Zap,
} from "lucide-react";
import { ActionCard } from "./ActionCard";
import { RedirectActionCard } from "./RedirectActionCard";
import { LoginProtectionActionCard } from "./LoginProtectionActionCard";
import { LoopingSettings } from "./LoopingSettings";

interface RealTimeActionsProps {
  form: UseFormReturn<UISettings>;
}

const ACTIONS = [
  {
    key: "disableForms",
    title: "Disable Forms",
    description: "Prevent form submissions from suspicious visitors",
    beta: false,
    icon: <FileText size={20} />,
  },
  {
    key: "disableCommentSubmits",
    title: "Disable Comment Submit Buttons",
    description: "Block comment form submissions specifically",
    beta: false,
    icon: <MessageSquare size={20} />,
  },
  {
    key: "disableAllSubmits",
    title: "Disable All Submit Buttons",
    description: "Disable all submit buttons on the page",
    beta: false,
    icon: <Send size={20} />,
  },
  {
    key: "disableLinks",
    title: "Disable Links",
    description: "Prevent navigation via links for suspicious visitors",
    beta: false,
    icon: <Link size={20} />,
  },
  {
    key: "disableAllInputs",
    title: "Disable All Forms, Buttons, and Inputs",
    description: "Comprehensive input blocking using Anura's built-in method",
    beta: false,
    icon: <Shield size={20} />,
  },
];

export function RealTimeActions({ form }: RealTimeActionsProps) {
  const midpoint = Math.ceil(ACTIONS.length / 2);
  const columns = [ACTIONS.slice(0, midpoint), ACTIONS.slice(midpoint)];

  return (
    <AnuraCard
      title="Real-Time Actions"
      subtitle="Protect your site automatically when suspicious visitors are detected"
      icon={<Zap size={20} />}
    >
      {/* Redirect Action */}
      <RedirectActionCard form={form} />

      {/* Login Protection Action */}
      <LoginProtectionActionCard form={form} />

      {/* Other Actions */}
      <div className="flex flex-col md:flex-row gap-6">
        {columns.map((columnActions, columnIndex) => (
          <div key={columnIndex} className="flex-1">
            {columnActions.map((action) => (
              <ActionCard
                key={action.key}
                enabledField={`${action.key}Enabled` as keyof UISettings}
                conditionField={`${action.key}Condition` as keyof UISettings}
                title={action.title}
                description={action.description}
                beta={action.beta}
                form={form}
                icon={action.icon}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Looping Settings */}
      <LoopingSettings form={form} />
    </AnuraCard>
  );
}
