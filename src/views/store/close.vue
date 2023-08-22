<template>
  <compo-form
      :form-params="form"
    ></compo-form>
</template>

<script setup>


const form = {
  formItems: [
    {
      label: 'TEST', prop: 'test', rules: true
    }
  ]
}
</script>

<style scoped>

</style>
