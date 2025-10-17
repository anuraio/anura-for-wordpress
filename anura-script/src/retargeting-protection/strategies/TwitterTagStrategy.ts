import { TagConfig, TagDeploymentStrategy } from "../../types";

export class TwitterTagStrategy implements TagDeploymentStrategy {
  deploy(tagConfigs: TagConfig[]): void {
    const activeTags = tagConfigs.filter(config => 
      config.platform === 'twitter' && config.enabled
    );

    if (activeTags.length === 0) return;

    const tagIds = activeTags.map(config => config.tagId);
    this.deployTwitterPixel(tagIds);
  }

  getPlatform(): string {
    return "twitter";
  }

  private deployTwitterPixel(tagIds: string[]): void {
    if ((window as any)['twq'] && typeof (window as any)['twq'] === 'function') {
      this.fireEvents(tagIds);
      return;
    }

    this.initializeTwitterPixel();

    this.loadTwitterScript(tagIds);
  }

  private initializeTwitterPixel(): void {
    const twqh: any = (window as any)['twq'] = function() {
      twqh.exe ? twqh.exe.apply(twqh, arguments) : twqh.queue.push(arguments);
    };
    
    twqh.version = '1.1';
    twqh.queue = [];
    (window as any)['twq']['queue'] = [];
  }

  private loadTwitterScript(tagIds: string[]): void {
    const b = document.createElement('script');
    b.async = true;
    b.src = 'https://static.ads-twitter.com/uwt.js';
    
    b.onload = () => {
      this.fireEvents(tagIds);
    };
    
    const ph = document.getElementsByTagName('script')[0];
    ph.parentNode!.insertBefore(b, ph);
  }

  private fireEvents(tagIds: string[]): void {
    for (let i = 0; i < tagIds.length; i++) {
      (window as any)['twq']('event', tagIds[i], {});
    }
  }
}