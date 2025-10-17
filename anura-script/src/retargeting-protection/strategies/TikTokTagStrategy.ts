import { TagConfig, TagDeploymentStrategy } from "../../types";

export class TikTokTagStrategy implements TagDeploymentStrategy {
  deploy(tagConfigs: TagConfig[]): void {
    const activeTags = tagConfigs.filter(
      (config) => config.platform === "tiktok" && config.enabled
    );

    if (activeTags.length === 0) return;

    const tagIds = activeTags.map((config) => config.tagId);
    this.deployTikTokPixel(tagIds);
  }

  getPlatform(): string {
    return "tiktok";
  }

  private deployTikTokPixel(tagIds: string[]): void {
    if ((window as any).TiktokAnalyticsObject && (window as any).ttq) {
      this.loadAndTrackTags(tagIds);
      return;
    }

    this.initializeTikTokAnalytics();

    this.loadAndTrackTags(tagIds);
  }

  private initializeTikTokAnalytics(): void {
    const w = window as any;
    const t = "ttq";

    w.TiktokAnalyticsObject = "ttq";
    const ttq = (w[t] = w[t] || []);

    ttq.methods = [
      "page",
      "track",
      "identify",
      "instances",
      "debug",
      "on",
      "off",
      "once",
      "ready",
      "alias",
      "group",
      "enableCookie",
      "disableCookie",
    ];

    ttq.setAndDefer = function (t: any, e: string) {
      t[e] = function () {
        t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };

    for (let i = 0; i < ttq.methods.length; i++) {
      ttq.setAndDefer(ttq, ttq.methods[i]);
    }

    ttq.instance = function (t: string) {
      const e = ttq._i[t] || [];
      for (let n = 0; n < ttq.methods.length; n++) {
        ttq.setAndDefer(e, ttq.methods[n]);
      }
      return e;
    };

    ttq.load = function (e: string, n?: any) {
      const i = "https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = i;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[e] = n || {};

      const o = document.createElement("script");
      o.type = "text/javascript";
      o.async = true;
      o.src = i + "?sdkid=" + e + "&lib=" + t;

      const a = document.getElementsByTagName("script")[0];
      a.parentNode!.insertBefore(o, a);
    };
  }

  private loadAndTrackTags(tagIds: string[]): void {
    const ttq = (window as any).ttq;

    for (let i = 0; i < tagIds.length; i++) {
      ttq.load(tagIds[i]);

      ttq.track("ViewContent");
      ttq.page();
    }
  }
}
