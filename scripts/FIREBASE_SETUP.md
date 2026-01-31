# Firebase Service Account Configuration

To run the dev users seed script, you need to:

1. **Download your Firebase service account key:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the file as `firebaseServiceAccount.json` in the project root

2. **Run the seed script:**
   ```bash
   node scripts/seed-dev-users.js
   ```

3. **Dev Users Created:**
   - **Faculty:** darshan.khapekar@ves.ac.in / 123456789
   - **Admin:** admin@ves.ac.in / 123456789
   - **HOD:** nupur.giri@ves.ac.in / 123456789
   - **Department:** Computer (for all)

## Alternative: Manual Creation via Firebase Console

1. Go to Firebase Console → Authentication → Users
2. Add users manually with the emails and passwords above
3. Then update their profiles in Firestore:
   ```
   users/{uid}:
   {
     email: "user@ves.ac.in",
     name: "User Name",
     role: "faculty|hod|misAdmin",
     department: "Computer",
     designation: "Assistant Professor",
     is_active: true
   }
   ```

## Security Note

The `firebaseServiceAccount.json` file is already in `.gitignore` to prevent accidental commits.
Never commit service account credentials to version control!
