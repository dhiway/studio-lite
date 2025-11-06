import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Layout from "@/layouts/layout"
import { Download, Share2 } from "lucide-react"

export default function IssuedCredentialsTable() {
  const data = [
    { date: "24/07/2025", name: "Raj Kumar", schema: "ID Card" },
    { date: "20/07/2025", name: "Anjali Verma", schema: "Food Authentication Certificate" },
    { date: "16/07/2025", name: "Vikram Singh", schema: "Organic Certification" },
    { date: "10/07/2025", name: "Ravi Kapoor", schema: "Fair Trade Certification" },
    { date: "08/07/2025", name: "Karan Joshi", schema: "Non-GMO Project Verified" },
    { date: "29/06/2025", name: "Priya Sharma", schema: "Gluten-Free Certification" },
    { date: "26/06/2025", name: "Arjun Mehta", schema: "Vegan Certification" },
  ]

  return (
    <Layout>
    <div className="mx-auto w-[85%] bg-transparent">
      <h2 className="text-white text-2xl font-semibold mb-6">All Issued Credentials</h2>

      <div className="overflow-hidden rounded-2xl border border-[#393939] bg-[#1c1c1c]">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#393939] text-center">
              <TableHead className="text-gray-300 font-medium" >Issued on</TableHead>
              <TableHead className="text-gray-300 font-medium">Actions</TableHead>
              <TableHead className="text-gray-300 font-medium">Status</TableHead>
              <TableHead className="text-gray-300 font-medium">Title</TableHead>
              <TableHead className="text-gray-300 font-medium">Schema</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((item, i) => (
              <TableRow
                key={i}
                className="border-b border-[#2b2b2b] hover:bg-[#252525] transition-colors "
              >
                <TableCell className="text-gray-300">{item.date}</TableCell>

                <TableCell>
                  <div className="flex items-center gap-3 pl-8">
                    <Download size={16} className="text-gray-400 cursor-pointer hover:text-white" />
                    <Share2 size={16} className="text-gray-400 cursor-pointer hover:text-white" />
                  </div>
                </TableCell>

                <TableCell className="text-green-500 font-medium">Issue - Active</TableCell>
                <TableCell className="text-gray-200">{item.name}</TableCell>
                <TableCell className="text-gray-200">{item.schema}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      </div>
      </Layout> 
  )
}
