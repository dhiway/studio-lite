import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Layout from "@/layouts/layout";
import { Link } from "@tanstack/react-router";
import { useOrgSettings } from "@/context/OrgSettingsContext";
import { useState, useEffect } from "react";
import dayjs from "dayjs";

interface AggregatedCredential {
  credId: string;
  registryId: string;
  registryTitle: string;
  createdAt: string;
  status: string;
}

export default function IssuedCredentialsTable() {
  const { registries } = useOrgSettings();
  const [credentials, setCredentials] = useState<AggregatedCredential[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!registries || registries.length === 0) return;

    setLoading(true);

    // Fetch credentials for every registry in parallel
    const fetches = registries.map((registry: any) => {
      const schemaTitle = (() => {
        try {
          const s = typeof registry.schema === "string"
            ? JSON.parse(registry.schema)
            : registry.schema;
          return s?.title || "Unknown Schema";
        } catch {
          return "Unknown Schema";
        }
      })();

      return fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/api/v1/cred/list/${registry.registryId}`
      )
        .then((res) => (res.ok ? res.json() : { credentials: [] }))
        .then((data) => {
          const list: any[] = Array.isArray(data) ? data : data.credentials || [];
          return list.map((cred: any) => ({
            credId: cred.credId || cred.id || "",
            registryId: registry.registryId,
            registryTitle: schemaTitle,
            createdAt: cred.createdAt || "",
            status: cred.status || "Active",
          }));
        })
        .catch(() => [] as AggregatedCredential[]);
    });

    Promise.all(fetches).then((results) => {
      const all = results
        .flat()
        .filter((c) => c.credId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      setCredentials(all);
      setLoading(false);
    });
  }, [registries]);

  return (
    <Layout>
      <div className="mx-auto w-[85%] bg-transparent">
        <h2 className="text-white text-2xl font-semibold mb-6">
          All Issued Credentials
        </h2>

        <div className="overflow-hidden rounded-2xl border border-[#393939] bg-[#1c1c1c]">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#393939] hover:bg-transparent">
                <TableHead className="text-gray-300 font-medium pl-8">
                  Issued On
                </TableHead>
                <TableHead className="text-gray-300 font-medium">
                  Status
                </TableHead>
                <TableHead className="text-gray-300 font-medium">
                  Credential ID
                </TableHead>
                <TableHead className="text-gray-300 font-medium">
                  Schema / Registry
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-gray-500 py-10"
                  >
                    Loading credentials…
                  </TableCell>
                </TableRow>
              ) : credentials.length > 0 ? (
                credentials.map((cred, i) => (
                  <TableRow
                    key={cred.credId || i}
                    className="border-b border-[#2b2b2b] hover:bg-[#252525] transition-colors cursor-pointer"
                  >
                    <TableCell className="text-gray-300 pl-8">
                      <Link
                        to="/credential/$credentialId"
                        params={{ credentialId: cred.credId }}
                        className="block w-full h-full py-4"
                      >
                        {cred.createdAt
                          ? dayjs(cred.createdAt).format("DD/MM/YYYY")
                          : "-"}
                      </Link>
                    </TableCell>

                    <TableCell className="text-green-500 font-medium">
                      <Link
                        to="/credential/$credentialId"
                        params={{ credentialId: cred.credId }}
                        className="block w-full h-full py-4"
                      >
                        {cred.status}
                      </Link>
                    </TableCell>

                    <TableCell className="text-gray-200">
                      <Link
                        to="/credential/$credentialId"
                        params={{ credentialId: cred.credId }}
                        className="block w-full h-full py-4"
                      >
                        {cred.credId}
                      </Link>
                    </TableCell>

                    <TableCell className="text-gray-200">
                      <Link
                        to="/credential/$credentialId"
                        params={{ credentialId: cred.credId }}
                        className="block w-full h-full py-4"
                      >
                        {cred.registryTitle}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-gray-500 py-10"
                  >
                    No issued credentials found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
