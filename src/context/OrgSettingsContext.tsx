import React, { createContext, useContext, useState } from "react";

type OrgSettingsContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const OrgSettingsContext = createContext<OrgSettingsContextType | undefined>(undefined);

export const OrgSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <OrgSettingsContext.Provider value={{ open, setOpen }}>
      {children}
    </OrgSettingsContext.Provider>
  );
};

export const useOrgSettings = () => {
  const context = useContext(OrgSettingsContext);
  if (!context) {
    throw new Error("useOrgSettings must be used within an OrgSettingsProvider");
  }
  return context;
};
