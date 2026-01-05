# Auth Server Project Context

## Overview
 . It is designed to handle user authentication, session management, and Multi-Factor Authentication (MFA) with high security and simplicity.

## Core Features

### 1. User Management
- Secure user registration and profile management.
- Persistent storage of user credentials and metadata.

### 2. Authentication Flow
- **Stateless JWT**: Uses JSON Web Tokens for secure, stateless session management.
- **Bcrypt Hashing**: All passwords are salted and hashed using Bcrypt.
- **Login/Logout**: standard endpoints for session initiation and termination.

### 3. Multi-Factor Authentication (MFA)
- Support for TOTP (Time-based One-Time Password) using apps like Google Authenticator.
- Mandatory or optional MFA enforcement.

### 4. Password Recovery
- Secure "Forgot Password" flow using time-limited tokens.

## Technical Stack
- **Framework**: Spring Boot 3.x
- **Security**: Spring Security 6.x
- **Database**: JPA/Hibernate (PostgreSQL/H2/MySQL compatible)
- **Token**: JJWT for token generation and parsing.
- **MFA**: Google Authenticator libraries.

## Implementation Goals
- **Independence**: The server should be easily deployable and usable by any client (Web, Mobile, or other microservices).
- **Security First**: Default to secure practices (e.g., token expiration, secure headers).
- **Clear API**: RESTful endpoints with comprehensive status codes and error messages.
