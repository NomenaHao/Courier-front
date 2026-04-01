import { useRouter } from 'vue-router';

export function useAuth() {
  const router = useRouter();

  const logout = () => {
    //  Nettoyage complet
    localStorage.clear(); 
    sessionStorage.clear(); 
    
   router.replace('/');
    
  };

  return { logout };
}