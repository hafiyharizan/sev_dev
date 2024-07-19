import React, { useState } from "react";
import Link from "next/link";
import Contactusform from "./Contactus";

interface NavigationItem {
    name: string;
    href: string;
    current: boolean;
    children?: NavigationItem[]; // Optional children for dropdown items
}

const navigation: NavigationItem[] = [
    { name: 'Pengumuman', href: '#aboutus-section', current: true },
    { name: 'Buletin', href: '#blog-section', current: false },
    { name: 'Galeri', href: '#galeri-section', current: false },
    { name: 'FAQ', href: '#faq-section', current: false },
    { 
        name: 'Pautan', 
        href: '#pautan-section', 
        current: false,
        children: [
            { name: 'Jawatankuasa PROTEM', href: '/ajk', current: false },
            { name: 'Pendaftaran Ahli Tabung Khairat', href: '/khairat', current: false },
            { name: 'Kekosongan Jawatan SIAK', href: '/siak', current: false },
            { name: 'Kutipan Bulanan Tabung Surau Elmina Valley', href: '/tabung', current: false },
            // Add more dropdown items as needed
        ]
    },
]

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

const Data = () => {
    const [isOpen, setIsOpen] = useState(false); // State to manage dropdown visibility

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="rounded-md max-w-sm w-full mx-auto">
            <div className="flex-1 space-y-4 py-1">
                <div className="sm:block">
                    <div className="space-y-1 px-5 pt-2 pb-3">
                        {navigation.map((item) => (
                            <React.Fragment key={item.name}>
                                {item.children ? (
                                    <div className="relative">
                                        <span
                                            className={classNames(
                                                item.current ? 'bg-gray-900 text-purple' : 'text-black hover:bg-gray-700 hover:text-purple',
                                                'block py-2 rounded-md text-base font-medium cursor-pointer'
                                            )}
                                            aria-current={item.current ? 'page' : undefined}
                                            onClick={toggleDropdown} // Toggle dropdown on click
                                        >
                                            {item.name}
                                        </span>
                                        {isOpen && ( // Show dropdown if isOpen is true
                                            <div className="absolute bg-white shadow-lg rounded-md py-2 mt-2 w-48 z-10">
                                                {item.children.map((child) => (
                                                    <Link
                                                        key={child.name}
                                                        href={child.href}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        {child.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className={classNames(
                                            item.current ? 'bg-gray-900 text-purple' : 'text-black hover:bg-gray-700 hover:text-purple',
                                            'block py-2 rounded-md text-base font-medium'
                                        )}
                                        aria-current={item.current ? 'page' : undefined}
                                    >
                                        {item.name}
                                    </Link>
                                )}
                            </React.Fragment>
                        ))}
                        <div className="mt-4"></div>
                        {/* Contact Us Button */}
                        <button className="bg-navyblue w-full hover:text-white text-white border border-purple font-medium py-2 px-4 rounded">
                            Contact Us
                        </button>
                        {/* Uncomment below to render Contactusform component */}
                        {/* <Contactusform /> */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Data;
