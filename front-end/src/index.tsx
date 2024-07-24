import { render } from "solid-js/web";
import Settings from "./components/settings/Settings";
import Header from "./components/settings/Header";

document.addEventListener("DOMContentLoaded", () => {
  // Checking that the current page is anura-settings before attempting to render front-end
  const queryString = window.location.search;
  if (queryString !== '?page=anura-settings') {
    return;
  }
  
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("could not find root element.");
  }

  render(() => {
    return (
      <>
        <Header></Header>
        <Settings />
      </>
    );
  }, root);
});
