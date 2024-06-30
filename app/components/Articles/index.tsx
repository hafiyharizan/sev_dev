"use client"
import Slider from "react-slick";
import React, { Component } from "react";
import Link from "next/link";
import Image from "next/image";

// CAROUSEL DATA

interface DataType {
    time: string;
    heading: string;
    heading2: string;
    date: string;
    imgSrc: string;
    name: string;
}

const postData: DataType[] = [
    {
        time: "Lihat Buletin",
        heading: 'Program Qurban SEV 24',
        heading2: '2 ekor Kambing & 5 Ekor Lembu!',
        name: "Published on",
        date: 'August 19, 2021',
        imgSrc: '/images/articles/article.png',
    },
    {
        time: "Lihat Buletin",
        heading: 'Tabung Khairat Kematian',
        heading2: 'Pendaftaran Keahlian Kini Dibuka',
        name: "Published on",
        date: 'August 19, 2021',
        imgSrc: '/images/articles/article2.png',
    },
    {
        time: "Lihat Buletin",
        heading: 'Buletin Sample Title',
        heading2: 'Buletin Sample Description',
        name: "Published on ",
        date: 'August 19, 2021',
        imgSrc: '/images/articles/article3.png',
    },
    {
        time: "Lihat Buletin",
        heading: 'Buletin Sample Title',
        heading2: 'Buletin Sample Description',
        name: "Published on ",
        date: 'August 19, 2021',
        imgSrc: '/images/articles/article.png',
    },
    {
        time: "Lihat Buletin",
        heading: 'Buletin Sample Title',
        heading2: 'Buletin Sample Description',
        name: "Published on ",
        date: 'August 19, 2021',
        imgSrc: '/images/articles/article2.png',
    },
    {
        time: "Lihat Buletin",
        heading: 'Buletin Sample Title',
        heading2: 'Buletin Sample Description',
        name: "Published on ",
        date: 'August 19, 2021',
        imgSrc: '/images/articles/article3.png',
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
            arrows: false,
            autoplay: false,
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
                                    <Image src={items.imgSrc} alt="gaby" width={389} height={262} className="inline-block m-auto" />

                                    <Link href="/">
                                        <h3 className="absolute bg-blue text-white hover:bg-black hover:shadow-xl py-3 px-6 rounded-full article-img">{items.time}</h3>
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
