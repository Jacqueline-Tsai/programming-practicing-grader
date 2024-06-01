import * as programmingAssignmentService from "./services/programmingAssignmentService.js";
import { serve } from "./deps.js";

const handleGetUserNextAssignment = async (request, urlPatternResult) => {
  const user_uuid = urlPatternResult.pathname.groups.user_uuid
  return Response.json(await programmingAssignmentService.getUserNextAssignment(user_uuid));
};

const handleGetNumFinishedAssignment = async (request, urlPatternResult) => {
  const user_uuid = urlPatternResult.pathname.groups.user_uuid
  return Response.json(await programmingAssignmentService.getNumFinishedAssignment(user_uuid));
};

const handleGetSubmitStatus = async (request, urlPatternResult) => {
  const id = urlPatternResult.pathname.groups.id;
  const submission = await programmingAssignmentService.getSubmission(id);
  if (submission.status === "pending") {
    return Response.json({"status": "pending"});
  }
  return Response.json((({ status, correct, grader_feedback }) => ({ status, correct, grader_feedback }))(submission));
};

const urlMapping = [
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/assignment/latest/:user_uuid" }),
    fn: handleGetUserNextAssignment,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/scores/:user_uuid" }),
    fn: handleGetNumFinishedAssignment,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/grading/status/:id" }),
    fn: handleGetSubmitStatus,
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

const portConfig = { port: 7777, hostname: "0.0.0.0" };
serve(handleRequest, portConfig);
