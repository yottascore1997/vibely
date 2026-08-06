import { prisma } from "@/lib/prisma";
import InvitePageClient from "./InvitePageClient";

export const dynamic = "force-dynamic";

export default async function InviteLandingPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  if (!code) {
    return (
      <div className="min-h-screen bg-[#0D0D14] text-white flex flex-col items-center justify-center p-6 font-sans text-center">
        <div className="text-5xl mb-4">💔</div>
        <h1 className="text-2xl font-bold text-red-400 mb-2">Invalid Link</h1>
        <p className="text-gray-400 text-sm max-w-md mb-6">This invitation link code is missing or malformed.</p>
        <a href="https://www.hangora.app" className="px-6 py-3 bg-gradient-to-r from-[#8A56FF] to-[#FF4B81] rounded-xl font-bold text-white shadow-lg">
          Go to Hangora
        </a>
      </div>
    );
  }

  const invite = await prisma.invite.findUnique({
    where: { inviteCode: code },
    include: {
      sender: {
        include: { profile: true },
      },
    },
  });

  if (!invite) {
    return (
      <div className="min-h-screen bg-[#0D0D14] text-white flex flex-col items-center justify-center p-6 font-sans text-center">
        <div className="text-5xl mb-4">💔</div>
        <h1 className="text-2xl font-bold text-red-400 mb-2">Invitation Unavailable</h1>
        <p className="text-gray-400 text-sm max-w-md mb-6">This invitation link is invalid or has expired.</p>
        <a href="https://www.hangora.app" className="px-6 py-3 bg-gradient-to-r from-[#8A56FF] to-[#FF4B81] rounded-xl font-bold text-white shadow-lg">
          Go to Hangora
        </a>
      </div>
    );
  }

  const senderName = invite.sender.profile?.firstName || invite.sender.name || "A Hangora user";
  const senderAvatar = invite.sender.profile?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop";
  const senderCity = invite.sender.profile?.city || "Local";

  return (
    <div className="min-h-screen bg-[#0D0D14] text-white flex flex-col items-center justify-between p-4 sm:p-6 font-sans relative overflow-hidden">
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-[#8A56FF]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-[#FF4B81]/20 rounded-full blur-3xl pointer-events-none" />

      <header className="w-full max-w-md flex items-center justify-between py-2 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8A56FF] to-[#FF4B81] flex items-center justify-center font-extrabold text-sm text-white shadow-md">
            H
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Hangora
          </span>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-purple-300 border border-white/10">
          Personal Invite
        </span>
      </header>

      <main className="w-full max-w-md my-auto z-10">
        <InvitePageClient
          inviteCode={code}
          senderName={senderName}
          senderAvatar={senderAvatar}
          senderCity={senderCity}
          activityEmoji={invite.activityEmoji}
          activityName={invite.activityName}
          timeLabel={invite.timeLabel || "Soon"}
          initialStatus={invite.status.toLowerCase()}
          initialInviteeName={invite.inviteeName || undefined}
        />
      </main>

      <footer className="w-full max-w-md py-4 text-center text-xs text-gray-500 z-10">
        Powered by Hangora · Real hangs · Real people
      </footer>
    </div>
  );
}
