import { Button } from "@wordpress/components";
import { BotPattern } from "../../../schemas/settings.schema";
import { getPlatformLabel } from "../../../config/platforms";
import { DEFAULT_PLATFORM } from "../../../utils/bots";

interface PredefinedBotsListProps {
  botsByPlatform: Record<string, BotPattern[]>;
  allEnabled: boolean;
  onToggle: (botId: string, enabled: boolean) => void;
  onToggleAll: (enabled: boolean) => void;
}

export function PredefinedBotsList({ botsByPlatform, allEnabled, onToggle, onToggleAll }: PredefinedBotsListProps) {

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">
          Common Advertising Bots
        </h4>
        <Button variant="tertiary" size="small" onClick={() => onToggleAll(!allEnabled)}>
          {allEnabled ? "Unselect All" : "Select All"}
        </Button>
      </div>

      <div className="max-h-125 overflow-y-auto pr-2 border border-gray-200 rounded-md p-3 bg-gray-50">
        {Object.entries(botsByPlatform).map(([platform, platformBots]) => (
          <div key={platform} className="mb-3 last:mb-0">
            <div className="text-xs font-medium text-gray-600 mb-1">
              {platform === DEFAULT_PLATFORM ? 'Other Tools' : getPlatformLabel(platform)}
            </div>
            <div className="space-y-1">
              {platformBots.map((bot) => (
                <label
                  key={bot.id}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:bg-white rounded px-2 py-1 transition-colors ml-2"
                >
                  <input
                    type="checkbox"
                    checked={bot.enabled}
                    onChange={(e) => onToggle(bot.id, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="flex-1">{bot.name}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}