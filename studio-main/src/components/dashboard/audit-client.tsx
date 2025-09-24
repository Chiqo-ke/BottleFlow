"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockAuditLogs } from '@/lib/data';
import type { AuditLog } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export function AuditClient() {
  const [isClient, setIsClient] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    setUserRole(localStorage.getItem('userRole'));
  }, []);

  if (!isClient) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  
  if (userRole !== 'admin') {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You do not have permission to view this page. This feature is for Admins only.</p>
        </CardContent>
      </Card>
    );
  }
  
  const getActionBadgeVariant = (action: string) => {
    if (action.includes('CREATE') || action.includes('ADD')) return 'default';
    if (action.includes('UPDATE')) return 'secondary';
    if (action.includes('DELETE')) return 'destructive';
    return 'outline';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Audit Trail</CardTitle>
        <CardDescription>A log of all significant activities recorded in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAuditLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{format(new Date(log.date), "PPP p")}</TableCell>
                <TableCell className="capitalize">{log.user}</TableCell>
                <TableCell>
                    <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
                </TableCell>
                <TableCell>{log.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
