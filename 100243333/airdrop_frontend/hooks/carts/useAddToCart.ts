import { useCallback } from "react";
import { useSetRecoilState } from "recoil";

import { cartState } from "@/recoil/cart";
import { ICollectionItem } from "@/types/nft";

export default function useAddToCart() {
  const setCartState = useSetRecoilState(cartState);

  return useCallback(
    (data: ICollectionItem) => {
      setCartState((prevState) => {
        const existIndex = prevState.items.findIndex((item) => {
          const { token_data_id } = item.tokenId;
          return (
            token_data_id.collection === data.token_data_id.collection &&
            token_data_id.creator === data.token_data_id.creator &&
            token_data_id.name === data.token_data_id.name
          );
        });
        return existIndex >= 0
          ? {
              ...prevState,
              isOpen: true,
            }
          : {
              ...prevState,
              isOpen: true,
              items: [
                ...prevState.items,
                {
                  image: data.image,
                  price: data.price,
                  tokenId: {
                    token_data_id: data.token_data_id,
                    property_version: data.property_version,
                  },
                },
              ],
            };
      });
    },
    [setCartState]
  );
}
