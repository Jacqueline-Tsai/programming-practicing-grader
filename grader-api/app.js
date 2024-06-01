import { serve } from "./deps.js";
import { grade } from "./services/gradingService.js";
import * as db from "./services/database.js";

let taskQueue = Promise.resolve();
const enqueueTask = (task) => {
  taskQueue = taskQueue.then(task).catch((error) => console.error("Task failed:", error));
};

const handleSubmitAnswer = async (request) => {
  const req = await request.json();
  const assignmentId = await db.getUserNextAssignmentId(req.user_uuid);
  
  const existSubmissionId = await db.findExistSubmission(assignmentId, req.answer);
  if (existSubmissionId !== null && existSubmissionId !== undefined) {
    return Response.json({"status": "success", "id": existSubmissionId});
  }

  if (await db.getUserPendingSubmission(req.user_uuid) === true) {
    return Response.json({"status": "failed", "msg": "You have ongoing submission. Try again later"});  
  }

  const newSubmissionId = await db.addNewSubmission(assignmentId, req.answer, req.user_uuid);

  const processRequest = async () => {
    try {
      // setTimeout(async () => {
      //   const testCode = await db.getTestCodebyId(assignmentId);
      //   const result = await grade(req.answer, testCode);
      //   const correct = result.split('\n')[result.split('\n').length-1]==='OK';
      //   await db.updateSubmission(newSubmissionId, 'processed', result, correct);
      // }, 5000);
      const testCode = await db.getTestCodebyId(assignmentId);
      const result = await grade(req.answer, testCode);
      const correct = result.split('\n')[result.split('\n').length-1]==='OK';
      await db.updateSubmission(newSubmissionId, 'processed', result, correct);
    } catch (e) {
      console.error(e)
    }
  };

  enqueueTask(() => processRequest());
  return Response.json({"status": "success", "id": newSubmissionId});
};

const urlMapping = [
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/submit/answer" }),
    fn: handleSubmitAnswer,
  }
];

const handleRequest = async (request) => {
  const mapping = urlMapping.find(
    (um) => um.method === request.method && um.pattern.test(request.url),
  );

  if (!mapping) {
    return new Response("Not found", { status: 404 });
  }

  const mappingResult = mapping.pattern.exec(request.url);
  return await mapping.fn(request, mappingResult);
};

const portConfig = { port: 7000, hostname: "0.0.0.0" };
serve(handleRequest, portConfig);