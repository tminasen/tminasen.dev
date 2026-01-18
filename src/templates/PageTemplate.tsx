import { JSX, useState } from 'react';
import { HeaderComponent } from '../components/HeaderComponent';
import { FooterComponent } from '../components/FooterComponent';

interface Props {
  children: JSX.Element | JSX.Element[];
}

const useModalCondition = () => {
  const [showModal, setShowModal] = useState(false);
  const closeModal = () => setShowModal(false);
  const openModal = () => setShowModal(true);
  return [showModal, closeModal, openModal] as const;
};

export const PageTemplate: React.FC<Props> = ({ children }) => {
  const [showModal, closeModal, openModal] = useModalCondition();
  return (
    <div className='flex flex-col relative min-h-lvh min-w-86 sm:min-w-7xl bg-(--color-bg-base)'>
      <HeaderComponent
        siteTitle="水無瀬のプログラミング日記"
        showModal={showModal}
        openModal={openModal}
        closeModal={closeModal}
      />
      <div className='flex flex-[1_0_auto] justify-between mt-5 mb-0 mx-1 sm:mx-2'>
        <main className='w-full'>{children}</main>
      </div>
      <FooterComponent />
      <div className={`${showModal ? 'block': 'hidden'} absolute bg-black/20 w-full h-full z-5`} />
    </div>
  );
};
