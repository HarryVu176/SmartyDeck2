import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip auth check on server side
  if (typeof window === 'undefined') return;

  const authStore = useAuthStore();
  
  // Check auth state before any logic
  const isAuthenticated = await authStore.checkAuth();

  // Always allow access to index page
  if (to.path === '/') return;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/dashboard');
  }

  // Handle admin routes
  if (to.meta.requiresAdmin && (!isAuthenticated || !authStore.isAdmin)) {
    return navigateTo(isAuthenticated ? '/dashboard' : '/login');
  }

  // Handle protected non-admin routes
  if (to.meta.requiresAuth && !isAuthenticated) {
    return navigateTo('/login');
  }
});
