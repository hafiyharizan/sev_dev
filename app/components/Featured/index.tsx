"use client"
import Slider from "react-slick";
import React, { Component } from "react";
import Image from "next/image";

// CAROUSEL DATA

interface DataType {
    heading: string;
    imgSrc: string;
    videoSrc: string;
    link: string;
}
const postData: DataType[] = [
    {
        heading: 'Program Qurban SEV 2024',
        imgSrc: '',
        videoSrc: 'https://www.youtube.com/embed/dPnTTTwGgJs?si=Jbr62JCSvlGg_hpI',
        link: '',
    },
    {
        heading: 'Hari Raya Eidul-Adha.',
        imgSrc: '/images/featured/feat3.jpg',
        videoSrc: '',
        link: 'https://drive.google.com/drive/folders/1nJDqx4MWPdhjUOwjTpA40HcRA2XMRjOY?usp=drive_link',
    },
    {
        heading: 'Tadarrus Mingguan.',
        imgSrc: '/images/featured/feat1.jpg',
        videoSrc: '',
        link: '/',
    },
    {
        heading: 'Gotong Royong Mingguan.',
        imgSrc: '/images/featured/feat2.jpg',
        videoSrc: '',
        link: '/',
    }
]

// CAROUSEL SETTINGS

function SampleNextArrow(props: { className: any; style: any; onClick: any; }) {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style={{ ...style, display: "flex", justifyContent: "center", alignItems: "center" , background: "rgba(255, 255, 255, 0.3)", padding: "28px", borderRadius: "20px" }}
            onClick={onClick}
        />
    );
}

function SamplePrevArrow(props: { className: any; style: any; onClick: any; }) {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style={{ ...style, display: "flex", justifyContent: "center", alignItems: "center" , background: "rgba(255, 255, 255, 0.3)", padding: "28px", borderRadius: "20px" }}
            onClick={onClick}
        />
    );
}


export default class MultipleItems extends Component {

    render() {
        const settings = {
            dots: false,
            infinite: true,
            slidesToShow: 2,
            // centerMode: true,
            slidesToScroll: 1,
            arrows: true,
            autoplay: true,
            speed: 500,
            nextArrow: <SampleNextArrow className={undefined} style={undefined} onClick={undefined} />,
            prevArrow: <SamplePrevArrow className={undefined} style={undefined} onClick={undefined} />,
            cssEase: "linear",
            responsive: [
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
            <div id="galeri-section" className="bg-bgblue py-20 marginFeature bg-featured">
                <div className='mx-auto max-w-7xl sm:py-4 lg:px-8 '>

                    <div className="text-center pt-48 pb-10 md:pt-96">
                        <h3 className="text-4xl sm:text-6xl font-bold text-white my-2">Galeri.</h3>
                        <h3 className="text-4xl sm:text-6xl font-bold text-white text-opacity-50 lg:mr-48 my-2">Aktiviti2.</h3>
                        <h3 className="text-4xl sm:text-6xl font-bold text-white text-opacity-25 lg:-mr-32 my-2">Mengimarahkan.</h3>
                    </div>

                    <Slider {...settings}>
                        {postData.map((item, index) => (
                            <div key={index}>
                                {index === 0 ? (
                                    <div className='bg-transparent m-3 pb-12 my-10 rounded-3xl'>
                                        <iframe className='rounded-2xl'
                                            height="384"
                                            style={{
                                                width: '100%', // Ensures iframe takes full width of container
                                                maxWidth: '100%', // Ensures iframe doesn't exceed container width
                                            }}
                                            src={item.videoSrc}
                                            title="YouTube video player"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            referrerPolicy="strict-origin-when-cross-origin"
                                            allowFullScreen
                                        ></iframe>
                                        <div className="w-345">
                                            <h4 className='sm:text-4xl font-bold sm:pt-6 text-center sm:text-start mt-10 text-white'>{item.heading}</h4>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='bg-transparent m-3 pb-12 my-10 rounded-3xl'>
                                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                                            <img src={item.imgSrc} alt={item.heading} className="rounded-2xl w-full max-h-96" />
                                            <div className="w-345">
                                                <h4 className='sm:text-4xl font-bold sm:pt-6 text-center sm:text-start mt-10 text-white'>{item.heading}</h4>
                                            </div>
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>

        );
    }
}
