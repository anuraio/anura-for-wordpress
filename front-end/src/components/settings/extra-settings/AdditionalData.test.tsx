import { getAllByRole, getByRole, render } from "@solidjs/testing-library";
import { describe, beforeEach, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import AdditionalData from "./AdditionalData";
import { createStore } from "solid-js/store";

function getDefaultScriptSettings(): ScriptSettings {
  return {
    instanceId: "",
    sourceMethod: "none",
    sourceValue: "",
    campaignMethod: "none",
    campaignValue: "",
    callbackFunction: "",
    additionalData: [""],
  };
}

const user = userEvent.setup();

describe("Additional Data Component", () => {
  const [scriptSettings, setScriptSettings] = createStore(getDefaultScriptSettings());

  beforeEach(() => setScriptSettings(getDefaultScriptSettings()));

  it("should only have one additional data element by default", () => {
    const result = render(() => <AdditionalData additionalData={scriptSettings.additionalData} setSettings={setScriptSettings} />);
    const dataElements = getAllByRole(result.container, "textbox");
    
    expect(dataElements.length).toBe(1);
  });

  it("should create a new textbox element when the add element button is clicked", async() => {
    const result = render(() => <AdditionalData additionalData={scriptSettings.additionalData} setSettings={setScriptSettings} />);
    const dataElements = getAllByRole(result.container, "textbox");
    const addElementButton = getByRole(result.container, "button", {name: "Add an element"});
    
    await user.click(addElementButton);
    const updatedDataElements = getAllByRole(result.container, "textbox");
  
    expect(updatedDataElements.length).toBe(dataElements.length + 1);
  });

  it("should remove an element when there are >1 data elements and the remove button is clicked", async () =>{
    const result = render(() => <AdditionalData additionalData={scriptSettings.additionalData} setSettings={setScriptSettings} />);
    const dataElements = getAllByRole(result.container, "textbox");

    const addElementButton = getByRole(result.container, "button", {name: "Add an element"});
    const removeElementButtons = getAllByRole(result.container, "button", {name: "Remove"});

    await user.click(addElementButton);
    await user.click(removeElementButtons[0]);

    const updatedDataElements = getAllByRole(result.container, "textbox");

    // Should be no change in length as an element was added, and immediately removed.
    expect(updatedDataElements.length).toBe(dataElements.length);
  });

  it("should not allow you to remove elements if there is only one element", async() => {
    const result = render(() => <AdditionalData additionalData={scriptSettings.additionalData} setSettings={setScriptSettings} />);
    const dataElements = getAllByRole(result.container, "textbox");
    const removeElementButtons = getAllByRole(result.container, "button", {name: "Remove"});

    await user.click(removeElementButtons[0]);
    const updatedDataElements = getAllByRole(result.container, "textbox");

    // Expecting no change in number of elements Despite clicking the remove button.
    expect(dataElements.length).toBe(updatedDataElements.length);
  });

  it("should not allow you to have more than 10 additional data elements", async() => {
    const result = render(() => <AdditionalData additionalData={scriptSettings.additionalData} setSettings={setScriptSettings} />);
    const addElementButton = getByRole(result.container, "button", {name: "Add an element"});

    const clickPromises: Promise<void>[] = [];
    for (let i = 0; i < 20; i++) {
      clickPromises.push(user.click(addElementButton));
    }
    await Promise.all(clickPromises);

    const updatedDataElements = getAllByRole(result.container, "textbox");

    /**
     * Despite clicking the add element button 20 times, 
     * there should still only be 10 data elements.
     */
    expect(updatedDataElements.length).toBe(10);
  });

  it("should prevent data elements being longer than 128 characters", async() => {
    const result = render(() => <AdditionalData additionalData={scriptSettings.additionalData} setSettings={setScriptSettings} />);
    const dataElement = getByRole(result.container, "textbox") as HTMLInputElement;

    await user.click(dataElement);

    // Equivalent to typing "a" key 200 times.
    await user.keyboard('{a>200/}');

    expect(dataElement.value.length).toBe(128);
  });
});