import { Form } from "solid-bootstrap";
import { produce, SetStoreFunction } from "solid-js/store";

interface ServerSettingsProps {
  serverSettings: ServerSettings,
  setServerSettings: SetStoreFunction<ServerSettings>
};

export default function ServerSettings(props: ServerSettingsProps) {

  const updateAddHeaders = (_e: Event) => {
    props.setServerSettings(
      produce((settings) => {
        // Flipping boolean value
        settings.addHeaders = !settings.addHeaders;
      })
    )
  };

  return (
    <>
      <Form.Group class="mb-3" controlId="formAddHeaders">
        <div>
          <input
            type="checkbox"
            id="add-headers"
            onInput={e => updateAddHeaders(e)}
            checked={props.serverSettings.addHeaders}
            style="display: inline-block; vertical-align: middle; width:15px;height:15px;"
          />
          <label for="web-crawlers-allowed" style="margin-left: 5px; vertical-align:top;">Add server-side headers for Anura Script</label>
        </div>

        <Form.Text class="text-muted">
          <p class="mb-1" style={'color: #4f5354'}>
            <strong>
              In order for Anura Script to work at its full capacity, extra headers must be added.
              Enabling this setting will have these headers be added for you.
            </strong>

          </p>
        </Form.Text>
      </Form.Group>

      <Form.Group class="mb-3" controlId="formAddHeadersPriority">
        <Form.Label>Header Priority</Form.Label>
        <Form.Select onChange={e => props.setServerSettings({ headerPriority: e.target.value })}>
          <option value="highest" selected={props.serverSettings.headerPriority === 'highest'}>Highest Priority</option>
          <option value="high" selected={props.serverSettings.headerPriority === 'high'}>High Priority</option>
          <option value="medium" selected={props.serverSettings.headerPriority === 'medium'}>Medium Priority</option>
          <option value="low" selected={props.serverSettings.headerPriority === 'low'}>Low Priority</option>
          <option value="lowest" selected={props.serverSettings.headerPriority === 'lowest'}>Lowest Priority</option>
        </Form.Select>
        <Form.Text class="text-muted">
          Header Priority determines how likely our headers will be used if another plugin you have also sends HTTP headers.
          A higher priority means our headers will be more likely to be listened to instead.
        </Form.Text>
      </Form.Group>
    </>
  );
}