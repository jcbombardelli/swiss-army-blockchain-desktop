<!-- src/components/ServiceNotification.vue -->
<template>
  <Transition name="notification">
    <div v-if="showNotification" class="service-notification" :class="`notification-${serviceType}`">
      <div class="notification-content">
        <span class="notification-icon">{{ getServiceIcon(serviceType) }}</span>
        <div class="notification-text">
          <div class="notification-title">{{ getServiceTitle(serviceType) }}</div>
          <div class="notification-message">{{ getServiceMessage(serviceType) }}</div>
        </div>
        <button @click="hideNotification" class="close-btn">×</button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { serviceType } from '../stores/wallet';

const showNotification = ref(false);

// Mostrar notificação quando o tipo de serviço mudar
watch(serviceType, (newType) => {
  if (newType !== 'none') {
    showNotification.value = true;
    // Auto-ocultar após 5 segundos
    setTimeout(() => {
      showNotification.value = false;
    }, 5000);
  }
});

// Mostrar notificação ao montar se já tiver tipo detectado
onMounted(() => {
  if (serviceType.value !== 'none') {
    showNotification.value = true;
    setTimeout(() => {
      showNotification.value = false;
    }, 5000);
  }
});

const hideNotification = () => {
  showNotification.value = false;
};

const getServiceIcon = (type: string) => {
  switch (type) {
    case 'tauri': return '🚀';
    case 'webusb': return '🌐';
    case 'none': return '❌';
    default: return '🔍';
  }
};

const getServiceTitle = (type: string) => {
  switch (type) {
    case 'tauri': return 'Aplicação Nativa';
    case 'webusb': return 'Modo Browser';
    case 'none': return 'USB não suportado';
    default: return 'Detectando...';
  }
};

const getServiceMessage = (type: string) => {
  switch (type) {
    case 'tauri':
      return 'Acesso completo aos dispositivos USB via Tauri';
    case 'webusb':
      return 'Acesso limitado via Web USB API. Funciona apenas com HTTPS.';
    case 'none':
      return 'Hardware wallets não podem ser usados neste ambiente';
    default:
      return 'Verificando suporte a dispositivos USB...';
  }
};
</script>

<style scoped>
.service-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.notification-tauri {
  border-left: 4px solid #4caf50;
}

.notification-webusb {
  border-left: 4px solid #2196f3;
}

.notification-none {
  border-left: 4px solid #f44336;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  gap: 0.75rem;
}

.notification-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.notification-text {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 0.25rem;
}

.notification-message {
  font-size: 0.8rem;
  color: #666;
  line-height: 1.4;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.close-btn:hover {
  color: #666;
}

/* Transições */
.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Responsividade */
@media (max-width: 480px) {
  .service-notification {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>
