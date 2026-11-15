# Firebase Security

## Secrets policy

The following must **never** be committed (they are covered by `.gitignore`):

- `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
- Service-account keys (`*-firebase-adminsdk-*.json`, `service-account*.json`)
- `.env` files and API keys
- Keystores, signing certificates and provisioning profiles

Distribute these files through a secure channel (password manager or CI secrets). CI uses GitHub Actions **encrypted secrets** to recreate them at build time. Commit a `.env.example` with placeholder values only.

If a secret is committed by mistake: rotate it immediately, then purge it from history.

## Authentication

- Email/password at launch. Google and Apple sign-in are candidates (Apple is required on iOS if other social logins are offered).
- Email enumeration protection is enabled.
- Password policy: minimum 8 characters.
- Firebase App Check is enabled for Firestore and Storage before release.

## Roles

| Role | Capabilities |
|------|-------------|
| `learner` | Read published content; read and write own profile and progress |
| `contributor` | Learner capabilities plus creating draft vocabulary, recordings and cultural content |
| `admin` | Publish and edit all content; manage roles |

Roles are stored as **custom claims** (`request.auth.token.role`). Only admins can set them, using the Admin SDK. `users/{uid}.role` is a read-only mirror for display purposes.

## Firestore rules (target design)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function signedIn() { return request.auth != null; }
    function isOwner(uid) { return signedIn() && request.auth.uid == uid; }
    function hasRole(r) { return signedIn() && request.auth.token.role == r; }
    function isAdmin() { return hasRole('admin'); }

    match /users/{uid} {
      allow read: if isOwner(uid) || isAdmin();
      allow create: if isOwner(uid) && !('role' in request.resource.data);
      allow update: if isOwner(uid)
        && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'xp']);
      match /{sub=**} { allow read, write: if isOwner(uid); }
    }

    match /courses/{courseId}/{path=**} {
      allow read: if signedIn();
      allow write: if isAdmin();
    }

    match /vocabulary/{id} {
      allow read: if signedIn();
      allow create: if hasRole('contributor') || isAdmin();
      allow update, delete: if isAdmin();
    }

    match /{col}/{id} {
      allow read: if signedIn() && col in ['exercises', 'tifinaghLetters', 'achievements', 'culture'];
      allow write: if isAdmin();
    }
  }
}
```

The final rules live in `firebase/firestore.rules`. They are implemented in the issue "Implement Firestore security rules" and tested with the Emulator Suite in "Test Firestore security".

> Note: XP is written by the client in the MVP. Before a public launch, move XP and achievement awarding to Cloud Functions to prevent tampering.

## Storage rules (target design)

- `audio/**`, `images/**`: read for signed-in users; write for admins (contributors write only to `uploads/{uid}/**`).
- `users/{uid}/**`: read and write only by the owner, with a size limit of 5 MB and image content types only.

## Data protection

- Minimise personal data (name, email, preferences, progress).
- Support account deletion (Auth user, `users/{uid}` and sub-collections).
- Publish a privacy policy before store submission.
