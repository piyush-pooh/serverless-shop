# Serverless Shop

A serverless e-commerce demo built using AWS services. This project showcases a static front-end integrated with AWS Lambda, API Gateway, and DynamoDB for backend operations.  

---

## Features

- Display products and orders dynamically from DynamoDB.  
- Place orders and manage stock via API calls.  
- Serverless architecture: No dedicated servers required.  
- CI/CD pipeline setup using GitHub + AWS CodePipeline + S3 + CloudFront.  
- CORS-enabled API Gateway to allow browser access.

---

## AWS Services Used

- **S3**: Host static frontend files.  
- **CloudFront**: CDN for faster site delivery.  
- **API Gateway**: Expose REST APIs for Products and Orders.  
- **Lambda**: Serverless functions for backend logic.  
- **DynamoDB**: Store product and order data.  
- **CodePipeline**: Automate deployments from GitHub to S3/CloudFront.  

---

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/piyush-pooh/serverless-shop.git
