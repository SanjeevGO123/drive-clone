# 🚀 Drive Clone – Google Drive-Inspired Cloud Storage Platform

A modern, full-stack, AWS-native cloud storage solution inspired by Google Drive. Built with a visually rich React frontend using **shadcn/ui** components and a secure, scalable serverless backend leveraging AWS Lambda, S3, DynamoDB, API Gateway, and CloudFront.

✨ **Latest Update:** Enhanced with cutting-edge liquid glass backgrounds, glassmorphism UI elements, strong password requirements with real-time validation, and fully migrated to shadcn/ui with enhanced accessibility, modern design system, color-coded file types, loading states, and improved user experience.

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
## Architecture

### AWS System Design Architecture
![AWS Architecture](./screenshots/system-design.png)
*High-level AWS system architecture showing services and data flow*

### AWS Deployment Pipeline
![AWS Deployment Pipeline](./screenshots/deployment-design.png)
*Visual overview of the AWS CI/CD deployment pipeline and integration*

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

### Backend Setup & Deployment
- Each file in `api/` is a Lambda handler. Deploy each handler individually to AWS Lambda using the AWS Console, AWS CLI, or your preferred deployment tool:

```bash
# Example AWS CLI command to deploy a Lambda function
aws lambda create-function --function-name your-function-name --runtime nodejs22.x --role your-execution-role-arn --handler handler-file-name.handler --zip-file fileb://path-to-your-zip-file
```

---

## 🚀 Production Deployment

- **Frontend:**
  ```bash
  npm run build
  aws s3 sync build/ s3://your-frontend-bucket
  ```
- **Backend:**
  - Deploy Lambda handlers individually as AWS Lambda functions
- **CDN:**
  - Configure CloudFront with S3 as origin for frontend, API Gateway for backend
- **API Gateway:**
  - Set up routes for each Lambda, protected by Cognito JWT authorizer
- **Cognito:**
  - Create User Pool & App Client, configure domain and sign-in UI
- **S3:**
  - Create bucket, set permissions, enable CORS
- **DynamoDB:**
  - (Optional) Create table for file metadata
- **CI/CD:**
  - Use AWS CodePipeline or GitHub Actions for automation

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

## 🐳 Docker Usage

You can build and run the app in a container using Docker:

```powershell
# Build the Docker image
docker build -t drive-clone .

# Run the container (serves on http://localhost:8080)
docker run -p 8080:80 drive-clone
```

The app will be available at [http://localhost:8080](http://localhost:8080).
