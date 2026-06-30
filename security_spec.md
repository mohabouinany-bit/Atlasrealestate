# Security Specification: Atlas Real Estate (Passione Immobiliare)

This document establishes the Attribute-Based Access Control (ABAC) and Zero-Trust Firestore Security model for the application.

## 1. Data Invariants
1. **Properties collection (`/properties/{propertyId}`)**:
   - Anyone can read properties (`get` and `list`).
   - Only verified, trusted administrators can write, update, or delete properties.
   - Property documents must match a strict schema validation (types, limits, required keys).
   - Timestamp properties (`createdAt`) must be protected and equal `request.time` during creation, remaining immutable thereafter.

2. **Messages collection (`/messages/{messageId}`)**:
   - Anyone can write (`create`) an inquiry message anonymously or authenticated.
   - Inquiry messages must strictly match the validation schema.
   - To protect client privacy, messages can ONLY be read (`get`/`list`), updated (`update`), or deleted (`delete`) by verified, trusted administrators. No public reads of customer inquiries are allowed.

---

## 2. The "Dirty Dozen" Payloads (Malicious Attacks)

### Attack 1: Shadow Update with Ghost Field on Properties
*Payload:*
```json
{
  "id": "prop-123",
  "title": "Stately Manor",
  "price": 500000,
  "location": "Acqui Terme",
  "type": "Villa",
  "status": "Vendita",
  "bedrooms": 3,
  "bathrooms": 2,
  "areaSqM": 150,
  "coverImage": "https://example.com/cover.jpg",
  "featured": true,
  "createdAt": 1782839893000,
  "isVerifiedByAdmin": true
}
```
*Expected Result:* `PERMISSION_DENIED` (Strict schema block on unrecognized key `isVerifiedByAdmin`).

### Attack 2: Identity Spoofing / Self-Elevated Claims
*Payload:*
```json
{
  "id": "prop-123",
  "title": "Stately Manor",
  "price": 500000,
  "location": "Acqui Terme",
  "type": "Villa",
  "status": "Vendita",
  "bedrooms": 3,
  "bathrooms": 2,
  "areaSqM": 150,
  "coverImage": "https://example.com/cover.jpg",
  "featured": true,
  "createdAt": 1782839893000,
  "ownerId": "attacker_uid"
}
```
*Expected Result:* `PERMISSION_DENIED` (Unauthenticated or non-admin attempting write).

### Attack 3: Resource Poisoning / Massive Input Injection
*Payload:*
```json
{
  "id": "prop-123",
  "title": "A".repeat(5000),
  "price": 500000,
  "location": "Acqui Terme",
  "type": "Villa",
  "status": "Vendita",
  "bedrooms": 3,
  "bathrooms": 2,
  "areaSqM": 150,
  "coverImage": "https://example.com/cover.jpg",
  "featured": true,
  "createdAt": 1782839893000
}
```
*Expected Result:* `PERMISSION_DENIED` (Title size limit exceeded).

### Attack 4: Temporal Spoofing on Creation
*Payload:*
```json
{
  "id": "prop-123",
  "title": "Stately Manor",
  "price": 500000,
  "location": "Acqui Terme",
  "type": "Villa",
  "status": "Vendita",
  "bedrooms": 3,
  "bathrooms": 2,
  "areaSqM": 150,
  "coverImage": "https://example.com/cover.jpg",
  "featured": true,
  "createdAt": 1234567890
}
```
*Expected Result:* `PERMISSION_DENIED` (Requires `createdAt == request.time`).

### Attack 5: Numeric Range Poisoning (Negative values)
*Payload:*
```json
{
  "id": "prop-123",
  "title": "Stately Manor",
  "price": -100,
  "location": "Acqui Terme",
  "type": "Villa",
  "status": "Vendita",
  "bedrooms": -5,
  "bathrooms": -1,
  "areaSqM": -50,
  "coverImage": "https://example.com/cover.jpg",
  "featured": true,
  "createdAt": 1782839893000
}
```
*Expected Result:* `PERMISSION_DENIED` (Price, rooms, and area must be positive values).

### Attack 6: Invalid Enumeration Value (Type Hijacking)
*Payload:*
```json
{
  "id": "prop-123",
  "title": "Stately Manor",
  "price": 500000,
  "location": "Acqui Terme",
  "type": "Spaceship",
  "status": "Vendita",
  "bedrooms": 3,
  "bathrooms": 2,
  "areaSqM": 150,
  "coverImage": "https://example.com/cover.jpg",
  "featured": true,
  "createdAt": 1782839893000
}
```
*Expected Result:* `PERMISSION_DENIED` (Property `type` must match allowlisted set).

### Attack 7: Unauthenticated Read of Customer Inquiries (PII Scraping)
*Operation:* `get` or `list` on `/messages` as unauthenticated guest or non-admin.
*Expected Result:* `PERMISSION_DENIED` (PII protection; messages are strictly readable by administrators).

### Attack 8: Anonymous Message Spammer / Giant Message Size
*Payload:*
```json
{
  "id": "msg-123",
  "name": "Spammer",
  "email": "spam@spam.com",
  "phone": "+39 12345678",
  "message": "X".repeat(100000),
  "propertyId": "prop-123",
  "propertyTitle": "Premium Villa",
  "createdAt": 1782839893000,
  "status": "Nuovo"
}
```
*Expected Result:* `PERMISSION_DENIED` (Message content size exceeds limits).

### Attack 9: Malicious Status Injection on Message Submission
*Payload:*
```json
{
  "id": "msg-123",
  "name": "Spammer",
  "email": "spam@spam.com",
  "phone": "+39 12345678",
  "message": "Hello",
  "propertyId": "prop-123",
  "propertyTitle": "Premium Villa",
  "createdAt": 1782839893000,
  "status": "Contattato"
}
```
*Expected Result:* `PERMISSION_DENIED` (A client-submitted message must start in `"Nuovo"` status, not `"Contattato"`).

### Attack 10: ID Poisoning (Junk characters/Too long)
*Operation:* `setDoc` at `/properties/prop-123!!?some_junk_long_string_with_excessive_bytes`
*Expected Result:* `PERMISSION_DENIED` (Failed regex check and length bounds on ID).

### Attack 11: Invariant Bypass via Untrusted Client Timestamp
*Operation:* Update property changing `createdAt` to a legacy time to manipulate sorting order.
*Expected Result:* `PERMISSION_DENIED` (`createdAt` is immutable).

### Attack 12: Anonymous Update/Delete of Published Listings
*Operation:* `deleteDoc` or `updateDoc` on `/properties/prop-casale-monferrato` by anonymous guest.
*Expected Result:* `PERMISSION_DENIED` (Admin credentials required for write).

---

## 3. Test Verification Rules
All the above payloads must consistently return `PERMISSION_DENIED` when evaluated by the Firestore Security Rules.
