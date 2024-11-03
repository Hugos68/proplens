import { svelteLens } from "./lenses/svelte";

// Example usage:
const svelteCode = `
<script lang="ts">
    interface Props {
        adjective: string;
        count?: number;
    }

    /** @description The main props for this component */
    let { adjective, count = 0 }: Props = $props();
</script>

<p>This component is {adjective} and has been clicked {count} times</p>
`;

const props = svelteLens(svelteCode);
console.log(props);
