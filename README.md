# Serverless Shop

A fully serverless e-commerce demo application using **AWS S3, CloudFront, Lambda, API Gateway, and DynamoDB**.

## Features
- View products stored in DynamoDB.
- Place orders via a serverless backend (Lambda + API Gateway).
- Static frontend hosted on S3 and distributed via CloudFront.
- CI/CD enabled with GitHub and AWS CodePipeline (manual trigger currently).

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** AWS Lambda (Python)
- **Database:** DynamoDB
- **Hosting:** S3 + CloudFront
- **CI/CD:** AWS CodePipeline

## Setup
1. Clone the repository:
   ```bash
  git clone <repo-url>
``
2. Deploy static frontend to **S3**.
3. Configure **API Gateway** and **Lambda** functions.
4. Ensure **DynamoDB** tables `Products` and `Order` exist.
5. Update frontend `js/main.js` with your API endpoints.

## Usage

* Open the site via your **CloudFront URL** or S3 website endpoint.
* Fetch products and place orders using the frontend.

## Notes

* CORS must be enabled on API Gateway for cross-origin requests.
* CI/CD is automated but currently requires manual pipeline release.
