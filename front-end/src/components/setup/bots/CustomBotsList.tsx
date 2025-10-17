import {
  TextControl,
  SelectControl,
  Button,
  Icon,
} from "@wordpress/components";
import { Settings, Plus } from "lucide-react";
import { trash } from "@wordpress/icons";
import { BotPattern } from "../../../schemas/settings.schema";
import { FieldError, Merge, FieldErrorsImpl } from "react-hook-form";

const TYPE_OPTIONS = [
  { label: "User Agent", value: "userAgent" },
  { label: "Page Location", value: "location" },
  { label: "Referrer", value: "referrer" },
] as const;

interface CustomBotsListProps {
  bots: BotPattern[];
  errors?: (Merge<FieldError, FieldErrorsImpl<BotPattern>> | undefined)[];
  onAdd: () => void;
  onUpdate: (botId: string, updates: Partial<BotPattern>) => void;
  onDelete: (botId: string) => void;
}

export function CustomBotsList({ bots, errors, onAdd, onUpdate, onDelete }: CustomBotsListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">Custom Patterns</h4>
        {bots.length > 0 && (
          <Button variant="secondary" size="small" onClick={onAdd}>
            Add Pattern
          </Button>
        )}
      </div>

      {bots.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center">
          <Settings size={24} className="mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500 mb-3">
            No custom patterns configured
          </p>
          <Button variant="secondary" size="small" onClick={onAdd}>
            Create Your First Pattern
          </Button>
        </div>
      ) : (
        <div className="max-h-125 overflow-y-auto space-y-2">
        {bots.map((bot, index) => {
          const botError = errors?.[index];
          const patternError = botError?.pattern?.message;
          const nameError = botError?.name?.message;

          return (
            <div key={bot.id} className="space-y-1">
              <div
                className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-md shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={bot.enabled}
                  onChange={(e) => onUpdate(bot.id, { enabled: e.target.checked })}
                  className="rounded border-gray-300"
                  aria-label={`Enable ${bot.type} pattern`}
                />

                <SelectControl
                  value={bot.type}
                  options={TYPE_OPTIONS}
                  onChange={(value) => onUpdate(bot.id, { type: value })}
                  __nextHasNoMarginBottom
                  className="w-32"
                />

                <span className="text-sm text-gray-500 px-2">contains</span>

                <div className="flex-1">
                  <TextControl
                    value={bot.pattern}
                    onChange={(value) => onUpdate(bot.id, { pattern: value || "" })}
                    placeholder="Enter pattern"
                    __nextHasNoMarginBottom
                    className={patternError ? "border-red-500" : ""}
                  />
                </div>

                <Button
                  variant="secondary"
                  isDestructive
                  size="small"
                  onClick={() => onDelete(bot.id)}
                  className="p-1"
                  aria-label={`Delete ${bot.type} pattern`}
                >
                  <Icon icon={trash} size={18} />
                </Button>
              </div>

              {(patternError || nameError) && (
                <div className="ml-8 text-xs text-red-600">
                  {patternError && <div>{patternError}</div>}
                  {nameError && <div>{nameError}</div>}
                </div>
              )}
            </div>
          );
        })}
        
          <div className="pt-2 ml-1">
            <Button variant="secondary" size="small" onClick={onAdd} icon={<Plus size={16}/>}>
              Add Another Pattern
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}