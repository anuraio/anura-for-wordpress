import { TagConfig, TagDeploymentStrategy } from "../../types";

export class MetaTagStrategy implements TagDeploymentStrategy {
  deploy(tagConfigs: TagConfig[]): void {
    const activeTags = tagConfigs.filter(
      (config) => config.platform === "meta" && config.enabled
    );

    if (activeTags.length === 0) return;

    const tagIds = activeTags.map((config) => config.tagId);
    this.deployMetaPixel(tagIds);
  }

  getPlatform(): string {
    return "meta";
  }

  private deployMetaPixel(tagIds: string[]): void {
    if (typeof (window as any).fbq === "function") {
      this.fireEvents(tagIds);
      return;
    }

    this.createNoscriptFallback(tagIds);

    this.loadMetaPixelScript();

    this.fireEvents(tagIds);
  }

  private createNoscriptFallback(tagIds: string[]): void {
    const s = document.getElementsByTagName("script")[0];
    const ns = document.createElement("noscript");
    ns.id = "fb-ns";
    s.parentNode!.insertBefore(ns, s);

    for (let i = 0; i < tagIds.length; i++) {
      const px = document.createElement("img");
      px.src = `https://www.facebook.com/tr?id=${tagIds[i]}&ev=PageView&noscript=1`;
      ns.appendChild(px);
    }
  }
  
  private loadMetaPixelScript(): void {
    void (function (f: any, b: any, e: any, v: any) {
      let n: any, t: any, s: any;
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      "script",
      "https://connect.facebook.net/en_US/fbevents.js"
    );
  }

  private fireEvents(tagIds: string[]): void {
    for (let i = 0; i < tagIds.length; i++) {
      (window as any).fbq("init", tagIds[i]);
      (window as any).fbq("track", "PageView");
    }
  }
}
