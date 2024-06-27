import { getByLabelText, render } from "@solidjs/testing-library";
import { describe, beforeEach, expect, it, vi, beforeAll } from 'vitest';
import userEvent from '@testing-library/user-event';
import Settings from "./Settings";
import { createStore } from "solid-js/store";
import { getDefaultSettings } from "./SettingsSchemas";

const user = userEvent.setup();

describe("Settings Component", () => {
  const [_settings, setSettings] = createStore(getDefaultSettings());
  const fetchSpy = vi.spyOn(global, "fetch");

  beforeEach(() => setSettings(getDefaultSettings()));

  beforeAll(() => {
    const mockResolveValue = { 
      ok: true,
      json: () => new Promise((_resolve) => getDefaultSettings())
    };

    fetchSpy.mockReturnValue(mockResolveValue as any);
  });

  it("should invalidate an instance id that's over 1,000,000,000,000,000", async() => {
    const result = render(() => <Settings />);

    const instanceId = getByLabelText(result.container, "instance-id");
    await user.click(instanceId);
    await user.keyboard("1000000000000001");

    expect(instanceId).toBeInvalid();
  });

  it("should prevent any non-number characters from being entered", async() => {
    const result = render(() => <Settings />);

    const instanceId = getByLabelText(result.container, "instance-id") as HTMLInputElement;
    await user.click(instanceId);
    await user.keyboard("1ab!2$cd3");

    expect(instanceId).toHaveValue(123);
  });

  it("should prevent source variable from being longer than 128 characters", async() => {
    const result = render(() => <Settings />);

    const sourceMethod = getByLabelText(result.container, "source-method") as HTMLSelectElement;
    await user.selectOptions(sourceMethod, "get");

    const sourceVariable = getByLabelText(result.container, "Source Variable") as HTMLInputElement;
    await user.click(sourceVariable);

    // Equivalent to typing "a" key 150 times.
    await user.keyboard('{a>150/}');

    expect(sourceVariable.value.length).toBe(128);
  });

  it("should prevent campaign variable from being longer than 128 characters", async() => {
    const result = render(() => <Settings />);

    const campaignMethod = getByLabelText(result.container, "campaign-method") as HTMLSelectElement;
    await user.selectOptions(campaignMethod, "get");

    const campaignVariable = getByLabelText(result.container, "Campaign Variable") as HTMLInputElement;
    await user.click(campaignVariable);

    // Equivalent to typing "a" key 150 times.
    await user.keyboard('{a>150/}');

    expect(campaignVariable.value.length).toBe(128);
  });

  it("should prevent callback function from being longer than 256 characters", async() => {
    const result = render(() => <Settings />);

    const callbackFunction = getByLabelText(result.container, "callback-function") as HTMLInputElement;
    await user.click(callbackFunction);
    await user.keyboard('{a>300/}');

    expect(callbackFunction.value.length).toBe(256);
  }, 6000);
});