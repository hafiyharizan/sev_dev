import React from 'react';

const JobVacancyAnnouncement: React.FC = () => {
    return (
        <div className='mx-auto max-w-7xl my-10 sm:pb-10 px-6 lg:px-8'>
            <p>بِسْــــــــــــــــــمِ اﷲِالرَّحْمَنِ اارَّحِيم</p>
            <br />
            <p>السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ</p>
            <br />
            <p>Kami dengan sukacitanya ingin memaklumkan bahawa Surau Elmina Valley kini membuka peluang untuk mengisi kekosongan jawatan sebagai SIAK (Sistem Informasi & Aktiviti Keagamaan).</p>
            <br />
            <iframe 
                src="/images/siak.pdf" 
                width="90%" 
                height="800px"
                style={{ border: 'none' }}
                title="SIAK Job Vacancy Announcement PDF"
            ></iframe>

            <p>Sekian, terima kasih.</p>
            <br />

            <p>Jawatankuasa PROTEM <br/>
            Surau Elmina Valley</p>
        </div>
    );
}

export default JobVacancyAnnouncement;
