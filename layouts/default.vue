<template>
  <div class="relative min-h-screen">
    <AuroraBackground />
    <SkipLink />
    <AppHeader />
    <main id="main" class="mx-auto w-full max-w-content px-4 py-10 md:px-8">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
