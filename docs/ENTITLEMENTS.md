# Entitlements System (T86)

The entitlements system manages paid interview packages and ensures that users can only create paid sessions if they have an available entitlement.

## How It Works

1. **Entitlement Types**:
   - `interview_package`: One-off paid interview (consumed on use)
   - `subscription`: Recurring subscription (not yet implemented)

2. **Entitlement Status**:
   - `active`: Available for use
   - `consumed`: Used for a session
   - `expired`: Past expiration date (optional)

3. **Flow**:
   - User attempts to create a paid session
   - System checks for available `active` entitlements
   - If found, entitlement is consumed and linked to session
   - If not found, user sees error message

## Database Schema

```sql
CREATE TABLE entitlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('interview_package', 'subscription')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'consumed', 'expired')),
    order_id UUID, -- Links to payment system (not yet implemented)
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMPTZ,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Testing

### Grant Yourself a Test Entitlement

1. Sign in to the app
2. Make a POST request to `/api/admin/grant-entitlement`:

```bash
curl -X POST http://localhost:3000/api/admin/grant-entitlement \
  -H "Cookie: your-session-cookie"
```

Or use the browser console:

```javascript
await fetch('/api/admin/grant-entitlement', { method: 'POST' })
  .then((r) => r.json())
  .then(console.log);
```

3. You should receive a response with `entitlementId`

### Check Your Entitlements

```bash
curl http://localhost:3000/api/entitlements \
  -H "Cookie: your-session-cookie"
```

Or in browser console:

```javascript
await fetch('/api/entitlements')
  .then((r) => r.json())
  .then(console.log);
```

### Test Entitlement Consumption

1. Grant yourself an entitlement (see above)
2. Go to `/setup`
3. Try to create a **paid** session (this will fail without entitlement)
4. Grant entitlement again
5. Create a paid session → entitlement should be consumed
6. Try to create another paid session → should fail (no entitlements left)
7. Check entitlements API → should show consumed entitlement

### Manual Database Queries

```sql
-- Check user's entitlements
SELECT * FROM entitlements WHERE user_id = 'your-user-id';

-- Grant an entitlement manually
INSERT INTO entitlements (user_id, type, status)
VALUES ('your-user-id', 'interview_package', 'active');

-- Reset a consumed entitlement (for testing)
UPDATE entitlements
SET status = 'active', consumed_at = NULL
WHERE id = 'entitlement-id';
```

## Future Enhancements

- [ ] Integration with Stripe/payment provider
- [ ] Webhook to create entitlements on successful payment
- [ ] Subscription support (recurring billing)
- [ ] Admin dashboard for managing entitlements
- [ ] Email notifications when entitlements are granted/consumed
- [ ] Entitlement expiration handling
