"use client"
import Slider from "react-slick";
import React, { Component } from "react";
import Link from "next/link";
import Image from "next/image";

// CAROUSEL DATA

interface DataType {
    heading: string;
    heading2: string;
    date: string;
    imgSrc: string;
    name: string;
    linkbuletin: string;
}

const postData: DataType[] = [
    {
        heading: 'Kutipan Bulanan Tabung SEV',
        heading2: 'Jumlah Kutipan Bulanan Tabung SEV',
        name: "Published on",
        date: 'Julai 19, 2024',
        imgSrc: '/images/articles/article6.jpg',
        linkbuletin: '/tabung',
    },
    {
        heading: 'Tabung Khairat Kematian',
        heading2: 'Pendaftaran Keahlian Kini Dibuka',
        name: "Published on",
        date: 'Julai 2, 2024',
        imgSrc: '/images/articles/article2.png',
        linkbuletin: 'https://form.jotform.com/elminavalley/TabungKhairat',
    },
    {
        heading: 'Tabung Derma Surau',
        heading2: 'Ayuh amal jariah dengan menderma',
        name: "Published on ",
        date: 'Julai 2, 2024',
        imgSrc: '/images/articles/qr_square.png',
        linkbuletin: '/',
    },
    {
        heading: 'Hari Raya Eidul-Adha',
        heading2: 'Solat Sunat Eidul-Adha 2024 di SEV',
        name: "Published on ",
        date: 'Jun 17, 2024',
        imgSrc: '/images/articles/article4.jpg',
        linkbuletin: '/',
    },
    {
        heading: 'Program Qurban SEV 24',
        heading2: '2 ekor Kambing & 5 Ekor Lembu!',
        name: "Published on",
        date: 'Jun 17, 2024',
        imgSrc: '/images/articles/article.jpg',
        linkbuletin: '/',
    },
    {
        heading: 'Perkongsian Hadith',
        heading2: 'Jom 5 minit 1 Hadith',
        name: "Published on ",
        date: 'Julai 2, 2024',
        imgSrc: '/images/articles/feat3.jpeg',
        linkbuletin: '/',
    },
]

// CAROUSEL SETTINGS


export default class MultipleItems extends Component {

    render() {
        const settings = {
            dots: false,
            infinite: true,
            slidesToShow: 3,
            // centerMode: true,
            slidesToScroll: 2,
            arrows: true,
            autoplay: true,
            speed: 500,
            cssEase: "linear",
            responsive: [
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1,
                        infinite: true,
                        dots: false
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        infinite: true,
                        dots: false
                    }
                }
            ]
        };


        return (
            <div className="bg-lightgrey py-20" id="blog-section">
                <div className='mx-auto max-w-7xl sm:py-4 lg:px-8 '>

                    <div className="text-center">
                        <h3 className="text-blue text-lg font-normal tracking-widest">BULETIN</h3>
                        <h3 className="text-3xl sm:text-3xl font-bold">Buletin info aktiviti2 terkini di Surau Elmina Valley.</h3>
                    </div>


                    <Slider {...settings}>
                        {postData.map((items, i) => (
                            <div key={i} >

                                <div className='bg-white m-3 px-3 pt-3 pb-12 my-10 shadow-lg rounded-3xl relative'>
                                    <Image src={items.imgSrc} alt="gaby" width={389} height={262} className="inline-block m-auto rounded-3xl max-h-60" />

                                    <Link href={items.linkbuletin} target="_blank">
                                        <h3 className="absolute bg-blue text-white hover:bg-black hover:shadow-xl py-3 px-6 rounded-full article-img">Lihat Buletin</h3>
                                    </Link>
                                    <h4 className='text-2xl font-bold pt-6 text-black'>{items.heading}</h4>
                                    <h4 className='text-xl font-semibold pt-1 text-black'>{items.heading2}</h4>

                                    <div>
                                        <h3 className='text-base font-normal pt-6 pb-2 opacity-75'>{items.name}</h3>
                                        <h3 className='text-base font-normal pb-1 opacity-75'>{items.date}</h3>
                                    </div>

                                </div>

                            </div>
                        ))}
                    </Slider>
                </div>
            </div>

        );
    }
}
