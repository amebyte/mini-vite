<template>
    <div>
        {{title}}
    </div>
</template>
<script>
import { ref } from 'vue'
export default {
    setup () {
        const title = ref('hello, coboy ~')
        return { title }
    }
}
</script>