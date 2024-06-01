<script>
  import { userUuid } from "../stores/stores.js";
  import Header from "./Header.svelte";

  let answer = "";
  let submission_status = 0;
  let error_msg = "";

  const doGrading = async (event) => {
    submission_status = 1;

    const data = {
      user_uuid: $userUuid,
      answer: answer,
    };
    
    const submitStatusRes = await fetch("/api/grader/submit/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const submitStatus = await submitStatusRes.json();
    if (submitStatus.status === "failed") {
      submission_status = 3;
      error_msg = submitStatus.msg;
      return;
    }
    
    const intervalId = setInterval(async () => {
      const gradingResultRes = await fetch("/api/programming/grading/status/" + submitStatus.id.toString(), {
        method: 'GET'
      });
      const gradingResult = await gradingResultRes.json();
      if (gradingResult.status === "processed") {
        if (gradingResult.correct === true) {
          submission_status = 2;
        }
        else {
          submission_status = 3;
          error_msg = gradingResult.grader_feedback;
        }
        clearInterval(intervalId);
      }
    }, 1000);
  };

  const nextAssignment = async () => {
    const assignmentRes = await fetch("/api/programming/assignment/latest/" + $userUuid);
    const assignment = await assignmentRes.json();

    window.location = "/assignment?id=" + assignment.id.toString()
  };
</script>

<div class="codingArea">
  <Header text=" </> Code"/>
  <textarea
    class="margin-white font-mono"
    type="text"
    bind:value={answer}
  />
</div>

<div class="resultArea">
  {#if submission_status === 0}
    <Header text="Test Result:"/>
  {:else if submission_status === 1}
    <Header text="Test Result: PENDING"/>
  {:else if submission_status === 2}
    <Header text="Test Result: SUCCESS"/>
    <p> Message: OK </p>
  {:else if submission_status === 3}
    <Header text="Test Result: FAILED"/>
    <p> Message: {error_msg} </p>
  {/if}
</div>

<div class="buttonArea">
  <button
    class="text-xl font-mono"
    on:click={doGrading}
    hidden={submission_status === 2}
  >
    Submit
  </button>
  <button
    class="text-xl font-mono"
    on:click={nextAssignment}
    hidden={submission_status !== 2}
  >
    Continue
  </button>
</div>

<style>
  .codingArea {
    grid-column: 2;
    grid-row: 1 / span 2;

    background-color: #262626;
    margin: 5px;
    border-radius: 10px;
    overflow: hidden;
  }

  .resultArea {
    grid-column: 2;
    grid-row: 3;

    background-color: #262626;
    margin: 5px;
    border-radius: 10px;
    overflow: auto;
  }

  .buttonArea {
    display: flex;
    justify-content: space-between;
    align-items: stretch;

    grid-column: 2;
    grid-row: 4;

    background-color: #262626;
    margin: 5px;
    border-radius: 10px;
    overflow: hidden;
  }

  button {
    flex: 1;
    height: 100%;
    width: 50%;
    background-color: #333333;
  }

  button:hover {
    flex: 1;
    background-color: #151515;
  }

	textarea {
		width: 100%;
		height: calc(100% - 53px);
    padding: 15px;
    background-color: #262626;
	}

  p {
    padding: 15px;
  }

</style>