# Serwin Systems Backend Architecture

This document defines the core standards for resource identification and service communication in the Serwin Systems ecosystem.

## 1. Amazon Resource Names (ARN)

To ensure global uniqueness and scalability across all microservices (S3, EC2, Lambda, IAM), we use a structured ARN scheme.

### The ARN Format
`arn:serw:<service>:<region>:<account-id>:<resource-type>/<resource-id>`

| Component    | Description                                                                 |
| :----------- | :-------------------------------------------------------------------------- |
| `arn`        | Constant prefix.                                                            |
| `serw`       | The custom "Serwin" partition identifier.                                   |
| `service`    | The microservice (e.g., `s3`, `compute`, `lambda`, `iam`).                  |
| `region`     | The deployment region (e.g., `eu-north-1`).                                 |
| `account-id` | The unique identifier of the user or tenant.                                |
| `resource`   | The granular path (e.g., `bucket/my-bucket` or `object/my-bucket/path/to`). |

### Examples for S3
- **Bucket**: `arn:serw:s3:eu-north-1:user-123:bucket/my-assets`
- **Object**: `arn:serw:s3:eu-north-1:user-123:object/my-assets/images/logo.png`
- **Wildcard**: `arn:serw:s3:eu-north-1:user-123:object/my-assets/*`

---

## 2. NATS Messaging Scheme

Consistency in how services communicate is the bedrock of a scalable microservice architecture. We adopt a strict, hierarchical subject naming scheme for all NATS communication.

### The Subject Pattern
**`<env>.<service>.<version>.<domain>.<action_type>`**

#### Components
1. **`<env>` (Environment)**: `dev`, `staging`, `prod`. Prevents cross-environment interference.
2. **`<service>` (Source)**: `auth`, `s3`, `iam`, `lambda`. Originating service of the message.
3. **`<version>` (Protocol)**: `v1`, `v2`. Allows concurrent version support during migrations.
4. **`<domain>` (Entity)**: `user`, `bucket`, `instance`, `token`. The object of the event.
5. **`<action_type>` (Event/Command)**:
    - **Events (Past Tense)**: `created`, `deleted`, `registered`.
    - **Commands (Imperative)**: `validate`, `authorize`, `generate`.

### Examples in Action

| Subject | Meaning |
| :--- | :--- |
| `dev.auth.v1.user.registered` | A new user signed up in dev. |
| `staging.s3.v1.bucket.deleted` | A storage bucket was removed in staging. |
| `prod.iam.v1.access.authorize` | A request to authorize access to an ARN. |

---

## 3. Implementation Patterns

### IAM Authorization Flow
When a service (like S3) receives a request, it performs an authorization check via NATS:

1. **Construct ARN**: S3 builds the ARN for requested file.
2. **NATS Request**: S3 sends a message to `env.iam.v1.access.authorize`.
3. **Payload**:
   ```json
   {
     "actor_id": "user-uuid",
     "action": "s3:GetObject",
     "resource_arn": "arn:serw:s3:eu-north-1:user-uuid:object/bucket/key.jpg"
   }
   ```
4. **Response**: IAM service returns `Allow`/`Deny` based on policies.

### S3 Event Bus
Whenever a bucket or object is modified, S3 publishes to the event bus for other services (like Lambda) to consume:
- Subject: `dev.s3.v1.object.created`
- Payload: Includes the full ARN and file metadata.

---

> [!NOTE]
> This document is the source of truth for backend standards. All new services MUST adhere to these naming conventions.
