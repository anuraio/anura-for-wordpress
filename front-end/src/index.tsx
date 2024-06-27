import { render } from "solid-js/web";
import Settings from "./components/settings/Settings";
import Header from "./components/settings/Header";

document.addEventListener("DOMContentLoaded", () => {
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
