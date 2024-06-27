import { Button, Modal, Spinner } from "solid-bootstrap";
import { Accessor, Setter, Show, createSignal } from "solid-js";

interface SavePopupProps {
  showPopup: Accessor<boolean>,
  setShowPopup: Setter<boolean>,
  submit: Function,
  setShowToast: Setter<boolean>
};

export default function SavePopup(props: SavePopupProps) {
  const confirmMsg = 'Are you sure you want to save?';
  const [bodyText, setBodyText] = createSignal(confirmMsg);
  const [showSpinner, setShowSpinner] = createSignal(false);

  const handleSave = async(e: Event) => {
    setShowSpinner(true);

    let res: Response;
    try {
      res = await props.submit(e);
    } catch (error: any) {
      setShowSpinner(false);
      setBodyText(String(error));
      return;
    }

    if (!res.ok) {
      const errorMsg = await createErrorMsg(res);
      setShowSpinner(false);
      setBodyText(errorMsg);
      return;
    }

    setShowSpinner(false);
    props.setShowPopup(false);
    props.setShowToast(true);
  };

  const createErrorMsg = async(response: Response): Promise<string> => {
    const result = await response.json();

    if (response.status === 400 && result.errors) {
      return 'Failed to save settings due to invalid input.'
    }

    if (response.status === 404) {
      return 'Failed to save settings due to invalid settings url.';
    }

    if (response.status >= 500 && response.status <= 599) {
      return 'Failed to save settings due to a server error within WordPress.'
    }

    return 'Failed to save settings.';    
  };

  return (
    <>
      <Modal 
        show={props.showPopup()}
        onShow={(_e: any) => setBodyText(confirmMsg)} 
        onHide={(_e: any) => props.setShowPopup(false)}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="confirm-title">Confirm Changes</Modal.Title>
        </Modal.Header>

        <Modal.Body id="confirm-body" style="display: flex; align-items: center; justify-content: center;">
          <Show when={showSpinner()} fallback={bodyText()}>
            <Spinner animation="border" variant="primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </Spinner>  
          </Show>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={e => props.setShowPopup(false)}>Close</Button>
          <Button variant="primary" onClick={e => handleSave(e)}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}