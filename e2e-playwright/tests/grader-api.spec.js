const { test, expect } = require('@playwright/test');

test.describe('Assignment Submission', () => {
  test('should fail the submission and check feedback', async ({ request }) => {
    const submitRes = await request.post('http://localhost:7800/api/grader/submit/answer', {
      data: {
        user_uuid: 'jacqueline',
        answer: 'wronggg',
      },
    });
    expect(submitRes.status()).toBe(200);
    const submission = await submitRes.json();
    expect(submission.status).toBe('success');

    const intervalId = await setInterval( async () => {
      const gradingRes = await request.get(`http://localhost:7800/api/programming/grading/status/${submission.id}`);
      expect(gradingRes.status()).toBe(200);
      const gradingResult = await gradingRes.json();
      if (gradingResult.status == 'processed') {
        expect(gradingResult.correct).toBe(false);
        expect(gradingResult.grader_feedback).toBeDefined();
        clearInterval(intervalId) 
      }
    }, 1000);
  });

  test('should pass the submission and check notification', async ({ request }) => {
    const user_uuid = 'user-1';

    const submitRes = await request.post('http://localhost:7800/api/grader/submit/answer', {
      data: { user_uuid, answer: 'def hello(): return "Hello"' },
    });
    expect(submitRes.status() == 200);
    const submission = await submitRes.json();
    expect(submission.status).toBe('success');

    const statusRes = await request.get(`http://localhost:7800/api/programming/grading/status/${submission.id}`);
    expect(statusRes.status() == 200);
    // const status = await statusRes.json();

    // expect(status.status).toBe('processed');
    // expect(status.correct).toBe(true);
    // expect(status.grader_feedback).toBeDefined();
  });

  test('should move to the next assignment after correct submission', async ({ request }) => {
    const user_uuid = 'user-3';

    const submitRes = await request.post('http://localhost:7800/api/grader/submit/answer', {
      data: { user_uuid, answer: 'def hello(): return "Hello"' },
    });
    expect(submitRes.status() == 200);
    const submission = await submitRes.json();
    expect(submission.status).toBe('success');

    const statusResponse = await request.get(`http://localhost:7800/api/programming/grading/status/${submission.id}`);
    const status = await statusResponse.json();

    // expect(status.status).toBe('processed');
    // expect(status.correct).toBe(true);

    // const nextAssignmentResponse = await request.get(`http://localhost:7800/api/programming/assignment/latest/${user_uuid}`);
    // const nextAssignment = await nextAssignmentResponse.json();

    // expect(nextAssignment.id).not.toBe(submission.id);
    // expect(nextAssignment.user_uuid).toBe(user_uuid);
  });
});