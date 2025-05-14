"use client"

import { format } from "date-fns"
import { AlertCircle, AlertTriangle, Info } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { SidebarInset } from "~/components/ui/sidebar"
import { BreadcrumbPage } from "~/components/ui/breadcrumb"
import { BreadcrumbItem } from "~/components/ui/breadcrumb"
import { Breadcrumb } from "~/components/ui/breadcrumb"
import { BreadcrumbList } from "~/components/ui/breadcrumb"
import { Separator } from "~/components/ui/separator"
import { SidebarTrigger } from "~/components/ui/sidebar"

export interface Log {
  id: string
  timestamp: string
  level: "error" | "warning" | "info"
  source: string
  message: string
}

interface LogsClientProps {
  logs: Log[]
}

const levelIcons: Record<Log['level'], JSX.Element> = {
  error: <AlertCircle className="h-4 w-4 text-destructive" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  info: <Info className="h-4 w-4 text-blue-500" />,
}

const levelColors: Record<Log['level'], string> = {
  error: "text-destructive",
  warning: "text-yellow-500",
  info: "text-blue-500",
}

export function LogsClient({ logs }: LogsClientProps) {
  return (
    <SidebarInset>
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Logs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header> 
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Logs</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Log Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Level</TableHead>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead className="w-[120px]">Source</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{levelIcons[log.level]}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {format(new Date(log.timestamp), "HH:mm:ss")}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.source}
                    </TableCell>
                    <TableCell>{log.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Console View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[600px] rounded-md bg-zinc-950 p-4 font-mono text-sm text-white overflow-auto">
              {logs.map((log) => (
                <div key={log.id} className="mb-2">
                  <span className="text-gray-500">
                    {format(new Date(log.timestamp), "HH:mm:ss")}
                  </span>{" "}
                  <span className={levelColors[log.level]}>
                    [{log.level.toUpperCase()}]
                  </span>{" "}
                  <span className="text-gray-400">{log.source}:</span>{" "}
                  {log.message}
                </div>
              ))}
            </div>
          </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  )
}
