import { Button, ButtonGroup, ButtonToolbar, Form, InputGroup, Toast, ToastContainer } from "solid-bootstrap";
import { Show, createSignal, onMount } from "solid-js";
import { createStore, unwrap } from "solid-js/store";
import SavePopup from "./SavePopup";
import ExtraSettings from "./ExtraSettings";
import { ScriptSchema, FallbackSchema, RealTimeSchema, getDefaultSettings, ServerActionsSchema } from "./SettingsSchemas";

export default function Settings() {
  const apiURL = "/?rest_route=/anura/v1/anura-settings";

  const [scriptSettings, setScriptSettings] = createStore(getDefaultSettings().script);
  const [fallbackSettings, setFallbackSettings] = createStore(getDefaultSettings().fallbacks);
  const [realTimeSettings, setRealTimeSettings] = createStore(getDefaultSettings().realTimeActions);
  const [serverSettings, setServerSettings] = createStore(getDefaultSettings().serverActions);

  const [showPopup, setShowPopup] = createSignal(false);
  const [showSaveSuccess, setShowSaveSuccess] = createSignal(false);
  const [disableForm, setDisableForm] = createSignal(false);

  // Fetching saved settings so that they're displayed on form when the page is loaded.
  onMount(async (): Promise<void> => {
    const response = await fetch(apiURL);
    if (response.status === 404) {
      setDisableForm(true);
    }

    const result = await response.json();
    setScriptSettings(result.script);
    setFallbackSettings(result.fallbacks);
    setRealTimeSettings(result.realTimeActions);
    setServerSettings(result.serverActions);
  });

  const resetSettings = (): void => {
    const defaultSettings = getDefaultSettings();
    setScriptSettings(defaultSettings.script);
    setFallbackSettings(defaultSettings.fallbacks);
    setRealTimeSettings(defaultSettings.realTimeActions);
    setServerSettings(defaultSettings.serverActions);
  };

  // Submits to PHP backend for processing
  const onSubmit = async(event: Event): Promise<Response> => {
    event.preventDefault();
    handleValidation();
    const response = await fetch(apiURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        script: unwrap(scriptSettings),
        fallbacks: unwrap(fallbackSettings),
        realTimeActions: unwrap(realTimeSettings),
        serverActions: unwrap(serverSettings)
      })
    });

    return response;
  };

  const displayPopup = (e: SubmitEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setShowPopup(true);
  };

  const handleValidation = () => {
    const finalizedScriptSettings = unwrap(scriptSettings);

    // Manually checking if the entered instance ID contains a decimal
    if (finalizedScriptSettings.instanceId.includes(".")) {
      throw new Error("Instance ID must be a whole number.");
    }

    const scriptResult = ScriptSchema.safeParse(finalizedScriptSettings);
    if (!scriptResult.success) {
      // Displaying only the first error message as it's the most important error.
      throw new Error(scriptResult.error.issues[0].message);
    }

    const fallbackResult = FallbackSchema.safeParse(unwrap(fallbackSettings));
    if (!fallbackResult.success) {
      throw new Error(fallbackResult.error.issues[0].message);
    }

    const realTimeResult = RealTimeSchema.safeParse(unwrap(realTimeSettings));
    if (!realTimeResult.success) {
      throw new Error(realTimeResult.error.issues[0].message);
    }

    const serverActionsResult = ServerActionsSchema.safeParse(unwrap(serverSettings));
    if (!serverActionsResult.success) {
      throw new Error(serverActionsResult.error.issues[0].message);
    }

    return [];
  }

  return (
    <>
      <div style="padding-left: 40px; padding-top: 20px; width: 700px">
        {/* Confirm Changes Popup */}
        <SavePopup
          showPopup={showPopup}
          setShowPopup={setShowPopup}
          submit={onSubmit}
          setShowToast={setShowSaveSuccess}
        />

        <Form onSubmit={displayPopup}>
          <fieldset disabled={disableForm()}>
            {/* Instance ID */}
            <Form.Group class="mb-3" controlId="formAnuraInstanceId">
              <Form.Label>Instance ID</Form.Label>
              <InputGroup hasValidation>
                <Form.Control
                  type="number"
                  aria-label="instance-id"
                  placeholder="Enter Instance ID"
                  onInput={e => setScriptSettings({ instanceId: e.target.value })}
                  value={scriptSettings.instanceId}
                  required
                  max={1_000_000_000_000_000}
                />
              </InputGroup>
              <Form.Text class="text-muted">Your assigned Instance ID.</Form.Text>
            </Form.Group>

            {/* Source Method */}
            <Form.Group class="mb-3" controlId="formAnuraSourceMethod">
              <Form.Label>Source Method</Form.Label>
              <Form.Select aria-label="source-method" onChange={e => setScriptSettings({ sourceMethod: e.target.value })}>
                <option value="get" selected={scriptSettings.sourceMethod === "get"}>GET Method</option>
                <option value="post" selected={scriptSettings.sourceMethod === "post"}>POST Method</option>
                <option value="hardCoded" selected={scriptSettings.sourceMethod === "hardCoded"}>Hard Coded</option>
                <option value="none" selected={scriptSettings.sourceMethod === "none"}>None</option>
              </Form.Select>
            </Form.Group>

            {/* Source Value */}
            <Show when={scriptSettings.sourceMethod !== "none"}>
              <Form.Group class="mb-3" controlId="formSourceValue">
                <Form.Label>Source Variable</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Source Variable"
                  onInput={(e) => setScriptSettings({ sourceValue: e.target.value })}
                  value={scriptSettings.sourceValue}
                  maxLength={128}
                  required
                />

                <Form.Text class="text-muted">
                  A variable, declared by you, to identify "source" traffic within Anura's dashboard interface.
                </Form.Text>
              </Form.Group>
            </Show>

            {/* Campaign Method */}
            <Form.Group class="mb-3" controlId="formAnuraCampaignMethod">
                <Form.Label>Campaign Method</Form.Label>
                <Form.Select aria-label="campaign-method" onChange={e => setScriptSettings({ campaignMethod: e.target.value })}>
                  <option value="get" selected={scriptSettings.campaignMethod === "get"}>GET Method</option>
                  <option value="post" selected={scriptSettings.campaignMethod === "post"}>POST Method</option>
                  <option value="hardCoded" selected={scriptSettings.campaignMethod === "hardCoded"}>Hard Coded</option>
                  <option value="none" selected={scriptSettings.campaignMethod === "none"}>None</option>
                </Form.Select>
            </Form.Group>

            {/* Campaign Value */}
            <Show when={scriptSettings.campaignMethod !== "none"}>
              <Form.Group class="mb-3" controlId="formAnuraCampaignValue">
                <Form.Label>Campaign Variable</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Campaign Variable"
                  onInput={(e) => setScriptSettings({ campaignValue: e.target.value })}
                  value={scriptSettings.campaignValue}
                  maxLength={128}
                  required
                />
                <Form.Text class="text-muted">
                  A subset variable of "source," declared by you, to identify "campaign" traffic within Anura's dashboard interface.
                </Form.Text>
              </Form.Group>
            </Show>

            {/* Callback Function */}
            <Form.Group class="mb-3" controlId="formAnuraCallbackFunction">
              <Form.Label>Optional Callback Function</Form.Label>
              <Form.Control
                type="text"
                aria-label="callback-function"
                placeholder="Enter Callback Function Name"
                onInput={(e) => setScriptSettings({ callbackFunction: e.target.value })}
                maxLength={256}
                value={scriptSettings.callbackFunction}
              />
              <Form.Text class="text-muted">
                Callback functions are allowed to start with: "$", "_", or "a-z" characters, followed by "a-z" and "0-9" characters. 
                <strong>Note:</strong> if you are utilizing any of our <strong>Real-Time Actions</strong> in this plugin, 
                the Anura object's <strong>queryResult()</strong> method will be called. 
                Please refer to our <a href="https://docs.anura.io/integration/callback-functions">docs</a> to view how your callback function may be impacted when 
                using Real-Time Actions.
              </Form.Text>
            </Form.Group>

            <ExtraSettings 
              scriptSettings={scriptSettings}
              setScriptSettings={setScriptSettings}
              fallbackSettings={fallbackSettings}
              setFallbackSettings={setFallbackSettings}
              realTimeSettings={realTimeSettings}
              setRealTimeSettings={setRealTimeSettings}
              serverSettings={serverSettings}
              setServerSettings={setServerSettings}
            />

            <ButtonToolbar aria-label="Save toolbar">
              <ButtonGroup class="me-2">
                <Button variant="primary" type="submit" onSubmit={e => displayPopup(e)} style="margin-top:30px;">
                  Save Changes
                </Button>
              </ButtonGroup>

              <ButtonGroup class="me-2">
                <Button variant="secondary" onClick={e => resetSettings()} 
                  style="margin-top:30px;">
                  Reset to Default Settings
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
          </fieldset>
        </Form>
      </div>
      <div style="padding-bottom: 20px;"></div>

      {/* Settings Save Success Message */}
      <ToastContainer position="bottom-end" class="p-3">
        <Toast
          onClose={() => setShowSaveSuccess(false)}
          show={showSaveSuccess()}
          delay={1500}
          autohide
        >
          <Toast.Header>
            <strong class="me-auto">Anura For WordPress</strong>
          </Toast.Header>
          <Toast.Body>
            Settings were successfully saved.
          </Toast.Body>
        </Toast>
      </ToastContainer>

    </>
  );
}
