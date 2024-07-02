import Image from "next/image";

const Banner = () => {
    return (
        <div className='mx-auto max-w-7xl mb-10 sm:pb-10 px-6 lg:px-8'>
            <div className='grid grid-cols-1 lg:grid-cols-2 my-16'>

                {/* COLUMN-1 */}

                <div className="mx-auto sm:mx-0">
                    <div className='py-3 text-center lg:text-start'>
                        <button className='text-blue bg-lightblue hover:shadow-xl text-sm md:text-lg font-bold px-6 py-1 rounded-3xl tracking-wider hover:text-white hover:bg-black'>اَلسَّلَامُ عَلَيْكُم</button>
                    </div>
                    <div className="py-3 text-center lg:text-start">
                        <h1 className='text-5xl lg:text-70xl font-bold text-darkpurple'>
                            Ahlan ke Portal <br /> Surau Elmina Valley.
                        </h1>
                    </div>
                    <div className='my-7 text-center lg:text-start'>
                        <a href="https://maps.app.goo.gl/YFCK49qasKTejYnHA" target="_blank" rel="noopener noreferrer">
                            <button className='text-sm md:text-xl font-semibold hover:shadow-xl bg-blue text-white py-3 px-6 md:py-5 md:px-14 rounded-full hover:bg-hoblue'>
                                <span className="flex items-center">
                                    Lokasi Surau 
                                    <img className="ml-2" width="28" height="28" src="https://img.icons8.com/fluency/48/place-marker.png" alt="place-marker"/>
                                </span>
                            </button>
                        </a>
                    </div>
                </div>

                {/* COLUMN-2 */}

                <div className='lg:-m-24 lg:pt-20 hidden lg:block'>
                    <Image className='rounded-3xl' src="/images/surau2.jpg" alt="hero-image" width={800} height={642} />
                </div>

            </div>
        </div>
    )
}

export default Banner;
