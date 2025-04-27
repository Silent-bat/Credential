# Activity Logging System

This document provides an overview of the Activity Logging System implemented in the Credential Verification Application.

## Overview

The Activity Logging System tracks and records all important actions performed within the application, allowing administrators to monitor:

- Certificate creations and verifications
- Blockchain operations
- User authentication events
- Administrative actions
- Suspicious activities

## Features

### Comprehensive Logging

- **Detailed Event Tracking**: Each log contains information about the action, category, timestamp, user, IP address, and more
- **Relationship Support**: Logs are linked to related entities (users, certificates, institutions)
- **Metadata Storage**: Additional structured data can be stored for each log event
- **User Agent Tracking**: Browser and device information is recorded for security analysis

### Administration

- **Admin Dashboard**: View logs with advanced filtering capabilities
- **Activity Statistics**: Visual analytics of system activity
- **Export to CSV**: Download logs for compliance and reporting purposes
- **Retention Management**: Configure automatic log retention periods

### Security Features

- **Suspicious Activity Detection**: System can identify potentially malicious verification attempts
- **Admin Notifications**: Email alerts for important security events
- **IP Tracking**: Monitor source of verification attempts
- **Audit Trail**: Complete history of all system activities

## Admin Interface

The admin interface provides the following capabilities:

1. **Dashboard Summary**: Shows key metrics and recent verification activities
2. **Full Log Viewer**: Displays all logs with filtering options:
   - By action type (CREATE, VERIFY, UPDATE, etc.)
   - By category (CERTIFICATE, AUTH, ADMIN, etc.)
   - By status (SUCCESS, FAILURE, WARNING, INFO)
   - By date range
   - By user, institution, or certificate
   - Full-text search across logs

3. **Log Details**: View complete details of any log entry including metadata
4. **Export**: Download logs as CSV for external analysis
5. **Log Management**: Ability to delete old logs based on retention policy

## Technical Implementation

### Database Schema

The central model is the `ActivityLog` with the following key fields:

```prisma
model ActivityLog {
  id             String       @id @default(cuid())
  action         LogAction    // The action performed (CREATE, VERIFY, etc.)
  category       LogCategory  // The category (CERTIFICATE, AUTH, etc.)
  details        String?      // Human-readable description
  metadata       Json?        // Additional structured data
  ipAddress      String?      // Source IP address
  userAgent      String?      // Browser/client info
  status         LogStatus    // SUCCESS, FAILURE, WARNING, INFO
  userId         String?      // User who performed the action (optional)
  institutionId  String?      // Related institution (optional)
  certificateId  String?      // Related certificate (optional)
  createdAt      DateTime     // When the log was created

  // Relations
  user        User?        @relation(fields: [userId], references: [id])
  institution Institution? @relation(fields: [institutionId], references: [id])
  certificate Certificate? @relation(fields: [certificateId], references: [id])
}
```

### Utility Functions

The system provides several utility functions for logging different types of events:

```typescript
// General purpose logging
logActivity({
  action, category, details, metadata, status, userId, institutionId, certificateId, request
})

// Certificate verification logging
logCertificateVerification({
  certificateId, institutionId, userId, success, details, metadata, request
})

// Blockchain operation logging
logBlockchainOperation({
  action, certificateId, institutionId, userId, success, details, metadata, request
})

// Admin action logging
logAdminAction({
  action, category, userId, details, metadata, request, institutionId, certificateId
})
```

## Notification System

The notification system monitors logs for suspicious activities and sends alerts to administrators. Configurable notification triggers include:

- Failed verification attempts
- Multiple failed attempts from the same IP
- Blockchain verification failures
- Administrative actions

## Configuration

The logging system can be configured through environment variables:

```
ENABLE_ADMIN_NOTIFICATIONS=true      # Enable/disable admin notifications
LOG_RETENTION_DAYS=90                # Days to keep logs before auto-purging
NOTIFICATION_BATCH_SIZE=10           # Max notifications to send in one batch
```

Email notification settings:

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-email-password
SMTP_FROM=notifications@credentialsystem.com
SMTP_SECURE=false
```

## Security Considerations

- Sensitive data should never be stored in logs (passwords, private keys, etc.)
- IP addresses and user agents should be treated as personal data (GDPR considerations)
- Implement appropriate log retention policies
- Control access to the log viewing interface

## Future Enhancements

Planned enhancements for the logging system include:

1. Real-time log streaming via WebSockets
2. Advanced analytics and anomaly detection
3. Integration with external SIEM systems
4. Geographic IP mapping
5. Two-factor authentication for viewing sensitive logs 