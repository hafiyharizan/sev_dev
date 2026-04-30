"use client"
import Navbar from './Navbar';
import React, { useEffect } from 'react';

const Navbarin: React.FC = () => {
    useEffect(() => {
        const debounce = (fn: () => void) => {
            let frame: number;
            return () => {
                if (frame) {
                    cancelAnimationFrame(frame);
                }
                frame = requestAnimationFrame(() => {
                    fn();
                });
            }
        };

        const storeScroll = () => {
            document.documentElement.dataset.scroll = window.scrollY.toString();
        }

        const debouncedStoreScroll = debounce(storeScroll);
        document.addEventListener('scroll', debouncedStoreScroll, { passive: true });

        storeScroll();

        return () => {
            document.removeEventListener('scroll', debouncedStoreScroll);
        };
    }, [])
    return (
        <>
            <Navbar />
        </>
    );
}

export default Navbarin;
