import { useEffect } from 'react';
import Hero from '../sections/Hero.jsx';
import Marquee from '../sections/Marquee.jsx';
import Edit from '../sections/Edit.jsx';
import Story from '../sections/Story.jsx';
import Reviews from '../sections/Reviews.jsx';
import Contact from '../sections/Contact.jsx';
import Scallop from '../components/Scallop.jsx';

export default function Home() {
  useEffect(() => { document.title = 'VANNAM — Little things, lovingly made'; }, []);
  return (
    <>
      <Hero />
      <Scallop to="blush" />
      <Marquee />
      <Scallop to="cream" />
      <Edit />
      <Scallop to="plum" />
      <Story />
      <Scallop to="lilac" />
      <Reviews />
      <Scallop to="ink" />
      <Contact />
    </>
  );
}
