import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';

export function useAuth() {
  const router = useRouter();
  const user = ref(null);
  const userRole = ref(null);

  const logout = () => {
    localStorage.clear(); 
    sessionStorage.clear(); 
    router.replace('/');
  };

  const loadUserInfo = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        user.value = JSON.parse(userData);
        userRole.value = user.value.role;
      } catch (e) {
        console.error('Error loading user info:', e);
      }
    }
  };

  onMounted(() => {
    loadUserInfo();
  });

  return { logout, user, userRole, loadUserInfo };
}