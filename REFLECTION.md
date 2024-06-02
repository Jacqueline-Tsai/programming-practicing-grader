## Application Description
The application is designed to manage programming assignments for users. It provides endpoints to fetch the latest assignment for a user, retrieve the number of finished assignments, check the submission status, and submit answers to assignments. Key design decisions for the application include:

1. Service-Based Architecture: The application is divided into separate services for handling assignments and grading. This modular approach enhances maintainability and scalability.

2. Asynchronous Task Processing: Submissions are processed asynchronously to avoid blocking the main thread, ensuring the application remains responsive during heavy load.
Database Integration: The application interacts with a database to fetch assignment details, store submissions, and retrieve grading results, ensuring data persistence and consistency.

3. URL Pattern Matching: The use of URLPattern for routing requests helps in clear and organized endpoint management.

4. JSON-Based Communication: The application uses JSON for request and response payloads, ensuring lightweight and human-readable data exchange.