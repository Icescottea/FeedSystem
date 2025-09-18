# FeedV4 – Feed Management System  

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)

## 📖 About  

**FeedV4** is a full-featured feed formulation and management system built with Spring Boot and React.  
It streamlines feed formulation, inventory tracking, production scheduling, and financial management — all in one platform.  

## ✨ Key Features  

### Feed Formulation Engine  
- Profile-based formulation generation  
- Cost optimization  
- Nutrient constraint solving  
- Manual formulation builder  
- PDF/Excel exports  

### Inventory Management  
- Raw material tracking  
- WACM (Weighted Average Cost Method)  
- Low stock alerts  
- Expiry tracking  
- Bulk upload support  

### Production Management  
- Pelleting queue management  
- Batch tracking  
- Yield monitoring  
- Operator assignments  

### Financial Management  
- Configurable fee structures  
- Invoice generation  
- Payment tracking  
- Financial reports  
- Receivables monitoring  

## 🛠️ Technology Stack  

### Backend  
- **Language:** Java 21  
- **Framework:** Spring Boot  
- **Database:** MySQL/PostgreSQL  
- **ORM:** JPA/Hibernate  
- **PDF Generation:** iText  

### Frontend  
- **Framework:** React  
- **Styling:** Tailwind CSS  
- **Charts:** Chart.js  
- **Excel Handling:** XLSX  

### Development & Operations Tools  
- **Build Tool (Java):** Maven  
- **Version Control:** Git & GitHub  
- **Docker Support:** For containerized deployments  

## 🚀 Getting Started  

Follow these steps to set up the project locally for development and testing.

### Prerequisites  
- Java 21  
- Node.js 16+  
- MySQL or PostgreSQL  

### Backend Setup  

1. **Clone Repository**  
    ```bash
    git clone https://your-repository-url/feedv4.git
    cd feedv4
    ```

2. **Build with Maven**  
    ```bash
    ./mvnw clean package
    ```

3. **Run the Application**  
    ```bash
    java -jar target/feedv4-0.0.1-SNAPSHOT.jar
    ```

### Frontend Setup  

1. **Navigate to Frontend Directory**  
    ```bash
    cd feedv4-frontend
    ```

2. **Install Dependencies**  
    ```bash
    npm install
    ```

3. **Start Development Server**  
    ```bash
    npm start
    ```

### Environment Variables  

**Backend – Create `application.properties`:**  
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/feedv4
spring.datasource.username=your_username
spring.datasource.password=your_password
```

**Frontend – `Create .env:`:**

REACT_APP_API_BASE_URL=http://localhost:8080

## Docker Support

Build and run with Docker

### Build image
```docker build -t feedv4 .```

### Run container
```docker run -p 8080:8080 feedv4```

## 📋 System Workflow

User Login: Operators and managers authenticate through the frontend.

Feed Formulation: Generate or manually build feed formulations based on nutrient constraints.

Inventory Management: Track raw materials, costs, and stock levels.

Production Management: Manage pelleting queues, batches, and yields.

Financial Tracking: Create invoices, monitor receivables, and generate reports.

Exports: Export PDF or Excel reports for compliance and record-keeping.

## 🔐 Security Features

Role-based access control built into the backend.

Passwords securely stored (BCrypt).

Input validation and sanitization to prevent SQL injection and XSS.

HTTPS-ready with environment-based configuration.

## 📊 Data Visualization

Performance metrics, cost breakdowns, and production insights are visualized in real-time using Chart.js on the frontend.

## 👥 Default User Roles

Operator: Handles batch production and inventory updates.

Manager: Oversees feed formulation, production scheduling, and financials.

Admin: Full access to all system modules and configuration settings.

## 📝 License

This project is proprietary software. All rights reserved.



