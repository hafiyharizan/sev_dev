import { Disclosure } from '@headlessui/react';
import Link from 'next/link';
import React, { Fragment } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import Drawer from "./Drawer";
import Drawerdata from "./Drawerdata";
import Contactusform from './Contactus';

interface NavigationItem {
    name: string;
    href: string;
    current: boolean;
    children?: NavigationItem[]; // Optional children for dropdown items
}

const navigation: NavigationItem[] = [
    { name: 'Pengumuman', href: '/#aboutus-section', current: false },
    { name: 'Buletin', href: '/#blog-section', current: false },
    { name: 'Galeri', href: '/#galeri-section', current: false },
    { name: 'FAQ', href: '/#faq-section', current: false },
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

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <Disclosure as="nav" className="navbar">
            <>
                <div className="mx-auto max-w-7xl p-3 md:p-4 lg:px-8">
                    <div className="relative flex sm:h-10 items-center">
                        <div className="flex flex-1 items-center sm:justify-between">

                            {/* LOGO */}
                            <div className="flex flex-shrink-0 items-center border-right">
                                <Link href="/" className='text-2xl sm:text-4xl font-semibold text-black'>
                                    <img className="" width="165px" src="/images/sevlogo.png" alt="SEV Logo" />
                                </Link>
                            </div>

                            {/* LINKS */}
                            <div className="hidden lg:flex items-center border-right">
                                <div className="flex justify-end space-x-4">
                                    {navigation.map((item) => (
                                        <Fragment key={item.name}>
                                            {item.children ? (
                                                <Disclosure.Button as="div" className="relative">
                                                    <span
                                                        className={classNames(
                                                            item.current ? 'bg-gray-900' : 'navlinks hover:text-black',
                                                            'px-3 py-4 rounded-md text-ml font-bold cursor-pointer'
                                                        )}
                                                        aria-current={item.href ? 'page' : undefined}
                                                    >
                                                        {item.name}
                                                    </span>
                                                    <Disclosure.Panel className="absolute bg-white shadow-lg rounded-md py-2 mt-2 w-48 z-10">
                                                        {item.children.map((child) => (
                                                            <Link
                                                                key={child.name}
                                                                href={child.href}
                                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                target='_blank'
                                                            >
                                                                {child.name}
                                                            </Link>
                                                        ))}
                                                    </Disclosure.Panel>
                                                </Disclosure.Button>
                                            ) : (
                                                <Link
                                                    href={item.href}
                                                    className={classNames(
                                                        item.current ? 'bg-gray-900' : 'navlinks hover:text-black',
                                                        'px-3 rounded-md text-ml font-bold'
                                                    )}
                                                    aria-current={item.href ? 'page' : undefined}
                                                >
                                                    {item.name}
                                                </Link>
                                            )}
                                        </Fragment>
                                    ))}
                                </div>
                            </div>

                            {/* CONTACT US BUTTON */}
                            <Contactusform />
                        </div>

                        {/* DRAWER ICON */}
                        <div className='block lg:hidden'>
                            <Bars3Icon className="block h-6 w-6" aria-hidden="true" onClick={() => setIsOpen(true)} />
                        </div>

                        {/* DRAWER LINKS DATA */}
                        <Drawer isOpen={isOpen} setIsOpen={setIsOpen}>
                            <Drawerdata />
                        </Drawer>
                    </div>
                </div>
            </>
        </Disclosure>
    )
}

export default Navbar;
