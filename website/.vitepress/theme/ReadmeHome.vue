<script setup lang="ts">
import { computed } from "vue";
import { useData, withBase } from "vitepress";

const { frontmatter } = useData();
const hero = computed(() => frontmatter.value.hero ?? {});

function isExternal(link: string): boolean {
  return /^https?:\/\//.test(link);
}
</script>

<template>
  <main class="readme-home">
    <section class="readme-hero" aria-labelledby="readme-hero-title">
      <div class="readme-hero__copy">
        <p class="readme-hero__eyebrow">{{ hero.name }}</p>
        <h1 id="readme-hero-title" class="readme-hero__title">{{ hero.text }}</h1>
        <p class="readme-hero__tagline">{{ hero.tagline }}</p>
        <div class="readme-hero__actions">
          <a
            v-for="action in hero.actions"
            :key="action.link"
            class="readme-hero__button"
            :class="`readme-hero__button--${action.theme}`"
            :href="isExternal(action.link) ? action.link : withBase(action.link)"
            :target="isExternal(action.link) ? '_blank' : undefined"
            :rel="isExternal(action.link) ? 'noreferrer' : undefined"
          >
            {{ action.text }}
          </a>
        </div>
      </div>
      <div class="readme-hero__visual">
        <img class="readme-hero__terminal" :src="withBase('/terminal.svg')" :alt="hero.image?.alt" />
      </div>
    </section>
    <section class="readme-features" aria-label="Documentation sections">
      <a
        v-for="feature in frontmatter.features"
        :key="feature.link"
        class="readme-feature"
        :href="withBase(feature.link)"
      >
        <span class="readme-feature__label">{{ feature.label }}</span>
        <strong class="readme-feature__title">{{ feature.title }}</strong>
        <span class="readme-feature__details">{{ feature.details }}</span>
        <span class="readme-feature__link" aria-hidden="true">{{ frontmatter.featureAction }} →</span>
      </a>
    </section>
  </main>
</template>
