import { getByLabelText, getByRole, render } from "@solidjs/testing-library";
import { describe, beforeEach, expect, it, vi, beforeAll } from 'vitest';
import userEvent from '@testing-library/user-event';
import { createStore } from "solid-js/store";
import RealTimeSettings from "./RealTimeSettings";
import { getDefaultSettings } from "../../SettingsSchemas";

const user = userEvent.setup();

describe("RealTimeSettings Component", () => {
  const [settings, setSettings] = createStore(getDefaultSettings());
  const [realTimeSettings, setRealTimeSettings] = createStore(settings.realTimeActions);

  const fetchSpy = vi.spyOn(global, "fetch");

  beforeEach(() => setSettings(getDefaultSettings()));

  beforeAll(() => {
    const mockResolveValue = { 
      ok: true,
      json: () => new Promise((_resolve) => getDefaultSettings())
    };

    fetchSpy.mockReturnValue(mockResolveValue as any);
  });


  it("should prevent redirect URL from being greater than 2000 characters", async() => {
    const result = render(() => 
      <RealTimeSettings 
        realTimeSettings={realTimeSettings} 
        setRealTimeSettings={setRealTimeSettings}
      />
    );

    const redirectCondition = getByLabelText(result.container, "redirect-traffic") as HTMLSelectElement;
    await user.selectOptions(redirectCondition, "onWarning");


    const redirectURL = getByRole(result.container, "textbox") as HTMLInputElement;
    await user.click(redirectURL);

    // Equivalent to typing "a" key 300 times.
    await user.keyboard('{a>300/}');

    expect(redirectURL.value.length).toBe(256);
  }, 30000);
});