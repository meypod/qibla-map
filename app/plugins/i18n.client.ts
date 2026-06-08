// Keep the document <html> lang/dir in sync with the active locale so that
// RTL languages (fa, ar, ur) render correctly and the page reports its language.
export default defineNuxtPlugin(() => {
  const { locale, dir } = useI18n();

  watchEffect(() => {
    document.documentElement.lang = locale.value;
    document.documentElement.dir = dir.value;
  });
});
