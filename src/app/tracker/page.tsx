import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusPicker } from "@/components/status-picker";
import { Badge } from "@/components/ui/badge";

export default async function TrackerPage() {
  const apps = await prisma.jobApplication.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Application Tracker</h1>
        <p className="text-sm text-muted-foreground">
          Keep the demo simple: one user, fast status updates, and links to results.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All applications</CardTitle>
          <Badge variant="secondary">{apps.length} total</Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">
                    <Link className="hover:underline" href={`/applications/${a.id}`}>
                      {a.company}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.role}</TableCell>
                  <TableCell>
                    <StatusPicker id={a.id} value={a.status} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {apps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    No applications yet. Create one from the “New Application” page.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

