import { Accordion, Form } from "solid-bootstrap";
import { For, Show } from "solid-js";
import { SetStoreFunction, produce } from "solid-js/store";
import LoopingSettings from "./LoopingSettings";

interface RealTimeSettingsProps {
  realTimeSettings: RealTimeSettings,
  setRealTimeSettings: SetStoreFunction<RealTimeSettings>
}

export default function RealTimeSettings(props: RealTimeSettingsProps) {
  const actionNames = [
    "Disable Forms",
    "Disable Comment Submit Buttons",
    "Disable All Submit Buttons",
    "Disable Links",
    "Disable All Forms, Buttons, and Inputs"
  ];

  const updateRedirectCondition = (e: Event) => {
    const element = e.target as HTMLSelectElement;
    const value = element.value ?? "noRedirect";

    props.setRealTimeSettings(
      produce((settings) => {
        settings.redirectAction.resultCondition = value;
      })
    );
  };

  const updateRedirectURL = (e: Event) => {
    const element = e.target as HTMLInputElement;
    const value = element.value ?? "";

    props.setRealTimeSettings(
      produce(settings => {
        settings.redirectAction.redirectURL = value;  
      })
    );
  };

  const updateWebCrawlersAllowed = (e: Event) => {
    props.setRealTimeSettings(
      produce((settings) => {
        if (settings.redirectAction.webCrawlersAllowed) {
          settings.redirectAction.webCrawlersAllowed = false;
        } else {
          settings.redirectAction.webCrawlersAllowed = true;
        }
      })
    );
  };

  const updateRealTimeAction = (e: Event) => {
    const element = e.target as HTMLSelectElement;
    const index = Number(element.id);
    const name = element.name;
    const value = element.value;

    props.setRealTimeSettings(
      produce((settings) => {
        if (!settings.actions[index]) return;

        const action: RealTimeAction = {
          name: name,
          resultCondition: value
        };

        settings.actions[index] = action;
      })
    );
  };

  return (
    <>
      {/* Redirect Traffic  */}
      <Form.Group class="mb-3" controlId="formRedirection">
        <Form.Label>Redirect on Warning/Bad</Form.Label>
        <Form.Select id="0" aria-label="redirect-traffic" name="redirectTraffic" onChange={e => updateRedirectCondition(e)}>
          <option value="noRedirect" selected={props.realTimeSettings.redirectAction.resultCondition === "noRedirect"}>Do Not Redirect</option>
          <option value="onWarning" selected={props.realTimeSettings.redirectAction.resultCondition === "onWarning"}>Redirect on Warning</option>
          <option value="onBad" selected={props.realTimeSettings.redirectAction.resultCondition === "onBad"}>Redirect on Bad</option>
          <option value="onBoth" selected={props.realTimeSettings.redirectAction.resultCondition === "onBoth"}>Redirect on Warning & Bad</option>
        </Form.Select>
      </Form.Group>

      <Show when={props.realTimeSettings.redirectAction.resultCondition !== 'noRedirect'}>
        <Form.Group class="mb-3" controlId="formRedirectURL">
          <Form.Label>Redirect URL</Form.Label>
          <Form.Control
            type="text"
            aria-label="redirect-url"
            placeholder="Enter Redirect URL"
            onInput={(e) => updateRedirectURL(e)}
            value={props.realTimeSettings.redirectAction.redirectURL}
            maxLength={256}
            required
          />
          <Form.Text class="text-muted">
            example:  https://yourwebsite.com/404
          </Form.Text>
        </Form.Group>

        <Form.Group class="mb-3" controlId="formAllowWebcrawlers">
          <div>
            <input
              type="checkbox" 
              id="web-crawlers-allowed"
              onInput={e => updateWebCrawlersAllowed(e)}
              checked={props.realTimeSettings.redirectAction.webCrawlersAllowed}
              style="display: inline-block; vertical-align: middle; width:15px;height:15px;"
            />
            <label for="web-crawlers-allowed" style="margin-left: 5px; vertical-align:top;">Allow Web crawlers to bypass redirect.</label>
          </div>

          <Form.Text class="text-muted">
            To use this feature "rule sets returnability" must be enabled. 
            Talk to support about enabling or disabling the rule sets returnability feature.
          </Form.Text>
        </Form.Group>
      </Show>

      <For each={props.realTimeSettings.actions}>
        {(action, index) => (
          <>
            <Form.Group class="mb-3" controlId={`formRealTimeAction${index()+1}`}>
              <Form.Label>{actionNames[index()]} (<strong>BETA</strong>)</Form.Label>
              <Form.Select id={String(index())} name={action.name} onChange={e => updateRealTimeAction(e)}>
                <option value="noDisable" selected={props.realTimeSettings.actions[index()].resultCondition === "noDisable"}>Do Not Disable</option>
                <option value="onWarning" selected={props.realTimeSettings.actions[index()].resultCondition === "onWarning"}>Disable on Warning</option>
                <option value="onBad" selected={props.realTimeSettings.actions[index()].resultCondition === "onBad"}>Disable on Bad</option>
                <option value="onBoth" selected={props.realTimeSettings.actions[index()].resultCondition === "onBoth"}>Disable on Warning & Bad</option>
              </Form.Select>
            </Form.Group>
          </>
        )}
      </For>

      <Accordion>
        <Accordion.Item eventKey="0">
          <Accordion.Header>(Advanced) Looping Settings</Accordion.Header>
          <Accordion.Body>
            <LoopingSettings 
              realTimeSettings={props.realTimeSettings}
              setRealTimeSettings={props.setRealTimeSettings}
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </>
  );
}