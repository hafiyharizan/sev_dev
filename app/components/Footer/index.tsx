import Image from "next/image";
import Link from "next/link";

const Footer = () => {
    return (
        <div className="bg-black" id="first-section">
            <div className="mx-auto max-w-2xl pt-8 pb-16 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <div className="mt-24 grid grid-cols-1 gap-y-10 gap-x-16 sm:grid-cols-2 lg:grid-cols-12 xl:gap-x-8">

                    {/* COLUMN-1 */}

                    <div className='col-span-4'>
                    <Image src="/images/sevlogo.png" alt="Surau Elmina Valley logo" width={165} height={79} />

                        <h3 className='text-white text-4xl font-semibold leading-9 mb-4 lg:mb-12'> Surau Elmina Valley</h3>
                        <div className='flex gap-4'>
                            <div className='footer-icons'>
                                <Link href="https://www.facebook.com/profile.php?id=61558241025968" target="_blank" rel="noopener noreferrer" aria-label="Surau Elmina Valley Facebook"><Image src={'/images/footer/vec.svg'} alt="" width={15} height={20} /></Link>
                            </div>
                            <div className='footer-icons'>
                                <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><Image src={'/images/footer/twitter.svg'} alt="" width={20} height={20} /></Link>
                            </div>
                            <div className='footer-icons'>
                                <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Image src={'/images/footer/instagram.svg'} alt="" width={20} height={20} /></Link>
                            </div>
                        </div>
                    </div>

                    {/* CLOUMN-2/3 */}

                    <div className="group relative col-span-4">
                        <a href="/images/QR_SEV.jpg" target="_blank" rel="noopener noreferrer" aria-label="Buka QR code sumbangan Surau Elmina Valley">
                            <Image className="rounded-2xl w-full max-w-xs" src="/images/QR_SEV.jpg" alt="QR code sumbangan Surau Elmina Valley" width={320} height={320} />
                        </a>
                    </div>
                    <div className="group relative col-span-4 lg:ml-16">
                        <a href="/images/JAIS.png" target="_blank" rel="noopener noreferrer" aria-label="Buka maklumat pendaftaran JAIS Surau Elmina Valley">
                            <Image className="rounded-2xl w-full max-w-[225px]" src="/images/JAIS.png" alt="Maklumat pendaftaran JAIS Surau Elmina Valley" width={225} height={318} />
                        </a>
                    </div>

                </div>
            </div>

            {/* All Rights Reserved */}

            <div className="mx-auto max-w-2xl lg:max-w-7xl">
                <div className="pt-5 pb-5 px-4 sm:px-6 lg:px-4 border-solid border-t border-footer">
                    <div className="mt-4 grid grid-cols-1 gap-y-10 gap-x-16 sm:grid-cols-2 xl:gap-x-8">
                        <div>
                            <h3 className='text-center md:text-start text-offwhite text-lg'>@2024 - All Rights Reserved by <Link href="https://surauelminavalley.com/" target="_blank" rel="noopener noreferrer"> surauelminavalley.com</Link></h3>
                        </div>
                        <div className="flex justify-center md:justify-end">
                            <Link href="/">
                                <h3 className="text-offwhite pr-6">جَزاكَ اللهُ خَـيْراً</h3>
                            </Link>
                            <Link href="/">
                                <h3 className="text-offwhite pl-6 border-solid border-l border-footer">ٱلْحَمْدُ لِلَّٰهِ</h3>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

        </div>

    )
}

export default Footer;
