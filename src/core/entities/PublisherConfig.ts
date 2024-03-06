export interface PublisherConfig {
  publisher_name: string;
  city: string;
  country: string;
  state: string;
  url: string;
  actions: Action[];
  page_change: {
    getter: string;
    eval: (el: any[]) => any;
  };
}

export enum ActionType {
  LOOP = "loop",
  DEFINE = "define",
  GOTOPAGE = "goToPage",
  PERSIST = "persist",
}

export interface Action {
  type: ActionType;
  prop_name?: string;
  getter: string;
  actions?: Action[];
  eval: (el: any[]) => any;
}

export const publishers: PublisherConfig[] = [
  {
    publisher_name: "Companhia das Letras",
    url: "https://www.companhiadasletras.com.br/Busca",
    city: "Rio de Janeiro",
    state: "Rio de Janeiro",
    country: "Brasil",
    actions: [
      {
        type: ActionType.LOOP,
        getter: ".vitrine__card",
        eval: (el: HTMLLinkElement[]) => el,
        actions: [
          {
            type: ActionType.DEFINE,
            prop_name: "full_info_url",
            getter: ".card__img > a",
            eval: (el: HTMLLinkElement[]) => {
              console.trace("from eval", el);
              return el[0].href;
            },
          },
          {
            type: ActionType.GOTOPAGE,
            getter: ".card__img > a",
            eval: (el: HTMLLinkElement[]) => el[0].href,
            actions: [
              {
                type: ActionType.DEFINE,
                prop_name: "image",
                getter: ".produto__img > img",
                eval: (el: HTMLImageElement[]) => el[0].src,
              },
              {
                type: ActionType.DEFINE,
                prop_name: "title",
                getter: ".produto__detalhes .section__title",
                eval: (el: HTMLDivElement[]) => el[0].innerText,
              },
              {
                type: ActionType.DEFINE,
                prop_name: "author",
                getter: ".sobre__autor-texto .autor",
                eval: (el: HTMLLinkElement[]) =>
                  el.map((author) => author.innerText),
              },
              {
                type: ActionType.DEFINE,
                prop_name: "translators",
                getter: ".produto__detalhes .card__autor",
                eval: (el: HTMLLinkElement[]) => {
                  let foundTranslators = false;
                  return el.filter((aTag) => {
                    if (foundTranslators) {
                      return true;
                    }
                    foundTranslators =
                      aTag.previousSibling !== null &&
                      aTag.previousSibling.nodeValue?.trim() === "Tradução:";
                    return false;
                  }).map(el => el.innerText);
                },
              },
              {
                type: ActionType.DEFINE,
                prop_name: "author_url",
                getter: ".sobre__autor-texto a.btn.btn-autor",
                eval: (el: HTMLLinkElement[]) =>
                  el.map((author) => author.href),
              },
              {
                type: ActionType.DEFINE,
                prop_name: "price",
                getter: ".produto__detalhes .valor__atual > p",
                eval: (el: HTMLLinkElement[]) => {
                  return parseFloat(
                    el[0].innerText.replace(/[^\d,.-]/g, "").replace(",", ".")
                  );
                },
              },
              {
                type: ActionType.DEFINE,
                prop_name: "printed",
                getter: "#livro_fisico",
                eval: (el: HTMLLinkElement[]) => !!el[0],
              },
              {
                type: ActionType.DEFINE,
                prop_name: "description",
                getter: ".section__sobre",
                eval: (el: HTMLLinkElement[]) => el[0].innerText,
              },
              {
                type: ActionType.DEFINE,
                prop_name: "isbn",
                getter: "#ficha-tecnica",
                eval: (el: HTMLLinkElement[]) =>
                  el[0].innerText.match(/ISBN: (.+?)\s/)?.[1]?.replace(/[^\d,.-]/g, ""),
              },
              {
                type: ActionType.DEFINE,
                prop_name: "pages",
                getter: "#ficha-tecnica",
                eval: (el: HTMLLinkElement[]) =>
                  el[0].innerText.match(/Páginas: (.+?)\s/)?.[1],
              },
              {
                type: ActionType.DEFINE,
                prop_name: "cover_type",
                getter: "#ficha-tecnica",
                eval: (el: HTMLLinkElement[]) =>
                  el[0].innerText.match(/Acabamento: (.+?) Lançamento/)?.[1],
              },
              {
                type: ActionType.DEFINE,
                prop_name: "release",
                getter: "#ficha-tecnica",
                eval: (el: HTMLLinkElement[]) =>
                  el[0].innerText.match(/Lançamento: (.+?)\s/)?.[1],
              },
              {
                type: ActionType.DEFINE,
                prop_name: "format",
                getter: "#ficha-tecnica",
                eval: (el: HTMLLinkElement[]) =>
                  el[0].innerText.match(/Formato: (.+?)cm/)?.[1],
              },
              {
                type: ActionType.PERSIST,
                getter: "",
                eval: (el: HTMLLinkElement[]) => {},
              },
            ],
          },
        ],
      },
    ],
    page_change: {
      getter: ".pages a",
      eval: (el: HTMLElement[]) =>
        el[el.length - 2].classList.contains("arrow"),
    },
  },
];
