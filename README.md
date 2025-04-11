# Product Catalog Frontend

This project is a product catalog application built with Angular 16, implementing a clean architecture approach. It provides a modern, responsive interface for browsing and managing product catalogs.

## Architecture

The application follows a layered architecture pattern:

- **Presentation Layer**: Contains all UI components and styles
  - Components and pages
  - Global styles and assets
  - Angular routing and navigation

- **Domain Layer**: Contains business logic and domain models
  - Models and interfaces
  - Services and use cases
  - Repositories interfaces
  - Error handling
  - Business rules and validations

- **Data Layer**: Handles data operations and implementations
  - Repository implementations
  - Data module configuration
  - API integrations

- **Base Layer**: Contains core abstractions and utilities
  - Base use case abstraction
  - Mapper utilities
  - Common interfaces

## Prerequisites

- Node.js (v18.20 or higher)
- Angular CLI v16

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Jmarce2006/MarceloMartinez.git
cd devsu-frontend
```

2. Install dependencies:
```bash
npm install
```

## Development Server

Run the development server:
```bash
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.


## Running Tests

Run unit tests:
```bash
ng test
```
