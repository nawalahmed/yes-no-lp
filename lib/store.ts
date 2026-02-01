export type PageRecord = {
  id: string;
  question: string;
  answer: "yes" | "no" | null;
  createdAt: number;
};

type StoreShape = {
  pages: Map<string, PageRecord>;
};

declare global {
  // eslint-disable-next-line no-var
  var __YESNO_STORE__: StoreShape | undefined;
}

const store: StoreShape =
  globalThis.__YESNO_STORE__ ??
  {
    pages: new Map<string, PageRecord>(),
  };

globalThis.__YESNO_STORE__ = store;

function randomId(len = 12) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function createPage(question: string) {
  const id = randomId(12);
  const record: PageRecord = {
    id,
    question,
    answer: null,
    createdAt: Date.now(),
  };
  store.pages.set(id, record);
  return record;
}

export function getPageById(id: string) {
  return store.pages.get(id) || null;
}

export function setAnswer(id: string, answer: "yes" | "no") {
  const record = store.pages.get(id);
  if (!record) return null;
  record.answer = answer;
  store.pages.set(id, record);
  return record;
}
