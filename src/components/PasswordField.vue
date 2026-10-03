<template>
  <span class="wrap">
    <input
      :value="modelValue"
      :type="visible ? 'text' : 'password'"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :required="required"
      :minlength="minlength || undefined"
      @input="emit('update:modelValue', $event.target.value)"
    />
    <button
      type="button"
      class="eye"
      :aria-label="visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
      :aria-pressed="visible"
      @click="visible = !visible"
    >
      <svg v-if="visible" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M3 3l18 18M10.5 10.7A3 3 0 0 0 12 15a3 3 0 0 0 2.3-.9M9.9 5.2A10.8 10.8 0 0 1 12 5c5.5 0 9.5 4.2 11 7-0.6 1.1-1.5 2.3-2.6 3.4M6.1 6.3C4.2 7.6 2.8 9.3 1 12c1.5 2.8 5.5 7 11 7 1.6 0 3.1-.3 4.4-.9"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linejoin="round"
        />
        <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8" />
      </svg>
    </button>
  </span>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: 'current-password' },
  required: { type: Boolean, default: false },
  minlength: { type: [String, Number], default: undefined },
})

const emit = defineEmits(['update:modelValue'])
const visible = ref(false)
</script>

<style scoped>
.wrap {
  position: relative;
  display: block;
  width: 100%;
}

.wrap input {
  width: 100%;
  height: 48px;
  padding: 0 2.75rem 0 0.95rem;
  border: 1px solid #e4e0d8;
  border-radius: 10px;
  background: #fff;
  font-family: inherit;
  font-size: 16px;
  color: #101828;
  outline: none;
}

.wrap input:focus {
  border-color: #f95c19;
  box-shadow: 0 0 0 3px rgba(249, 92, 25, 0.14);
}

.eye {
  position: absolute;
  top: 50%;
  right: 0.35rem;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  background: none;
  color: #475467;
  cursor: pointer;
}

.eye:hover {
  color: #101828;
}

.eye svg {
  width: 20px;
  height: 20px;
}
</style>
