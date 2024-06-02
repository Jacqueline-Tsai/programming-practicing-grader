import { postgres } from "../deps.js";
const sql = postgres({});

const getUserNextAssignmentId = async (user_uuid) => {
    const result = await sql`SELECT a.id 
      FROM programming_assignments a 
      LEFT JOIN (
        SELECT * from programming_assignment_submissions WHERE correct = TRUE AND user_uuid = ${user_uuid}
      ) b
      ON a.assignment_order = b.programming_assignment_id 
      WHERE b.id IS NULL
      ORDER BY a.id ASC
      LIMIT 1;`
    ;
    return result[0].id;
};

const getTestCodebyId = async (id) => {
    const result = await sql`SELECT test_code FROM programming_assignments where id= ${id};`;
    return result[0].test_code;
};

const addNewSubmission = async (assignmentId, code, user_uuid) => {
    const result = await sql`
        INSERT INTO programming_assignment_submissions (programming_assignment_id, code, user_uuid) 
        VALUES (${assignmentId}, ${code}, ${user_uuid})
        RETURNING id;
    `;
    return result[0].id;
}

const updateSubmission = async (id, _status, grader_feedback, correct) => {
    function formatDate(date) {
        let datePart = [
          date.getFullYear(),
          date.getMonth() + 1,
          date.getDate()
        ].map((n, i) => n.toString().padStart(i === 0 ? 4 : 2, "0")).join("-");
        let timePart = [
          date.getHours(),
          date.getMinutes(),
          date.getSeconds()
        ].map((n, i) => n.toString().padStart(2, "0")).join(":");
        return datePart + " " + timePart;
    }
      
    let date = new Date();
    let dateStr = formatDate(date);

    await sql`UPDATE programming_assignment_submissions 
      SET status=${_status}, grader_feedback=${grader_feedback}, correct=${correct}, last_updated=${dateStr}
      WHERE id=${id};`
    ;
}

const getUserPendingSubmission = async (user_uuid) => {
    const result = await sql`SELECT EXISTS(
        SELECT *
        FROM programming_assignment_submissions
        WHERE user_uuid=${user_uuid} AND status='pending'
      );`
    ;
    return result[0].exists;
}

const test = async () => {
    const result = await sql`
      SELECT *
      FROM programming_assignment_submissions
      ;`
    ;
    return result;
}

const findExistSubmission = async (assignmentId, code) => { 
    const result = await sql`SELECT id 
      FROM programming_assignment_submissions
      WHERE programming_assignment_id=${assignmentId} AND code=${code}
      ;`
    ;
    if (result.length > 0){
      return result[0].id;
    }
};

export {test, getUserNextAssignmentId, getTestCodebyId, addNewSubmission, updateSubmission, getUserPendingSubmission, findExistSubmission};