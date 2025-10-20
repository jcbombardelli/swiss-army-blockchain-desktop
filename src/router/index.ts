import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import PublishContract from '../views/PublishContract.vue';
import Configuration from '../views/Configuration.vue';
import SignMessage from '../views/SignMessage.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/publish',
    name: 'PublishContract',
    component: PublishContract
  },
  {
    path: '/sign-message',
    name: 'SignMessage',
    component: SignMessage
  },
  {
    path: '/settings',
    name: 'Configuration',
    component: Configuration
  },
  // Redirect para home se rota não encontrada
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
