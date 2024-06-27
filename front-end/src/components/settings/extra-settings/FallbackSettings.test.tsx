import { getByLabelText, render } from "@solidjs/testing-library";
import { describe, beforeEach, expect, it, vi, beforeAll } from 'vitest';
import userEvent from '@testing-library/user-event';
import { createStore } from "solid-js/store";
import FallbackSettings from "./FallbackSettings";
import { getDefaultSettings } from "../SettingsSchemas";

const user = userEvent.setup();

describe("FallbackSettings Component", () => {
  const [settings, setSettings] = createStore(getDefaultSettings());
  const [fallbackSettings, setFallbackSettings] = createStore(settings.fallbacks);

  const fetchSpy = vi.spyOn(global, "fetch");

  beforeEach(() => {
    setSettings(getDefaultSettings());
    setFallbackSettings(settings.fallbacks);
  });

  beforeAll(() => {
    const mockResolveValue = { 
      ok: true,
      json: () => new Promise((_resolve) => getDefaultSettings())
    };

    fetchSpy.mockReturnValue(mockResolveValue as any);
  });

  it("should not allow fallback sources to contain more than 128 characters", async() => {
    const result = render(() => 
      <FallbackSettings
        fallbackSources={fallbackSettings.sources}
        fallbackCampaigns={fallbackSettings.campaigns}
        setFallbackSettings={setFallbackSettings}
      />
    ); 

    const fallbackSource = getByLabelText(result.container, "fallback-source-1") as HTMLInputElement;
    await user.click(fallbackSource);

    // Equivalent to typing "a" key 200 times.
    await user.keyboard('{a>200/}');

    expect(fallbackSource.value.length).toBe(128);
  });

  it("should not allow fallback campaigns to contain more than 128 characters", async() => {
    const result = render(() => 
      <FallbackSettings
        fallbackSources={fallbackSettings.sources}
        fallbackCampaigns={fallbackSettings.campaigns}
        setFallbackSettings={setFallbackSettings}
      />
    ); 

    const fallbackCampaign = getByLabelText(result.container, "fallback-campaign-1") as HTMLInputElement;
    await user.click(fallbackCampaign);

    // Equivalent to typing "a" key 200 times.
    await user.keyboard('{a>200/}');

    expect(fallbackCampaign.value.length).toBe(128);
  });
});