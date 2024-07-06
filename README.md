
# Locket clone API
![](https://ineqe.com/wp-content/uploads/2022/02/locket_app_icon-1024x1024.png)
## Description
Locket Clone API is an open-source project that replicates the server of the Locket application, a platform for instant photo sharing among friends and family. This project aims to help developers learn and understand how to build a modern server-side application using Node.js and Express.

The server provides the necessary APIs to manage users, authentication, uploading, and retrieving photos. It uses MongoDB as the main database to store user information and feed data and uses AWS S3 as an image storage. Security features such as password hashing and JWT authentication are also integrated to ensure data safety.

## Getting Started
### Dependencies
- **Node.js**: Version 14.x or higher is required.
- **MongoDB**: A NoSQL database to store user and feed data.
- **AWS S3**: Amazon Web Services S3 bucket for storing images.
- **dotenv**: To manage environment variables.
- **express**: For building the server and handling requests.
- **mongoose**: To interact with MongoDB.
- **jsonwebtoken**: For authentication using JWT.
- **bcryptjs**: For password hashing.
- **multer**: For handling file uploads.
- **aws-sdk**: To interact with AWS services.
- **helmet**: For security headers.
- **compression**: To compress response bodies.
- **jimp**: For image processing.
- **morgan**: For HTTP request logging.
- **nodemailer**: For sending emails.
- **express-validator**: For validating request data.
- **chokidar**: For watching file changes during development.
### Installing
**1. Clone the repository:** 
```
git clone https://github.com/ghuysu/locket-clone.
```

**2. Install the necessary packages:**
```
npm install --save [packages].
```

**3. Create a `.env` file in the root directory of the project and configure the required environment variables:**

```env
# Development
DEV_APP_PORT=9876
DEV_DB_USERNAME=<your_mongodb_username>
DEV_DB_PASSWORD=<your_mongodb_password>
DEV_DB_COLLECTION=Locket

# Production
PROD_APP_PORT=9876
PROD_DB_USERNAME=<your_mongodb_username>
PROD_DB_PASSWORD=<your_mongodb_password>
PROD_DB_COLLECTION=Locket

# Environment
NODE_ENV=DEV

# Email Configuration
EMAIL_NAME=<your_email>
EMAIL_PASSWORD=<your_email_password>

# AWS S3 Configuration
AWSS3_ACCESS_KEY=<your_aws_access_key>
AWSS3_SECRET_ACCESS_KEY=<your_aws_secret_access_key>
BUCKET_NAME=locket
AWSS3_REGION=ap-southeast-1

# API Key
API_KEY=$2a$10$KW.0rlbLZX8DTXXvOzq/muwLLfqXfnDQxqQZ9WoUfa/XsmuLb0EqS

# JWT Secret Key
JWT_SECRET_KEY=<your_jwt_secret_key>
```

### Running the Server
- **Start the server in development mode:**
    ```
    #Change NODE_ENV=DEV in .env file
    npm start
    ```
- **Start the server in production mode:**
    ```
    #Change NODE_ENV=PROD in .env file
    npm start
    ```

## Author
This project is maintained by [Gia Huy Dao](https://www.facebook.com/ghuy.1011). For any questions or feedback, feel free to reach out via email at [daogiahuysu@gmail.com](mailto:daogiahuysu@gmail.com).
