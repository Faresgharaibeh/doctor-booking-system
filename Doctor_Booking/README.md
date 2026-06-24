# Doctor Booking API

Laravel 12 Backend for Doctor Booking System.

Base URL:
http://127.0.0.1:8000/api

---

## Public Endpoints

GET /health  
GET /specialties  
GET /doctors  
GET /doctors/{id}/availability?date=YYYY-MM-DD  

---

## Auth

POST /auth/register  
POST /auth/login  
GET /auth/me (Protected)  
POST /auth/logout (Protected)

---

## Appointments (Protected)

POST /appointments  
GET /appointments  
PATCH /appointments/{id}/status  
DELETE /appointments/{id}

---

## Authentication

All protected endpoints require:

Authorization: Bearer {token}

---

## Status Values

pending  
confirmed
