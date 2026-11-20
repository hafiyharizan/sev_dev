import React from 'react';
import Image from "next/image";

const JobVacancyAnnouncement: React.FC = () => {
    return (
        <main className='mx-auto max-w-4xl my-10 sm:pb-10 px-6 lg:px-8 text-lg leading-8 text-darkpurple'>
            <p className="text-center text-2xl">بِسْــــــــــــــــــمِ اﷲِالرَّحْمَنِ اارَّحِيم</p>
            <br />
            <p className="text-center">السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ</p>
            <br />
            <p>Kami dengan sukacitanya ingin memaklumkan bahawa Surau Elmina Valley kini membuka peluang untuk mengisi kekosongan jawatan sebagai SIAK (Sistem Informasi & Aktiviti Keagamaan).</p>
            <br />
            <Image 
                src="/images/siak.jpg" 
                alt="Poster kekosongan jawatan SIAK Surau Elmina Valley" 
                width={600} 
                height={600} 
                className="rounded-3xl mx-auto w-full max-w-2xl h-auto"
            />

            <p className="mt-8">Sekian, terima kasih.</p>
            <br />

            <p>Jawatankuasa PROTEM <br/>
            Surau Elmina Valley</p>
        </main>
    );
}

export default JobVacancyAnnouncement;
