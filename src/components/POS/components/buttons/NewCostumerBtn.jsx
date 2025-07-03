import React from "react";
import PosButton from "./PosButton"; // Assuming PosButton is in the same folder

export const NewCustomerBtn = ({ onClick }) => {
  return <PosButton onClick={onClick}>New Customer</PosButton>;
};
