import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./components/LeftSidebar";
import FriendsActivity from "./components/FriendsActivity";
import AudioPlayer from "./components/AudioPlayer";
import { PlaybackControls } from "./components/PlaybackControls";
import { useEffect, useState } from "react";
import { Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MainLayout = () => {
	const [isMobile, setIsMobile] = useState(false);
	const [showFriends, setShowFriends] = useState(false);

	useEffect(() => {
		const checkMobile = () => {
			const mobile = window.innerWidth < 768;
			setIsMobile(mobile);
			if (!mobile) setShowFriends(false);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	return (
		<div className='h-screen bg-black text-white flex flex-col relative overflow-hidden'>
			{/* Toggle Button for Mobile */}
			{isMobile && (
				<div className="fixed top-[70px] right-4 z-30">
					<button
						className='bg-zinc-800 hover:bg-zinc-700 p-2 rounded-full shadow-md transition'
						onClick={() => setShowFriends(true)}
					>
						<Users className='w-5 h-5 text-white' />
					</button>
				</div>
			)}

			<ResizablePanelGroup direction='horizontal' className='flex-1 flex h-full overflow-hidden p-2'>
				<AudioPlayer />

				{/* Left Sidebar */}
				<ResizablePanel defaultSize={20} minSize={10} maxSize={30}>
  <div className="h-full overflow-hidden">
    <div className="h-full overflow-y-auto custom-scrollbar">
      <LeftSidebar />
    </div>
  </div>
</ResizablePanel>


				<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />

				{/* Main Content */}
				<ResizablePanel defaultSize={isMobile ? 80 : 60}>
					<div className='relative h-full overflow-hidden'>
						<Outlet />

						{/* Slide-in FriendsActivity for Mobile */}
						{isMobile && (
							<div
								className={cn(
									"absolute top-0 right-0 h-full w-[85%] bg-zinc-900 z-50 shadow-lg transition-transform duration-300",
									showFriends ? "translate-x-0" : "translate-x-full"
								)}
							>
								<div className='flex justify-end p-4'>
									<button
										className='bg-zinc-800 hover:bg-zinc-700 p-2 rounded-full'
										onClick={() => setShowFriends(false)}
									>
										<X className='w-5 h-5 text-white' />
									</button>
								</div>
								<div className='h-[calc(100%-56px)] px-2 pb-2 overflow-y-auto'>
									<FriendsActivity />
								</div>
							</div>
						)}
					</div>
				</ResizablePanel>

				{/* Right Sidebar for Desktop */}
				{!isMobile && (
					<>
						<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />
						<ResizablePanel defaultSize={20} minSize={0} maxSize={25}>
							<FriendsActivity />
						</ResizablePanel>
					</>
				)}
			</ResizablePanelGroup>

			<PlaybackControls />
		</div>
	);
};

export default MainLayout;
