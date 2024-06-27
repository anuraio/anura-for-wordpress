import { InputGroup, Form, Button } from "solid-bootstrap";
import { For } from "solid-js";
import { SetStoreFunction, produce } from "solid-js/store";

interface AdditionalDataProps {
  additionalData: string[],
  setSettings: SetStoreFunction<ScriptSettings>
}

export default function AdditionalData(props: AdditionalDataProps) {
  // Adds an element for Additional Data to be filled by the user.
  const addElement = (): void => {
    const maxElements = 10;

    props.setSettings(
      produce((settings) => {
        if (settings.additionalData.length < maxElements) {
          settings.additionalData.push("");
        }
      })
    );
  };

  // Removes an element from Additional Data at given index.
  const removeElement = (indexToRemove: number): void => {
    const minElements = 1;

    props.setSettings(
      produce((settings) => {
        if (settings.additionalData.length > minElements) {
          settings.additionalData = settings.additionalData.filter(
            (_value, index) => index !== indexToRemove
          );
        }
      })
    );
  }

  // Updates the element that the user changed on the settings form.
  const updateElement = (e: Event, index: number): void => {
    const element = e.target as HTMLInputElement;
    const value = element.value ?? "";

    props.setSettings(
      produce((settings) => {
        settings.additionalData[index] = value;
      })
    );
  };

  return (
    <>
      <For each={props.additionalData}>
        {(item, index) => (
          <>
            <InputGroup  class="mb-3"  onChange={e => updateElement(e, index())}>
              <InputGroup.Text>{index()+1}</InputGroup.Text>
              <Form.Control 
                type="text" 
                id={String(index())}
                placeholder={`Additional Data #${index()+1}`}
                value={item}
                maxLength={128} 
              />
                <Button variant="outline-danger" id="button-addon2" onClick={e => removeElement(index())}>Remove</Button>
            </InputGroup>
          </>
        )}
      </For>

      <Button name="add-element" variant="outline-primary" onClick={e => addElement()}>Add an element</Button>
    </>
  );
}