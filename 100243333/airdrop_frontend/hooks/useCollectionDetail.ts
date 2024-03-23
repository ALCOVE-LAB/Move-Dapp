import { formatFixed, parseFixed } from "@ethersproject/bignumber";
import { useMemo } from "react";

import { BASIC_DECIMALS } from "@/constants/misc";
import { ICollection, MarketPlaceCollection } from "@/types/nft";

import useAllPoolsForPublic from "./useAllPoolsForPublic";

const images = [
  "https://i.seadn.io/gae/CdfWxZtiC8zWloxRE5EspzzDVXM1P9c1Z0MZ0Bw4u8K4WA_R41W_IvcIfONnam3LyRXcg7uEqteb75YdT8CfO0UJy0GJj_0AvmUBww?auto=format&w=640",
  "https://i.seadn.io/gae/5r0xsU5zEAs8D9b2x_DD3-tZ0E_IgT5j4QQhs2imTSWgG1uobxrjPbYK0s22BZ23J9w5ODeebAS5AHOLvkpMTptjYWZtphlvTi5B?auto=format&w=640",
  "https://i.seadn.io/gae/_cPliwofEAHVmStDZ2a_OlVIgTfTQrvdLDoO6-PDk80D9wErUuHaIrHQ16x875T4BUV6GCxTBx1-PLrYa9lHMOOHH0kJ3rIQb-ejPw?auto=format&w=640",
  "https://i.seadn.io/gae/C21jM8zXpfWblZhzq-j5BENzetODjV1bhyeHdjyFT7jrjneZcDtYhKswangv9wCjhrzr4gJ7fOhZInp9EHbxWlfIyyyCTHYV-TpOVg?auto=format&w=640",
];
const mockData: MarketPlaceCollection = {
  name: "Aptos BAYC",
  creator: "",
  image:
    "https://i.seadn.io/gae/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xKIgjJJtWIc0ybj4Vd7wv8t3pxDGHoJBzDB?auto=format&w=256",
  items: Array.from({ length: 48 })
    .fill(null)
    .map((_, index) => {
      return {
        price: {
          displayed: "21.20",
          value: parseFixed("21.20", BASIC_DECIMALS),
        },
        tokenId: {
          token_data_id: {
            collection: "Aptos BAYC",
            creator: "",
            name: `BAYC #${index + 1}`,
          },
          property_version: "1",
        },
        image: images[index % images.length],
      };
    }),
};
export default function useCollectionDetail(collectName: string | null) {
  const { data, error, isLoading } = useAllPoolsForPublic(11);
  const collectionData = useMemo(() => {
    if (!collectName) return null;
    const res: ICollection = {
      name: collectName,
      type: "",
      listing: 0,
      items: [],
    };

    for (const item of data) {
      const { tokenIds, poolType, spotPrice, delta } = item;
      if (!tokenIds?.length) {
        continue;
      }
      const {
        token_data_id: { collection, name },
      } = tokenIds?.[0] || {};
      const tokenId = name.match(/#(\d+)$/)?.[1];
      if (collection === collectName) {
        (res.coverImage =
          "https://bafybeibgtdkejt77t4w2fl2kh36cokmj5vipwfsxsn2z2fx35trlvg2kc4.ipfs.nftstorage.link/4.png"),
          res.items?.push({
            ...item,
            image: `https://bafybeibgtdkejt77t4w2fl2kh36cokmj5vipwfsxsn2z2fx35trlvg2kc4.ipfs.nftstorage.link/${tokenId}.png`,
          });
        res.listing += tokenIds.length;
        res.floorPrice =
          res.floorPrice &&
          spotPrice &&
          parseFixed(res.floorPrice!, BASIC_DECIMALS).lt(spotPrice)
            ? res.floorPrice
            : formatFixed(spotPrice.toString(), BASIC_DECIMALS);
      }
    }
    return res;
  }, [collectName, data]);
  return {
    data: collectionData,
  };
}
