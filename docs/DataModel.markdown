# Data Model: Wedding Asset Tracker (Updated)

## Overview
The app uses PostgreSQL with Prisma to store user, asset, and donor data. Models are updated to reflect asset types and donor side fields.

## Models

### User
- **id**: String (UUID, primary key)
- **email**: String (unique, required)
- **name**: String (optional)
- **createdAt**: DateTime (default: now)

### Asset
Represents a gold or money asset.
- **id**: String (UUID, primary key)
- **userId**: String (foreign key to User, required)
- **type**: Enum (Çeyrek Altın, Tam Altın, Reşat, Beşi Bir Yerde, Bilezik, Gram Gold, Turkish Lira, Dollar, Euro, required)
- **amount**: Float (for money types, e.g., 500 for 500 TL, optional)
- **grams**: Float (for Bilezik, Gram Gold, e.g., 10.5, optional)
- **carat**: Int (for Bilezik, Gram Gold, e.g., 14, 18, 22, 24, optional)
- **initialValue**: Float (value at receipt, required)
- **currentValue**: Float (current value, optional)
- **dateReceived**: DateTime (required)
- **donorId**: String (foreign key to Donor, required)
- **createdAt**: DateTime (default: now)
- **updatedAt**: DateTime (default: now)

### Donor
Represents a gift giver.
- **id**: String (UUID, primary key)
- **userId**: String (foreign key to User, required)
- **name**: String (e.g., "Ahmet Yılmaz", required)
- **isGroomSide**: Boolean (default: false)
- **isBrideSide**: Boolean (default: false)
- **createdAt**: DateTime (default: now)

## Relationships
- **User → Asset**: One-to-Many
- **User → Donor**: One-to-Many
- **Donor → Asset**: One-to-Many
- **Asset → Donor**: Many-to-One

## Notes
- Use Prisma to define the schema (`schema.prisma`).
- `type` is an enum in Prisma for asset types.
- Validate `grams` and `carat` only for Bilezik and Gram Gold.
- Indexes on `userId` and `donorId` for performance.