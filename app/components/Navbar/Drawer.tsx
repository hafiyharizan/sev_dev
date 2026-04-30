import React, { ReactNode } from "react";
import type { MouseEvent } from "react";
import { XMarkIcon } from '@heroicons/react/24/outline'
import Link from "next/link";


interface DrawerProps {
    children: ReactNode;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Drawer = ({ children, isOpen, setIsOpen }: DrawerProps) => {
    const handleContentClick = (event: MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        if (target.closest("a")) {
            setIsOpen(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            className="fixed overflow-hidden z-40 bg-gray-900 bg-opacity-25 inset-0 transform ease-in-out transition-opacity opacity-100 duration-500 translate-x-0"
        >
            <section
                className="w-[min(22rem,85vw)] max-w-lg left-0 absolute bg-white h-full shadow-xl delay-300 duration-500 ease-in-out transition-all transform translate-x-0"
            >

                <article className="relative w-full max-w-lg pb-10 flex flex-col space-y-6 h-full">
                    <header className="px-4 py-4 flex items-center justify-between border-b border-linegrey">

                        <div className="flex flex-shrink-0 items-center">
                            <Link href="/" className='text-2xl font-semibold text-black'>
                                Surau Elmina Valley
                            </Link>
                        </div>

                        <button
                            type="button"
                            aria-label="Close navigation menu"
                            className="rounded-md p-2 text-black hover:bg-lightgrey"
                            onClick={() => {
                                setIsOpen(false);
                            }}
                        >
                            <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                        </button>
                    </header>
                    <div onClick={handleContentClick}>{children}</div>
                </article>
            </section>
            <section
                className="w-screen h-full cursor-pointer "
                onClick={() => {
                    setIsOpen(false);
                }}
            ></section>
        </div>
    );
}

export default Drawer;
