# Task 1: Update types.ts and mock-data.ts for resident registration management

## Summary

Successfully updated both files with all required changes.

### types.ts Changes
1. Added `RegistrationStatus` type: `'pending' | 'accepted' | 'declined'`
2. Added to `User` interface:
   - `middleInitial?: string`
   - `sex?: 'Male' | 'Female'`
   - `idDocumentUrl?: string`
   - `registrationStatus?: RegistrationStatus`
3. Removed `admin-vehicle-tracking` and `admin-shifting` from `PageKey` type

### mock-data.ts Changes
1. Added `RegistrationStatus` to imports
2. Updated existing 4 residents (RES001-RES004) with:
   - `middleInitial` (R, A, T, G respectively)
   - `sex` (Female, Male, Female, Male respectively)
   - `registrationStatus: 'accepted'`
3. Added 3 new pending residents (RES005-RES007):
   - RES005: Carla Reyes (Female, pending)
   - RES006: Mark Aquino (Male, pending)
   - RES007: Grace Flores (Female, pending)
4. Added 2 new declined residents (RES008-RES009):
   - RES008: Ricky Diaz (Male, declined)
   - RES009: Lorna Vera (Female, declined)

### Lint Check
Passed with no errors.
