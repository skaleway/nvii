import ConfirmationModal from "@/components/modal/confirmation";
import CreateNewSpace from "@/components/modal/create-space";
import CreateTeam from "@/components/modal/create-team";
import Invite from "@/components/modal/invite";
import Logout from "@/components/modal/logout";
import React from "react";

const Modal = () => {
  return (
    <>
      <CreateNewSpace />
      <ConfirmationModal />
      <Logout />
      <Invite />
      <CreateTeam />
    </>
  );
};

export default Modal;
