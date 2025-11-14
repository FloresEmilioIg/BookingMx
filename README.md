
# BookingMx Reservation and City Graph Demo

## 1. General Project Description
BookingMx is a monolithic web application structured into a Java/Spring Boot backend for data persistence and a vanilla JavaScript/HTML/CSS frontend for the user interface.

The project offers two key functionalities:
1. Reservations Module (CRUD): Allows users to create, list, and cancel hotel reservations. This module interacts directly with the backend REST API, which currently uses an in-memory repository for data storage.
2. City Graph Visualization: A utility module that models connections and distances between cities in the Jalisco region (Guadalajara, Zapopan, etc.). It allows users to query and display nearby cities based on a maximum distance filter.

## 2. Installation and Setup
Prerequisites
- Java Development Kit (JDK) 17+
- Apache Maven 3+
- Node.js (LTS recommended) and npm
### 2.1 Backend Setup
Navigate to the backend directory:
```bash
cd backend
```

Build and package the Spring Boot application:
```bash
mvn clean install
```

Run the application:
```bash
mvn spring-boot:run
```

The backend will start on http://localhost:8080.

### 2.2 Frontend Setup
Navigate to the frontend directory:
```bash
cd frontend
```

Install the required Node.js dependencies (Jest for testing, http-server for serving the app):
```bash
npm install
```

Start the local web server:
```bash
npm run serve
```

The frontend will be accessible at http://localhost:5173.


## 3. Description and Execution of Tests
Unit tests are implemented using Jest for the JavaScript frontend, focusing on the core logic of the graph.js module.

### 3.1 Running Frontend Unit Tests
Navigate to the frontend directory:
```bash
cd frontend
```

Execute the test script defined in package.json:
```bash
npm test
```

Example Test Execution Output:
```
> bookingmx-frontend@1.0.0 test
> jest --coverage

PASS  test/graph.test.js (8.324 s)
Graph Class
... (omitted)
Graph Utility Functions
validateGraphData
√ should return ok for valid data
... (omitted)
getNearbyCities
√ should filter results by a custom max distance (e.g., 60km)

----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files | 100     | 100      | 100     | 100     |
graph.js | 100     | 100      | 100     | 100     |
----------|---------|----------|---------|---------|-------------------

Test Suites: 1 passed, 1 total
Tests:       26 passed, 26 total
Snapshots:   0 total
Time:        8.324 s
```

### 3.2 Running Backend Unit Tests (Java)
Navigate to the backend directory:
```bash
cd backend
```

Execute the Maven test command:
```bash
mvn test
```

This command will execute any JUnit tests located in backend/src/test/java.


## 4. Code Documentation
All major classes, methods, and functions in both the backend and frontend have been documented using industry-standard formats (Javadoc for Java and JsDoc for JavaScript) to ensure clarity and maintainability.

## 5. System Architecture and Interaction Diagrams
The following diagrams illustrate the overall structure of the BookingMx application and the data flow of the core City Graph feature, using Mermaid syntax.

1. Component Diagram:

   This diagram shows the major system components and how they communicate. The system uses a standard client-server architecture.
```   
graph LR
   subgraph Frontend (Client Side)
   A[index.html/UI] --> B(app.js - Controller Logic)
   B --> C(js/api.js - HTTP Client)
   B --> D(js/graph.js - Utility Logic)
   end

   subgraph Backend (Server Side - Spring Boot)
   E[ReservationController] --> F(ReservationService)
   F --> G(ReservationRepository - In-Memory DB)
   end

   C -- HTTP/JSON (CRUD) --> E
   E -- HTTP/JSON Response --> C
```

2. City Graph Interaction Flowchart

This flowchart details the data processing steps when the user submits a query to find nearby cities.
```
   flowchart TD
   A[User Submits Search Form] --> B{Form Validation: Destination & Distance};
   B -- Invalid Input --> C[Display Input Error to User];
   B -- Valid Input --> D(app.js: Call getNearbyCities(Graph, Dest, MaxDist));
   D --> E{graph.js: Check if Graph Instance & Destination are Valid};
   E -- Invalid --> F[Return Empty Results []];
   E -- Valid --> G(graph.js: Get All Neighbors);
   G --> H{Filter Neighbors by Distance <= MaxDist};
   H --> I(Sort Results by Distance Ascending);
   I --> J[Return Filtered & Sorted List];
   J --> K[app.js: Clear Old Results];
   K --> L[app.js: Render New List Items];
   L --> M[Display Nearby Cities to User];
```