import { sql } from "../database/database.js";

const getUserNextAssignmentId = async (user_uuid) => {
  const result = await sql`SELECT a.id 
    FROM programming_assignments a 
    LEFT JOIN (
      SELECT * from programming_assignment_submissions WHERE correct = true AND user_uuid = ${user_uuid}
    ) b
    ON a.assignment_order = b.programming_assignment_id 
    WHERE b.id IS NULL
    ORDER BY a.id ASC
    LIMIT 1;`
  ;
  return result[0].id;
};

const getAssignmentById = async (id) => {
  const result = await sql`SELECT * FROM programming_assignments where id= ${id};`;
  return result[0];
};

const getUserNextAssignment = async (user_uuid) => {
  const assignmentId = await getUserNextAssignmentId(user_uuid);
  const assignment = await getAssignmentById(assignmentId);
  return assignment;
};

const getNumFinishedAssignment = async (user_uuid) => {
  const result = await sql`SELECT programming_assignment_id 
    FROM programming_assignment_submissions 
    WHERE user_uuid=${user_uuid} AND correct=true
    ;`
  ;
  return result.length;
}

const getSubmission = async (id) => {
  const result = await sql`SELECT * 
    FROM programming_assignment_submissions
    WHERE id=${id}`
  ;
  return result[0];
}

export { getUserNextAssignment, getNumFinishedAssignment, getSubmission};
