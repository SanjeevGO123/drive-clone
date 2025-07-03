# Drive Clone - AWS System Architecture Technical Specification

## Overview
This document provides a comprehensive technical specification for the Drive Clone application, detailing the AWS services, API endpoints, data flows, and security architecture.

## Architecture Components

### 1. Frontend Layer
- **Technology**: React 18 with TypeScript
- **UI Framework**: shadcn/ui components with TailwindCSS
- **Features**: 
  - Liquid glass background with glassmorphism effects
  - Dark mode support
  - Color-coded file types
  - Responsive design
  - Real-time upload progress
  - File preview capabilities

### 2. Content Delivery Network (CDN)
- **Service**: Amazon CloudFront
- **Purpose**: Global content delivery and caching
- **Configuration**:
  - Origin: S3 Static Website
  - SSL/TLS termination
  - Edge locations worldwide
  - Cache behaviors optimized for static assets

### 3. API Gateway
- **Service**: AWS API Gateway (REST API)
- **Authentication**: JWT token validation via Cognito
- **Features**:
  - CORS configuration
  - Request/response transformation
  - Rate limiting and throttling
  - API documentation

### 4. Compute Layer
- **Service**: AWS Lambda Functions
- **Runtime**: Node.js 22.x
- **Functions**:
  - `getFiles.ts`: List user files and folders
  - `getpresignedURL.ts`: Generate presigned URLs for uploads
  - `createFolder.ts`: Create new folders
  - `deleteFile.ts`: Delete individual files
  - `deleteFolder.ts`: Delete folders and contents
  - `renameFile.ts`: Rename files

### 5. Storage Layer
- **Primary Storage**: Amazon S3
  - User-scoped prefixes (user123/folder/file.pdf)
  - Encryption at rest
  - Versioning enabled
  - Lifecycle policies
- **Metadata Storage**: Amazon DynamoDB
  - File metadata and user activity logs
  - Serverless NoSQL database
  - Auto-scaling enabled

### 6. Authentication & Authorization
- **Service**: Amazon Cognito
- **Components**:
  - User Pools for user management
  - Identity Pools for AWS credentials
  - JWT token issuance
  - Password policies enforcement

## API Endpoints Specification

### GET /getFiles
- **Purpose**: Retrieve list of files and folders for authenticated user
- **Authentication**: JWT Bearer token required
- **Parameters**:
  - `prefix` (optional): Folder path to list contents from
- **Response**: JSON object containing folders and files arrays
- **AWS Services**: S3 ListObjectsV2Command
- **Security**: User-scoped access via JWT user ID

### POST /generatepresignedURL
- **Purpose**: Generate presigned URL for direct S3 upload
- **Authentication**: JWT Bearer token required
- **Request Body**:
  ```json
  {
    "fileName": "document.pdf",
    "fileType": "application/pdf",
    "prefix": "documents/"
  }
  ```
- **Response**: Presigned upload URL and file key
- **AWS Services**: S3 PutObjectCommand, DynamoDB PutItem
- **Security**: URL expires after 15 minutes

### POST /createFolder
- **Purpose**: Create new folder in user's storage
- **Authentication**: JWT Bearer token required
- **Request Body**:
  ```json
  {
    "folderName": "new-folder",
    "prefix": "documents/"
  }
  ```
- **Response**: Success message and folder path
- **AWS Services**: S3 PutObjectCommand
- **Security**: User-scoped folder creation

### DELETE /deleteFile
- **Purpose**: Delete specific file from user's storage
- **Authentication**: JWT Bearer token required
- **Request Body**:
  ```json
  {
    "key": "user123/documents/file-to-delete.pdf"
  }
  ```
- **Response**: Success confirmation
- **AWS Services**: S3 DeleteObjectCommand, DynamoDB DeleteItem
- **Security**: User ownership verification

### DELETE /deleteFolder
- **Purpose**: Delete folder and all its contents
- **Authentication**: JWT Bearer token required
- **Request Body**:
  ```json
  {
    "folderPrefix": "user123/documents/folder-to-delete/"
  }
  ```
- **Response**: Success message and deleted items count
- **AWS Services**: S3 ListObjectsV2, DeleteObjectsCommand
- **Security**: Recursive deletion with user scope validation

### POST /renameFile
- **Purpose**: Rename file in user's storage
- **Authentication**: JWT Bearer token required
- **Request Body**:
  ```json
  {
    "oldKey": "user123/documents/old-name.pdf",
    "newKey": "user123/documents/new-name.pdf"
  }
  ```
- **Response**: Success message and new file key
- **AWS Services**: S3 CopyObjectCommand, DeleteObjectCommand
- **Security**: User ownership verification for both keys

## User Journey Flow

### 1. Initial Access
1. User navigates to application URL
2. CloudFront serves React application from S3
3. Liquid glass UI loads with login/signup forms
4. Authentication state checked

### 2. User Registration
1. User enters email and password
2. Frontend validates password strength in real-time
3. Cognito User Pool creates user account
4. Verification email sent to user
5. User clicks verification link
6. Account activated in Cognito

### 3. User Login
1. User enters credentials
2. Cognito validates credentials
3. JWT token issued and stored in frontend
4. User redirected to dashboard

### 4. Dashboard Initialization
1. Frontend calls GET /getFiles with JWT token
2. API Gateway validates JWT token
3. Lambda function extracts user ID from token
4. S3 ListObjects operation with user prefix
5. Files and folders returned to frontend
6. UI renders file grid with color-coded types

### 5. File Upload Process
1. User selects file(s) for upload
2. Frontend calls POST /generatepresignedURL
3. Lambda generates presigned URL with user prefix
4. Direct upload to S3 using presigned URL
5. Upload progress tracked in frontend
6. Metadata stored in DynamoDB
7. File list refreshed

### 6. File Operations
1. User performs operation (rename, delete, create folder)
2. Appropriate API endpoint called with JWT
3. Lambda function validates user permissions
4. S3 operation executed
5. DynamoDB metadata updated
6. Frontend UI updated with changes

### 7. File Preview
1. User clicks on file
2. Frontend generates S3 presigned URL for download
3. File content fetched and displayed in modal
4. Preview supports various file types

### 8. Logout
1. User clicks logout button
2. JWT token cleared from localStorage
3. User redirected to login page
4. Session terminated

## Data Flow Architecture

### Authentication Flow
```
User → React App → Cognito User Pool → JWT Token → API Gateway → Lambda
```

### File Upload Flow
```
User → React App → API Gateway → Lambda → Presigned URL → Direct S3 Upload → DynamoDB Metadata
```

### File Retrieval Flow
```
User → React App → API Gateway → Lambda → S3 ListObjects → Frontend Rendering
```

### File Operations Flow
```
User → React App → API Gateway → Lambda → S3 Operations → DynamoDB Updates → UI Refresh
```

## Security Architecture

### Authentication & Authorization
- **Multi-factor Authentication**: Supported via Cognito
- **Password Policies**: 8+ characters, mixed case, numbers, symbols
- **JWT Tokens**: Short-lived with refresh token capability
- **Session Management**: Secure token storage and rotation

### Data Protection
- **Encryption in Transit**: HTTPS/TLS 1.3
- **Encryption at Rest**: S3 server-side encryption
- **User Data Isolation**: User-scoped S3 prefixes
- **Presigned URLs**: Time-limited access to resources

### Access Control
- **Principle of Least Privilege**: IAM roles with minimal permissions
- **Resource-based Policies**: S3 bucket policies
- **API Gateway Authorizers**: JWT token validation
- **Lambda Execution Roles**: Service-specific permissions

### Monitoring & Compliance
- **CloudTrail**: API audit logging
- **CloudWatch**: Monitoring and alerting
- **X-Ray**: Distributed tracing
- **VPC Endpoints**: Private connectivity options

## Infrastructure as Code

### AWS Services Used
- **Amazon S3**: Static website hosting and file storage
- **Amazon CloudFront**: Global CDN
- **Amazon API Gateway**: REST API management
- **AWS Lambda**: Serverless compute
- **Amazon Cognito**: User authentication and authorization
- **Amazon DynamoDB**: Metadata storage
- **AWS CloudWatch**: Monitoring and logging
- **AWS CloudTrail**: Audit logging
- **AWS X-Ray**: Distributed tracing

### Deployment Pipeline
- **Build**: AWS CodeBuild with Node.js 22
- **Deploy**: AWS CodeDeploy or S3 sync
- **CI/CD**: GitHub Actions or AWS CodePipeline
- **Environment Management**: Development, staging, production

## Performance Optimization

### Frontend Optimizations
- **Code Splitting**: React lazy loading
- **Bundle Optimization**: Webpack configuration
- **Image Optimization**: WebP format with fallbacks
- **Caching Strategy**: Service worker implementation

### Backend Optimizations
- **Lambda Cold Start**: Provisioned concurrency
- **DynamoDB Performance**: Optimal indexing strategy
- **S3 Performance**: Multipart uploads for large files
- **API Gateway Caching**: Response caching configuration

## Scalability Considerations

### Horizontal Scaling
- **Lambda Concurrency**: Auto-scaling based on demand
- **DynamoDB Scaling**: On-demand billing mode
- **S3 Scaling**: Unlimited storage capacity
- **CloudFront Scaling**: Global edge locations

### Vertical Scaling
- **Lambda Memory**: Optimized based on workload
- **DynamoDB Throughput**: Adjustable read/write capacity
- **API Gateway Limits**: Configurable throttling

## Cost Optimization

### AWS Cost Management
- **Lambda Pricing**: Pay-per-execution model
- **S3 Storage Classes**: Intelligent tiering
- **CloudFront Pricing**: Regional edge cache optimization
- **DynamoDB Pricing**: On-demand vs provisioned capacity

### Resource Optimization
- **Lambda Function Optimization**: Right-sized memory allocation
- **S3 Lifecycle Policies**: Automated data archiving
- **CloudWatch Logs**: Retention policy configuration
- **API Gateway Optimization**: Efficient request routing

## Disaster Recovery

### Backup Strategy
- **S3 Versioning**: File version history
- **Cross-region Replication**: S3 backup to different region
- **DynamoDB Backups**: Point-in-time recovery
- **Infrastructure Backup**: CloudFormation templates

### Recovery Procedures
- **RTO (Recovery Time Objective)**: < 30 minutes
- **RPO (Recovery Point Objective)**: < 5 minutes
- **Multi-region Deployment**: Active-passive setup
- **Automated Failover**: Route 53 health checks

## Compliance & Governance

### Data Privacy
- **GDPR Compliance**: User data deletion capabilities
- **Data Residency**: Regional S3 bucket selection
- **Access Logging**: Comprehensive audit trail
- **Data Retention**: Configurable retention policies

### Security Compliance
- **SOC 2**: AWS service compliance
- **ISO 27001**: Security management standards
- **HIPAA**: Healthcare data protection (if applicable)
- **PCI DSS**: Payment card industry standards (if applicable)

## Monitoring & Alerting

### Key Metrics
- **Application Performance**: Response time, error rates
- **User Engagement**: Active users, session duration
- **System Health**: Lambda errors, API Gateway throttling
- **Cost Metrics**: Daily/monthly spending trends

### Alert Configuration
- **High Error Rates**: > 5% within 5 minutes
- **Performance Degradation**: > 3 second response time
- **Cost Anomalies**: Unusual spending patterns
- **Security Events**: Failed authentication attempts

## Future Enhancements

### Feature Roadmap
- **File Sharing**: Public/private sharing links
- **Collaboration**: Real-time collaborative editing
- **Version Control**: File versioning and history
- **Advanced Search**: Full-text search capabilities
- **Mobile App**: React Native implementation

### Technical Improvements
- **GraphQL API**: Replace REST with GraphQL
- **Real-time Updates**: WebSocket integration
- **Machine Learning**: Intelligent file categorization
- **Edge Computing**: Lambda@Edge for global performance
- **Microservices**: Service decomposition for scalability

This comprehensive system architecture provides a robust, scalable, and secure foundation for the Drive Clone application, leveraging AWS services to deliver a modern cloud storage solution.
