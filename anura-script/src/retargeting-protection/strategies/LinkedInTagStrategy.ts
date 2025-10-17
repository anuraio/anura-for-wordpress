import { TagConfig, TagDeploymentStrategy } from "../../types";

export class LinkedInTagStrategy implements TagDeploymentStrategy {
  deploy(tagConfigs: TagConfig[]): void {
    // Filter for active LinkedIn tags only
    const activeTags = tagConfigs.filter(
      (config) => config.platform === "linkedin" && config.enabled
    );

    if (activeTags.length === 0) return;

    const tagIds = activeTags.map((config) => config.tagId);

    this.deployTag(tagIds);
  }

  getPlatform(): string {
    return "linkedin";
  }

  private deployTag(tagIds: string[]) {
    const lp = document.getElementById("linked-ns");
    if (lp !== null) {
      for (let i = 0; i < tagIds.length; i++) {
        (window as any)._linkedin_partner_id = tagIds[i];
        (window as any)._linkedin_data_partner_ids.push(tagIds[i]);
      }

      return;
    }

    (window as any)._linkedin_data_partner_ids =
      (window as any)._linkedin_data_partner_ids || [];

    for (let i = 0; i < tagIds.length; i++) {
      (window as any)._linkedin_partner_id = tagIds[i];
      (window as any)._linkedin_data_partner_ids.push(tagIds[i]);
    }

    if (!(window as any).lintrk) {
      (window as any).lintrk = function (a: any, b: any) {
        (window as any).lintrk.q.push([a, b]);
      };
      (window as any).lintrk.q = [];
    }

    const s = document.getElementsByTagName("script")[0];
    const ns = document.createElement("noscript");
    ns.id = "linked-ns";
    s.parentNode!.insertBefore(ns, s);

    for (let i = 0; i < tagIds.length; i++) {
      const px = document.createElement("img");
      px.height = 1;
      px.width = 1;
      px.style.display = "none";
      px.alt = "";
      px.src = `https://px.ads.linkedin.com/collect/?pid=${tagIds[i]}&fmt=gif`;
      ns.appendChild(px);
    }

    // Load LinkedIn insight script
    const b = document.createElement("script");
    b.type = "text/javascript";
    b.async = true;
    b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
    s.parentNode!.insertBefore(b, s);
  }
}
