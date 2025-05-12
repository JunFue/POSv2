export function POSContents() {
  return (
    <>
      <div
        id="pos-header-container"
        className="relative flex flex-row border border-amber-400 h-fit items-center"
      >
        <img
          src="logo.png"
          alt=""
          className="absolute top-1 left-1 w-[4vw] aspect-auto border border-amber-400"
        />
        <div className="flex flex-col w-full border border-amber-400 items-center">
          <h1 className="text-[2vw]">POINT OF SALE</h1>
          <p className="text-[1vw]">made for: GREEN SECRETS</p>
          <p className="italic text-[0.5vw]">Property of JunFue</p>
        </div>
      </div>
    </>
  );
}
