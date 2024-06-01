<script>
  export let id;
  import { onMount } from 'svelte';
  import { userUuid } from "../stores/stores.js";
  import Header from "./Header.svelte";

  let order = ""
  let title = ""
  let handout = ""
  let score = ""

  let loading = true;
  onMount(async () => {
    const assignmentRes = await fetch("/api/programming/assignment/latest/" + $userUuid);
    const assignment = await assignmentRes.json();

    if (assignment.id != id) {
      window.location = '/assignment?id=' + assignment.id.toString()
    }

    order = assignment.assignment_order
    title = order + ". " + assignment.title
    handout = assignment.handout
    loading = false

    const scoreRes = await fetch("/api/programming/scores/" + $userUuid);
    score = await scoreRes.json();
    console.log(score);
  });

</script>

<div class="grid-item scoreArea">
  <Header text={"Total Score: " + (score*100).toString()}/>
</div>

<div class="grid-item assignmentArea">
  <Header text={title}/>
  <div class="handout font-sans">
    {#if loading===false}
      <p> {handout} </p>
    {/if}
  </div>
</div>

<style>

  .scoreArea {
    grid-column: 1;
    grid-row: 1;

    background-color: #262626;
    margin: 5px;
    border-radius: 10px;
    overflow: hidden;
  }

  .assignmentArea {
    grid-column: 1;
    grid-row: 2 / span 3;

    background-color: #262626;
    margin: 5px;
    border-radius: 10px;
    overflow: hidden;
  }

  .handout {
    padding: 15px;
  }
</style>