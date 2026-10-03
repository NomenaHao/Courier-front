<template>
  <div v-if="open" class="backdrop" @click.self="close">
    <div class="dialog" role="dialog" aria-labelledby="edit-user-title">
      <h3 id="edit-user-title" class="dialog-title">Modifier l'utilisateur</h3>
      <p v-if="dialogError" class="dialog-error">{{ dialogError }}</p>

      <form class="form" @submit.prevent="submit">
        <label class="field">
          <span>Nom d'utilisateur</span>
          <input v-model="form.username" type="text" required autocomplete="off" />
        </label>
        <label class="field">
          <span>Téléphone</span>
          <input v-model="form.phone" type="text" autocomplete="off" />
        </label>
        <label class="field">
          <span>Email</span>
          <input v-model="form.email" type="email" autocomplete="off" />
        </label>
        <label v-if="showRole" class="field">
          <span>Rôle</span>
          <select v-model="form.role" required>
            <option value="client">client</option>
            <option value="livreur">livreur</option>
            <option value="admin">admin</option>
          </select>
        </label>
        <label class="field">
          <span>Nouveau mot de passe (optionnel)</span>
          <PasswordField
            v-model="form.password"
            autocomplete="new-password"
            minlength="6"
            placeholder="Min. 6 caractères"
          />
        </label>

        <div class="actions">
          <button type="button" class="btn ghost" @click="close">Annuler</button>
          <button type="submit" class="btn" :disabled="saving">
            {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { authService } from '@/services/ordersservices'
import PasswordField from '@/components/PasswordField.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  user: { type: Object, default: null },
  showRole: { type: Boolean, default: true },
  fixedRole: { type: String, default: '' },
})

const emit = defineEmits(['close', 'saved'])

const saving = ref(false)
const dialogError = ref('')

const form = reactive({
  username: '',
  phone: '',
  email: '',
  role: 'client',
  password: '',
})

watch(
  () => [props.open, props.user],
  () => {
    dialogError.value = ''
    form.password = ''
    if (!props.user) return
    form.username = props.user.username ?? ''
    form.phone = props.user.phone ?? ''
    form.email = props.user.email ?? ''
    form.role = props.fixedRole || props.user.role || 'client'
  },
  { immediate: true },
)

const close = () => emit('close')

const submit = async () => {
  if (!props.user?.id) return
  saving.value = true
  dialogError.value = ''
  const payload = {
    username: form.username.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
  }
  if (props.showRole && !props.fixedRole) {
    payload.role = form.role
  } else if (props.fixedRole) {
    payload.role = props.fixedRole
  }
  if (form.password.trim()) {
    payload.password = form.password
  }
  try {
    const res = await authService.updateUser(props.user.id, payload)
    emit('saved', res.data)
    emit('close')
  } catch (err) {
    const data = err.response?.data
    if (data?.username?.[0]) dialogError.value = data.username[0]
    else if (data?.detail?.[0]) dialogError.value = data.detail[0]
    else if (typeof data?.password === 'object') dialogError.value = data.password[0]
    else dialogError.value = 'Mise à jour impossible.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(16, 24, 40, 0.45);
}

.dialog {
  width: min(420px, 100%);
  background: #fff;
  border: 1px solid #e4e0d8;
  border-radius: 12px;
  padding: 1.25rem 1.35rem;
  box-shadow: 0 12px 40px rgba(16, 24, 40, 0.12);
}

.dialog-title {
  margin: 0 0 1rem;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.15rem;
}

.dialog-error {
  margin: 0 0 0.75rem;
  padding: 0.55rem 0.7rem;
  font-size: 0.88rem;
  color: #b42318;
  background: #fef3f2;
  border-radius: 8px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.field span {
  display: block;
  font-size: 0.78rem;
  font-weight: 650;
  color: #475467;
  margin-bottom: 0.3rem;
}

.field input,
.field select {
  width: 100%;
  height: 42px;
  padding: 0 0.85rem;
  border: 1px solid #e4e0d8;
  border-radius: 8px;
  font-family: inherit;
  font-size: 16px;
  background: #fff;
}

.field input:focus,
.field select:focus {
  outline: none;
  border-color: #f95c19;
  box-shadow: 0 0 0 3px rgba(249, 92, 25, 0.14);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.35rem;
}

.btn {
  height: 40px;
  padding: 0 1rem;
  border: none;
  border-radius: 8px;
  background: #f95c19;
  color: #fff;
  font-family: inherit;
  font-weight: 650;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn.ghost {
  background: #faf8f5;
  color: #101828;
  border: 1px solid #e4e0d8;
}
</style>
