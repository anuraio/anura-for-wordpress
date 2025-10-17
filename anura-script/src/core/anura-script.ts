import { shouldIgnoreVisitor } from "./bot-filtering";
import { shouldTriggerAnuraScript } from "./request-triggers";

declare global {
  interface Window {
    JSON: any;
  }
}

(function (): void {
  const anuraScriptOptions = window.anuraOptions.script;

  const triggerSettings = window.anuraOptions.advanced.requestTriggers;

  const onLoginPage = window.anuraOptions.context === "login";

  if (!anuraScriptOptions.instanceId) {
    return;
  }

  if (triggerSettings.enabled && !shouldTriggerAnuraScript(triggerSettings) && !onLoginPage) {
    return;
  }

  const botSettings = window.anuraOptions.bots;
  if (botSettings && shouldIgnoreVisitor(botSettings) && !onLoginPage) {
    return;
  }

  const request: Record<string, string> = {
    instance: anuraScriptOptions.instanceId,
    callback: "anuraWPCallback",
  };

  if (anuraScriptOptions.source) {
    request.source = anuraScriptOptions.source;
  }

  if (anuraScriptOptions.campaign) {
    request.campaign = anuraScriptOptions.campaign;
  }

  const hasAdditionalData: boolean =
    anuraScriptOptions.additionalData.length > 0;
  if (hasAdditionalData) {
    request.additional = toAdditionalDataString(
      anuraScriptOptions.additionalData
    );
  }

  const anura: HTMLScriptElement = document.createElement("script");
  if ("object" === typeof anura) {
    const params: string[] = [];
    for (const x in request) {
      params.push(x + "=" + encodeURIComponent(request[x]));
    }
    params.push(String(Math.floor(1e12 * Math.random() + 1)));
    anura.type = "text/javascript";
    anura.async = true;
    anura.src = "https://script.anura.io/request.js?" + params.join("&");
    const script: HTMLScriptElement =
      document.getElementsByTagName("script")[0];
    script.parentNode!.insertBefore(anura, script);
  }
})();

function toAdditionalDataString(additionalData: string[]): string {
  const additionalDataObj: Record<number, string> = {};
  for (let i = 0; i < additionalData.length; i++) {
    additionalDataObj[i + 1] = additionalData[i];
  }
  return JSON.stringify(additionalDataObj);
}

if (!window.JSON) {
  window.JSON = {
    parse: function (sJSON: any) {
      return eval("(" + sJSON + ")");
    },
    stringify: (function () {
      const toString = Object.prototype.toString;
      const isArray =
        Array.isArray ||
        function (a) {
          return toString.call(a) === "[object Array]";
        };
      const escMap: Record<string, string> = {
        "\b": "\\b",
        "\f": "\\f",
        "\n": "\\n",
        "\r": "\\r",
        "\t": "\\t",
      };
      const escFunc = function (m: string) {
        return escMap[m] || m;
      };
      const escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
      return function stringify(value: any) {
        if (value === null) {
          return "null";
        } else if (typeof value === "number") {
          return isFinite(value) ? value.toString() : "null";
        } else if (typeof value === "boolean") {
          return value.toString();
        } else if (typeof value === "object") {
          if (typeof value.toJSON === "function") {
            return stringify(value.toJSON());
          } else if (isArray(value)) {
            let res = "[";
            for (let i = 0; i < value.length; i++)
              res += (i ? ", " : "") + stringify(value[i]);
            return res + "]";
          } else if (toString.call(value) === "[object Object]") {
            const tmp: any[] = [];
            for (const k in value) {
              if (value.hasOwnProperty(k))
                tmp.push(stringify(k) + ": " + stringify(value[k]));
            }
            return "{" + tmp.join(", ") + "}";
          }
        }
        return '"' + value.toString().replace(escRE, escFunc) + '"';
      };
    })(),
  };
}

export {};
