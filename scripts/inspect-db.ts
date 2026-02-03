import { getDb } from "../lib/db";

type LibSQLClient = {
  execute: (input: { sql: string; args?: any[] } | string) => Promise<any>;
};

const command = process.argv[2] || "stats";

async function displayPages(db: LibSQLClient) {
  const result = await db.execute("SELECT * FROM pages ORDER BY created_at DESC");

  console.log("\n📄 PAGES\n");

  if (!result?.rows || result.rows.length === 0) {
    console.log("No pages found.");
    return;
  }

  result.rows.forEach((page: any) => {
    console.log(`ID: ${page.id}`);
    console.log(`  Recipient: ${page.recipient_name}`);
    console.log(`  Sender: ${page.sender_email}`);
    console.log(`  Question: ${page.question}`);
    console.log(`  Dodge Button: ${page.dodge_button}`);
    console.log(`  Answer: ${page.answer || "(not answered)"}`);
    console.log(`  Created: ${new Date(Number(page.created_at)).toLocaleString()}`);
    if (page.answered_at) {
      console.log(`  Answered: ${new Date(Number(page.answered_at)).toLocaleString()}`);
    }
    console.log();
  });
}

async function displaySubscriptions(db: LibSQLClient) {
  const result = await db.execute(
    "SELECT * FROM email_subscriptions ORDER BY subscribed_at DESC"
  );

  console.log("\n📧 EMAIL SUBSCRIPTIONS\n");

  if (!result?.rows || result.rows.length === 0) {
    console.log("No subscriptions found.");
    return;
  }

  result.rows.forEach((sub: any) => {
    console.log(
      `${sub.email} (${sub.source}) - ${new Date(Number(sub.subscribed_at)).toLocaleString()}`
    );
  });
  console.log();
}

async function displayStats(db: LibSQLClient) {
  const pageCount = await db.execute("SELECT COUNT(*) as count FROM pages");
  const answeredCount = await db.execute(
    "SELECT COUNT(*) as count FROM pages WHERE answer IS NOT NULL"
  );
  const yesCount = await db.execute("SELECT COUNT(*) as count FROM pages WHERE answer = 'yes'");
  const noCount = await db.execute("SELECT COUNT(*) as count FROM pages WHERE answer = 'no'");
  const subCount = await db.execute("SELECT COUNT(*) as count FROM email_subscriptions");
  const tool1Count = await db.execute(
    "SELECT COUNT(*) as count FROM email_subscriptions WHERE source = 'tool1'"
  );
  const tool2Count = await db.execute(
    "SELECT COUNT(*) as count FROM email_subscriptions WHERE source = 'tool2'"
  );

  const total = Number(pageCount?.rows?.[0]?.count ?? 0);
  const answered = Number(answeredCount?.rows?.[0]?.count ?? 0);

  console.log("\n📊 STATISTICS\n");
  console.log("Pages:");
  console.log(`  Total: ${total}`);
  console.log(`  Answered: ${answered}`);
  console.log(`  Unanswered: ${total - answered}`);
  console.log(`  Yes answers: ${Number(yesCount?.rows?.[0]?.count ?? 0)}`);
  console.log(`  No answers: ${Number(noCount?.rows?.[0]?.count ?? 0)}`);
  console.log();
  console.log("Email Subscriptions:");
  console.log(`  Total: ${Number(subCount?.rows?.[0]?.count ?? 0)}`);
  console.log(`  Tool 1: ${Number(tool1Count?.rows?.[0]?.count ?? 0)}`);
  console.log(`  Tool 2: ${Number(tool2Count?.rows?.[0]?.count ?? 0)}`);
  console.log();
}

async function main() {
  const db = (await getDb()) as LibSQLClient;

  switch (command) {
    case "pages":
      await displayPages(db);
      break;
    case "subs":
      await displaySubscriptions(db);
      break;
    case "stats":
      await displayStats(db);
      break;
    default:
      console.log("Usage: npm run db:inspect [pages|subs|stats]");
      console.log("  pages - Show all pages");
      console.log("  subs  - Show all email subscriptions");
      console.log("  stats - Show statistics (default)");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
