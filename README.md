# Legal-Sheba

Legal-Sheba is a a digital legal services platform intended to streamline access to legal resources, automate routine legal document generation, and expose APIs for integrating legal workflows into other systems.

## Project Vision
Provide a unified platform for:
- Automated generation of legal documents
- Case or matter management 
- User self-service legal workflows
- Integration points for external systems (e.g. CRM, e-signature, identity verification)

## Features
- [ ] User authentication & role-based access control
- [ ] Document template engine
- [ ] Audit logging
- [ ] REST API


## Tech Stack
Backend:
- Language: Java
- Build Tool: Maven 
- Framework: Spring Boot 
- Data Layer: SQLite 

Frontend:
- Framework: React 
- Package Manager: npm 
- UI Library: Tailwind


## Getting Started

### Prerequisites
Install:
- Java 17+
- Maven 
- Node.js 
- Git

### Clone
```bash
git clone https://github.com/sssamira/Legal-Sheba.git
cd Legal-Sheba
```

### Backend Setup
From the backend folder:
```bash
cd legalsheba-backend
./mvnw clean install
./mvnw spring-boot:run    
```

### Frontend Setup (Placeholder)
```bash
cd legalsheba-frontend
# After initializing the project structure:
npm install
npm run dev
```


## Configuration

Environment variables (add to root `.env` or service-specific):


## Running the Stack

### Local (Backend Only)
```bash
cd legalsheba-backend
./mvnw spring-boot:run
```

### Full Stack (Future)
- backend
- frontend
- database
