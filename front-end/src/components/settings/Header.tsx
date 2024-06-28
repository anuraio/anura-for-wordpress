import { Alert } from "solid-bootstrap";
import { createSignal, onMount } from "solid-js";

export default function Header() {
  const apiURL = "/?rest_route=/anura/v1/anura-settings";
  const [showRestApiAlert, setShowRestApiAlert] = createSignal(false);

  /**
   * Attempting to access the WordPress REST API.
   * If it's inaccessible, show the alert error.
   */
  onMount(async() => {
    const response = await fetch(apiURL);
    if (response.status === 404) {
      setShowRestApiAlert(true);
    }
  })

  return (
    <>
      <div style="padding-left: 40px; width: 700px;">
        {/* REST API Alert. Only shows if the WordPress REST API is inaccessible. */}
        <Alert variant="danger" show={showRestApiAlert()}>
          <Alert.Heading>Error</Alert.Heading>
          <p>
            It looks like the WordPress REST API might be disabled. 
            WordPress' REST API is required for this plugin to work. 
          </p>
        </Alert>

        <h1>Anura For WordPress</h1>
        <p>
          Anura is an Ad Fraud solution designed to accurately eliminate fraud
          to improve conversion rates. With the Anura plugin, you
          can easily set up a real-time visitor firewall to keep the fraud off
          of your site. Before you can set this up, be sure to reach out to 
          <a href="mailto:">sales@anura.io</a> to get your account set up first.
        </p>
      </div>
    </>
  );
}
