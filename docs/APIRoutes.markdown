# API Routes: Wedding Asset Tracker (Updated)

## Overview
Next.js API Routes (or Server Actions) handle CRUD for assets and donors, with authentication via NextAuth.js. Routes validate type-specific fields (e.g., `grams` for Bilezik).

## Routes

### Assets
- **GET /api/assets**
  - **Description**: Fetch user’s assets.
  - **Response**: JSON array of Asset objects.
  - **Auth**: Required.
- **POST /api/assets**
  - **Description**: Create an asset.
  - **Body**: `{ type: string, amount?: number, grams?: number, carat?: number, initialValue: number, dateReceived: string (ISO), donorId: string }`
  - **Validation**: `grams` and `carat` required for Bilezik/Gram Gold; `amount` for money types.
  - **Response**: Created Asset object.
  - **Auth**: Required.
- **PUT /api/assets/:id**
  - **Description**: Update an asset.
  - **Body**: `{ type?: string, amount?: number, grams?: number, carat?: number, currentValue?: number, dateReceived?: string, donorId?: string }`
  - **Response**: Updated Asset object.
  - **Auth**: Required.
- **DELETE /api/assets/:id**
  - **Description**: Delete an asset.
  - **Response**: `{ success: boolean }`
  - **Auth**: Required.

### Donors
- **GET /api/donors**
  - **Description**: Fetch user’s donors.
  - **Response**: JSON array of Donor objects.
  - **Auth**: Required.
- **POST /api/donors**
  - **Description**: Create a donor.
  - **Body**: `{ name: string, isGroomSide: boolean, isBrideSide: boolean }`
  - **Response**: Created Donor object.
  - **Auth**: Required.
- **GET /api/donors/:id**
  - **Description**: Fetch donor details and assets.
  - **Response**: Donor object with linked Asset array.
  - **Auth**: Required.

## Notes
- Use Server Actions if preferred for Server Components.
- Validate inputs (e.g., `carat` in [14, 18, 22, 24]).
- Return Turkish error messages (e.g., "Geçersiz altın türü").
- Protect routes with NextAuth.js.