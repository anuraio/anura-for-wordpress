import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import {
  UISettings,
  UISettingsSchema,
  getDefaultUISettings,
} from "../schemas/settings.schema";
import {
  getSettings,
  saveSettings,
} from "../services/anura-api.service";

export function useAnuraSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [apiError, setApiError] = useState<string>("");

  const form = useForm<UISettings>({
    resolver: zodResolver(UISettingsSchema),
    defaultValues: getDefaultUISettings(),
    mode: "onBlur",
  });

  const {
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = form;

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSettings();
        reset(settings);
      } catch (error) {
        setApiError(
          error instanceof Error ? error.message : "Failed to load settings"
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadSettings();
  }, [reset]);

  const handleSave = async (data: UISettings) => {
    const currentValues = watch();

    setIsSaving(true);
    setSaveStatus("idle");
    setApiError("");

    try {
      await saveSettings(currentValues);
      setSaveStatus("success");
      reset(data, { keepValues: true });
    } catch (error) {
      setSaveStatus("error");
      setApiError(
        error instanceof Error ? error.message : "Failed to save settings"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    reset(getDefaultUISettings(), {
      keepValues: false,
      keepDirty: false,
      keepTouched: false,
    });
  };

  const clearSaveStatus = () => {
    setSaveStatus("idle");
    setApiError("");
  };

  return {
    // Form
    form,
    settings: watch(),

    // State
    isLoading,
    isSaving,
    saveStatus,
    isDirty,
    errors,
    apiError,

    // Actions
    onSubmit: handleSubmit(handleSave),
    onReset: handleReset,
    clearSaveStatus,
  };
}
