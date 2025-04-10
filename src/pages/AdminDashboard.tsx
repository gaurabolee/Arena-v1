import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { collection, query, onSnapshot, doc, updateDoc, where, getDoc, serverTimestamp, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VerificationRequest {
  id: string;
  userId: string;
  username: string;
  platform: string;
  profileUrl: string;
  verificationCode: string;
  requestedAt: any;
  status: 'pending' | 'approved' | 'rejected';
}

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    // Check if user is admin
    if (!currentUser?.isAdmin) {
      navigate('/');
      return;
    }

    // Listen to verification requests
    const q = query(collection(db, 'verificationRequests'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newRequests: VerificationRequest[] = [];
      snapshot.forEach((doc) => {
        newRequests.push({ id: doc.id, ...doc.data() } as VerificationRequest);
      });
      setRequests(newRequests.sort((a, b) => b.requestedAt?.toMillis() - a.requestedAt?.toMillis()));
    });

    return () => unsubscribe();
  }, [currentUser, navigate]);

  const handleUpdateStatus = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const requestRef = doc(db, 'verificationRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      const requestData = requestDoc.data();

      if (!requestData) {
        toast.error('Request not found');
        return;
      }

      // Get user reference and data
      const userRef = doc(db, 'users', requestData.userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data() || {};

      if (newStatus === 'approved') {
        // Update user's verification status and social links
        await updateDoc(userRef, {
          [`verificationStatus.${requestData.platform}`]: {
            status: 'verified',
            timestamp: serverTimestamp()
          },
          [`socialLinks.${requestData.platform}`]: requestData.profileUrl
        });

        // Delete the request after successful approval
        await deleteDoc(requestRef);

        // Add notification
        const notificationRef = doc(collection(db, 'notifications', requestData.userId, 'userNotifications'));
        await setDoc(notificationRef, {
          type: 'verification_approved',
          message: `Your ${requestData.platform} account has been verified!`,
          timestamp: serverTimestamp(),
          read: false,
          platform: requestData.platform
        });

        toast.success(`Verification request approved for ${requestData.username}'s ${requestData.platform} account`);
      } else {
        // For rejection, update the request status
        await updateDoc(requestRef, {
          status: newStatus,
          updatedAt: serverTimestamp()
        });

        // Add rejection notification
        const notificationRef = doc(collection(db, 'notifications', requestData.userId, 'userNotifications'));
        await setDoc(notificationRef, {
          type: 'verification_rejected',
          message: `Your ${requestData.platform} verification was rejected`,
          timestamp: serverTimestamp(),
          read: false,
          platform: requestData.platform
        });

        toast.error(`Verification request rejected for ${requestData.username}'s ${requestData.platform} account`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update verification status');
    }
  };

  // Add test function
  const testVerification = async () => {
    try {
      console.log('Starting verification test...');
      const TEST_USER_ID = currentUser?.uid;
      const TEST_PLATFORM = 'twitter';

      if (!TEST_USER_ID) {
        console.error('No user ID available');
        return;
      }

      // 1. Create a verification request
      const requestId = `${TEST_USER_ID}_${TEST_PLATFORM}`;
      const requestRef = doc(db, 'verificationRequests', requestId);
      
      await setDoc(requestRef, {
        userId: TEST_USER_ID,
        username: currentUser.username,
        platform: TEST_PLATFORM,
        profileUrl: 'https://twitter.com/arena',
        verificationCode: '##',
        requestedAt: serverTimestamp(),
        status: 'pending'
      });
      
      console.log('✅ Created verification request');
      toast.success('Test verification request created');

      // Wait for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 2. Approve the request
      await handleUpdateStatus(requestId, 'approved');
      console.log('✅ Test completed successfully!');
    } catch (error) {
      console.error('❌ Test failed:', error);
      toast.error('Test failed');
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Verification Requests</CardTitle>
              <CardDescription>Manage social media verification requests from users</CardDescription>
            </div>
            <Button onClick={testVerification} variant="outline">
              Run Test
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Select
                value={filter}
                onValueChange={(value: any) => setFilter(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Profile URL</TableHead>
                <TableHead>Verification Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.username}</TableCell>
                  <TableCell className="capitalize">{request.platform}</TableCell>
                  <TableCell>
                    <a 
                      href={request.profileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Profile
                    </a>
                  </TableCell>
                  <TableCell>{request.verificationCode}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>
                    {request.requestedAt?.toDate().toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-green-50 text-green-600 hover:bg-green-100"
                          onClick={() => handleUpdateStatus(request.id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-red-50 text-red-600 hover:bg-red-100"
                          onClick={() => handleUpdateStatus(request.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard; 