import React, { useEffect } from "react";
import { usePet } from "../hooks/usePet";

export const NFTDisplaySection = ({ address }: { address: string }) => {
  const [pet] = usePet(address);

  const PetName = () => <h3>Pet Name: {pet.petName}</h3>;

  return <PetName />;
};
