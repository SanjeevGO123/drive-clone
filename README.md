# 🚀 Drive Clone – Google Drive-Inspired Cloud Storage Platform

A modern, full-stack, AWS-native cloud storage solution inspired by Google Drive. Built with a visually rich React frontend and a secure, scalable serverless backend leveraging AWS Lambda, S3, DynamoDB, API Gateway, and CloudFront.

---

## 🧰 Technology Stack

### Frontend
- **React** (TypeScript)
- **TailwindCSS** for rapid, responsive UI
- **AWS Cognito** (via `amazon-cognito-identity-js`) for authentication
- Hosted on **S3** with **CloudFront CDN**

### Backend
- **Serverless AWS Lambda Functions** (Node.js 22.x):
  - `getFiles.ts` – List user files and folders
  - `getpresignedURL.ts` – Generate presigned S3 upload URLs
  - `createFolder.ts` – Create new folders
  - `deleteFile.ts` – Delete files
  - `deleteFolder.ts` – Delete folders and contents
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

- 🔐 Secure Cognito login/signup
- 📁 Hierarchical folder navigation with breadcrumbs
- 📤 Drag-and-drop or multi-select file uploads
- 🖼️ Google Drive-like, responsive UI (Tailwind)
- ☁️ Real-time file/folder fetch via Lambda
- 🔗 Secure presigned S3 URLs for direct uploads
- 📱 Mobile-first, fully responsive dashboard
- 🛡️ Strict IAM, CORS, and security best practices

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
