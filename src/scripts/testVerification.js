import { db } from '../lib/firebase';
import { doc, setDoc, getDoc, deleteDoc, collection, serverTimestamp } from 'firebase/firestore';

const TEST_USER_ID = 'gaurabolee123@gmail.com';
const TEST_PLATFORM = 'twitter';

async function testVerification() {
  try {
    console.log('Starting verification test...');

    // 1. Create a verification request
    const requestId = `${TEST_USER_ID}_${TEST_PLATFORM}`;
    const requestRef = doc(db, 'verificationRequests', requestId);
    
    await setDoc(requestRef, {
      userId: TEST_USER_ID,
      username: 'Arena',
      platform: TEST_PLATFORM,
      profileUrl: 'https://twitter.com/arena',
      verificationCode: '##',
      requestedAt: serverTimestamp(),
      status: 'pending'
    });
    
    console.log('✅ Created verification request');

    // 2. Get user reference
    const userRef = doc(db, 'users', TEST_USER_ID);
    
    // 3. Update user's verification status
    await setDoc(userRef, {
      [`verificationStatus.${TEST_PLATFORM}`]: {
        status: 'verified',
        timestamp: serverTimestamp()
      },
      [`socialLinks.${TEST_PLATFORM}`]: 'https://twitter.com/arena'
    }, { merge: true });
    
    console.log('✅ Updated user verification status');

    // 4. Create notification
    const notificationRef = doc(collection(db, 'notifications', TEST_USER_ID, 'userNotifications'));
    await setDoc(notificationRef, {
      type: 'verification_approved',
      message: `Your ${TEST_PLATFORM} account has been verified!`,
      timestamp: serverTimestamp(),
      read: false,
      platform: TEST_PLATFORM
    });
    
    console.log('✅ Created notification');

    // 5. Delete the request
    await deleteDoc(requestRef);
    console.log('✅ Deleted verification request');

    // 6. Verify the changes
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    
    console.log('\nFinal verification status:', userData?.verificationStatus);
    console.log('Final social links:', userData?.socialLinks);
    
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testVerification(); 