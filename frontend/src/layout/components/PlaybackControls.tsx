import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const PlaybackControls = () => {
	const { currentSong, isPlaying, togglePlay, playNext, playPrevious } = usePlayerStore();

	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		audioRef.current = document.querySelector("audio");

		const audio = audioRef.current;
		if (!audio) return;

		const updateTime = () => setCurrentTime(audio.currentTime);
		const updateDuration = () => setDuration(audio.duration);

		audio.addEventListener("timeupdate", updateTime);
		audio.addEventListener("loadedmetadata", updateDuration);

		const handleEnded = () => {
			usePlayerStore.setState({ isPlaying: false });
		};

		audio.addEventListener("ended", handleEnded);

		return () => {
			audio.removeEventListener("timeupdate", updateTime);
			audio.removeEventListener("loadedmetadata", updateDuration);
			audio.removeEventListener("ended", handleEnded);
		};
	}, [currentSong]);

	const handleSeek = (value: number[]) => {
		if (audioRef.current) {
			audioRef.current.currentTime = value[0];
		}
	};

	return (
		<footer className='h-20 sm:h-24 bg-zinc-900 border-t border-zinc-800 px-4'>
			<div className='flex flex-col justify-center items-center h-full max-w-[1800px] mx-auto gap-2'>
				{/* player controls*/}
				<div className='flex items-center gap-6'>
					<Button
						size='icon'
						variant='ghost'
						className='hover:text-white text-zinc-400'
					>
						<Shuffle className='h-4 w-4' />
					</Button>

					<Button
						size='icon'
						variant='ghost'
						className='hover:text-white text-zinc-400'
						onClick={playPrevious}
						disabled={!currentSong}
					>
						<SkipBack className='h-4 w-4' />
					</Button>

					<Button
						size='icon'
						className='bg-white hover:bg-white/80 text-black rounded-full h-8 w-8'
						onClick={togglePlay}
						disabled={!currentSong}
					>
						{isPlaying ? <Pause className='h-5 w-5' /> : <Play className='h-5 w-5' />}
					</Button>
					<Button
						size='icon'
						variant='ghost'
						className='hover:text-white text-zinc-400'
						onClick={playNext}
						disabled={!currentSong}
					>
						<SkipForward className='h-4 w-4' />
					</Button>
					<Button
						size='icon'
						variant='ghost'
						className='hover:text-white text-zinc-400'
					>
						<Repeat className='h-4 w-4' />
					</Button>
				</div>

				<div className='flex items-center gap-2 w-full max-w-[400px]'>
					<Slider
						value={[currentTime]}
						max={duration || 100}
						step={1}
						className='w-full hover:cursor-grab active:cursor-grabbing'
						onValueChange={handleSeek}
					/>
				</div>
			</div>
		</footer>
	);
};
