import { renderHook, act, waitFor } from "@testing-library/react";
import { useAnuraSettings } from "../useAnuraSettings";
import { describe, test, expect, vi, beforeEach } from "vitest";
import * as anuraApiService from "../../services/anura-api.service";
import { getDefaultUISettings } from "../../schemas/settings.schema";

// Mock the API service
vi.mock("../../services/anura-api.service");
const mockGetSettings = vi.mocked(anuraApiService.getSettings);
const mockSaveSettings = vi.mocked(anuraApiService.saveSettings);

describe("useAnuraSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("initializes with loading state and default values", () => {
    mockGetSettings.mockResolvedValue(getDefaultUISettings());

    const { result } = renderHook(() => useAnuraSettings());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.saveStatus).toBe("idle");
    expect(result.current.isDirty).toBe(false);
    expect(result.current.apiError).toBe("");
  });

  test("loads settings from API on mount", async () => {
    const mockSettings = {
      ...getDefaultUISettings(),
      instanceId: "test-instance-123",
    };
    mockGetSettings.mockResolvedValue(mockSettings);

    const { result } = renderHook(() => useAnuraSettings());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetSettings).toHaveBeenCalledOnce();
    expect(result.current.settings.instanceId).toBe("test-instance-123");
    expect(result.current.apiError).toBe("");
  });

  test("handles API error during settings load", async () => {
    const errorMessage = "Failed to fetch settings";
    mockGetSettings.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAnuraSettings());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.apiError).toBe(errorMessage);
  });

  test("handles non-Error objects during settings load", async () => {
    mockGetSettings.mockRejectedValue("Network error");

    const { result } = renderHook(() => useAnuraSettings());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.apiError).toBe("Failed to load settings");
  });

  test("provides form instance and methods", async () => {
    const mockSettings = getDefaultUISettings();
    mockGetSettings.mockResolvedValue(mockSettings);

    const { result } = renderHook(() => useAnuraSettings());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Form should be available
    expect(result.current.form).toBeDefined();
    expect(result.current.form.setValue).toBeTypeOf("function");
    expect(result.current.form.getValues).toBeTypeOf("function");
    expect(result.current.onSubmit).toBeTypeOf("function");
    expect(result.current.onReset).toBeTypeOf("function");
  });

  test("resets form to default values", async () => {
    const mockSettings = getDefaultUISettings();
    mockGetSettings.mockResolvedValue(mockSettings);

    const { result } = renderHook(() => useAnuraSettings());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Reset the form
    act(() => {
      result.current.onReset();
    });

    // Should reset to default values
    const currentSettings = result.current.settings;
    const defaultSettings = getDefaultUISettings();
    expect(currentSettings.instanceId).toBe(defaultSettings.instanceId);
    expect(currentSettings.sourceMethod).toBe(defaultSettings.sourceMethod);
  });

  test("tracks form dirty state when values change", async () => {
    const mockSettings = getDefaultUISettings();
    mockGetSettings.mockResolvedValue(mockSettings);

    const { result } = renderHook(() => useAnuraSettings());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isDirty).toBe(false);

    // Modify the form programmatically (needs shouldDirty)
    act(() => {
      result.current.form.setValue("instanceId", "modified-instance", { shouldDirty: true });
    });

    await waitFor(() => {
      expect(result.current.isDirty).toBe(true);
    });
  });

  test("exposes current settings values", async () => {
    const mockSettings = {
      ...getDefaultUISettings(),
      instanceId: "test-instance",
      sourceMethod: "get" as const,
    };
    mockGetSettings.mockResolvedValue(mockSettings);

    const { result } = renderHook(() => useAnuraSettings());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.settings.instanceId).toBe("test-instance");
    expect(result.current.settings.sourceMethod).toBe("get");
  });

  test("provides validation errors from form", async () => {
    const mockSettings = getDefaultUISettings();
    mockGetSettings.mockResolvedValue(mockSettings);

    const { result } = renderHook(() => useAnuraSettings());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Initially no errors
    expect(result.current.errors).toBeDefined();
    expect(Object.keys(result.current.errors)).toHaveLength(0);
  });
});