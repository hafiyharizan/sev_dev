"use client"
import { Disclosure } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/20/solid'

const FAQ = () => {
    return (
        <div id="faq-section" className='mx-auto max-w-7xl py-24 lg:px-8 bg-faqblue rounded-2xl my-16 faq-bg'>
            <h3 className='text-xl font-normal text-white text-center mb-6'>FAQ</h3>
            <h2 className='text-4xl lg:text-6xl font-semibold text-center text-white'>Soalan-soalan <br /> Lazim.</h2>
            <div className="w-full px-4 pt-16">
                <div className="mx-auto w-full max-w-5xl rounded-2xl bg-white py-8 px-6 mb-5">
                    <Disclosure>
                        {({ open }) => (
                            <>
                                <Disclosure.Button className="flex w-full justify-between rounded-lg px-4 py-2 text-left text-2xl font-medium">
                                    <span>Adakah surau mengadakan Solat Jumaat?</span>
                                    <ChevronUpIcon
                                        className={`${open ? 'rotate-180 transform' : ''
                                            } h-5 w-5 text-purple-500`}
                                    />
                                </Disclosure.Button>
                                <Disclosure.Panel className="px-4 pt-4 pb-2 text-base text-black font-normal opacity-80">
                                    Tiada solat Jumaat di Surau Elmina Valley. <br />
                                    Anda boleh solat Jumaat di surau berdekatan seperti Surau Al-Mahdi atau Surau Al-Abrar.
                                </Disclosure.Panel>
                            </>
                        )}
                    </Disclosure>
                </div>

                <div className="mx-auto w-full max-w-5xl rounded-2xl bg-white py-8 px-6 mb-5">
                    <Disclosure as="div" className="mt-2">
                        {({ open }) => (
                            <>
                                <Disclosure.Button className="flex w-full justify-between rounded-lg px-4 py-2 text-left text-2xl font-medium">
                                    <span>Adakah diadakan solat jemaah setiap solat fardhu ?</span>
                                    <ChevronUpIcon
                                        className={`${open ? 'rotate-180 transform' : ''
                                            } h-5 w-5 text-purple-500`}
                                    />
                                </Disclosure.Button>
                                <Disclosure.Panel className="px-4 pt-4 pb-2 text-base text-black font-normal opacity-80">
                                    Surau Elmina Valley dibuka untuk jemaah setiap waktu Subuh, Maghrib dan Isyak. <br /> 
                                    Manakala waktu Zohor dan Asar hanya dibuka pada setiap hujung minggu sahaja.
                                </Disclosure.Panel>
                            </>
                        )}
                    </Disclosure>
                </div>

                <div className="mx-auto w-full max-w-5xl rounded-2xl bg-white py-8 px-6">
                    <Disclosure as="div" className="mt-2">
                        {({ open }) => (
                            <>
                                <Disclosure.Button className="flex w-full justify-between rounded-lg px-4 py-2 text-left text-2xl font-medium">
                                    <span>Bagaimana jika ingin derma kepada surau?</span>
                                    <ChevronUpIcon
                                        className={`${open ? 'rotate-180 transform' : ''
                                            } h-5 w-5 text-purple-500`}
                                    />
                                </Disclosure.Button>
                                <Disclosure.Panel className="px-4 pt-4 pb-2 text-base text-black font-normal opacity-80">
                                    Surau Elmina Valley menerima derma bagi tujuan pembaikan, penyelenggaraan, dan penganjuran aktiviti surau. <br />
                                    <h2>Cara Menyumbang:</h2>
                                    <br />
                                    <h3>1. Derma Tunai:</h3>
                                    <p>Serahkan kepada Bendahari surau atau masukkan ke dalam tabung derma di surau.</p>
                                    <br />
                                    <h3>2. Derma Bank-In:</h3>
                                    <p>
                                        Nama Akaun: Surau Elmina Valley<br />
                                        Nombor Akaun: 1229 8010 0202 49<br />
                                        Bank: Bank Islam<br />
                                    </p>
                                    <br />
                                    <h3>3. QR Code:</h3>

                                    <div className="flex items-start">
                                    <p className="mr-4">Scan QR Code ini untuk menderma.</p>
                                    <img src="/images/qr_square.png" alt="qrcode" width="136" height="220" className="rounded-2xl" />
                                    </div>

                                    Jika ingin menderma barangan sila hubungi pihak surau terlebih dahulu. <br />
                                </Disclosure.Panel>
                            </>
                        )}
                    </Disclosure>
                </div>

            </div>
        </div>
    )
}

export default FAQ;