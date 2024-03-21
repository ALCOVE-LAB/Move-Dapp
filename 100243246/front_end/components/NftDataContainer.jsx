"use client";
import React from "react";
import NftdataCard from "./NftdataCard";
import Link from "next/link";

const NftdataContainer = ({
  metaDataArray,
  MyReviews = false,
}) => {
  const handleReviewDeleted = () => {
    window.location.reload();
  };

  const renderNoReviewsFound = () => (
    <div className="w-full text-center py-20">
      <h2 className="text-4xl font-bold text-white">No Readings Minted</h2>
      <div className="bg-blue-500 text-white font-bold py-4 px-6 rounded-lg w-1/5 mx-auto my-20">
        <Link href="/">Mint Now</Link>
      </div>
    </div>
  );

  return (
    <>
      <div
        className="mx-auto px-10 min-h-screen py-10"
      >
        {metaDataArray?.length === 0 ? (
          renderNoReviewsFound()
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: "2rem",
            }}
          >
            {metaDataArray?.map((metaData, index) => (
              <div
                key={index}
                className="py-2 flex"
              >
                <NftdataCard
                  metaData={metaData}
                  MyReviews={MyReviews}
                  onReviewDeleted={handleReviewDeleted}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default NftdataContainer;
