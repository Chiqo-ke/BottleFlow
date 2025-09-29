"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuditLogs } from '@/lib/hooks/useApi';
import type { AuditLog } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export function AuditClient() {
  const [isClient, setIsClient] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { data: auditLogs, loading, error, refetch } = useAuditLogs();

  useEffect(() => {
    setIsClient(true);
    setUserRole(localStorage.getItem('userRole'));
  }, []);

  if (!isClient || loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  
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
  
  // Show error state
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Audit Logs</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => refetch()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
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
            {auditLogs && auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{format(new Date(log.date), "PPP p")}</TableCell>
                  <TableCell className="capitalize">{log.user}</TableCell>
                  <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.details}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                  No audit logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
