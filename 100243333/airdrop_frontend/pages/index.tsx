import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRecoilValue } from "recoil";

import { networkState } from "@/recoil/network";

const Home: NextPage = () => {
  const { network } = useRecoilValue(networkState);
  return (
    <div className="relative flex h-screen flex-col items-center justify-center py-2">
      <div className="absolute inset-0">
        <div className="absolute left-0 bottom-0 h-[485px] w-[448px] bg-home-left-bottom bg-cover bg-center bg-no-repeat">
          <div className="absolute right-[45%] top-[6%] h-[82px] w-[79px]">
            <Image
              src={"/images/diamond-1.png"}
              width={118}
              height={122}
              layout="responsive"
              className="absolute inset-0"
              alt=""
            ></Image>
          </div>

          <div className="absolute right-[15%] bottom-[15%] h-[64px] w-[58px]">
            <Image
              src={"/images/diamond-2.png"}
              width={82}
              height={75}
              layout="responsive"
              className="absolute inset-0"
              alt=""
            ></Image>
          </div>
        </div>

        <div className="absolute right-[0%] bottom-[0%] h-[100vh] w-[94vh] bg-home-right-bg bg-cover bg-center bg-no-repeat">
          <div className="absolute right-[0%] top-1/2 h-[75%] w-[70%] -translate-y-1/2 transform bg-home-right bg-cover bg-center bg-no-repeat">
            {/* <Image
              src={"/images/diamond-2.png"}
              width={82}
              height={75}
              layout="responsive"
              className="absolute inset-0"
              alt=""
            ></Image> */}
          </div>
          <div className="absolute left-[54%] top-[22%] h-[64px] w-[58px]">
            <Image
              src={"/images/diamond-circles.png"}
              width={82}
              height={75}
              layout="responsive"
              className="absolute inset-0"
              alt=""
            ></Image>
          </div>
        </div>
      </div>
      <div className="container relative mx-auto flex flex-col items-center justify-center">
        <div className="mt-20 flex items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
          <div className="flex flex-col items-center justify-center space-y-5">
            <Link passHref href={`/swap`}>
              <a className="inline-block w-full rounded-xl bg-primary px-3 py-3 text-center font-semibold leading-6 text-white transition-colors hover:bg-primary-lighter sm:w-[160px]">
                 AirDrop
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
