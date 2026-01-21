import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Layout from "@/layouts/layout";
import { Download, Share2 } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { useOrgSettings } from "@/context/OrgSettingsContext";

export default function IssuedCredentialsTable() {
  const router = useRouter();
  const { registries } = useOrgSettings();

  // Sort by createdAt descending (newest first)
  const sortedRegistries = [...(registries || [])].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <Layout>
      <div className="mx-auto w-[85%] bg-transparent">
        <h2 className="text-white text-2xl font-semibold mb-6">
          All Issued Credentials
        </h2>

        <div className="overflow-hidden rounded-2xl border border-[#393939] bg-[#1c1c1c]">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#393939] text-center">
                <TableHead className="text-gray-300 font-medium">
                  Issued on
                </TableHead>
                <TableHead className="text-gray-300 font-medium">
                  Actions
                </TableHead>
                <TableHead className="text-gray-300 font-medium">
                  Status
                </TableHead>
                <TableHead className="text-gray-300 font-medium">
                  Title
                </TableHead>
                <TableHead className="text-gray-300 font-medium">
                  Schema
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedRegistries.map((item, i) => {
                let schemaTitle = "Unknown Schema";
                try {
                  const schemaObj = typeof item.schema === 'string'
                    ? JSON.parse(item.schema)
                    : item.schema;
                  if (schemaObj && schemaObj.title) {
                    schemaTitle = schemaObj.title;
                  }
                } catch (e) { console.error(e); }

                return (
                  <TableRow
                    key={item.id || i}
                    className="border-b border-[#2b2b2b] hover:bg-[#252525] transition-colors "
                    onClick={() => {
                      router.navigate({
                        to: "/recordShow/$recordId",
                        params: { recordId: item.id },
                      });
                    }}
                  >
                    <TableCell className="text-gray-300">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3 pl-8">
                        <Download
                          size={16}
                          className="text-gray-400 cursor-pointer hover:text-white"
                        />
                        <Share2
                          size={16}
                          className="text-gray-400 cursor-pointer hover:text-white"
                        />
                      </div>
                    </TableCell>

                    <TableCell className="text-green-500 font-medium">
                      Issue - Active
                    </TableCell>
                    <TableCell className="text-gray-200">{schemaTitle}</TableCell>
                    <TableCell className="text-gray-200">{schemaTitle}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
