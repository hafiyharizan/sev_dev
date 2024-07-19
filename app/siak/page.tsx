import React from 'react';
import Image from "next/image";

const JobVacancyAnnouncement: React.FC = () => {
    return (
        <div className='mx-auto max-w-7xl my-10 sm:pb-10 px-6 lg:px-8'>
            <p>بِسْــــــــــــــــــمِ اﷲِالرَّحْمَنِ اارَّحِيم</p>
            <br />
            <p>السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ</p>
            <br />
            <p>Kami dengan sukacitanya ingin memaklumkan bahawa Surau Elmina Valley kini membuka peluang untuk mengisi kekosongan jawatan sebagai SIAK (Sistem Informasi & Aktiviti Keagamaan).</p>
            <br />
            <Image 
                src="/images/siak.jpg" 
                alt="gaby" 
                width={600} 
                height={600} 
                className="rounded-3xl"
            />

            <p>Sekian, terima kasih.</p>
            <br />

            <p>Jawatankuasa PROTEM <br/>
            Surau Elmina Valley</p>
        </div>
    );
}

export default JobVacancyAnnouncement;
