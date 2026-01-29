import { Download, Share2 } from "lucide-react";
import Layout from "@/layouts/layout";
import dayjs from "dayjs";
import { useParams, Link } from "@tanstack/react-router";
import { useOrgSettings } from "@/context/OrgSettingsContext";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export default function RecordDetails() {
  const { recordId } = useParams({ from: '/recordShow/$recordId' });
  const { registries } = useOrgSettings();

  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recordId && registries) {
      const registry = registries.find((r: any) => r.id === recordId);
      if (registry) {
        let parsedSchema = registry.schema;
        if (typeof registry.schema === 'string') {
          try {
            parsedSchema = JSON.parse(registry.schema);
          } catch (e) {
            console.error("Failed to parse schema", e);
          }
        }
      }
    }
  }, [recordId, registries]);

  // Fetch Credentials List
  useEffect(() => {
    if (recordId) {
      setLoading(true);
      fetch(`${import.meta.env.VITE_API_ENDPOINT}/api/v1/cred/list/${recordId}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Failed to fetch credentials");
        })
        .then((data) => {
          console.log("Fetched credentials:", data);
          const list = Array.isArray(data) ? data : data.credentials || [];
          // Sort by createdAt desc
          const sorted = list.sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setCredentials(sorted);
        })
        .catch((err) => {
          console.error("Error fetching credentials:", err);
          toast.error("Failed to load issued credentials");
        })
        .finally(() => setLoading(false));
    }
  }, [recordId]);

  return (
    <Layout>
      <div className="text-white flex flex-col items-center mt-12 w-full">
        <div className="w-full max-w-[1324px]">
          <div className="flex items-center justify-between mb-8 w-full">
            <div className="flex items-center gap-4">
              {/* <ArrowLeft className="w-6 h-6 cursor-pointer text-gray-400 hover:text-white" onClick={() => window.history.back()} /> */}
              <h1 className="text-3xl font-normal ml-5">Issued Credentials</h1>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-[#393939] bg-[#1c1c1c] mx-5">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#393939] text-center hover:bg-transparent">
                  <TableHead className="text-gray-300 font-medium pl-8">Issued on</TableHead>
                  {/* <TableHead className="text-gray-300 font-medium">Actions</TableHead> */}
                  <TableHead className="text-gray-300 font-medium">Status</TableHead>
                  <TableHead className="text-gray-300 font-medium">Credential ID</TableHead>
                  <TableHead className="text-gray-300 font-medium">Registry ID</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-10">Loading...</TableCell>
                  </TableRow>
                ) : credentials.length > 0 ? (
                  credentials.map((cred, i) => (
                    <TableRow
                      key={cred.id || i}
                      className="border-b border-[#2b2b2b] hover:bg-[#252525] transition-colors cursor-pointer"
                    >
                      <TableCell className="text-gray-300 pl-8">
                        <Link
                          to="/credential/$credentialId"
                          params={{ credentialId: cred.credId || cred.recordId }}
                          className="block w-full h-full py-4 text-left"
                        >
                          {cred.createdAt ? dayjs(cred.createdAt).format('DD/MM/YYYY') : '-'}
                        </Link>
                      </TableCell>

                      <TableCell className="text-green-500 font-medium text-center">
                        <Link
                          to="/credential/$credentialId"
                          params={{ credentialId: cred.credId || cred.recordId }}
                          className="block w-full h-full py-4"
                        >
                          {cred.status || "Active"}
                        </Link>
                      </TableCell>
                      <TableCell className="text-gray-200 text-center">
                        <Link
                          to="/credential/$credentialId"
                          params={{ credentialId: cred.credId || cred.recordId }}
                          className="block w-full h-full py-4"
                        >
                          {cred.credId || cred.id || '-'}
                        </Link>
                      </TableCell>
                      <TableCell className="text-gray-200 text-center">
                        <Link
                          to="/credential/$credentialId"
                          params={{ credentialId: cred.credId || cred.recordId }}
                          className="block w-full h-full py-4"
                        >
                          {cred.registryId || '-'}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-10">
                      No issued credentials found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
