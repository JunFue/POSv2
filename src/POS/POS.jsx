import { useEffect, useState } from "react";
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";
import { POSContents } from "./POSContents";

export function POS() {
  const [isOpen, setIsOpen] = useState(true);
  const [content, setContent] = useState(false);
  const [loadingAnimation, setLoadingAnimation] = useState(false);

  const open = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      setLoadingAnimation(true);
      setTimeout(() => {
        setLoadingAnimation(false);
      }, 900);
      setTimeout(() => {
        setContent(true);
      }, 1000);
    } else if (!isOpen) {
      setContent(false);
    }
  }, [isOpen]);

  return (
    <>
      <div
        className={`relative flex flex-col ${
          isOpen ? "flex-grow p-[0.8vw]" : "flex-shrink [&>*]:hidden "
        } rounded-2xl transition-all! duration-1000 ease-in-out basis-0 min-w-0`}
      >
        <button
          className={`absolute z-1 top-[0.5vw] ${
            isOpen ? "right-[0.5vw]" : "right-[-1.25vw] !block"
          } hover:cursor-pointer transition-all duration-1000 ease-in-out`}
          onClick={open}
        >
          {isOpen ? <FaAnglesLeft /> : <FaAnglesRight />}
        </button>

        {loadingAnimation ? (
          <div className="flex justify-center items-center h-24">
            <div className="w-14 h-14 rounded-full bg-accent-50 shadow-custom-outset flex items-center justify-center relative">
              <div className="absolute w-14 h-14 rounded-full border-[6px] border-t-[#b0b0b0] border-b-[#ffffff] border-l-[#e0e0e0] border-r-[#e0e0e0] animate-spin"></div>
              <div className="w-8 h-8 rounded-full bg-[#e0e0e0] shadow-[inset_2px_2px_6px_#bebebe,inset_-2px_-2px_6px_#ffffff]"></div>
            </div>
          </div>
        ) : null}

        {content ? <POSContents /> : <></>}
      </div>
    </>
  );
}
