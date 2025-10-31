# Credit Jambo - Admin Features & Notification Integration

## Current Customer Features

### 1. User Management
- **Register account** → Auto-creates savings account + credit account
- **Verify email** with OTP (kycStatus remains PENDING - no manual approval)
- **Login/logout**
- **View/update profile**
- **View credit score**

### 2. Savings
- **Create account** (BASIC tier, auto-upgraded by cron)
- **View accounts**
- **Check balance**
- **Deposit/Withdraw**

### 3. Loans
- **Request loan** → System auto-decision:
  - **AUTO_APPROVED**: ≤50K RWF + score≥300 + KYC verified → Auto-disbursed
  - **PENDING_REVIEW**: >50K OR score<300 → Needs admin approval
  - **REJECTED**: score<200 OR has defaulted loans
- **View loans**
- **View repayment schedule**
- **Make repayment** (from savings account)

### 4. Credit
- **View credit account**
- **View credit availability**
- **View credit limit**

### 5. Transactions
- **View transaction history**
- **View transaction by reference**

---

## Admin Features (Mirror of Customer + Management)

### 1. Loan Management ⭐ PRIORITY

#### A. Pending Loans Review
**List loans where:**
- `approvalStatus = PENDING_REVIEW`
- `status = PENDING`

**View:**
- Customer: name, email, phone, creditScore, kycStatus
- Loan: amount, tenor, purpose, interestRate, totalAmount
- Customer's savings balance
- Customer's credit account (availableCredit, creditLimit)
- Customer's loan history

**Actions:**
- **Approve** → `approvalStatus = MANUAL_APPROVED`, `status = APPROVED`, generate repayment schedule
- **Reject** → `approvalStatus = REJECTED`, `status = REJECTED`, add rejection reason

**Notifications (gRPC):**
- Admin approves → `loan-approved.html` to customer
- Admin rejects → `loan-rejected.html` (NEW) to customer
- Customer requests PENDING_REVIEW loan → Alert to admin

#### B. Loan Disbursement
**List loans where:**
- `status = APPROVED` (not disbursed yet)

**View:**
- Customer's active savings account

**Actions:**
- **Disburse** → Credit savings, update to DISBURSED, reduce availableCredit, create transaction

**Notifications (gRPC):**
- Admin disburses → `loan-disbursed.html` to customer

#### C. Active Loans Monitoring
**List loans where:**
- `status = ACTIVE` or `DISBURSED`

**View:**
- Repayment schedule (SCHEDULED/OVERDUE/PAID status)
- Days overdue
- Filter by customer, status, overdue

**No actions** - customers repay, crons handle late fees/defaults

#### D. Defaulted Loans
**List loans where:**
- `status = DEFAULTED`

**View:**
- Customer contact
- Outstanding amount
- Days defaulted

**Actions:**
- **Mark as Settled** → Record manual payment
- Add collection notes

---

### 2. Customer Management

#### A. Customer List
**Features:**
- List all customers
- Search: name, email, customerId
- Filter: creditScore range, account tier

**View:**
- Profile (name, email, phone)
- Credit score
- Account tier (from savings)
- Registration date
- User status (ACTIVE/INACTIVE)

#### B. Customer Details
**View:**
- Profile
- All savings accounts with balances
- Credit account (limit, available, utilized)
- All loans (active, paid, defaulted)
- Transaction history

#### C. Account Management
**Actions:**
- **Suspend/Unsuspend** → Change `user.status` to INACTIVE/ACTIVE
- **Adjust Credit Limit** → Update `creditAccount.creditLimit`
- **Adjust Credit Score** → Update `user.creditScore` with reason

**Notifications (gRPC):**
- Status changed → `account-status-updated.html` (NEW) to customer
- Credit limit adjusted → `credit-limit-updated.html` (NEW) to customer
- Credit score adjusted → `credit-score-updated.html` (NEW) to customer

---

### 3. Transaction Monitoring
**Features:**
- View all transactions
- Filter: customer, type, date range, amount, status
- View transaction details
- Export to CSV

---

### 4. Dashboard & Reports

#### Dashboard Metrics
- Total customers
- Active loans count
- Total loan portfolio (disbursed)
- Outstanding amount
- Default rate
- Pending loans count

#### Reports
- Daily/monthly disbursements
- Repayment collection rate
- Overdue loans
- Default loans
- New registrations
- Customer tier distribution

---

## Notification Service gRPC Integration

### Architecture
```
Customer actions → customer-service → RabbitMQ → notification-service
Admin actions → admin-repo → gRPC → notification-service
```

### Why gRPC for Admin?
- Synchronous confirmation (show success/error in admin UI immediately)
- Type-safe proto contracts
- Better for request-response pattern

### Proto Definition

```proto
syntax = "proto3";

package notification;

service NotificationService {
  rpc SendEmail(SendEmailRequest) returns (SendEmailResponse);
  rpc SendAdminAlert(SendAdminAlertRequest) returns (SendEmailResponse);
}

message SendEmailRequest {
  string template_name = 1;          // "loan-approved", "loan-rejected", etc.
  repeated string recipients = 2;     // ["customer@email.com"]
  map<string, string> template_data = 3;
  string triggered_by = 4;           // Admin ID or "system"
  string reference_id = 5;           // Loan ID, User ID, etc.
}

message SendAdminAlertRequest {
  string alert_type = 1;             // "NEW_LOAN_PENDING", "LOAN_DEFAULTED"
  string message = 2;
  map<string, string> data = 3;
}

message SendEmailResponse {
  bool success = 1;
  string message = 2;
  string notification_id = 3;
}
```

### Notification Events

#### To Customer (Admin-triggered via gRPC)
| Admin Action | Template |
|--------------|----------|
| Approve loan | `loan-approved.html` (existing) |
| Reject loan | `loan-rejected.html` (NEW) |
| Disburse loan | `loan-disbursed.html` (existing) |
| Adjust credit limit | `credit-limit-updated.html` (NEW) |
| Adjust credit score | `credit-score-updated.html` (NEW) |
| Suspend/unsuspend account | `account-status-updated.html` (NEW) |

#### To Admin (System-triggered via RabbitMQ)
| Event | Template |
|-------|----------|
| Customer requests PENDING_REVIEW loan | `new-loan-pending.html` (NEW) |
| Loan defaults (cron) | `loan-defaulted-alert.html` (NEW) |

---

## Database Changes

### Admin Repo (New Database)
```typescript
// admin_users
{
  id: uuid;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  createdAt: timestamp;
}

// admin_actions_log (audit trail)
{
  id: uuid;
  adminId: uuid;
  action: string; // 'APPROVE_LOAN', 'REJECT_LOAN', etc.
  resourceType: string; // 'LOAN', 'USER'
  resourceId: uuid;
  metadata: json;
  createdAt: timestamp;
}

// loan_rejection_reasons
{
  id: uuid;
  loanId: uuid;
  rejectedBy: uuid;
  reason: string;
  notes: text;
  createdAt: timestamp;
}
```

### Notification Service
```typescript
// notification_logs (for tracking)
{
  id: uuid;
  template: string;
  recipient: string;
  status: 'SENT' | 'DELIVERED' | 'FAILED';
  triggeredBy: string; // admin ID or "system"
  referenceType: string; // 'LOAN', 'USER'
  referenceId: string;
  sentAt: timestamp;
  errorMessage: text;
}
```

---

## Implementation Phases

### Phase 1: Critical Loan Management
1. Admin auth (login, JWT)
2. Pending loans list & review
3. Loan approval/rejection
4. Loan disbursement
5. gRPC setup in notification-service
6. Notifications: loan-approved, loan-rejected, loan-disbursed

### Phase 2: Customer Management
7. Customer list & search
8. Customer details view
9. Credit limit adjustment
10. Account suspension
11. Notifications: credit-limit-updated, account-status-updated

### Phase 3: Monitoring
12. Active loans monitoring
13. Defaulted loans list
14. Transaction dashboard
15. Credit score adjustment

### Phase 4: Analytics
16. Dashboard metrics
17. Reports
18. Admin alerts