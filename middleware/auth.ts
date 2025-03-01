import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  
  // Check if user is authenticated
  const isAuthenticated = await authStore.checkAuth();
  
  // If route requires admin role, check if user is admin
  if (to.meta.requiresAdmin && (!isAuthenticated || !authStore.isAdmin)) {
    return navigateTo('/login');
  }
  
  // Specifically protect the admin page
  if (to.path === '/admin' && (!isAuthenticated || !authStore.isAdmin)) {
    return navigateTo('/dashboard');
  }
  
  // If route requires authentication and user is not authenticated, redirect to login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return navigateTo('/login');
  }
  
  // If user is authenticated and trying to access login/register pages, redirect to dashboard
  if (isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/dashboard');
  }
}); 