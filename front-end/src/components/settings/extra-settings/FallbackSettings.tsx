import { Form } from "solid-bootstrap";
import { Index } from "solid-js";
import { SetStoreFunction, produce } from "solid-js/store";

interface FallbackProps {
  fallbackSources: string[],
  fallbackCampaigns: string[],
  setFallbackSettings: SetStoreFunction<{sources: string[], campaigns: string[]}>;
}
export default function FallbackSettings(props: FallbackProps) {
  return (
    <>
      {/* Fallback Sources */}
      <Index each={props.fallbackSources}>
        {(fallbackSource, index) => (
          <>
          <Form.Group class="mb-3" controlId={`formAnuraFallbackSource${index+1}`}>
            <Form.Label>Fallback Source #{index+1}</Form.Label>
            <Form.Control
              type="text"
              aria-label={`fallback-source-${index+1}`}
              placeholder="Enter Source Variable"
              onChange={e => props.setFallbackSettings(produce(fallbackSettings => {
                fallbackSettings.sources[index] = e.target.value;
              }))}
              value={fallbackSource()}
              maxLength={128}
            />
          </Form.Group>
          </>
        )}
      </Index>

      {/* Fallback Campaigns */}
      <Index each={props.fallbackCampaigns}>
        {(fallbackCampaign, index) => (
          <>
          <Form.Group class="mb-3" controlId={`formAnuraFallbackCampaign${index+1}`}>
            <Form.Label>Fallback Campaign #{index+1}</Form.Label>
            <Form.Control
              type="text"
              aria-label={`fallback-campaign-${index+1}`}
              placeholder="Enter Campaign Variable"
              onChange={e => props.setFallbackSettings(produce(fallbackSettings => {
                fallbackSettings.campaigns[index] = e.target.value;
              }))}
              value={fallbackCampaign()}
              maxLength={128}
            />
          </Form.Group>
          </>
        )}
      </Index>
    </>
  );
}