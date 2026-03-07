# Publish Instructions for v0.8.22

## Quick Publish (Recommended)

```powershell
.\publish-0.8.22.ps1 -OTP <code-from-authenticator-app>
```

This script will:
1. ✅ Publish squad-sdk@0.8.22 to npm
2. ✅ Publish squad-cli@0.8.22 to npm
3. ✅ Verify both packages are live
4. ✅ Bump all package.json to 0.8.23-preview.1
5. ✅ Commit and push to dev

## Manual Publish (If you prefer)

```powershell
# Get OTP from your authenticator app, then:

# 1. Publish SDK
cd packages\squad-sdk
npm publish --access public --otp=<CODE>
cd ..\..

# 2. Publish CLI
cd packages\squad-cli
npm publish --access public --otp=<CODE>
cd ..\..

# 3. Verify both live
npm view @bradygaster/squad-sdk version  # should show 0.8.22
npm view @bradygaster/squad-cli version  # should show 0.8.22

# 4. Bump to next preview version
# (Run publish-0.8.22.ps1 -OTP dummy -SkipBump to skip the actual publish
#  but do the version bump, OR manually edit 3 package.json files)
```

## What's Ready

- ✅ Version 0.8.22 in all package.json files
- ✅ Build verified clean (3,768 tests pass)
- ✅ Git tag v0.8.22 created and pushed
- ✅ GitHub Release created
- ⏸️  Waiting on: 2FA code for npm publish

## After Publish

Both packages will be live at:
- https://www.npmjs.com/package/@bradygaster/squad-sdk/v/0.8.22
- https://www.npmjs.com/package/@bradygaster/squad-cli/v/0.8.22

Repository will be bumped to v0.8.23-preview.1 for continued development.

---
*Prepared by: Rabin (Distribution)*
