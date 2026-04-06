# Transaction Persistence & txnId Query Parameter Implementation

## Changes Made

### 1. **Persistent Transaction Storage (Vercel-safe)**
- Added `fs` and `path` modules for file I/O
- Defined `TEMP_DIR` that uses `/tmp` on Vercel and OS temp directory locally
- Transactions now stored in temporary JSON files: `/tmp/txn_${txnId}.json`

### 2. **txnId in Return URL**
- `/start-payment` now includes `txnId` as query parameter in response link
- Format: `/return?txnId=<transaction-id>`
- Both checkout.js.txt and api/index.js updated

### 3. **Updated /start-payment Handler**
- Stores transaction object to both:
  - In-memory `txStore` Map (for local dev)
  - Temp file system (for Vercel persistence)
- Error handling: failures to persist to file are logged but don't block request

### 4. **Updated /callback Handler**
- Loads transaction from file if not in memory
- Updates transaction with callback response
- Persists updated transaction back to file
- Enables callback processing across Vercel cold starts

### 5. **Updated /return Handler**
- Now `async` function (both local and Vercel)
- Reads `txnId` from query string parameter
- Returns "No transaction reference received" if `txnId` is missing (HTTP 400)
- Attempts to load from memory first, then from file
- Returns 404 with helpful error if transaction not found
- Displays formatted transaction data:
  - txnId, orderRef, customerRef, merchantId
  - Current status
  - Amount & currency
  - Created timestamp
  - Callback data (if received): status, MAC verification, error/approval codes

### 6. **Improved Error Messages**
- Replaces null values with descriptive messages
- Clear indication when transaction is retrieved from persistent storage
- User-friendly 400/404 responses with guidance

## Files Modified
- **checkout.js.txt** (735 lines) - Source file
- **api/index.js** (593 lines) - Vercel handler
- **checkout.js** (auto-synced from .txt)

## How It Works

### Local Deployment (localhost:3001)
1. User submits payment form
2. `/start-payment` generates txnId, stores to file + memory
3. Form auto-posts to Cardzone with `MPI_RESPONSE_LINK=/return?txnId=XXX`
4. Cardzone posts callback to `/callback`
5. `/callback` loads txn from file (if needed), updates with response, saves back
6. Browser redirects to `/return?txnId=XXX`
7. `/return` loads transaction from file/memory, displays formatted status

### Vercel Deployment
- Same flow as local, but `/tmp` is used for file storage
- Files persist for the duration of a Vercel function's cold start
- For production, recommend replacing `/tmp` with external database (MongoDB, Redis, etc.)

## Testing
```bash
# 1. Start local server
PORT=3001 node checkout.js

# 2. Submit payment form with custom txnId
# 3. Cardzone processes payment
# 4. Browser redirected to /return?txnId=<your-id>
# 5. Should see transaction data (not null values)

# 6. Check temp directory for file
ls /tmp/txn_*.json  # Linux/Mac
dir %TEMP%\txn_*.json  # Windows
```

## Benefits
✅ No more null txnId/tx on /return endpoint
✅ Vercel-safe (no in-memory persistence across cold starts)
✅ Callback handling works across Vercel invocations
✅ Graceful fallback to file system when in-memory store is empty
✅ Clear error messages instead of null values
✅ Existing Cardzone logic untouched
✅ Backward compatible with local development

## Next Steps (Optional)
For production Vercel deployment, consider:
1. Replace `/tmp` with MongoDB/Firebase/Redis
2. Add transaction cleanup (TTL on old records)
3. Add error handling for file system failures
4. Encrypt sensitive data before persisting
