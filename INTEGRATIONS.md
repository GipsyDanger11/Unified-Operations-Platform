# Integration System Documentation

## Overview

The Unified Operations Platform includes **5 comprehensive integrations** with graceful failure handling to ensure core business flows never break:

1. ✅ **Email** (SendGrid)
2. ✅ **SMS** (Twilio)
3. ✅ **Calendar** (Google Calendar)
4. ✅ **File Storage** (AWS S3 / Compatible)
5. ✅ **Webhooks** (Custom HTTP endpoints)

---

## Design Principles

### 1. Abstraction
All integrations are abstracted into service layers:
- `emailService.js` - Email operations
- `smsService.js` - SMS operations
- `calendarService.js` - Calendar operations
- `storageService.js` - File storage operations
- `webhookService.js` - Webhook delivery

### 2. Graceful Failure
Every integration returns a result object with `gracefulFail: true` on errors:

```javascript
{
  success: false,
  error: "Error message",
  gracefulFail: true  // Indicates non-critical failure
}
```

This ensures:
- Core flows continue even if integrations fail
- Errors are logged but don't crash the system
- Users see helpful error messages

### 3. Configuration Validation
All integrations:
- Check if configured before use
- Test connections during setup
- Store test results in the database
- Can be enabled/disabled independently

---

## Integration Details

### 1. Email Integration (SendGrid)

**Service**: `backend/services/emailService.js`

**Features**:
- Send transactional emails
- HTML and plain text support
- Workspace-specific configuration
- Connection testing

**Configuration**:
```javascript
{
  apiKey: "SG.xxx",
  fromEmail: "noreply@yourbusiness.com",
  fromName: "Your Business"
}
```

**Usage**:
```javascript
await sendEmail(workspaceId, to, subject, htmlContent, textContent);
```

---

### 2. SMS Integration (Twilio)

**Service**: `backend/services/smsService.js`

**Features**:
- Send SMS messages
- Workspace-specific configuration
- Connection testing
- Delivery status tracking

**Configuration**:
```javascript
{
  accountSid: "ACxxx",
  authToken: "xxx",
  fromNumber: "+1234567890"
}
```

**Usage**:
```javascript
await sendSMS(workspaceId, toNumber, message);
```

---

### 3. Calendar Integration (Google Calendar)

**Service**: `backend/services/calendarService.js`

**Features**:
- Create calendar events
- Update events
- Delete events
- Automatic attendee invitations
- Reminder configuration

**Configuration**:
```javascript
{
  accessToken: "ya29.xxx",
  refreshToken: "1//xxx",
  calendarId: "primary"
}
```

**Usage**:
```javascript
await createCalendarEvent(workspaceId, {
  title: "Client Meeting",
  description: "Consultation",
  startTime: "2024-02-15T10:00:00Z",
  endTime: "2024-02-15T11:00:00Z",
  attendees: ["client@example.com"],
  timezone: "America/New_York"
});
```

**Graceful Failure Example**:
If calendar is not configured, bookings still work - just no calendar event is created.

---

### 4. File Storage Integration (AWS S3)

**Service**: `backend/services/storageService.js`

**Features**:
- Upload files
- Generate signed URLs
- Delete files
- S3-compatible (works with DigitalOcean Spaces, Cloudflare R2, etc.)

**Configuration**:
```javascript
{
  accessKeyId: "AKIAxxx",
  secretAccessKey: "xxx",
  bucketName: "my-bucket",
  region: "us-east-1",
  endpoint: "https://s3.amazonaws.com" // Optional for S3-compatible
}
```

**Usage**:
```javascript
// Upload
const result = await uploadFile(workspaceId, file, 'forms');

// Get signed URL
const { url } = await getFileUrl(workspaceId, fileKey, 3600);

// Delete
await deleteFile(workspaceId, fileKey);
```

**Graceful Failure Example**:
If storage is not configured, form submissions still work - files just aren't uploaded.

---

### 5. Webhook System

**Service**: `backend/services/webhookService.js`

**Features**:
- HTTP POST to custom endpoints
- HMAC signature verification
- Automatic retry with exponential backoff
- Delivery logging
- Event filtering

**Supported Events**:
- `booking.created`
- `booking.updated`
- `booking.cancelled`
- `contact.created`
- `form.submitted`
- `inventory.low`
- `message.received`

**Configuration**:
```javascript
{
  name: "Slack Notifications",
  url: "https://hooks.slack.com/services/xxx",
  events: ["booking.created", "form.submitted"],
  retryAttempts: 3,
  retryDelay: 1000
}
```

**Signature Verification**:
Webhooks include headers for verification:
```
X-Webhook-Signature: <HMAC-SHA256>
X-Webhook-Timestamp: <timestamp>
X-Webhook-Event: <event-name>
```

**Retry Logic**:
- Attempt 1: Immediate
- Attempt 2: 1 second delay
- Attempt 3: 2 second delay
- Attempt 4: 4 second delay (exponential backoff)

**Graceful Failure Example**:
If webhook delivery fails, the booking/form/contact is still created - webhook just logs the failure.

---

## API Endpoints

### Get Integration Status
```
GET /api/integrations
```

Returns configuration status for all integrations.

### Configure Calendar
```
POST /api/integrations/calendar
{
  "accessToken": "ya29.xxx",
  "refreshToken": "1//xxx",
  "calendarId": "primary"
}
```

### Configure Storage
```
POST /api/integrations/storage
{
  "accessKeyId": "AKIAxxx",
  "secretAccessKey": "xxx",
  "bucketName": "my-bucket",
  "region": "us-east-1"
}
```

### Webhook Management
```
GET /api/integrations/webhooks
POST /api/integrations/webhooks
POST /api/integrations/webhooks/:id/test
DELETE /api/integrations/webhooks/:id
```

---

## Graceful Failure Examples

### Scenario 1: Email Service Down
```javascript
// Booking is created successfully
const booking = await Booking.create({ ... });

// Email attempt fails gracefully
const emailResult = await sendEmail(...);
if (!emailResult.success) {
  console.warn('Email failed but booking created:', emailResult.error);
  // Booking still exists, user can manually notify customer
}
```

### Scenario 2: Calendar Not Configured
```javascript
// Create calendar event
const calendarResult = await createCalendarEvent(...);

if (calendarResult.gracefulFail) {
  // Calendar not configured - that's okay
  // Booking still works, just no calendar sync
}
```

### Scenario 3: Webhook Delivery Fails
```javascript
// Trigger webhook
await triggerWebhook(workspaceId, 'booking.created', booking);

// Even if all webhooks fail:
// - Booking is created
// - Automation continues
// - Webhook failures are logged for review
```

---

## Testing Integrations

Each integration includes a test function:

```javascript
// Email
await testEmailConnection(apiKey, fromEmail, fromName, testTo);

// SMS
await testSMSConnection(accountSid, authToken, fromNumber, testTo);

// Calendar
await testCalendarConnection(accessToken, refreshToken);

// Storage
await testStorageConnection(config);

// Webhook
await testWebhook(webhookId);
```

---

## Database Schema

### Integration Model
```javascript
{
  workspace: ObjectId,
  email: { ... },
  sms: { ... },
  calendar: { ... },
  storage: { ... }
}
```

### Webhook Model
```javascript
{
  workspace: ObjectId,
  name: String,
  url: String,
  secret: String,
  events: [String],
  isActive: Boolean,
  totalCalls: Number,
  successfulCalls: Number,
  failedCalls: Number
}
```

### WebhookLog Model
```javascript
{
  webhook: ObjectId,
  event: String,
  payload: Mixed,
  status: String,
  statusCode: Number,
  attempts: Number
}
```

---

## Best Practices

1. **Always check `isConfigured` before using an integration**
2. **Handle `gracefulFail` responses appropriately**
3. **Log integration failures for debugging**
4. **Test integrations during onboarding**
5. **Provide fallback UI when integrations fail**
6. **Monitor webhook delivery success rates**
7. **Rotate webhook secrets regularly**

---

## Summary

✅ **5 Integrations Implemented**:
- Email (SendGrid)
- SMS (Twilio)
- Calendar (Google Calendar)
- File Storage (AWS S3)
- Webhooks (Custom)

✅ **All integrations**:
- Are abstracted into services
- Fail gracefully
- Never break core flows
- Include connection testing
- Support workspace-specific configuration

✅ **Production Ready**:
- Error handling
- Retry logic (webhooks)
- Delivery logging
- Signature verification (webhooks)
- Exponential backoff (webhooks)
