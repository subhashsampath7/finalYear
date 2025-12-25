<template>
  <div class="flex">
    <Sidebar />
    <div class="flex-1 ml-64">
      <Header title="Users Management" subtitle="Manage all registered users" />
      
      <div class="p-8">
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900">All Users</h2>
            <div class="flex items-center space-x-4">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search users..."
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">KYC Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">{{ user.uid }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    {{ user.first_name }} {{ user.middle_name }} {{ user.last_name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">{{ user.email }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">{{ user.phone || 'N/A' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      class="px-3 py-1 rounded-full text-xs font-semibold"
                      :class="getStatusColor(user.kyc_status)"
                    >
                      {{ user.kyc_status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    {{ formatDate(user.created_at) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import Header from '../components/Header.vue';
import { adminAPI } from '../services/api';

export default {
  name: 'Users',
  components: { Sidebar, Header },
  setup() {
    const users = ref([]);
    const searchQuery = ref('');

    const filteredUsers = computed(() => {
      if (!searchQuery.value) return users.value;
      const query = searchQuery.value.toLowerCase();
      return users.value.filter(user => 
        user.uid.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(query)
      );
    });

    const loadUsers = async () => {
      try {
        const response = await adminAPI.getAllUsers();
        if (response.success) {
          users.value = response.data;
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    };

    const getStatusColor = (status) => {
      const colors = {
        pending: 'bg-gray-100 text-gray-800',
        submitted: 'bg-blue-100 text-blue-800',
        verified: 'bg-green-100 text-green-800',
        declined: 'bg-red-100 text-red-800'
      };
      return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString();
    };

    onMounted(() => {
      loadUsers();
    });

    return {
      users,
      searchQuery,
      filteredUsers,
      getStatusColor,
      formatDate
    };
  }
}
</script>