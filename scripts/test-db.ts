import { createPageInDb, getPageById, setAnswerInDb, saveEmailSubscription } from "../lib/db-operations";

async function runTests() {
  console.log("Testing database operations...\n");

  // Test 1: Create a page
  console.log("1. Creating a page...");
  const page = await createPageInDb(
    "Will you be my valentine?",
    "Sarah",
    "john@example.com",
    "no"
  );
  console.log("✓ Created page:", page.id);
  console.log("  - Recipient:", page.recipient_name);
  console.log("  - Sender:", page.sender_email);
  console.log("  - Question:", page.question);
  console.log("  - Dodge button:", page.dodge_button);
  console.log("  - Answer:", page.answer);
  console.log();

  // Test 2: Get the page
  console.log("2. Fetching the page...");
  const fetched = await getPageById(page.id);
  if (fetched) {
    console.log("✓ Fetched page:", fetched.id);
    console.log("  - Question:", fetched.question);
  } else {
    console.log("✗ Failed to fetch page");
  }
  console.log();

  // Test 3: Set an answer
  console.log("3. Setting answer to 'yes'...");
  const updated = await setAnswerInDb(page.id, "yes");
  if (updated) {
    console.log("✓ Answer updated");
    const refetched = await getPageById(page.id);
    console.log("  - Answer:", refetched?.answer);
    console.log("  - Answered at:", refetched?.answered_at ? new Date(refetched.answered_at).toLocaleString() : null);
  } else {
    console.log("✗ Failed to update answer");
  }
  console.log();

  // Test 4: Save email subscription
  console.log("4. Saving email subscription...");
  const result1 = await saveEmailSubscription("test1@example.com", "tool1");
  console.log("✓ Subscription 1:", result1.success ? "saved" : "failed");
  console.log();

  // Test 5: Try duplicate email
  console.log("5. Trying duplicate email...");
  const result2 = await saveEmailSubscription("test1@example.com", "tool2");
  console.log(result2.duplicate ? "✓ Correctly detected duplicate" : "✗ Should have detected duplicate");
  console.log();

  // Test 6: Save another subscription
  console.log("6. Saving another subscription...");
  const result3 = await saveEmailSubscription("test2@example.com", "tool2");
  console.log("✓ Subscription 2:", result3.success ? "saved" : "failed");
  console.log();

  console.log("All tests completed!");
}

runTests().catch(console.error);
