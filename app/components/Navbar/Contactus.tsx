"use client"
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ContactusformProps {
    buttonClassName?: string;
    buttonWrapperClassName?: string;
    label?: string;
}

const Contactusform = ({
    buttonClassName = 'justify-end text-base font-semibold bg-transparent py-2 px-6 lg:px-6 navbutton rounded-full hover:bg-navyblue hover:text-white transition-colors',
    buttonWrapperClassName = 'hidden lg:block',
    label = 'Hubungi Kami',
}: ContactusformProps) => {
    let [isOpen, setIsOpen] = useState(false)

    const [inputValues, setInputValues] = useState({
        input1: '',
        input2: '',
        input3: ''
    });

    const handleChange = (e: { target: { name: string; value: string; }; }) => {
        const { name, value } = e.target;
        setInputValues(prevState => ({ ...prevState, [name]: value }));
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const message = encodeURIComponent(
            `Assalamualaikum, saya ${inputValues.input1} (${inputValues.input2}). ${inputValues.input3}`
        );
        window.open(`https://wa.me/60192768406?text=${message}`, '_blank', 'noopener,noreferrer');
        setIsOpen(false);
    };

    const isDisabled = Object.values(inputValues).some((value) => value === '');


    const closeModal = () => {
        setIsOpen(false)
    }

    const openModal = () => {
        setIsOpen(true)
    }

    return (
        <>
            <div className=" inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto md:ml-6 sm:pr-0">
                <div className={buttonWrapperClassName}>
                    <button type="button" className={buttonClassName} onClick={openModal}>
                        {label}
                    </button>
                </div>
            </div>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <button
                                        type="button"
                                        aria-label="Tutup borang hubungi kami"
                                        className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-black"
                                        onClick={closeModal}
                                    >
                                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>

                                    <div className="py-8 lg:py-8 px-4 mx-auto max-w-screen-md">
                                        <div className="flex flex-shrink-0 items-center justify-center">
                                            <Link href="/" className='text-2xl sm:text-4xl font-semibold text-black'>
                                            Surau Elmina Valley
                                            </Link>
                                        </div>
                                        <Dialog.Title className="sr-only">Hubungi Surau Elmina Valley</Dialog.Title>
                                        <p className="mb-4 lg:mb-8 mt-8 font-light text-center text-gray-500 dark:text-gray-400 sm:text-xl">Anda ingin dapatkan info lebih lanjut? Hubungi kami</p>
                                        <form action="#" className="space-y-8" onSubmit={handleSubmit}>
                                            <div>
                                                <label htmlFor="contact-name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Nama</label>
                                                <input
                                                    id="contact-name"

                                                    name="input1"
                                                    value={inputValues.input1}
                                                    onChange={handleChange}

                                                    type="text"
                                                    autoComplete="name"
                                                    required
                                                    className="relative block w-full appearance-none  rounded-md border border-linegrey px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                    placeholder="Nama penuh"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="contact-email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">E-mail</label>
                                                <input
                                                    id="contact-email"
                                                    name="input2"
                                                    value={inputValues.input2}
                                                    onChange={handleChange}

                                                    type="email"
                                                    autoComplete="email"
                                                    required
                                                    className="relative block w-full appearance-none  rounded-md border border-linegrey px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                    placeholder="xyz@email.com"
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label htmlFor="contact-message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Mesej Anda</label>
                                                <textarea
                                                    id="contact-message"
                                                    name="input3"
                                                    value={inputValues.input3}
                                                    onChange={handleChange}
                                                    rows={4}
                                                    className="relative block w-full appearance-none  rounded-md border border-linegrey px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" placeholder="Tulis mesej anda"></textarea>
                                            </div>
                                            <button type="submit"
                                                disabled={isDisabled}
                                                className="py-3 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-50 font-medium w-full text-center text-white rounded-lg bg-blue hover:bg-hoblue focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 transition-colors">Hantar melalui WhatsApp</button>

                                            <p className="text-center">
                                                Atau klik icon di-bawah untuk hubungi kami terus di Whatsapp/Telegram:
                                            </p>
                                            {/* WHATSAPP AND TELEGRAM BUTTONS */}
                                            <div className="flex text-center items-center space-x-4 justify-center">
                                                <a href="https://wa.me/60192768406" target="_blank" rel="noopener noreferrer" aria-label="Hubungi Surau Elmina Valley melalui WhatsApp">
                                                    <FontAwesomeIcon icon={faWhatsapp} size="lg" style={{ fontSize: '34px' }}/>
                                                </a>
                                                <a href="https://t.me/+60192768406" target="_blank" rel="noopener noreferrer" aria-label="Hubungi Surau Elmina Valley melalui Telegram">
                                                    <FontAwesomeIcon icon={faTelegram} size="lg" style={{ fontSize: '34px' }}/>
                                                </a>
                                            </div>
                                        </form>


                                    </div>

                                    {/* <div className='flex justify-end'>
                                        <button type="button"
                                            onClick={closeModal}
                                            className="py-3 px-5 mt-2 text-sm font-medium w-50 text-center text-white rounded-lg bg-red hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Close</button>
                                    </div> */}

                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}

export default Contactusform;
