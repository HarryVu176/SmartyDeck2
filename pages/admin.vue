<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div class="flex items-center space-x-4">
          <NuxtLink 
            to="/dashboard" 
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Dashboard
          </NuxtLink>
          <button 
            @click="logout" 
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
    
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Admin Tabs -->
        <div class="px-4 sm:px-0 mb-6">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                v-for="tab in tabs"
                :key="tab.name"
                @click="currentTab = tab.id"
                :class="[
                  currentTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                ]"
              >
                {{ tab.name }}
              </button>
            </nav>
          </div>
        </div>
        
        <!-- Invite Codes Tab -->
        <div v-if="currentTab === 'invite-codes'" class="px-4 py-6 sm:px-0 mb-6">
          <div class="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 class="text-2xl font-bold mb-4">Invite Code Management</h2>
            
            <!-- Generate Invite Codes -->
            <div class="mb-8">
              <h3 class="text-lg font-medium mb-4">Generate New Invite Codes</h3>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label for="invite-count" class="block text-sm font-medium text-gray-700">Number of codes</label>
                  <input
                    type="number"
                    id="invite-count"
                    v-model="inviteCount"
                    min="1"
                    max="100"
                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  />
                </div>
                <div>
                  <label for="custom-code" class="block text-sm font-medium text-gray-700">Custom code (optional)</label>
                  <input
                    type="text"
                    id="custom-code"
                    v-model="customCode"
                    placeholder="Leave blank for random"
                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  />
                </div>
                <div class="flex flex-col">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Expiration</label>
                  <div class="flex items-center">
                    <div class="flex items-center mr-4">
                      <input
                        type="radio"
                        id="expires-yes"
                        v-model="hasExpiration"
                        :value="true"
                        class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                      <label for="expires-yes" class="ml-2 block text-sm text-gray-700">Expires in</label>
                    </div>
                    <div class="flex items-center">
                      <input
                        type="radio"
                        id="expires-no"
                        v-model="hasExpiration"
                        :value="false"
                        class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                      <label for="expires-no" class="ml-2 block text-sm text-gray-700">Never expires</label>
                    </div>
                  </div>
                </div>
                <div v-if="hasExpiration">
                  <label for="expires-in" class="block text-sm font-medium text-gray-700">Days until expiration</label>
                  <input
                    type="number"
                    id="expires-in"
                    v-model="expiresInDays"
                    min="1"
                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  />
                </div>
                <div class="flex flex-col">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Usage limit</label>
                  <div class="flex items-center">
                    <div class="flex items-center mr-4">
                      <input
                        type="radio"
                        id="limited-uses"
                        v-model="hasUsageLimit"
                        :value="true"
                        class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                      <label for="limited-uses" class="ml-2 block text-sm text-gray-700">Limited uses</label>
                    </div>
                    <div class="flex items-center">
                      <input
                        type="radio"
                        id="unlimited-uses"
                        v-model="hasUsageLimit"
                        :value="false"
                        class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                      <label for="unlimited-uses" class="ml-2 block text-sm text-gray-700">Unlimited uses</label>
                    </div>
                  </div>
                </div>
                <div v-if="hasUsageLimit">
                  <label for="max-uses" class="block text-sm font-medium text-gray-700">Maximum uses per code</label>
                  <input
                    type="number"
                    id="max-uses"
                    v-model="maxUses"
                    min="1"
                    max="1000"
                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  />
                </div>
                <button
                  @click="generateInviteCodes"
                  :disabled="generatingCodes"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {{ generatingCodes ? 'Generating...' : 'Generate' }}
                </button>
              </div>
            </div>
            
            <!-- Display generated invite codes -->
            <div v-if="generatedCodes.length > 0" class="mb-8">
              <h3 class="text-lg font-medium mb-2">Generated Invite Codes</h3>
              <div class="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                <ul class="divide-y divide-gray-200">
                  <li v-for="(code, index) in generatedCodes" :key="index" class="px-6 py-4 flex items-center justify-between">
                    <div>
                      <div class="text-sm font-medium text-indigo-600">{{ code.code }}</div>
                      <div class="text-sm text-gray-500">
                        Expires: {{ new Date(code.expiresAt).toLocaleString() }}
                      </div>
                      <div class="text-sm text-gray-500">
                        Max uses: {{ code.maxUses === 1 ? 'One-time use' : code.maxUses + ' uses' }}
                      </div>
                    </div>
                    <button
                      @click="copyToClipboard(code.code)"
                      class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Copy
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            
            <!-- Manage Existing Invite Codes -->
            <div>
              <h3 class="text-lg font-medium mb-4">Manage Existing Invite Codes</h3>
              <div class="flex justify-between mb-4">
                <div class="relative flex items-center">
                  <input
                    type="text"
                    v-model="inviteCodeSearch"
                    placeholder="Search codes..."
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <button
                  @click="fetchInviteCodes"
                  class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Refresh
                </button>
              </div>
              
              <div v-if="loadingInviteCodes" class="text-center py-4">
                <p>Loading invite codes...</p>
              </div>
              
              <div v-else-if="existingInviteCodes.length === 0" class="text-center py-4 bg-gray-50 rounded-md">
                <p class="text-gray-500">No invite codes found</p>
              </div>
              
              <div v-else class="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th scope="col" class="relative px-6 py-3">
                        <span class="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="code in filteredInviteCodes" :key="code._id">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{{ code.code }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span :class="getStatusClass(code)">
                          {{ getStatusText(code) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ code.usageCount }} / {{ code.maxUses === 0 ? 'Unlimited' : code.maxUses }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ code.expiresAt ? new Date(code.expiresAt).toLocaleString() : 'Never' }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ new Date(code.createdAt).toLocaleString() }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          v-if="!isExpired(code) && !code.isUsed"
                          @click="deactivateInviteCode(code._id)"
                          class="text-red-600 hover:text-red-900 mr-2"
                        >
                          Deactivate
                        </button>
                        <button
                          @click="viewInviteCodeUsers(code._id)"
                          class="text-indigo-600 hover:text-indigo-900"
                        >
                          View Users
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Users Tab -->
        <div v-if="currentTab === 'users'" class="px-4 py-6 sm:px-0 mb-6">
          <div class="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 class="text-2xl font-bold mb-4">User Management</h2>
            
            <div class="flex justify-between mb-4">
              <div class="relative flex items-center">
                <input
                  type="text"
                  v-model="userSearch"
                  placeholder="Search users..."
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <button
                @click="fetchUsers"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Refresh
              </button>
            </div>
            
            <div v-if="loadingUsers" class="text-center py-4">
              <p>Loading users...</p>
            </div>
            
            <div v-else-if="users.length === 0" class="text-center py-4 bg-gray-50 rounded-md">
              <p class="text-gray-500">No users found</p>
            </div>
            
            <div v-else class="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th scope="col" class="relative px-6 py-3">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="user in filteredUsers" :key="user._id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ user.username }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span :class="user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span :class="isUserExpired(user) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                        {{ isUserExpired(user) ? 'Expired' : 'Active' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ user.expiresAt ? new Date(user.expiresAt).toLocaleString() : 'Never' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ new Date(user.createdAt).toLocaleString() }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex space-x-2 justify-end">
                        <button
                          @click="openUserModal(user)"
                          class="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          v-if="user.role !== 'admin'"
                          @click="toggleUserStatus(user._id, isUserExpired(user))"
                          class="text-red-600 hover:text-red-900"
                        >
                          {{ isUserExpired(user) ? 'Activate' : 'Deactivate' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <!-- User Edit Modal -->
    <div v-if="showUserModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showUserModal = false"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Edit User: {{ selectedUser?.username }}
                </h3>
                <div class="mt-4 space-y-4">
                  <div>
                    <label for="user-email" class="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      id="user-email"
                      v-model="selectedUser.email"
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label for="user-role" class="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      id="user-role"
                      v-model="selectedUser.role"
                      class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label for="user-expires" class="block text-sm font-medium text-gray-700">Expiration Date</label>
                    <input
                      type="datetime-local"
                      id="user-expires"
                      v-model="userExpirationDate"
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label for="user-password" class="block text-sm font-medium text-gray-700">New Password (leave blank to keep current)</label>
                    <input
                      type="password"
                      id="user-password"
                      v-model="newPassword"
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              @click="updateUser"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Save Changes
            </button>
            <button 
              type="button" 
              @click="showUserModal = false"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Invite Code Users Modal -->
    <div v-if="showCodeUsersModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showCodeUsersModal = false"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Users for Invite Code: {{ selectedInviteCode?.code }}
                </h3>
                <div class="mt-4">
                  <div v-if="loadingCodeUsers" class="text-center py-4">
                    <p>Loading users...</p>
                  </div>
                  
                  <div v-else-if="codeUsers.length === 0" class="text-center py-4 bg-gray-50 rounded-md">
                    <p class="text-gray-500">No users have used this code</p>
                  </div>
                  
                  <div v-else class="mt-2">
                    <ul class="divide-y divide-gray-200">
                      <li v-for="user in codeUsers" :key="user._id" class="py-3">
                        <div class="flex items-center justify-between">
                          <div>
                            <p class="text-sm font-medium text-gray-900">{{ user.username }}</p>
                            <p class="text-sm text-gray-500">{{ user.email }}</p>
                          </div>
                          <div class="text-sm text-gray-500">
                            {{ new Date(user.createdAt).toLocaleString() }}
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              @click="showCodeUsersModal = false"
              class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

// Check if user is authenticated and is admin
onMounted(async () => {
  if (!(await authStore.checkAuth())) {
    router.push('/login');
    return;
  }
  
  if (!authStore.isAdmin) {
    router.push('/dashboard');
    return;
  }
  
  // Load initial data
  fetchInviteCodes();
  fetchUsers();
});

// Tabs
const tabs = [
  { id: 'invite-codes', name: 'Invite Codes' },
  { id: 'users', name: 'Users' }
];
const currentTab = ref('invite-codes');

// Invite Code Generation
const inviteCount = ref(5);
const expiresInDays = ref(7);
const maxUses = ref(1);
const generatingCodes = ref(false);
const generatedCodes = ref([]);
const customCode = ref('');
const hasExpiration = ref(true);
const hasUsageLimit = ref(true);

// Invite Code Management
const existingInviteCodes = ref([]);
const loadingInviteCodes = ref(false);
const inviteCodeSearch = ref('');

// User Management
const users = ref([]);
const loadingUsers = ref(false);
const userSearch = ref('');

// User Edit Modal
const showUserModal = ref(false);
const selectedUser = ref({});
const userExpirationDate = ref('');
const newPassword = ref('');

// Invite Code Users Modal
const showCodeUsersModal = ref(false);
const selectedInviteCode = ref(null);
const codeUsers = ref([]);
const loadingCodeUsers = ref(false);

// Logout function
const logout = () => {
  authStore.logout();
  router.push('/login');
};

// Generate invite codes
const generateInviteCodes = async () => {
  generatingCodes.value = true;
  
  try {
    // Validate custom code if provided
    if (customCode.value && inviteCount.value > 1) {
      alert('Custom code can only be used when generating a single invite code');
      generatingCodes.value = false;
      return;
    }
    
    const response = await fetch('/api/admin/invite-codes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        count: inviteCount.value,
        expiresInDays: hasExpiration.value ? expiresInDays.value : null,
        maxUses: hasUsageLimit.value ? maxUses.value : 0,
        customCode: customCode.value || undefined
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to generate invite codes');
    }
    
    generatedCodes.value = data.inviteCodes;
    customCode.value = ''; // Reset custom code field
    
    // Refresh the list of invite codes
    fetchInviteCodes();
  } catch (error) {
    console.error('Error generating invite codes:', error);
    alert(error.message);
  } finally {
    generatingCodes.value = false;
  }
};

// Copy to clipboard
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      alert('Invite code copied to clipboard!');
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
    });
};

// Fetch existing invite codes
const fetchInviteCodes = async () => {
  loadingInviteCodes.value = true;
  
  try {
    const response = await fetch('/api/admin/invite-codes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch invite codes');
    }
    
    existingInviteCodes.value = data.inviteCodes;
  } catch (error) {
    console.error('Error fetching invite codes:', error);
    alert(error.message);
  } finally {
    loadingInviteCodes.value = false;
  }
};

// Fetch users
const fetchUsers = async () => {
  loadingUsers.value = true;
  
  try {
    const response = await fetch('/api/admin/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch users');
    }
    
    users.value = data.users;
  } catch (error) {
    console.error('Error fetching users:', error);
    alert(error.message);
  } finally {
    loadingUsers.value = false;
  }
};

// Filter invite codes based on search
const filteredInviteCodes = computed(() => {
  if (!inviteCodeSearch.value) return existingInviteCodes.value;
  
  const search = inviteCodeSearch.value.toLowerCase();
  return existingInviteCodes.value.filter(code => 
    code.code.toLowerCase().includes(search)
  );
});

// Filter users based on search
const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value;
  
  const search = userSearch.value.toLowerCase();
  return users.value.filter(user => 
    user.username.toLowerCase().includes(search) || 
    user.email.toLowerCase().includes(search)
  );
});

// Check if invite code is expired
const isExpired = (code) => {
  return new Date(code.expiresAt) < new Date();
};

// Check if user is expired
const isUserExpired = (user) => {
  return user.expiresAt && new Date(user.expiresAt) < new Date();
};

// Get status class for invite code
const getStatusClass = (code) => {
  if (code.isUsed) return 'bg-gray-100 text-gray-800';
  if (code.expiresAt && isExpired(code)) return 'bg-red-100 text-red-800';
  return 'bg-green-100 text-green-800';
};

// Get status text for invite code
const getStatusText = (code) => {
  if (code.isUsed) return 'Used';
  if (code.expiresAt && isExpired(code)) return 'Expired';
  return 'Active';
};

// Deactivate invite code
const deactivateInviteCode = async (codeId) => {
  if (!confirm('Are you sure you want to deactivate this invite code?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/admin/invite-codes/${codeId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        isUsed: true
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to deactivate invite code');
    }
    
    // Refresh the list of invite codes
    fetchInviteCodes();
  } catch (error) {
    console.error('Error deactivating invite code:', error);
    alert(error.message);
  }
};

// View users who used an invite code
const viewInviteCodeUsers = async (codeId) => {
  loadingCodeUsers.value = true;
  showCodeUsersModal.value = true;
  
  try {
    // First get the invite code details
    const codeResponse = await fetch(`/api/admin/invite-codes/${codeId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    
    const codeData = await codeResponse.json();
    
    if (!codeResponse.ok) {
      throw new Error(codeData.message || 'Failed to fetch invite code');
    }
    
    selectedInviteCode.value = codeData.inviteCode;
    
    // Then get the users who used this code
    const usersResponse = await fetch(`/api/admin/invite-codes/${codeId}/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    
    const usersData = await usersResponse.json();
    
    if (!usersResponse.ok) {
      throw new Error(usersData.message || 'Failed to fetch users for invite code');
    }
    
    codeUsers.value = usersData.users;
  } catch (error) {
    console.error('Error fetching invite code users:', error);
    alert(error.message);
    showCodeUsersModal.value = false;
  } finally {
    loadingCodeUsers.value = false;
  }
};

// Open user edit modal
const openUserModal = (user) => {
  selectedUser.value = { ...user };
  
  // Format date for datetime-local input
  if (user.expiresAt) {
    const date = new Date(user.expiresAt);
    userExpirationDate.value = date.toISOString().slice(0, 16);
  } else {
    userExpirationDate.value = '';
  }
  
  newPassword.value = '';
  showUserModal.value = true;
};

// Update user
const updateUser = async () => {
  try {
    const userData = {
      email: selectedUser.value.email,
      role: selectedUser.value.role,
      expiresAt: userExpirationDate.value ? new Date(userExpirationDate.value).toISOString() : null
    };
    
    if (newPassword.value) {
      userData.password = newPassword.value;
    }
    
    const response = await fetch(`/api/admin/users/${selectedUser.value._id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user');
    }
    
    // Refresh the list of users
    fetchUsers();
    showUserModal.value = false;
  } catch (error) {
    console.error('Error updating user:', error);
    alert(error.message);
  }
};

// Toggle user status (activate/deactivate)
const toggleUserStatus = async (userId, isExpired) => {
  const action = isExpired ? 'activate' : 'deactivate';
  
  if (!confirm(`Are you sure you want to ${action} this user?`)) {
    return;
  }
  
  try {
    const userData = {
      expiresAt: isExpired ? null : new Date().toISOString() // Set to null to activate, set to now to deactivate
    };
    
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Failed to ${action} user`);
    }
    
    // Refresh the list of users
    fetchUsers();
  } catch (error) {
    console.error(`Error ${action}ing user:`, error);
    alert(error.message);
  }
};
</script>