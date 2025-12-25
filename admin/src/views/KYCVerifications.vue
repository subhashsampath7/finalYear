<template>
  <div class="flex">
    <Sidebar />
    <div class="flex-1 ml-64">
      <Header title="KYC Verifications" subtitle="Review and approve KYC submissions" />
      
      <div class="p-8">
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b">
            <h2 class="text-xl font-bold text-gray-900">Pending KYC Verifications</h2>
          </div>

          <div v-if="kycList.length === 0" class="p-12 text-center">
            <i class="fas fa-check-circle text-6xl text-green-300 mb-4"></i>
            <p class="text-gray-600">No pending KYC verifications</p>
          </div>

          <div v-else class="divide-y">
            <div v-for="kyc in kycList" :key="kyc.id" class="p-6">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-lg font-bold text-gray-900">
                    {{ kyc.first_name }} {{ kyc.last_name }}
                  </h3>
                  <p class="text-sm text-gray-600">UID: {{ kyc.uid }} | Email: {{ kyc.email }}</p>
                  <p class="text-sm text-gray-600 mt-1">
                    Document Type: <span class="font-semibold uppercase">{{ kyc.document_type }}</span>
                  </p>
                  <p class="text-sm text-gray-600">
                    Submitted: {{ formatDate(kyc.submitted_at) }}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p class="text-sm font-medium text-gray-700 mb-2">Front Image</p>
                  <img 
                    :src="`http://localhost:5000/uploads/kyc/${kyc.document_front_image}`" 
                    alt="Front"
                    class="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-75"
                    @click="openImage(`http://localhost:5000/uploads/kyc/${kyc.document_front_image}`)"
                  />
                </div>
                <div v-if="kyc.document_back_image">
                  <p class="text-sm font-medium text-gray-700 mb-2">Back Image</p>
                  <img 
                    :src="`http://localhost:5000/uploads/kyc/${kyc.document_back_image}`" 
                    alt="Back"
                    class="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-75"
                    @click="openImage(`http://localhost:5000/uploads/kyc/${kyc.document_back_image}`)"
                  />
                </div>
              </div>

              <div class="flex items-center space-x-4">
                <button
                  @click="approveKYC(kyc.id)"
                  class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <i class="fas fa-check mr-2"></i>Approve
                </button>
                <button
                  @click="showDeclineModal(kyc.id)"
                  class="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  <i class="fas fa-times mr-2"></i>Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ Image Lightbox Modal (NEW) -->
      <div 
        v-if="lightboxImage" 
        class="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
        @click="lightboxImage = null"
      >
        <button 
          @click="lightboxImage = null"
          class="absolute top-4 right-4 text-white bg-red-600 hover:bg-red-700 rounded-full w-12 h-12 flex items-center justify-center transition"
        >
          <i class="fas fa-times text-xl"></i>
        </button>
        <img 
          :src="lightboxImage" 
          alt="Preview"
          class="max-w-full max-h-screen object-contain"
          @click.stop
        />
      </div>

      <!-- Decline Modal -->
      <div v-if="declineModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Decline KYC Verification</h3>
          <textarea
            v-model="declineReason"
            placeholder="Enter reason for decline..."
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 mb-4"
          ></textarea>
          <div class="flex justify-end space-x-4">
            <button
              @click="declineModal = false"
              class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              @click="declineKYC"
              class="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Confirm Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import Header from '../components/Header.vue';
import { adminAPI } from '../services/api';

export default {
  name: 'KYCVerifications',
  components: { Sidebar, Header },
  setup() {
    const kycList = ref([]);
    const declineModal = ref(false);
    const selectedKYCId = ref(null);
    const declineReason = ref('');
    const lightboxImage = ref(null); // ✅ NEW

    const loadKYC = async () => {
      try {
        const response = await adminAPI.getPendingKYC();
        if (response.success) {
          kycList.value = response.data;
        }
      } catch (err) {
        console.error('Failed to load KYC:', err);
      }
    };

    const approveKYC = async (kycId) => {
      try {
        const response = await adminAPI.reviewKYC({
          kycId,
          status: 'approved'
        });
        if (response.success) {
          alert('KYC approved successfully!');
          loadKYC();
        }
      } catch (err) {
        alert('Failed to approve KYC');
      }
    };

    const showDeclineModal = (kycId) => {
      selectedKYCId.value = kycId;
      declineModal.value = true;
    };

    const declineKYC = async () => {
      if (!declineReason.value) {
        alert('Please enter a reason for decline');
        return;
      }

      try {
        const response = await adminAPI.reviewKYC({
          kycId: selectedKYCId.value,
          status: 'declined',
          declineReason: declineReason.value
        });
        if (response.success) {
          alert('KYC declined successfully!');
          declineModal.value = false;
          declineReason.value = '';
          loadKYC();
        }
      } catch (err) {
        alert('Failed to decline KYC');
      }
    };

    // ✅ CHANGED: Open in modal instead of new tab
    const openImage = (url) => {
      lightboxImage.value = url;
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleString();
    };

    onMounted(() => {
      loadKYC();
    });

    return {
      kycList,
      declineModal,
      declineReason,
      lightboxImage, // ✅ NEW
      approveKYC,
      showDeclineModal,
      declineKYC,
      openImage,
      formatDate
    };
  }
}
</script>
