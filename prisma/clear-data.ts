import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Clearing activity and interaction data while preserving created Users...");

  const expenseSplits = await prisma.expenseSplit.deleteMany();
  console.log(`- Deleted ${expenseSplits.count} ExpenseSplits.`);

  const eventExpenses = await prisma.eventExpense.deleteMany();
  console.log(`- Deleted ${eventExpenses.count} EventExpenses.`);

  const groupMessages = await prisma.groupMessage.deleteMany();
  console.log(`- Deleted ${groupMessages.count} GroupMessages.`);

  const jarItems = await prisma.jarItem.deleteMany();
  console.log(`- Deleted ${jarItems.count} JarItems.`);

  const invites = await prisma.invite.deleteMany();
  console.log(`- Deleted ${invites.count} Invites.`);

  const notifications = await prisma.notification.deleteMany();
  console.log(`- Deleted ${notifications.count} Notifications.`);

  const participants = await prisma.participant.deleteMany();
  console.log(`- Deleted ${participants.count} Participants.`);

  const hangouts = await prisma.hangout.deleteMany();
  console.log(`- Deleted ${hangouts.count} Hangouts.`);

  const vibes = await prisma.vibe.deleteMany();
  console.log(`- Deleted ${vibes.count} Vibes.`);

  const messages = await prisma.message.deleteMany();
  console.log(`- Deleted ${messages.count} Messages.`);

  const matches = await prisma.match.deleteMany();
  console.log(`- Deleted ${matches.count} Matches.`);

  const swipes = await prisma.swipe.deleteMany();
  console.log(`- Deleted ${swipes.count} Swipes.`);

  const usersCount = await prisma.user.count();
  const profilesCount = await prisma.profile.count();
  console.log(`\nDone! All activity data has been emptied.`);
  console.log(`Preserved Users count: ${usersCount} (Profiles: ${profilesCount})`);
}

main()
  .catch((e) => {
    console.error("Error clearing data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
