import React from 'react';
import Image from "next/image";

const TabungAnnouncement: React.FC = () => {
    return (
        <main className='mx-auto max-w-4xl my-10 sm:pb-10 px-6 lg:px-8 text-lg leading-8 text-darkpurple'>
            <p className="text-center text-2xl">بِسْــــــــــــــــــمِ اﷲِالرَّحْمَنِ اارَّحِيم</p>
            <br />
            <p className="text-center">السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ</p>
            <br />
            <p className="text-center">ٱلْحَمْدُ لِلَّٰهِ</p>

            <p>Berikut jumlah kutipan bulanan Tabung Surau Elmina Valley sehingga Julai 2024:</p>
            <br />
            <div className="my-6">
                <Image 
                    src="/images/articles/article6.jpg" 
                    alt="Poster kutipan bulanan Tabung Surau Elmina Valley" 
                    width={620} 
                    height={877} 
                    className="rounded-3xl mx-auto w-full max-w-2xl h-auto"
                />
            </div>
            <h2 className="font-semibold">Marilah kita sama - sama menyalurkan sumbangan ikhlas bagi menampung perbelanjaan bagi menjalankan aktiviti surau, antaranya:</h2>
            <ul className="list-disc ml-6 mt-3">
                <li>a) Penambahbaikan fasiliti dan prasarana surau</li>
                <li>b) Saguhati untuk penceramah</li>
                <li>c) Kelas-kelas pengajian untuk dewasa dan kanak-kanak</li>
            </ul>
            <br />
            <p className='mb-2'>Bagi para penderma boleh membuat sumbangan melalui QR di bawah atau terus ke pautan website kami.</p>
            <Image 
                src="/images/QR_SEV.jpg" 
                alt="QR code sumbangan Surau Elmina Valley" 
                width={600} 
                height={600} 
                className="rounded-3xl mx-auto w-full max-w-lg h-auto"
            />
            <br />
            <p>Sekian, terima kasih.</p>
            <br />
            <p>Jawatankuasa PROTEM <br/>
            Surau Elmina Valley</p>
        </main>
    );
}

export default TabungAnnouncement;
