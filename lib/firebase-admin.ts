import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

// Validate required environment variables
const requiredEnvVars = [
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please ensure these variables are set in your .env.local file');
  console.error('Example .env.local format:');
  console.error('FIREBASE_ADMIN_PROJECT_ID=your-project-id');
  console.error('FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project-id.iam.gserviceaccount.com');
  console.error('FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"');
  
  // In development, provide a more helpful error
  if (process.env.NODE_ENV === 'development') {
    throw new Error(`Firebase Admin SDK initialization failed: Missing environment variables: ${missingEnvVars.join(', ')}`);
  }
}

let app;
let auth: Auth;

try {
  const firebaseAdminConfig = {
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      // Handle the private key format correctly
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  };

  app = !getApps().length ? initializeApp(firebaseAdminConfig) : getApps()[0];
  auth = getAuth(app);
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  throw error;
}

export { app, auth };