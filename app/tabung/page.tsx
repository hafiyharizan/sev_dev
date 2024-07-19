import React from 'react';
import Image from "next/image";

const TabungAnnouncement: React.FC = () => {
    return (
        <div className='mx-auto max-w-7xl my-10 sm:pb-10 px-6 lg:px-8'>
            <p>بِسْــــــــــــــــــمِ اﷲِالرَّحْمَنِ اارَّحِيم</p>
            <br />
            <p>السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ</p>
            <br />
            <p>ٱلْحَمْدُ لِلَّٰهِ</p>

            <p>Berikut jumlah kutipan bulanan Tabung Surau Elmina Valley sehingga Julai 2024:</p>
            <br />
            <div style={{ marginTop: '-20px', marginBottom: '-100px', marginLeft: '-20px' }}>
                <Image 
                    src="/images/articles/article6.jpg" 
                    alt="gaby" 
                    width={620} 
                    height={877} 
                    className="rounded-3xl"
                />
            </div>
            <h2>Marilah kita sama - sama menyalurkan sumbangan ikhlas bagi menampung perbelanjaan bagi menjalankan aktiviti surau, antaranya:</h2>
            <ul style={{ listStyleType: 'disc', marginLeft: '1.5rem' }}>
                <li>a) Penambahbaikan fasiliti dan prasarana surau</li>
                <li>b) Saguhati untuk penceramah</li>
                <li>c) Kelas-kelas pengajian untuk dewasa dan kanak-kanak</li>
            </ul>
            <br />
            <p className='mb-2'>Bagi para penderma boleh membuat sumbangan melalui QR di bawah atau terus ke pautan website kami.</p>
            <Image 
                src="/images/QR_SEV.jpg" 
                alt="gaby" 
                width={600} 
                height={600} 
                className="rounded-3xl"
            />
            <br />
            <p>Sekian, terima kasih.</p>
            <br />
            <p>Jawatankuasa PROTEM <br/>
            Surau Elmina Valley</p>
        </div>
    );
}

export default TabungAnnouncement;
