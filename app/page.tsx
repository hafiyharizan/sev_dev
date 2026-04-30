import Banner from './components/Banner/index';
import Aboutus from './components/Aboutus/index';
import Dedicated from './components/Dedicated/index';
import Featured from './components/Featured/index';
import FAQ from './components/FAQ/index';
import Articles from './components/Articles/index';


export default function Home() {
  return (
    <main>
      <Banner />
      <Aboutus />
      <Articles />
      <Featured />
      <FAQ />
      <Dedicated />
    </main>
  )
}
