# 🚀 Drive Clone – Google Drive-Inspired Cloud Storage Platform

A modern, full-stack, AWS-native cloud storage solution inspired by Google Drive. Built with a visually rich React frontend using **shadcn/ui** components and a secure, scalable serverless backend leveraging AWS Lambda, S3, DynamoDB, API Gateway, and CloudFront.

---

## 🧰 Technology Stack

### Frontend
- **React** (TypeScript)
- **shadcn/ui** - Modern, accessible component library
- **TailwindCSS** for rapid, responsive UI
- **Lucide React** for consistent iconography
- **AWS Cognito** (via `amazon-cognito-identity-js`) for authentication
- Hosted on **S3** with **CloudFront CDN**

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

## 🔒 Authentication & Security
- **AWS Cognito User Pools** for sign-up, login, and JWT issuance
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

This project uses **shadcn/ui** for consistent, accessible, and customizable components:

### Key Components Used:
- **Button** - Primary actions, navigation, form submissions
- **Input** - Text inputs with proper focus states and validation
- **Dialog** - Modal dialogs for confirmations and forms
- **DropdownMenu** - Context menus for file/folder actions
- **Breadcrumb** - Navigation breadcrumbs with proper accessibility
- **Toast** - Non-intrusive notifications for user feedback
- **Card** - Content containers with consistent styling

### Theming:
- CSS custom properties for light/dark mode support
- Tailwind CSS for utility-first styling
- Consistent color palette with semantic naming
- Responsive design with mobile-first approach

### Accessibility Features:
- ARIA labels and descriptions
- Keyboard navigation support
- Focus management for modals and dropdowns
- Screen reader compatibility
- High contrast mode support

---

## 📁 Project Structure

```
project-root/
├── public/
├── src/
│   ├── pages/
│   ├── components/
│   ├── aws/
│   ├── App.tsx
│   └── ...
├── api/                # Lambda handlers
│   ├── getFiles.ts
│   ├── getpresignedURL.ts
│   ├── createFolder.ts
│   ├── deleteFile.ts
│   └── deleteFolder.ts
│   └── renameFile.ts
├── package.json
├── README.md
└── ...
```

> **Note:** `.env.development` contains sensitive config (API URLs, Cognito IDs) and is git-ignored. Populate this file manually per environment.

---

## 🛠️ Local Development

### Prerequisites
- Node.js ≥ 20
- AWS Account & CLI configured

### Frontend Setup
```bash
npm install
```
Create `.env.development` in the root with:
```env
REACT_APP_API_URL=https://your-api-gateway-url
REACT_APP_COGNITO_USER_POOL_ID=your_cognito_user_pool_id
REACT_APP_COGNITO_CLIENT_ID=your_cognito_app_client_id
```
Run locally:
```bash
npm start
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

- 🔐 Secure Cognito login/signup with modern UI
- 📁 Hierarchical folder navigation with shadcn/ui breadcrumbs
- 📤 Multi-select file uploads with progress tracking
- 🖼️ Google Drive-like, responsive UI using shadcn/ui components
- ☁️ Real-time file/folder operations via Lambda functions
- 🔗 Secure presigned S3 URLs for direct uploads
- 📱 Mobile-first, fully responsive dashboard
- 🛡️ Strict IAM, CORS, and security best practices
- ♿ Full accessibility support with ARIA labels and keyboard navigation
- 🎨 Modern component library with consistent theming
- 🔔 Toast notifications for user feedback
- 📋 Context menus for file operations
- 🌙 Dark mode support via CSS custom properties

---

## 🧼 Best Practices

- Store sensitive data in `.env.development` (git-ignored)
- Enable CORS and secure headers in API Gateway
- Use IAM roles to restrict Lambda, S3, and DynamoDB access
- Enable CloudWatch logs for monitoring and troubleshooting
- Parameterize infrastructure (e.g., S3 bucket names) for portability

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
