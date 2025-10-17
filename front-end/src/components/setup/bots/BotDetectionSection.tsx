import { BotPattern } from "../../../schemas/settings.schema";
import { PredefinedBotsList } from "./PredefinedBotsList";
import { CustomBotsList } from "./CustomBotsList";
import { groupBotsByPlatform, areAllBotsEnabled } from "../../../utils/bots";
import { FieldError, Merge, FieldErrorsImpl } from "react-hook-form";

interface BotDetectionSectionProps {
  bots: BotPattern[];
  enabledCount: number;
  errors?: Merge<FieldError, (Merge<FieldError, FieldErrorsImpl<BotPattern>> | undefined)[]>;
  onUpdateBots: (bots: BotPattern[]) => void;
}

export function BotDetectionSection({ bots, enabledCount, errors, onUpdateBots }: BotDetectionSectionProps) {
  const predefinedBots = bots.filter(bot => !bot.isCustom);
  const customBots = bots.filter(bot => bot.isCustom);

  const botsByPlatform = groupBotsByPlatform(predefinedBots);
  const allPredefinedEnabled = areAllBotsEnabled(predefinedBots);

  // Map bot errors to custom bots by finding their index in the original bots array
  const customBotErrors = customBots.map(bot => {
    const botIndex = bots.findIndex(b => b.id === bot.id);
    if (!errors || !Array.isArray(errors) || !errors[botIndex]) {
      return undefined;
    }
    return errors[botIndex] as Merge<FieldError, FieldErrorsImpl<BotPattern>>;
  });

  const toggleBot = (botId: string, enabled: boolean) => {
    const updated = bots.map(bot =>
      bot.id === botId ? { ...bot, enabled } : bot
    );
    onUpdateBots(updated);
  };

  const handleToggleAllPredefined = (enabled: boolean) => {
    const updated = bots.map(bot =>
      bot.isCustom ? bot : { ...bot, enabled }
    );
    onUpdateBots(updated);
  };

  const addCustomBot = () => {
    const newBot: BotPattern = {
      id: Date.now().toString(),
      name: "Custom Pattern",
      type: "userAgent",
      pattern: "",
      enabled: true,
      isCustom: true,
    };
    onUpdateBots([...bots, newBot]);
  };

  const updateCustomBot = (botId: string, updates: Partial<BotPattern>) => {
    const updated = bots.map(bot =>
      bot.id === botId ? { ...bot, ...updates } : bot
    );
    onUpdateBots(updated);
  };

  const deleteCustomBot = (botId: string) => {
    onUpdateBots(bots.filter(bot => bot.id !== botId));
  };

  return (
    <div className="ml-6 pl-4 border-l-2 border-gray-200">
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 list-none">
          <div className="flex items-center gap-2">
            <span className="group-open:rotate-90 transition-transform">
              ▶
            </span>
            Configure Bot List ({enabledCount} of {bots.length} enabled)
          </div>
        </summary>

        <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PredefinedBotsList
            botsByPlatform={botsByPlatform}
            allEnabled={allPredefinedEnabled}
            onToggle={toggleBot}
            onToggleAll={handleToggleAllPredefined}
          />

          <CustomBotsList
            bots={customBots}
            errors={customBotErrors}
            onAdd={addCustomBot}
            onUpdate={updateCustomBot}
            onDelete={deleteCustomBot}
          />
        </div>
      </details>
    </div>
  );
}