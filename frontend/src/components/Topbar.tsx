import { SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboard, Users } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/stores/useAuthStore";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "usehooks-ts";

const Topbar = ({ onToggleFriends }: { onToggleFriends?: () => void }) => {
  const { isAdmin } = useAuthStore();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 backdrop-blur-md z-10">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <svg
            width="32"
            height="32"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#1ED760", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "#1DB954", stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <g fill="url(#iconGradient)">
              <path
                d="M25,55 C25,25 75,25 75,55"
                strokeWidth="10"
                stroke="url(#iconGradient)"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="25" cy="60" r="15" />
              <path d="M75,45 C64,45 55,54 55,65 C55,76 64,85 75,85 C83,85 89,81 92,75 L90,88 L98,78 C96,70 90,60 90,65 C90,54 83,45 75,45 Z" />
              <polygon fill="#FFFFFF" points="70,58 83,65 70,72"></polygon>
            </g>
          </svg>
          <span
            className="text-lg font-bold bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(45deg, #1DB954, #1ED760)"
            }}
          >
            JamLink
          </span>
        </div>
      </div>

      {/* Right: Admin, Friends Button, Profile */}
      <div className="flex items-center gap-4">
        {isAdmin && (
          <Link
            to={"/admin"}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <LayoutDashboard className="size-4 mr-2" />
            Admin Dashboard
          </Link>
        )}

        {/* Toggle FriendsActivity on Mobile */}
        {isMobile && onToggleFriends && (
          <button
            onClick={onToggleFriends}
            className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition"
            title="Friends Activity"
          >
            <Users className="w-5 h-5 text-white" />
          </button>
        )}

        <SignedOut>
          <SignInOAuthButtons />
        </SignedOut>
        <UserButton />
      </div>
    </div>
  );
};

export default Topbar;
