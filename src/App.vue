<template>
    <div class="container">
        <img src="./assets/avatar.jpg" />
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
<style lang="less">
.container{
    background-color: green;
}
</style>