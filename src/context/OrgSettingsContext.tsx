import React, { createContext, useContext, useState, useEffect } from "react";

type OrgSettingsContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  registries: any[]; // You can type this properly if you have the type definition
};

const OrgSettingsContext = createContext<OrgSettingsContextType | undefined>(undefined);

export const OrgSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [registries, setRegistries] = useState<any[]>([]);

  useEffect(() => {
    getRegistriesByAddress();
  }, []);

  const getRegistriesByAddress = () => {
    fetch(`${import.meta.env.VITE_API_ENDPOINT}/api/v1/registry/list/${import.meta.env.VITE_APP_PROFILE_ADDRESS}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      if (response.status === 200 || response.status === 201) {
        response.json().then((data) => {
          console.log(data);
          if (data && Array.isArray(data.registries)) {
            setRegistries(data.registries);
          } else if (Array.isArray(data)) {
            setRegistries(data);
          } else {
            setRegistries([]);
          }
        });
      } else if (response.status === 504) {
        console.log("The server is busy, please try again in a while'")

      } else {
        response
          .json()
          .then((data) => {
            console.log(data.error);
          })
          .catch((err) => {
            console.log(err.message);
          });
      }
    })
      .catch(() => {
        console.log("An error occured, please try again later!");
      });

  }

  return (
    <OrgSettingsContext.Provider value={{ open, setOpen, registries }}>
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

