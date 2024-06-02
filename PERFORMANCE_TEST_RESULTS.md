## Test: measuring the performance of loading the assignment page and 

- **Test File:** `load_assignment.js`
- **Date:** 2024-06-02
- **Test Configuration:**
  - Stages: 
    - 30s at 50 users
    - 1m at 100 users
    - 30s at 0 users
- **Results:**
  - **Status 200:** 100%
  - **Response Time < 500ms:** 100%
  - **Average Response Time:** 9.45ms
  - **Peak Response Time:** 480.22ms
  - **Total Requests:** 6720
  - **Requests per Second:** 55.66

## Test: measuring the performance of submitting assignments. The test results are outlined in the PERFORMANCE_TEST_RESULTS.md that is included in the assignment template.

- **Test File:** `submit_assignment.js`
- **Date:** 2024-06-02
- **Test Configuration:**
  - Stages: 
    - 30s at 50 users
    - 1m at 100 users
    - 30s at 0 users
- **Results:**
  - **Status 200:** 0%
  - **Response Time < 500ms:** 100%
  - **Average Response Time:** 547.43µs
  - **Peak Response Time:** 14.74ms
  - **Total Requests:** 6773
  - **Requests per Second:** 56.34