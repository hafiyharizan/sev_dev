import Image from "next/image";
import Link from "next/link";

// MIDDLE LINKS DATA
interface ProductType {
    id: number;
    section: string;
    link: string[];
}

const products: ProductType[] = [
    {
        id: 1,
        section: "Menu",
        link: ['Pengumuman', 'Buletin', 'Galeri', 'FAQ'],
    },
    {
        id: 2,
        section: "Pautan",
        link: ['Jawatankuasa Protem SEV', 'Tabung Khairat', 'Jadual Kuliah']
    },
    {
        id: 3,
        section: "Pautan Luar",
        link: ['404', 'Instructions', 'License']
    }
]

const footer = () => {
    return (
        <div className="bg-black" id="first-section">
            <div className="mx-auto max-w-2xl pt-8 pb-16 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <div className="mt-24 grid grid-cols-1 gap-y-10 gap-x-16 sm:grid-cols-2 lg:grid-cols-12 xl:gap-x-8">

                    {/* COLUMN-1 */}

                    <div className='col-span-4'>
                    <img className="" width="165px" src="/images/sevlogo.png" alt="SEV Logo" />

                        <h3 className='text-white text-4xl font-semibold leading-9 mb-4 lg:mb-12'> Surau Elmina Valley</h3>
                        <div className='flex gap-4'>
                            <div className='footer-icons'>
                                <Link href="https://www.facebook.com/profile.php?id=61558241025968" target="_blank"><Image src={'/images/footer/vec.svg'} alt="facebook" width={15} height={20} /></Link>
                            </div>
                            <div className='footer-icons'>
                                <Link href="https://twitter.com" target="_blank"><Image src={'/images/footer/twitter.svg'} alt="twitter" width={20} height={20} /></Link>
                            </div>
                            <div className='footer-icons'>
                                <Link href="https://instagram.com" target="_blank"><Image src={'/images/footer/instagram.svg'} alt="instagram" width={20} height={20} /></Link>
                            </div>
                        </div>
                    </div>

                    {/* CLOUMN-2/3 */}

                    <div className="group relative col-span-4">
                        <a href="/images/QR_SEV.jpg" target="_blank" rel="noopener noreferrer">
                            <img className="rounded-2xl" width="" src="/images/QR_SEV.jpg" alt="SEV Logo" />
                        </a>
                    </div>
                    <div className="group relative ml-16 col-span-4">
                        <a href="/images/JAIS.png" target="_blank" rel="noopener noreferrer">
                            <img className="rounded-2xl" width="225" src="/images/JAIS.png" alt="SEV Logo" />
                        </a>
                    </div>
                    {/* {products.map((product) => (
                        <div key={product.id} className="group relative col-span-2">
                            <p className="text-white text-xl font-extrabold mb-9">{product.section}</p>
                            <ul>
                                {product.link.map((link: string, index: number) => (
                                    <li key={index} className='mb-5'>
                                        <Link href={`/${link.toLowerCase()}`} target="_blank" className="text-white text-lg font-normal mb-6 space-links">{link}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))} */}

                </div>
            </div>

            {/* All Rights Reserved */}

            <div className="mx-auto max-w-2xl lg:max-w-7xl">
                <div className="pt-5 pb-5 px-4 sm:px-6 lg:px-4 border-solid border-t border-footer">
                    <div className="mt-4 grid grid-cols-1 gap-y-10 gap-x-16 sm:grid-cols-2 xl:gap-x-8">
                        <div>
                            <h3 className='text-center md:text-start text-offwhite text-lg'>@2024 - All Rights Reserved by <Link href="https://surauelminavalley.com/" target="_blank"> surauelminavalley.com</Link></h3>
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

export default footer;
