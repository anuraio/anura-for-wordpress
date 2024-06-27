import { Form } from "solid-bootstrap";
import { SetStoreFunction, produce } from "solid-js/store";

interface LoopingSettingsProps {
  realTimeSettings: RealTimeSettings,
  setRealTimeSettings: SetStoreFunction<RealTimeSettings>
}

/**
 * Used for collecting input for how often Real-Time Actions should be repeated.
 */
export default function LoopingSettings(props: LoopingSettingsProps) {
  const updateRetryDuration = (e: Event) => {
    const element = e.target as HTMLSelectElement;
    const value = Number(element.value) ?? 4;

    props.setRealTimeSettings(
      produce((settings) => {
        settings.retryDurationSeconds = value;
      })
    );
  }; 

  const updateStopAtFirstElement = () => {
    props.setRealTimeSettings(
      produce((settings) => {
        if (settings.stopAfterFirstElement) settings.stopAfterFirstElement = false;
        else settings.stopAfterFirstElement = true;
      })
    );
  };

  return (
    <>
      {/* Retry Duration */}
      <Form.Group class="mb-3">
        <Form.Label>Retry Duration</Form.Label>
        <Form.Select onChange={e => updateRetryDuration(e)}>
          <option value={4} selected={props.realTimeSettings.retryDurationSeconds === 4}>Retry for 4 seconds</option>
          <option value={30} selected={props.realTimeSettings.retryDurationSeconds === 30}>Retry for 30 seconds</option>
          <option value={120} selected={props.realTimeSettings.retryDurationSeconds === 120}>Retry for 2 minutes</option>
        </Form.Select>
      </Form.Group>

      {/* Stop at First Element */}
      <Form.Group class="mb-3">
        <div>
          <input 
            type="checkbox" 
            id="stop-after-first-element"
            onInput={e => updateStopAtFirstElement()}
            checked={props.realTimeSettings.stopAfterFirstElement}
            style="display: inline-block; vertical-align: middle; width:15px;height:15px;"
          />
          <label for="stop-after-first-element" style="margin-left: 5px; vertical-align:top;">
            Stop searching after the first element is found.
          </label>
        </div>
      </Form.Group>
    </>
  );
}