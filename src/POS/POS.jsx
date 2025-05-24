import { useEffect, useState } from "react";
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";
import { POSContents } from "./POSContents";

export function POS({ productData, setProductData, items, setItems }) {
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
          isOpen ? "flex-grow" : "flex-shrink [&>*]:hidden "
        }  border border-amber-500 transition-all duration-1000 ease-in-out basis-0 min-w-0`}
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
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-amber-500 m-auto"></div>
        ) : (
          <></>
        )}

        {content ? (
          <POSContents
            productData={productData}
            setProductData={setProductData}
            items={items}
            setItems={setItems}
          />
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
