import { TagConfig, TagDeploymentStrategy } from "../../types";

export class MicrosoftTagStrategy implements TagDeploymentStrategy {
  deploy(tagConfigs: TagConfig[]): void {
    const activeTags = tagConfigs.filter(
      (config) => config.platform === "microsoft" && config.enabled
    );

    if (activeTags.length === 0) return;

    const tagIds = activeTags.map((config) => config.tagId);
    this.deployTag(tagIds);
  }

  getPlatform(): string {
    return "microsoft";
  }

  private deployTag(tagIds: string[]) {
    window["uetq"] = window["uetq"] || [];
    const ff = function (id?: any) {
      const o: any = { ti: id };
      (o.q = window["uetq"]), (window["uetq"] = new window.UET(o));
      window["uetq"].push("pageLoad");
    };

    const ust: any = document.createElement('script');
    ust.src = "https://bat.bing.com/bat.js";
    ust.async = true;
    ust.onload = ust.onreadystatechange = function () {
      const st = this.readyState;
       st && st !== 'loaded' && st !== 'complete' || (ff(), ust.onload = ust.onreadystatechange = null);
    }

    ust.onload = function() {
      for (let i = 0; i < tagIds.length; i++) {
        ff(tagIds[i]);
      }
    }

    const ph = document.getElementsByTagName('script')[0];
    ph.parentNode?.insertBefore(ust, ph);
  }
}
