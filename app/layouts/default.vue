<script setup lang="ts"></script>

<template>
  <main>
    <slot />
    <ClientOnly>
      <div
        v-if="$pwa?.needRefresh"
        class="pwa-toast"
        role="alert"
        aria-labelledby="toast-message"
      >
        <div class="message">
          <span id="toast-message">
            New content available, click on reload button to update
          </span>
        </div>
        <div class="buttons">
          <button @click="$pwa.updateServiceWorker()">Reload</button>
          <button @click="$pwa.cancelPrompt()">Close</button>
        </div>
      </div>
      <div
        v-if="$pwa?.showInstallPrompt && !$pwa?.needRefresh"
        class="pwa-toast"
        role="alert"
        aria-labelledby="install-pwa"
      >
        <div class="message">
          <span id="install-pwa"> Install PWA </span>
        </div>
        <button @click="$pwa.install()">Install</button>
        <button @click="$pwa.cancelInstall()">Cancel</button>
      </div>
    </ClientOnly>
  </main>
</template>

<style>
main {
  width: 100%;
  height: 100%;
}
.pwa-toast {
  position: fixed;
  right: 0;
  bottom: 0;
  margin: 16px;
  padding: 12px;
  border: 1px solid #8885;
  border-radius: 4px;
  z-index: 1;
  text-align: left;
  box-shadow: 3px 4px 5px 0 #8885;
  background-color: white;
}
.pwa-toast .message {
  margin-bottom: 8px;
}
.pwa-toast button {
  border: 1px solid #8885;
  outline: none;
  margin-right: 5px;
  border-radius: 2px;
  padding: 3px 10px;
}
</style>
