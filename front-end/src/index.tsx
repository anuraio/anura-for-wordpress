import { createRoot } from 'react-dom/client';
import domReady from '@wordpress/dom-ready';
import apiFetch from '@wordpress/api-fetch';
import { AnuraSettingsPage } from './components/AnuraSettings';

import '@wordpress/components/build-style/style.css';
import './styles/index.css';

// Define the window type with WordPress globals
interface AnuraAdminConfig {
  restNonce: string;
  restUrl: string;
}

declare global {
  interface Window {
    anuraAdmin?: AnuraAdminConfig;
  }
}

domReady(() => {
  const queryString = window.location.search;
  if (queryString !== '?page=anura-settings') {
    return;
  }

  const root = document.getElementById("root");
  if (!root) {
    throw new Error("Could not find root element.");
  }

  const anuraAdmin = window.anuraAdmin;
  if (anuraAdmin) {
    apiFetch.use(apiFetch.createNonceMiddleware(anuraAdmin.restNonce));
    apiFetch.use(apiFetch.createRootURLMiddleware(anuraAdmin.restUrl));
  }

  const reactRoot = createRoot(root);
  reactRoot.render(<AnuraSettingsPage />);
});