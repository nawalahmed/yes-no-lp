import {
  createPageInDb,
  getPageById as getPageByIdFromDb,
  setAnswerInDb,
} from "./db-operations";

export type PageRecord = {
  id: string;
  question: string;
  recepientName: string;
  answer: "yes" | "no" | null;
  createdAt: number;
};

export async function createPage(
  question: string,
  recepientName: string,
  senderEmail = "",
  dodgeButton: "yes" | "no" = "yes"
): Promise<PageRecord> {
  const record = await createPageInDb(question, recepientName, senderEmail, dodgeButton);

  return {
    id: record.id,
    question: record.question,
    recepientName: record.recipient_name,
    answer: record.answer,
    createdAt: record.created_at,
  };
}

export async function getPageById(id: string): Promise<PageRecord | null> {
  const record = await getPageByIdFromDb(id);
  if (!record) return null;

  return {
    id: record.id,
    question: record.question,
    recepientName: record.recipient_name,
    answer: record.answer,
    createdAt: record.created_at,
  };
}

export async function setAnswer(id: string, answer: "yes" | "no"): Promise<PageRecord | null> {
  const ok = await setAnswerInDb(id, answer);
  if (!ok) return null;

  const updated = await getPageByIdFromDb(id);
  if (!updated) return null;

  return {
    id: updated.id,
    question: updated.question,
    recepientName: updated.recipient_name,
    answer: updated.answer,
    createdAt: updated.created_at,
  };
}
