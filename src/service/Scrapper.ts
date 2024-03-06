import {
  Action,
  PublisherConfig,
  ActionType,
} from "../core/entities/PublisherConfig";
import { Browser, launch, type Page } from "puppeteer";

class Scraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private tempPage: Page | null = null;
  private result: any = {};

  async initialize() {
    this.browser = await launch({ headless: false });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async interceptMisc(page: Page) {
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (
        ["image", "stylesheet", "font"].indexOf(request.resourceType()) !== -1
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });
  }

  async scrape(publisher_config: PublisherConfig) {
    if (!this.browser) {
      throw new Error(
        "Browser not initialized. Call initialize() before scraping."
      );
    }

    this.page = await this.browser.newPage();
    await this.interceptMisc(this.page);
    await this.page.goto(publisher_config.url);
    await this.page.waitForSelector(publisher_config.page_change.getter);

    let whilePageChangerExists = this.page.$$eval(
      publisher_config.page_change.getter,
      publisher_config.page_change.eval
    );

    for (const action of publisher_config.actions) {
      await this.routine(action);
    }

    // await this.page.close();

    console.log(this.result);
    return this.result;
  }

  async routine(action: Action) {
    switch (action.type) {
      case ActionType.DEFINE:
        await this.define(action);
        break;
      case ActionType.GOTOPAGE:
        await this.goToPage(action);
        break;
      case ActionType.LOOP:
        await this.loop(action);
        break;
      case ActionType.PERSIST:
        await this.persist(action);
        break;

      default:
        throw new Error(`Unsupported scrape action`);
    }
  }

  async eval(action: Action) {
    const page = this.tempPage ? this.tempPage : this.page;
    if (page) return page.$$eval(action.getter, action.eval);
  }

  async persist(action: Action) {
    console.log(this.result)
    this.result = {}
  }

  async goToPage(action: Action) {
    let elements = await this.eval(action);
    if (!elements) return;
    if (typeof elements === "string") elements = [elements];
    if (!this.browser) throw Error("No browser");
    const tempPage = await this.browser.newPage();
    await this.interceptMisc(tempPage);

    for (const element of elements) {
      if (!element) continue;
      await tempPage.goto(element);
      this.tempPage = tempPage;

      if (action.actions)
        for (const innerAction of action.actions) {
          await this.routine(innerAction);
        }
    }
    await this.tempPage?.close();
    this.tempPage = null;
  }

  async define(action: Action) {
    const element = await this.eval(action);
    if (element && action.prop_name) this.result[action.prop_name] = element;
  }

  async loop(action: Action) {
    const loopElement = (await this.eval(action)) as HTMLElement[];
    if (loopElement?.length)
      for (const element of loopElement) {
        if (action.actions)
          for (const innerAction of action.actions) {
            await this.routine(innerAction);
          }
      }
  }
}

export default Scraper;
