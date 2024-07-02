import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon } from '@heroicons/react/20/solid'

interface datatype {
    heading: string;
    imgSrc: string;
    imgwidth: number;
    imgheight: number;
    paragraph: string;
    link: string;
}

const Aboutdata: datatype[] = [
    {
        heading: "Kekosongan Jawatan SIAK di SEV.",
        imgSrc: "/images/aboutus/siak.jpg",
        imgwidth: 130,
        imgheight: 130,
        paragraph: 'Surau Elmina Valley kini membuka peluang untuk mengisi kekosongan jawatan sebagai SIAK (Sistem Informasi & Aktiviti Keagamaan).\n',
        link: '/'
    },
    {
        heading: "Tabung Khairat.",
        imgSrc: "/images/articles/article2.png",
        imgwidth: 220,
        imgheight: 200,
        paragraph: 'Dibuka kepada semua penduduk Muslimin & Muslimat yang telah menetap di kawasan Elmina sekurang-kurangnya TIGA (3) bulan dari tarikh berdaftar sebagai ahli.\n',
        link: 'https://form.jotform.com/elminavalley/TabungKhairat'
    },
    {
        heading: "Kuliah Maghrib.",
        imgSrc: "/images/aboutus/harum_di_langit_cover.png",
        imgwidth: 150,
        imgheight: 150,
        paragraph: '(Pengajian Kitab Bulanan Sirah Sahabat Nabi): "Kisah Para Sahabat"\n' +
        'Tarikh: Bermula 11 Julai 2024 (setiap khamis minggu kedua)\n' +
        'Penceramah : Ustaz Nazmi Karim',
        link: 'https://shopee.com.my/-Ustaz-Nazmi-Karim-Ustaz-Hamid-Addin-Buku-Mereka-yang-Harum-di-Langit-Kisah-Sahabat-Sahabat-Nabi-tidak-didendangkan-i.106559832.16174432300'
    },
]

const Aboutus = () => {
    return (

        <div id="aboutus-section">
            <div className='mx-auto max-w-7xl px-4 py-24 my-32 lg:px-10 bg-lightgrey rounded-3xl relative'>
                <Image src="/images/aboutus/dots.svg" width={100} height={100} alt="dots-image" className="absolute bottom-1 -left-20" />
                <h3 className='text-center text-blue text-lg tracking-widest'>Pengumuman</h3>
                <h4 className='text-center text-3xl lg:text-35xl font-bold'>Pengumuman terkini berkaitan Surau Elmina Valley.</h4>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 my-6 gap-x-10 lg:gap-x-22'>
                    {Aboutdata.map((item, i) => (
                        <div key={i} className='hover:bg-navyblue bg-white rounded-3xl mt-16 pt-10 pl-8 pb-10 pr-6 shadow-xl group'>
                            <h4 className='text-3xl font-semibold  text-black mb-5 group-hover:text-white'>{item.heading}</h4>
                            <Image src={item.imgSrc} alt={item.imgSrc} width={item.imgwidth} height={item.imgheight} className="mb-5" />
                            {/* <h4 className='text-lg font-normal text-black group-hover:text-offwhite mb-5'>{item.paragraph}</h4> */}
                            <p className='text-lg font-normal text-black group-hover:text-offwhite'>
                                {item.paragraph.split('\n').map((line, index) => (
                                    <span key={index}>
                                        {line}
                                        <br />
                                        <br />
                                    </span>
                                ))}
                            </p>
                            <Link href={item.link} target="_blank" className='text-lg font-semibold group-hover:text-white text-blue hover-underline'>
                                Info Lanjut
                                <ChevronRightIcon width={20} height={20} />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>

    )
}

export default Aboutus;