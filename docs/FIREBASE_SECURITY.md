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

| Role          | Capabilities                                                                         |
| ------------- | ------------------------------------------------------------------------------------ |
| `learner`     | Read published content; read and write own profile and progress                      |
| `contributor` | Learner capabilities plus creating draft vocabulary, recordings and cultural content |
| `admin`       | Publish and edit all content; manage roles                                           |

Roles are stored as **custom claims** (`request.auth.token.role`). Only admins can set them, using the Admin SDK. `users/{uid}.role` is a read-only mirror for display purposes.

## Firestore rules

Implemented in `firebase/firestore.rules` and verified against the Emulator Suite (`npm run test:emulator`, 15 tests):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function signedIn() { return request.auth != null; }
    function isOwner(uid) { return signedIn() && request.auth.uid == uid; }
    function hasRole(r) {
      return signedIn() && 'role' in request.auth.token && request.auth.token.role == r;
    }
    function isAdmin() { return hasRole('admin'); }
    function isContributor() { return hasRole('contributor') || isAdmin(); }

    // Users: private profile; role and XP are server-managed (custom claims / future Functions).
    // NOTE: sub-collections are listed explicitly — a recursive wildcard here would also
    // match the parent users/{uid} document and bypass the role/xp protections below.
    match /users/{uid} {
      allow read: if isOwner(uid) || isAdmin();
      allow create: if isOwner(uid) && !('role' in request.resource.data);
      allow update: if isOwner(uid)
        && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'xp']);
      allow delete: if isAdmin();

      match /progress/{docId} {
        allow read, write: if isOwner(uid) || isAdmin();
      }
      match /lessonResults/{docId} {
        allow read, write: if isOwner(uid) || isAdmin();
      }
      match /achievements/{docId} {
        allow read, write: if isOwner(uid) || isAdmin();
      }
      match /vocabulary/{docId} {
        allow read, write: if isOwner(uid) || isAdmin();
      }
    }

    // Published curriculum — readable by any signed-in learner, written by admins
    match /courses/{courseId}/{path=**} {
      allow read: if signedIn();
      allow write: if isAdmin();
    }

    // Vocabulary: contributors create drafts, only admins publish/edit/delete
    match /vocabulary/{id} {
      allow read: if signedIn();
      allow create: if isContributor();
      allow update, delete: if isAdmin();
    }

    // Reference content: exercises, letters, achievements, culture articles
    match /{collection}/{docId} {
      allow read: if signedIn()
        && collection in ['exercises', 'tifinaghLetters', 'achievements', 'culture'];
      allow write: if isAdmin();
    }
  }
}
```

Deployment to the dev Firebase project happens once the projects exist (issue #44); until then the rules run in the emulator via `npm run test:emulator` and `firebase deploy --only firestore:rules --project amazigh-learning-dev`.

> Note: XP is written by the client in the MVP. Before a public launch, move XP and achievement awarding to Cloud Functions to prevent tampering.

## Storage rules (target design)

- `audio/**`, `images/**`: read for signed-in users; write for admins (contributors write only to `uploads/{uid}/**`).
- `users/{uid}/**`: read and write only by the owner, with a size limit of 5 MB and image content types only.

## Data protection

- Minimise personal data (name, email, preferences, progress).
- Support account deletion (Auth user, `users/{uid}` and sub-collections).
- Publish a privacy policy before store submission.
