import { Accordion } from "solid-bootstrap";
import AdditionalData from "./extra-settings/AdditionalData";
import FallbackSettings from "./extra-settings/FallbackSettings";
import { SetStoreFunction } from "solid-js/store";
import RealTimeSettings from "./extra-settings/real-time/RealTimeSettings";
import ServerSettings from "./extra-settings/ServerSettings";

interface ExtraSettingsProps {
  scriptSettings: ScriptSettings,
  setScriptSettings: SetStoreFunction<ScriptSettings>
  fallbackSettings: FallbackSettings,
  setFallbackSettings: SetStoreFunction<FallbackSettings>,
  realTimeSettings: RealTimeSettings,
  setRealTimeSettings: SetStoreFunction<RealTimeSettings>,
  serverSettings: ServerSettings,
  setServerSettings: SetStoreFunction<ServerSettings>
}

export default function ExtraSettings(props: ExtraSettingsProps) {
  return (
    <>
      <Accordion>
        {/* Additional Data */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>Additional Data</Accordion.Header>
          <Accordion.Body>
            <p>
              Additional Data gives you the ability to pass select points of data with your requests.
              Effectively turning Anura into "your database for transactional data".
            </p>
            <AdditionalData 
              additionalData={props.scriptSettings.additionalData} 
              setSettings={props.setScriptSettings}/>
          </Accordion.Body>
        </Accordion.Item>

        {/* Fallbacks */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>Fallback Source & Campaign Variables</Accordion.Header>
          <Accordion.Body>
            <p>
              Fallback variables are used in the scenario your source/campaign variable is empty when using the <strong>GET</strong> or <strong>POST</strong> method. 
              In those situations, your first fallback variable will be used. If that is also empty, your second fallback will be used. 
            </p>
            <p>
              If you're using a <strong>hard coded</strong> value, fallbacks are not needed.
            </p>
            <FallbackSettings 
              fallbackSources={props.fallbackSettings.sources} 
              fallbackCampaigns={props.fallbackSettings.campaigns} 
              setFallbackSettings={props.setFallbackSettings} 
            />
          </Accordion.Body>
        </Accordion.Item>

        {/* Real-Time Actions */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>Real-Time Actions</Accordion.Header>
          <Accordion.Body>
            <p>
              If you'd like, you have the option to take real-time action against traffic.
              These actions are performed immediately after a visitor has been assessed.
            </p>
            <RealTimeSettings 
              realTimeSettings={props.realTimeSettings}
              setRealTimeSettings={props.setRealTimeSettings}
            />
          </Accordion.Body>
        </Accordion.Item>

        {/* Server Actions */}
        <Accordion.Item eventKey="3">
          <Accordion.Header>Server Actions</Accordion.Header>
          <Accordion.Body>
            <p>
              Server Actions are tweaks the plugin can make to your <strong>WordPress server</strong>.
            </p>
            <ServerSettings 
              serverSettings={props.serverSettings}
              setServerSettings={props.setServerSettings}
            />
          </Accordion.Body>
        </Accordion.Item>
    </Accordion>
    </>
  );
}