
# **SyncPay**

### Real-Time Leave & Salary Coordination System

---

## Overview

**SyncPay** is a web-based system that coordinates employee leave management with salary computation in real time.
It eliminates delays between leave approvals and payroll adjustments by using an event-driven backend and live dashboard updates.

The system is designed to demonstrate **backend architecture clarity**, **real-time communication**, and **traceable business logic**, while remaining simple to run and extend.

---

## Problem Statement

In many organizations, leave approvals and salary processing are handled asynchronously or in batches, leading to:

* Delayed salary updates
* Manual reconciliation errors
* Poor visibility for employees and managers

SyncPay addresses these issues by ensuring that leave decisions immediately trigger salary recalculation and system-wide updates.

---

## Key Capabilities

* Real-time leave approval and rejection
* Automatic salary recalculation for unpaid leave
* Live dashboard updates without page refresh
* Payroll notification via webhook simulation
* Clean separation of REST, WebSocket, and webhook responsibilities

---

## System Architecture

### Backend

* **Java Spring Boot**
* Spring Web MVC (REST APIs)
* Spring WebSocket (STOMP + SockJS)
* Spring Data JPA
* H2 in-memory database

### Frontend

* HTML, CSS, Vanilla JavaScript
* Served directly from Spring Boot
* WebSocket-enabled dashboards

### Communication Model

| Purpose                | Technology        |
| ---------------------- | ----------------- |
| Commands & queries     | REST APIs         |
| Real-time updates      | WebSockets        |
| External notifications | Webhooks (mocked) |

---

## Domain Model

### Employee

* `id`
* `name`
* `baseSalary`
* `role`

### LeaveRequest

* `id`
* `employeeId`
* `leaveDays`
* `leaveType` (PAID / UNPAID)
* `status` (PENDING / APPROVED / REJECTED)

### SalaryRecord

* `employeeId`
* `month`
* `finalSalary`
* `deductions`
* `reason`

---

## Business Rules

* Leave requests start in `PENDING` state
* Only **approved unpaid leave** affects salary
* Salary deduction formula:

  ```
  (baseSalary / 30) × leaveDays
  ```
* Salary recalculation is triggered automatically on approval
* All updates are broadcast instantly to connected dashboards

---

## Event Flow

1. Employee submits leave request via REST API
2. Leave request is broadcast to managers via WebSocket
3. Manager approves or rejects the request
4. On approval:

   * Salary is recalculated
   * Updated salary and leave status are broadcast
   * Payroll webhook is triggered
5. Employees and managers see updates instantly

---

## API Endpoints

| Method | Endpoint               | Description          |
| ------ | ---------------------- | -------------------- |
| POST   | `/leave/apply`         | Submit leave request |
| POST   | `/leave/approve/{id}`  | Approve leave        |
| POST   | `/leave/reject/{id}`   | Reject leave         |
| GET    | `/salary/{employeeId}` | Fetch salary details |
| POST   | `/webhook/payroll`     | Mock payroll webhook |

---

## WebSockets

### Endpoint

```
/ws
```

### Topics

```
/topic/leave-status-update
/topic/salary-updated
```

WebSockets are used exclusively for **push-based updates**, ensuring low-latency UI synchronization without polling.

---

## Webhooks

A mock payroll webhook is implemented internally.

* Triggered after salary recalculation
* Receives employee ID, leave details, and salary changes
* Logs payload for audit and traceability
* Simulates external payroll integration without third-party services

---

## Running Locally (VS Code)

### Prerequisites

* Java 17+
* Maven
* VS Code

---

### Setup & Run

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd syncpay
   ```

2. Open in VS Code

   ```bash
   code .
   ```

3. Build the project

   ```bash
   mvn clean install
   ```

4. Start the application

   ```bash
   mvn spring-boot:run
   ```

5. Open dashboards in browser

   * Employee Dashboard

     ```
     http://localhost:8080/employee.html
     ```
   * Manager Dashboard

     ```
     http://localhost:8080/manager.html
     ```

---

## H2 Console (Optional)

```
http://localhost:8080/h2-console
```

JDBC URL:

```
jdbc:h2:mem:testdb
```

---

## Project Structure

```
com.syncpay
 ├── config        # WebSocket configuration
 ├── controller    # REST and webhook controllers
 ├── service       # Business logic
 ├── repository    # Data access
 └── model         # Domain entities
```

Frontend:

```
src/main/resources/static
 ├── employee.html
 ├── manager.html
 └── app.js
```

---

## Design Considerations

* WebSockets chosen over polling for real-time consistency
* Event-driven services for traceability
* In-memory database for easy local execution
* No external infrastructure dependencies

---

## Scope & Extensions

This project can be extended to:

* Persistent databases (PostgreSQL / MySQL)
* Authentication and role-based access
* Audit logging
* Cloud deployment

---

## Author

Developed as a backend systems project focused on **real-time coordination**, **clean architecture**, and **production-ready design principles**.

---

