"use client";

const serverError = "/images/server-error.jpg";
import ButtonComponent from "@/components/atoms/ButtonComponent";
const ServerError = () => {
  return (
    <div className="h-screen w-screen bg-no-repeat bg-center object-cover flex justify-center items-center">
      <div className="flex flex-col text-center gap-7">
        <img src={serverError} alt="Not Found Image 404" className="w-[400px] mx-auto" />
        <h1 className="mt-4 text-5xl font-black text-[#0E384C]"><span className="text-base-color">Oops!</span> Something Went Wrong</h1>
        <p className="font-normal text-[#94afbb]">Please try again in a moment</p>
        <div className="mx-auto">
          <ButtonComponent text={"Back to Home"} path={"/"} />
        </div>
      </div>

    </div>
  );
};

export default ServerError;