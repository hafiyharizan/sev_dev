"use client"
import { useState, useRef, useEffect } from "react";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import Image from "next/image";
import { MapPinIcon } from "@heroicons/react/24/solid";

const Banner = () => {
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
            videoRef.current.play().catch(() => {
                // Browser autoplay policies can pause media until the user interacts.
            });
        }
    }, [isMuted]);

    const handleMuteToggle = () => {
        setIsMuted((prev) => !prev);
    };

    return (
        <div className='mx-auto max-w-7xl mb-10 sm:pb-10 px-6 lg:px-8'>
            <div className='grid grid-cols-1 lg:grid-cols-2 my-8'>

                {/* COLUMN-1 */}
                <div className="mx-auto sm:mx-0">
                    <div className='py-3 text-center lg:text-start'>
                        <p className='inline-flex text-blue bg-lightblue text-sm md:text-lg font-bold px-6 py-1 rounded-3xl tracking-wider'>اَلسَّلَامُ عَلَيْكُم</p>
                    </div>
                    <div className="py-3 text-center lg:text-start">
                        <h1 className='text-5xl lg:text-70xl font-bold leading-tight text-darkpurple'>
                            Ahlan ke Portal <br /> Surau Elmina Valley.
                        </h1>
                    </div>
                    <div className='my-7 text-center lg:text-start'>
                        <a
                            href="https://maps.app.goo.gl/YFCK49qasKTejYnHA"
                            target="_blank"
                            rel="noopener noreferrer"
                            className='inline-flex items-center justify-center gap-2 text-sm md:text-xl font-semibold hover:shadow-xl bg-blue text-white py-3 px-6 md:py-5 md:px-14 rounded-full hover:bg-hoblue transition-colors'
                        >
                            Lokasi Surau
                            <MapPinIcon className="h-6 w-6" aria-hidden="true" />
                        </a>
                    </div>
                    <div className="mx-auto sm:mx-0 flex flex-col items-center lg:items-start lg:flex-row">
                        <div className="mt-4 lg:ml-6">
                            <button
                                type="button"
                                onClick={handleMuteToggle}
                                aria-label={isMuted ? "Unmute video" : "Mute video"}
                                className="px-4 py-2 bg-transparent border border-blue rounded-full flex items-center justify-center hover:bg-blue hover:text-white transition-colors"
                            >
                                {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
                            </button>
                        </div>
                        <div className="w-48 h-48 lg:w-56 lg:h-56 relative">
                            <video ref={videoRef} className="w-full h-full object-contain" autoPlay muted={isMuted} playsInline loop>
                                <source src="/images/tokedi.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                </div>

                {/* COLUMN-2 */}
                <div className='lg:-m-24 lg:pt-20 lg:pr-20 hidden lg:block'>
                    <Image className='rounded-3xl mt-8' src="/images/surau2.jpg" alt="hero-image" width={800} height={642} />
                </div>

            </div>
        </div>
    )
}

export default Banner;
