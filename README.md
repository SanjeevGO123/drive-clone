# 🚀 Drive Clone – Google Drive-Inspired Cloud Storage Platform

![Build & Test](https://github.com/SanjeevGO123/drive-clone/workflows/Build%20&%20Test/badge.svg)
![CodeQL](https://github.com/SanjeevGO123/drive-clone/workflows/CodeQL%20Analysis/badge.svg)
![Docker](https://github.com/SanjeevGO123/drive-clone/workflows/Build%20and%20Publish%20Docker%20Image/badge.svg)

A modern, full-stack, AWS-native cloud storage solution inspired by Google Drive. Built with a visually rich React frontend using **shadcn/ui** components and a secure, scalable serverless backend leveraging AWS Lambda, S3, DynamoDB, API Gateway, and CloudFront.

✨ **Latest Update:** Enhanced with cutting-edge liquid glass backgrounds, glassmorphism UI elements, strong password requirements with real-time validation, and fully migrated to shadcn/ui with enhanced accessibility, modern design system, color-coded file types, loading states, and improved user experience.

## 📋 Table of Contents
- [Design Features](#-design-features)
- [Architecture](#️-architecture)
- [Technology Stack](#-technology-stack)
- [Screenshots](#-screenshots)
- [Authentication & Security](#-authentication--security)
- [API Documentation](#-api-documentation)
- [UI Components](#-ui-components-shadcnui)
- [Project Structure](#-project-structure)
- [Getting Started Guide](#-getting-started-guide)
- [AWS Services Deep Dive](#-aws-services-deep-dive)
- [Authentication Flow Explained](#-authentication-flow-explained)
- [File Operations Deep Dive](#-file-operations-deep-dive)
- [Local Development](#️-local-development)
- [CloudFormation Template](#️-cloudformation-template)
- [Features](#-features)
- [Best Practices & Architecture](#-best-practices--architecture)
- [Troubleshooting](#-troubleshooting)
- [Performance Optimization](#-performance-optimization)
- [Monitoring & Logging](#-monitoring--logging)
- [CI/CD & GitHub Actions](#-cicd--github-actions-workflows)
- [License](#-license)
 
---

## 🎨 Design Features

### Animated Background & Visual Effects
- **Liquid Glass Effect** - Modern liquid glass background with floating orbs and glassmorphism
- **Advanced Animations** - Smooth, organic movements with morphing shapes and gradients
- **Glassmorphism UI** - Translucent cards with backdrop blur and subtle glass textures
- **Rich Color Palette** - Deep purples, vibrant pinks, emerald greens, and electric blues

### Modern UI with shadcn/ui
- **Consistent Design System** - Unified component library with semantic theming
- **Enhanced Accessibility** - ARIA labels, keyboard navigation, screen reader support
- **Color-Coded File Types** - Visual file type identification with badges
- **Loading States** - Skeleton loading animations for better UX
- **Error Handling** - User-friendly error dialogs and alerts
- **Dark Mode Support** - Full light/dark theme implementation

### File Type Color System
- 🔴 **PDF Files** - Red badges for easy identification
- 🟢 **Spreadsheets** - Green for Excel/CSV files  
- 🔵 **Documents** - Blue for Word documents
- 🟠 **Presentations** - Orange for PowerPoint files
- 🟣 **Images** - Purple for photos and graphics
- 🟡 **Archives** - Yellow for ZIP/RAR files
- 🩷 **Videos** - Pink for media files
- 🟦 **Audio** - Indigo for music files
- 🟢 **Code** - Emerald for programming files
- ⚫ **Text/Other** - Gray for plain text and unknown types

---
## 🏗️ Architecture

### AWS System Design Architecture
![AWS Architecture](./screenshots/system-design.jpeg)
*High-level AWS system architecture showing services and data flow*

### AWS Deployment Pipeline
![AWS Deployment Pipeline](./screenshots/deployment-design.jpeg)
*AWS CI/CD pipeline using CodePipeline, CodeBuild, and S3 deployment with CloudFront distribution*

### Sequence Diagram (Request/Response Model)

```mermaid
sequenceDiagram
    participant U as User
    participant R as React App
    participant C as Cognito
    participant A as API Gateway
    participant Auth as JWT Authorizer
    participant L as Lambda
    participant S as S3
    participant D as DynamoDB
    
    Note over U,D: User Registration Flow
    U->>R: Enter signup details
    R->>C: POST /auth/signup
    C->>C: Validate signup data
    C-->>R: User created + verification required
    R-->>U: Show verification prompt
    U->>R: Enter verification code
    R->>C: POST /auth/confirmSignup
    C->>C: Verify OTP code
    C-->>R: Account confirmed
    R-->>U: Show login page
    
    Note over U,D: User Authentication Flow
    U->>R: Enter credentials
    R->>C: POST /auth/signin
    C->>C: Validate credentials
    C-->>R: JWT token + user info
    R->>R: Store JWT token
    R-->>U: Redirect to dashboard
    
    Note over U,D: Dashboard Load (GET /getFiles)
    U->>R: Access dashboard
    R->>A: GET /getFiles (Authorization: Bearer JWT)
    A->>Auth: Validate JWT token
    Auth->>C: Verify token signature
    C-->>Auth: Token valid + user context
    Auth-->>A: Authorization success
    A->>L: Invoke getFiles Lambda (user context)
    L->>S: ListObjectsV2 (user-scoped prefix)
    S-->>L: Files and folders list
    L-->>A: HTTP 200 + { folders: [], files: [] }
    A-->>R: Response data
    R->>R: Update UI state
    R-->>U: Display files grid
    
    Note over U,D: File Upload Flow (POST /generatepresignedURL)
    U->>R: Select file for upload
    R->>A: POST /generatepresignedURL (JWT + file metadata)
    A->>Auth: Validate JWT token
    Auth->>C: Verify token
    C-->>Auth: Token valid
    Auth-->>A: Authorization success
    A->>L: Invoke getPresignedURL Lambda
    L->>S: Generate presigned upload URL
    L->>D: Store file metadata
    S-->>L: Presigned URL (15min expiry)
    D-->>L: Metadata stored
    L-->>A: HTTP 200 + { uploadUrl, key }
    A-->>R: Presigned URL response
    R->>S: PUT file data (direct to S3)
    S-->>R: HTTP 200 Upload success
    R->>R: Update upload progress
    R-->>U: Show upload completion
    
    Note over U,D: Create Folder Flow (POST /createFolder)
    U->>R: Click "New Folder" button
    R->>A: POST /createFolder (JWT + folder data)
    A->>Auth: Validate JWT token
    Auth->>C: Verify token
    C-->>Auth: Token valid
    Auth-->>A: Authorization success
    A->>L: Invoke createFolder Lambda
    L->>S: PutObject (empty folder marker)
    L->>D: Store folder metadata
    S-->>L: Folder created
    D-->>L: Metadata stored
    L-->>A: HTTP 200 + folder path
    A-->>R: Folder creation response
    R->>R: Update UI state
    R-->>U: Show new folder
    
    Note over U,D: Delete Folder Flow (DELETE /deleteFolder)
    U->>R: Right-click folder → Delete
    R->>R: Show confirmation dialog
    U->>R: Confirm deletion
    R->>A: DELETE /deleteFolder (JWT + folder path)
    A->>Auth: Validate JWT token
    Auth->>C: Verify token
    C-->>Auth: Token valid
    Auth-->>A: Authorization success
    A->>L: Invoke deleteFolder Lambda
    L->>S: ListObjects (get all contents)
    S-->>L: List of objects to delete
    L->>S: DeleteObjects (batch delete)
    L->>D: Remove folder metadata
    S-->>L: Objects deleted
    D-->>L: Metadata removed
    L-->>A: HTTP 200 + deletion count
    A-->>R: Deletion response
    R->>R: Update UI state
    R-->>U: Show deletion success
    
    Note over U,D: File Operations (DELETE/RENAME)
    U->>R: File action (delete/rename)
    R->>A: API call (JWT + operation data)
    A->>Auth: Validate JWT token
    Auth->>C: Verify token
    C-->>Auth: Token valid
    Auth-->>A: Authorization success
    A->>L: Invoke operation Lambda
    L->>S: S3 operation (delete/copy/rename)
    L->>D: Update metadata
    S-->>L: Operation success
    D-->>L: Metadata updated
    L-->>A: HTTP 200 + success message
    A-->>R: Operation response
    R->>R: Update UI state
    R-->>U: Show operation result
```


## 🧰 Technology Stack

### Frontend
- **React** (TypeScript) with modern hooks and context
- **shadcn/ui** - Complete modern, accessible component library
- **TailwindCSS** for rapid, responsive UI with custom design tokens
- **Lucide React** for consistent, beautiful iconography
- **AWS Cognito** (via `amazon-cognito-identity-js`) for secure authentication
- **React Hook Form** with validation for form management
- **Class Variance Authority** for component variant styling
- Hosted on **S3** with **CloudFront CDN** for global distribution

### Backend
- **Serverless AWS Lambda Functions** (Node.js 22.x):
  - `getFiles.ts` – List user files and folders
  - `getpresignedURL.ts` – Generate presigned S3 upload URLs
  - `createFolder.ts` – Create new folders
  - `deleteFile.ts` – Delete files
  - `deleteFolder.ts` – Delete folders and contents
  - `renameFile.ts` – Rename files 
- **API Gateway** (JWT auth via Cognito)
- **Amazon S3** for file storage (user-scoped)
- **DynamoDB** for metadata (optional, for advanced features)

---

## 📸 Screenshots

### Login Page
![Login Page](./screenshots/login-page.png)
*Modern login interface with liquid glass background featuring floating orbs and glassmorphism card design*

### Drive Dashboard
![Drive Dashboard](./screenshots/drive-dashboard.png)
*File management dashboard with color-coded file types, modern UI components, and intuitive navigation*



---

## 🔒 Authentication & Security
- **AWS Cognito User Pools** for sign-up, login, and JWT issuance
- **Strong Password Requirements** - Enforced minimum 8 characters with uppercase, lowercase, numbers, and special characters
- **Real-time Password Validation** - Live feedback on password requirements during signup
- **Smart Error Handling** - Toast notifications for password validation failures and authentication errors
- Frontend authenticates and attaches JWT to all API requests
- All backend APIs require a valid `Authorization: Bearer <token>` header
- IAM roles strictly limit Lambda, S3, and DynamoDB access

---

## 📡 API Documentation

All API endpoints require authentication via `Authorization: Bearer <JWT_TOKEN>` header.

### **GET** `/getFiles`
**Description:** List files and folders for the authenticated user  
**Query Parameters:**
- `prefix` (optional) - Folder path to list contents from (default: root)

**Request:**
```http
GET /getFiles?prefix=documents/
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "folders": ["subfolder1", "subfolder2"],
  "files": [
    {
      "key": "user123/documents/file1.pdf",
      "url": "https://s3.amazonaws.com/bucket/user123/documents/file1.pdf"
    }
  ]
}
```

---

### **POST** `/generatepresignedURL`
**Description:** Generate presigned URL for direct S3 file upload  
**Request Body:**
```json
{
  "fileName": "document.pdf",
  "fileType": "application/pdf",
  "prefix": "documents/"
}
```

**Request:**
```http
POST /generatepresignedURL
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "fileName": "document.pdf",
  "fileType": "application/pdf",
  "prefix": "documents/"
}
```

**Response:**
```json
{
  "uploadUrl": "https://s3.amazonaws.com/bucket/...",
  "key": "user123/documents/document.pdf"
}
```

---

### **POST** `/createFolder`
**Description:** Create a new folder  
**Request Body:**
```json
{
  "folderName": "new-folder",
  "prefix": "documents/"
}
```

**Request:**
```http
POST /createFolder
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "folderName": "new-folder",
  "prefix": "documents/"
}
```

**Response:**
```json
{
  "message": "Folder created successfully",
  "folderPath": "user123/documents/new-folder/"
}
```

---

### **DELETE** `/deleteFile`
**Description:** Delete a specific file  
**Request Body:**
```json
{
  "key": "user123/documents/file-to-delete.pdf"
}
```

**Request:**
```http
DELETE /deleteFile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "key": "user123/documents/file-to-delete.pdf"
}
```

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

---

### **DELETE** `/deleteFolder`
**Description:** Delete a folder and all its contents  
**Request Body:**
```json
{
  "folderPrefix": "user123/documents/folder-to-delete/"
}
```

**Request:**
```http
DELETE /deleteFolder
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "folderPrefix": "user123/documents/folder-to-delete/"
}
```

**Response:**
```json
{
  "message": "Folder and contents deleted successfully",
  "deletedItems": 5
}
```

---

### **POST** `/renameFile`
**Description:** Rename a file  
**Request Body:**
```json
{
  "oldKey": "user123/documents/old-name.pdf",
  "newKey": "user123/documents/new-name.pdf"
}
```

**Request:**
```http
POST /renameFile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "oldKey": "user123/documents/old-name.pdf",
  "newKey": "user123/documents/new-name.pdf"
}
```

**Response:**
```json
{
  "message": "File renamed successfully",
  "newKey": "user123/documents/new-name.pdf"
}
```

---

### Error Responses
All endpoints may return the following error responses:

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing JWT token"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden",
  "message": "Access denied to this resource"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## 🎨 UI Components (shadcn/ui)

This project uses **shadcn/ui** for consistent, accessible, and customizable components with complete TypeScript support:

### Core Components Used:
- **Button** - Multiple variants (default, destructive, outline, secondary, ghost, link)
- **Input** - Enhanced text inputs with proper focus states and validation
- **Input OTP** - Six-digit one-time password verification with auto-focus
- **Dialog** - Modal dialogs for confirmations, forms, and error messages
- **DropdownMenu** - Context menus for file/folder actions with keyboard navigation
- **Breadcrumb** - Navigation breadcrumbs with proper accessibility
- **Toast & Toaster** - Non-intrusive notifications with auto-dismiss
- **Card** - Content containers with header, content, and footer sections
- **Progress** - Upload progress indicators with color-coded states
- **Form & Label** - Structured form layouts with validation states
- **Badge** - Color-coded file type indicators with semantic variants
- **Separator** - Visual content dividers with orientation support
- **Skeleton** - Loading placeholders for better perceived performance
- **Alert** - Important messages with icons and proper styling

### Advanced Features:
- **Loading States** - Skeleton components for grid and list views
- **Error Handling** - User-friendly error dialogs for authentication failures
- **File Type Recognition** - Color-coded badges for different file extensions
- **Enhanced Navigation** - Breadcrumb navigation with folder hierarchy
- **Responsive Design** - Mobile-first approach with adaptive layouts

### Theming & Accessibility:
- **CSS Custom Properties** - Semantic color tokens for light/dark modes
- **WCAG Compliant** - AA accessibility standards throughout
- **Keyboard Navigation** - Full keyboard support for all interactive elements
- **Focus Management** - Proper focus trapping in modals and dropdowns
- **Screen Reader Support** - Comprehensive ARIA labels and descriptions
- **High Contrast** - Enhanced visibility in all lighting conditions
- **Responsive Typography** - Scalable text with proper line heights

---

## 📁 Project Structure

```
project-root/
├── .github/              # GitHub workflows
│   ├── workflows/
│   │   ├── build-test.yml
│   │   ├── codeql-analysis.yml
│   │   ├── docker-publish.yml
│   │   ├── health-check.yml
│   │   ├── performance.yml
│   │   └── release.yml
├── public/                # Static assets
│   └── index.html
├── src/
│   ├── pages/            # Main application pages
│   │   ├── Dashboard.tsx
│   │   └── Login.tsx
│   ├── components/       # Reusable UI components
│   │   ├── dashboard/    # Dashboard-specific components
│   │   │   ├── FileGrid.tsx
│   │   │   ├── Header.tsx
│   │   │   └── ...
│   │   ├── ui/          # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   └── ProtectedRoute.tsx
│   ├── aws/             # AWS service configurations
│   │   └── auth.ts
│   ├── hooks/           # Custom React hooks
│   │   └── use-toast.ts
│   ├── lib/             # Utility functions
│   │   └── utils.ts
│   └── App.tsx
├── api/                 # Lambda function handlers
│   ├── getFiles.ts
│   ├── createFolder.ts
│   ├── deleteFile.ts
│   └── ...
├── screenshots/         # Project screenshots
├── package.json
└── README.md
```

> **Note:** `.env.development` contains sensitive config (API URLs, Cognito IDs) and is git-ignored. Populate this file manually per environment.

---

## ☁️ AWS Services Deep Dive

This section provides detailed explanations of how each AWS service is utilized in the Drive Clone architecture, including configuration details, best practices, and integration patterns.

### Amazon S3 (Simple Storage Service)

#### Purpose & Role
S3 serves as the primary file storage backend, providing durable, scalable, and cost-effective object storage for all user files.

#### Configuration Details

**Bucket Structure:**
```
drive-clone-files-bucket/
├── user-{userId}/
│   ├── folder1/
│   │   ├── document.pdf
│   │   └── image.jpg
│   ├── folder2/
│   │   └── spreadsheet.xlsx
│   └── standalone-file.txt
```

**Bucket Policies:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowLambdaAccess",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::drive-clone-files-bucket",
        "arn:aws:s3:::drive-clone-files-bucket/*"
      ]
    }
  ]
}
```

**CORS Configuration:**
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://your-frontend-domain.com", "http://localhost:3000"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag", "x-amz-request-id"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

#### Key Features Used

1. **Presigned URLs**: Secure, time-limited access to S3 objects
   - Generated by Lambda functions
   - Valid for 15 minutes by default
   - Allows direct browser-to-S3 uploads (bypassing API Gateway limits)
   
2. **Server-Side Encryption**: All objects encrypted at rest
   - Uses AES-256 encryption
   - Managed by AWS (SSE-S3)
   
3. **Versioning**: Optional object versioning for file history
   - Can be enabled per bucket
   - Allows file recovery and rollback
   
4. **Lifecycle Policies**: Automated cost optimization
   ```json
   {
     "Rules": [
       {
         "Id": "ArchiveOldFiles",
         "Status": "Enabled",
         "Transitions": [
           {
             "Days": 90,
             "StorageClass": "GLACIER"
           }
         ]
       }
     ]
   }
   ```

#### S3 Operations Flow

**File Upload Process:**
```
1. Frontend requests presigned URL from Lambda
2. Lambda generates URL with PUT permissions
3. Frontend uploads directly to S3 using presigned URL
4. S3 confirms upload with 200 OK response
5. Lambda stores metadata in DynamoDB
```

**File Download Process:**
```
1. Frontend requests file list from Lambda
2. Lambda queries S3 ListObjectsV2 API
3. Lambda generates presigned GET URLs for each file
4. Frontend displays files with download links
5. User clicks file → direct download from S3
```

---

### AWS Lambda (Serverless Functions)

#### Purpose & Role
Lambda functions handle all backend API logic, providing serverless compute for file operations, authentication, and business logic.

#### Function Details

**Runtime Configuration:**
- **Runtime**: Node.js 20.x
- **Memory**: 512 MB (configurable per function)
- **Timeout**: 30 seconds (adjustable based on operation)
- **Concurrency**: 1000 concurrent executions (default)

**IAM Role Permissions:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::drive-clone-files-bucket",
        "arn:aws:s3:::drive-clone-files-bucket/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/drive-clone-metadata"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

#### Lambda Function Breakdown

Each Lambda function serves a specific purpose in the file management workflow.

**Lambda Best Practices Implemented:**
- Minimal dependencies for fast cold starts
- Connection pooling for AWS SDK clients
- Structured JSON logging
- Environment variables for configuration
- Comprehensive error handling

---

### Amazon API Gateway

#### Purpose & Role
API Gateway provides RESTful HTTP API endpoints, handles request routing, authorization, CORS, and integrates with Lambda functions.

#### Configuration

**API Type**: HTTP API (not REST API)
- Lower cost than REST API
- Better performance
- Built-in JWT authorization

**Endpoints:**
```
BASE_URL: https://{api-id}.execute-api.{region}.amazonaws.com

GET    /getFiles              - List files/folders
POST   /generatepresignedURL  - Get upload URL
POST   /createFolder          - Create new folder
DELETE /deleteFile            - Delete file
DELETE /deleteFolder          - Delete folder
POST   /renameFile            - Rename/move file
```

**CORS Configuration:**
```json
{
  "allowOrigins": ["https://your-domain.com", "http://localhost:3000"],
  "allowMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  "allowHeaders": ["Content-Type", "Authorization", "X-Amz-Date"],
  "maxAge": 300,
  "allowCredentials": true
}
```

**JWT Authorizer:**
```json
{
  "name": "cognito-authorizer",
  "identitySource": "$request.header.Authorization",
  "issuerUrl": "https://cognito-idp.{region}.amazonaws.com/{userPoolId}",
  "audience": ["{clientId}"]
}
```

---

### Amazon Cognito

#### Purpose & Role
Cognito provides complete user authentication and authorization, including user registration, login, email verification, password management, and JWT token generation.

#### User Pool Configuration

**Password Policy:**
```json
{
  "minimumLength": 8,
  "requireUppercase": true,
  "requireLowercase": true,
  "requireNumbers": true,
  "requireSymbols": true,
  "temporaryPasswordValidityDays": 7
}
```

**Email Verification:**
- Auto-verified attributes: `email`
- Verification code length: 6 digits
- Code validity: 24 hours

**User Pool Client Settings:**
```json
{
  "generateSecret": false,
  "refreshTokenValidity": 30,
  "accessTokenValidity": 60,
  "idTokenValidity": 60,
  "tokenValidityUnits": {
    "refreshToken": "days",
    "accessToken": "minutes",
    "idToken": "minutes"
  }
}
```

**JWT Token Structure:**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "email_verified": true,
  "cognito:username": "username",
  "iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX",
  "exp": 1234567890,
  "iat": 1234564290
}
```

---

### Amazon DynamoDB

#### Purpose & Role
DynamoDB stores file and folder metadata, providing fast, scalable NoSQL storage for user data indexing and querying.

#### Table Schema

**Table Name**: `drive-clone-metadata`

**Partition Key**: `userId` (String)
**Sort Key**: `fileKey` (String)

**Attributes:**
```json
{
  "userId": "user-uuid",
  "fileKey": "user-uuid/folder/filename.pdf",
  "fileName": "filename.pdf",
  "fileType": "application/pdf",
  "fileSize": 1048576,
  "uploadedAt": "2024-01-15T10:30:00.000Z",
  "lastModified": "2024-01-15T10:30:00.000Z",
  "folder": "folder/",
  "tags": ["important", "work"],
  "shared": false,
  "version": 1
}
```

**Query Patterns:**

1. **List all files for user:**
```typescript
const params = {
  TableName: 'drive-clone-metadata',
  KeyConditionExpression: 'userId = :userId',
  ExpressionAttributeValues: { ':userId': { S: userId } }
};
```

2. **List files in specific folder:**
```typescript
const params = {
  IndexName: 'FolderIndex',
  KeyConditionExpression: 'userId = :userId AND folder = :folder'
};
```

---

### Amazon CloudFront

#### Purpose & Role
CloudFront serves as a global Content Delivery Network (CDN) for both the React frontend and S3-stored files, providing low-latency access worldwide.

#### Configuration

**Frontend Distribution:**
- **Origin**: S3 bucket (static website)
- **Default Root Object**: `index.html`
- **Error Pages**: Redirect 404 → `/index.html` (for SPA routing)
- **Caching**: Long cache for assets (1 year), short for index.html (5 min)
- **Compression**: Gzip/Brotli enabled
- **HTTPS**: Required (redirects HTTP to HTTPS)

---

## 🔐 Authentication Flow Explained

This section provides a detailed walkthrough of the complete authentication process, from user registration to API authorization.

### User Registration Flow

**Step-by-Step Process:**

1. **User Fills Registration Form**
   - Email address (must be valid format)
   - Password (8+ characters, uppercase, lowercase, number, special character)
   - Frontend validates password requirements in real-time

2. **Frontend Calls Cognito SignUp**
   ```typescript
   import { CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
   
   const userPool = new CognitoUserPool({
     UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
     ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID
   });
   
   const attributeList = [
     new CognitoUserAttribute({ Name: 'email', Value: email })
   ];
   
   userPool.signUp(username, password, attributeList, null, callback);
   ```

3. **Cognito Creates User**
   - User account created in UNCONFIRMED status
   - Verification code generated (6 digits)
   - Email sent with verification code

4. **User Receives Verification Email**
   - Subject: "Your verification code"
   - Contains 6-digit code (valid for 24 hours)

5. **User Enters Verification Code**
   ```typescript
   const cognitoUser = new CognitoUser({ Username: username, Pool: userPool });
   
   cognitoUser.confirmRegistration(code, true, (err, result) => {
     if (err) {
       // Handle error (invalid code, expired, etc.)
       return;
     }
     // User confirmed, can now sign in
   });
   ```

6. **Cognito Confirms User**
   - User status changed to CONFIRMED
   - User can now sign in

### Sign In Flow

**Step-by-Step Process:**

1. **User Enters Credentials**
   - Email address
   - Password

2. **Frontend Creates Authentication Request**
   ```typescript
   import { AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';
   
   const authenticationDetails = new AuthenticationDetails({
     Username: email,
     Password: password
   });
   
   const cognitoUser = new CognitoUser({
     Username: email,
     Pool: userPool
   });
   ```

3. **Cognito Validates Credentials**
   - Verifies user exists and is confirmed
   - Checks password hash
   - Generates JWT tokens

4. **Frontend Receives JWT Tokens**
   ```typescript
   cognitoUser.authenticateUser(authenticationDetails, {
     onSuccess: (result) => {
       const accessToken = result.getAccessToken().getJwtToken();
       const idToken = result.getIdToken().getJwtToken();
       const refreshToken = result.getRefreshToken().getToken();
       
       // Store tokens securely
       localStorage.setItem('accessToken', accessToken);
       localStorage.setItem('idToken', idToken);
       localStorage.setItem('refreshToken', refreshToken);
       
       // Redirect to dashboard
       navigate('/dashboard');
     },
     onFailure: (err) => {
       // Handle error (wrong password, user not found, etc.)
       console.error('Authentication failed:', err);
     }
   });
   ```

5. **Tokens Stored in Browser**
   - Access Token: Used for API authorization (expires in 60 min)
   - ID Token: Contains user identity information (expires in 60 min)
   - Refresh Token: Used to get new access tokens (expires in 30 days)

### API Request Authorization

**Step-by-Step Process:**

1. **Frontend Makes API Request**
   ```typescript
   const accessToken = localStorage.getItem('accessToken');
   
   const response = await fetch(`${API_URL}/getFiles`, {
     method: 'GET',
     headers: {
       'Authorization': `Bearer ${accessToken}`,
       'Content-Type': 'application/json'
     }
   });
   ```

2. **API Gateway Receives Request**
   - Extracts Authorization header
   - Passes to JWT Authorizer

3. **JWT Authorizer Validates Token**
   ```javascript
   // Authorizer checks:
   1. Token signature is valid (signed by Cognito)
   2. Token hasn't expired (exp claim)
   3. Token issuer matches Cognito User Pool (iss claim)
   4. Token audience matches App Client ID (aud claim)
   ```

4. **If Valid: Request Forwarded to Lambda**
   ```typescript
   // Lambda receives event with user context
   export const handler = async (event: APIGatewayProxyEvent) => {
     // Extract user ID from JWT claims
     const userId = event.requestContext.authorizer.jwt.claims.sub;
     const email = event.requestContext.authorizer.jwt.claims.email;
     
     // Use user context for authorization
     // All file operations are scoped to this userId
     const userPrefix = `${userId}/`;
     
     // Process request...
   };
   ```

5. **If Invalid: 401 Unauthorized Returned**
   ```json
   {
     "message": "Unauthorized"
   }
   ```

### Token Refresh Flow

**When Access Token Expires:**

1. **Frontend Detects 401 Error**
   ```typescript
   const response = await fetch(API_URL);
   
   if (response.status === 401) {
     // Token expired, refresh it
     await refreshAccessToken();
     // Retry original request
   }
   ```

2. **Frontend Uses Refresh Token**
   ```typescript
   const refreshToken = localStorage.getItem('refreshToken');
   
   cognitoUser.refreshSession(refreshToken, (err, session) => {
     if (err) {
       // Refresh failed, redirect to login
       navigate('/login');
       return;
     }
     
     // Store new tokens
     const newAccessToken = session.getAccessToken().getJwtToken();
     localStorage.setItem('accessToken', newAccessToken);
     
     // Retry failed request with new token
   });
   ```

3. **Cognito Issues New Tokens**
   - New access token (60 min validity)
   - New ID token (60 min validity)
   - Refresh token remains valid

### Security Considerations

**Token Storage:**
- Stored in localStorage (accessible to JavaScript)
- Alternative: httpOnly cookies (more secure but requires backend)
- Always use HTTPS to prevent token interception

**Token Validation:**
- API Gateway validates every request
- Lambda trusts API Gateway validation
- No token stored in backend

**User Context Isolation:**
- All file paths prefixed with userId
- Lambda enforces userId from JWT claims
- Users cannot access other users' files

---

## 📦 File Operations Deep Dive

This section explains the technical implementation of file operations, including upload, download, delete, and folder management.

### File Upload Flow (Presigned URL)

**Why Presigned URLs?**
- API Gateway has 10MB payload limit
- Direct S3 upload bypasses this limit
- More efficient (no data through Lambda)
- Lower cost (less Lambda execution time)

**Step-by-Step Process:**

1. **User Selects File in Browser**
   ```typescript
   <input 
     type="file" 
     onChange={(e) => handleFileSelect(e.target.files[0])} 
   />
   ```

2. **Frontend Requests Presigned URL**
   ```typescript
   const requestPresignedUrl = async (file: File) => {
     const response = await fetch(`${API_URL}/generatepresignedURL`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${accessToken}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         fileName: file.name,
         fileType: file.type,
         prefix: currentFolder // e.g., "documents/"
       })
     });
     
     const { uploadUrl, key } = await response.json();
     return { uploadUrl, key };
   };
   ```

3. **Lambda Generates Presigned URL**
   ```typescript
   import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
   import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
   
   export const handler = async (event) => {
     const userId = event.requestContext.authorizer.jwt.claims.sub;
     const { fileName, fileType, prefix } = JSON.parse(event.body);
     
     // Construct S3 key with user isolation
     const key = `${userId}/${prefix}${fileName}`;
     
     // Create presigned URL (15 minutes validity)
     const command = new PutObjectCommand({
       Bucket: process.env.S3_BUCKET_NAME,
       Key: key,
       ContentType: fileType
     });
     
     const uploadUrl = await getSignedUrl(s3Client, command, {
       expiresIn: 900 // 15 minutes
     });
     
     return {
       statusCode: 200,
       body: JSON.stringify({ uploadUrl, key })
     };
   };
   ```

4. **Frontend Uploads Directly to S3**
   ```typescript
   const uploadToS3 = async (file: File, uploadUrl: string) => {
     const response = await fetch(uploadUrl, {
       method: 'PUT',
       headers: {
         'Content-Type': file.type
       },
       body: file
     });
     
     if (!response.ok) {
       throw new Error('Upload failed');
     }
     
     return response;
   };
   ```

5. **Track Upload Progress**
   ```typescript
   const uploadWithProgress = async (file: File, uploadUrl: string) => {
     const xhr = new XMLHttpRequest();
     
     return new Promise((resolve, reject) => {
       xhr.upload.addEventListener('progress', (e) => {
         if (e.lengthComputable) {
           const percentComplete = (e.loaded / e.total) * 100;
           setUploadProgress(percentComplete);
         }
       });
       
       xhr.addEventListener('load', () => {
         if (xhr.status === 200) {
           resolve(xhr.response);
         } else {
           reject(new Error('Upload failed'));
         }
       });
       
       xhr.open('PUT', uploadUrl);
       xhr.setRequestHeader('Content-Type', file.type);
       xhr.send(file);
     });
   };
   ```

6. **Frontend Refreshes File List**
   ```typescript
   await uploadToS3(file, uploadUrl);
   await fetchFiles(); // Refresh dashboard
   ```

### File Download Flow

**Step-by-Step Process:**

1. **User Clicks File**
   ```typescript
   const handleFileClick = (file: FileItem) => {
     // Option 1: Download via presigned URL
     window.open(file.downloadUrl, '_blank');
     
     // Option 2: Download with custom filename
     downloadFile(file.downloadUrl, file.fileName);
   };
   ```

2. **Frontend Requests File List (with URLs)**
   ```typescript
   const fetchFiles = async () => {
     const response = await fetch(
       `${API_URL}/getFiles?prefix=${currentFolder}`,
       {
         headers: {
           'Authorization': `Bearer ${accessToken}`
         }
       }
     );
     
     const data = await response.json();
     return data.files; // Contains presigned GET URLs
   };
   ```

3. **Lambda Generates Presigned GET URLs**
   ```typescript
   export const handler = async (event) => {
     const userId = event.requestContext.authorizer.jwt.claims.sub;
     const prefix = event.queryStringParameters?.prefix || '';
     
     // List objects in S3
     const listResponse = await s3Client.send(new ListObjectsV2Command({
       Bucket: process.env.S3_BUCKET_NAME,
       Prefix: `${userId}/${prefix}`
     }));
     
     // Generate presigned URL for each file
     const filesWithUrls = await Promise.all(
       listResponse.Contents.map(async (obj) => {
         const command = new GetObjectCommand({
           Bucket: process.env.S3_BUCKET_NAME,
           Key: obj.Key
         });
         
         const url = await getSignedUrl(s3Client, command, {
           expiresIn: 3600 // 1 hour
         });
         
         return {
           key: obj.Key,
           fileName: obj.Key.split('/').pop(),
           size: obj.Size,
           lastModified: obj.LastModified,
           url: url
         };
       })
     );
     
     return {
       statusCode: 200,
       body: JSON.stringify({ files: filesWithUrls })
     };
   };
   ```

4. **Browser Downloads File**
   - Click opens presigned URL
   - S3 serves file directly
   - Browser handles download

### File Delete Flow

**Step-by-Step Process:**

1. **User Right-Clicks File → Delete**
   ```typescript
   const handleDeleteFile = async (fileKey: string) => {
     // Show confirmation dialog
     const confirmed = window.confirm('Delete this file?');
     if (!confirmed) return;
     
     await deleteFile(fileKey);
   };
   ```

2. **Frontend Sends Delete Request**
   ```typescript
   const deleteFile = async (key: string) => {
     const response = await fetch(`${API_URL}/deleteFile`, {
       method: 'DELETE',
       headers: {
         'Authorization': `Bearer ${accessToken}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({ key })
     });
     
     if (!response.ok) {
       throw new Error('Delete failed');
     }
     
     // Refresh file list
     await fetchFiles();
   };
   ```

3. **Lambda Deletes File from S3**
   ```typescript
   export const handler = async (event) => {
     const userId = event.requestContext.authorizer.jwt.claims.sub;
     const { key } = JSON.parse(event.body);
     
     // Verify ownership (security check)
     if (!key.startsWith(`${userId}/`)) {
       return {
         statusCode: 403,
         body: JSON.stringify({ error: 'Access denied' })
       };
     }
     
     // Delete from S3
     await s3Client.send(new DeleteObjectCommand({
       Bucket: process.env.S3_BUCKET_NAME,
       Key: key
     }));
     
     return {
       statusCode: 200,
       body: JSON.stringify({ message: 'File deleted' })
     };
   };
   ```

### Folder Operations

**Create Folder:**
```typescript
// Frontend
const createFolder = async (folderName: string) => {
  await fetch(`${API_URL}/createFolder`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      folderName,
      prefix: currentFolder
    })
  });
};

// Lambda
export const handler = async (event) => {
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  const { folderName, prefix } = JSON.parse(event.body);
  
  // Create empty object with trailing slash (S3 folder convention)
  const folderKey = `${userId}/${prefix}${folderName}/`;
  
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: folderKey,
    Body: ''
  }));
  
  return { statusCode: 200, body: JSON.stringify({ folderKey }) };
};
```

**Delete Folder (Recursive):**
```typescript
// Lambda
export const handler = async (event) => {
  const { folderPrefix } = JSON.parse(event.body);
  
  // List all objects in folder
  const listResponse = await s3Client.send(new ListObjectsV2Command({
    Bucket: process.env.S3_BUCKET_NAME,
    Prefix: folderPrefix
  }));
  
  if (!listResponse.Contents?.length) {
    return { statusCode: 200, body: 'Folder is empty' };
  }
  
  // Batch delete (max 1000 objects per call)
  await s3Client.send(new DeleteObjectsCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Delete: {
      Objects: listResponse.Contents.map(obj => ({ Key: obj.Key }))
    }
  }));
  
  return {
    statusCode: 200,
    body: JSON.stringify({ deletedCount: listResponse.Contents.length })
  };
};
```

### File Rename Flow

**S3 Rename = Copy + Delete:**

```typescript
// Lambda
export const handler = async (event) => {
  const { oldKey, newKey } = JSON.parse(event.body);
  
  // Step 1: Copy to new location
  await s3Client.send(new CopyObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    CopySource: `${process.env.S3_BUCKET_NAME}/${oldKey}`,
    Key: newKey
  }));
  
  // Step 2: Delete old location
  await s3Client.send(new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: oldKey
  }));
  
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'File renamed', newKey })
  };
};
```

---

## 🚀 Getting Started Guide

This comprehensive guide will walk you through setting up the Drive Clone application from scratch, including both frontend and backend AWS infrastructure.

### Prerequisites Checklist

Before you begin, ensure you have the following installed and configured:

#### Required Software
- **Node.js** v20.x or higher ([Download](https://nodejs.org/))
- **npm** v9.x or higher (comes with Node.js)
- **AWS CLI** v2.x ([Installation Guide](https://aws.amazon.com/cli/))
- **Git** for version control

#### AWS Account Setup
1. **Create an AWS Account** at [aws.amazon.com](https://aws.amazon.com) if you don't have one
2. **Configure AWS CLI** with your credentials:
   ```bash
   aws configure
   # Enter your AWS Access Key ID
   # Enter your AWS Secret Access Key
   # Default region: us-east-1 (or your preferred region)
   # Default output format: json
   ```
3. **Verify AWS CLI Configuration**:
   ```bash
   aws sts get-caller-identity
   # Should display your AWS account information
   ```

### Step-by-Step Setup

#### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/SanjeevGO123/drive-clone.git

# Navigate to project directory
cd drive-clone

# Check Node version (should be v20+)
node --version

# Check npm version
npm --version
```

#### Step 2: Install Frontend Dependencies

```bash
# Install all required npm packages
npm install --legacy-peer-deps

# The --legacy-peer-deps flag is needed due to React 18 compatibility
# This will install all dependencies including:
# - React & React DOM
# - TypeScript
# - TailwindCSS
# - shadcn/ui components
# - AWS Cognito SDK
# - Testing libraries
```

**Expected Output:**
```
added 1613 packages, and audited 1614 packages in 30s
```

#### Step 3: AWS Infrastructure Setup

You have two options for deploying the AWS backend:

##### Option A: Using CloudFormation (Recommended)

1. **Navigate to CloudFormation Template**:
   ```bash
   cd template
   ls cloudformation-template.yaml
   ```

2. **Deploy the Stack**:
   ```bash
   aws cloudformation create-stack \
     --stack-name drive-clone-stack \
     --template-body file://cloudformation-template.yaml \
     --capabilities CAPABILITY_NAMED_IAM \
     --parameters \
       ParameterKey=ProjectName,ParameterValue=drive-clone \
       ParameterKey=Environment,ParameterValue=prod
   ```

3. **Monitor Stack Creation**:
   ```bash
   # Watch stack creation progress
   aws cloudformation describe-stacks \
     --stack-name drive-clone-stack \
     --query 'Stacks[0].StackStatus'
   
   # Wait for CREATE_COMPLETE status (takes 5-10 minutes)
   aws cloudformation wait stack-create-complete \
     --stack-name drive-clone-stack
   ```

4. **Retrieve Stack Outputs**:
   ```bash
   # Get all stack outputs (API URL, Cognito IDs, etc.)
   aws cloudformation describe-stacks \
     --stack-name drive-clone-stack \
     --query 'Stacks[0].Outputs'
   ```

##### Option B: Manual AWS Setup

If you prefer to set up each service manually:

**1. Create S3 Buckets**
```bash
# File storage bucket
aws s3 mb s3://drive-clone-files-your-unique-id

# Frontend hosting bucket
aws s3 mb s3://drive-clone-frontend-your-unique-id

# Configure frontend bucket for static website hosting
aws s3 website s3://drive-clone-frontend-your-unique-id \
  --index-document index.html \
  --error-document index.html
```

**2. Create DynamoDB Table**
```bash
aws dynamodb create-table \
  --table-name drive-clone-metadata \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=fileKey,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
    AttributeName=fileKey,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

**3. Create Cognito User Pool**
```bash
# Create user pool
aws cognito-idp create-user-pool \
  --pool-name drive-clone-users \
  --auto-verified-attributes email \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=true}"

# Create user pool client
aws cognito-idp create-user-pool-client \
  --user-pool-id <your-user-pool-id> \
  --client-name drive-clone-web-client \
  --no-generate-secret
```

**4. Create Lambda Functions**

First, create an IAM role for Lambda:
```bash
# Create trust policy file
cat > lambda-trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "lambda.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
EOF

# Create IAM role
aws iam create-role \
  --role-name drive-clone-lambda-role \
  --assume-role-policy-document file://lambda-trust-policy.json

# Attach policies
aws iam attach-role-policy \
  --role-name drive-clone-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy \
  --role-name drive-clone-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-role-policy \
  --role-name drive-clone-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
```

Deploy each Lambda function:
```bash
# Package Lambda functions
cd api
npm install --production
zip -r getFiles.zip getFiles.ts node_modules/

# Create Lambda function
aws lambda create-function \
  --function-name drive-clone-getFiles \
  --runtime nodejs20.x \
  --role arn:aws:iam::YOUR-ACCOUNT-ID:role/drive-clone-lambda-role \
  --handler getFiles.handler \
  --zip-file fileb://getFiles.zip \
  --timeout 30

# Repeat for other Lambda functions (createFolder, deleteFile, etc.)
```

**5. Create API Gateway**
```bash
# Create HTTP API
aws apigatewayv2 create-api \
  --name drive-clone-api \
  --protocol-type HTTP \
  --target arn:aws:lambda:REGION:ACCOUNT-ID:function:drive-clone-getFiles

# Create Cognito authorizer
aws apigatewayv2 create-authorizer \
  --api-id YOUR-API-ID \
  --authorizer-type JWT \
  --identity-source '$request.header.Authorization' \
  --name cognito-authorizer \
  --jwt-configuration Audience=YOUR-CLIENT-ID,Issuer=https://cognito-idp.REGION.amazonaws.com/YOUR-USER-POOL-ID
```

#### Step 4: Configure Environment Variables

Create `.env.development` file in the project root:

```bash
# Create environment file
cat > .env.development << 'EOF'
# API Gateway Endpoint
REACT_APP_API_URL=https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com

# AWS Cognito Configuration
REACT_APP_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
REACT_APP_COGNITO_CLIENT_ID=your-app-client-id-here
REACT_APP_COGNITO_REGION=us-east-1

# S3 Configuration (Optional - for direct uploads)
REACT_APP_S3_BUCKET=drive-clone-files-your-unique-id
REACT_APP_S3_REGION=us-east-1

# Application Settings
REACT_APP_MAX_FILE_SIZE=104857600
REACT_APP_ALLOWED_FILE_TYPES=*
EOF
```

**How to Find Your Values:**

1. **API URL**: From CloudFormation outputs or API Gateway console
   ```bash
   aws cloudformation describe-stacks \
     --stack-name drive-clone-stack \
     --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
     --output text
   ```

2. **Cognito User Pool ID**: From CloudFormation outputs or Cognito console
   ```bash
   aws cloudformation describe-stacks \
     --stack-name drive-clone-stack \
     --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
     --output text
   ```

3. **Cognito Client ID**: From CloudFormation outputs or Cognito console
   ```bash
   aws cloudformation describe-stacks \
     --stack-name drive-clone-stack \
     --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
     --output text
   ```

#### Step 5: Run Development Server

```bash
# Start the development server
npm start

# The application will open at http://localhost:3000
# Hot reload is enabled - changes will reflect automatically
```

**Expected Output:**
```
Compiled successfully!

You can now view drive-clone in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.x:3000
```

#### Step 6: Create Your First User

1. **Navigate to the application** in your browser: `http://localhost:3000`
2. **Click "Sign Up"** to create a new account
3. **Fill in registration details**:
   - Email: your-email@example.com
   - Password: Must meet requirements (8+ chars, uppercase, lowercase, number, special char)
4. **Verify your email**: Check your inbox for verification code
5. **Enter verification code** in the application
6. **Sign in** with your credentials
7. **Start uploading files!**

#### Step 7: Build for Production

```bash
# Create optimized production build
npm run build

# Output will be in the build/ directory
# You can deploy this to S3 + CloudFront
```

**Deploy to S3:**
```bash
# Sync build files to S3
aws s3 sync build/ s3://drive-clone-frontend-your-unique-id/ \
  --delete \
  --cache-control "public,max-age=31536000,immutable"

# Invalidate CloudFront cache (if using CloudFront)
aws cloudfront create-invalidation \
  --distribution-id YOUR-DISTRIBUTION-ID \
  --paths "/*"
```

### Verification Steps

After setup, verify everything is working:

1. **Check Frontend**: Navigate to `http://localhost:3000`
2. **Check Authentication**: Sign up and verify email
3. **Check API Connection**: After login, dashboard should load
4. **Check File Upload**: Upload a test file
5. **Check S3 Storage**: Verify file appears in S3 bucket
   ```bash
   aws s3 ls s3://drive-clone-files-your-unique-id/ --recursive
   ```

### Common Setup Issues

| Issue | Solution |
|-------|----------|
| `npm install` fails | Use `npm install --legacy-peer-deps` |
| AWS CLI not configured | Run `aws configure` with your credentials |
| CloudFormation stack fails | Check IAM permissions, ensure unique resource names |
| Environment variables not loading | Ensure `.env.development` is in project root |
| CORS errors | Check API Gateway CORS configuration |
| Cognito errors | Verify User Pool and Client IDs are correct |

---

## 🛠️ Local Development

### Prerequisites
- Node.js ≥ 20
- AWS Account & CLI configured

### Frontend Setup
```bash
# Install dependencies
npm install

# Install additional shadcn/ui components (if needed)
npx shadcn-ui@latest add button input dialog toast card progress
```

Create `.env.development` in the root with:
```env
REACT_APP_API_URL=https://your-api-gateway-url
REACT_APP_COGNITO_USER_POOL_ID=your_cognito_user_pool_id
REACT_APP_COGNITO_CLIENT_ID=your_cognito_app_client_id
```

Run locally:
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## 🏗️ CloudFormation Template

The full AWS CloudFormation template for this project is provided in the file [`cloudformation-template.yaml`](./template/cloudformation-template.yaml) in the infrastructure/ directory of this repository.

This template provisions all required AWS resources for the backend, including:
- S3 buckets (for app data and file storage)
- CloudFront distributions (for static site and file delivery)
- DynamoDB table (for metadata)
- Lambda functions (API handlers)
- API Gateway (HTTP API)
- Cognito User Pool and User Pool Client
- **CodePipeline** (for automated CI/CD)
- **CodeBuild** (for building and testing)
- **IAM Roles** (for secure service-to-service communication)

### AWS CI/CD Pipeline Integration

The deployment uses AWS native CI/CD services:

1. **CodePipeline** - Orchestrates the deployment workflow
   - Source stage: GitHub repository integration
   - Build stage: CodeBuild for compilation and testing
   - Deploy stage: S3 deployment with CloudFront invalidation

2. **CodeBuild** - Handles build and test processes
   - Node.js 20 runtime environment
   - npm dependencies installation with `--legacy-peer-deps`
   - React production build compilation
   - Artifact preparation for S3 deployment

3. **S3 + CloudFront** - Static site hosting
   - S3 bucket for static asset storage
   - CloudFront CDN for global content delivery
   - Automatic cache invalidation on deployments

### How to Deploy

1. **Review and customize the template** as needed in `cloudformation-template.yaml` (e.g., bucket names, parameters).
2. **Deploy using the AWS Console:**
   - Go to the AWS CloudFormation service in your AWS Console.
   - Click “Create stack” → “With new resources (standard)”.
   - Upload the `cloudformation-template.yaml` file.
   - Follow the prompts to launch the stack.
3. **Or deploy using the AWS CLI:**
   ```sh
   aws cloudformation deploy \
     --template-file cloudformation-template.yaml \
     --stack-name your-stack-name \
     --capabilities CAPABILITY_NAMED_IAM
   ```
4. After deployment, check the CloudFormation Outputs tab for resource names, endpoints, and URLs.

**Tip:** You can modify the template to fit your environment or CI/CD pipeline. For advanced automation, integrate with AWS CodePipeline or GitHub Actions.

---

## 🧪 Features

### Authentication & Security
- 🔐 **Secure Cognito Authentication** - Modern sign-up/login with shadcn/ui forms
- � **Strong Password Requirements** - Enforced 8+ characters with uppercase, lowercase, numbers, and special characters
- ⚡ **Real-time Password Validation** - Live feedback on password strength and requirements
- �🔑 **OTP Verification** - Six-digit code verification with auto-focus input
- 🛡️ **Error Handling** - User-friendly error dialogs for wrong OTP, duplicate signup, and password validation
- 🎯 **JWT Token Management** - Automatic token refresh and validation
- 🔔 **Smart Notifications** - Toast alerts for authentication errors and password requirements

### File Management
- 📁 **Hierarchical Folder Navigation** - Breadcrumb navigation with folder hierarchy
- 📤 **Multi-select File Uploads** - File selection with progress tracking
- 🏷️ **Color-Coded File Types** - Visual file type identification with badges
- 📋 **Context Menus** - Right-click actions for files and folders
- ✏️ **Rename Operations** - Inline renaming with validation
- 🗑️ **Batch Delete** - Multi-select delete with confirmation dialogs

### User Experience
- 🖼️ **Google Drive-like Interface** - Familiar and intuitive design
- 🎨 **Liquid Glass Visuals** - Modern glassmorphism with floating orbs and advanced blur effects
- ✨ **Modern Visual Identity** - Glassmorphism cards with translucent effects for premium feel
- 📱 **Mobile-First Responsive** - Optimized for all screen sizes
- 🌙 **Dark Mode Support** - Full light/dark theme implementation
- ⚡ **Loading States** - Skeleton animations for better perceived performance
- 🔔 **Toast Notifications** - Non-intrusive feedback for all actions
- ♿ **Full Accessibility** - WCAG compliant with keyboard navigation

### Technical Features
- ☁️ **Real-time Operations** - Instant file/folder operations via Lambda
- 🔗 **Presigned S3 URLs** - Secure direct uploads to S3
- � **Upload Progress** - Real-time progress tracking with color coding
- 🔄 **Auto-refresh** - Automatic content updates after operations
- 🛡️ **Strict Security** - IAM roles, CORS, and security best practices
- 📈 **Scalable Architecture** - Serverless backend with global CDN

### Enhanced UI Components
- 🎨 **Modern Component Library** - Complete shadcn/ui integration
- 🏷️ **Smart File Badges** - Color-coded badges for 10+ file types
- 📏 **Improved Spacing** - Larger, more comfortable click targets
- 🎯 **Better Visibility** - Enhanced contrast and typography
- � **Loading Skeletons** - Smooth loading transitions
- ⚠️ **Error Alerts** - Contextual error messages with retry options

---

## 🧼 Best Practices & Architecture

### Frontend Architecture
- **Component-Based Design** - Modular, reusable React components
- **TypeScript First** - Full type safety with strict mode enabled
- **Custom Hooks** - Shared logic for authentication, file operations
- **State Management** - Context API for global state, local state for components
- **Error Boundaries** - Graceful error handling and user feedback

### UI/UX Best Practices
- **Accessibility First** - WCAG 2.1 AA compliance throughout
- **Progressive Enhancement** - Core functionality works without JavaScript
- **Mobile-First Design** - Responsive layouts starting from mobile
- **Performance Optimization** - Lazy loading, code splitting, image optimization
- **User Feedback** - Loading states, error messages, success confirmations

### Security Best Practices
- **JWT Token Management** - Secure token storage and automatic refresh
- **Input Validation** - Client and server-side validation for all inputs
- **CORS Configuration** - Proper cross-origin resource sharing setup
- **IAM Least Privilege** - Minimal permissions for all AWS resources
- **Environment Variables** - Sensitive data stored securely (git-ignored)

### Development Practices
- **Code Quality** - ESLint, Prettier for consistent code formatting
- **Type Safety** - Comprehensive TypeScript coverage
- **Component Documentation** - Inline documentation for all components
- **Git Workflow** - Feature branches, pull requests, code reviews
- **Testing Strategy** - Unit tests for components, integration tests for workflows

---

## 🤝 Acknowledgements

Inspired by the Google Drive UX. Built for modern, cloud-native deployment on AWS. Contributions and feedback welcome!

---

## 🔧 Troubleshooting

This section covers common issues and their solutions when working with the Drive Clone application.

### Installation Issues

#### Problem: `npm install` fails with peer dependency errors
**Solution:**
```bash
# Use legacy peer deps flag
npm install --legacy-peer-deps

# Or use npm 7+ with force
npm install --force
```

#### Problem: Node version incompatibility
**Solution:**
```bash
# Check your Node version
node --version  # Should be v20.x or higher

# Install correct version using nvm
nvm install 20
nvm use 20
```

### AWS Configuration Issues

#### Problem: AWS CLI not configured
**Symptoms:** CloudFormation deployment fails with credentials error
**Solution:**
```bash
# Configure AWS CLI
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output (json)

# Verify configuration
aws sts get-caller-identity
```

#### Problem: CloudFormation stack creation fails
**Common Causes:**
1. **Insufficient IAM permissions**
   - Ensure your AWS user has CloudFormation, S3, Lambda, API Gateway, Cognito, and DynamoDB permissions
   
2. **Resource name conflicts**
   - S3 bucket names must be globally unique
   - Change bucket names in template or use unique suffixes
   
3. **Region-specific issues**
   - Some services not available in all regions
   - Use us-east-1 for maximum compatibility

**Solution:**
```bash
# Check stack status
aws cloudformation describe-stack-events \
  --stack-name drive-clone-stack \
  --max-items 10

# Delete failed stack
aws cloudformation delete-stack --stack-name drive-clone-stack

# Wait for deletion
aws cloudformation wait stack-delete-complete --stack-name drive-clone-stack
```

### Application Runtime Issues

#### Problem: CORS errors in browser console
**Symptoms:** 
```
Access to fetch at 'https://api.../getFiles' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solution:**
1. Check API Gateway CORS configuration:
```bash
aws apigatewayv2 get-cors --api-id YOUR-API-ID
```

2. Update CORS settings to include your origin:
```json
{
  "allowOrigins": ["http://localhost:3000", "https://your-domain.com"],
  "allowMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  "allowHeaders": ["Content-Type", "Authorization"]
}
```

#### Problem: 401 Unauthorized errors
**Symptoms:** API requests fail with 401 status

**Possible Causes:**
1. **Token expired** - Refresh token or re-login
2. **Invalid token** - Check token format and issuer
3. **Wrong User Pool/Client ID** - Verify environment variables

**Solution:**
```typescript
// Check token expiration
const token = localStorage.getItem('accessToken');
if (token) {
  const decoded = JSON.parse(atob(token.split('.')[1]));
  const isExpired = decoded.exp * 1000 < Date.now();
  
  if (isExpired) {
    // Token expired, refresh or re-login
    console.log('Token expired, please login again');
  }
}
```

#### Problem: Environment variables not loading
**Symptoms:** `undefined` values for `process.env.REACT_APP_*`

**Solution:**
1. Ensure `.env.development` exists in project root
2. Restart development server after changing env file
3. Environment variables must start with `REACT_APP_`
```bash
# Correct
REACT_APP_API_URL=https://...

# Wrong (will not work)
API_URL=https://...
```

### File Upload Issues

#### Problem: File upload fails with 403 Forbidden
**Causes:**
1. **Presigned URL expired** - URLs valid for 15 minutes
2. **Wrong Content-Type** - Must match when generating URL
3. **S3 bucket permissions** - Check Lambda IAM role

**Solution:**
```typescript
// Ensure Content-Type matches
const { uploadUrl } = await getPresignedUrl(file.name, file.type);

await fetch(uploadUrl, {
  method: 'PUT',
  headers: {
    'Content-Type': file.type  // Must match!
  },
  body: file
});
```

#### Problem: Large file uploads fail or timeout
**Solution:**
```typescript
// Increase timeout for large files
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 min

try {
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    signal: controller.signal
  });
} finally {
  clearTimeout(timeoutId);
}
```

#### Problem: Upload progress not updating
**Solution:**
```typescript
// Use XMLHttpRequest for progress tracking (fetch doesn't support it)
const uploadWithProgress = (file, uploadUrl, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress((e.loaded / e.total) * 100);
      }
    });
    
    xhr.addEventListener('load', () => {
      xhr.status === 200 ? resolve() : reject();
    });
    
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
};
```

### Cognito Authentication Issues

#### Problem: Email verification code not received
**Solutions:**
1. Check spam/junk folder
2. Verify email in Cognito console is correct
3. Resend verification code:
```typescript
cognitoUser.resendConfirmationCode((err, result) => {
  if (err) {
    console.error('Resend failed:', err);
    return;
  }
  console.log('Code resent to', result.CodeDeliveryDetails.Destination);
});
```

#### Problem: Password doesn't meet requirements
**Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*)

**Validation Example:**
```typescript
const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  
  return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
};
```

### Lambda Function Issues

#### Problem: Lambda timeout errors
**Symptoms:** API returns 504 Gateway Timeout

**Solution:**
1. Increase Lambda timeout in CloudFormation:
```yaml
Timeout: 60  # Increase from 30 to 60 seconds
```

2. Optimize Lambda code:
   - Reduce S3 API calls
   - Use batch operations
   - Implement pagination

#### Problem: Lambda cold start latency
**Solution:**
1. Use Lambda provisioned concurrency (costs more)
2. Implement Lambda warming:
```bash
# CloudWatch Events rule to ping Lambda every 5 minutes
aws events put-rule \
  --name keep-lambda-warm \
  --schedule-expression "rate(5 minutes)"
```

### Debugging Tips

**Enable Debug Logging:**
```typescript
// In React app
if (process.env.NODE_ENV === 'development') {
  console.log('API URL:', process.env.REACT_APP_API_URL);
  console.log('User Pool ID:', process.env.REACT_APP_COGNITO_USER_POOL_ID);
}
```

**Check Lambda Logs:**
```bash
# View recent Lambda logs
aws logs tail /aws/lambda/drive-clone-getFiles --follow

# Search for errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/drive-clone-getFiles \
  --filter-pattern "ERROR"
```

**Test API Gateway Directly:**
```bash
# Get access token from browser localStorage
# Then test API endpoint
curl -H "Authorization: Bearer YOUR-TOKEN" \
  https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/getFiles
```

---

## ⚡ Performance Optimization

This section covers best practices and techniques for optimizing the Drive Clone application's performance.

### Frontend Optimizations

#### Code Splitting
```typescript
// Lazy load pages for smaller initial bundle
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Suspense>
  );
}
```

#### Image Optimization
```typescript
// Use modern image formats
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="..." loading="lazy" />
</picture>
```

#### Bundle Size Analysis
```bash
# Analyze bundle size
npm run build
npx source-map-explorer 'build/static/js/*.js'

# Check for large dependencies
npm install -g webpack-bundle-analyzer
webpack-bundle-analyzer build/static/js/*.map
```

**Optimization Targets:**
- Main bundle: < 1MB gzipped
- Individual chunks: < 500KB gzipped
- Total load time: < 3 seconds on 3G

#### Caching Strategy
```typescript
// Service worker for offline caching
// src/service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('drive-clone-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/static/css/main.css',
        '/static/js/main.js'
      ]);
    })
  );
});
```

### Backend Optimizations

#### Lambda Function Optimization

**1. Cold Start Reduction:**
```typescript
// Initialize AWS SDK clients outside handler
import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const handler = async (event) => {
  // Handler code uses existing s3Client
  // Client reused across invocations (warm starts)
};
```

**2. Memory Configuration:**
```yaml
# CloudFormation
LambdaFunction:
  Type: AWS::Lambda::Function
  Properties:
    MemorySize: 512  # Increase for better CPU performance
    # More memory = faster execution = lower cost
```

**3. Concurrent Execution Limits:**
```bash
# Reserve concurrent executions for critical functions
aws lambda put-function-concurrency \
  --function-name drive-clone-getFiles \
  --reserved-concurrent-executions 100
```

#### S3 Performance

**1. Multipart Upload for Large Files:**
```typescript
// For files > 100MB
import { Upload } from '@aws-sdk/lib-storage';

const upload = new Upload({
  client: s3Client,
  params: {
    Bucket: bucketName,
    Key: key,
    Body: file
  },
  partSize: 10 * 1024 * 1024, // 10MB parts
  queueSize: 4 // Upload 4 parts concurrently
});

upload.on('httpUploadProgress', (progress) => {
  console.log(`Uploaded ${progress.loaded} of ${progress.total} bytes`);
});

await upload.done();
```

**2. S3 Transfer Acceleration:**
```bash
# Enable Transfer Acceleration for faster uploads
aws s3api put-bucket-accelerate-configuration \
  --bucket drive-clone-files-bucket \
  --accelerate-configuration Status=Enabled
```

**3. S3 Request Optimization:**
```typescript
// Batch S3 operations when possible
const deleteObjects = async (keys) => {
  await s3Client.send(new DeleteObjectsCommand({
    Bucket: bucketName,
    Delete: {
      Objects: keys.map(key => ({ Key: key }))
    }
  }));
  // Deletes up to 1000 objects in single request
};
```

#### DynamoDB Performance

**1. Use Query Instead of Scan:**
```typescript
// Good: Query with partition key
const params = {
  TableName: 'drive-clone-metadata',
  KeyConditionExpression: 'userId = :userId',
  ExpressionAttributeValues: { ':userId': { S: userId } }
};

// Bad: Full table scan (slow and expensive)
const params = {
  TableName: 'drive-clone-metadata',
  FilterExpression: 'userId = :userId'
};
```

**2. Implement Pagination:**
```typescript
const queryWithPagination = async (userId, limit = 50) => {
  let items = [];
  let lastEvaluatedKey = null;
  
  do {
    const params = {
      TableName: 'drive-clone-metadata',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': { S: userId } },
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey
    };
    
    const result = await dynamoClient.send(new QueryCommand(params));
    items = items.concat(result.Items);
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);
  
  return items;
};
```

#### API Gateway Optimizations

**1. Enable Caching:**
```bash
# Enable API caching (reduces Lambda invocations)
aws apigatewayv2 update-stage \
  --api-id YOUR-API-ID \
  --stage-name prod \
  --route-settings '{"GET /getFiles":{"ThrottlingBurstLimit":500,"ThrottlingRateLimit":1000}}'
```

**2. Implement Throttling:**
```yaml
# CloudFormation
ApiGatewayStage:
  Properties:
    ThrottleSettings:
      BurstLimit: 5000
      RateLimit: 10000
```

### CloudFront Optimizations

**1. Cache Control Headers:**
```typescript
// Lambda sets cache headers
return {
  statusCode: 200,
  headers: {
    'Cache-Control': 'public, max-age=31536000, immutable', // 1 year for static assets
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
};
```

**2. Compression:**
```bash
# Enable Brotli and Gzip compression
aws cloudfront update-distribution \
  --id YOUR-DISTRIBUTION-ID \
  --distribution-config file://distribution-config.json
  # Set CompressedContentTypes: ['text/html', 'text/css', 'application/javascript']
```

**3. Origin Shield:**
```bash
# Add Origin Shield for better cache hit ratio
aws cloudfront create-origin-shield \
  --distribution-id YOUR-DISTRIBUTION-ID \
  --origin-shield-region us-east-1
```

### Monitoring Performance

**1. CloudWatch Metrics:**
```bash
# Monitor Lambda performance
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=drive-clone-getFiles \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Average,Maximum
```

**2. X-Ray Tracing:**
```yaml
# Enable X-Ray for Lambda
LambdaFunction:
  Properties:
    TracingConfig:
      Mode: Active
```

**3. Real User Monitoring (RUM):**
```typescript
// Add performance monitoring to React app
useEffect(() => {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('Performance:', entry.name, entry.duration);
      // Send to analytics service
    }
  });
  
  observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
}, []);
```

---

## 📊 Monitoring & Logging

This section covers logging, monitoring, and observability best practices for production deployments.

### CloudWatch Logs

**Lambda Function Logging:**
```typescript
// Structured logging in Lambda
export const handler = async (event) => {
  const requestId = event.requestContext.requestId;
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  
  console.log(JSON.stringify({
    level: 'INFO',
    requestId,
    userId,
    action: 'getFiles',
    timestamp: new Date().toISOString()
  }));
  
  try {
    // Operation
    const result = await performOperation();
    
    console.log(JSON.stringify({
      level: 'INFO',
      requestId,
      userId,
      action: 'getFiles',
      status: 'success',
      itemCount: result.length
    }));
    
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error) {
    console.error(JSON.stringify({
      level: 'ERROR',
      requestId,
      userId,
      action: 'getFiles',
      error: error.message,
      stack: error.stack
    }));
    
    return { statusCode: 500, body: 'Internal error' };
  }
};
```

**Query Logs:**
```bash
# Search for errors in last hour
aws logs filter-log-events \
  --log-group-name /aws/lambda/drive-clone-getFiles \
  --start-time $(date -u -d '1 hour ago' +%s)000 \
  --filter-pattern '"ERROR"'

# Get logs for specific request
aws logs filter-log-events \
  --log-group-name /aws/lambda/drive-clone-getFiles \
  --filter-pattern '"requestId":"abc-123"'
```

### CloudWatch Metrics

**Custom Metrics:**
```typescript
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

const cloudwatch = new CloudWatchClient({ region: process.env.AWS_REGION });

const publishMetric = async (metricName, value, unit = 'Count') => {
  await cloudwatch.send(new PutMetricDataCommand({
    Namespace: 'DriveClone',
    MetricData: [{
      MetricName: metricName,
      Value: value,
      Unit: unit,
      Timestamp: new Date()
    }]
  }));
};

// Usage in Lambda
await publishMetric('FileUploads', 1, 'Count');
await publishMetric('UploadSize', fileSizeBytes, 'Bytes');
```

**Create Alarms:**
```bash
# Alert on high error rate
aws cloudwatch put-metric-alarm \
  --alarm-name drive-clone-high-errors \
  --alarm-description "Alert when error rate exceeds 5%" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=drive-clone-getFiles
```

### AWS X-Ray Tracing

**Enable X-Ray:**
```yaml
# CloudFormation
LambdaFunction:
  Properties:
    TracingConfig:
      Mode: Active
```

**View Traces:**
```bash
# Get service map
aws xray get-service-graph \
  --start-time $(date -u -d '1 hour ago' +%s) \
  --end-time $(date -u +%s)

# Get trace details
aws xray batch-get-traces \
  --trace-ids trace-id-1 trace-id-2
```

### Frontend Monitoring

**Error Tracking:**
```typescript
// Error boundary in React
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log to monitoring service
    console.error('React Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    // Send to external service (Sentry, Datadog, etc.)
    // logErrorToService(error, errorInfo);
  }
  
  render() {
    return this.props.children;
  }
}
```

**Performance Monitoring:**
```typescript
// Core Web Vitals tracking
import { getCLS, getFID, getLCP } from 'web-vitals';

getCLS(console.log); // Cumulative Layout Shift
getFID(console.log); // First Input Delay
getLCP(console.log); // Largest Contentful Paint
```

### Health Checks

**API Health Endpoint:**
```typescript
// Lambda health check
export const handler = async () => {
  try {
    // Check S3 connectivity
    await s3Client.send(new HeadBucketCommand({
      Bucket: process.env.S3_BUCKET_NAME
    }));
    
    // Check DynamoDB connectivity
    await dynamoClient.send(new DescribeTableCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME
    }));
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    return {
      statusCode: 503,
      body: JSON.stringify({
        status: 'unhealthy',
        error: error.message
      })
    };
  }
};
```

**Automated Health Monitoring:**
```bash
# CloudWatch Synthetics Canary
aws synthetics create-canary \
  --name drive-clone-health-check \
  --artifact-s3-location "s3://my-canary-results/" \
  --execution-role-arn "arn:aws:iam::ACCOUNT:role/CanaryRole" \
  --schedule Expression="rate(5 minutes)" \
  --runtime-version syn-nodejs-puppeteer-3.9 \
  --handler-name "index.handler" \
  --code S3Bucket=my-bucket,S3Key=canary.zip
```

---

## 🚀 CI/CD & GitHub Actions Workflows

This project uses GitHub Actions for automated continuous integration, deployment, and monitoring. All workflows are configured to use GitHub secrets for sensitive environment variables (AWS Cognito configuration).

### 🔧 Core Workflows

#### **Build & Test** (`build-test.yml`)
**Triggers:** Push to `master`/`dev`, Pull requests to `master`  
**Purpose:** Validates code quality and functionality

- ✅ **ESLint Analysis** - Code style and quality checks (max 100 warnings)
- 🔍 **TypeScript Check** - Static type analysis with `tsc --noEmit`
- 🧪 **Unit Tests** - Jest test suite with coverage reporting
- 📊 **Coverage Upload** - Codecov integration for coverage tracking
- 🏗️ **Production Build** - Validates the app builds successfully

```yaml
env:
  REACT_APP_USER_POOL_ID: ${{ secrets.REACT_APP_USER_POOL_ID }}
  REACT_APP_CLIENT_ID: ${{ secrets.REACT_APP_CLIENT_ID }}
```

#### **CodeQL Security Analysis** (`codeql-analysis.yml`)
**Triggers:** Push to `master`/`dev`, Pull requests, Weekly schedule  
**Purpose:** Automated security vulnerability scanning

- 🔒 **Static Analysis** - CodeQL for JavaScript/TypeScript
- 🛡️ **Security Scanning** - Identifies potential vulnerabilities
- 📅 **Scheduled Scans** - Weekly security audits (Sundays 1:30 AM)
- 📋 **Security Alerts** - Automatic issue creation for findings

#### **Performance Analysis** (`performance.yml`)
**Triggers:** Pull requests to `master`, Manual dispatch  
**Purpose:** Performance monitoring and optimization

- 📦 **Bundle Size Analysis** - Tracks JavaScript bundle sizes
- 🚨 **Size Limit Enforcement** - Fails if bundles exceed thresholds:
  - Main bundle: 1MB limit
  - Individual chunks: 500KB limit
- 🏠 **Lighthouse CI** - Automated performance, accessibility, and SEO audits
- 📊 **Performance Metrics** - Core Web Vitals tracking
- 💬 **PR Comments** - Automatic performance reports on pull requests

### 🐳 Deployment Workflows

#### **AWS CI/CD Pipeline** 
**Platform:** AWS CodePipeline + CodeBuild + S3  
**Purpose:** Automated deployment to AWS infrastructure

- 🚀 **CodePipeline** - Orchestrates the entire CI/CD workflow
- 🏗️ **CodeBuild** - Compiles and builds the React application 
- 📦 **S3 Deployment** - Deploys static assets to S3 with CloudFront CDN
- 🔄 **Automated Triggers** - Triggered by repository changes
- 🎯 **Multi-Environment** - Support for staging and production deployments

**Deployment Flow:** GitHub → CodePipeline → CodeBuild → S3 + CloudFront

#### **Docker Image Publishing** (`docker-publish.yml`)
**Triggers:** Push to `master`, Manual dispatch  
**Purpose:** Builds and publishes containerized application

- 🏗️ **React Build** - Compiles optimized production build
- 🐳 **Docker Image** - Creates containerized app with nginx
- 📦 **GitHub Packages** - Publishes to `ghcr.io` container registry
- 🏷️ **Image Tagging** - Tags with commit SHA and `latest`
- 🔐 **Registry Authentication** - Secure publishing to GitHub Container Registry

**Published Image:** `ghcr.io/SanjeevGO123/drive-clone:latest`

#### **Release Management** (`release.yml`)
**Triggers:** Git tags (`v*.*.*`), Manual dispatch  
**Purpose:** Automated release creation and asset publishing

- 📝 **Release Notes** - Auto-generated from git commits and PRs
- 📦 **Build Artifacts** - Optimized production build assets
- 🏷️ **Asset Upload** - Release binaries and source archives
- 📋 **Changelog** - Formatted release documentation

### 📊 Monitoring Workflows

#### **Health Check** (`health-check.yml`)
**Triggers:** Every 6 hours, Manual dispatch  
**Purpose:** Production application monitoring

- 🏥 **Uptime Monitoring** - HTTP health checks for production site
- 🚨 **Failure Alerts** - Automatic issue creation on downtime
- 📈 **Status Tracking** - Continuous availability monitoring
- 🔔 **Incident Response** - Immediate notification on failures

### 🔐 Required GitHub Secrets

The following secrets must be configured in your GitHub repository:

```bash
# AWS Cognito Configuration (Required for all workflows)
REACT_APP_USER_POOL_ID=your_cognito_user_pool_id
REACT_APP_CLIENT_ID=your_cognito_app_client_id

# Optional: Production monitoring
PRODUCTION_URL=https://your-production-site.com
```

### 🎯 Workflow Features

#### **Dependency Management**
- 🔧 **Legacy Peer Deps** - Uses `--legacy-peer-deps` for React 18 compatibility
- 📦 **NPM Cache** - Speeds up builds with dependency caching
- 🔄 **Auto-retry** - Robust handling of flaky dependency installations

#### **Error Handling & Reporting**
- 🚨 **Build Failures** - Clear error reporting with actionable feedback
- 📊 **Test Reports** - Detailed coverage and test result summaries
- 🔍 **Debug Information** - Comprehensive logging for troubleshooting

#### **Performance Optimizations**
- ⚡ **Parallel Jobs** - Concurrent execution where possible
- 💾 **Caching Strategy** - Node modules and build artifacts cached
- 🎯 **Selective Triggers** - Workflows run only when necessary

#### **Security Best Practices**
- 🔐 **Minimal Permissions** - Least-privilege access for all workflows
- 🛡️ **Secret Management** - Secure handling of sensitive environment variables
- 🔒 **Registry Security** - Signed container images and secure publishing

### 📋 Status Badges

Add these badges to track your project's health:

```markdown
![Build & Test](https://github.com/<username>/drive-clone/workflows/Build%20&%20Test/badge.svg)
![CodeQL](https://github.com/<username>/drive-clone/workflows/CodeQL%20Analysis/badge.svg)
![Docker](https://github.com/<username>/drive-clone/workflows/Build%20and%20Publish%20Docker%20Image/badge.svg)
```

### 🚀 Getting Started with CI/CD

1. **Fork this repository** to your GitHub account
2. **Configure secrets** in Settings → Secrets and variables → Actions
3. **Push to master** or create a pull request to trigger workflows
4. **Monitor workflow runs** in the Actions tab
5. **Review security alerts** in the Security tab for CodeQL findings

---
## 📜 License
This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

