import * as admin from 'firebase-admin'

const serviceAccountKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require('../' + serviceAccountKeyPath)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

export default admin.firestore()
