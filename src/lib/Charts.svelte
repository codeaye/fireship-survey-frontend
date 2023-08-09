<script lang="ts">
  import {
    download_csv,
    parse_csv_generals,
    parse_csv_numerics,
  } from "./utils";

  import { Bar } from "svelte-chartjs";
  import {
    Chart,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
  } from "chart.js";

  Chart.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale
  );
</script>

{#await download_csv()}
  <p>...waiting</p>
{:then csv}
  <Bar data={parse_csv_numerics(csv[1])} width={100} height={50} />
  {#each parse_csv_generals(csv[0]) as data}
    <Bar {data} width={50} height={25} />
  {/each}
{:catch err}
  <p>{err}</p>
{/await}
