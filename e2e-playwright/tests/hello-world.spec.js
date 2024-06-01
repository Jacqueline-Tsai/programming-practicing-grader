const { test, expect } = require('@playwright/test');

test.describe('Assignment Submission', () => {
  test('should fail the submission and check feedback', async ({ request }) => {
    const response = await request.post('http://localhost:7800/api/grader/submit/answer', {
      data: {
        user_uuid: 'user',
        answer: 'wrong answer',
      },
    });
    expect(response.status).toBe(200);
    const submission = await response.json();
    expect(submission.status).toBe('success');
    
    const statusResponse = await request.get(`http://localhost:7800/api/programming/grading/status/${submission.id}`);
    const status = await statusResponse.json();
    
    expect(status.status).toBe('processed');
    expect(status.correct).toBe(false);
    expect(status.grader_feedback).toBeDefined();
  });

  // test('should pass the submission and check notification', async ({ request }) => {
  //   const user_uuid = 'user-1';

  //   const response = await request.post('http://localhost:7800/api/grader/submit/answer', {
  //     data: { user_uuid, answer: 'correct answer' },
  //   });

  //   const submission = await response.json();
  //   expect(submission.status).toBe('success');

  //   const statusResponse = await request.get(`http://localhost:7800/api/programming/grading/status/${submission.id}`);
  //   const status = await statusResponse.json();

  //   expect(status.status).toBe('processed');
  //   expect(status.correct).toBe(true);
  //   expect(status.grader_feedback).toBeDefined();
  // });

  // test('should move to the next assignment after correct submission', async ({ request }) => {
  //   const user_uuid = 'user-1';

  //   const response = await request.post('http://localhost:7800/api/grader/submit/answer', {
  //     data: { user_uuid, answer: 'correct answer' },
  //   });

  //   const submission = await response.json();
  //   expect(submission.status).toBe('success');

  //   const statusResponse = await request.get(`http://localhost:7800/api/programming/grading/status/${submission.id}`);
  //   const status = await statusResponse.json();

  //   expect(status.status).toBe('processed');
  //   expect(status.correct).toBe(true);

  //   const nextAssignmentResponse = await request.get(`http://localhost:7800/api/programming/assignment/latest/${user_uuid}`);
  //   const nextAssignment = await nextAssignmentResponse.json();

  //   expect(nextAssignment.id).not.toBe(submission.id);
  //   expect(nextAssignment.user_uuid).toBe(user_uuid);
  // });
});